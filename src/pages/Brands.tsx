import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_BRANDS_QUERY } from '@/lib/queries'
import type { Brand } from '@/lib/types'
import { FullPageSpinner, ErrorState, EmptyState } from '@/components/ui/spinner'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Search } from 'lucide-react'

interface Data {
  getBrands: Brand[]
}

export function Brands() {
  const { data, loading, error } = useAdminQuery<Data>(ADMIN_BRANDS_QUERY)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const brands = data?.getBrands ?? []
    if (!query.trim()) return brands
    const q = query.toLowerCase()
    return brands.filter((b) => b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q))
  }, [data, query])

  if (loading) return <FullPageSpinner />
  if (error) return <ErrorState message={error} />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Brands</h1>
          <p className="text-sm text-muted-foreground">{data?.getBrands.length ?? 0} total brands</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search brands…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No brands found." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Brand</TH>
              <TH>Industry</TH>
              <TH>Tier</TH>
              <TH>Collaborations</TH>
              <TH>Avg ROI</TH>
              <TH>Rating</TH>
              <TH>Verification</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((b) => (
              <TR key={b.id} className="cursor-pointer hover:bg-muted/50">
                <TD>
                  <Link to={`/brands/${b.id}`} className="flex items-center gap-2 font-medium hover:underline">
                    {b.isVerified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    <span>{b.name}</span>
                  </Link>
                  <div className="text-xs text-muted-foreground">{b.email}</div>
                </TD>
                <TD>{b.industry ?? '—'}</TD>
                <TD>
                  <Badge tone="accent">{b.tier ?? '—'}</Badge>
                </TD>
                <TD>{b.totalCollaborations ?? 0}</TD>
                <TD>{(b.avgROI ?? 0).toFixed(2)}x</TD>
                <TD>{b.averageRating ? b.averageRating.toFixed(1) : '—'}</TD>
                <TD>
                  {b.verificationRequest ? (
                    <Badge tone={b.verificationRequest.status === 'APPROVED' ? 'success' : b.verificationRequest.status === 'REJECTED' ? 'destructive' : 'warning'}>
                      {b.verificationRequest.status}
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Not submitted</Badge>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
