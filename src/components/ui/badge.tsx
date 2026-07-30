import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'success' | 'warning' | 'destructive' | 'accent'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/15 text-destructive',
  accent: 'bg-accent text-accent-foreground',
}

export function Badge({ className, tone = 'neutral', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', toneClasses[tone], className)}
      {...props}
    />
  )
}

const STATUS_TONE: Record<string, Tone> = {
  PENDING: 'warning',
  NEGOTIATION: 'warning',
  ACCEPTED: 'accent',
  BRIEF_SENT: 'accent',
  BRIEF_FINALIZED: 'accent',
  SCRIPT_SENT: 'accent',
  WAITING_FOR_PAYMENT: 'warning',
  IN_PROGRESS: 'accent',
  COMPLETED: 'success',
  REJECTED: 'destructive',
  REVOKED: 'destructive',
  CANCELLED: 'destructive',
  APPROVED: 'success',
  DENIED: 'destructive',
  REJECTED_VERIFICATION: 'destructive',
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{status.replaceAll('_', ' ')}</Badge>
}
