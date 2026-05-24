import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Download, Info, Plus, Search, Upload } from 'lucide-react'
import { MOCK_TENANTS } from '../../data/mock'
import { AddTenantDrawer } from './AddTenantDrawer'
import type { Tenant, TenantStatus } from '../../types/tenants'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Pill } from '../../components/ui/Pill'
import { Callout } from '../../components/ui/Callout'
import type { Column } from '../../components/ui/DataTable'

type StatusFilter = 'active' | 'all' | 'moved'

const SEL = [
  'appearance-none pl-3 pr-7 py-2 text-[13.5px] border border-border rounded-btn',
  'bg-surface text-ink-2 focus:outline-none focus:border-border-strong',
  'hover:bg-surface-2 hover:border-border-strong transition-ui cursor-pointer',
].join(' ')

function fmtMoveWindow(tenant: Tenant): string {
  if (tenant.status === 'moved' && tenant.moveOutLabel) {
    return `${tenant.moveInLabel} -> ${tenant.moveOutLabel}`
  }
  return tenant.moveInLabel
}

function statusMatches(filter: StatusFilter, status: TenantStatus): boolean {
  if (filter === 'all') return true
  if (filter === 'moved') return status === 'moved'
  return status === 'active'
}

export function Tenants() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [roomFilter, setRoomFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [missingEmailOnly, setMissingEmailOnly] = useState(false)

  const propertyOptions = useMemo(
    () => Array.from(new Set(MOCK_TENANTS.map(t => t.propertyName))).sort(),
    [],
  )

  const roomOptions = useMemo(
    () => Array.from(new Set(
      MOCK_TENANTS
        .map(t => t.roomCode)
        .filter((room): room is string => room !== null),
    )).sort(),
    [],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MOCK_TENANTS.filter(t => {
      if (propertyFilter !== 'all' && t.propertyName !== propertyFilter) return false
      if (roomFilter !== 'all' && t.roomCode !== roomFilter) return false
      if (!statusMatches(statusFilter, t.status)) return false
      if (missingEmailOnly && t.email) return false
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q) ||
        (t.email?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [missingEmailOnly, propertyFilter, roomFilter, search, statusFilter])

  const activeCount = MOCK_TENANTS.filter(t => t.status === 'active').length
  const movedCount = MOCK_TENANTS.filter(t => t.status === 'moved').length

  const columns: Column<Tenant>[] = [
    {
      key: 'pick',
      header: <input type="checkbox" aria-label="Select all tenants" />,
      width: '48px',
      cell: () => <input type="checkbox" aria-label="Select tenant" onClick={e => e.stopPropagation()} />,
    },
    {
      key: 'tenant',
      header: 'Tenant',
      width: '180px',
      cell: r => <span className="font-medium text-ink">{r.name}</span>,
    },
    {
      key: 'propertyRoom',
      header: 'Property · Room',
      width: '180px',
      cell: r => (
        <span className="text-ink-3">
          {r.propertyName}{' '}
          <span className="font-mono text-[12.5px] text-ink-2">
            {r.roomCode ? `- ${r.roomCode}` : '- -'}
          </span>
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      width: '160px',
      cell: r => <span className="font-mono text-[12.5px] text-ink-2">{r.phone}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      width: '170px',
      cell: r => (
        r.email
          ? <span className="font-mono text-[12.5px] text-ink-2">{r.email}</span>
          : <Pill variant="accent">missing</Pill>
      ),
    },
    {
      key: 'moveIn',
      header: 'Move-in',
      width: '170px',
      cell: r => <span className="text-ink-3">{fmtMoveWindow(r)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      cell: r => (
        r.status === 'active'
          ? <StatusBadge status="active" />
          : <Pill variant="neutral" className="uppercase tracking-[0.04em]">moved out</Pill>
      ),
    },
    {
      key: 'open',
      header: '',
      width: '120px',
      align: 'right',
      cell: r => (
        <Button
          size="sm"
          variant="primary"
          onClick={e => {
            e.stopPropagation()
            navigate(`/landlord/tenants/${r.id}`)
          }}
        >
          Open {'->'}
        </Button>
      ),
    },
  ]

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">
      <PageHead
        title="Tenants"
        subtitle={`${MOCK_TENANTS.length} records · ${activeCount} active · ${movedCount} moved out`}
        actions={
          <>
            <Button variant="default">
              <Download size={14} strokeWidth={1.75} />
              Export
            </Button>
            <Button variant="default">
              <Upload size={14} strokeWidth={1.75} />
              Import CSV
            </Button>
            <Button variant="accent" onClick={() => setDrawerOpen(true)}>
              <Plus size={14} strokeWidth={2} />
              Add Tenant
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-4"
            size={14}
            strokeWidth={1.75}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="name or phone..."
            className="pl-8 pr-3 py-2 text-[13.5px] border border-border rounded-btn bg-surface text-ink placeholder:text-ink-4 focus:outline-none focus:border-border-strong transition-ui min-w-[190px]"
          />
        </div>

        <div className="relative">
          <select value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)} className={SEL}>
            <option value="all">property: all</option>
            {propertyOptions.map(property => (
              <option key={property} value={property}>
                {property}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3" size={13} strokeWidth={1.75} />
        </div>

        <div className="relative">
          <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className={SEL}>
            <option value="all">room: all</option>
            {roomOptions.map(room => (
              <option key={room} value={room}>
                {room}
              </option>
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

        <span className="ml-auto text-[13px] text-ink-3 tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      <Card noPadding>
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={row => row.id}
          onRowClick={row => navigate(`/landlord/tenants/${row.id}`)}
          emptyState="No tenants match the current filters"
        />
      </Card>

      <AddTenantDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </main>
  )
}
