// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAW-wdYsyyXyqc15UTxNoRRrNC-DoDO8_U",
  authDomain: "cellestialai.firebaseapp.com",
  projectId: "cellestialai",
  storageBucket: "cellestialai.firebasestorage.app",
  messagingSenderId: "86129099935",
  appId: "1:86129099935:web:3048404407a057964aceaa",
  measurementId: "G-J7DX434V9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

