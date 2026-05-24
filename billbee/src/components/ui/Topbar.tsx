import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Bell, Sun, Moon, ChevronRight } from 'lucide-react'
import { IconButton } from './IconButton'
import { MOCK_ROOMS } from '../../data/mock'
import { MOCK_TENANTS } from '../../data/mock'

/* ── Theme hook ────────────────────────────────────────────── */

function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark(d => !d) }
}

/* ── Breadcrumb hook ───────────────────────────────────────── */

interface Crumb {
  label: string
  href: string
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard:  'Dashboard',
  properties: 'Properties',
  charges:    'Charge Catalog',
  rooms:      'Rooms',
  tenants:    'Tenants',
  billing:    'Billing Center',
  payments:   'Payments & Receipts',
  reports:    'Reports',
  generate:   'Generate Bills',
  draft:      'Draft Bill',
  posted:     'Posted Bill',
  cycle:      'Cycle Detail',
}

function useBreadcrumbs(): Crumb[] {
  const { pathname } = useLocation()

  // Strip leading /landlord/
  const parts = pathname.replace(/^\/landlord\/?/, '').split('/').filter(Boolean)

  const crumbs: Crumb[] = []
  let builtPath = '/landlord'

  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i]
    builtPath += `/${seg}`

    const label = SEGMENT_LABELS[seg] ?? seg

    const isId = !SEGMENT_LABELS[seg] && i > 0
    if (isId) {
      // Try to resolve the ID to a human-readable label
      const prevSeg = parts[i - 1]
      let resolved = seg
      if (prevSeg === 'rooms') {
        const room = MOCK_ROOMS.find(r => r.id === seg)
        if (room) resolved = room.name
      } else if (prevSeg === 'tenants') {
        const tenant = MOCK_TENANTS.find(t => t.id === seg)
        if (tenant) resolved = tenant.name
      }
      crumbs.push({ label: resolved, href: builtPath })
    } else {
      crumbs.push({ label, href: builtPath })
    }
  }

  return crumbs
}

/* ── Component ─────────────────────────────────────────────── */

interface TopbarProps {
  notificationCount: number
}

export function Topbar({ notificationCount }: TopbarProps) {
  const { dark, toggle } = useTheme()
  const crumbs = useBreadcrumbs()

  return (
    <header className="h-[60px] flex items-center gap-4 px-8 border-b border-border bg-bg sticky top-0 z-10">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && (
                <ChevronRight size={13} strokeWidth={1.75} className="text-ink-4 shrink-0" />
              )}
              {isLast ? (
                <span className="text-[13.5px] font-semibold text-ink truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.href}
                  className="text-[13.5px] text-ink-3 hover:text-ink transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>

      {/* Search — compact pill */}
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-[6px] bg-surface border border-border rounded-btn
                   text-ink-3 text-[13px] hover:border-border-strong transition-ui shrink-0"
        aria-label="Search (⌘K)"
      >
        <Search size={14} strokeWidth={1.75} className="shrink-0" />
        <span className="text-[12.5px] text-ink-4">Search</span>
        <kbd className="font-mono text-[11px] px-[5px] py-px bg-surface-2 border border-border rounded text-ink-4">
          ⌘K
        </kbd>
      </button>

      {/* Theme toggle */}
      <IconButton
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggle}
      >
        {dark
          ? <Sun  size={18} strokeWidth={1.75} />
          : <Moon size={18} strokeWidth={1.75} />
        }
      </IconButton>

      {/* Notifications */}
      <IconButton badge={notificationCount} aria-label="Notifications">
        <Bell size={18} strokeWidth={1.75} />
      </IconButton>
    </header>
  )
}
