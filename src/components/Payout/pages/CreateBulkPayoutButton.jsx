// CreatePayoutButton.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useUserAuth } from '../../../context/UserAuthContext';
import { db } from '../../../firebase';
import { addDoc, arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import CreateContactHeader from './CreateContactHeader';
import ProgressBar from './Progress';
import StatusModal from './StatusModal';
import CryptoJS from 'crypto-js';

const CreateBulkPayoutButton = () => {
  const location = useLocation();
  const { payoutData } = location.state;
  const { totalAmount } = location.state;
  const { Excelpayout } = location.state;

  const [payoutMode, setPayoutMode] = useState('');


  const [selectedPurpose, setSelectedPurpose] = useState('refund');
  const [customPurpose, setCustomPurpose] = useState('');
  const amountInputRef = useRef(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [error, setError] = useState("");
  const [flag, setFlag] = useState(false);
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState(null);
  const { setUpRecaptha } = useUserAuth();

  const { user } = useUserAuth();
  const [balance, setBalance] = useState(0);
  const [bankaccountnumber, setBankaccountNumber] = useState(0)
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [progress, setProgress] = useState(72);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusShow, setStatusShow] = useState()
  const [statusMessages, setStatusMessages] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [usersdata, setusersdata] = useState([])
  const [exceedingLimit, setexceedingLimit] = useState(0)
  const navigate = useNavigate();
  const openStatusModal = () => {
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
  };
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
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  // console.log(payoutData)
  const updateStatusMessage = (message) => {
    setStatusMessages(prevStatusMessages => [...prevStatusMessages, message]);
  };

  useEffect(() => {
    if (statusShow) {
      updateStatusMessage(statusShow);
    }
  }, [statusShow]);
  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBalance(docSnap.data().Balance);
          setBankaccountNumber(docSnap.data().AccountNumber)
          setBalanceLoading(false);
          setusersdata(docSnap.data())
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

  const transferTypes = ['NEFT', 'IMPS', 'RTGS'];

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

  const createBatchIds = async (responses, failed) => {
    const userTransactionDocRef = doc(db, 'BulkPayments', user.uid);
    const transactionDocSnap = await getDoc(userTransactionDocRef);

    if (transactionDocSnap.exists()) {
      // If the document already exists, update it
      const batchId = transactionDocSnap.data().batchId || [];
      const newBatchId = `BATCH_${batchId.length + 1}`;
      await updateDoc(userTransactionDocRef, {
        batchId: arrayUnion(newBatchId),
        [newBatchId]: {
          successfulIds: arrayUnion(
            ...responses.map((response) => ({
              id: response.id,
              amount: response.amount,
              created_at: response.created_at,
              currency: response.currency,
              entity: response.entity,
              bank_account: {
                accountNumber: response.fund_account.bank_account.account_number,
                bankName: response.fund_account.bank_account.bank_name,
                ifsc: response.fund_account.bank_account.ifsc,
                name: response.fund_account.bank_account.name,
              },
              fundAccountId: response.fund_account_id,
              mode: response.mode,
              purpose: response.purpose,
              status: response.status,
              utr: response.utr,
            }))
          ),
          // failed: arrayUnion(
          //   ...failed.map((f) => ({ ...f }))
          failed: arrayUnion(
            ...failed.map((f) => ({
              ...f,
              created_at: new Date().toISOString() // Add the created_at field with the current date
            }))
          ),
        },
      });
    } else {
      // If the document doesn't exist, create it
      const newBatchId = 'BATCH_1';
      await setDoc(userTransactionDocRef, {
        batchId: [newBatchId],
        [newBatchId]: {
          successfulIds: arrayUnion(
            ...responses.map((response) => ({
              id: response.id,
              amount: response.amount,
              created_at: response.created_at,
              currency: response.currency,
              entity: response.entity,
              bank_account: {
                accountNumber: response.fund_account.bank_account.account_number,
                bankName: response.fund_account.bank_account.bank_name,
                ifsc: response.fund_account.bank_account.ifsc,
                name: response.fund_account.bank_account.name,
              },
              fundAccountId: response.fund_account_id,
              mode: response.mode,
              purpose: response.purpose,
              status: response.status,
              utr: response.utr,
            }))
          ),
          // failed: arrayUnion(
          //   ...failed.map((f) => ({ ...f }))
          failed: arrayUnion(
            ...failed.map((f) => ({
              ...f,
              created_at: new Date().toISOString() // Add the created_at field with the current date
            }))
          ),
        },
      });
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) {
      return setError("User not logged in!");
    }
    if (!otp || !result) return; // Add a check for result being null
    try {
      // console.log("otp verified", otp, result)
      await result.confirm(otp); // Use the result to confirm the OTP
      // console.log("otp verified")
      await handleSubmit(e);
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
      // console.log("error catch ", err.message)
      return (false);
    }
  };

  useEffect(() => {
    let countExceedingLimit = 0;

    payoutData.forEach((data) => {
      if (data.payoutAmount > 500000) {
        countExceedingLimit++;
      }
    });
    setexceedingLimit(countExceedingLimit);
  }, [])



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // const verifyd = await verifyOtp(e);
    // if (verifyd === false) {
    //   // alert('Please enter a valid OTP');
    //   setIsSubmitting(false);
    //   return
    // }

    openStatusModal()
    const payoutPurpose = selectedPurpose;

    // console.log('Payout Purpose:', payoutPurpose);
    // console.log('amount: ', totalAmount);
    const makeApiCallWithRetry = async (pay) => {

      const encryptedPayload = encryptjsonData(pay);
      // console.log("Encrypted payload:", encryptedPayload);
      let retries = 0;
      let retryingMessageDisplayed = false;

      while (retries < MAX_RETRIES) {
        try {
          // Make the API call to the backend
          const response = await axios.post('https://razorserver.onrender.com/api/bulkpayouts', { Payload: encryptedPayload }, {
            headers: {
              'Authorization': `${user.accessToken}`
            }
          });
          setStatusShow(
            {
              name: pay.fund_account.bank_account.name,
              accountNumber: pay.fund_account.bank_account.account_number,
              status: "processed",
              statusicon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="green" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>

            }
          );
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return response.data;
        } catch (error) {
          if (!retryingMessageDisplayed) {
            setStatusShow(
              {
                name: pay.fund_account.bank_account.name,
                accountNumber: pay.fund_account.bank_account.account_number,
                status: "retrying",
                statusicon: <div>
                  <svg aria-hidden="true" className="w-4 h-4 me-2 text-red-500 fill-red-400 animate-spin " viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              }
            )
            retryingMessageDisplayed = true;
          }
          // console.log(`Retry ${retries + 1} failed: ${error.message}`);
          retries++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
      setStatusShow(
        {
          name: pay.fund_account.bank_account.name,
          accountNumber: pay.fund_account.bank_account.account_number,
          status: "failed",
          statusicon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="red" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        }
      )
      // console.error(`Max retries reached for payload: ${JSON.stringify(pay)}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return null; // Return null in case of failure
    };

    //   const transfertype = payoutData.map(data => data.payoutModel)
    const payload = payoutData.map((data) => ({
      "amount": (data.payoutAmount * 100),
      "currency": "INR",
      "mode": data.payoutModel,
      "purpose": payoutPurpose,
      "fund_account": {
        "account_type": "bank_account",
        "bank_account": {
          "name": data.beneficiaryName,
          "ifsc": data.ifscCode,
          "account_number": data.beneficiaryaccountNumber,
        },
        "contact": {
          "name": data.beneficiaryName,
          "email": "gaurav.kumar@example.com",
          "contact": "9876543210",
          "type": "employee",
          "reference_id": "Acme Contact ID 12345",
          "notes": {
            "notes_key_1": "Tea, Earl Grey, Hot",
            "notes_key_2": "Tea, Earl Grey… decaf."
          }
        }
      },
      "queue_if_low_balance": true,
      "reference_id": "Acme Transaction ID 12345",
      "narration": "Acme Corp Fund Transfer",
      "notes": {
        "notes_key_1": "Beam me up Scotty",
        "notes_key_2": "Engage"
      }
    }))



    // console.table("final payload: ", ...payload);
    try {
      const responses = []
      const failed = []
      for (let pay of payload) {
        setStatusShow(
          {
            name: pay.fund_account.bank_account.name,
            accountNumber: pay.fund_account.bank_account.account_number,
            status: "processing",
            statusicon: <div><svg aria-hidden="true" className="w-4 h-4 me-2 text-green-700 animate-spin fill-green-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
              <span className="sr-only">Loading...</span></div>
          }
        )
        const response = await makeApiCallWithRetry(pay);
        if (response) {
          responses.push(response);
        } else {
          failed.push(pay)
          // console.error(`Failed to process payload: ${JSON.stringify(pay)}`);
        }
      }

      // const successfulAmount = responses.reduce((acc, response) => acc + parseFloat(response.amount), 0);
      const failedAmount = failed.reduce((acc, pay) => acc + parseFloat(pay.amount), 0);
      const newTotalAmount = parseFloat(totalAmount) - (parseFloat(failedAmount) / 100);
      // console.log("perfect totalamount", newTotalAmount)

      const newBalance = parseFloat(decryptBalance(balance)) - newTotalAmount;
      // console.log("perfect balance", newBalance)
      const protectedbalance = encryptBalance(newBalance)

      await updateBalance(protectedbalance);
      // console.log("bkllll", failed)

      await createBatchIds(responses, failed)


      // Handle success
      setShowPopup(true);
      setPopupMessage('Payout generated successfully!');
      setIsError(false);
      setProgress(100);
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/'); // Assuming '/' is your home route
      }, 1000); // 3 seconds delay

      // console.log("Payout Generated Successfully: ", ...responses);
      return responses.data;
      // setIsSubmitting(false);
    } catch (err) {
      // console.log("Error in generating payout ", err.message);
      // Handle error
      setShowPopup(true);
      setPopupMessage('Failed to generate payout.');
      setIsError(true);
      return null;
      // setIsSubmitting(false);
    }
  };


  const getOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    if (!user) {
      return setPopupMessage("User not logged in!");
    }
    const phoneNumber = usersdata.contactNumber;
    if (!phoneNumber) {
      return setPopupMessage("phone number is required!");
    }
    if (exceedingLimit > 0) {
      setShowPopup(true);
      setPopupMessage("For RTGS Use Normal Payout");
      setIsError(true);
      setIsSubmitting(false);
      return 
    }
    const parsedAmount = Number(totalAmount);
    const parsedBalance = Number(decryptBalance(balance));
    const isBalanceSufficient = parsedAmount <= parsedBalance;

    if (!isBalanceSufficient) {
      setPopupMessage("Insufficient Balance!");
      // console.log("user balance in get otp", parsedBalance, parsedAmount);
      setIsSubmitting(false);
      setIsError(true);
      setShowPopup(true);
    }
    try {
      if (phoneNumber && isBalanceSufficient) {
        // console.log("otp verified", phoneNumber)
        // console.log("Sending OTP to phone number:", phoneNumber, typeof (phoneNumber));
        const response = await setUpRecaptha(phoneNumber);
        // console.log("otp verified sdvdfsv", response)
        // console.log("testing flag and all in otpverifyer", flag, response)
        setResult(response); // Store the response for later verification
        setFlag(true);
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


  // closing the popup message box after 3 sec
  if (showPopup) {
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  }

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


  const handleButtonClick = () => {
    if (!Excelpayout) {
      navigate('/payouts/bulk'
        , {
          state: {
            backpayout: payoutData,
            backtotal: totalAmount,
          }
        }
      );
    } else {
      navigate('/payouts/bulk');
    }
  };

  const isAmountGreaterThanBalance = Number(totalAmount) > balance;
  // console.log("kjbvkdbsbvlndsvnnds iodnvonsdon", totalAmount, decryptBalance(balance))

  return (
    <div className='bg-[#1B1E21] h-screen'>
      <CreateContactHeader />
      {!flag ?
        <>
          <ProgressBar progress={progress} />
          <div className=" text-white flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
              <div className="bg-[#25282E] p-8 rounded-lg shadow-lg space-y-6">
                <h3 className="text-xl font-bold mb-6">Create Payout</h3>
                {/* Displaying the balance */}
                {/* {console.log("INside render: ", balanceLoading)} */}
                {!balanceLoading && (
                  <div className=" rounded-lg">
                    <p className="text-sm mb-2 font-medium">Current Balance:</p>
                    <p className="text-lg font-bold text-yellow-500 ">₹ {!balanceLoading ? decryptBalance(balance) : 'Loading...'}</p>
                  </div>
                )}
                {exceedingLimit > 0 &&
                  <h3 className=' m-0 text-sm text-[#ff2020] font-[100]'>Total {exceedingLimit} bulk payments exceeding the limit of ₹5,00,000.Please use Normal Payout for RTGS.</h3>
                }

                <form onSubmit={getOtp} className="space-y-4">
                  <div>
                    <label htmlFor="paymentAmount" className="block text-sm font-medium mb-2">
                      Payment Amount:
                    </label>
                    {totalAmount}
                  </div>

                  <div>
                    <label htmlFor="payoutPurpose" className="block text-sm font-medium mb-2 text-white">
                      Payout Purpose:
                    </label>
                    <select
                      id="payoutPurpose"
                      value={selectedPurpose}
                      onChange={handlePurposeChange}
                      className="w-full bg-transparent border-b-2 border-gray-500 text-white p-2 focus:outline-none focus:border-[white] appearance-none"
                      required
                    >
                      {purposes.map((purpose, index) => (
                        <option key={index} value={purpose} className="bg-[#25282E] text-white">
                          {purpose}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* <div id="recaptcha-container"></div> */}

                  <div className="flex justify-between mt-8">
                    {/* update in padd.. this button old one -- added mt-2 removed w-full*/}
                    <button
                      type="button"
                      className="bg-transparent hover:bg-gray-700 border border-gray-600 text-white py-2 px-4 rounded-md "
                      onClick={handleButtonClick} // Adjust the path as per your routing setup
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
                    <button
                      type="submit"
                      disabled={parseFloat(totalAmount) > decryptBalance(balance) || balanceLoading}
                      className={`text-white py-2 px-4 rounded-md transition-colors ${parseFloat(totalAmount) > decryptBalance(balance) || balanceLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#2E20D1] hover:bg-[#2E20D1]'
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
                        `Pay ${totalAmount}`
                      )}
                    </button>

                    {showStatusModal && (
                      <StatusModal statusMessages={statusMessages} onClose={closeStatusModal} />
                    )}
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
        : <>
          <ProgressBar progress={92} />
          <div className=" bg-[#1B1E21]  flex justify-center h-[100vh]">
            <div className=" w-96 mt-32">
              <div className=" ">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <svg width="17px" height="17px" xmlns="http://www.w3.org/2000/svg" fill="#00BA00" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>

                    <p className="ml-2 text-[#6A889C] opacity-70 mr-5">To</p>
                  </div>
                  <div>
                    <p className="text-[#fff]">Bulk Payment</p>
                  </div>

                </div>
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <svg width="17px" height="17px" xmlns="http://www.w3.org/2000/svg" fill="#00BA00" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>
                    <p className="ml-2 text-[#6A889C] opacity-70 mr-5">Amount</p>
                  </div>
                  <div className="flex">
                    <p className="text-[#fff]">{totalAmount}</p>
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
                          className="block w-9 h-9 py-3 text-sm font-extrabold text-center text-white bg-[#1f2226] bg-opacity-45 border-b border-[#2B85F3] "
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
                  <p className=" text-[#6A889C] opacity-70" >Didn't recieve Otp? Resend in</p>

                  <div className="flex justify-between mt-8">
                    {/* update in padd.. this button old one -- added mt-2 removed w-full*/}
                    <button
                      type="button"
                      className="bg-transparent hover:bg-gray-700 border border-gray-600 text-white py-2 px-4 rounded-md "
                      onClick={() => {
                        setFlag(false);
                        showPopup(false);
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={parseFloat(totalAmount) > balance || balanceLoading}
                      className={`text-white py-2 px-4 rounded-md transition-colors ${parseFloat(totalAmount) > balance || balanceLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#2E20D1] hover:bg-[#2E20D1]'
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
                        `Pay ${totalAmount}`
                      )}
                    </button>
                    {showPopup && (
                      <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg ${isError ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                        <p>{popupMessage}</p>
                      </div>
                    )}
                  </div>
                  {showStatusModal && (
                    <StatusModal statusMessages={statusMessages} onClose={closeStatusModal} />
                  )}
                </form>
              </div>

            </div>
          </div>
        </>}
    </div>
  );
};

export default CreateBulkPayoutButton;