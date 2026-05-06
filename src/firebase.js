import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAgJMhrgUbSmqp4bkbImHtis8pgual60v4",
  authDomain: "luxwear-49a2f.firebaseapp.com",
  projectId: "luxwear-49a2f",
  storageBucket: "luxwear-49a2f.firebasestorage.app",
  messagingSenderId: "708402619509",
  appId: "1:708402619509:web:f2c62bbf71b13deccd843c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
