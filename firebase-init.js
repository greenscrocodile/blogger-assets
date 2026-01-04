// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, addDoc, getDoc, updateDoc, query, orderBy, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBiXi038rAPSTkegDTyVV-HDd507Z0WmJk",
    authDomain: "teluguanimedatabase-6912e.firebaseapp.com",
    projectId: "teluguanimedatabase-6912e",
    storageBucket: "teluguanimedatabase-6912e.firebasestorage.app",
    messagingSenderId: "292606087656",
    appId: "1:292606087656:web:b2b7b82a388355a41b145d",
    measurementId: "G-TPJ7T48NWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Make db and functions globally available
window.db = db;
window.collection = collection;
window.getDocs = getDocs;
window.doc = doc;
window.setDoc = setDoc;
window.deleteDoc = deleteDoc;
window.addDoc = addDoc;
window.getDoc = getDoc;
window.updateDoc = updateDoc;
window.query = query;
window.orderBy = orderBy;
window.serverTimestamp = serverTimestamp;
window.increment = increment;

// Auth Globals
window.auth = auth;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;

window.firebaseLoaded = true;

console.log("Firebase initialized successfully");
