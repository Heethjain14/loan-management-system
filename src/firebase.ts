// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7DiT_gyeH5mVN48tTdi06rDtFsFCrYAs",
  authDomain: "loan-management-8cf3a.firebaseapp.com",
  databaseURL: "https://loan-management-8cf3a-default-rtdb.firebaseio.com",
  projectId: "loan-management-8cf3a",
  storageBucket: "loan-management-8cf3a.firebasestorage.app",
  messagingSenderId: "303210128200",
  appId: "1:303210128200:web:8dc371cf891e8c938ac97d",
  measurementId: "G-M093G17X4X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };