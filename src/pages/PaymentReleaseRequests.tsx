import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_PAYMENT_RELEASE_REQUESTS_QUERY, RESOLVE_PAYMENT_RELEASE_REQUEST_MUTATION } from '@/lib/queries'
import type { Collaboration } from '@/lib/types'
import { gqlRequest } from '@/lib/graphql'
import { FullPageSpinner, ErrorState, EmptyState } from '@/components/ui/spinner'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ResolveDialog } from '@/components/ui/resolve-dialog'
import { PageHeader } from '@/components/ui/page-header'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Banknote } from 'lucide-react'

interface Data {
  getAdminPaymentReleaseRequests: Collaboration[]
}

export function PaymentReleaseRequests() {
  const { data, loading, error, refetch } = useAdminQuery<Data>(ADMIN_PAYMENT_RELEASE_REQUESTS_QUERY, { status: 'PENDING' })
  const [target, setTarget] = useState<Collaboration | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [resolving, setResolving] = useState(false)
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (error) return <ErrorState message={error} />

  const requests = data?.getAdminPaymentReleaseRequests ?? []

  function openAction(c: Collaboration, a: 'approve' | 'reject') {
    setTarget(c)
    setAction(a)
  }

  async function confirm(note: string) {
    if (!target || !action) return
    setResolving(true)
    try {
      await gqlRequest(RESOLVE_PAYMENT_RELEASE_REQUEST_MUTATION, {
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
        icon={Banknote}
        title="Payment Release Requests"
        description="The brand already paid into the platform account at confirmation — approving here is what actually releases that payment to the influencer and marks the collaboration complete. Denying leaves it in progress."
      />

      {requests.length === 0 ? (
        <EmptyState message="No pending payment release requests." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Campaign</TH>
              <TH>Brand</TH>
              <TH>Influencer</TH>
              <TH>Amount</TH>
              <TH>Requested by</TH>
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
                <TD>{formatCurrency(c.totalAmount)}</TD>
                <TD>
                  <Badge tone="neutral">{c.paymentReleaseRequest?.requestedBy === c.brandId ? 'Brand' : 'Influencer'}</Badge>
                </TD>
                <TD className="text-muted-foreground">{formatDate(c.paymentReleaseRequest?.requestedAt)}</TD>
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
        approveLabel="Approve & Release"
        rejectLabel="Deny"
      />
    </div>
  )
}
