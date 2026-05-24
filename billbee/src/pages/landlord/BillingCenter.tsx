import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Building2, Info, Plus } from 'lucide-react'
import { MOCK_BILLING_CENTER, MOCK_PROPERTIES } from '../../data/mock'
import type { BillingCycleProperty } from '../../types/billing'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { Card, CardHead } from '../../components/ui/Card'
import { Pill } from '../../components/ui/Pill'
import { Callout } from '../../components/ui/Callout'
import { Modal } from '../../components/ui/Modal'
import { CycleMetricBoxes } from '../../components/ui/CycleMetricBoxes'

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(value: number): string {
  return `₱${value.toLocaleString('en-PH')}`
}

/* ── Cycle property card ───────────────────────────────────── */

function CycleCard({ cycle }: { cycle: BillingCycleProperty }) {
  const navigate = useNavigate()
  const inProgress = cycle.status === 'in-progress'

  return (
    <Card>
      <CardHead
        title={cycle.propertyName}
        subtitle={`billing day ${cycle.billingDay} · period ${cycle.periodLabel}`}
        actions={
          <>
            <Pill variant={inProgress ? 'info' : 'neutral'} className="py-[5px] px-3 border border-transparent">
              {inProgress ? 'In progress' : 'Not started'}
            </Pill>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/landlord/billing/cycle/${cycle.id}`)}
            >
              Open cycle <ArrowRight size={13} strokeWidth={1.75} />
            </Button>
          </>
        }
      />

      {inProgress ? (
        <>
          <CycleMetricBoxes
            className="mb-3"
            items={[
              { variant: 'paid',    count: cycle.counts.paid,    label: 'Paid'    },
              { variant: 'posted',  count: cycle.counts.posted,  label: 'Posted'  },
              { variant: 'draft',   count: cycle.counts.draft,   label: 'Draft'   },
              { variant: 'overdue', count: cycle.counts.overdue, label: 'Overdue' },
            ]}
          />

          <hr className="border-border mb-3" />

          {/* Totals row */}
          <div className="grid grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Billed</span>
              <span className="font-display text-[22px] font-bold tracking-[-0.02em] leading-tight text-ink">
                {fmtPHP(cycle.totals.billedPHP)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Collected</span>
              <span className="font-display text-[22px] font-bold tracking-[-0.02em] leading-tight text-success">
                {fmtPHP(cycle.totals.collectedPHP)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <Callout
          variant="accent"
          icon={<Info size={16} strokeWidth={1.75} />}
          action={<Button size="sm" variant="accent">Start prep</Button>}
        >
          <p className="text-[13px]">
            Billing day is the {cycle.billingDay}th — already passed. Generate now to catch up.
          </p>
        </Callout>
      )}
    </Card>
  )
}

/* ── Property picker modal ─────────────────────────────────── */

function PropertyPickerModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (propertyId: string) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  // Active properties only
  const activeProperties = MOCK_PROPERTIES.filter(p => p.status === 'active')

  // Find current cycle status for a property
  function cycleStatus(propertyId: string) {
    const cycle = MOCK_BILLING_CENTER.cycles.find(c => c.id === propertyId)
    return cycle?.status ?? null
  }

  function handleConfirm() {
    if (!selected) return
    onConfirm(selected)
    setSelected(null)
  }

  function handleClose() {
    setSelected(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Select a property"
      subtitle="Choose which property to generate billings for"
      width={520}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="default" onClick={handleClose}>Cancel</Button>
          <Button
            variant="accent"
            onClick={handleConfirm}
            disabled={!selected}
          >
            Generate billings <ArrowRight size={13} strokeWidth={1.75} />
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        {activeProperties.length === 0 && (
          <p className="text-[13px] text-ink-3 text-center py-6">No active properties found.</p>
        )}
        {activeProperties.map(property => {
          const isSelected = selected === property.id
          const status = cycleStatus(property.id)
          return (
            <button
              key={property.id}
              type="button"
              onClick={() => setSelected(property.id)}
              className={[
                'w-full text-left flex items-center gap-3 rounded-card border px-4 py-3 transition-ui',
                isSelected
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface hover:bg-surface-2 hover:border-border-strong',
              ].join(' ')}
            >
              <div className={[
                'shrink-0 w-8 h-8 rounded-btn flex items-center justify-center',
                isSelected ? 'bg-accent/10' : 'bg-surface-2',
              ].join(' ')}>
                <Building2 size={15} strokeWidth={1.75} className={isSelected ? 'text-accent' : 'text-ink-3'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-ink leading-tight">{property.name}</div>
                <div className="text-[12px] text-ink-3 mt-0.5">Billing day {property.billingDay}</div>
              </div>
              {status && (
                <Pill variant={status === 'in-progress' ? 'info' : 'neutral'} className="shrink-0 py-[3px] px-2.5 text-[11.5px]">
                  {status === 'in-progress' ? 'In progress' : 'Not started'}
                </Pill>
              )}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function BillingCenter() {
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [activeMonth, setActiveMonth] = useState(
    MOCK_BILLING_CENTER.months.find(m => m.state === 'current')?.id
      ?? MOCK_BILLING_CENTER.months[0]?.id
      ?? '',
  )

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full flex flex-col" style={{ gap: '20px' }}>
      <PageHead
        className="mb-0"
        title="Billing cycles"
        subtitle="organized by month + property — see the cycle as a whole"
        actions={
          <Button variant="accent" onClick={() => setPickerOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            Generate Billings
          </Button>
        }
      />


      {/* Month tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mt-6">
        {MOCK_BILLING_CENTER.months.map(month => {
          const isActive = month.id === activeMonth
          return (
            <button
              key={month.id}
              type="button"
              onClick={() => setActiveMonth(month.id)}
              className={[
                'min-w-[80px] flex-shrink-0 border rounded-btn px-3 py-2 text-center transition-ui',
                isActive
                  ? 'bg-ink border-ink text-white'
                  : month.state === 'future'
                    ? 'bg-surface border-border text-ink-4 hover:border-border-strong hover:text-ink-3'
                    : 'bg-surface border-border text-ink hover:bg-surface-2 hover:border-border-strong',
              ].join(' ')}
            >
              <div className="text-[13.5px] font-semibold leading-tight">{month.label}</div>
              <div className={`text-[11px] mt-0.5 ${isActive ? 'text-white/60' : 'text-ink-4'}`}>
                {month.state}
              </div>
            </button>
          )
        })}
      </div>

                      {/* Older overdue callout — top priority alert */}
      <Callout
        variant="warning"
        icon={<AlertTriangle size={18} strokeWidth={1.75} />}
        action={
          <Button size="sm" variant="default">
            View <ArrowRight size={13} strokeWidth={1.75} />
          </Button>
        }
      >
        <span className="text-[13.5px]">
          <strong className="font-semibold text-ink">Older overdue:</strong>{' '}
          {MOCK_BILLING_CENTER.olderOverdue.billCount} bills from {MOCK_BILLING_CENTER.olderOverdue.monthLabel}{' '}
          totalling{' '}
          <span className="font-mono font-medium">{fmtPHP(MOCK_BILLING_CENTER.olderOverdue.amountPHP)}</span>{' '}
          still unpaid.
        </span>
      </Callout>
      {/* Current month label */}
      <div className="flex flex-col" style={{ gap: '20px' }}>
        <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] text-ink -mb-3">
          {MOCK_BILLING_CENTER.currentMonthLabel}
        </h2>

        {/* Cycle cards */}
        {MOCK_BILLING_CENTER.cycles.map(cycle => (
          <CycleCard key={cycle.id} cycle={cycle} />
        ))}
      </div>

      {/* How a cycle works — info note */}
      <Callout
        variant="info"
        icon={<Info size={18} strokeWidth={1.75} />}
      >
        <p className="text-[13px] text-ink-2">
          <strong className="font-semibold text-ink">How a cycle works:</strong>{' '}
          for each property × month, BillBee tracks the billing day, drafts, posted bills, and payments.
          Click <strong className="font-semibold text-ink">Open cycle →</strong> to see all bills in that cycle with bulk actions.
        </p>
      </Callout>

      <PropertyPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={propertyId => {
          setPickerOpen(false)
          navigate(`/landlord/billing/generate?property=${propertyId}`)
        }}
      />
    </main>
  )
}
