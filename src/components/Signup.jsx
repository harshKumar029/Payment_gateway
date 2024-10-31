import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from "../firebase";
import { auth } from "../firebase";

import backgroundimg from "../assets/login_bg_img.webp"
import { onAuthStateChanged } from "firebase/auth";


import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import CryptoJS from 'crypto-js';





const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [issubmit, setissubmit] = useState(false)
  const [error, setError] = useState("");
  const { signUp } = useUserAuth();
  const navigate = useNavigate();


  const [number, setNumber] = useState("");
  const [flag, setFlag] = useState(false);
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState(null); // Ensure result is initially null
  const [otpverified, setotpverified] = useState(false)
  const { setUpRecaptha } = useUserAuth();
  const encryptBalance = (balance) => {
    return CryptoJS.AES.encrypt(balance.toString(), import.meta.env.VITE_APP_secretKey).toString();
  };


  const getOtp = async (e) => {
    e.preventDefault();
    setissubmit(true)
    setError("");
    if (contactNumber === "" || contactNumber === undefined) {
      setissubmit(false);
      return setError("Please enter a valid phone number!");
    }
    try {
      const response = await setUpRecaptha(contactNumber);
      setResult(response); // Store the response for later verification
      setFlag(true);
      setissubmit(false);
    } catch (err) {
      if (err.code === "auth/argument-error") {
        setError("You can try again if you didnt recieved the otp");
      }
      else if (err.code === "auth/invalid-verification-code") {
        setError("Wrong OTP. Please write the correct one...");
      }
      else if (err.code === "auth/id-token-expired	") {
        setError("Otp expired...")
      }
      else if (err.code === "auth/insufficient-permission") {
        setError("You dont have enough permission")
      }
      else if (err.code === "auth/code-expired") {
        setError("Code expired. Pls try again later")
      }
      else if (err.code === "auth/invalid-phone-number") {
        setError("!incorrect Phone Number ")
      }else if (err.code === "auth/too-many-requests") {
        setError("too-many-requests try after sometime ")
      }
      else if(err.message === "reCAPTCHA has already been rendered in this element"){
        setError("Reload the page and try again.")
      }
      else {
        setError(err.message)
      }
      setissubmit(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || !result) return; // Add a check for result being null
    try {
      await result.confirm(otp); // Use the result to confirm the OTP
      // setotpverified(true)
    } catch (err) {
      if (err.code === "auth/argument-error") {
        setError("You can try again if you didnt recieved the otp");
      }
      else if (err.code === "auth/invalid-verification-code") {
        setError("Wrong OTP. Please write the correct one...");
      }
      else if (err.code === "auth/id-token-expired	") {
        setError("Otp expired...")
      }
      else if (err.code === "auth/insufficient-permission") {
        setError("You dont have enough permission")
      }
      else if (err.code === "auth/code-expired") {
        setError("Code expired. Pls try again later")
      }
      else if (err.code === "auth/invalid-phone-number") {
        setError("!incorrect Phone Number ")
      }else if (err.code === "auth/too-many-requests") {
        setError("too-many-requests try after sometime ")
      }
      else if(err.message === "reCAPTCHA has already been rendered in this element"){
        setError("Reload the page and try again.")
      }
      else {
        setError(err.message)
      }
      setissubmit(false)
    }
  };




  const handleSubmit = async (e) => {
    e.preventDefault();
    setissubmit(true)
    setError("");

    await verifyOtp(e);

    try {

      await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            resolve();
            unsubscribe();
          }
        });
      });

      // Now user should be authenticated and have UID available
      getUserDetailsOrCreate();
      setissubmit(false)
    } catch (err) {
      setError(err.message);
      setissubmit(false)
    }
    // }
  };

  const getUserDetailsOrCreate = async () => {
    // console.log("user details in signup", auth.currentUser)
    try {
      const user = auth.currentUser;
      if (!user) return; // User not authenticated or UID not available

      const UID = user.uid;
      const docRef = doc(db, "Users", UID);
      const docSnap = await getDoc(docRef);

      // Check if user exists
      if (!docSnap.exists()) {
        // If user doesn't exist, create new details in DB
        const payLoad = {
          Balance: encryptBalance(0),
          Name: name,
          contactNumber: contactNumber,
          email: email,
          businessCategory: businessCategory,
          isFundAccountAssigned: false,
          isDepositAccountVerified: false,
          AccountNumber: "",
          IfscCode: "",
          BeneficiaryName: "",
          BankName: "",
          created_at: new Date()
        };

        await setDoc(docRef, payLoad, { merge: true });
      }

      // Redirect the user to the homepage
      navigate("/");
    } catch (error) {
      // console.log("Error fetching user details or creating user:", error);
    }
  };







  const addUserToFirestore = async (userId, userData) => {
    try {

      // Assume you have a Firestore reference called 'users' pointing to the collection
      // where user data is stored
      const usersRef = collection(db, "Users", userId);

      // Add the additional user data to the Firestore document
      await addDoc(usersRef, {
        uid: userId,
        email: email,
        Name: userData.name,
        businessCategory: userData.businessCategory,
        contactNumber: userData.contactNumber,
        // Add other fields as needed
      });
    } catch (error) {
      throw error;
    }
  };

  return (
    <div style={{ backgroundImage: `url(${backgroundimg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="flex flex-col max-w-[500px] pl-[2rem] h-screen bg-[#25282E] text-white">
      <div className=" mx-auto mt-[5rem] max-w-[21.8rem]">
        <h1 className=" text-[22px] font-[500] mb-[7rem]">Redux Pay</h1>
        <h2 className="text-2xl font-bold text-white mb-4 animate-[slideFadeIn_1s_ease-in-out]">
          Welcome to Our Community!
        </h2>
        <div className="w-full pr-5 space-y-3 ">
          {!flag ? (
            <div>
              <h2 className="mb-2 text-[18px] font-[500]">Signup</h2>
              {error && <div className=" mb-2 text-sm text-red-600  rounded-lg" role="alert">{error}</div>}
              <form onSubmit={getOtp} onKeyDown={(event) => { if (event.key === 'Enter') getOtp(event); }} className="space-y-4">
                <input
                  className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300 focus:outline-none focus:border-blue-500 font-medium"
                  type="text"
                  placeholder="Full Name"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300  focus:outline-none focus:border-blue-500 font-medium"
                  type="email"
                  placeholder="Email address"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <PhoneInput
                  className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300  focus:outline-none focus:border-blue-500 font-medium"
                  type="tel"
                  placeholder="Contact Number"
                  international
                  defaultCountry="IN"
                  value={contactNumber}
                  // onChange={(e) => setContactNumber(e.target.value)}
                  required
                  // international
                  // defaultCountry="IN"
                  // value={number}
                  onChange={setContactNumber}
                // className="w-full text-gray-700"
                />
                <select
                  className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300  focus:outline-none focus:border-blue-500 font-medium"
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  required
                >
                  <option value="">Select Business Category</option>
                  {["Unregistered", "Proprietorship", "Private Limited", "Partnership", "Public Limited", "LLP", "Trust", "Society", "NGO"].map((category, index) => (
                    <option
                      className="bg-blue"
                      key={index}
                      value={category}
                      required
                    >
                      {category}
                    </option>
                  ))}
                </select>
                <div id="recaptcha-container"></div>
                <div className="flex justify-between space-x-2">
                  {/* <button className="w-[100%] py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none font-medium" type="submit">
                    Signup
                  </button> */}
                  <button className="w-[100%] py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none font-medium" type="submit">

                    {issubmit ? (
                      <div className="  flex justify-center" role="status">
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-200 animate-spin dark:text-blue-600 fill-[#433bd3]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                      </div>
                    ) : (
                      `Signup`
                    )}
                  </button>
                </div>
              </form>
            </div>

          ) : (
            <>
              <label className="text-[#a5a4a4]">Enter otp Sent to <span className=" text-[#f3f3f3]">{contactNumber}</span></label>

              <form onSubmit={handleSubmit} onKeyDown={(event) => { if (event.key === 'Enter') handleSubmit(event); }} className="space-y-4">
              {error && <div className=" mb-2 text-sm text-red-600  rounded-lg" role="alert">{error}</div>}
                <input
                  className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded focus:outline-none"
                  type="text"
                  placeholder="OTP"
                  value={otp}
                  // onChange={setOtp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <div className="flex justify-between space-x-2">
                  {/* <button className="w-[100%] py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none font-medium" type="submit">
                    Verify
                  </button> */}
                  <button className="w-[100%] py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none font-medium" type="submit">

                    {issubmit ? (
                      <div className="  flex justify-center" role="status">
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-200 animate-spin dark:text-blue-600 fill-[#433bd3]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                      </div>
                    ) : (
                      `Verify`
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
          <div className="pt-4 text-md text-center text-white">
            Already have an account? <Link to="/login" className="font-bold text-blue-500 hover:text-blue-400">Log In</Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
