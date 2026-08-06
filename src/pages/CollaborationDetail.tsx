import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_COLLABORATIONS_QUERY, RESOLVE_CANCELLATION_REQUEST_MUTATION } from '@/lib/queries'
import type { Collaboration } from '@/lib/types'
import { gqlRequest } from '@/lib/graphql'
import { FullPageSpinner, ErrorState } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/input'
import { formatCurrency, formatDateTime, titleCase } from '@/lib/utils'
import { ArrowLeft, Check, X } from 'lucide-react'

interface Data {
  getAdminCollaborations: Collaboration[]
}

export function CollaborationDetail({ asModal = false }: { asModal?: boolean }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useAdminQuery<Data>(ADMIN_COLLABORATIONS_QUERY)

  const close = () => navigate(-1)

  const collaboration = data?.getAdminCollaborations.find((c) => c.id === id)

  const body = loading ? (
    <FullPageSpinner />
  ) : error || !data ? (
    <ErrorState message={error ?? 'Failed to load'} />
  ) : !collaboration ? (
    <ErrorState message="Collaboration not found" />
  ) : (
    <CollaborationCard collaboration={collaboration} onResolved={refetch} onClose={close} />
  )

  if (asModal) {
    return (
      <Dialog open onClose={close} className="max-w-[600px] p-7">
        {body}
      </Dialog>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/collaborations"
        className="flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to collaborations
      </Link>
      <div className="mx-auto w-full max-w-[600px]">{body}</div>
    </div>
  )
}

function CollaborationCard({
  collaboration,
  onResolved,
  onClose,
}: {
  collaboration: Collaboration
  onResolved: () => void
  onClose: () => void
}) {
  const [adminNote, setAdminNote] = useState('')
  const [resolving, setResolving] = useState(false)
  const cancellationRequest = collaboration.cancellationRequest

  async function handleResolve(approve: boolean) {
    setResolving(true)
    try {
      await gqlRequest(RESOLVE_CANCELLATION_REQUEST_MUTATION, { collaborationId: collaboration.id, approve, adminNote: adminNote || null })
      onResolved()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve request')
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[19px] font-bold">{collaboration.campaign?.title ?? 'Untitled campaign'}</div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {collaboration.brand?.name ?? '—'} &nbsp;↔&nbsp; {collaboration.influencer?.name ?? '—'}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={collaboration.status} />
        </div>
      </div>

      <div className="h-px bg-border" />

      {collaboration.pricing && collaboration.pricing.length > 0 && (
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Pricing</div>
          <div className="overflow-hidden rounded-xl bg-muted">
            <div className="flex px-3.5 py-2 text-[11px] font-semibold text-muted-foreground">
              <div className="flex-[1.3]">Platform</div>
              <div className="flex-[1.3]">Deliverable</div>
              <div className="flex-[0.8]">Count</div>
              <div className="flex-1">Price</div>
            </div>
            {collaboration.pricing.map((p, idx) => (
              <div key={idx} className="flex bg-card px-3.5 py-2 text-[13px]">
                <div className="flex-[1.3]">{p.platform}</div>
                <div className="flex-[1.3]">{p.deliverable}</div>
                <div className="flex-[0.8]">{p.count ?? '—'}</div>
                <div className="flex-1">
                  {p.currency} {p.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {collaboration.message && (
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Brief message</div>
          <p className="text-[13.5px] leading-relaxed">{collaboration.message}</p>
        </div>
      )}

      <div className="h-px bg-border" />

      <div className="grid grid-cols-4 gap-3 text-[13px]">
        <Stat label="Total amount" value={formatCurrency(collaboration.totalAmount)} />
        <Stat label="Payment status" value={collaboration.paymentStatus ?? '—'} />
        <Stat label="Initiated by" value={titleCase(collaboration.initiatedBy)} />
        <Stat label="Updated" value={formatDateTime(collaboration.updatedAt)} />
      </div>

      {cancellationRequest && (
        <>
          <div className="h-px bg-border" />
          <div className="rounded-2xl bg-warning/10 p-3.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12.5px] font-bold">Cancellation request</span>
              <StatusBadge status={cancellationRequest.status} />
            </div>
            <p className="mb-2.5 text-[12.5px] text-foreground/80">
              Requested by {titleCase(cancellationRequest.requestedByRole)} — {cancellationRequest.reason}
            </p>
            {cancellationRequest.status === 'PENDING' ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Note for the record (optional, shown to both parties)"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={1}
                  className="bg-card"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResolve(false)} disabled={resolving}>
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => handleResolve(true)} disabled={resolving}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                </div>
              </div>
            ) : (
              cancellationRequest.adminNote && <p className="text-xs text-muted-foreground">Admin note: {cancellationRequest.adminNote}</p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-0.5 text-[11px] text-muted-foreground">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  )
}
