import { useState } from 'react'
import {
  FileText,
  Wallet,
  AlertCircle,
  Clock,
  Users,
  Building2,
  Download,
  Printer,
  ExternalLink,
  TrendingUp,
} from 'lucide-react'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatTile } from '../../components/ui/StatTile'

/* ── Types ─────────────────────────────────────────────────── */

type ReportId =
  | 'billing-summary'
  | 'payment-collection'
  | 'outstanding-balance'
  | 'overdue-bills'
  | 'tenant-list'
  | 'occupancy'

interface ReportDef {
  id: ReportId
  name: string
  description: string
  icon: React.ReactNode
}

/* ── Report definitions ────────────────────────────────────── */

const REPORTS: ReportDef[] = [
  {
    id: 'billing-summary',
    name: 'Billing Summary',
    description: 'Overview of all bills generated per period — billed, collected, and outstanding totals.',
    icon: <FileText size={20} strokeWidth={1.5} />,
  },
  {
    id: 'payment-collection',
    name: 'Payment Collection',
    description: 'Breakdown of payments received, by mode and tenant, across billing periods.',
    icon: <Wallet size={20} strokeWidth={1.5} />,
  },
  {
    id: 'outstanding-balance',
    name: 'Outstanding Balance',
    description: 'Current unpaid balances per tenant with aging information.',
    icon: <AlertCircle size={20} strokeWidth={1.5} />,
  },
  {
    id: 'overdue-bills',
    name: 'Overdue Bills',
    description: 'Bills that have passed their due date without full payment.',
    icon: <Clock size={20} strokeWidth={1.5} />,
  },
  {
    id: 'tenant-list',
    name: 'Tenant List',
    description: 'Full directory of current and past tenants with room and lease details.',
    icon: <Users size={20} strokeWidth={1.5} />,
  },
  {
    id: 'occupancy',
    name: 'Occupancy',
    description: 'Room occupancy rates and vacancy history across all properties.',
    icon: <Building2 size={20} strokeWidth={1.5} />,
  },
]

/* ── Mock filter options ───────────────────────────────────── */

const PROPERTIES = ['All properties', 'Sunset Apartments', 'Maple Residences', 'Pine Court']
const STATUSES   = ['All statuses', 'Posted', 'Draft', 'Overdue']

/* ── Mock table data (Billing Summary) ────────────────────── */

interface BillingSummaryRow {
  period: string
  property: string
  bills: number
  billed: number
  paid: number
  outstanding: number
}

const BILLING_ROWS: BillingSummaryRow[] = [
  { period: 'Mar 2026', property: 'Sunset Apartments', bills: 8,  billed: 42400, paid: 36050, outstanding: 6350 },
  { period: 'Mar 2026', property: 'Maple Residences',  bills: 5,  billed: 27500, paid: 27500, outstanding: 0 },
  { period: 'Mar 2026', property: 'Pine Court',        bills: 4,  billed: 18800, paid: 12200, outstanding: 6600 },
  { period: 'Feb 2026', property: 'Sunset Apartments', bills: 8,  billed: 41200, paid: 41200, outstanding: 0 },
  { period: 'Feb 2026', property: 'Maple Residences',  bills: 5,  billed: 27000, paid: 24300, outstanding: 2700 },
  { period: 'Feb 2026', property: 'Pine Court',        bills: 4,  billed: 18800, paid: 18800, outstanding: 0 },
]

const TOTALS = {
  bills:       BILLING_ROWS.reduce((s, r) => s + r.bills, 0),
  billed:      BILLING_ROWS.reduce((s, r) => s + r.billed, 0),
  paid:        BILLING_ROWS.reduce((s, r) => s + r.paid, 0),
  outstanding: BILLING_ROWS.reduce((s, r) => s + r.outstanding, 0),
}

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

