// firebase-config.js
// Replace the following configuration object with your actual Firebase project
// settings from the Firebase console. See https://firebase.google.com/docs/web/setup
// for details on how to obtain these values.

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore and Auth services. These are used in auth.js and other
// scripts to access your Firestore database and authentication features.
const db = firebase.firestore();
const auth = firebase.auth();