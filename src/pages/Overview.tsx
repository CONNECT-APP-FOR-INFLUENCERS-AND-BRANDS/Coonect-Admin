import { useAdminQuery } from '@/hooks/useAdminQuery'
import { OVERVIEW_STATS_QUERY, TOP_BRANDS_QUERY } from '@/lib/queries'
import type { Brand, MonthlyTrend, OverviewStats, TierCount } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FullPageSpinner, ErrorState } from '@/components/ui/spinner'
import { formatCurrency, cn } from '@/lib/utils'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowDownRight, ArrowUpRight, Star } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const BLUE = '#2a78d6'
const ORANGE = '#eb6834'

interface OverviewData {
  getAdminOverviewStats: OverviewStats
  getAdminMonthlyTrend: MonthlyTrend[]
  getBrandTierDistribution: TierCount[]
  getInfluencerTierDistribution: TierCount[]
}

interface TopBrandsData {
  getTopBrandsByROI: Brand[]
}

export function Overview() {
  const { data, loading, error } = useAdminQuery<OverviewData>(OVERVIEW_STATS_QUERY)
  const { data: topBrandsData } = useAdminQuery<TopBrandsData>(TOP_BRANDS_QUERY)

  if (loading) return <FullPageSpinner />
  if (error || !data) return <ErrorState message={error ?? 'Failed to load overview'} />

  const stats = data.getAdminOverviewStats
  const trend = data.getAdminMonthlyTrend

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">Platform-wide activity across all brands and influencers.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Brands" value={stats.totalBrands.toLocaleString()} change={stats.totalBrandsChange} />
        <StatCard label="Total Influencers" value={stats.totalInfluencers.toLocaleString()} change={stats.totalInfluencersChange} />
        <StatCard label="Collaborations" value={stats.totalCollaborations.toLocaleString()} change={stats.totalCollaborationsChange} />
        <StatCard label="Revenue" value={formatCurrency(stats.totalRevenue)} change={stats.totalRevenueChange} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue — last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend} margin={{ left: -12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  formatter={(value: unknown) => [formatCurrency(Number(value)), 'Revenue']}
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="revenue" stroke={BLUE} strokeWidth={2} dot={{ r: 3, fill: BLUE }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collaborations — last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend} margin={{ left: -12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                <Tooltip
                  formatter={(value: unknown) => [Number(value), 'Collaborations']}
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="collaborations" fill={ORANGE} radius={[4, 4, 0, 0]} maxBarSize={36} name="Collaborations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TierChart title="Brand tiers" data={data.getBrandTierDistribution} />
        <TierChart title="Influencer tiers" data={data.getInfluencerTierDistribution} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top performing brands by ROI</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Brand</TH>
                <TH>Tier</TH>
                <TH>Collaborations</TH>
                <TH>Avg ROI</TH>
              </TR>
            </THead>
            <TBody>
              {topBrandsData?.getTopBrandsByROI.map((b) => (
                <TR key={b.id}>
                  <TD className="font-medium">
                    <span className="flex items-center gap-1.5">
                      {b.name}
                      {b.isVerified && <Star className="h-3 w-3 fill-primary text-primary" />}
                    </span>
                  </TD>
                  <TD>
                    <Badge tone="accent">{b.tier ?? '—'}</Badge>
                  </TD>
                  <TD>{b.totalCollaborations ?? 0}</TD>
                  <TD className="font-medium">{(b.avgROI ?? 0).toFixed(2)}x</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value, change }: { label: string; value: string; change: number }) {
  const positive = change >= 0
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', positive ? 'text-success' : 'text-destructive')}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(change).toFixed(1)}% vs last month
        </p>
      </CardContent>
    </Card>
  )
}

function TierChart({ title, data }: { title: string; data: TierCount[] }) {
  const formatted = data.map((d) => ({ ...d, tier: d.tier.charAt(0).toUpperCase() + d.tier.slice(1) }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={formatted} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis dataKey="tier" type="category" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={64} />
            <Tooltip
              formatter={(value: unknown) => [Number(value), 'Count']}
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} maxBarSize={20} name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
