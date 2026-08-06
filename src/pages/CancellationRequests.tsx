import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_CANCELLATION_REQUESTS_QUERY, RESOLVE_CANCELLATION_REQUEST_MUTATION } from '@/lib/queries'
import type { Collaboration } from '@/lib/types'
import { gqlRequest } from '@/lib/graphql'
import { FullPageSpinner, ErrorState, EmptyState } from '@/components/ui/spinner'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ResolveDialog } from '@/components/ui/resolve-dialog'
import { PageHeader } from '@/components/ui/page-header'
import { formatDate, titleCase } from '@/lib/utils'
import { Ban } from 'lucide-react'

interface Data {
  getAdminCancellationRequests: Collaboration[]
}

export function CancellationRequests() {
  const { data, loading, error, refetch } = useAdminQuery<Data>(ADMIN_CANCELLATION_REQUESTS_QUERY, { status: 'PENDING' })
  const [target, setTarget] = useState<Collaboration | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [resolving, setResolving] = useState(false)
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (error) return <ErrorState message={error} />

  const requests = data?.getAdminCancellationRequests ?? []

  function openAction(c: Collaboration, a: 'approve' | 'reject') {
    setTarget(c)
    setAction(a)
  }

  async function confirm(note: string) {
    if (!target || !action) return
    setResolving(true)
    try {
      await gqlRequest(RESOLVE_CANCELLATION_REQUEST_MUTATION, {
        collaborationId: target.id,
        approve: action === 'approve',
        adminNote: note || null,
      })
      setAction(null)
      setTarget(null)
      refetch()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve request')
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Ban}
        title="Cancellation Requests"
        description="Once a collaboration is accepted, neither party can end it directly — they can only ask here. Approving ends the collaboration; denying leaves it running."
      />

      {requests.length === 0 ? (
        <EmptyState message="No pending cancellation requests." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Campaign</TH>
              <TH>Brand</TH>
              <TH>Influencer</TH>
              <TH>Requested by</TH>
              <TH>Reason</TH>
              <TH>Requested</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {requests.map((c) => (
              <TR key={c.id}>
                <TD className="font-semibold">
                  <Link to={`/collaborations/${c.id}`} state={{ backgroundLocation: location }} className="hover:underline">
                    {c.campaign?.title ?? 'Untitled campaign'}
                  </Link>
                </TD>
                <TD>{c.brand?.name ?? '—'}</TD>
                <TD>{c.influencer?.name ?? '—'}</TD>
                <TD>
                  <Badge tone="neutral">{titleCase(c.cancellationRequest?.requestedByRole) || '—'}</Badge>
                </TD>
                <TD className="max-w-xs text-[13px]">{c.cancellationRequest?.reason}</TD>
                <TD className="text-muted-foreground">{formatDate(c.cancellationRequest?.requestedAt)}</TD>
                <TD>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => openAction(c, 'reject')}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => openAction(c, 'approve')}>
                      Approve
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <ResolveDialog
        action={action}
        busy={resolving}
        onClose={() => {
          setAction(null)
          setTarget(null)
        }}
        onConfirm={confirm}
        approveLabel="Approve — end collaboration"
        rejectLabel="Deny"
      />
    </div>
  )
}
