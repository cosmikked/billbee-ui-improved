import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Building2, DoorOpen, Users,
  Receipt, FileText, CheckCircle2, TrendingUp, Settings,
} from 'lucide-react'
import { BrandMark } from './BrandMark'
import type { DashboardUser } from '../../types/dashboard'

const NAV_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard',           href: '/landlord/dashboard' },
  { icon: Building2,       label: 'Properties',          href: '/landlord/properties' },
  { icon: DoorOpen,        label: 'Rooms',               href: '/landlord/rooms' },
  { icon: Users,           label: 'Tenants',             href: '/landlord/tenants' },
  { icon: Receipt,         label: 'Charge Catalog',      href: '/landlord/charges' },
  { icon: FileText,        label: 'Billing Center',      href: '/landlord/billing' },
  { icon: CheckCircle2,    label: 'Payments & Receipts', href: '/landlord/payments' },
  { icon: TrendingUp,      label: 'Reports',             href: '/landlord/reports' },
]

interface SidebarProps {
  user: DashboardUser
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) {
  const { pathname } = useLocation()
  const active = pathname === href
  return (
    <Link
      to={href}
      className={[
        'group flex items-center gap-[10px] px-3 py-2 rounded-btn text-[14px] font-medium transition-ui',
        active ? 'bg-ink text-white' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
      ].join(' ')}
    >
      <Icon
        size={18}
        strokeWidth={1.75}
        className={[
          'shrink-0 transition-ui',
          active ? 'stroke-white' : 'stroke-ink-3 group-hover:stroke-ink',
        ].join(' ')}
      />
      {label}
    </Link>
  )
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="w-60 bg-surface border-r border-border flex flex-col gap-1 px-3 py-5 sticky top-0 h-screen overflow-y-auto">
      {/* Brand */}
      <Link
        to="/landlord/dashboard"
        className="flex items-center gap-[10px] px-3 pb-4 font-display text-[18px] font-bold tracking-[-0.02em] text-ink"
      >
        <BrandMark />
        BillBee
      </Link>

      {/* Nav links */}
      {NAV_LINKS.map(props => <NavLink key={props.href} {...props} />)}

      <div className="flex-1" />

      {/* Settings */}
      <NavLink href="/landlord/settings" icon={Settings} label="Settings" />

      {/* User card */}
      <div className="flex items-center gap-[10px] px-3 py-[10px] rounded-btn cursor-pointer hover:bg-surface-2 transition-ui">
        <div
          className="w-8 h-8 rounded-pill flex items-center justify-center shrink-0 text-white font-display font-semibold text-[13px]"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))' }}
        >
          {user.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-ink truncate">{user.name}</div>
          <div className="text-[11.5px] text-ink-3 truncate">{user.email}</div>
        </div>
      </div>
    </aside>
  )
}
