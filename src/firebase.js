// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "blog-kp23.firebaseapp.com",
  projectId: "blog-kp23",
  storageBucket: "blog-kp23.firebasestorage.app",
  messagingSenderId: "914158007428",
  appId: "1:914158007428:web:4f1e1450b460ef6c0afed1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);