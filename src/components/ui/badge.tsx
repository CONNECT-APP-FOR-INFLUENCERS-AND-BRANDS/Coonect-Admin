import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'success' | 'warning' | 'destructive' | 'accent'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  accent: 'bg-accent text-accent-foreground',
}

export function Badge({ className, tone = 'neutral', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}

const STATUS_TONE: Record<string, Tone> = {
  APPROVED: 'success',
  DENIED: 'destructive',
  REJECTED_VERIFICATION: 'destructive',
}

// Collaboration-status colors, per spec: waiting for payment = red, in progress = yellow,
// completed = green, brief sent = purple, revoked = black (bold), cancelled = dark red,
// pending = brown, negotiation = light orange. Solid tokens (no opacity/dark-mode math) so
// contrast stays correct — this app only ships a light theme.
const COLLAB_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-status-pending text-status-pending-foreground',
  NEGOTIATION: 'bg-status-negotiation text-status-negotiation-foreground',
  ACCEPTED: 'bg-accent text-accent-foreground',
  BRIEF_SENT: 'bg-status-brief-sent text-status-brief-sent-foreground',
  BRIEF_FINALIZED: 'bg-accent text-accent-foreground',
  SCRIPT_SENT: 'bg-accent text-accent-foreground',
  WAITING_FOR_PAYMENT: 'bg-status-waiting-payment text-status-waiting-payment-foreground',
  IN_PROGRESS: 'bg-status-in-progress text-status-in-progress-foreground',
  COMPLETED: 'bg-status-completed text-status-completed-foreground',
  REJECTED: 'bg-destructive/10 text-destructive',
  REVOKED: 'bg-status-revoked text-status-revoked-foreground font-bold',
  CANCELLED: 'bg-status-cancelled text-status-cancelled-foreground',
}

export function StatusBadge({ status }: { status: string }) {
  const collabStyle = COLLAB_STATUS_STYLES[status]
  if (collabStyle) {
    return (
      <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold', collabStyle)}>
        {status.replaceAll('_', ' ')}
      </span>
    )
  }
  return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{status.replaceAll('_', ' ')}</Badge>
}
