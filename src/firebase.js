import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyDuSJH6NBSjFmZXYJ_2-hJ_ScpmU6t6yB8",
  authDomain: "daresni-c9b13.firebaseapp.com",
  projectId: "daresni-c9b13",
  storageBucket: "daresni-c9b13.appspot.com",
  messagingSenderId: "731954028532",
  appId: "1:731954028532:web:c9d818aebf6550e8e2e3a1",
  measurementId: "G-V0DL2SLXQF"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage};
