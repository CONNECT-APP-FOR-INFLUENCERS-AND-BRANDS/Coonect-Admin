import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_BRAND_VERIFICATION_REQUESTS_QUERY, REVIEW_BRAND_VERIFICATION_MUTATION } from '@/lib/queries'
import type { Brand } from '@/lib/types'
import { gqlRequest } from '@/lib/graphql'
import { FullPageSpinner, ErrorState, EmptyState } from '@/components/ui/spinner'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ResolveDialog } from '@/components/ui/resolve-dialog'
import { PageHeader } from '@/components/ui/page-header'
import { formatDate } from '@/lib/utils'
import { ExternalLink, ShieldCheck } from 'lucide-react'

interface Data {
  getAdminBrandVerificationRequests: Brand[]
}

export function VerificationRequests() {
  const { data, loading, error, refetch } = useAdminQuery<Data>(ADMIN_BRAND_VERIFICATION_REQUESTS_QUERY, { status: 'PENDING' })
  const [target, setTarget] = useState<Brand | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [resolving, setResolving] = useState(false)
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (error) return <ErrorState message={error} />

  const requests = data?.getAdminBrandVerificationRequests ?? []

  function openAction(b: Brand, a: 'approve' | 'reject') {
    setTarget(b)
    setAction(a)
  }

  async function confirm(note: string) {
    if (!target || !action) return
    setResolving(true)
    try {
      await gqlRequest(REVIEW_BRAND_VERIFICATION_MUTATION, {
        brandId: target.id,
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
        icon={ShieldCheck}
        title="Verification Requests"
        description="Review a brand's submitted GST/business-registration document. Approving grants the verified badge shown to influencers."
      />

      {requests.length === 0 ? (
        <EmptyState message="No pending verification requests." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Brand</TH>
              <TH>Method</TH>
              <TH>GST number</TH>
              <TH>Document</TH>
              <TH>Submitted</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {requests.map((b) => (
              <TR key={b.id}>
                <TD className="font-semibold">
                  <Link to={`/brands/${b.id}`} state={{ backgroundLocation: location }} className="hover:underline">
                    {b.name}
                  </Link>
                  <div className="text-xs font-normal text-muted-foreground">{b.email}</div>
                </TD>
                <TD>{b.verificationRequest?.method.replaceAll('_', ' ')}</TD>
                <TD className="font-mono text-[13px]">{b.verificationRequest?.gstNumber ?? '—'}</TD>
                <TD>
                  {b.verificationRequest?.documentUrl ? (
                    <a
                      href={b.verificationRequest.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    '—'
                  )}
                </TD>
                <TD className="text-muted-foreground">{formatDate(b.verificationRequest?.submittedAt)}</TD>
                <TD>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => openAction(b, 'reject')}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => openAction(b, 'approve')}>
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
        approveLabel="Approve"
        rejectLabel="Reject"
      />
    </div>
  )
}
