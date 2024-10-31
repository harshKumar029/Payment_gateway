

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import { useUserAuth } from "../context/UserAuthContext";
import "react-phone-number-input/style.css";

import { collection, doc, getDoc,getDocs, setDoc } from 'firebase/firestore';
import { db } from "../firebase";

const PhoneSignUp = () => {
  const [error, setError] = useState("");
  const [number, setNumber] = useState("");
  const [flag, setFlag] = useState(false);
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState(null); // Ensure result is initially null
  const { setUpRecaptha } = useUserAuth();
  const [userData,setUserData] = useState([])
  const navigate = useNavigate();





  const getOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (number === "" || number === undefined) {
      return setError("Please enter a valid phone number!");
    }

    try {
      const response = await setUpRecaptha(number);
      setResult(response); // Store the response for later verification
      setFlag(true);
    } catch (err) {
     if(err.code === "auth/argument-error"){
      setError("You can try again if you didnt recieved the otp");
     }
      else if(err.code === "auth/invalid-verification-code"){
        setError("Wrong OTP. Please write the correct one...");
      }
      else if(err.code === "auth/id-token-expired	")
      {
        setError("Otp expired...")
      }
      else if(err.code ==="auth/insufficient-permission")
      {
        setError("You dont have enough permission")
      }
      else if(err.code ==="auth/code-expired")
      {
        setError("Code expired. Pls try again later")
      }
      else if(err.code ==="auth/invalid-phone-number")
      {
        setError("!incorrect Phone Number ")
      }
      else{
        setError(err.message)
      }
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || !result) return; // Add a check for result being null
    try {
      const data =await result.confirm(otp); // Use the result to confirm the OTP
      // console.log("result data of phone number",data,result);
      // navigate("/");
    } catch (err) {
      if(err.code === "auth/argument-error"){
        setError("You can try again if you didnt recieved the otp");
       }
        else if(err.code === "auth/invalid-verification-code"){
          setError("Wrong OTP. Please write the correct one...");
        }
        else if(err.code === "auth/id-token-expired	")
        {
          setError("Otp expired...")
        }
        else if(err.code ==="auth/insufficient-permission")
        {
          setError("You dont have enough permission")
        }
        else if(err.code ==="auth/code-expired")
        {
          setError("Code expired. Pls try again later")
        }
        else{
          setError(err.message)
        }
    }
  };







  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-xl p-8 space-y-3 bg-blue-900 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center text-white">Verify Phone Number</h2>
        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
        {!flag ? (
          // Code for entering phone number
          <form onSubmit={getOtp} className="space-y-4">
            <PhoneInput
              international
              defaultCountry="IN"
              value={number}
              onChange={setNumber}
              className="w-full text-gray-700"
            />
            <div id="recaptcha-container"></div>
            <div className="flex justify-between space-x-2">
              <Link to="/" className="w-1/5">
                <button className="w-full py-2 text-sm text-white bg-gray-400 rounded hover:bg-gray-500 focus:outline-none font-medium">
                  Cancel
                </button>
              </Link>
              <button className="w-4/5 py-2 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none font-medium" type="submit">
                Send Otp
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <input
              className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded focus:outline-none"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <div className="flex justify-between space-x-2">
              <Link to="/" className="w-1/5">
                <button className="w-full py-2 text-sm text-white bg-gray-400 rounded hover:bg-gray-500 focus:outline-none font-medium">
                  Cancel
                </button>
              </Link>
              <button className="w-4/5 py-2 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none font-medium" type="submit">
                Verify
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PhoneSignUp;
