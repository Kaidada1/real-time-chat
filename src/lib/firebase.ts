import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBYVDVesXr0djbjZlGyk9qhoN2zTuPe0s0",
  authDomain: "rtchat-6e8dd.firebaseapp.com",
  projectId: "rtchat-6e8dd",
  storageBucket: "rtchat-6e8dd.firebasestorage.app",
  messagingSenderId: "250264876229",
  appId: "1:250264876229:web:a0a3ad9aa5948ed93bacac"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
export const storage = getStorage();