import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Info, AlertTriangle,
  ChevronDown, MoreHorizontal, Search, SquarePen,
} from 'lucide-react'
import { MOCK_CHARGES, MOCK_PROPERTIES } from '../../data/mock'
import type { Charge, ChargeType, ChargeScope } from '../../types/charges'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Pill } from '../../components/ui/Pill'
import { DataTable } from '../../components/ui/DataTable'
import { Callout } from '../../components/ui/Callout'
import type { Column } from '../../components/ui/DataTable'
import type { PillVariant } from '../../components/ui/Pill'

/* ── Lookup tables ─────────────────────────────────────────── */

const TYPE_CONFIG: Record<ChargeType, { label: string; variant: PillVariant }> = {
  'fixed':           { label: 'Fixed',           variant: 'neutral' },
  'non-fixed':       { label: 'Non-fixed',        variant: 'accent'  },
  'tenant-specific': { label: 'Tenant-specific',  variant: 'info'    },
}

const SCOPE_LABEL: Record<ChargeScope, string> = {
  'room-level':   'Room-level',
  'room-fixed':   'Room-fixed',
  'tenant-level': 'Tenant-level',
}

function fmtAttached(v: Charge['attachedRooms']): string {
  if (!v) return '–'
  return `${v.count}/${v.total}`
}

/* ── Types ─────────────────────────────────────────────────── */

type StatusFilter   = 'any' | 'active' | 'inactive'
type TypeFilterVal  = 'any' | ChargeType
type ScopeFilterVal = 'any' | ChargeScope

/* ── Shared select className ───────────────────────────────── */

const SEL = [
  'appearance-none pl-3 pr-7 py-2 text-[13.5px] border border-border rounded-btn',
  'bg-surface text-ink-2 focus:outline-none focus:border-border-strong',
  'hover:bg-surface-2 hover:border-border-strong transition-ui cursor-pointer',
].join(' ')

/* ── Page ──────────────────────────────────────────────────── */

