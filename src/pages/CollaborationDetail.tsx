import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_COLLABORATIONS_QUERY, RESOLVE_CANCELLATION_REQUEST_MUTATION } from '@/lib/queries'
import type { Collaboration } from '@/lib/types'
import { gqlRequest } from '@/lib/graphql'
import { FullPageSpinner, ErrorState } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { formatCurrency, formatDateTime, titleCase } from '@/lib/utils'
import { ArrowLeft, Check, X } from 'lucide-react'

interface Data {
  getAdminCollaborations: Collaboration[]
}

export function CollaborationDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, refetch } = useAdminQuery<Data>(ADMIN_COLLABORATIONS_QUERY)
  const [adminNote, setAdminNote] = useState('')
  const [resolving, setResolving] = useState(false)

  if (loading) return <FullPageSpinner />
  if (error || !data) return <ErrorState message={error ?? 'Failed to load'} />

  const collaboration = data.getAdminCollaborations.find((c) => c.id === id)
  if (!collaboration) return <ErrorState message="Collaboration not found" />

  const cancellationRequest = collaboration.cancellationRequest

  async function handleResolve(approve: boolean) {
    if (!id) return
    setResolving(true)
    try {
      await gqlRequest(RESOLVE_CANCELLATION_REQUEST_MUTATION, { collaborationId: id, approve, adminNote: adminNote || null })
      refetch()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve request')
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/collaborations" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to collaborations
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{collaboration.campaign?.title ?? 'Untitled campaign'}</h1>
          <p className="text-sm text-muted-foreground">
            {collaboration.brand?.name ?? '—'} × {collaboration.influencer?.name ?? '—'}
          </p>
        </div>
        <StatusBadge status={collaboration.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Amount" value={formatCurrency(collaboration.totalAmount)} />
            <Field label="Payment status" value={collaboration.paymentStatus ?? '—'} />
            <Field label="Initiated by" value={titleCase(collaboration.initiatedBy)} />
            <Field label="Rating" value={collaboration.rating ? collaboration.rating.toFixed(1) : '—'} />
            <Field label="Created" value={formatDateTime(collaboration.createdAt)} />
            <Field label="Last updated" value={formatDateTime(collaboration.updatedAt)} />
            {collaboration.pricing && collaboration.pricing.length > 0 && (
              <div className="col-span-2">
                <div className="mb-1 text-xs text-muted-foreground">Pricing</div>
                <div className="flex flex-col gap-1">
                  {collaboration.pricing.map((p, idx) => (
                    <div key={idx} className="flex justify-between rounded-md bg-muted px-2 py-1 text-xs">
                      <span>
                        {p.platform} · {p.deliverable} {p.count ? `×${p.count}` : ''}
                      </span>
                      <span className="font-medium">
                        {p.currency} {p.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cancellation Request</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {!cancellationRequest ? (
              <p className="text-xs text-muted-foreground">No cancellation has been requested for this collaboration.</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={cancellationRequest.status} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Requested by</div>
                  <div>{titleCase(cancellationRequest.requestedByRole)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Reason</div>
                  <p className="rounded-md bg-muted p-2 text-xs">{cancellationRequest.reason}</p>
                </div>
                <div className="text-xs text-muted-foreground">Requested {formatDateTime(cancellationRequest.requestedAt)}</div>

                {cancellationRequest.status === 'PENDING' ? (
                  <div className="flex flex-col gap-2 border-t border-border pt-3">
                    <Textarea
                      placeholder="Note for the record (optional, shown to both parties)"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleResolve(true)} disabled={resolving}>
                        <Check className="h-3.5 w-3.5" /> Approve — end collaboration
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleResolve(false)} disabled={resolving}>
                        <X className="h-3.5 w-3.5" /> Deny
                      </Button>
                    </div>
                  </div>
                ) : (
                  cancellationRequest.adminNote && (
                    <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">Admin note: {cancellationRequest.adminNote}</p>
                  )
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
