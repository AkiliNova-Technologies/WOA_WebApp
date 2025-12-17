import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDiHSbDH3yKQQbzR0398tvrSFSA_fqnB64",
  authDomain: "world-of-afrika-7008f.firebaseapp.com",
  projectId: "world-of-afrika-7008f",
  storageBucket: "world-of-afrika-7008f.firebasestorage.app",
  messagingSenderId: "109708039433",
  appId: "1:109708039433:web:139aa47b6dd58d37c7afd8",
  measurementId: "G-TSS230LQHQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, auth, db, storage, analytics };
