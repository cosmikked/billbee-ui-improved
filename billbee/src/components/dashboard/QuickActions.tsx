import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle2, Users, Building2, TrendingUp, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardHead } from '../ui/Card'

interface Action {
  icon: LucideIcon
  label: string
  sub: string
  href: string
  primary?: boolean
}

const ACTIONS: Action[] = [
  {
    icon: FileText,
    label: 'Generate bills',
    sub: "prep this month's billing run",
    href: '/landlord/billing/generate',
    primary: true,
  },
  {
    icon: CheckCircle2,
    label: 'Record payment',
    sub: 'log a cash / bank / e-wallet payment',
    href: '/landlord/payments/new',
  },
  {
    icon: Users,
    label: 'Add tenant',
    sub: 'assign to a room & attach charges',
    href: '/landlord/tenants/new',
  },
  {
    icon: Building2,
    label: 'Add property',
    sub: 'set up a new building',
    href: '/landlord/properties/new',
  },
  {
    icon: TrendingUp,
    label: 'View reports',
    sub: 'billing, collection, overdue',
    href: '/landlord/reports',
  },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHead title="Quick actions" subtitle="the things you do most" />

      {/* Actions list */}
      <div className="flex flex-col gap-2 mt-4">
        {ACTIONS.map(({ icon: Icon, label, sub, href, primary }) => (
          <button
            key={href}
            onClick={() => navigate(href)}
            className={[
              'flex items-center gap-3 px-[14px] py-3 rounded-btn text-left border transition-ui',
              primary
                ? 'bg-ink border-ink hover:bg-ink-2 hover:border-ink-2'
                : 'bg-surface border-border hover:bg-surface-2 hover:border-border-strong',
            ].join(' ')}
          >
            {/* Icon wrap */}
            <span
              className={[
                'w-9 h-9 rounded-chip inline-flex items-center justify-center shrink-0',
                primary ? 'bg-white/10 text-white' : 'bg-surface-2 text-ink-2',
              ].join(' ')}
            >
              <Icon size={18} strokeWidth={1.75} />
            </span>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className={`text-[14px] font-semibold mb-px ${primary ? 'text-white' : 'text-ink'}`}>
                {label}
              </div>
              <div className={`text-[12px] ${primary ? 'text-white/65' : 'text-ink-3'}`}>
                {sub}
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight
              size={16}
              strokeWidth={1.75}
              className={primary ? 'text-white/40 shrink-0' : 'text-ink-4 shrink-0'}
            />
          </button>
        ))}
      </div>
    </Card>
  )
}
