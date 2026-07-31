import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_PAYMENT_RELEASE_REQUESTS_QUERY, RESOLVE_PAYMENT_RELEASE_REQUEST_MUTATION } from '@/lib/queries'
import type { Collaboration } from '@/lib/types'
import { gqlRequest } from '@/lib/graphql'
import { FullPageSpinner, ErrorState, EmptyState } from '@/components/ui/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { formatDateTime } from '@/lib/utils'
import { Check, X } from 'lucide-react'

interface Data {
  getAdminPaymentReleaseRequests: Collaboration[]
}

export function PaymentReleaseRequests() {
  const { data, loading, error, refetch } = useAdminQuery<Data>(ADMIN_PAYMENT_RELEASE_REQUESTS_QUERY, { status: 'PENDING' })

  if (loading) return <FullPageSpinner />
  if (error) return <ErrorState message={error} />

  const requests = data?.getAdminPaymentReleaseRequests ?? []

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Payment Release Requests</h1>
        <p className="text-sm text-muted-foreground">
          The brand already paid into the platform account at confirmation — approving here is what actually releases that
          payment to the influencer and marks the collaboration complete. Denying leaves it in progress.
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState message="No pending payment release requests." />
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((c) => (
            <RequestCard key={c.id} collaboration={c} onResolved={refetch} />
          ))}
        </div>
      )}
    </div>
  )
}

function RequestCard({ collaboration, onResolved }: { collaboration: Collaboration; onResolved: () => void }) {
  const [adminNote, setAdminNote] = useState('')
  const [resolving, setResolving] = useState(false)
  const request = collaboration.paymentReleaseRequest!

  async function resolve(approve: boolean) {
    setResolving(true)
    try {
      await gqlRequest(RESOLVE_PAYMENT_RELEASE_REQUEST_MUTATION, { collaborationId: collaboration.id, approve, adminNote: adminNote || null })
      onResolved()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve request')
      setResolving(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/collaborations/${collaboration.id}`} className="font-medium hover:underline">
              {collaboration.campaign?.title ?? 'Untitled campaign'}
            </Link>
            <div className="text-sm text-muted-foreground">
              {collaboration.brand?.name ?? '—'} × {collaboration.influencer?.name ?? '—'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={collaboration.status} />
            {collaboration.totalAmount != null && (
              <span className="text-xs font-medium text-muted-foreground">₹{collaboration.totalAmount.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">Requested {formatDateTime(request.requestedAt)}</p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Textarea
            placeholder="Note for the record (optional, shown to both parties)"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={1}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button variant="success" size="sm" onClick={() => resolve(true)} disabled={resolving}>
              <Check className="h-3.5 w-3.5" /> Approve &amp; Release
            </Button>
            <Button variant="outline" size="sm" onClick={() => resolve(false)} disabled={resolving}>
              <X className="h-3.5 w-3.5" /> Deny
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
