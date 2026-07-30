import { GraphQLClient } from 'graphql-request'
import { auth } from './firebase'

const endpoint = import.meta.env.VITE_BACKEND_GRAPHQL_URL || 'http://localhost:5001/graphql'

const client = new GraphQLClient(endpoint)

export class AdminApiError extends Error {}

/**
 * Every admin query/mutation goes through here so the Firebase ID token is
 * always fresh — same auth mechanism the mobile apps use
 * (Authorization: Bearer <idToken>, verified server-side in
 * connect-backend/src/services/authContext.js), just from a browser instead
 * of a phone. requireRole(user, "ADMIN") on the backend is the real gate;
 * there's no separate admin API key.
 */
export async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  // main.tsx never mounts the app unless isFirebaseConfigured is true, so
  // `auth` is guaranteed initialized by the time any query fires.
  const user = auth?.currentUser
  if (!user) throw new AdminApiError('Not signed in')
  const token = await user.getIdToken()
  try {
    return await client.request<T>(query, variables, { Authorization: `Bearer ${token}` })
  } catch (err: unknown) {
    const message = extractGraphQLErrorMessage(err)
    throw new AdminApiError(message)
  }
}

function extractGraphQLErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { errors?: Array<{ message?: string }> } }).response
    const first = response?.errors?.[0]?.message
    if (first) return first
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong talking to the server'
}
