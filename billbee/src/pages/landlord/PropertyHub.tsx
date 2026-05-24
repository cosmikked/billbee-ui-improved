import { useNavigate, useOutletContext } from 'react-router-dom'
import { ArrowRight, AlertTriangle } from 'lucide-react'
import { MOCK_PROPERTY_HUB } from '../../data/mock'
import { Button } from '../../components/ui/Button'
import { Card, CardHead } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { CycleMetricBoxes } from '../../components/ui/CycleMetricBoxes'
import { DataTable } from '../../components/ui/DataTable'
import { Callout } from '../../components/ui/Callout'
import type { Column } from '../../components/ui/DataTable'
import type { BillStatus } from '../../components/ui/StatusBadge'
import type { PropertyHubBill, PropertyHubPayment } from '../../types/properties'
import type { PropertyLayoutContext } from './PropertyLayout'

/* ── Helpers ───────────────────────────────────────────────── */

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  const thousands = Math.floor(n / 1_000)
  const remainder = n % 1_000
  return thousands > 0
    ? `${thousands},${String(remainder).padStart(3, '0')}`
    : String(n)
}

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

/* ── Stat tile ─────────────────────────────────────────────── */

function Tile({
  label,
  value,
  sub,
  bar,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  bar?: number   // 0–100, renders a thin green progress bar
}) {
  return (
    <div className="bg-surface border border-border rounded-card flex flex-col gap-1" style={{ padding: 'var(--pad-card)' }}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">{label}</span>
      <span className="font-display text-[26px] font-bold tracking-[-0.02em] leading-[1.1] text-ink">{value}</span>
      {bar !== undefined && (
        <ProgressBar value={bar} variant="success" className="my-0.5" />
      )}
      {sub && <span className="text-[12px] text-ink-3">{sub}</span>}
    </div>
  )
}

/* ── Table columns ─────────────────────────────────────────── */

const billColumns: Column<PropertyHubBill>[] = [
  {
    key: 'billNo', header: 'Bill #',
    cell: r => <span className="font-mono text-[12.5px] font-medium text-ink">{r.billNo}</span>,
  },
  { key: 'tenant', header: 'Tenant', cell: r => r.tenant },
  { key: 'period', header: 'Period', cell: r => <span className="text-ink-3">{r.period}</span> },
  {
    key: 'total', header: 'Total', align: 'right',
    cell: r => <span className="font-mono text-[13px]">{fmtPHP(r.totalPHP)}</span>,
  },
  { key: 'status', header: 'Status', cell: r => <StatusBadge status={r.status} /> },
]

const paymentColumns: Column<PropertyHubPayment>[] = [
  { key: 'date',      header: 'Date',      cell: r => <span className="text-ink-3">{r.date}</span> },
  { key: 'tenant',    header: 'Tenant',    cell: r => r.tenant },
  { key: 'billNo',    header: 'Bill #',    cell: r => <span className="font-mono text-[12px]">{r.billNo}</span> },
  {
    key: 'amount', header: 'Amount', align: 'right',
    cell: r => <span className="font-mono text-[13px]">{fmtPHP(r.amountPHP)}</span>,
  },
  { key: 'mode',      header: 'Mode',      cell: r => <span className="text-ink-3">{r.mode}</span> },
  { key: 'receiptNo', header: 'Receipt #', cell: r => <span className="font-mono text-[12px] text-ink-3">{r.receiptNo}</span> },
]

/* ── Page ──────────────────────────────────────────────────── */

