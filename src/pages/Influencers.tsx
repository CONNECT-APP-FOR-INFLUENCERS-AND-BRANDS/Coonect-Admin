import { useMemo, useState } from 'react'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_INFLUENCERS_QUERY, DELETE_INFLUENCER_MUTATION } from '@/lib/queries'
import type { Influencer } from '@/lib/types'
import { gqlRequest } from '@/lib/graphql'
import { FullPageSpinner, ErrorState, EmptyState } from '@/components/ui/spinner'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Search, Trash2 } from 'lucide-react'

interface Data {
  getInfluencers: Influencer[]
}

export function Influencers() {
  const { data, loading, error, refetch } = useAdminQuery<Data>(ADMIN_INFLUENCERS_QUERY)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const influencers = data?.getInfluencers ?? []
    if (!query.trim()) return influencers
    const q = query.toLowerCase()
    return influencers.filter((i) => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q))
  }, [data, query])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return
    try {
      await gqlRequest(DELETE_INFLUENCER_MUTATION, { id })
      refetch()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete influencer')
    }
  }

  if (loading) return <FullPageSpinner />
  if (error) return <ErrorState message={error} />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Influencers</h1>
          <p className="text-sm text-muted-foreground">{data?.getInfluencers.length ?? 0} total influencers</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search influencers…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No influencers found." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Influencer</TH>
              <TH>Tier</TH>
              <TH>Followers</TH>
              <TH>Engagement</TH>
              <TH>Collaborations</TH>
              <TH>Rating</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((i) => (
              <TR key={i.id} className="hover:bg-muted/50">
                <TD>
                  <span className="flex items-center gap-2 font-medium">
                    {i.isVerified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    {i.name}
                  </span>
                  <div className="text-xs text-muted-foreground">{i.email}</div>
                </TD>
                <TD>
                  <Badge tone="accent">{i.tier ?? '—'}</Badge>
                </TD>
                <TD>{(i.totalFollowers ?? 0).toLocaleString()}</TD>
                <TD>{i.engagementRate ? `${i.engagementRate.toFixed(1)}%` : '—'}</TD>
                <TD>{i.collaborationCount ?? 0}</TD>
                <TD>{i.averageRating ? i.averageRating.toFixed(1) : '—'}</TD>
                <TD>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id, i.name)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
