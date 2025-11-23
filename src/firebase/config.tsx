// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsBUajDCgVVnB6KXFWPt7sajjvJS2bze8",
  authDomain: "esss-68f5c.firebaseapp.com",
  projectId: "esss-68f5c",
  storageBucket: "esss-68f5c.firebasestorage.app",
  messagingSenderId: "255151933416",
  appId: "1:255151933416:web:cefe2cb4526ad45e29065d",
  measurementId: "G-V49LEMN6TX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize analytics only when running in a DOM-enabled environment (web)
let analytics: any = null;
try {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // dynamic import to avoid loading web-only code on native
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getAnalytics } = require('firebase/analytics');
    analytics = getAnalytics(app);
  }
} catch (e) {
  // Analytics not available (e.g., running in React Native). Ignore silently.
}

// Exports used across the app (auth, firestore, storage)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };

export default app;