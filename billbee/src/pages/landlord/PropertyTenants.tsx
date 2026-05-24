import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Plus, ChevronDown, Search } from 'lucide-react'
import { MOCK_TENANTS, MOCK_ROOMS } from '../../data/mock'
import { AddTenantDrawer } from './AddTenantDrawer'
import type { Tenant, TenantStatus } from '../../types/tenants'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Pill } from '../../components/ui/Pill'
import type { Column } from '../../components/ui/DataTable'
import type { PropertyLayoutContext } from './PropertyLayout'

type StatusFilter = 'active' | 'all' | 'moved'

const SEL = [
  'appearance-none pl-3 pr-7 py-2 text-[13.5px] border border-border rounded-btn',
  'bg-surface text-ink-2 focus:outline-none focus:border-border-strong',
  'hover:bg-surface-2 hover:border-border-strong transition-ui cursor-pointer',
].join(' ')

function fmtMoveWindow(tenant: Tenant): string {
  if (tenant.status === 'moved' && tenant.moveOutLabel) {
    return `${tenant.moveInLabel} → ${tenant.moveOutLabel}`
  }
  return tenant.moveInLabel
}

function statusMatches(filter: StatusFilter, status: TenantStatus): boolean {
  if (filter === 'all') return true
  if (filter === 'moved') return status === 'moved'
  return status === 'active'
}

// Rooms belonging to this property by name (Tenant only stores propertyName)
function roomsForProperty(propertyName: string) {
  return Array.from(
    new Set(
      MOCK_TENANTS
        .filter(t => t.propertyName === propertyName && t.roomCode !== null)
        .map(t => t.roomCode as string),
    ),
  ).sort()
}

export function PropertyTenants() {
  const navigate = useNavigate()
  const { property } = useOutletContext<PropertyLayoutContext>()

  const [search,       setSearch]       = useState('')
  const [roomFilter,   setRoomFilter]   = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [drawerOpen,   setDrawerOpen]   = useState(false)

  const roomOptions = roomsForProperty(property.name)

  const propertyTenants = MOCK_TENANTS.filter(t => t.propertyName === property.name)

  const filtered = propertyTenants.filter(t => {
    if (roomFilter !== 'all' && t.roomCode !== roomFilter) return false
    if (!statusMatches(statusFilter, t.status)) return false
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      t.name.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q) ||
      (t.email?.toLowerCase().includes(q) ?? false)
    )
  })

  const columns: Column<Tenant>[] = [
    {
      key: 'tenant', header: 'Tenant', width: '180px',
      cell: r => <span className="font-medium text-ink">{r.name}</span>,
    },
    {
      key: 'room', header: 'Room', width: '100px',
      cell: r => (
        <span className="font-mono text-[12.5px] text-ink-2">
          {r.roomCode ?? '—'}
        </span>
      ),
    },
    {
      key: 'phone', header: 'Phone', width: '160px',
      cell: r => <span className="font-mono text-[12.5px] text-ink-2">{r.phone}</span>,
    },
    {
      key: 'email', header: 'Email', width: '170px',
      cell: r => (
        r.email
          ? <span className="font-mono text-[12.5px] text-ink-2">{r.email}</span>
          : <Pill variant="accent">missing</Pill>
      ),
    },
    {
      key: 'moveIn', header: 'Move-in', width: '170px',
      cell: r => <span className="text-ink-3">{fmtMoveWindow(r)}</span>,
    },
    {
      key: 'status', header: 'Status', width: '110px',
      cell: r => (
        r.status === 'active'
          ? <StatusBadge status="active" />
          : <Pill variant="neutral" className="uppercase tracking-[0.04em]">moved out</Pill>
      ),
    },
    {
      key: 'open', header: '', width: '120px', align: 'right',
      cell: r => (
        <Button
          size="sm"
          variant="primary"
          onClick={e => { e.stopPropagation(); navigate(`/landlord/tenants/${r.id}`) }}
        >
          Open {'->'}
        </Button>
      ),
    },
  ]

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-4" size={14} strokeWidth={1.75} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="name or phone..."
            className="pl-8 pr-3 py-2 text-[13.5px] border border-border rounded-btn bg-surface text-ink placeholder:text-ink-4 focus:outline-none focus:border-border-strong transition-ui min-w-[190px]"
          />
        </div>

        <div className="relative">
          <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className={SEL}>
            <option value="all">room: all</option>
            {roomOptions.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3" size={13} strokeWidth={1.75} />
        </div>

        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className={SEL}>
            <option value="active">status: active</option>
            <option value="all">status: all</option>
            <option value="moved">status: moved out</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3" size={13} strokeWidth={1.75} />
        </div>

        <span className="text-[13px] text-ink-3 tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </span>

        <Button variant="accent" className="ml-auto" onClick={() => setDrawerOpen(true)}>
          <Plus size={14} strokeWidth={2} />
          Add Tenant
        </Button>
      </div>

      {/* Table */}
      <Card noPadding>
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={r => r.id}
          onRowClick={r => navigate(`/landlord/tenants/${r.id}`)}
          emptyState="No tenants match the current filters"
        />
      </Card>

      <AddTenantDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
