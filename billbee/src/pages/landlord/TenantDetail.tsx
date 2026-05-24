import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { MOCK_TENANTS } from '../../data/mock'
import { Button } from '../../components/ui/Button'
import { Card, CardHead } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Pill } from '../../components/ui/Pill'
import { MoveOutDrawer, TransferRoomDrawer } from './TenantActionDrawers'
import type { Column } from '../../components/ui/DataTable'
import type { BillStatus } from '../../components/ui/StatusBadge'

/* ── Types ─────────────────────────────────────────────────── */

type Tab = 'basics' | 'charges' | 'billing' | 'payments'

interface TenantCharge {
  id: string
  name: string
  kind: 'fixed' | 'tenant-spec'
  amountPHP: number
}

interface BillingRow {
  id: string
  month: string
  billNo: string
  totalPHP: number
  status: BillStatus
}

interface PaymentRow {
  id: string
  date: string
  amountPHP: number
  mode: string
  receiptNo: string
}

/* ── Shared styles ─────────────────────────────────────────── */

const FIELD_LABEL = 'text-[12px] text-ink-3 mb-1'
const INPUT = [
  'w-full px-3 py-2 text-[13.5px] border border-border rounded-btn',
  'bg-surface text-ink placeholder:text-ink-4',
  'focus:outline-none focus:border-border-strong transition-ui',
].join(' ')

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(n: number) { return `PHP ${n.toLocaleString('en-PH')}` }

function buildBillingRows(tenantId: string): BillingRow[] {
  return [
    { id: `${tenantId}-m03`, month: 'MAR', billNo: 'BILL-26-00041', totalPHP: 4350, status: 'posted' },
    { id: `${tenantId}-m02`, month: 'FEB', billNo: 'BILL-26-00033', totalPHP: 3750, status: 'paid'   },
    { id: `${tenantId}-m01`, month: 'JAN', billNo: 'BILL-26-00018', totalPHP: 3600, status: 'paid'   },
    { id: `${tenantId}-m12`, month: 'DEC', billNo: 'BILL-25-00498', totalPHP: 4100, status: 'overdue'},
  ]
}

function buildPaymentRows(tenantId: string): PaymentRow[] {
  return [
    { id: `${tenantId}-p1`, date: 'Feb 28', amountPHP: 3750, mode: 'cash',     receiptNo: 'RCT-0178' },
    { id: `${tenantId}-p2`, date: 'Jan 30', amountPHP: 3600, mode: 'e-wallet', receiptNo: 'RCT-0156' },
  ]
}

function buildCharges(tenantId: string): TenantCharge[] {
  if (tenantId === 't-004') return []
  return [
    { id: `${tenantId}-parking`, name: 'Parking Fee', kind: 'fixed',       amountPHP: 500 },
    { id: `${tenantId}-laptop`,  name: 'Laptop fee',  kind: 'tenant-spec', amountPHP: 100 },
  ]
}

/* ── Tab bar ───────────────────────────────────────────────── */

