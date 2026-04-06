import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCTEkw4mWFH9UC-BrjTDJcMON5evZ855DU",
  authDomain: "solarmark-1011.firebaseapp.com",
  projectId: "solarmark-1011",
  storageBucket: "solarmark-1011.firebasestorage.app",
  messagingSenderId: "1032973726464",
  appId: "1:1032973726464:web:517777a0ab7652b2c5b9e5",
  measurementId: "G-7VHB4FNJE9"
};

const app = initializeApp(firebaseConfig);

// Initialize Analytics ONLY in browser environment
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export const storage = getStorage(app);
export { analytics };
