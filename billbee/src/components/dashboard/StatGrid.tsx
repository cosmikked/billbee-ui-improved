import { useNavigate } from 'react-router-dom'
import { Building2, DoorOpen, Users, Receipt, FileText, Clock, AlertTriangle, Coins } from 'lucide-react'
import { StatTile } from '../ui/StatTile'
import type { DashboardStats } from '../../types/dashboard'

function php(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  const thousands = Math.floor(n / 1_000)
  const remainder = n % 1_000
  return thousands > 0
    ? `${thousands},${String(remainder).padStart(3, '0')}`
    : String(n)
}

interface StatGridProps {
  stats: DashboardStats
}

const SW = 1.75
const SZ = 14

export function StatGrid({ stats }: StatGridProps) {
  const navigate = useNavigate()

  return (
    <div
      className="grid grid-cols-4 max-[1100px]:grid-cols-2"
      style={{ gap: 'var(--gap-grid)', marginBottom: 'var(--gap-grid)' }}
    >
      <StatTile
        label="Properties"
        value={stats.properties.value}
        delta={{ label: 'all active', variant: 'neutral' }}
        icon={<Building2 size={SZ} strokeWidth={SW} />}
        onClick={() => navigate('/landlord/properties')}
      />

      <StatTile
        label="Rooms"
        value={stats.rooms.value}
        sub={`${stats.rooms.occupied} occupied · ${stats.rooms.vacant} vacant`}
        icon={<DoorOpen size={SZ} strokeWidth={SW} />}
        onClick={() => navigate('/landlord/rooms')}
      />

      <StatTile
        label="Active tenants"
        value={stats.activeTenants.value}
        delta={{ label: `+${stats.activeTenants.deltaThisMonth} this month`, variant: 'up' }}
        icon={<Users size={SZ} strokeWidth={SW} />}
        onClick={() => navigate('/landlord/tenants')}
      />

      <StatTile
        label="Receipts this month"
        value={stats.receiptsThisMonth.value}
        delta={{ label: `+${stats.receiptsThisMonth.deltaVsLastMonth} vs last mo.`, variant: 'up' }}
        icon={<Receipt size={SZ} strokeWidth={SW} />}
        onClick={() => navigate('/landlord/payments')}
      />

      <StatTile
        label="Draft bills"
        value={stats.draftBills.value}
        sub="ready to generate"
        icon={<FileText size={SZ} strokeWidth={SW} />}
        onClick={() => navigate('/landlord/billing')}
      />

      <StatTile
        label="Unpaid posted"
        value={stats.unpaidPosted.value}
        delta={{ label: `₱${php(stats.unpaidPosted.outstandingPHP)} outstanding`, variant: 'neutral' }}
        icon={<Clock size={SZ} strokeWidth={SW} />}
        iconVariant="warn"
        valueVariant="attention"
        onClick={() => navigate('/landlord/billing?status=unpaid')}
      />

      <StatTile
        label="Overdue"
        value={stats.overdue.value}
        sub={`₱${php(stats.overdue.outstandingPHP)} · oldest ${stats.overdue.oldestDays} days`}
        icon={<AlertTriangle size={SZ} strokeWidth={SW} />}
        iconVariant="danger"
        valueVariant="danger"
        onClick={() => navigate('/landlord/billing?status=overdue')}
      />

      <StatTile
        label="Collected this month"
        value={
          <>
            <span className="text-ink-3 font-semibold mr-px">₱</span>
            {php(stats.collectedThisMonth.collectedPHP)}
          </>
        }
        delta={{ label: `${stats.collectedThisMonth.percent}%`, variant: 'up' }}
        sub={`of ₱${php(stats.collectedThisMonth.billedPHP)} billed`}
        icon={<Coins size={SZ} strokeWidth={SW} />}
        iconVariant="success"
        onClick={() => navigate('/landlord/payments')}
      />
    </div>
  )
}
