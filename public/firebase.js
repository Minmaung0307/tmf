import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyD_lTHAXd8ieXS7cHe90AkC6qqX4_yqzxo",
  authDomain: "tmf-mm.firebaseapp.com",
  projectId: "tmf-mm",
  storageBucket: "tmf-mm.firebasestorage.app",
  messagingSenderId: "740239961057",
  appId: "1:740239961057:web:97995646b335a0f55980a0",
  measurementId: "G-GGHRF901LY"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
