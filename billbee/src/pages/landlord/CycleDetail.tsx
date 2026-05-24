import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, ChevronDown,
  MoreHorizontal, Users, Send,
} from 'lucide-react'
import { MOCK_CYCLE_DETAIL } from '../../data/mock'
import type { CycleBillRow, EmailStatus, BillRowStatus } from '../../types/billing'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatTile } from '../../components/ui/StatTile'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Pill } from '../../components/ui/Pill'
import { Callout } from '../../components/ui/Callout'

/* ── Helpers ───────────────────────────────────────────────── */

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH')}`
}

/* ── Email status pill ─────────────────────────────────────── */

const EMAIL_CONFIG: Record<EmailStatus, { label: string; variant: 'neutral' | 'up' | 'down' }> = {
  'not-sent': { label: 'Not sent', variant: 'neutral' },
  'sent':     { label: 'Sent',     variant: 'up'      },
  'failed':   { label: 'Failed',   variant: 'down'    },
  'na':       { label: 'N/A',      variant: 'neutral' },
}

/* ── Quick action label per bill state ─────────────────────── */

function quickActionLabel(status: BillRowStatus, emailStatus: EmailStatus): string {
  if (status === 'draft')   return 'Post'
  if (status === 'paid')    return 'View receipt'
  if (status === 'partial') return 'Record payment'
  if (emailStatus === 'failed') return 'Retry email'
  return 'Send notice'
}

function quickActionVariant(status: BillRowStatus): 'accent' | 'default' {
  return status === 'draft' ? 'accent' : 'default'
}

/* ── Filter tab type ───────────────────────────────────────── */

type FilterTab = 'all' | 'draft' | 'posted-unsent' | 'partial-paid' | 'failed-email' | 'overdue'

function matchesFilter(bill: CycleBillRow, tab: FilterTab): boolean {
  if (tab === 'all')          return true
  if (tab === 'draft')        return bill.status === 'draft'
  if (tab === 'posted-unsent')return bill.status === 'posted' && bill.emailStatus === 'not-sent'
  if (tab === 'partial-paid') return bill.status === 'partial' || bill.status === 'paid'
  if (tab === 'failed-email') return bill.emailStatus === 'failed'
  if (tab === 'overdue')      return bill.status === 'overdue'
  return true
}

/* ── Table header cell ─────────────────────────────────────── */

const TH = 'px-3 py-[10px] bg-bg text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap text-left'
const TD = 'px-3 text-ink-2 text-[13.5px]'

/* ── Pipeline step ─────────────────────────────────────────── */

