import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredFirebaseEnv = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

export function getMissingFirebaseEnv() {
  return requiredFirebaseEnv.filter((key) => !process.env[key]);
}

export function getDb() {
  const missingFirebaseEnv = getMissingFirebaseEnv();

  if (missingFirebaseEnv.length > 0) {
    throw new Error(`Firebase environment variables are missing: ${missingFirebaseEnv.join(", ")}`);
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  if (!firestore) {
    firestore = getFirestore(app);
  }

  return firestore;
}
