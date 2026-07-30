import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

// Same Firebase *project* the backend's FIREBASE_SERVICE_ACCOUNT points at and
// the mobile apps use — this only needs the public web-app config (apiKey,
// authDomain, etc.), not a service account. Get it from Firebase Console →
// Project Settings → General → Your apps → Web app (add one if none exists
// yet; it's free and doesn't require a new project).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
)

// getAuth() throws synchronously on a malformed/missing apiKey — only touch
// Firebase at all once we know the .env is actually filled in, so a missing
// config shows a clear setup screen (see main.tsx) instead of a blank crashed
// page with a cryptic "auth/invalid-api-key" stack trace.
let firebaseApp: FirebaseApp | undefined
let auth: Auth | undefined
if (isFirebaseConfigured) {
  firebaseApp = initializeApp(firebaseConfig)
  auth = getAuth(firebaseApp)
}

export { firebaseApp, auth }
