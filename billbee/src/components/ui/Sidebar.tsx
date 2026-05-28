import { type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, DoorOpen, Users,
  Receipt, FileText, CheckCircle2, TrendingUp, Settings, Sparkles,
  ShieldCheck, UserCog, ClipboardList, HardDrive, ArrowDownUp,
  BarChart2, Printer, SlidersHorizontal, Bell, ChevronRight,
} from 'lucide-react'
import { BrandMark } from './BrandMark'
import type { DashboardUser } from '../../types/dashboard'

/* ── Landlord nav ──────────────────────────────────────────── */

const LANDLORD_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard',      href: '/landlord/dashboard',  prefix: false },
  { icon: Building2,       label: 'Properties',     href: '/landlord/properties', prefix: false },
  { icon: DoorOpen,        label: 'Rooms',           href: '/landlord/rooms',      prefix: false },
  { icon: Users,           label: 'Tenants',         href: '/landlord/tenants',    prefix: false },
  { icon: Receipt,         label: 'Charge Catalog',  href: '/landlord/charges',    prefix: false },
  { icon: FileText,        label: 'Billing Center',  href: '/landlord/billing',    prefix: false },
  { icon: CheckCircle2,    label: 'Payment History', href: '/landlord/payments',   prefix: false },
  { icon: TrendingUp,      label: 'Reports',         href: '/landlord/reports',    prefix: false },
]

/* ── Admin nav ─────────────────────────────────────────────── */

interface AdminNavSection {
  heading: string
  links: Array<{ icon: typeof LayoutDashboard; label: string; href: string }>
}

const ADMIN_SECTIONS: AdminNavSection[] = [
  {
    heading: 'Overview',
    links: [
      { icon: LayoutDashboard, label: 'Admin Dashboard',      href: '/admin/dashboard' },
    ],
  },
  {
    heading: 'Access',
    links: [
      { icon: UserCog, label: 'User Management', href: '/admin/users' },
    ],
  },
  {
    heading: 'Monitoring',
    links: [
      { icon: ClipboardList, label: 'Audit Logs', href: '/admin/audit-logs' },
    ],
  },
  {
    heading: 'Operations',
    links: [
      { icon: HardDrive,     label: 'Backups',          href: '/admin/backups' },
      { icon: ArrowDownUp,   label: 'Import & Export',  href: '/admin/import-export' },
      { icon: BarChart2,     label: 'Admin Reports',    href: '/admin/reports' },
      { icon: Printer,       label: 'PDF & Printing',   href: '/admin/pdf-printing' },
    ],
  },
  {
    heading: 'System',
    links: [
      { icon: SlidersHorizontal, label: 'Data Controls', href: '/admin/data-controls' },
      { icon: Settings,          label: 'Site Settings',  href: '/admin/settings' },
    ],
  },
  {
    heading: 'Notifications',
    links: [
      { icon: Bell, label: 'Notifications & Alerts', href: '/admin/notifications' },
    ],
  },
]

/* ── Nav link ──────────────────────────────────────────────── */

function NavLink({
  href,
  icon: Icon,
  label,
  prefix = false,
}: {
  href: string
  icon: typeof LayoutDashboard
  label: string
  prefix?: boolean
}) {
  const { pathname } = useLocation()
  const active = prefix ? pathname.startsWith(href) : pathname === href
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

/* ── Nav section heading (admin only) ─────────────────────── */

function NavSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div>
      <p className="px-3 pt-3 pb-0.5 text-[10.5px] font-semibold uppercase tracking-widest text-ink-4">
        {heading}
      </p>
      {children}
    </div>
  )
}

/* ── Role switcher ─────────────────────────────────────────── */

function RoleSwitcher({ isAdmin }: { isAdmin: boolean }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center bg-surface-2 border border-border rounded-btn p-0.5 mb-2">
      <button
        type="button"
        onClick={() => { if (isAdmin) navigate('/landlord/dashboard') }}
        className={[
          'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-semibold rounded-chip transition-ui',
          !isAdmin
            ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
            : 'text-ink-3 hover:text-ink',
        ].join(' ')}
      >
        Landlord
      </button>
      <button
        type="button"
        onClick={() => { if (!isAdmin) navigate('/admin/dashboard') }}
        className={[
          'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-semibold rounded-chip transition-ui',
          isAdmin
            ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
            : 'text-ink-3 hover:text-ink',
        ].join(' ')}
      >
        <ShieldCheck size={12} strokeWidth={2} />
        Admin
      </button>
    </div>
  )
}

/* ── Sidebar ───────────────────────────────────────────────── */

interface SidebarProps {
  user: DashboardUser
}

export function Sidebar({ user }: SidebarProps) {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <aside className="w-60 bg-surface border-r border-border flex flex-col gap-1 px-3 py-5 sticky top-0 h-screen overflow-y-auto">

      {/* Brand */}
      <Link
        to={isAdmin ? '/admin/dashboard' : '/landlord/dashboard'}
        className="flex items-center gap-[10px] px-3 pb-4 font-display text-[18px] font-bold tracking-[-0.02em] text-ink"
      >
        <BrandMark />
        BillBee
      </Link>

      {/* ── Landlord nav ── */}
      {!isAdmin && (
        <>
          {LANDLORD_LINKS.map(props => <NavLink key={props.href} {...props} />)}

          {/* Prototype divider */}
          <div className="mt-2 mb-1 px-3">
            <div className="border-t border-border" />
          </div>
          <div className="px-3 pb-0.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-4">
              Prototype
            </p>
          </div>
          <NavLink
            href="/landlord/billing-v2"
            icon={Sparkles}
            label="Improved Billing"
            prefix
          />
        </>
      )}

      {/* ── Admin nav ── */}
      {isAdmin && (
        <>
          {ADMIN_SECTIONS.map(section => (
            <NavSection key={section.heading} heading={section.heading}>
              {section.links.map(link => (
                <NavLink key={link.href} href={link.href} icon={link.icon} label={link.label} />
              ))}
            </NavSection>
          ))}
        </>
      )}

      <div className="flex-1" />

      {/* Settings (landlord only — admin has it in nav) */}
      {!isAdmin && (
        <NavLink href="/landlord/settings" icon={Settings} label="Settings" />
      )}

      {/* Role switcher */}
      <div className="px-0 pt-1">
        <div className="border-t border-border mb-3 mt-1" />
        <RoleSwitcher isAdmin={isAdmin} />
      </div>

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
          <div className="text-[11.5px] text-ink-3 truncate">
            {isAdmin ? 'Administrator' : user.email}
          </div>
        </div>
        <ChevronRight size={14} strokeWidth={1.75} className="text-ink-4 shrink-0" />
      </div>
    </aside>
  )
}
