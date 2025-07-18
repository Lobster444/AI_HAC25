import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCzdBzIBhYXlW-MHnSc8Bqmr5ciUErt4qE",
  authDomain: "ai-h25-ss.firebaseapp.com",
  projectId: "ai-h25-ss",
  storageBucket: "ai-h25-ss.firebasestorage.app",
  messagingSenderId: "641309533414",
  appId: "1:641309533414:web:0652a459a4f375b1578727"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;