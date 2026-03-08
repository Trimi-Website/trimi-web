import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0wWR5A5IUpNKGeMgldv69M7G1iUAPH8M",
  authDomain: "trimi-web.firebaseapp.com",
  projectId: "trimi-web",
  storageBucket: "trimi-web.firebasestorage.app",
  messagingSenderId: "358515365601",
  appId: "1:358515365601:web:1a1b002edc3295760f49a0",
  measurementId: "G-1E2Z9F8JFY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);