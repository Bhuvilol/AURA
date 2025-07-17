import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9AG9vihIqKTVvw3EJBLxRK_MMShtXpDQ",
  authDomain: "aura-4a954.firebaseapp.com",
  projectId: "aura-4a954",
  storageBucket: "aura-4a954.firebasestorage.app",
  messagingSenderId: "495028135036",
  appId: "1:495028135036:web:1cdc67cf8d8c783d1b55f9"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { firebaseApp, auth, db }; 