import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from "firebase/app-check"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-app.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
}

// Check if Firebase keys are configured with real values
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "your_firebase_api_key" &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
)

let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage
let appCheck: AppCheck | undefined

if (typeof window !== "undefined" || getApps().length === 0) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  // Initialize App Check with reCAPTCHA v3 in client browser
  const recaptchaSiteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_KEY

  if (recaptchaSiteKey && typeof window !== "undefined") {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      })
    } catch (e) {
      console.warn("Firebase App Check initialization:", e)
    }
  }
} else {
  app = getApp()
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

export { app, auth, db, storage, appCheck }


