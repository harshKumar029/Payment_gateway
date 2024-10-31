import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { db } from "../firebase";
import axios from 'axios';
import { collection, getDoc, setDoc, doc, onSnapshot, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';

import './Home.css';
import { Buffer } from 'buffer';
import { FaSearch, FaBell, FaUserCircle, FaPlus, FaTimes, FaCaretDown } from 'react-icons/fa';
import { Dialog, Transition } from "@headlessui/react";
import { useUserAuth } from "../context/UserAuthContext";
import { Link, Navigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from 'firebase/storage';
import PayoutHeader from "./Payout/pages/PayoutHeader";
import Payout from '../assets/icon/payouts_icon/payout.svg';
import ProgressBar from '../components/Payout/pages/Progress';
import UserBankAccountForm from "./UserBankAccountForm";
import LineChart from "./LineChart";
import Loading from "./Payout/pages/Loading";
import CryptoJS from 'crypto-js';
import Nodata from "../assets/homepage_icons/nodata.svg"
import calender from "../assets/homepage_icons/calender.svg"




const Home = () => {
  const navigate = useNavigate();
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [useraccountdetails, setuseraccountdetails] = useState([])
  const [userPayoutData, setuserPayoutData] = useState([])
  const [data, setData] = useState([])
  const [usersdata, setusersdata] = useState([])
  const [loading, setLoading] = useState(true);
  const { user } = useUserAuth();

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isError, setIsError] = useState(false);



  const storage = getStorage()
  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const handleAddBalance = () => {
    setIsAddBalanceModalOpen(true);
  };

  const handleCreatePayout = () => {
    return <Navigate to="/payouts" />
  };

  const [utr, setUtr] = useState('');
  const [file, setFile] = useState(null);
  const [amount, setAmount] = useState('');

  const decryptBalance = (encryptedBalance) => {
    const bytes = CryptoJS.AES.decrypt(encryptedBalance, import.meta.env.VITE_APP_secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };
  const handleAmountSelection = (selectedAmount) => {
    const amountWithoutCommas = selectedAmount.replace(/,/g, '');
    setAmount(amountWithoutCommas);
  };

  useEffect(() => {
    setLoading(true);
    const getUserDetailsOrCreate = async () => {
      setLoading(true);
      if (user.uid) {
        setLoading(true);
        try {
          const UID = user.uid;

          // console.log("Home user: ", user);
          const docRef = doc(db, "Users", UID);
          const docSnap = await getDoc(docRef);


          // checking for user existence
          if (!docSnap.data()) {


          } else {
            setAccountBalance(docSnap.data().Balance || 0);
            setusersdata(docSnap.data())
          }
        } catch (error) {
          // console.log("Error fetching user: ", error);
        }
      }
    };

    const accountDetails = async () => {
      if (user) {
        try {
          const docRef = doc(db, "UserAccountDetails", user.uid);

          const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
              const userData = doc.data();
              setuseraccountdetails(userData);
            } else {
              // console.log("No such UserAccountDetails!");
              setLoading(false);
            }

          });
        } catch (error) {
          // console.error("Error fetching UserAccountDetails:", error);
        }
        return () => unsubscribe();
      }
    };


    getUserDetailsOrCreate();
    accountDetails();
    payoutsid();
  }, [user])
  // console.log("vwdgviewgvfugve", useraccountdetails)

  const handleDepositeSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submit action
    // Reference to the specific transaction within the user's document

    try {
      if (usersdata.isFundAccountAssigned !== true) {
        setShowPopup(true)
        setIsError(true);
        setPopupMessage('Your account is not approved');
        return
      }
      const docRef = doc(db, "UserDepositTransactions", user.uid);
      const docSnap = await getDoc(docRef);

      const storageRef = ref(storage, `userImages/${utr}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedImage);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Handle progress if needed
        },
        (error) => {
          // console.error('Error uploading image:', error);
          alert('Error uploading image. Please try again.');
        },
        () => {
          // Image uploaded successfully, you can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // console.log('File available at', downloadURL);
            // Now you can save the downloadURL to the database or perform other actions
          });
        }
      );

      const payLoad = {
        utr: utr,
        amount: amount,
        timestamp: serverTimestamp(),
        isVerified: false,
      };

      if (!docSnap.data()) {
        const payLoadId = utr;
        const newPayLoad = {
          [payLoadId]: payLoad,
        };

        // If user doesn't exist, then create new details in DB. {{}} 
        try {
          await setDoc(docRef, newPayLoad, { merge: true })
            .then(() => {
              // console.log(`First  Created`);
              setShowPopup(true)
              setIsError(false);
              setPopupMessage('Congratulations on your first Deposite!');
              setIsAddBalanceModalOpen(false);
              setUtr('');
              setAmount('');
              // alert("Congratulations on your first Deposite!");
            })

        } catch (error) {
          // console.error('Error assigning new UTR', error);
        }
      }
      else {

        let dataFromDb = docSnap.data();
        const payLoadId = utr;

        if (!(utr in dataFromDb)) {

          dataFromDb[payLoadId] = payLoad;
          // console.log("Date fomr db after: ", dataFromDb);
          try {
            await setDoc(docRef, dataFromDb, { merge: true })
              .then(() => {
                setShowPopup(true)
                setIsError(false);
                setPopupMessage('Deposit submitted successfully.');
                // alert('Deposit submitted successfully.');
                setIsAddBalanceModalOpen(false);
                setUtr('');
                setAmount('');
              })
          } catch (error) {
            // console.log("Error appending UTR details", error);
          }
        }
        else {
          setShowPopup(true)
          setIsError(true);
          setPopupMessage("These details have been already submitted.");
          // alert("These details have been already submitted.")
        }
      }
    } catch (error) {
      setShowPopup(true)
      setIsError(true)
      setPopupMessage('Error submitting deposit. Please try again...');
      // alert('Error submitting deposit. Please try again...',);
    }
  };


  const payoutsid = async () => {
    setLoading(true);
    let payoutid = [];
    if (user.uid) {

      try {
        const docRef = doc(db, "BulkPayments", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const batches = docSnap.data();
          const successfulIds = [];

          for (const key in batches) {
            if (Object.hasOwnProperty.call(batches, key)) {
              const batch = batches[key];
              if (batch.successfulIds && batch.successfulIds.length > 0) {
                successfulIds.push(...batch.successfulIds);
              }
            }
          }
          // console.log("All successfulIds:", successfulIds);
          // console.log("Nodfgdfbdfb dfbdfbnt!");
          payoutid.push(...successfulIds);
        } else {
          // console.log("No such document!");
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
      }

      try {
        const docRef = doc(db, "UserTransactionDetails", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = {
            id: docSnap.id,
            payoutId: docSnap.data().payoutId
          };
          setData(userData.payoutId);
          // Call PayoutsData after setting the data state
          // PayoutsData(userData.payoutId);
          payoutid.push(...userData.payoutId);
        } else {
          // console.log("No such document!");
          setLoading(false);
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
      }
      // PayoutsData(payoutid);
    }

    setuserPayoutData(payoutid);
    setLoading(false);
  };
  // closing the popup message box after 3 sec
  if (showPopup) {
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  }


  // Function to format the date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Group payouts by date and calculate total amount for each date
  // const groupedPayouts = userPayoutData.reduce((acc, payout) => {
  //   const date = formatDate(payout.created_at); // Format date
  //   acc[date] = acc[date] || { count: 0, totalAmount: 0 };
  //   acc[date].count += 1; // Increment payout count for the date
  //   acc[date].totalAmount += payout.amount; // Add payout amount to total amount for the date
  //   return acc;
  // }, {});

  // This is the funcuion which show group Payout data of total 30 days from todays date
  const today = new Date(); // Get today's date
  const thirtyDaysAgo = new Date(today); // Create a new date object for 30 days ago
  thirtyDaysAgo.setDate(today.getDate() - 30); // showing total 30 days data from today

  const groupedPayouts = userPayoutData.reduce((acc, payout) => {
    const date = formatDate(payout.created_at);
    const payoutDate = new Date(date);
    if (payoutDate >= thirtyDaysAgo && payoutDate <= today) {
      // Check if payout date is within the last 30 days
      acc[date] = acc[date] || { count: 0, totalAmount: 0 };
      acc[date].count += 1;
      acc[date].totalAmount += payout.amount;
    }
    return acc;
  }, {});

  // console.log("groupedPayouts", groupedPayouts)



  // Calculate the sum of all totalAmount values
  const totalSum = Object.values(groupedPayouts).reduce((acc, { totalAmount }) => acc + totalAmount, 0);

  // console.log('groupedPayouts', groupedPayouts);


  // console.log("set data of user acc detail", useraccountdetails, userPayoutData, groupedPayouts)
  // const [selectedFile, setSelectedFile] = useState(null);



  return (
    <div className="">
      <PayoutHeader showLeftData={false} />
      {loading ? (
        <div className="  ">
          <Loading />
        </div>
      ) : (
        <div className=" ">
          <div className="bg_gradien  pb-[rem] ">
            {Object.entries(useraccountdetails).length !== 0 &&
              <div className=" bg-[1B1E21] pl-44 p-6">
                <div className="text-white ">
                  <div className="flex" >
                    <img className="w-18 bg-[#23262E] p-2 rounded" src={Payout} alt="payout" />
                    <h2 className="text-gray-500 ml-2 self-center">Balance</h2>
                  </div>
                  <div className=" inline-flex mt-2">
                    <h2 className="text-white font-bold text-[1.8rem]">
                      ₹<span className="ml-3 text-3xl">{Number(decryptBalance(accountBalance)).toLocaleString('en-IN')}</span>
                    </h2>
                    <button onClick={handleAddBalance} className="text-[#6C6C6C] font-bold ml-32 pl-4 py-1 border-l-2 border-gray-700">+ Deposit Money</button>
                  </div>
                </div>
              </div>
            }
            {Object.entries(useraccountdetails).length !== 0 ? (
              <>
                <div className=" p-4 rounded card_bg_gradient mt-5 mx-auto max-w-[75%]">
                  <div className=" flex justify-between">
                    <h1 className='text-base font-xs text-[#6C6C6C]' >Validated Accounts</h1>
                    <Link to='/add_bankaccount'>
                      <button className='cursor-pointer text-sm font-bold rounded-sm py-1 px-3 bg-gradient-to-r from-[#5413b5] to-[#FA75F8] text-white'>+ ADD ACCOUNT</button>
                    </Link>

                  </div>
                  <div className=" mt-3 px-3 rounded border-x border-y border-[#464545] ">
                    {Object.entries(useraccountdetails).map(([key, value]) => (
                      <div key={key} className="flex py-3 border-b border-gray-700">
                        <svg className=" self-top mt-1 mr-2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 640" width="20px" height="20px" fill="#59a0f7"><g><path d="M485.1,199.1v-32.7h24.5v-37.8L256,2L2.4,128.6v37.8h24.5v32.7h24.5v229.1H26.9v32.7H2.4V510h507.3v-49.1h-24.5v-32.7   h-24.5V199.1H485.1z M468.7,182.7h-98.2v-16.4h98.2V182.7z M354.2,460.9h-32.7v-32.7h-24.5V199.1h24.5v-32.7h32.7v32.7h24.5v229.1   h-24.5V460.9z M157.8,166.4h32.7v32.7h24.5v229.1h-24.5v32.7h-32.7v-32.7h-24.5V199.1h24.5V166.4z M280.5,428.2h-49.1V199.1h49.1   V428.2z M206.9,182.7v-16.4h98.2v16.4H206.9z M206.9,444.5h98.2v16.4h-98.2V444.5z M18.7,150v-11.3L256,20.3l237.3,118.4V150h-8.2   H18.7z M43.3,182.7v-16.4h98.2v16.4H43.3z M67.8,199.1h49.1v229.1H67.8V199.1z M43.3,444.5h98.2v16.4H43.3V444.5z M493.3,477.3   v16.4H18.7v-16.4H493.3z M468.7,444.5v16.4h-98.2v-16.4H468.7z M444.2,428.2h-49.1V199.1h49.1V428.2z" /><path d="M256,141.8c27.1,0,49.1-22,49.1-49.1s-22-49.1-49.1-49.1s-49.1,22-49.1,49.1S228.9,141.8,256,141.8z M256,60   c18,0,32.7,14.7,32.7,32.7S274,125.5,256,125.5s-32.7-14.7-32.7-32.7S238,60,256,60z" /><path d="M246.7,103.7c-2.3-1-4.2-0.9-5.6,0.6c-0.7,0.8-1.1,1.9-1.1,3.2c0,0.9,0.3,2.6,2.7,3.7c3.2,1.4,6.7,2.2,10.2,2.6v2.3   c0,1.9,1.3,3.2,3.2,3.2c0.9,0,1.7-0.3,2.3-0.9c0.6-0.6,1-1.4,1-2.3v-2.3c3.4-0.5,6.2-1.6,8.4-3.5c2.8-2.3,4.1-5.3,4.1-8.8   c0-4-1.7-7.3-4.9-9.4c-1.4-0.9-2.9-1.6-4.6-2.1c-1-0.3-2-0.6-3.1-0.9v-9c1.7,0.2,3.3,0.5,4.7,1c1,0.4,1.8,0.6,2.5,0.6   c0.8,0,1.8-0.3,2.8-1.5c0.7-0.8,1-1.8,1-2.8c0-1.9-1-3.4-2.8-4c-2.4-0.9-5.2-1.5-8.2-1.8v-2.2c0-0.9-0.3-1.7-0.9-2.3   c-1.3-1.3-3.5-1.2-4.7,0.1c-0.6,0.6-0.9,1.4-0.9,2.3v2.3c-3.5,0.5-6.5,1.8-8.7,3.8c-1.3,1.2-2.2,2.6-2.9,4.1c-0.6,1.5-1,3.2-1,5.1   c0,2,0.5,3.8,1.4,5.3c0.9,1.4,2.2,2.7,3.9,3.8c1.5,1,3.8,1.9,7.2,2.8v8.5C250.5,105,248.4,104.5,246.7,103.7z M259.4,98.4   c1.3,0.4,2,0.8,2.3,1c0.5,0.3,0.9,0.6,1.1,0.9c0.1,0.2,0.2,0.5,0.2,1c0,0.6-0.1,1.1-0.3,1.5c-0.5,1-1.7,1.7-3.3,2.1V98.4z    M252.6,87.3c-3.3-1.1-3.3-2.6-3.3-3.2c0-1.1,0.4-1.9,1.3-2.5c0.7-0.5,1.4-0.8,2.3-1.1v6.9C252.8,87.4,252.7,87.3,252.6,87.3z" /></g></svg>
                        <div>
                          <div className="flex">
                            <h4 className="text-base text-white">{value.beneficiaryName.charAt(0).toUpperCase() + value.beneficiaryName.slice(1)} {value.accountNumber}</h4>
                            {value.isVerified ? (
                              <p className="ml-3 rounded-full px-2 py-1 text-black bg-[#83FF81] font-bold text-xs self-center">
                                APPROVED
                              </p>
                            ) : (
                              <p className="ml-3 rounded-full px-2 py-1 text-black bg-[#FFC659] font-bold text-xs self-center">
                                PENDING
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-[#6C6C6C]">
                              <span>• {value.ifscCode} </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className=" mt-3">
                    <p className=' text-xs text-[#6C6C6C]'>Note:</p>
                    <p className=' text-xs text-[#6C6C6C]'>• Balance can be added active Validated accounts only.</p>
                    <p className=' text-xs text-[#6C6C6C]'>• it will 30-60min for funds to reflect in your base account.</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="  mt-5 mx-auto max-w-[75%]" >
                {/* <h3 className="text-base text-white font-bold max-w-[75%] mb-5 m-auto">Bank Account Details</h3> */}
                {/* <UserBankAccountForm /> */}
                <div className="  rounded flex max-w-[68%]" style={{
                  background: 'linear-gradient(90deg, rgba(35,37,38,1) 28%, rgba(32,35,37,1) 80%)'
                }}>
                  <div className=" rounded content-center mx-3" >


                    <svg className="  self-top " xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 640" width="60px" height="60px" fill="#fff"><g><path d="M485.1,199.1v-32.7h24.5v-37.8L256,2L2.4,128.6v37.8h24.5v32.7h24.5v229.1H26.9v32.7H2.4V510h507.3v-49.1h-24.5v-32.7   h-24.5V199.1H485.1z M468.7,182.7h-98.2v-16.4h98.2V182.7z M354.2,460.9h-32.7v-32.7h-24.5V199.1h24.5v-32.7h32.7v32.7h24.5v229.1   h-24.5V460.9z M157.8,166.4h32.7v32.7h24.5v229.1h-24.5v32.7h-32.7v-32.7h-24.5V199.1h24.5V166.4z M280.5,428.2h-49.1V199.1h49.1   V428.2z M206.9,182.7v-16.4h98.2v16.4H206.9z M206.9,444.5h98.2v16.4h-98.2V444.5z M18.7,150v-11.3L256,20.3l237.3,118.4V150h-8.2   H18.7z M43.3,182.7v-16.4h98.2v16.4H43.3z M67.8,199.1h49.1v229.1H67.8V199.1z M43.3,444.5h98.2v16.4H43.3V444.5z M493.3,477.3   v16.4H18.7v-16.4H493.3z M468.7,444.5v16.4h-98.2v-16.4H468.7z M444.2,428.2h-49.1V199.1h49.1V428.2z" /><path d="M256,141.8c27.1,0,49.1-22,49.1-49.1s-22-49.1-49.1-49.1s-49.1,22-49.1,49.1S228.9,141.8,256,141.8z M256,60   c18,0,32.7,14.7,32.7,32.7S274,125.5,256,125.5s-32.7-14.7-32.7-32.7S238,60,256,60z" /><path d="M246.7,103.7c-2.3-1-4.2-0.9-5.6,0.6c-0.7,0.8-1.1,1.9-1.1,3.2c0,0.9,0.3,2.6,2.7,3.7c3.2,1.4,6.7,2.2,10.2,2.6v2.3   c0,1.9,1.3,3.2,3.2,3.2c0.9,0,1.7-0.3,2.3-0.9c0.6-0.6,1-1.4,1-2.3v-2.3c3.4-0.5,6.2-1.6,8.4-3.5c2.8-2.3,4.1-5.3,4.1-8.8   c0-4-1.7-7.3-4.9-9.4c-1.4-0.9-2.9-1.6-4.6-2.1c-1-0.3-2-0.6-3.1-0.9v-9c1.7,0.2,3.3,0.5,4.7,1c1,0.4,1.8,0.6,2.5,0.6   c0.8,0,1.8-0.3,2.8-1.5c0.7-0.8,1-1.8,1-2.8c0-1.9-1-3.4-2.8-4c-2.4-0.9-5.2-1.5-8.2-1.8v-2.2c0-0.9-0.3-1.7-0.9-2.3   c-1.3-1.3-3.5-1.2-4.7,0.1c-0.6,0.6-0.9,1.4-0.9,2.3v2.3c-3.5,0.5-6.5,1.8-8.7,3.8c-1.3,1.2-2.2,2.6-2.9,4.1c-0.6,1.5-1,3.2-1,5.1   c0,2,0.5,3.8,1.4,5.3c0.9,1.4,2.2,2.7,3.9,3.8c1.5,1,3.8,1.9,7.2,2.8v8.5C250.5,105,248.4,104.5,246.7,103.7z M259.4,98.4   c1.3,0.4,2,0.8,2.3,1c0.5,0.3,0.9,0.6,1.1,0.9c0.1,0.2,0.2,0.5,0.2,1c0,0.6-0.1,1.1-0.3,1.5c-0.5,1-1.7,1.7-3.3,2.1V98.4z    M252.6,87.3c-3.3-1.1-3.3-2.6-3.3-3.2c0-1.1,0.4-1.9,1.3-2.5c0.7-0.5,1.4-0.8,2.3-1.1v6.9C252.8,87.4,252.7,87.3,252.6,87.3z" /></g></svg>


                  </div>
                  <div className=" space-y-4 p-[20px]">
                    <h2 className=" text-[1.4rem] text-[white]">Continue your application</h2>
                    <p className="text-xs  text-[#696E99]">Complete your application and get the sharpest and safest banking experience in india.</p>
                    <ProgressBar progress={50} />
                    <div className=" flex justify-between items-center ">
                      <Link to='/add_bankaccount'>
                        <button className=" flex items-center cursor-pointer text-base font-s rounded-sm py-[.4rem] px-7 text-[#FFFFFF] bg-[#2E20D1]">Continue application
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className=" ml-2 w-[.9rem] h-[.9rem]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                          </svg>
                        </button>
                      </Link>
                      <p className="text-s text-[#696E99]">1/2</p>
                    </div>
                  </div>
                </div>


              </div>
            )}
            <div className=" pt-8 rounded card_bg_gradient mt-5 mx-auto max-w-[75%]">
              <div className=" ml-6">
                <h1 className=" text-[#FFFFFF]">Payout volume- last 30 days</h1>
                <div className=" inline-flex mt-2">
                  <h2 className="  font-bold">
                    <span className="  text-xl bg-gradient-to-r from-yellow-300 to-purple-500 text-transparent bg-clip-text">₹</span>
                    {/* <span className=" text-white ml-1 text-3xl">{totalSum}</span> */}
                    <span className=" ml-1 text-3xl bg-gradient-to-r from-yellow-300 to-purple-500 text-transparent bg-clip-text ">{`${(totalSum / 100).toLocaleString('en-IN')}`}</span>
                  </h2>
                </div>
              </div>
              <div >
                <LineChart groupedPayouts={groupedPayouts} />
              </div>
              <div className="  border-gray-100" style={{
                height: '8px',
                backgroundColor: 'rgba(48, 197, 216, .38)',
                opacity: '0.26',
                borderRadius: '0 0 8px 8px'
              }}></div>
            </div>
          </div>


          <div className="bg_purgradien h-[100vh] pb-4 ">
            <div className=" pl-10 pt-8 rounded  mt-5 mx-auto max-w-[75%] card_bg_gradient pb-4 " >
              <div >
                <h1 className='text-base font-xs pb-4 text-white' >Activity Feed</h1>
              </div>


              <div className=" py-5 ">
                <div className=" mx-auto max-w-[55%]">
                  {Object.entries(groupedPayouts).length > 0 ?
                    Object.entries(groupedPayouts)
                      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)) // Sort entries by date in descending order
                      .map(([date, { count, totalAmount }]) => (
                        <div key={date} className=" pb-4  ">
                          <div className=" py-3 min-w-[100%] rounded bg-[#89828213] border-[1px] border-[#6fb9f7] border-opacity-5" >
                            {/* style={{
                          background: 'linear-gradient(90deg, rgba(45,49,54,1) 34%, rgba(37,40,46,1) 70%)'
                        }} */}
                            <div className=" ml-6   border-gray-800">
                              <div className=" pb-3 pr-6 font-bold text-xs self-center">
                                {(() => {
                                  const [weekday, month, day] = new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).split(' ');
                                  return (
                                    <div className=" flex justify-between items-baseline">
                                      <div className="flex gap-2 items-baseline">
                                        <img className=" w-4" src={calender} alt="calender" />
                                        <h4 className="text-white text-[20px]">{`${day} ${month}`},</h4>
                                        <p className="text-[12px] font-semibold text-white"> {weekday}</p>
                                      </div>
                                      <svg width="13" height="13" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.44" d="M0.889245 19.4149C0.332673 20.0285 0.378914 20.9772 0.992526 21.5337C1.60614 22.0903 2.55476 22.0441 3.11133 21.4304L0.889245 19.4149ZM20.4983 1.60758C20.458 0.780136 19.7545 0.142057 18.9271 0.182391L5.4431 0.839667C4.61566 0.880001 3.97758 1.58347 4.01791 2.41092C4.05825 3.23836 4.76172 3.87644 5.58917 3.83611L17.5749 3.25186L18.1592 15.2376C18.1995 16.0651 18.903 16.7032 19.7304 16.6628C20.5579 16.6225 21.196 15.919 21.1556 15.0916L20.4983 1.60758ZM3.11133 21.4304L20.1112 2.68837L17.8891 0.67285L0.889245 19.4149L3.11133 21.4304Z" fill="#D63F3F" />
                                      </svg>

                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="self-center">
                                <div>

                                  <p className="">
                                    <span className="font-semibold text-[1.5rem] bg-gradient-to-r from-yellow-300 to-purple-500 text-transparent bg-clip-text">{`${count}`}</span>
                                    <span className="text-gray-500 font-normal text-[.9rem] tracking-[1.2px]"> Payouts processed,</span>
                                  </p>
                                  <p>
                                    <span className=" text-gray-500 font-normal text-[.9rem] tracking-[1.2px]">With a total Amount of </span>
                                    <span className="text-[1.1rem] font-semibold bg-gradient-to-r from-yellow-300 to-purple-500 text-transparent bg-clip-text">₹</span>
                                    <span className=" ml-1 font-semibold text-[1.5rem] bg-gradient-to-r from-yellow-300 to-purple-500 text-transparent bg-clip-text">{`${(totalAmount / 100).toLocaleString('en-IN')}`}.</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    :
                    <div className=" space-y-3" style={{ textAlign: '-webkit-center' }}>
                      <img className="" src={Nodata} alt="no data" />
                      <h1 className="text-[.82rem] text-[#fff] font-bold">LOOKS LIKE THERE ARE NO TRANSACTIONS YET</h1>
                      <p className="text-xs text-gray-500">You can View the latest payouts generated over here. Stay informed about recent payments and transactions made through Reduxpay platform.</p>
                    </div>}
                </div>
              </div>

            </div>
          </div>

          {/* MOdal */}
          <Transition appear show={isAddBalanceModalOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setIsAddBalanceModalOpen(false)}>
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-50" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-dark-purple p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                        Add Balance
                        <button
                          type="button"
                          className="float-right inline-flex justify-center rounded-md border border-transparent bg-transparent text-white hover:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                          onClick={() => {
                            setIsAddBalanceModalOpen(false);
                            setUtr('');
                            setAmount('');
                          }}
                        >
                          <FaTimes />
                        </button>
                      </Dialog.Title>

                      <div className="mt-2 flex">
                        {/* Left side of the modal */}
                        <div className="w-1/2 pr-4">
                          {/* ... Existing left side content ... */}
                          <div className="mt-2 ">
                            <p className="text-sm text-gray-400">Update balance to any of the following:</p>
                            <div className="mt-4 bg-[#25282E] p-4 rounded-lg">
                              {usersdata.isFundAccountAssigned === true ? (
                                <>
                                  <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-300">{usersdata.BankName}</p>
                                    <FaCaretDown className="text-gray-300" />
                                  </div>
                                  <>
                                    <p className="text-white mt-2">A/C Holder: {usersdata.BeneficiaryName}</p>
                                    <p className="text-white">A/C Number: {usersdata.AccountNumber}</p>
                                    <p className="text-white">IFSC: {usersdata.IfscCode}</p>
                                  </>
                                </>
                              ) : (
                                <>
                                  <p className="text-white">Your Deposit Account is not verified yet.</p>
                                </>
                              )}

                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                              Make sure to transfer the balance from 4 Validated Accounts only.
                              <button className="text-blue-500">Show Details</button>
                            </p>
                          </div>
                          <div className="mt-4">
                            <p className="text-xs text-white">NOTE:</p>
                            <ul className="list-disc text-xs text-white pl-5">
                              <li>Supported modes: NEFT, RTGS, IMPS & UPI.</li>
                              <li>NEFT and RTGS transfers can take 2hrs & 30min respectively.</li>
                              <li><button className="text-blue-500" onClick={() => { navigate('./requestcall') }}>Contact support</button> for any other issues.</li>
                            </ul>
                          </div>
                        </div>

                        {/* Right side of the modal */}
                        <div className="w-1/2 pl-4 border-l border-gray-200">
                          <form className="space-y-4" onSubmit={handleDepositeSubmit}>
                            <div>
                              <label htmlFor="utr" className="block text-sm font-medium text-white mb-1">Unique Transaction Reference *</label>
                              <input
                                type="number"
                                id="utr"
                                name="utr"
                                className="p-2 block w-full bg-[#ffffff27] text-[#fff] rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                placeholder="6 to 12 Digit UTR Number"
                                value={utr}
                                onChange={(e) => setUtr(e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="amount" className="block text-sm font-medium text-white mb-1">Amount *</label>
                              <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="p-2 block w-full bg-[#ffffff27] text-[#fff] rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                placeholder="Enter amount"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-4">
                              {/* Preset amount buttons */}
                              {['10,000', '50,000', '1,00,000', '5,00,000', '10,00,000', '50,00,000'].map((presetAmount) => (
                                <button
                                  key={presetAmount}
                                  type="button"
                                  className="bg-[#2E20D1] hover:bg-[#2f20d1c0] text-white font-medium rounded-lg text-sm px-3 py-2.5 text-center"
                                  onClick={() => handleAmountSelection(presetAmount)}
                                >
                                  {presetAmount}
                                </button>
                              ))}
                            </div>
                            <div>

                              <p className="block text-sm font-medium text-white mb-1">Upload Your Payment Proof *</p>
                              <div className="flex items-center justify-center w-full">
                                <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-[#fcfbfb0f] dark:hover:bg-bray-800 dark:bg-[#fcfbfb0d] hover:bg-[#fff] dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-[#ffffff00]">
                                  <div className="flex flex-col items-center justify-center ">
                                    <svg className="w-4 h-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className=" text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    {selectedImage && (
                                      <p className=" text-sm text-[#3b52fa] ">Uploaded file: {selectedImage.name}</p>
                                    )}
                                  </div>
                                  <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"  // Allow only image files
                                    onChange={(e) => handleImageSelection(e)}
                                    className="hidden"
                                    required
                                  />
                                </label>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-[#2E20D1] hover:bg-[#2f20d1a3] text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                              SUBMIT
                            </button>
                          </form>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
          {/* Success/Error Popup */}
          {showPopup && (
            <div className={`absolute top-20 z-50 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg ${isError ? 'bg-red-500' : 'bg-green-500'} text-white`}>
              <p>{popupMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
