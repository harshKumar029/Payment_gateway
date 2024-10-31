import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import { useUserAuth } from "../context/UserAuthContext";
import "react-phone-number-input/style.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

import backgroundimg from "../assets/login_bg_img.webp"

import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from "../firebase";

const Login = () => {
  const [error, setError] = useState("");
  const [number, setNumber] = useState("");
  const [flag, setFlag] = useState(false);
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState(null); // Ensure result is initially null
  const { setUpRecaptha, logOut, resetRecaptcha } = useUserAuth();
  const [userData, setUserData] = useState([])
  const [issubmit, setissubmit] = useState(false)
  const navigate = useNavigate();
  const [verifyotp, setverifyotp] = useState(false)

  // useEffect(() => {
  //   const storedNumber = localStorage.getItem("phoneNumber");
  //   if (storedNumber !== null) {
  //     setNumber(storedNumber);
  //   }
  // }, [number]);

  const notify = () => toast.error("This Number is not registered. Please sign up.", {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });

  const getOtp = async (e) => {
    e.preventDefault();
    setissubmit(true)
    setError("");
    if (number === "" || number === undefined) {
      setissubmit(false)
      return setError("Please enter a valid phone number!");
    }
    console.log("phonme number of user", number)
    try {
      const response = await setUpRecaptha(number);
      console.log("response of phone signup in login page", response);
      setResult(response); // Store the response for later verification
      setFlag(true);
      setissubmit(false)
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
      } else if (err.code === "auth/too-many-requests") {
        setError("too-many-requests try after sometime ")
      }
      else if (err.message === "reCAPTCHA has already been rendered in this element") {
        setError("Reload the page and try again.")
      }
      else {
        setError(err.message)
      }
      setissubmit(false)
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setverifyotp(true)
    setError("");
    if (!otp || !result) return; // Add a check for result being null
    try {
      const data = await result.confirm(otp); // Use the result to confirm the OTP
      const userexist = await checkIfUserExistsInDatabase(data.user.uid);
      setverifyotp(false)
      if (!userexist) {
        await logOut();
        notify();
        setTimeout(() => {
          navigate("/signup");
        }, 4000);
      } else {
        navigate("/");
      }
      setissubmit(false)

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
      else {
        setError(err.message)
      }
      setverifyotp(false)
    }
  };


  async function checkIfUserExistsInDatabase(uid) {
    try {
      const userDoc = await getDoc(doc(db, "Users", uid));
      return userDoc.exists();
    } catch (error) {
      // console.error("Error checking user existence in database:", error);
      return false;
    }
  }


  return (
    // items-center justify-center
    <div style={{ backgroundImage: `url(${backgroundimg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="flex flex-col max-w-[500px] h-screen bg-[#25282E] text-white  border-r-2 border-[#32353B]">
        <div className=" mx-auto mt-[5rem]">
          <h1 className=" text-[22px] font-[500] ">Redux Pay</h1>
          <h2 className="text-[30px] font-[500] mt-[9rem] mb-[2rem] animate-[slideFadeIn_1s_ease-in-out]">Banking made awsome <br /> for startups</h2>
          <div className="max-w-[340px] rounded">
            <h2 className="mb-2 text-[18px] font-[500]">Login</h2>
            {error && <div className=" mb-2 text-sm text-red-600  rounded-lg" role="alert">{error}</div>}
            {!flag ? (
              // Code for entering phone number
              <form onSubmit={getOtp} onKeyDown={(event) => { if (event.key === 'Enter') getOtp(event); }} className="space-y-4">
                <label className="text-[#a5a4a4]">Mobile Number</label>
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={number}
                  onChange={setNumber}
                  className="w-full text-gray-700"
                />
                {/* <div id="recaptcha-container"></div> */}
                <div className="flex justify-between space-x-2">

                  <button className="w-[100%] py-2 text-sm text-white bg-blue-500 rounde hover:bg-blue-600 focus:outline-none font-medium" type="submit">
                    {issubmit ? (
                      <div className="  flex justify-center" role="status">
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-200 animate-spin dark:text-blue-600 fill-[#433bd3]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                      </div>
                    ) : (
                      `Send Otp`
                    )}
                  </button>
                </div>
                <div>
                  <div className="pt-4 text-md text-center text-white">
                    Don't have an account? <Link to="/signup" className="font-bold text-blue-500 hover:text-blue-400">Sign up</Link>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={verifyOtp} onKeyDown={(event) => { if (event.key === 'Enter') verifyOtp(event); }} className="space-y-4">
                <label className="text-[#a5a4a4]">Enter otp Sent to <span className=" text-[#f3f3f3]">{number}</span></label>
                <input
                  className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded focus:outline-none"
                  type="text"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                {/* <div id="recaptcha-container-resend"  /> */}
                <div className="flex justify-between">
                  <button
                    className={` w-1/2 mr-1 py-2 text-sm text-white bg-gray-400 rounded hover:bg-gray-500 focus:outline-none font-medium ${issubmit || verifyotp ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#83FF81] hover:bg-[#83FF81] bg-opacity-80 '
                      }`}
                    onClick={getOtp} disabled={issubmit || verifyotp}>
                    {issubmit ? (
                      <div className="  flex justify-center" role="status">
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-200 animate-spin dark:text-blue-600 fill-[#433bd3]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                      </div>
                    ) : (
                      `Resend`
                    )}

                  </button>
                  {/* <p className="" onClick={() => { localStorage.setItem("phoneNumber", number); window.location.reload(); }}>resend</p> */}

                  <button
                    // className="w-[100%] py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none font-medium" type="submit"
                    className={` w-[100%] py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none font-medium${issubmit || verifyotp ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#83FF81] hover:bg-[#83FF81] bg-opacity-80 '
                      }`} disabled={issubmit || verifyotp}
                  >

                    {verifyotp ? (
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
                  <ToastContainer />
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
