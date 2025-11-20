import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import type { Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validate configuration (client-side only)
if (typeof window !== "undefined") {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    console.error('❌ Firebase configuration is incomplete. Please copy frontend/.env.local.example to frontend/.env.local and fill the NEXT_PUBLIC_FIREBASE_* values from the Firebase console.')
  }
}

let authInstance: Auth | null = null

// Only initialize Firebase in the browser. Avoids SSR/server-side initialization which
// can cause runtime errors (and prevents exposing client SDK behavior on the server).
if (typeof window !== "undefined") {
  // Only attempt initialization when the minimal required config is present
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    authInstance = getAuth(app)
  } else {
    // Keep authInstance null; components should handle unauthenticated state gracefully.
    authInstance = null
  }
}

export const auth = authInstance