import { useState, type FormEvent } from 'react'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export function Login() {
  const { signIn, error, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await signIn(email, password)
    } catch {
      // error is surfaced via useAuth().error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-[400px] animate-fade-in-up rounded-2xl bg-card p-10 text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-[22px] font-bold">Connect Admin</h1>
        <p className="mb-7 mt-2 text-sm text-muted-foreground">Restricted to platform administrators only.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Email</label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus placeholder="you@connect.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Password</label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="animate-fade-in text-xs font-medium text-destructive">{error}</p>}
          <Button type="submit" disabled={submitting || loading} className="mt-2.5 h-11.5 w-full">
            {(submitting || loading) && <Spinner className="h-4 w-4" />}
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