function PipelineStep({
  index,
  label,
  count,
  sub,
  active = false,
  done = false,
}: {
  index: number
  label: string
  count?: number
  sub: string
  active?: boolean
  done?: boolean
}) {
  return (
    <div
      className={[
        'flex-1 px-5 py-4 transition-ui',
        active ? 'bg-accent-tint' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        {/* Step badge */}
        <span
          className={[
            'w-6 h-6 rounded-pill text-[11.5px] font-semibold flex items-center justify-center shrink-0',
            done
              ? 'border-2 border-ink bg-surface text-ink'
              : active
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-ink-3 border border-border',
          ].join(' ')}
        >
          {done ? '✓' : index}
        </span>
        <span className={`text-[14px] font-semibold tracking-[-0.01em] ${done ? 'text-ink-3' : 'text-ink'}`}>
          {label}
        </span>
        {count !== undefined && (
          <span className={`font-mono text-[13px] font-medium ${active ? 'text-accent-2' : 'text-ink-3'}`}>
            · {count}
          </span>
        )}
      </div>
      <p className={`text-[12.5px] pl-[34px] ${active ? 'text-accent-2 font-medium' : 'text-ink-4'}`}>{sub}</p>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */

const cycle = MOCK_CYCLE_DETAIL

export function CycleDetail() {
  const navigate = useNavigate()
  const [activeTab,    setActiveTab]    = useState<FilterTab>('all')
  const [search,       setSearch]       = useState('')
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set())
  const [ctxOpen,      setCtxOpen]      = useState(false)

  /* Filtering */
  const filtered = cycle.bills.filter(b => {
    if (!matchesFilter(b, activeTab)) return false
    const q = search.trim().toLowerCase()
    return !q || b.billNo.toLowerCase().includes(q) || b.tenant.toLowerCase().includes(q)
  })

  /* Tab counts */
  function tabCount(tab: FilterTab) {
    return cycle.bills.filter(b => matchesFilter(b, tab)).length
  }

  /* Selection */
  const allFilteredSelected = filtered.length > 0 && filtered.every(b => selectedIds.has(b.id))

  function toggleAll() {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filtered.forEach(b => next.delete(b.id))
        return next
      })
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filtered.forEach(b => next.add(b.id))
        return next
      })
    }
  }

  function toggleRow(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  /* Selection label for bulk bar */
  const selectedBills = cycle.bills.filter(b => selectedIds.has(b.id))
  const draftCount    = selectedBills.filter(b => b.status === 'draft').length

  const TABS: { id: FilterTab; label: string }[] = [
    { id: 'all',          label: 'All'           },
    { id: 'draft',        label: 'Drafts'        },
    { id: 'posted-unsent',label: 'Posted unsent' },
    { id: 'partial-paid', label: 'Partial / Paid'},
    { id: 'failed-email', label: 'Failed email'  },
    { id: 'overdue',      label: 'Overdue'       },
  ]

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-[28px] font-bold text-ink tracking-[-0.02em] leading-tight">
            {cycle.propertyName}
            <span className="text-ink-3 font-normal mx-2">·</span>
            {cycle.periodLabel}
          </h1>
          <Pill variant="info">In progress</Pill>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="accent">
            Post {cycle.pipeline.drafts.count} drafts
            <ArrowRight size={14} strokeWidth={1.75} />
          </Button>
          <Button variant="default">
            <MoreHorizontal size={14} strokeWidth={1.75} />
            More actions
          </Button>
        </div>
      </div>

      {/* Pipeline stepper */}
      <Card noPadding className="mb-5">
        <div className="flex items-stretch divide-x divide-border">
        <PipelineStep
          index={1} label="Drafts"
          count={cycle.pipeline.drafts.count}
          sub={cycle.pipeline.drafts.sub}
          done
        />
        <div className="flex items-center px-3 text-ink-4 shrink-0 bg-surface">
          <ChevronRight size={15} strokeWidth={1.5} />
        </div>
        <PipelineStep
          index={2} label="Post & notify"
          count={cycle.pipeline.postNotify.count}
          sub={cycle.pipeline.postNotify.sub}
          active={cycle.pipeline.postNotify.active}
        />
        <div className="flex items-center px-3 text-ink-4 shrink-0 bg-surface">
          <ChevronRight size={15} strokeWidth={1.5} />
        </div>
        <PipelineStep
          index={3} label="Collect"
          count={cycle.pipeline.collect.count}
          sub={cycle.pipeline.collect.sub}
        />
        <div className="flex items-center px-3 text-ink-4 shrink-0 bg-surface">
          <ChevronRight size={15} strokeWidth={1.5} />
        </div>
        <PipelineStep
          index={4} label="Closed"
          sub={cycle.pipeline.closed.sub}
        />
        </div>
      </Card>

      {/* Stat tiles */}
      <div className="grid grid-cols-4 mb-5" style={{ gap: 'var(--gap-grid)' }}>
        <StatTile
          label="Billed"
          value={fmtPHP(cycle.stats.billedPHP)}
          sub={cycle.stats.billedSub}
        />
        <StatTile
          label="Collected"
          value={fmtPHP(cycle.stats.collectedPHP)}
          sub={cycle.stats.collectedSub}
        />
        <StatTile
          label="Outstanding"
          value={fmtPHP(cycle.stats.outstandingPHP)}
          valueVariant="danger"
        />
        <StatTile
          label="Days to due"
          value={cycle.stats.daysTodue}
          sub={cycle.stats.dueDateLabel}
        />
      </div>

      {/* Missing-bill tenants callout */}
      {cycle.missingBillTenants && cycle.missingBillTenants.length > 0 && (
        <Callout
          variant="warning"
          icon={<Users size={18} strokeWidth={1.75} />}
          action={
            <Button size="sm" variant="default">
              Generate their bills
              <ArrowRight size={13} strokeWidth={1.75} />
            </Button>
          }
          className="mb-4"
        >
          <span className="text-[13.5px]">
            <strong className="font-semibold text-ink">
              {cycle.missingBillTenants.length} tenants
            </strong>
            {' '}in this cycle don't have bills yet —{' '}
            {cycle.missingBillTenants.join(', ')}.
          </span>
        </Callout>
      )}

      {/* Bills table card */}
      <Card noPadding>
        {/* Filter tab bar + search */}
        <div
          className="flex items-center justify-between gap-3 border-b border-border px-4"
          style={{ paddingTop: 'var(--pad-card)' }}
        >
          {/* Tabs */}
          <div className="flex items-center gap-0">
            {TABS.map(tab => {
              const count   = tabCount(tab.id)
              const isActive = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'flex items-center gap-1.5 px-1 pb-[10px] pt-1 mr-5',
                    'text-[13.5px] font-medium border-b-2 -mb-px whitespace-nowrap transition-ui select-none',
                    isActive
                      ? 'text-ink border-ink'
                      : 'text-ink-3 border-transparent hover:text-ink hover:border-border-strong',
                  ].join(' ')}
                >
                  {tab.label}
                  <span
                    className={[
                      'font-mono text-[11.5px] px-1 py-px rounded-xs',
                      isActive
                        ? (tab.id === 'draft' ? 'bg-accent text-white' : 'bg-surface-2 text-ink-3')
                        : 'text-ink-4',
                    ].join(' ')}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="tenant or bill #…"
            className="mb-2 pl-3 pr-3 py-1.5 text-[13px] border border-border rounded-btn bg-bg text-ink placeholder:text-ink-4 focus:outline-none focus:border-border-strong transition-ui w-[180px]"
          />
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b border-border">
                {/* Checkbox header */}
                <th className={`${TH} w-10`}>
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAll}
                    className="w-[14px] h-[14px] rounded-xs accent-ink cursor-pointer"
                  />
                </th>
                <th className={TH} style={{ width: '148px' }}>Bill #</th>
                <th className={TH} style={{ width: '100px' }}>Tenant</th>
                <th className={TH} style={{ width: '72px'  }}>Room</th>
                <th className={`${TH} text-right`} style={{ width: '90px' }}>Total</th>
                <th className={`${TH} text-right`} style={{ width: '90px' }}>Balance</th>
                <th className={TH} style={{ width: '96px' }}>Status</th>
                <th className={TH} style={{ width: '96px' }}>Email</th>
                <th className={TH}>Quick action</th>
                <th className={`${TH} w-10`} aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-12 text-center text-ink-3 text-[13.5px]">
                    No bills match the current filter
                  </td>
                </tr>
              ) : (
                filtered.map(bill => {
                  const isSelected = selectedIds.has(bill.id)
                  const { label: emailLabel, variant: emailVariant } = EMAIL_CONFIG[bill.emailStatus]
                  const qLabel   = quickActionLabel(bill.status, bill.emailStatus)
                  const qVariant = quickActionVariant(bill.status)

                  return (
                    <tr
                      key={bill.id}
                      onClick={() =>
                        navigate(
                          bill.status === 'draft'
                            ? `/landlord/billing/draft/${bill.id}`
                            : `/landlord/billing/posted/${bill.id}`
                        )
                      }
                      className={[
                        'border-b border-border-subtle transition-ui cursor-pointer',
                        isSelected ? 'bg-accent-tint' : 'hover:bg-surface-2',
                      ].join(' ')}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-3"
                        style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(bill.id)}
                          className="w-[14px] h-[14px] rounded-xs accent-ink cursor-pointer"
                        />
                      </td>

                      {/* Bill # */}
                      <td className={TD} style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}>
                        <span className="font-mono text-[12.5px] text-ink font-medium">{bill.billNo}</span>
                      </td>

                      {/* Tenant */}
                      <td className={TD} style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}>
                        {bill.tenant}
                      </td>

                      {/* Room */}
                      <td className={TD} style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}>
                        <span className="font-mono text-[12.5px]">{bill.room}</span>
                      </td>

                      {/* Total */}
                      <td className={`${TD} text-right`} style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}>
                        <span className="font-mono">{fmtPHP(bill.totalPHP)}</span>
                      </td>

                      {/* Balance */}
                      <td className={`${TD} text-right`} style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}>
                        <span className="font-mono">
                          {bill.balancePHP === null ? '–' : bill.balancePHP === 0 ? '₱0' : fmtPHP(bill.balancePHP)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className={TD} style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}>
                        <StatusBadge status={bill.status} />
                      </td>

                      {/* Email */}
                      <td className={TD} style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}>
                        {bill.emailStatus === 'na'
                          ? <span className="text-ink-4 text-[12.5px]">—</span>
                          : <Pill variant={emailVariant}>{emailLabel}</Pill>
                        }
                      </td>

                      {/* Quick action */}
                      <td
                        className={TD}
                        style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant={qVariant}>{qLabel}</Button>
                        </div>
                      </td>

                      {/* Open */}
                      <td
                        className={TD}
                        style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate(
                            bill.status === 'draft'
                              ? `/landlord/billing/draft/${bill.id}`
                              : `/landlord/billing/posted/${bill.id}`
                          )}
                        >
                          Open <ArrowRight size={13} strokeWidth={1.75} />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-surface-2 rounded-b-card">
            <span className="text-[13px] text-ink-2 font-medium">
              Selected {selectedIds.size} {selectedIds.size === 1 ? 'bill' : 'bills'}
              {draftCount > 0 && ` · ${draftCount} draft${draftCount > 1 ? 's' : ''}`}
            </span>
            <div className="flex items-center gap-2">
              {draftCount > 0 && (
                <Button size="sm" variant="accent">Post selected</Button>
              )}
              <Button size="sm" variant="default">
                <Send size={12} strokeWidth={1.75} />
                Send notices
              </Button>
              <Button size="sm" variant="ghost" className="text-danger hover:text-danger">Delete</Button>
              <Button size="sm" variant="ghost">Regenerate</Button>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-[12px] text-ink-4 hover:text-ink transition-ui"
            >
              Clear
            </button>
          </div>
        )}
      </Card>

      {/* Cycle context — collapsible
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setCtxOpen(v => !v)}
          className="flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink transition-ui select-none"
        >
          <ChevronRight
            size={14} strokeWidth={1.75}
            className={`transition-transform duration-150 ${ctxOpen ? 'rotate-90' : ''}`}
          />
          <ChevronRight size={14} strokeWidth={1.75} className="-ml-2.5" />
          Cycle context (CSV import, generated by, when)
        </button>

        {ctxOpen && (
          <div className="mt-3 bg-surface border border-border rounded-btn px-4 py-3 text-[13px] text-ink-2 flex flex-col gap-1.5">
            <p>
              <span className="text-ink-3 w-28 inline-block">CSV import</span>
              {cycle.cycleContext.csvImport}
            </p>
            <p>
              <span className="text-ink-3 w-28 inline-block">Generated by</span>
              {cycle.cycleContext.generatedBy}
            </p>
            <p>
              <span className="text-ink-3 w-28 inline-block">Generated at</span>
              {cycle.cycleContext.generatedAt}
            </p>
          </div>
        )}
      </div> */}

    </main>
  )
}
