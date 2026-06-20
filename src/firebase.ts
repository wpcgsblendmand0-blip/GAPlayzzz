import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHx6QiNIzQRbx--yzd8V3kE2LPEbGdr3Q",
  authDomain: "gaplayzzz.firebaseapp.com",
  projectId: "gaplayzzz",
  storageBucket: "gaplayzzz.firebasestorage.app",
  messagingSenderId: "309647530411",
  appId: "1:309647530411:web:af4a2f72b3fd5281395aee",
  measurementId: "G-2DTBM3DFHC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
