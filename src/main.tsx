import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { isFirebaseConfigured } from './lib/firebase.ts'

function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-sm shadow-sm">
        <h1 className="mb-2 text-base font-semibold">Setup required</h1>
        <p className="mb-3 text-muted-foreground">
          Connect Admin needs a Firebase Web App config before it can start. Copy <code className="rounded bg-muted px-1">.env.example</code>{' '}
          to <code className="rounded bg-muted px-1">.env</code> and fill in the <code className="rounded bg-muted px-1">VITE_FIREBASE_*</code>{' '}
          values from Firebase Console → Project Settings → General → Your apps → Web app (same Firebase project the backend and mobile apps
          already use — add a Web app there if none exists yet).
        </p>
        <p className="text-muted-foreground">Then restart the dev server.</p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isFirebaseConfigured ? <App /> : <SetupRequired />}</StrictMode>,
)
