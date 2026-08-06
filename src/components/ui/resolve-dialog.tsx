import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ResolveDialogProps {
  action: 'approve' | 'reject' | null
  onClose: () => void
  onConfirm: (note: string) => void
  busy: boolean
  approveLabel?: string
  rejectLabel?: string
}

export function ResolveDialog({ action, onClose, onConfirm, busy, approveLabel = 'Approve', rejectLabel = 'Reject' }: ResolveDialogProps) {
  const [note, setNote] = useState('')

  useEffect(() => {
    if (action) setNote('')
  }, [action])

  return (
    <Dialog open={!!action} onClose={onClose} title={action === 'approve' ? approveLabel : rejectLabel}>
      <div className="flex flex-col gap-3">
        <Textarea
          placeholder="Note for the record (optional, shown to both parties)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant={action === 'approve' ? 'default' : 'destructive'} size="sm" onClick={() => onConfirm(note)} disabled={busy}>
            {action === 'approve' ? approveLabel : rejectLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