export function PropertyHub() {
  const navigate = useNavigate()
  const { property } = useOutletContext<PropertyLayoutContext>()
  const { stats, cycle, recentBills, recentPayments } = MOCK_PROPERTY_HUB

  const totalBills  = cycle.paid + cycle.posted + cycle.drafts + cycle.overdue + cycle.notYetDrafted
  const sentBills   = cycle.paid + cycle.posted + cycle.overdue
  const sentPct     = totalBills > 0 ? Math.round((sentBills / totalBills) * 100) : 0

  return (
    <div className="flex flex-col" style={{ gap: '20px' }}>

      {/* ── Stat tiles ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2" style={{ gap: 'var(--gap-grid)' }}>
        <Tile
          label="Rooms"
          value={stats.rooms.total}
          sub={`${stats.rooms.active} active · ${stats.rooms.maintenance} maint.`}
        />
        <Tile
          label="Occupied"
          value={`${stats.occupied.count}/${stats.occupied.total}`}
          sub={`${stats.occupied.vacantBeds} vacant beds`}
        />
        <Tile
          label="Active Tenants"
          value={stats.activeTenants}
        />
        <Tile
          label="Billed This Mo."
          value={<><span className="text-ink-3 font-semibold mr-0.5">₱</span>{fmtNum(stats.billedThisMonth.amountPHP)}</>}
          bar={stats.billedThisMonth.collectedPct}
          sub={<span className="text-success font-medium">{stats.billedThisMonth.collectedPct}% collected</span>}
        />
      </div>

      {/* ── Drafts-ready callout ─────────────────────────────── */}
      {cycle.draftsReadyToReview > 0 && (
        <Callout
          variant="warning"
          icon={<AlertTriangle size={18} strokeWidth={1.75} />}
          action={
            <Button variant="default" size="sm" onClick={() => navigate(cycle.reviewDraftsUrl)}>
              Review drafts <ArrowRight size={13} strokeWidth={1.75} />
            </Button>
          }
        >
          <strong className="font-semibold text-ink">{cycle.draftsReadyToReview} drafts ready to review.</strong>{' '}
          Post them to send notices to tenants.
        </Callout>
      )}

      {/* ── Current cycle card ───────────────────────────────── */}
      <Card>
        <CardHead
          title={`Current cycle · ${cycle.label}`}
          actions={
            <Button variant="primary" size="sm" onClick={() => navigate(cycle.cycleUrl)}>
              Open cycle <ArrowRight size={13} strokeWidth={1.75} />
            </Button>
          }
        />

        {/* 4 metric boxes */}
        <CycleMetricBoxes
          className="mb-4"
          items={[
            { variant: 'paid',   count: cycle.paid,          label: 'Paid'        },
            { variant: 'posted', count: cycle.posted,        label: 'Posted'      },
            { variant: 'draft',  count: cycle.drafts,        label: 'Draft'       },
            { variant: 'none',   count: cycle.notYetDrafted, label: 'Not drafted' },
          ]}
        />

        {/* Progress bar */}
        <div className="flex items-center gap-3 text-[12.5px] text-ink-3 mb-2">
          <span>{sentBills} of {totalBills} bills sent</span>
          <ProgressBar value={sentPct} className="flex-1" />
          <span className="font-mono font-medium text-ink-2 tabular-nums">{sentPct}%</span>
        </div>

      </Card>

      {/* ── Recent posted bills ──────────────────────────────── */}
      <Card noPadding>
        <div style={{ padding: 'var(--pad-card) var(--pad-card) 0' }}>
          <CardHead
            title="Recent posted bills"
            actions={
              <Button variant="primary" size="sm" onClick={() => navigate('/landlord/billing')}>
                Open Billing Center <ArrowRight size={13} strokeWidth={1.75} />
              </Button>
            }
          />
        </div>
        <DataTable
          columns={billColumns}
          rows={recentBills}
          getRowKey={r => r.billNo}
        />
      </Card>

      {/* ── Recent payments ──────────────────────────────────── */}
      <Card noPadding>
        <div style={{ padding: 'var(--pad-card) var(--pad-card) 0' }}>
          <CardHead
            title="Recent payments recorded"
            actions={
              <Button variant="primary" size="sm" onClick={() => navigate('/landlord/payments')}>
                Open Payments & Receipts <ArrowRight size={13} strokeWidth={1.75} />
              </Button>
            }
          />
        </div>
        <DataTable
          columns={paymentColumns}
          rows={recentPayments}
          getRowKey={r => r.receiptNo}
        />
      </Card>

    </div>
  )
}
