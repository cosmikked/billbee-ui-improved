import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Pencil, Archive, Plus, ArrowRight,
  AlertTriangle, DoorOpen, UserPlus, Tag, Send,
} from 'lucide-react'
import { MOCK_PROPERTIES, MOCK_PROPERTY_HUB } from '../../data/mock'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { Card, CardHead } from '../../components/ui/Card'
import { StatTile } from '../../components/ui/StatTile'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { TabNav } from '../../components/ui/TabNav'
import { DataTable } from '../../components/ui/DataTable'
import { Callout } from '../../components/ui/Callout'
import type { Column } from '../../components/ui/DataTable'
import type { BillStatus } from '../../components/ui/StatusBadge'
import type { PropertyHubBill, PropertyHubPayment } from '../../types/properties'

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

const CYCLE_CHIPS: Array<{ key: string; status: BillStatus }> = [
  { key: 'paid',    status: 'paid'    },
  { key: 'posted',  status: 'posted'  },
  { key: 'drafts',  status: 'draft'   },
  { key: 'overdue', status: 'overdue' },
]

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

export function PropertyHub() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const property = MOCK_PROPERTIES.find(p => p.id === id) ?? MOCK_PROPERTIES[0]
  const { stats, cycle, info, recentBills, recentPayments, nextBillingIn } = MOCK_PROPERTY_HUB

  const cycleCountMap: Record<string, number> = {
    paid: cycle.paid, posted: cycle.posted, drafts: cycle.drafts, overdue: cycle.overdue,
  }

  const tabs = [
    { label: 'Overview',  href: `/landlord/properties/${property.id}`, end: true },
    { label: 'Charges',   href: `/landlord/properties/${property.id}/charges`,  count: 5 },
    { label: 'Rooms',     href: `/landlord/properties/${property.id}/rooms`,    count: stats.rooms.total },
    { label: 'Tenants',   href: `/landlord/properties/${property.id}/tenants`,  count: stats.activeTenants },
    { label: 'Bills',     href: `/landlord/properties/${property.id}/bills`,    count: '11 mar' },
  ]

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Page head */}
      <PageHead
        className="mb-0"
        title={
          <span className="inline-flex items-center gap-2 flex-wrap leading-normal">
            {property.name}
            <StatusBadge status={property.status} />
          </span>
        }
        subtitle={`${property.address} · billing day every ${property.billingDay}th · next in ${nextBillingIn} days`}
        actions={
          <>
            <Button variant="default">
              <Pencil size={13} strokeWidth={1.75} />
              Edit property
            </Button>
            <Button variant="default">
              <Archive size={13} strokeWidth={1.75} />
              Archive
            </Button>
            <Button variant="accent" onClick={() => navigate(cycle.generateBillsUrl)}>
              <Plus size={14} strokeWidth={2} />
              Generate {cycle.label} Bills
            </Button>
          </>
        }
      />

      {/* Tab nav */}
      <TabNav tabs={tabs} className="mt-5 mb-6" />

      {/* Two-column content */}
      <div
        className="grid grid-cols-[1fr_272px] max-[1100px]:grid-cols-1"
        style={{ gap: 'var(--gap-grid)', alignItems: 'start' }}
      >
        {/* ── Left column ───────────────────────────────────── */}
        <div className="flex flex-col min-w-0" style={{ gap: 'var(--gap-grid)' }}>

          {/* Mini stat tiles */}
          <div className="grid grid-cols-4 max-[900px]:grid-cols-2" style={{ gap: 'var(--gap-grid)' }}>
            <StatTile
              label="Rooms"
              value={stats.rooms.total}
              sub={`${stats.rooms.active} active · ${stats.rooms.maintenance} maint.`}
            />
            <StatTile
              label="Occupied"
              value={`${stats.occupied.count}/${stats.occupied.total}`}
              sub={`${stats.occupied.vacantBeds} vacant beds`}
            />
            <StatTile
              label="Active tenants"
              value={stats.activeTenants}
            />
            <StatTile
              label="Billed this mo."
              value={
                <>
                  <span className="text-ink-3 font-semibold mr-px">₱</span>
                  {fmtNum(stats.billedThisMonth.amountPHP)}
                </>
              }
              delta={{ label: `${stats.billedThisMonth.collectedPct}% collected`, variant: 'up' }}
            />
          </div>

          {/* Current cycle card */}
          <Card>
            <CardHead
              title={`Current cycle · ${cycle.label}`}
              subtitle={cycle.billingDayLabel}
              actions={
                <Button variant="ghost" size="sm" onClick={() => navigate(cycle.cycleUrl)}>
                  open cycle <ArrowRight size={13} strokeWidth={1.75} />
                </Button>
              }
            />
            <ProgressBar value={cycle.progressPct} className="mb-3" />

            {/* Status breakdown */}
            <div className="flex items-center gap-3 flex-wrap mb-3">
              {CYCLE_CHIPS.map(({ key, status }) => (
                <span key={key} className="inline-flex items-center gap-1">
                  <span className="font-mono text-[12px] font-semibold text-ink">
                    {cycleCountMap[key]}
                  </span>
                  <StatusBadge status={status} />
                </span>
              ))}
              <span className="ml-auto font-mono text-[12px] text-ink-4">
                {cycle.notYetDrafted} not yet drafted
              </span>
            </div>

            {/* Drafts-ready callout */}
            {cycle.draftsReadyToReview > 0 && (
              <Callout
                variant="warning"
                icon={<AlertTriangle size={18} strokeWidth={1.75} />}
                action={
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(cycle.reviewDraftsUrl)}
                  >
                    review drafts <ArrowRight size={13} strokeWidth={1.75} />
                  </Button>
                }
              >
                <strong className="font-semibold text-ink">
                  {cycle.draftsReadyToReview} drafts
                </strong>{' '}
                ready to review. Post them to send notices to tenants.
              </Callout>
            )}
          </Card>

          {/* Recent posted bills */}
          <Card noPadding>
            <div style={{ padding: 'var(--pad-card) var(--pad-card) 0' }}>
              <CardHead
                title="Recent posted bills"
                actions={
                  <Button variant="ghost" size="sm" onClick={() => navigate('/landlord/billing')}>
                    open Billing Center <ArrowRight size={13} strokeWidth={1.75} />
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

          {/* Recent payments */}
          <Card noPadding>
            <div style={{ padding: 'var(--pad-card) var(--pad-card) 0' }}>
              <CardHead
                title="Recent payments recorded"
                actions={
                  <Button variant="ghost" size="sm" onClick={() => navigate('/landlord/payments')}>
                    open Payments & Receipts <ArrowRight size={13} strokeWidth={1.75} />
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

        {/* ── Right column ──────────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: 'var(--gap-grid)' }}>

          {/* Property info */}
          <Card>
            <CardHead title="Property info" />
            <dl className="flex flex-col gap-[10px]">
              {[
                { label: 'Name',        value: info.name },
                { label: 'Address',     value: info.address },
                { label: 'Billing day', value: String(info.billingDay) },
                { label: 'Contact',     value: info.contact },
                { label: 'Created',     value: info.createdAt },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-[12.5px] text-ink-4 shrink-0">{label}</dt>
                  <dd className="text-[12.5px] font-medium text-ink-2 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHead title="Quick actions" />
            <div className="flex flex-col gap-2">
              {[
                { icon: <DoorOpen size={14} strokeWidth={1.75} />, label: 'Add room',             href: `/landlord/properties/${property.id}/rooms/new` },
                { icon: <UserPlus size={14} strokeWidth={1.75} />, label: 'Add tenant',           href: `/landlord/tenants/new?property=${property.id}` },
                { icon: <Tag      size={14} strokeWidth={1.75} />, label: 'Add charge',           href: `/landlord/charges/new?property=${property.id}` },
                { icon: <Send     size={14} strokeWidth={1.75} />, label: 'Send all bill notices', href: '#' },
              ].map(({ icon, label, href }) => (
                <Button
                  key={label}
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => { if (href !== '#') navigate(href) }}
                >
                  {icon}
                  {label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Sub-tab note */}
          <p className="text-[12px] text-ink-4 leading-relaxed px-1">
            Sub-tabs show the same data as the top-level pages, filtered to this property only.
          </p>
        </div>
      </div>
    </main>
  )
}
