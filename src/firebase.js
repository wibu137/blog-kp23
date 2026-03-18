// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "blogkp-a7b2b.firebaseapp.com",
  projectId: "blogkp-a7b2b",
  storageBucket: "blogkp-a7b2b.firebasestorage.app",
  messagingSenderId: "556707463998",
  appId: "1:556707463998:web:d492538079579504c0626f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);