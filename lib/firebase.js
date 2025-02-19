// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlxeLsPP-zQ42nHgLlO-PNaQMmCFHzA0s",
  authDomain: "ai-meal-planner-310bf.firebaseapp.com",
  projectId: "ai-meal-planner-310bf",
  storageBucket: "ai-meal-planner-310bf.firebasestorage.app",
  messagingSenderId: "488703628852",
  appId: "1:488703628852:web:ed74976a0c13065b7a1c61",
  measurementId: "G-SYQ5VM7PGT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);