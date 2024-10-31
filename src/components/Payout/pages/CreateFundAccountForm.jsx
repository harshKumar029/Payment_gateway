import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';




import { FaMobileAlt, FaUniversity } from 'react-icons/fa';
import CreateContactHeader from './CreateContactHeader';
import ProgressBar from './Progress';

const CreateFundAccountForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contactId } = location.state || {};
  const { fundAccountDetails } = location.state || {};
  // console.log("user data in location state fundaccount", fundAccountDetails, contactId)

  const [selectedPaymentOption, setSelectedPaymentOption] = useState('bank');
  const [FundAccountCreated, setFundAccountCreated] = useState(null);
  const [progress, setProgress] = useState(48);

  const [vpa, setVpa] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [confirmAccountNo, setConfirmAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiname, setupiname] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (fundAccountDetails && fundAccountDetails !== null && fundAccountDetails.account_type === "bank_account") {
      setAccountNo(fundAccountDetails.account_number || '');
      setConfirmAccountNo(fundAccountDetails.account_number || ''); // Assuming this is correct, as confirmAccountNo is set to the same value as accountNo in your original code
      setIfsc(fundAccountDetails.ifsc || '');
      setBeneficiaryName(fundAccountDetails.name || ''); // Assuming this is correct, as beneficiaryName is set to the value of the 'name' property in your original code
    }
    if (fundAccountDetails && fundAccountDetails !== null && fundAccountDetails.account_type === "vpa") {
      setVpa(fundAccountDetails.vpa.address || '');
      setupiname(fundAccountDetails.vpa.username || '')
    }
  }, [fundAccountDetails]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedPaymentOption !== 'upi'){
    // Add form validation for accountNo
    if (!/^\d{9,18}$/.test(accountNo)) {
      setShowPopup(true)
      setIsError(true);
      setPopupMessage('Account number should be between 9 to 18 digits.');
      return;
    }

    // Add form validation for ifsc
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      setShowPopup(true)
      setIsError(true);
      setPopupMessage('Invalid IFSC code format.');
      return;
    }

    // Check if the Account Number and Confirm Account Number match
    if (accountNo !== confirmAccountNo) {
      setShowPopup(true)
      setIsError(true);
      setPopupMessage("Account Number and Confirm Account Number don't match.");
      return;
    }
  } else {
    
  }

    let fundAccountNo;
    if (
      !fundAccountDetails || // Check if fundAccountDetails is null or undefined
      vpa !== fundAccountDetails.account_type ||
      accountNo !== (fundAccountDetails.bank_account ? fundAccountDetails.bank_account.account_number : null) ||
      confirmAccountNo !== (fundAccountDetails.bank_account ? fundAccountDetails.bank_account.account_number : null) ||
      ifsc !== (fundAccountDetails.bank_account ? fundAccountDetails.bank_account.ifsc : null) ||
      beneficiaryName !== (fundAccountDetails.bank_account ? fundAccountDetails.bank_account.name : null)
    ) {
      if (selectedPaymentOption === 'upi') {
        fundAccountNo = {
          account_type: "vpa",
          vpa: {
            address: vpa,
            username: upiname,
          }
        };
      } else {
        fundAccountNo = {
          account_type: "bank_account",
          account_number: confirmAccountNo,
          ifsc: ifsc,
          name: beneficiaryName,
        }
      }
    } else {
      // Use existing fundAccountDetails if all details match
      fundAccountNo = fundAccountDetails;
    }

    // Set the FundAccountCreated state with the obtained account number
    setFundAccountCreated(fundAccountNo);
    // console.log("user dtaa in console", fundAccountNo)

    // Navigate to the next page after setting FundAccountCreated
    navigate('/payouts/CreatePayoutButton', {
      state: {
        contactId: contactId,
        fundAccountDetails: fundAccountNo
      }
    });
  };
  // closing the popup message box after 3 sec
  if (showPopup) {
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  }



  const handleButtonClick = () => {navigate('/')};

  const formContainerStyle = "w-full max-w-2xl";
  return (
    <div className=' bg-[#1B1E21] h-screen'>
      <CreateContactHeader />
      <ProgressBar progress={progress} />
      <div className=" text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-[#] p-8 rounded-lg">
            <h1 className="flex mb-6">
              <div className=" mr-1 font-bold text-[#83FF81] text-opacity-70 text-[25px]">New</div>
              <div className=" text-gray-400 text-[25px]">Payout</div>
            </h1>
            {/* <h2 className="text-xl font-semibold mb-6">New Payout</h2> */}
            <div className="flex justify-start mb-6 space-x-4">
              <button
                onClick={() => setSelectedPaymentOption('upi')}
                className={`flex items-center px-4 py-2 rounded-md font-medium border-2 ${selectedPaymentOption === 'upi' ? 'bg-[#83ff81c4] border-[#83ff8163] text-black' : 'bg-[#1B1E21] border-[#83FF81] text-[white]'
                  }`}
              >
                <FaMobileAlt className="mr-2" /> UPI ID
              </button>
              <button
                onClick={() => setSelectedPaymentOption('bank')}
                className={`flex items-center px-4 py-2 rounded-md font-medium border-2 ${selectedPaymentOption === 'bank' ? 'bg-[#83ff81c4] border-[#83ff8163] text-black' : 'bg-[#1B1E21] border-[#83FF81] text-text-[white]'
                  }`}
              >
                <FaUniversity className="mr-2" /> Bank A/C
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4  w-full">
              {selectedPaymentOption === 'upi' && (
                <>
                  <div>
                    <label className="block mb-1" htmlFor="vpa">
                      Name:
                    </label>
                    <input
                      className="w-full bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-white"
                      id="vpa"
                      type="text"
                      value={upiname}
                      onChange={(e) => setupiname(e.target.value)}
                      placeholder="Enter Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1" htmlFor="vpa">
                      VPA (UPI ID):
                    </label>
                    <input
                      className="w-full bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-white"
                      id="vpa"
                      type="text"
                      value={vpa}
                      onChange={(e) => setVpa(e.target.value)}
                      placeholder="Enter UPI ID"
                      required
                    />
                  </div>

                </>
              )}

              {selectedPaymentOption === 'bank' && (
                <>
                  <div>
                    <label className="block mb-1" htmlFor="accountNo">
                      Account No.*
                    </label>
                    <input
                      className="w-full bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-[white]"
                      id="accountNo"
                      type="text"
                      value={accountNo}
                      // onChange={(e) => setAccountNo(e.target.value)}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Validate if the input contains only numbers and has a maximum length of 18
                        if (/^\d{0,18}$/.test(value)) {
                          setAccountNo(value); // Update state if validation passes
                        }
                      }}
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1" htmlFor="confirmAccountNo">
                      Confirm Account No.*
                    </label>
                    <input
                      className="w-full bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-[white]"
                      id="confirmAccountNo"
                      type="text"
                      value={confirmAccountNo}
                      // onChange={(e) => setConfirmAccountNo(e.target.value)}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Validate if the input contains only numbers and has a maximum length of 18
                        if (/^\d{0,18}$/.test(value)) {
                          setConfirmAccountNo(value); // Update state if validation passes
                        }
                      }}
                  
                      placeholder="Re-enter account number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1" htmlFor="ifsc">
                      IFSC*
                    </label>
                    <input
                      className="w-full bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-[white]"
                      id="ifsc"
                      type="text"
                      value={ifsc}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (value.length <= 11) {
                          setIfsc(value);
                        }
                      }}
                      placeholder="IFSC of the bank account"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1" htmlFor="beneficiaryName">
                      Beneficiary Name*
                    </label>
                    <input
                      className="w-full bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-[white]"
                      id="beneficiaryName"
                      type="text"
                      value={beneficiaryName}
                      // onChange={(e) => setBeneficiaryName(e.target.value)}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Validate if the input contains only characters (alphabets)
                        if (/^[A-Za-z ]*$/.test(value)) {
                          setBeneficiaryName(value); // Update state if validation passes
                        }
                      }}
                      placeholder="Beneficiary name as per bank"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex justify-between mt-8">
                {/* update in padd.. this button old one -- added mt-2*/}
                <button
                  type="button"
                  className="bg-transparent hover:bg-gray-700 border border-gray-600 text-white py-2 px-4 rounded-md mt-2"
                  onClick={handleButtonClick} // Adjust the path as per your routing setup
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-[#83FF81] hover:bg-[#83FF81] bg-opacity-80 text-[black] font-semibold py-2 px-4 rounded-md mt-2"
                >
                  {selectedPaymentOption === 'upi' ? 'Create UPI Account' : 'Create Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Success/Error Popup */}
      {showPopup && (
        <div className={`absolute top-20 z-50 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg ${isError ? 'bg-red-500' : 'bg-green-500'} text-white`}>
          <p>{popupMessage}</p>
        </div>
      )}
    </div>
  );
};



export default CreateFundAccountForm;
