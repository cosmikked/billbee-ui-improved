import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { MOCK_DASHBOARD } from '../../data/mock'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { HeadsUpBanner } from '../../components/dashboard/HeadsUpBanner'
import { StatGrid } from '../../components/dashboard/StatGrid'
import { CollectionsChart } from '../../components/dashboard/CollectionsChart'
import { QuickActions } from '../../components/dashboard/QuickActions'

const data = MOCK_DASHBOARD

export function Dashboard() {
  const navigate = useNavigate()
  const { greeting, nextBilling, stats } = data

  const subtitle = [
    `${stats.properties.value} properties`,
    nextBilling
      ? `billing day for ${nextBilling.propertyName} in ${nextBilling.daysUntil} days`
      : null,
  ].filter(Boolean).join(' · ')

  return (
    <main className="px-8 pt-7 pb-16 max-w-[1320px] mx-auto w-full">
      <PageHead
        title={greeting}
        subtitle={subtitle}
        actions={
          <Button variant="accent" onClick={() => navigate('/landlord/billing/generate')}>
            <Plus size={14} strokeWidth={2} />
            Generate Bills
          </Button>
        }
      />

      {/* Heads-up banner */}
      {nextBilling && (
        <HeadsUpBanner
          propertyName={nextBilling.propertyName}
          cycleUrl={nextBilling.cycleUrl}
        />
      )}

      {/* 8 stat cards */}
      <StatGrid stats={stats} />

      {/* Chart + Quick actions */}
      <div
        className="grid grid-cols-[2fr_1fr] max-[1100px]:grid-cols-1"
        style={{ gap: 'var(--gap-grid)' }}
      >
        <CollectionsChart />
        <QuickActions />
      </div>
    </main>
  )
}
