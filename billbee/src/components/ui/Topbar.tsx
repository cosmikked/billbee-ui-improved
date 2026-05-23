import { Search, Bell } from 'lucide-react'
import { IconButton } from './IconButton'

interface TopbarProps {
  notificationCount: number
}

export function Topbar({ notificationCount }: TopbarProps) {
  return (
    <header className="h-[60px] flex items-center gap-3 px-8 border-b border-border bg-bg sticky top-0 z-10">
      {/* Search mock — visual only, ⌘K opens palette */}
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-[7px] bg-surface border border-border rounded-btn
                   min-w-[280px] text-ink-3 text-[13px] hover:border-border-strong transition-ui text-left"
        aria-label="Search (⌘K)"
      >
        <Search size={16} strokeWidth={1.75} className="shrink-0" />
        <span className="flex-1">Search tenants, bills, properties…</span>
        <kbd className="font-mono text-[11px] px-[5px] py-px bg-surface-2 border border-border rounded text-ink-3">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      <IconButton badge={notificationCount} aria-label="Notifications">
        <Bell size={18} strokeWidth={1.75} />
      </IconButton>
    </header>
  )
}
