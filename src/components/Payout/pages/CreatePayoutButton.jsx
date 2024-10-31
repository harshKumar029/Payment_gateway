// CreatePayoutButton.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useUserAuth } from '../../../context/UserAuthContext';
import { db } from '../../../firebase';
import { addDoc, arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import { Buffer } from 'buffer';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CreateContactHeader from './CreateContactHeader';
import ProgressBar from './Progress';


import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import CryptoJS from 'crypto-js';



const CreatePayoutButton = () => {
  const location = useLocation();
  const { contactId, fundAccountDetails } = location.state;
  // console.log("local state data of fund acc", fundAccountDetails);

  const [payoutMode, setPayoutMode] = useState('');

  const [accountType, setAccountType] = useState(fundAccountDetails.account_type);

  const [selectedPurpose, setSelectedPurpose] = useState('refund');
  const [customPurpose, setCustomPurpose] = useState('');


  const [amount, setAmount] = useState('');
  const [selectedTransferType, setSelectedTransferType] = useState('IMPS');

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isError, setIsError] = useState(false);


  const { user } = useUserAuth();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [progress, setProgress] = useState(48);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usersdata, setusersdata] = useState('')
  const [verify, setverify] = useState(false)

  const encryptBalance = (balance) => {
    return CryptoJS.AES.encrypt(balance.toString(), import.meta.env.VITE_APP_secretKey).toString();
  };

  const decryptBalance = (encryptedBalance) => {
    const bytes = CryptoJS.AES.decrypt(encryptedBalance, import.meta.env.VITE_APP_secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };
  // Encrypting and decrypting payload
  const encryptjsonData = (data) => {
    try {
      const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), import.meta.env.VITE_APP_secretKey).toString();
      return encryptedData;
    } catch (error) {
      // console.error("Encryption error:", error);
      return null;
    }
  };
  useEffect(() => {
    if (user.uid) {
      const fetchBalance = async () => {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBalance(docSnap.data().Balance);
          setBalanceLoading(false);
          setusersdata(docSnap.data());
          // console.log("User Data: ", docSnap.data());
          // console.log("loading: ", balanceLoading)
        } else {
          // console.log("No such document!");
          setBalanceLoading(false);
        }
      };

      fetchBalance();
    }
    // Focus the amount input field when the component mounts
    // amountInputRef.current.focus();
  }, [user]);

  useEffect(() => {
    setProgress(72);
  }, [])


  useEffect(() => {
    // Update selectedTransferType whenever amount changes
    if (fundAccountDetails.account_type !== 'vpa') {
      setSelectedTransferType(amount > 500000 ? 'RTGS' : 'IMPS');
    } else {
      setSelectedTransferType('UPI');
    }
  }, [amount > 500000]);

  // closing the popup message box after 3 sec
  if (showPopup) {
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  }

  const purposes = [
    'refund',
    'cashback',
    'payout',
    'salary',
    'utility bill',
    'vendor bill',
    'Vendor Advance',
    // 'Custom', // Additional option for custom input
  ];

  const transferTypes = ['NEFT', 'IMPS'];

  const handlePurposeChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedPurpose(selectedValue);

    // If "Custom" is selected, clear the custom purpose input
    if (selectedValue !== 'Custom') {
      setCustomPurpose('');
    }
  };

  const handleCustomPurposeChange = (e) => {
    setCustomPurpose(e.target.value);
  };

  const handleTransferTypeChange = (e) => {
    setSelectedTransferType(e.target.value);
  };
  const updateBalance = async (newBalance) => {
    const docRef = doc(db, "Users", user.uid);

    try {
      await updateDoc(docRef, {
        Balance: newBalance,
      });

      // console.log("Balance updated successfully!");
    } catch (error) {
      // console.error("Error updating balance:", error.message);
    }
  };
  const updatePayoutids = async (response) => {

    const userTransactionDocRef = doc(db, 'UserTransactionDetails', user.uid);
    const transactionDocSnap = await getDoc(userTransactionDocRef);
    let payoutData = {};
    if (accountType === "bank_account") {
      payoutData = {
        id: response.data.id,
        amount: response.data.amount,
        created_at: response.data.created_at,
        currency: response.data.currency,
        entity: response.data.entity,
        bank_account: {
          accountNumber: response.data.fund_account.bank_account.account_number,
          bankName: response.data.fund_account.bank_account.bank_name,
          ifsc: response.data.fund_account.bank_account.ifsc,
          name: response.data.fund_account.bank_account.name,
        },
        fundAccountId: response.data.fund_account_id,
        mode: response.data.mode,
        purpose: response.data.purpose,
        status: response.data.status,
        utr: response.data.utr,
      }
    } else {
      payoutData = {
        id: response.data.id,
        amount: response.data.amount,
        created_at: response.data.created_at,
        currency: response.data.currency,
        entity: response.data.entity,
        vpa: {
          address: response.data.fund_account.vpa.address,
          username: response.data.fund_account.vpa.username,
        },
        fundAccountId: response.data.fund_account_id,
        mode: response.data.mode,
        purpose: response.data.purpose,
        status: response.data.status,
        utr: response.data.utr,
      }

    }

    if (transactionDocSnap.exists()) {
      await updateDoc(userTransactionDocRef, {
        payoutId: arrayUnion(payoutData),
      });
    } else {
      await setDoc(userTransactionDocRef, {
        payoutId: [payoutData],
      });
    }
  };

  const navigate = useNavigate();

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) {
      return setError("User not logged in!");
    }
    if (!otp || !result) return; // Add a check for result being null
    setIsSubmitting(true);
    try {
      await result.confirm(otp); // Use the result to confirm the OTP
      await handleSubmit(e);

      setTimeout(() => {
        navigate('/'); // Assuming '/' is your home 
        setIsSubmitting(false);
      }, 2000); // 3 seconds delay
      return (true);
    } catch (err) {
      if (err.code === "auth/argument-error") {
        setPopupMessage("You can try again if you didnt recieved the otp");
      }
      else if (err.code === "auth/invalid-verification-code") {
        setPopupMessage("Wrong OTP. Please write the correct one...");
      }
      else if (err.code === "auth/id-token-expired	") {
        setPopupMessage("Otp expired...")
      }
      else if (err.code === "auth/insufficient-permission") {
        setPopupMessage("You dont have enough permission")
      }
      else if (err.code === "auth/code-expired") {
        setPopupMessage("Code expired. Pls try again later")
      }
      else if (err.code === "auth/invalid-phone-number") {
        setPopupMessage("!incorrect Phone Number ")
      } else if (err.code === "auth/too-many-requests") {
        setPopupMessage("too-many-requests try after sometime ")
      }
      else if (err.message === "reCAPTCHA has already been rendered in this element") {
        setPopupMessage("Reload the page and try again.")
      }
      else {
        setPopupMessage(err.message)
      }
      setShowPopup(true);
      setIsError(true);
      setIsSubmitting(false);
      // console.log("error catch ", err.message)
      return (false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // const verifyd = await verifyOtp(e);
    // if (verifyd === false) {
    //   // alert('Please enter a valid OTP');
    //   setIsSubmitting(false);
    //   return
    // }

    const payoutPurpose = selectedPurpose;


    let payload = {};
    if (accountType === "bank_account") {

      payload = {
        amount: amount * 100,
        mode: selectedTransferType,
        payoutPurpose: payoutPurpose,
        useraccountname: fundAccountDetails.name,
        userifscCode: fundAccountDetails.ifsc,
        userbeneficiaryaccountNumber: fundAccountDetails.account_number,
        accountType: accountType,
      };
    }
    else {

      payload = {
        amount: amount * 100,
        mode: selectedTransferType,
        payoutPurpose: payoutPurpose,
        vpaaddress: fundAccountDetails.vpa.address,
        name: fundAccountDetails.vpa.username,
        accountType: accountType,
      }
    }


    try {

      const response = await axios.post('https://razorserver.onrender.com/api/payouts', { payload: encryptjsonData(payload) }, {
        headers: {
          'Authorization': `${user.accessToken}`
        }
      });

      // Handle the response from the backend as needed
      // console.log('Response from backend:', response.data);

      const convertedamount = parseFloat(amount)
      const newBalance = parseFloat(decryptBalance(balance)) - convertedamount;
      const protectedbalance = encryptBalance(newBalance)
      await updateBalance(protectedbalance);
      await updatePayoutids(response)

      // Handle success
      setShowPopup(true);
      setPopupMessage('Payout generated successfully!');
      setIsError(false);
      setProgress(100);
      // Redirect after a short delay

      // console.log("Payout Generated Successfully: ", response.data);
      return response.data;
      // }
    } catch (err) {
      // console.log("Error in generating payout ", err.message);
      // Handle error
      setShowPopup(true);
      setPopupMessage('Failed to generate payout.');
      setIsError(true);
      setIsSubmitting(false);
      return null;
    }
  };




  const [error, setError] = useState("");
  const [flag, setFlag] = useState(false);
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState(null);
  const { setUpRecaptha } = useUserAuth();


  const getOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("this is nget otp")

    const parsedAmount = Number(amount);
    const parsedBalance = Number(decryptBalance(balance));
    const isBalanceSufficient = parsedAmount <= parsedBalance;
    if (parseFloat(amount) === 0) {
      return
    }

    if (!isBalanceSufficient && parsedAmount === 0) {
      setPopupMessage("Insufficient Balance!");
      // console.log("user balance in get otp", balance, amount);
      setShowPopup(true);
      setIsSubmitting(false);
      setIsError(true);
      return
    }

    setError("");
    if (!user) {
      return setPopupMessage("User not logged in!");
    }
    const phoneNumber = usersdata.contactNumber;

    try {
      if (phoneNumber && isBalanceSufficient) {
        console.log("Sending OTP to phone number:", phoneNumber, typeof (phoneNumber));

        const response = await setUpRecaptha(phoneNumber);
        setResult(response); // Store the response for later verification
        setFlag(true);
        setProgress(92)
        setIsSubmitting(false);
        // console.log("testing flag and all in otpverifyer", flag, result)
      }
    } catch (err) {
      if (err.code === "auth/argument-error") {
        setPopupMessage("You can try again if you didnt recieved the otp");
      }
      else if (err.code === "auth/invalid-verification-code") {
        setPopupMessage("Wrong OTP. Please write the correct one...");
      }
      else if (err.code === "auth/id-token-expired	") {
        setPopupMessage("Otp expired...")
      }
      else if (err.code === "auth/insufficient-permission") {
        setPopupMessage("You dont have enough permission")
      }
      else if (err.code === "auth/code-expired") {
        setPopupMessage("Code expired. Pls try again later")
      }
      else if (err.code === "auth/invalid-phone-number") {
        setPopupMessage("!incorrect Phone Number ")
      } else if (err.code === "auth/too-many-requests") {
        setPopupMessage("too-many-requests try after sometime ")
      }
      else if (err.message === "reCAPTCHA has already been rendered in this element") {
        setPopupMessage("Reload the page and try again.")
      }
      else {
        setPopupMessage(err.message)
      }
      setIsSubmitting(false);
      setShowPopup(true);
      setIsError(true);
    }
  };


  // const verifyOtp = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   if (!user) {
  //     return setError("User not logged in!");
  //   }
  //   if (!otp || !result) return; // Add a check for result being null
  //   try {
  //     const datares = await result.confirm(otp); // Use the result to confirm the OTP
  //     await handleSubmit(e);
  //     console.log("otp verified",datares)
  //     return (true);
  //   } catch (err) {
  //     if (err.code === "auth/argument-error") {
  //       setPopupMessage("You can try again if you didnt recieved the otp");
  //     }
  //     else if (err.code === "auth/invalid-verification-code") {
  //       setPopupMessage("Wrong OTP. Please write the correct one...");
  //     }
  //     else if (err.code === "auth/id-token-expired	") {
  //       setPopupMessage("Otp expired...")
  //     }
  //     else if (err.code === "auth/insufficient-permission") {
  //       setPopupMessage("You dont have enough permission")
  //     }
  //     else if (err.code === "auth/code-expired") {
  //       setPopupMessage("Code expired. Pls try again later")
  //     }
  //     else if (err.code === "auth/invalid-phone-number") {
  //       setPopupMessage("!incorrect Phone Number ")
  //     } else if (err.code === "auth/too-many-requests") {
  //       setPopupMessage("too-many-requests try after sometime ")
  //     }
  //     else if (err.message === "reCAPTCHA has already been rendered in this element") {
  //       setPopupMessage("Reload the page and try again.")
  //     }
  //     else {
  //       setPopupMessage(err.message)
  //     }
  //     setShowPopup(true);
  //     setIsError(true);
  //     // console.log("error catch ", err.message)
  //     return (false);
  //   }
  // };

  // code for input value of otp
  const [codes, setCodes] = useState(["", "", "", "", "", ""]);



  const inputRefs = useRef([]);

  const handleChange = (index, value, isBackspace) => {
    setCodes(prevCodes => {
      const newCodes = [...prevCodes];
      newCodes[index] = value;

      if (isBackspace && index > 0 && !value) {
        // If backspace is pressed and the current input is empty,
        // move focus to the previous input
        inputRefs.current[index - 1].focus();
      } else if (!isBackspace && index < newCodes.length - 1 && value) {
        // If a key is pressed (not backspace) and the current input is not empty,
        // move focus to the next input
        inputRefs.current[index + 1].focus();
      }

      return newCodes;
    });
    // setOtp( parseInt(codes.join(""), 10));
    setOtp(parseInt([...codes.slice(0, index), value, ...codes.slice(index + 1)].join(''), 10));
  };
  // console.log("ewcewvcew evde evewwc", otp, codes)


  const [resend, setresend] = useState(false)
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (resend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [resend]);

  useEffect(() => {
    if (timer === 0) {
      setresend(false);
      setTimer(30); // Reset the timer
    }
  }, [timer]);


  const handleButtonClick = () => {
    navigate('/payouts/CreateFundAccountForm'
      , {
        state: {
          contactId: contactId,
          fundAccountDetails: fundAccountDetails
        }
      }
    );
  };

  const isAmountGreaterThanBalance = Number(amount) > balance;

  return (
    <div className='bg-[#1B1E21] h-screen'>
      <CreateContactHeader />
      {!flag ?
        <>
          <ProgressBar progress={progress} />
          <div className=" text-white flex items-center justify-center pt-20">
            <div className="max-w-2xl w-full">
              <div className="bg-[#] p-8 rounded-lg  space-y-6">
                <h1 className="flex">
                  <div className=" mr-1 font-bold text-[#83FF81] text-opacity-70 text-[25px]">Create</div>
                  <div className=" text-gray-400 text-[25px]">Payout</div>
                </h1>
                {!balanceLoading && (
                  <div className=" rounded-lg flex ">
                    <p className=" mb-2 font-semibold text-[18px] self-end mr-3">Current Balance:</p>
                    <p className="text-lg font-bold text-[#83ff817f] ">₹ {!balanceLoading ? Number(decryptBalance(balance)).toLocaleString('en-IN') : 'Loading...'}</p>
                  </div>
                )}
                {parseFloat(amount) > decryptBalance(balance) &&
                  <h3 className=' m-0 text-sm text-[#ff2020] font-[100]'>Alert !insufficient balance</h3>
                }

                <form onSubmit={getOtp} className="space-y-4">
                  <div>
                    <label htmlFor="paymentAmount" className="block text-sm font-medium mb-2">
                      Payment Amount:
                    </label>
                    <input
                      type="text"
                      value={amount}
                      // onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        const numericAmount = parseInt(numericValue, 10);
                        // Use ternary operator to set the amount based on the condition
                        const newAmount = fundAccountDetails.account_type === 'vpa' && numericAmount > 100000 ?
                          '100000'
                          : numericValue;
                        setAmount(newAmount);
                      }}
                      className="w-full bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-white"
                      placeholder="Enter amount"
                      required
                      max={fundAccountDetails.account_type === 'vpa' ? '100000' : ''}
                    />
                  </div>

                  <div>
                    <label htmlFor="payoutPurpose" className="block text-sm font-medium mb-2 text-white">
                      Payout Purpose:
                    </label>
                    <select
                      id="payoutPurpose"
                      value={selectedPurpose}
                      onChange={handlePurposeChange}
                      className="w-full bg-transparent border-b-2 border-gray-500 text-white p-2 focus:outline-none focus:border-white appearance-none"
                      required
                    >
                      {purposes.map((purpose, index) => (
                        <option key={index} value={purpose} className="bg-[#25282E] text-white">
                          {purpose}
                        </option>
                      ))}
                    </select>
                  </div>



                  <div>
                    <label htmlFor="transferType" className="block text-sm font-medium mb-2">
                      Transfer Type:
                    </label>
                    <select
                      id="transferType"
                      value={selectedTransferType}
                      onChange={(e) => setSelectedTransferType(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-white"
                    >

                      {fundAccountDetails.account_type === 'vpa' ? (
                        // If fundAccountDetails.account_type is 'vpa', render UPI option
                        <option value="UPI">UPI</option>
                      ) : (
                        // If fundAccountDetails.account_type is not 'vpa', render transferTypes options
                        amount > 500000 ? (
                          <option value="RTGS">RTGS</option>
                        ) : (
                          transferTypes.map((type, index) => (
                            <option key={index} value={type} className="bg-[#25282E]">
                              {type}
                            </option>
                          ))
                        )
                      )}

                    </select>
                  </div>
                  <div className="flex justify-between mt-8">
                    {/* update in padd.. this button old one -- added mt-2 removed w-full*/}
                    <button
                      type="button"
                      className="bg-transparent hover:bg-gray-700 border border-gray-600 text-white py-2 px-4 rounded-md "
                      onClick={handleButtonClick}
                    >
                      Back
                    </button>
                    {/* <button
                  type="submit"
                  disabled={parseFloat(amount) > balance || balanceLoading}
                  className={` text-black py-2 px-4 rounded-md transition-colors ${parseFloat(amount) > balance || balanceLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                >
                  Pay {amount}
                </button> */}

                    {/* <div id="recaptcha-container"></div> */}
                    <button
                      type="submit"
                      disabled={parseFloat(amount) > decryptBalance(balance) || balanceLoading || parseFloat(amount) === 0 || isSubmitting}
                      className={` py-2 px-4 text-[black] font-semibold rounded-md transition-colors ${parseFloat(amount) > decryptBalance(balance) || balanceLoading || parseFloat(amount) === 0 || isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#83FF81] bg-opacity-80 hover:bg-[#83FF81] '
                        }`}
                    >
                      {isSubmitting ? (
                        <div role="status">
                          <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-black" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                          </svg>
                        </div>
                      ) : (
                        `Pay ${amount}`
                      )}

                    </button>
                  </div>
                </form>
              </div>
            </div>
            {/* Success/Error Popup */}
            {showPopup && (
              <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg ${isError ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                <p>{popupMessage}</p>
              </div>
            )}
          </div>
        </>
        :
        <>
          <ProgressBar progress={progress} />
          <div className=" bg-[##1B1E21]  flex justify-center h-[100vh]">
            <div className=" w-96 mt-32">
              <div className=" ">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <svg width="17px" height="17px" xmlns="http://www.w3.org/2000/svg" fill="#00BA00" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>

                    <p className="ml-2 text-[#6A889C] opacity-70 mr-5">To</p>
                  </div>
                  {fundAccountDetails.account_type !== 'vpa' ? (
                    <div className="flex">
                      <p className="text-[#fff]">{fundAccountDetails.name}</p>
                      <p className="text-[#fff] ml-2">{fundAccountDetails.bank_name}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[#fff]">{fundAccountDetails.vpa.address}</p>
                    </div>
                  )}

                </div>
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <svg width="17px" height="17px" xmlns="http://www.w3.org/2000/svg" fill="#00BA00" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>
                    <p className="ml-2 text-[#6A889C] opacity-70 mr-5">Amount</p>
                  </div>
                  <div className="flex">
                    <p className="text-[#fff]">{amount}</p>
                  </div>
                </div>
              </div>
              <div>
                <h1 className=" mb-5"><span className="text-[#fff] text-[25px] font-semibold">Confirm</span><span className="ml-2 text-[#6A889C] opacity-70 text-[24px] mr-5">Payout</span></h1>
                <form onSubmit={verifyOtp} className="max-w-sm mx-auto">
                  <div className="flex mb-2 space-x-2 rtl:space-x-reverse">


                    {codes.map((code, index) => (
                      <div key={index}>
                        <label htmlFor={`code-${index + 1}`} className="sr-only">{`Code ${index + 1}`}</label>
                        <input
                          type="text"
                          maxLength="1"
                          id={`code-${index + 1}`}
                          ref={input => inputRefs.current[index] = input}
                          className="block w-9 h-9 py-3 text-sm font-extrabold text-center text-white bg-[#1f2226] bg-opacity-45 border-b border-[#83FF81] "
                          value={code}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace') {
                              // Handle backspace key
                              e.preventDefault(); // Prevent the default backspace behavior
                              handleChange(index, '', true);
                            }
                          }}
                          required
                        />
                      </div>
                    ))}

                  </div>
                  <p><span className=" text-[#6A889C] opacity-70">OTP sent to </span><span className="text-[#fff] text-opacity-70 text-base">{usersdata.contactNumber}</span></p>
                  <section className=' inline-flex'>
                    <p className=" text-[#6A889C] opacity-70" >Didn't recieve Otp?</p>
                    {/* {isSubmitting && `(${timer}s)`} */}
                    <button disabled={resend}
                      className={` opacity-70 ml-1 cursor-pointer ${resend ? 'text-[red] cursor-not-allowed' : 'text-[#6A889C]'
                        }`} onClick={(e) => {
                          e.preventDefault();
                          getOtp(e);
                          setresend(true);
                        }}>
                      Resend otp
                      {resend && `in (${timer}s)`}
                    </button>
                  </section>

                  <div className="flex justify-between mt-8">
                    {/* update in padd.. this button old one -- added mt-2 removed w-full*/}
                    <button
                      type="button"
                      className="bg-transparent hover:bg-gray-700 border border-gray-600 text-white py-2 px-4 rounded-md "
                      // onClick={() => setFlag(false) }
                      onClick={() => {
                        // showPopup(false);
                        setProgress(72);
                        setFlag(false);
                      }}
                    // onClick={() => {
                    //   setFlag(false);
                    //   window.location.reload(); // Reload the page
                    // }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={parseFloat(amount) > balance || balanceLoading || isSubmitting}
                      className={`text-[black]  py-2 px-4 rounded-md transition-colors ${parseFloat(amount) > balance || balanceLoading || isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#83FF81] hover:bg-[#83FF81] bg-opacity-80 '
                        }`}
                    >
                      {isSubmitting ? (
                        <div role="status">
                          <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-black" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                          </svg>
                        </div>
                      ) : (
                        `Pay ${amount}`
                      )}
                    </button>
                    {showPopup && (
                      <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg ${isError ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                        <p>{popupMessage}</p>
                      </div>
                    )}
                  </div>
                </form>
              </div>

            </div>
          </div>
        </>}
    </div >
  );
};

export default CreatePayoutButton;