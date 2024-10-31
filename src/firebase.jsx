// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDR851XX19Gc3umS5M6Jpi60s6UweYvqV0",
//   authDomain: "otpauthentication-f0e1e.firebaseapp.com",
//   projectId: "otpauthentication-f0e1e",
//   storageBucket: "otpauthentication-f0e1e.appspot.com",
//   messagingSenderId: "709044645405",
//   appId: "1:709044645405:web:17a44b356cce3d7234a0f4",
//   measurementId: "G-7JLDE3RZ5P"
// };

const firebaseConfig = {
  apiKey: "AIzaSyCq-atewAgrTtI2UOYAWIOuCm1p3Eertf8",
  authDomain: "reduxpay-fa116.firebaseapp.com",
  projectId: "reduxpay-fa116",
  storageBucket: "reduxpay-fa116.appspot.com",
  messagingSenderId: "669412000166",
  appId: "1:669412000166:web:8ae1ab28271099a69c4f67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;