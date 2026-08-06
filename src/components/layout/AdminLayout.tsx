import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  Ban,
  Banknote,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Directory',
    items: [
      { to: '/brands', label: 'Brands', icon: Building2 },
      { to: '/influencers', label: 'Influencers', icon: Users },
    ],
  },
  {
    label: 'Activity',
    items: [
      { to: '/collaborations', label: 'Collaborations', icon: Handshake },
      { to: '/cancellation-requests', label: 'Cancellation Requests', icon: Ban },
      { to: '/payment-release-requests', label: 'Payment Release Requests', icon: Banknote },
    ],
  },
  {
    label: 'Trust & Safety',
    items: [{ to: '/verification-requests', label: 'Verification Requests', icon: ShieldCheck }],
  },
]

export function AdminLayout() {
  const { user, signOut } = useAuth()
  const initial = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex min-h-screen bg-page">
      <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-border bg-card px-4 py-6">
        <div className="mb-4 flex items-center gap-3 border-b border-border px-2 pb-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold">Connect Admin</span>
            <span className="text-[11px] text-muted-foreground">Control center</span>
          </div>
        </div>
        <nav className="flex flex-1 flex-col overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              <span className="mb-1.5 block px-2.5 text-[11px] font-medium uppercase tracking-wider text-label">{group.label}</span>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'mb-0.5 flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted',
                      isActive && 'bg-accent font-semibold text-primary hover:bg-accent',
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="flex flex-col gap-2.5 border-t border-border pt-4">
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-accent-foreground">
              {initial}
            </div>
            <span className="truncate text-[13px] text-foreground">{user?.email}</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-[1240px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
