import { createContext, useContext, useEffect, useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase";

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState({});

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  async function signUp(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password,);
    // const user = credential.user;
    // await sendEmailVerification(user);
    // return user;
  }

  function logOut() {
    return signOut(auth);
  }
  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  }

  async function setUpRecaptha(number) {
    console.log("working after error");
    var newRecaptchaContainer = document.createElement('div');
    newRecaptchaContainer.id = 'recaptcha-container';
    document.body.appendChild(newRecaptchaContainer);
    
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        'size': 'invisible',
      }
    );
      // Check if the RecaptchaVerifier is already rendered
      if (!recaptchaVerifier.renderPromise) {
        await recaptchaVerifier.render(); // Wait for rendering to complete
      }
      const userdata = await signInWithPhoneNumber(auth, number, recaptchaVerifier);

      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.parentNode.removeChild(recaptchaContainer);
      }

      return userdata;
  }





  // async function setUpRecaptha(number) {


  //   // Create a new RecaptchaVerifier instance
  //   const recaptchaVerifier = new RecaptchaVerifier(
  //     auth,
  //     "recaptcha-container",
  //     {
  //       size: 'invisible',
  //     }
  //   );

  //   // Use the RecaptchaVerifier instance to send OTP
  //   const userdata = signInWithPhoneNumber(auth, number, recaptchaVerifier);
  //   return userdata;
  // }




  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
  //     console.log("Auth", currentuser);
  //     setUser(currentuser);
  //   });


  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // console.log("Auth", user);
      } else {
        setUser(null); // Set the user state to null if the user is not authenticated
      }
    });

    return unsubscribe;
  }, []);



  return (
    <userAuthContext.Provider
      value={{
        user,
        logIn,
        signUp,
        logOut,
        googleSignIn,
        setUpRecaptha,
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

// Custome hook
export function useUserAuth() {
  return useContext(userAuthContext);
}
