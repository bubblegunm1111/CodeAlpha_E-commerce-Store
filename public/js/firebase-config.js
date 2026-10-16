// Firebase Client Configuration
// Project: luxury-store-demo-2026

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjR17QqKo_7Tgt2b7FHEqGW_TS3aTARG0",
    authDomain: "luxury-store-demo-2026.firebaseapp.com",
    projectId: "luxury-store-demo-2026",
    storageBucket: "luxury-store-demo-2026.firebasestorage.app",
    messagingSenderId: "853078236825",
    appId: "1:853078236825:web:d28a1824a7d97f7b50a208"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup
};
