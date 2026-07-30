import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { gqlRequest, AdminApiError } from '@/lib/graphql'

// main.tsx never mounts <App /> (and therefore never mounts AuthProvider)
// unless isFirebaseConfigured is true, so `auth` is guaranteed initialized
// by the time any code in this file runs.
const requiredAuth = auth!

interface AuthContextValue {
  user: User | null
  /** true once we've confirmed the signed-in Firebase user actually carries the ADMIN role server-side. */
  isAdmin: boolean
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// There's no client-visible "me { ... on Admin { ... } }" shape (the backend's
// User interface only resolves to Brand/Influencer — ADMIN resolves to null,
// see graphql/modules/common/index.js). So admin-ness is confirmed the same
// way every other admin-only screen will: by successfully calling an
// ADMIN-gated query. If this throws "Only ADMINs can access this", the
// signed-in Firebase account simply isn't an admin in Firestore.
const ADMIN_CHECK_QUERY = /* GraphQL */ `
  query AdminCheck {
    getAdminOverviewStats {
      totalBrands
    }
  }
`

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(requiredAuth, async (firebaseUser) => {
      setError(null)
      if (!firebaseUser) {
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }
      setUser(firebaseUser)
      try {
        await gqlRequest(ADMIN_CHECK_QUERY)
        setIsAdmin(true)
      } catch (err) {
        setIsAdmin(false)
        setError(
          err instanceof AdminApiError && /admin/i.test(err.message)
            ? 'This account is not an admin. Ask an existing admin to grant access.'
            : 'Could not verify admin access — check the backend is reachable.',
        )
        await firebaseSignOut(requiredAuth)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  async function signIn(email: string, password: string) {
    setError(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(requiredAuth, email, password)
      // onAuthStateChanged above does the admin check + setLoading(false)
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? humanizeFirebaseError(err.message) : 'Sign-in failed')
      throw err
    }
  }

  async function signOut() {
    await firebaseSignOut(requiredAuth)
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

function humanizeFirebaseError(message: string): string {
  if (message.includes('invalid-credential') || message.includes('wrong-password') || message.includes('user-not-found')) {
    return 'Incorrect email or password.'
  }
  if (message.includes('too-many-requests')) return 'Too many attempts — try again shortly.'
  return 'Sign-in failed.'
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