export function Charges() {
  const navigate = useNavigate()
  const [search,         setSearch]         = useState('')
  const [propertyFilter, setPropertyFilter] = useState('any')
  const [categoryFilter, setCategoryFilter] = useState('any')
  const [typeFilter,     setTypeFilter]     = useState<TypeFilterVal>('any')
  const [scopeFilter,    setScopeFilter]    = useState<ScopeFilterVal>('any')
  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>('active')

  const categories = Array.from(new Set(MOCK_CHARGES.map(c => c.category))).sort()

  const filtered = MOCK_CHARGES.filter(c => {
    if (propertyFilter !== 'any' && c.propertyId !== propertyFilter) return false
    if (statusFilter   !== 'any' && c.status      !== statusFilter)   return false
    if (categoryFilter !== 'any' && c.category    !== categoryFilter) return false
    if (typeFilter     !== 'any' && c.type        !== typeFilter)     return false
    if (scopeFilter    !== 'any' && c.scope       !== scopeFilter)    return false
    const q = search.trim().toLowerCase()
    if (q && !c.name.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q)) return false
    return true
  })

  const columns: Column<Charge>[] = [
    {
      key: 'name', header: 'Charge', width: '160px',
      cell: r => <span className="font-medium text-ink">{r.name}</span>,
    },
    {
      key: 'category', header: 'Category', width: '120px',
      cell: r => <span className="text-ink-3">{r.category}</span>,
    },
    {
      key: 'type', header: 'Type', width: '148px',
      cell: r => {
        const { label, variant } = TYPE_CONFIG[r.type]
        return <Pill variant={variant}>{label}</Pill>
      },
    },
    {
      key: 'scope', header: 'Scope', width: '120px',
      cell: r => <span className="text-ink-2">{SCOPE_LABEL[r.scope]}</span>,
    },
    {
      key: 'amount', header: 'Default amount', align: 'right', width: '130px',
      cell: r => (
        <span className="font-mono text-[13px] text-ink-2">
          {r.defaultAmountPHP != null ? `₱${r.defaultAmountPHP.toLocaleString('en-PH')}` : '–'}
        </span>
      ),
    },
    {
      key: 'attached', header: 'Attached to rooms', width: '144px',
      cell: r => (
        <span className="font-mono text-[12.5px] text-ink-3">{fmtAttached(r.attachedRooms)}</span>
      ),
    },
    {
      key: 'status', header: 'Status', width: '100px',
      cell: r => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions', header: '', align: 'right', width: '96px',
      cell: r => (
        <div className="flex items-center gap-1 justify-end">
          <IconButton
            onClick={e => { e.stopPropagation(); navigate(`/landlord/charges/${r.id}/edit`) }}
            aria-label="Edit charge"
          >
            <SquarePen size={14} strokeWidth={1.75} />
          </IconButton>
          <IconButton onClick={e => e.stopPropagation()} aria-label="More options">
            <MoreHorizontal size={14} strokeWidth={1.75} />
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <main className="px-8 pt-7 pb-16 max-w-[1320px] mx-auto w-full">
      <PageHead
        title="Charge Catalog"
        subtitle="defines what can be billed — creating a charge does not bill tenants"
        actions={
          <>
            {/* Property filter */}
            <div className="relative">
              <select
                value={propertyFilter}
                onChange={e => setPropertyFilter(e.target.value)}
                className={SEL}
              >
                <option value="any">All properties</option>
                {MOCK_PROPERTIES.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3"
                size={13} strokeWidth={1.75}
              />
            </div>

            <Button variant="accent" onClick={() => navigate('/landlord/charges/new')}>
              <Plus size={14} strokeWidth={2} />
              Add Charge
            </Button>
          </>
        }
      />

      {/* How charges flow */}
      <Callout variant="info" icon={<Info size={18} strokeWidth={1.75} />} className="mb-6">
        <div>
          <p className="font-semibold text-[13.5px] text-ink mb-1.5">How charges flow into bills:</p>
          <ul className="flex flex-col gap-0.5 text-[13px] text-ink-2">
            <li>
              <strong className="font-semibold text-ink-2">Room-level / Room-fixed</strong>
              {' — '}picked when creating or editing a room — split among the room's active tenants.
            </li>
            <li>
              <strong className="font-semibold text-ink-2">Tenant-level / Tenant-specific</strong>
              {' — '}attached to individual tenants — billed directly to them.
            </li>
          </ul>
        </div>
      </Callout>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-4"
            size={14} strokeWidth={1.75}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="search charges..."
            className="pl-8 pr-3 py-2 text-[13.5px] border border-border rounded-btn bg-surface text-ink placeholder:text-ink-4 focus:outline-none focus:border-border-strong transition-ui min-w-[180px]"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={SEL}>
            <option value="any">category: any</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3" size={13} strokeWidth={1.75} />
        </div>

        {/* Type */}
        <div className="relative">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as TypeFilterVal)} className={SEL}>
            <option value="any">type: any</option>
            <option value="fixed">Fixed</option>
            <option value="non-fixed">Non-fixed</option>
            <option value="tenant-specific">Tenant-specific</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3" size={13} strokeWidth={1.75} />
        </div>

        {/* Scope */}
        <div className="relative">
          <select value={scopeFilter} onChange={e => setScopeFilter(e.target.value as ScopeFilterVal)} className={SEL}>
            <option value="any">scope: any</option>
            <option value="room-level">Room-level</option>
            <option value="room-fixed">Room-fixed</option>
            <option value="tenant-level">Tenant-level</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3" size={13} strokeWidth={1.75} />
        </div>

        {/* Status */}
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className={SEL}>
            <option value="any">status: any</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3" size={13} strokeWidth={1.75} />
        </div>

        {/* Count */}
        <span className="ml-auto text-[13px] text-ink-3 tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'charge' : 'charges'}
        </span>
      </div>

      {/* Table */}
      <Card noPadding>
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={r => r.id}
          emptyState="No charges match the current filters"
        />
      </Card>

      {/* Rule reminder */}
      <Callout variant="warning" icon={<AlertTriangle size={18} strokeWidth={1.75} />} className="mt-6">
        <div>
          <p className="font-semibold text-[13.5px] text-ink mb-1.5">Rule reminder</p>
          <ul className="flex flex-col gap-0.5 text-[13px] text-ink-2 list-disc list-inside">
            <li>Fixed charges need an amount. Non-fixed ones don't (entered via CSV at billing).</li>
            <li>Inactive charges stay visible in old bills but cannot be selected for new ones.</li>
            <li>Duplicate active charge names within the same property are blocked.</li>
            <li>Room-level / Room-fixed charges show "attached to rooms" count — click a charge to manage which rooms include it.</li>
          </ul>
        </div>
      </Callout>
    </main>
  )
}
