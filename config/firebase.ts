import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// config/firebase.ts


// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCt4Un7Ov8m88ZiO8-KQv2wIqki2tegoP0",
  authDomain: "hackfusion-5b9c7.firebaseapp.com",
  projectId: "hackfusion-5b9c7",
  storageBucket: "hackfusion-5b9c7.firebasestorage.app",
  messagingSenderId: "948467583322",
  appId: "1:948467583322:web:523d9ac7bc49515f504b63",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