const TAB_DEFS: { key: Tab; label: string }[] = [
  { key: 'basics',   label: 'Basics'          },
  { key: 'charges',  label: 'Charges'         },
  { key: 'billing',  label: 'Billing History' },
  { key: 'payments', label: 'Payment History' },
]

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="flex border-b border-border mb-6">
      {TAB_DEFS.map(tab => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={[
            'flex items-center gap-1.5 px-1 pb-[10px] pt-1 mr-6 text-[14px] font-medium',
            'border-b-2 -mb-px whitespace-nowrap transition-ui select-none',
            active === tab.key
              ? 'text-ink border-accent'
              : 'text-ink-3 border-transparent hover:text-ink hover:border-border-strong',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

/* ── Tab: Basics ───────────────────────────────────────────── */

function BasicsTab({ tenant }: { tenant: ReturnType<typeof MOCK_TENANTS['find']> & object }) {
  return (
    <div className="grid grid-cols-2 max-[900px]:grid-cols-1" style={{ gap: 'var(--gap-grid)' }}>

      {/* Contact */}
      <Card>
        <CardHead title="Contact" />
        <div className="flex flex-col gap-3">
          <div>
            <label className={FIELD_LABEL}>Full name *</label>
            <input className={INPUT} defaultValue={tenant.name} />
          </div>
          <div>
            <label className={FIELD_LABEL}>Phone *</label>
            <input className={`${INPUT} font-mono`} defaultValue={tenant.phone} />
          </div>
          <div>
            <label className={FIELD_LABEL}>Email</label>
            <input className={`${INPUT} font-mono`} defaultValue={tenant.email ?? ''} placeholder="tenant@email.com" />
            <p className="text-[11.5px] text-ink-4 mt-1">for bill / receipt notices</p>
          </div>
          <div>
            <label className={FIELD_LABEL}>Emergency contact</label>
            <input className={INPUT} defaultValue="Liza Cruz · 0918-444-1234" />
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="primary">Save</Button>
          </div>
        </div>
      </Card>

      {/* Assignment */}
      <Card>
        <CardHead title="Assignment" />
        <dl className="flex flex-col gap-[10px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[12.5px] text-ink-4">Property</dt>
            <dd className="text-[13.5px] font-semibold text-ink">{tenant.propertyName}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[12.5px] text-ink-4">Room</dt>
            <dd className="font-mono text-[13.5px] font-semibold text-ink">{tenant.roomCode ?? '--'}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[12.5px] text-ink-4">Move-in date</dt>
            <dd className="text-[13.5px] font-medium text-ink">Jan 14, 2024</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[12.5px] text-ink-4">Rent share</dt>
            <dd className="font-mono text-[13.5px] font-semibold text-ink">{fmtPHP(3000)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[12.5px] text-ink-4">Room charges share</dt>
            <dd className="font-mono text-[13.5px] font-semibold text-ink">~{fmtPHP(650)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}

/* ── Tab: Charges ──────────────────────────────────────────── */

function ChargesTab({ tenant, charges }: {
  tenant: ReturnType<typeof MOCK_TENANTS['find']> & object
  charges: TenantCharge[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-3">
          Tenant-level and tenant-specific charges only. Room charges (Water, Electricity, Wi-Fi) come from Room {tenant.roomCode ?? '--'}.
        </p>
        <Button size="sm" variant="accent">
          <Plus size={13} strokeWidth={2} />
          Add Charge
        </Button>
      </div>

      <Card noPadding>
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              {['Charge', 'Type', 'Amount'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {charges.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[13px] text-ink-4">
                  No charges attached yet
                </td>
              </tr>
            ) : (
              charges.map(ch => (
                <tr key={ch.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">{ch.name}</td>
                  <td className="px-4 py-3">
                    <Pill variant={ch.kind === 'fixed' ? 'neutral' : 'accent'}>
                      {ch.kind === 'fixed' ? 'Fixed' : 'Tenant-specific'}
                    </Pill>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink-2">{fmtPHP(ch.amountPHP)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

/* ── Tab: Billing History ──────────────────────────────────── */

function BillingHistoryTab({ rows }: { rows: BillingRow[] }) {
  const columns: Column<BillingRow>[] = [
    { key: 'month',  header: 'Month',  width: '80px',  cell: r => <span className="font-mono text-[12px] text-ink-3">{r.month}</span> },
    { key: 'billNo', header: 'Bill #', width: '160px', cell: r => <span className="font-mono text-[12px] text-ink-2">{r.billNo}</span> },
    { key: 'total',  header: 'Total',  width: '130px', align: 'right', cell: r => <span className="font-mono text-[13px] text-ink-2">{fmtPHP(r.totalPHP)}</span> },
    { key: 'status', header: 'Status', width: '110px', cell: r => <StatusBadge status={r.status} /> },
  ]

  return (
    <Card noPadding>
      <DataTable columns={columns} rows={rows} getRowKey={r => r.id} emptyState="No billing history" />
    </Card>
  )
}

/* ── Tab: Payment History ──────────────────────────────────── */

function PaymentHistoryTab({ rows }: { rows: PaymentRow[] }) {
  const columns: Column<PaymentRow>[] = [
    { key: 'date',    header: 'Date',      width: '100px', cell: r => <span className="font-mono text-[12px] text-ink-3">{r.date}</span> },
    { key: 'amount',  header: 'Amount',    width: '130px', align: 'right', cell: r => <span className="font-mono text-[13px] text-ink-2">{fmtPHP(r.amountPHP)}</span> },
    { key: 'mode',    header: 'Mode',      width: '120px', cell: r => <span className="text-[13px] text-ink-2 capitalize">{r.mode}</span> },
    { key: 'receipt', header: 'Receipt #', width: '130px', cell: r => <span className="font-mono text-[12px] text-ink-3">{r.receiptNo}</span> },
  ]

  return (
    <Card noPadding>
      <DataTable columns={columns} rows={rows} getRowKey={r => r.id} emptyState="No payments recorded" />
    </Card>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function TenantDetail() {
  const { id } = useParams<{ id: string }>()
  const [tab,          setTab]          = useState<Tab>('basics')
  const [moveOutOpen,  setMoveOutOpen]  = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  const tenant = useMemo(
    () => MOCK_TENANTS.find(t => t.id === id) ?? MOCK_TENANTS[0],
    [id],
  )

  const billingRows = useMemo(() => buildBillingRows(tenant.id), [tenant.id])
  const paymentRows = useMemo(() => buildPaymentRows(tenant.id), [tenant.id])
  const charges     = useMemo(() => buildCharges(tenant.id),     [tenant.id])

  return (
    <main className="px-8 pt-7 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[28px] font-bold text-ink tracking-[-0.02em] leading-tight mb-1">
            {tenant.name}
          </h1>
          <div className="flex items-center gap-2 flex-wrap text-[13.5px] text-ink-3">
            {tenant.status === 'active'
              ? <StatusBadge status="active" />
              : <Pill variant="neutral" className="uppercase tracking-[0.04em]">moved out</Pill>}
            <span>{tenant.propertyName} · {tenant.roomCode ?? '--'} · since {tenant.moveInLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="default" onClick={() => setTransferOpen(true)}>Transfer room</Button>
          <Button variant="accent" onClick={() => setMoveOutOpen(true)}>Move out</Button>
        </div>
      </div>

      {/* Tab bar */}
      <TabBar active={tab} onChange={setTab} />

      {/* Tab content */}
      {tab === 'basics'   && <BasicsTab         tenant={tenant} />}
      {tab === 'charges'  && <ChargesTab        tenant={tenant} charges={charges} />}
      {tab === 'billing'  && <BillingHistoryTab rows={billingRows} />}
      {tab === 'payments' && <PaymentHistoryTab rows={paymentRows} />}

      <MoveOutDrawer
        open={moveOutOpen}
        onClose={() => setMoveOutOpen(false)}
        tenant={tenant}
      />

      <TransferRoomDrawer
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        tenant={tenant}
      />
    </main>
  )
}