function fmtPct(num: number, den: number) {
  if (!den) return '0%'
  return `${Math.round((num / den) * 100)}%`
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/* ── Report card ───────────────────────────────────────────── */

function ReportCard({
  report,
  selected,
  onSelect,
}: {
  report: ReportDef
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={[
        'relative flex flex-col gap-3 rounded-card border cursor-pointer transition-ui',
        'bg-surface hover:border-border-strong',
        selected
          ? 'border-accent ring-1 ring-accent'
          : 'border-border',
      ].join(' ')}
      style={{ padding: 'var(--pad-card)' }}
    >
      {/* Icon */}
      <span
        className={[
          'w-9 h-9 rounded-chip inline-flex items-center justify-center shrink-0',
          selected ? 'bg-accent-soft text-accent-2' : 'bg-surface-2 text-ink-3',
        ].join(' ')}
      >
        {report.icon}
      </span>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13.5px] font-semibold mb-0.5 ${selected ? 'text-accent-2' : 'text-ink'}`}>
          {report.name}
        </p>
        <p className="text-[12px] text-ink-3 leading-[1.5]">{report.description}</p>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1">
        <Button size="sm" variant="default" onClick={e => e.stopPropagation()}>
          <Download size={12} strokeWidth={1.75} />
          PDF
        </Button>
        <Button size="sm" variant="default" onClick={e => e.stopPropagation()}>
          <Download size={12} strokeWidth={1.75} />
          Excel
        </Button>
        <Button size="sm" variant="default" onClick={e => e.stopPropagation()}>
          <Printer size={12} strokeWidth={1.75} />
          Print
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
          onClick={e => { e.stopPropagation(); onSelect() }}
        >
          Open
          <ExternalLink size={11} strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  )
}

/* ── Billing Summary preview ───────────────────────────────── */

function BillingSummaryPreview() {
  const [dateFrom, setDateFrom] = useState('2026-02-01')
  const [dateTo,   setDateTo]   = useState(todayISO())
  const [property, setProperty] = useState(PROPERTIES[0])
  const [status,   setStatus]   = useState(STATUSES[0])
  const [ran,      setRan]      = useState(true)

  const collectionRate = fmtPct(TOTALS.paid, TOTALS.billed)

  const INPUT_CLS =
    'border border-border rounded-btn px-3 py-[7px] text-[13px] text-ink bg-surface ' +
    'focus:outline-none focus:border-accent transition-colors placeholder:text-ink-4'

  return (
    <div className="flex flex-col gap-5">

      {/* Filter bar */}
      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
            Property
          </label>
          <select
            value={property}
            onChange={e => setProperty(e.target.value)}
            className={INPUT_CLS}
          >
            {PROPERTIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
            Status
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className={INPUT_CLS}
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <Button variant="accent" onClick={() => setRan(true)}>
          Run report
        </Button>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="default">
            <Download size={13} strokeWidth={1.75} />
            PDF
          </Button>
          <Button variant="default">
            <Download size={13} strokeWidth={1.75} />
            Excel
          </Button>
          <Button variant="default">
            <Printer size={13} strokeWidth={1.75} />
            Print
          </Button>
        </div>
      </div>

      {/* Stat tiles */}
      {ran && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <StatTile
              label="Total billed"
              value={fmtPHP(TOTALS.billed)}
              icon={<FileText size={14} strokeWidth={1.5} />}
              iconVariant="default"
            />
            <StatTile
              label="Collected"
              value={fmtPHP(TOTALS.paid)}
              icon={<Wallet size={14} strokeWidth={1.5} />}
              iconVariant="success"
            />
            <StatTile
              label="Outstanding"
              value={fmtPHP(TOTALS.outstanding)}
              icon={<AlertCircle size={14} strokeWidth={1.5} />}
              iconVariant={TOTALS.outstanding > 0 ? 'danger' : 'default'}
              valueVariant={TOTALS.outstanding > 0 ? 'danger' : 'default'}
            />
            <StatTile
              label="Collection rate"
              value={collectionRate}
              icon={<TrendingUp size={14} strokeWidth={1.5} />}
              iconVariant="accent"
            />
          </div>

          {/* Results table */}
          <Card noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">
                      Period
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">
                      Property
                    </th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">
                      Bills
                    </th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">
                      Billed
                    </th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">
                      Paid
                    </th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">
                      Outstanding
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BILLING_ROWS.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{row.period}</td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">{row.property}</td>
                      <td className="px-4 py-3 text-right font-mono text-ink-2">{row.bills}</td>
                      <td className="px-4 py-3 text-right font-mono text-ink">{fmtPHP(row.billed)}</td>
                      <td className="px-4 py-3 text-right font-mono text-ink">{fmtPHP(row.paid)}</td>
                      <td className={`px-4 py-3 text-right font-mono ${row.outstanding > 0 ? 'text-danger font-medium' : 'text-ink-3'}`}>
                        {row.outstanding > 0 ? fmtPHP(row.outstanding) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Totals row */}
                <tfoot>
                  <tr className="border-t-2 border-border-strong bg-surface-2">
                    <td className="px-4 py-3 text-[12.5px] font-semibold text-ink" colSpan={2}>
                      Totals
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                      {TOTALS.bills}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                      {fmtPHP(TOTALS.billed)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                      {fmtPHP(TOTALS.paid)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${TOTALS.outstanding > 0 ? 'text-danger' : 'text-ink-3'}`}>
                      {TOTALS.outstanding > 0 ? fmtPHP(TOTALS.outstanding) : '—'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

/* ── Coming soon preview ───────────────────────────────────── */

function ComingSoonPreview({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-4 gap-2">
      <span className="text-[13px]">{name} report preview coming soon</span>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

export function Reports() {
  const [selected, setSelected] = useState<ReportId>('billing-summary')

  const activeReport = REPORTS.find(r => r.id === selected)!

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">
      <PageHead
        title="Reports"
        subtitle="Generate and export reports across billing, payments, tenants, and occupancy."
      />

      {/* Report type grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {REPORTS.map(report => (
          <ReportCard
            key={report.id}
            report={report}
            selected={selected === report.id}
            onSelect={() => setSelected(report.id)}
          />
        ))}
      </div>

      {/* Preview section */}
      <div className="flex flex-col gap-4">
        {/* Section header */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
            Selected:
          </span>
          <span className="text-[13.5px] font-semibold text-ink">{activeReport.name}</span>
        </div>

        {/* Preview content */}
        {selected === 'billing-summary' && <BillingSummaryPreview />}
        {selected !== 'billing-summary' && <ComingSoonPreview name={activeReport.name} />}
      </div>
    </main>
  )
}
