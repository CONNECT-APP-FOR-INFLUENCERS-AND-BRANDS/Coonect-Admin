import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
      <Spinner className="h-6 w-6 text-muted-foreground" />
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[30vh] w-full flex-col items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <p className="text-sm font-medium text-destructive">{message}</p>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[20vh] w-full items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
