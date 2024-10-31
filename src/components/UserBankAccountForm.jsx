


import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Col, Row } from 'react-bootstrap';

import { db, storage } from "../firebase";
import { collection, getDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from "firebase/storage";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';

const UserBankAccountForm = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    gstNumber: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    beneficiaryName: '',
    Companyname: '',
  });

  const [gstFile, setGstFile] = useState(null);
  const [chequeFile, setChequeFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [userData, setUserData] = useState(null);
  const [UserAccountDetails, setUserAccountDetails] = useState([])
  const UID = user.uid;

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const validate = (values) => {
    const errors = {};
    if (!hasSubmittedOnce) {
      if (!values.gstNumber) {
        errors.gstNumber = 'GST Number is required';
      }
    }

    if (!chequeFile) {
      errors.formChequeFile = 'Cancelled Cheque is required';
    }
    if (!hasSubmittedOnce) {
      if (!gstFile) {
        errors.forGSTFile = 'GST file is required';
      }
    }
    if (!values.ifscCode) {
      errors.ifscCode = "IFSC code is required";
    }
    if (!values.Companyname) {
      errors.Companyname = "Companyname is require";
    }
    if (!values.accountNumber) {
      errors.accountNumber = 'Account number is required';
    }
    if (!values.confirmAccountNumber) {
      errors.confirmAccountNumber = 'Confirm account number is required';
    } else if (values.accountNumber !== values.confirmAccountNumber) {
      errors.confirmAccountNumber = 'Account numbers do not match';
    }
    if (!values.beneficiaryName) {
      errors.beneficiaryName = 'Beneficiary Name name is required';
    }
    return errors;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "UserAccountDetails", UID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserAccountDetails(Object.values(userData))

          Object.values(userData).map((value) => {
            if (value.isVerified) {
              setHasSubmittedOnce(true);
              if (value.gstNumber) {
                setUserData({ gstNumber: value.gstNumber, gstFile: value.gstFile });
              }
            }
          });
        }
      } catch (error) {
        // console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [UID]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    if (userData) {
      setFormData({
        gstNumber: userData.gstNumber,
      });
    }
  }, [userData]);
  const handleFileChange = (e) => {
    if (e.target.name === 'gstFile') {
      setGstFile(e.target.files[0]);
    } else if (e.target.name === 'chequeFile') {
      setChequeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d*$/.test(formData.accountNumber) || !/^\d*$/.test(formData.confirmAccountNumber)) {
      setShowPopup(true)
      setIsError(true);
      setPopupMessage('Account Numbers should only contain digits');
      return
  }

    console.log("UserAccountDetails", UserAccountDetails)
    const countFalse = UserAccountDetails.filter(item => !item.isVerified).length;
    const countTrue = UserAccountDetails.filter(item => item.isVerified).length;

    if (countFalse === 5) {
      setShowPopup(true)
      setIsError(true);
      setPopupMessage('Account pending limit exceeded! Maximum 5 pending accounts allowed.');
      return
    }
    if (countTrue === 5) {
      setShowPopup(true)
      setIsError(true);
      setPopupMessage('Maximum 5 Approve accounts allowed.');
      return
    }

    //Form validation
    // Add form validation for accountNo
    if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      setShowPopup(true)
      setIsError(true);
      setPopupMessage('Account number should be between 9 to 18 digits.');
      return;
    }

    // Add form validation for ifsc
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      setShowPopup(true)
      setIsError(true);
      setPopupMessage('Invalid IFSC code format.');
      return;
    }

    // Check if the Account Number and Confirm Account Number match
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setShowPopup(true)
      setIsError(true);
      setPopupMessage("Account Number and Confirm Account Number don't match.");
      return;
    }

    // TODO: Add validation before submitting
    // Send data to Firestore
    const errors = validate(formData);
    if (chequeFile && chequeFile.size > 5242880) {
      errors.formChequeFile = 'Cheque file size should be less than 5MB';
    }
    if (gstFile && gstFile.size > 10485760) {
      errors.forGSTFile = 'GST file size should be less than 5MB';
    }

    setFormErrors(errors);

    // All details are good to go
    if (Object.keys(errors).length === 0) {
      try {
        const docRef = doc(db, "UserAccountDetails", UID);
        const docSnap = await getDoc(docRef);
        const payLoad = {
          ...formData,
          uid: UID,
          gstFile: hasSubmittedOnce ? userData.gstNumber : formData.gstNumber,
          chequeFile: formData.accountNumber,
          isVerified: false,
          created_at: new Date(),
        };

        // Uploading Files to cloud storage
        const imageRef = ref(storage, `${formData.accountNumber}`);
        uploadBytes(imageRef, chequeFile)
          .then(() => {
            // console.log("Image Uploaded success");
          })

        const gstRef = ref(storage, `${formData.gstNumber}`);
        uploadBytes(gstRef, gstFile)
          .then(() => {
            // console.log("Gstfile Uploaded successfully");
          })

        // Updating user Account details
        if (!docSnap.data()) {
          const payLoadId = formData.accountNumber;
          const newPayLoad = {
            [payLoadId]: payLoad,
          };

          // If user doesn't exist, then create new details in DB. {{}} 
          try {
            await setDoc(docRef, newPayLoad, { merge: true })
              .then(() => {
                // console.log(`New User Created`);
              })

          } catch (error) {
            // console.error('Error updating user data:', error);
          }
        }
        else {
          let dataFromDb = docSnap.data();
          const payLoadId = formData.accountNumber;

          // console.log("Data from db: ", dataFromDb);
          // console.log(typeof (dataFromDb));

          dataFromDb[payLoadId] = payLoad;
          try {
            await setDoc(docRef, dataFromDb, { merge: true })
              .then(() => {
                // console.log("New record added");
              })
          } catch (error) {
            // console.log("Error appending account details");
          }
        }
        navigate("/");
        // console.log('Data submitted to Firestore');
      } catch (error) {
        // console.error('Error submitting form:', error);
      }
    }
    else {
      // console.log("Fix error in forms");
      // console.log(errors);
    }
  };


  // closing the popup message box after 3 sec
  if (showPopup) {
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  }
  
  return (
    <div >
      <div className='mx-auto max-w-[75%]'>

        <div className=" text-white flex items-center justify-center ">
          <div className="w-full  py-8 px-16 bg-[#25282E] rounded-lg ">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h1 className='text-yellow-500 text-base flex mb-3'>Add your bank account to proceed
                <svg className=' self-center ml-2' width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </h1>


              {/* GST Number */}
              <div className='flex justify-between'>
                {hasSubmittedOnce ? <> <label htmlFor="gstNumber" className="block text-sm font-medium self-end text-[#6C6C6C]">
                  GST Number
                </label>
                  <input
                    type="text"
                    id="gstNumber"
                    name="gstNumber"
                    value={userData.gstNumber}
                    readOnly
                    className="w-[70%] bg-transparent focus:outline-none "
                    required
                  /> </> :
                  <>
                    <label htmlFor="gstNumber" className="block text-sm font-medium self-end text-[#6C6C6C]">
                      GST Number
                    </label>
                    <input
                      type="text"
                      id="gstNumber"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="w-[70%] bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-yellow-400"
                      required

                    /></>}
                {formErrors.gstNumber && <p className="text-red-500 text-xs mt-1">{formErrors.gstNumber}</p>}
              </div>
              {/* Confirm Company name */}
              <div className='flex justify-between'>
                <label htmlFor="Companyname" className="block text-sm font-medium self-end text-[#6C6C6C]">
                  Company name
                </label>
                <input
                  type="text"
                  id="Companyname"
                  name="Companyname"
                  value={formData.Companyname}
                  onChange={handleChange}
                  className="w-[70%] bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-yellow-400"
                  required
                />
                {formErrors.Companyname && <p className="text-red-500 text-xs mt-1">{formErrors.Companyname}</p>}
              </div>


              {/* Account Number */}
              <div className='flex justify-between'>
                <label htmlFor="accountNumber" className="block text-sm font-medium self-end text-[#6C6C6C]">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-[70%] bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-yellow-400"
                  minLength="9"
                  maxLength="18"
                  required
                />
                {formErrors.accountNumber && <p className="text-red-500 text-xs mt-1">{formErrors.accountNumber}</p>}
              </div>

              {/* Confirm Account Number */}
              <div className='flex justify-between'>
                <label htmlFor="confirmAccountNumber" className="block text-sm font-medium self-end text-[#6C6C6C]">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  id="confirmAccountNumber"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  onChange={handleChange}
                  className="w-[70%] bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-yellow-400"
                  minLength="9"
                  maxLength="18"
                  required
                />
                {formErrors.confirmAccountNumber && <p className="text-red-500 text-xs mt-1">{formErrors.confirmAccountNumber}</p>}
              </div>

              {/* IFSC Code */}
              <div className='flex justify-between'>
                <label htmlFor="ifscCode" className="block text-sm font-medium self-end text-[#6C6C6C]">
                  IFSC Code
                </label>
                <input
                  type="text"
                  id="ifscCode"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                  onChange={handleChange}
                  className="w-[70%] bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-yellow-400"
                  pattern="[A-Z]{4}[0][A-Z0-9]{6}" // IFSC code format pattern
                  title="Enter a valid IFSC code"
                  maxLength="11"
                  required
                />
                {formErrors.ifscCode && <p className="text-red-500 text-xs mt-1">{formErrors.ifscCode}</p>}
              </div>

              {/* Beneficiary Name */}
              <div className='flex justify-between'>
                <label htmlFor="beneficiaryName" className="block text-sm font-medium self-end text-[#6C6C6C]">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  id="beneficiaryName"
                  name="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={handleChange}
                  className="w-[70%] bg-transparent border-b-2 border-gray-500 p-2 focus:outline-none focus:border-yellow-400"
                  required
                />
                {formErrors.beneficiaryName && <p className="text-red-500 text-xs mt-1">{formErrors.beneficiaryName}</p>}
              </div>

              <div>
                {hasSubmittedOnce ? null
                  :
                  <>
                    <label className="block py-2 text-sm font-medium  dark:text-[#6C6C6C]" htmlFor="file_input">Upload GST</label>
                    <input className="block p-2 w-full text-sm text-gray-900  rounded cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-[#393d44] dark:border-gray-600 dark:placeholder-gray-400"
                      type="file"
                      id="gstFile"
                      name="gstFile"
                      onChange={handleFileChange}
                      accept="application/pdf"
                    />
                    <p className="mt-1 text-sm text-[13px] dark:text-[#ff000084]" id="file_input_help"> (MAX File Size. 10MB).</p>
                    {formErrors.forGSTFile && <p className="text-red-500 text-xs mt-1">{formErrors.forGSTFile}</p>}
                  </>}
              </div>
              <div>

                <label className="block py-2 text-sm font-medium text-gray-900 dark:text-[#6C6C6C]" htmlFor="file_input">Upload Cancelled Cheque</label>
                <input className="block p-2 w-full text-sm text-gray-900 rounded cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-[#393d44] dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  id="chequeFile"
                  name="chequeFile"
                  onChange={handleFileChange}
                />
                <p className="mt-1 text-[13px] text-gray-500 dark:text-[#ff000084]" id="file_input_help"> (MAX File Size. 5MB).</p>
                {formErrors.formChequeFile && <p className="text-red-500 text-xs mt-1">{formErrors.formChequeFile}</p>}
              </div>
              <button
                type="submit"
                className="mt-4 float-end bg-[#2f20d1] hover:bg-[#2f20d1ca] text-white font-semibold py-2 px-4 rounded-md"
              >
                Submit
              </button>
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
    </div>);
};

export default UserBankAccountForm;