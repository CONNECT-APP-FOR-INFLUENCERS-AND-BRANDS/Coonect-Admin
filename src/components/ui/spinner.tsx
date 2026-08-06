import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[50vh] w-full flex-col items-center justify-center gap-3 animate-fade-in">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
        <Spinner className="relative h-6 w-6 text-primary" />
      </div>
      <p className="text-xs font-medium text-muted-foreground">Loading…</p>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[30vh] w-full animate-fade-in-up flex-col items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <p className="text-sm font-medium text-destructive">{message}</p>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[20vh] w-full animate-fade-in-up flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
