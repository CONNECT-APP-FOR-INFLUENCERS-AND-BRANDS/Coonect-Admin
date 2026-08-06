import { useAdminQuery } from '@/hooks/useAdminQuery'
import { OVERVIEW_STATS_QUERY, TOP_BRANDS_QUERY } from '@/lib/queries'
import type { Brand, MonthlyTrend, OverviewStats, TierCount } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FullPageSpinner, ErrorState } from '@/components/ui/spinner'
import { PageHeader } from '@/components/ui/page-header'
import { formatCurrency, cn } from '@/lib/utils'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  ArrowDownRight,
  ArrowUpRight,
  Star,
  Building2,
  Users,
  Handshake,
  Wallet,
  Trophy,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const CORAL = 'var(--primary)'

const tooltipStyle = {
  background: 'var(--foreground)',
  border: 'none',
  borderRadius: 10,
  fontSize: 12,
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
}
const tooltipItemStyle = { color: '#ffffff' }
const tooltipLabelStyle = { color: '#ffffff', fontWeight: 700, marginBottom: 2 }

interface OverviewData {
  getAdminOverviewStats: OverviewStats
  getAdminMonthlyTrend: MonthlyTrend[]
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
    <div className="flex flex-col gap-4">
      <PageHeader icon={LayoutDashboard} title="Overview" description="Platform-wide activity across all brands and influencers." />

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Total Brands" value={stats.totalBrands.toLocaleString()} change={stats.totalBrandsChange} />
        <StatCard icon={Users} label="Total Influencers" value={stats.totalInfluencers.toLocaleString()} change={stats.totalInfluencersChange} />
        <StatCard icon={Handshake} label="Collaborations" value={stats.totalCollaborations.toLocaleString()} change={stats.totalCollaborationsChange} />
        <StatCard icon={Wallet} label="Revenue" value={formatCurrency(stats.totalRevenue)} change={stats.totalRevenueChange} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="animate-fade-in-up lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue — last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend} margin={{ left: -12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  formatter={(value: unknown) => [formatCurrency(Number(value)), 'Revenue']}
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={CORAL}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: CORAL, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Revenue"
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <CardHeader>
            <CardTitle>Platform health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <HealthRow icon={Users} label="Active influencers" value={stats.activeInfluencers.toLocaleString()} />
            <HealthRow icon={Building2} label="Active brands" value={stats.activeBrands.toLocaleString()} />
            <HealthRow label="Avg engagement" value={`${stats.avgEngagement.toFixed(1)}%`} />
            <HealthRow
              label="Platform growth"
              value={`${stats.platformGrowth >= 0 ? '+' : ''}${stats.platformGrowth.toFixed(1)}%`}
              positive={stats.platformGrowth >= 0}
              last
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in-up" style={{ animationDelay: '90ms' }}>
          <CardHeader>
            <CardTitle>Collaborations — last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={trend} margin={{ left: -12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                <Tooltip
                  formatter={(value: unknown) => [Number(value), 'Collaborations']}
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  cursor={{ fill: 'var(--muted)' }}
                />
                <Bar dataKey="collaborations" fill={CORAL} radius={[8, 8, 0, 0]} maxBarSize={36} name="Collaborations" animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <TierChart title="Influencer tiers" data={data.getInfluencerTierDistribution} />
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Top performing brands by ROI
          </CardTitle>
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
                  <TD className="font-semibold">
                    <span className="flex items-center gap-1.5">
                      {b.name}
                      {b.isVerified && <Star className="h-3 w-3 fill-primary text-primary" />}
                    </span>
                  </TD>
                  <TD>
                    <Badge tone="neutral">{b.tier ?? '—'}</Badge>
                  </TD>
                  <TD>{b.totalCollaborations ?? 0}</TD>
                  <TD className="font-semibold text-primary">{(b.avgROI ?? 0).toFixed(2)}x</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, change }: { icon: LucideIcon; label: string; value: string; change: number }) {
  const positive = change >= 0
  return (
    <Card hoverable>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-accent text-primary">
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>
        <p className="mt-2.5 text-[28px] font-bold tabular-nums">{value}</p>
        <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', positive ? 'text-success' : 'text-destructive')}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(change).toFixed(1)}% vs last month
        </p>
      </CardContent>
    </Card>
  )
}

function HealthRow({
  icon: Icon,
  label,
  value,
  positive,
  last,
}: {
  icon?: LucideIcon
  label: string
  value: string
  positive?: boolean
  last?: boolean
}) {
  return (
    <div className={cn('flex items-center justify-between py-2.5', !last && 'border-b border-border')}>
      <span className="flex items-center gap-2 text-[13.5px] text-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        {label}
      </span>
      <span className={cn('text-sm font-bold tabular-nums', positive === undefined ? 'text-foreground' : positive ? 'text-success' : 'text-destructive')}>
        {value}
      </span>
    </div>
  )
}

function TierChart({ title, data }: { title: string; data: TierCount[] }) {
  const formatted = data.map((d) => ({ ...d, tier: d.tier.charAt(0).toUpperCase() + d.tier.slice(1) }))
  const max = Math.max(1, ...formatted.map((d) => d.count))
  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {formatted.map((d) => (
          <div key={d.tier}>
            <div className="mb-1 flex items-center justify-between text-[12.5px]">
              <span className="font-medium text-foreground">{d.tier}</span>
              <span className="text-muted-foreground">{d.count}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.max(4, (d.count / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
