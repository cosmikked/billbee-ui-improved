import { NavLink } from 'react-router-dom'

export interface TabItem {
  label: string
  href: string
  /** Optional count shown inline in mono — can be a number or short string like "11 mar" */
  count?: number | string
  /** Match only the exact path — use true for index/overview tabs */
  end?: boolean
}

interface TabNavProps {
  tabs: TabItem[]
  className?: string
}

export function TabNav({ tabs, className = '' }: TabNavProps) {
  return (
    <nav className={`flex border-b border-border ${className}`}>
      {tabs.map(tab => (
        <NavLink
          key={tab.href}
          to={tab.href}
          end={tab.end ?? false}
          className={({ isActive }) => [
            'flex items-center gap-1.5 px-1 pb-[10px] pt-1 mr-6 text-[14px] font-medium',
            'border-b-2 -mb-px whitespace-nowrap transition-ui select-none',
            isActive
              ? 'text-ink border-ink'
              : 'text-ink-3 border-transparent hover:text-ink hover:border-border-strong',
          ].join(' ')}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="font-mono text-[12px] text-ink-4">{tab.count}</span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
