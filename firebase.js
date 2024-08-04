// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCI0kJx6Wuwn4Bs8PhG7wRiL6b5yAqxP9c",
  authDomain: "pantry-management-81193.firebaseapp.com",
  projectId: "pantry-management-81193",
  storageBucket: "pantry-management-81193.appspot.com",
  messagingSenderId: "28108177516",
  appId: "1:28108177516:web:1a2330ef1388f5232e1849",
  measurementId: "G-XDLW6R7MVG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { firestore, storage };