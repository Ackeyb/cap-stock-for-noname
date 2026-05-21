import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const envPairs = {
  apiKey: ["NEXT_PUBLIC_FIREBASE_API_KEY", "FIREBASE_API_KEY"],
  authDomain: ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "FIREBASE_AUTH_DOMAIN"],
  projectId: ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", "FIREBASE_PROJECT_ID"],
  storageBucket: ["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: ["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "FIREBASE_MESSAGING_SENDER_ID"],
  appId: ["NEXT_PUBLIC_FIREBASE_APP_ID", "FIREBASE_APP_ID"],
} as const;

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

function readEnv([publicKey, serverKey]: readonly [string, string]) {
  return process.env[publicKey] || process.env[serverKey];
}

export function getMissingFirebaseEnv() {
  return Object.values(envPairs)
    .filter((keys) => !readEnv(keys))
    .map((keys) => keys.join(" or "));
}

export function getDb() {
  const missingFirebaseEnv = getMissingFirebaseEnv();

  if (missingFirebaseEnv.length > 0) {
    throw new Error(`Firebase environment variables are missing: ${missingFirebaseEnv.join(", ")}`);
  }

  if (!app) {
    app = initializeApp({
      apiKey: readEnv(envPairs.apiKey),
      authDomain: readEnv(envPairs.authDomain),
      projectId: readEnv(envPairs.projectId),
      storageBucket: readEnv(envPairs.storageBucket),
      messagingSenderId: readEnv(envPairs.messagingSenderId),
      appId: readEnv(envPairs.appId),
    });
  }

  if (!firestore) {
    firestore = getFirestore(app);
  }

  return firestore;
}
