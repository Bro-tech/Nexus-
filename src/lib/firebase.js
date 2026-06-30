import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// IMPORTANT: Replace these dummy keys with your actual Firebase config keys
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyReplaceMe1234567890",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Providers for Social Logins
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { 
  auth, 
  db, 
  googleProvider, 
  appleProvider,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
  doc, 
  setDoc
};
