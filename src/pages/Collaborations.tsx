import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_COLLABORATIONS_QUERY } from '@/lib/queries'
import type { Collaboration, CollaborationStatus } from '@/lib/types'
import { FullPageSpinner, ErrorState, EmptyState } from '@/components/ui/spinner'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/badge'
import { Select, Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Handshake, Search } from 'lucide-react'

interface Data {
  getAdminCollaborations: Collaboration[]
}

const STATUS_OPTIONS: (CollaborationStatus | 'ALL')[] = [
  'ALL', 'PENDING', 'NEGOTIATION', 'ACCEPTED', 'BRIEF_SENT', 'BRIEF_FINALIZED', 'SCRIPT_SENT',
  'WAITING_FOR_PAYMENT', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'REVOKED', 'CANCELLED',
]

export function Collaborations() {
  const { data, loading, error } = useAdminQuery<Data>(ADMIN_COLLABORATIONS_QUERY)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<string>('ALL')
  const location = useLocation()

  const filtered = useMemo(() => {
    let list = data?.getAdminCollaborations ?? []
    if (status !== 'ALL') list = list.filter((c) => c.status === status)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((c) => c.brand?.name.toLowerCase().includes(q) || c.influencer?.name.toLowerCase().includes(q) || c.campaign?.title.toLowerCase().includes(q))
    }
    return list
  }, [data, query, status])

  if (loading) return <FullPageSpinner />
  if (error) return <ErrorState message={error} />

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Handshake}
        title="Collaborations"
        description={`${data?.getAdminCollaborations.length ?? 0} total`}
        actions={
          <>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All statuses' : s.replaceAll('_', ' ')}
                </option>
              ))}
            </Select>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
            </div>
          </>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState message="No collaborations match this filter." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Campaign</TH>
              <TH>Influencer</TH>
              <TH>Status</TH>
              <TH>Amount</TH>
              <TH>Updated</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((c) => (
              <TR key={c.id}>
                <TD>
                  <Link to={`/collaborations/${c.id}`} state={{ backgroundLocation: location }} className="font-semibold hover:underline">
                    {c.campaign?.title ?? 'Untitled campaign'}
                  </Link>
                  <div className="mt-0.5 text-xs text-muted-foreground">{c.brand?.name ?? '—'}</div>
                  {c.cancellationRequest?.status === 'PENDING' && (
                    <div className="mt-0.5 text-xs font-medium text-warning">Cancellation pending review</div>
                  )}
                </TD>
                <TD>{c.influencer?.name ?? '—'}</TD>
                <TD>
                  <StatusBadge status={c.status} />
                </TD>
                <TD>{formatCurrency(c.totalAmount)}</TD>
                <TD className="text-muted-foreground">{formatDate(c.updatedAt)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
