import { useState, useMemo } from 'react'
import {
  Search, Download, ChevronDown, ChevronRight,
  AlertTriangle, ShieldAlert, RefreshCw, X,
  LogIn, LogOut, FilePen, AlertCircle, MonitorSmartphone, Lock,
} from 'lucide-react'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'

/* ══════════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════════ */

type LogType    = 'auth' | 'transaction' | 'error' | 'access'
type ActorRole  = 'admin' | 'landlord' | 'system'

interface LogEntry {
  id:          string
  ts:          string          // ISO
  type:        LogType
  user:        string          // email or 'System'
  userName:    string          // display name
  userRole:    ActorRole
  module:      string
  action:      string
  description: string
  ip:          string
  device?:     string
  suspicious?: boolean
  // Transaction detail
  oldValue?:   string | null
  newValue?:   string | null
  // Error detail
  stackTrace?: string
}

/* ══════════════════════════════════════════════════════════════
   Mock data
══════════════════════════════════════════════════════════════ */

const ALL_LOGS: LogEntry[] = [
  // ── Suspicious auth cluster ────────────────────────────────
  { id:'L001', ts:'2026-05-27T09:55:00', type:'auth', user:'r.cruz@billbee.ph',       userName:'Roberto Cruz',         userRole:'landlord', module:'Authentication',  action:'Account Locked',   description:'Account locked after 5 failed login attempts',                          ip:'10.0.0.42',     device:'Chrome 124 · Windows',    suspicious:true },
  { id:'L002', ts:'2026-05-27T09:54:00', type:'auth', user:'r.cruz@billbee.ph',       userName:'Roberto Cruz',         userRole:'landlord', module:'Authentication',  action:'Login Failed',     description:'Invalid password — attempt 5 of 5',                                    ip:'10.0.0.42',     device:'Chrome 124 · Windows',    suspicious:true },
  { id:'L003', ts:'2026-05-27T09:53:00', type:'auth', user:'r.cruz@billbee.ph',       userName:'Roberto Cruz',         userRole:'landlord', module:'Authentication',  action:'Login Failed',     description:'Invalid password — attempt 4 of 5',                                    ip:'10.0.0.42',     device:'Chrome 124 · Windows',    suspicious:true },
  { id:'L004', ts:'2026-05-27T09:52:00', type:'auth', user:'r.cruz@billbee.ph',       userName:'Roberto Cruz',         userRole:'landlord', module:'Authentication',  action:'Login Failed',     description:'Invalid password — attempt 3 of 5',                                    ip:'10.0.0.42',     device:'Chrome 124 · Windows',    suspicious:true },
  { id:'L005', ts:'2026-05-27T09:51:00', type:'auth', user:'r.cruz@billbee.ph',       userName:'Roberto Cruz',         userRole:'landlord', module:'Authentication',  action:'Login Failed',     description:'Invalid password — attempt 2 of 5',                                    ip:'10.0.0.42',     device:'Chrome 124 · Windows',    suspicious:true },
  // ── Normal auth ────────────────────────────────────────────
  { id:'L006', ts:'2026-05-27T09:14:00', type:'auth', user:'maria@sunsetapts.ph',     userName:'Maria Dela Cruz',      userRole:'landlord', module:'Authentication',  action:'Login',            description:'Successful login',                                                      ip:'192.168.1.105', device:'Chrome 124 · Windows'   },
  { id:'L007', ts:'2026-05-27T08:00:00', type:'auth', user:'admin@billbee.ph',        userName:'System Administrator', userRole:'admin',    module:'Authentication',  action:'Login',            description:'Successful login',                                                      ip:'192.168.1.1',   device:'Firefox 125 · macOS'    },
  { id:'L008', ts:'2026-05-26T17:30:00', type:'auth', user:'maria@sunsetapts.ph',     userName:'Maria Dela Cruz',      userRole:'landlord', module:'Authentication',  action:'Logout',           description:'User logged out',                                                       ip:'192.168.1.105', device:'Chrome 124 · Windows'   },
  { id:'L009', ts:'2026-05-26T14:30:00', type:'auth', user:'j.reyes@sunsetapts.ph',   userName:'Jose Reyes',           userRole:'landlord', module:'Authentication',  action:'Login',            description:'Successful login',                                                      ip:'10.0.1.55',     device:'Safari 17 · iOS'        },
  // ── Transaction — User Management ─────────────────────────
  { id:'L010', ts:'2026-05-27T08:15:00', type:'transaction', user:'admin@billbee.ph', userName:'System Administrator', userRole:'admin',    module:'User Management', action:'User Created',     description:'New landlord account created: Ana Santos',                              ip:'192.168.1.1',   oldValue:null,                newValue:'{"name":"Ana Santos","email":"a.santos@property.ph","role":"landlord","status":"pending"}' },
  { id:'L011', ts:'2026-05-27T08:20:00', type:'transaction', user:'admin@billbee.ph', userName:'System Administrator', userRole:'admin',    module:'User Management', action:'Status Changed',   description:'User r.cruz@billbee.ph suspended',                                      ip:'192.168.1.1',   oldValue:'{"status":"active"}', newValue:'{"status":"suspended"}' },
  { id:'L012', ts:'2026-05-26T14:05:00', type:'transaction', user:'admin@billbee.ph', userName:'System Administrator', userRole:'admin',    module:'User Management', action:'Role Changed',     description:'a.lim@props.ph role updated',                                           ip:'192.168.1.1',   oldValue:'{"role":"landlord"}', newValue:'{"role":"admin"}' },
  // ── Transaction — Billing ──────────────────────────────────
  { id:'L013', ts:'2026-05-25T10:00:00', type:'transaction', user:'maria@sunsetapts.ph', userName:'Maria Dela Cruz',   userRole:'landlord', module:'Billing Center',  action:'Bills Generated', description:'15 draft bills created for May 2026 · Sunset Apartments',              ip:'192.168.1.105'                                          },
  { id:'L014', ts:'2026-05-25T11:30:00', type:'transaction', user:'maria@sunsetapts.ph', userName:'Maria Dela Cruz',   userRole:'landlord', module:'Billing Center',  action:'Bill Posted',     description:'Bill BILL-26-00041 posted for Joseph Cruz',                             ip:'192.168.1.105', oldValue:'{"status":"draft"}',  newValue:'{"status":"posted"}' },
  { id:'L015', ts:'2026-05-24T15:10:00', type:'transaction', user:'maria@sunsetapts.ph', userName:'Maria Dela Cruz',   userRole:'landlord', module:'Payments',        action:'Payment Recorded','description':'₱3,000 payment recorded for Joseph Cruz · Bill BILL-26-00041',      ip:'192.168.1.105'                                          },
  { id:'L016', ts:'2026-05-23T09:45:00', type:'transaction', user:'maria@sunsetapts.ph', userName:'Maria Dela Cruz',   userRole:'landlord', module:'Tenants',         action:'Tenant Added',    description:'Joseph Cruz added to Room A-101 · Sunset Apartments',                  ip:'192.168.1.105'                                          },
  { id:'L017', ts:'2026-05-22T11:20:00', type:'transaction', user:'maria@sunsetapts.ph', userName:'Maria Dela Cruz',   userRole:'landlord', module:'Charges',         action:'Charge Updated',  description:'Late Penalty fee updated',                                              ip:'192.168.1.105', oldValue:'{"amount":200}',      newValue:'{"amount":300}' },
  { id:'L018', ts:'2026-05-21T13:00:00', type:'transaction', user:'maria@sunsetapts.ph', userName:'Maria Dela Cruz',   userRole:'landlord', module:'Properties',      action:'Property Created','description':'Created property "Sunset Apartments"',                               ip:'192.168.1.105', oldValue:null,                newValue:'{"name":"Sunset Apartments","billingDay":15,"status":"active"}' },
  // ── Error logs ─────────────────────────────────────────────
  { id:'L019', ts:'2026-05-27T07:45:00', type:'error', user:'System',                 userName:'System',               userRole:'system',   module:'Email Service',   action:'Email Failed',     description:'Failed to send billing notice to j.santos@tenant.ph',                  ip:'-',             stackTrace:'SMTPError: Connection refused at port 587\n  at Mailer.send (mailer.js:142)\n  at BillNotification.handle (notifications.js:88)\n  at async Queue.process (queue.js:55)' },
  { id:'L020', ts:'2026-05-26T03:00:00', type:'error', user:'System',                 userName:'System',               userRole:'system',   module:'Backup',          action:'Backup Failed',    description:'Scheduled nightly backup did not complete',                             ip:'-',             stackTrace:'Error: Insufficient disk space (used: 9.8 GB / 10 GB)\n  at BackupService.run (backup.js:77)\n  at Scheduler.execute (scheduler.js:23)\n  at CronJob.run (cron.js:105)' },
  { id:'L021', ts:'2026-05-25T16:22:00', type:'error', user:'System',                 userName:'System',               userRole:'system',   module:'Reports',         action:'PDF Export Failed', description:'PDF export timeout for Billing Summary Report',                        ip:'-',             stackTrace:'DOMPDFException: Execution timeout exceeded (30s)\n  at PdfGenerator.render (pdf.js:94)\n  at ReportController.export (reports.js:211)\n  at async Kernel.handle (kernel.js:43)' },
  // ── Access logs ────────────────────────────────────────────
  { id:'L022', ts:'2026-05-27T09:15:00', type:'access', user:'maria@sunsetapts.ph',   userName:'Maria Dela Cruz',      userRole:'landlord', module:'Billing Center',  action:'Page Visit',       description:'Viewed cycle detail — Sunset Apartments · May 2026',                   ip:'192.168.1.105', device:'Chrome 124 · Windows'   },
  { id:'L023', ts:'2026-05-27T09:21:00', type:'access', user:'maria@sunsetapts.ph',   userName:'Maria Dela Cruz',      userRole:'landlord', module:'Reports',         action:'Export',           description:'Exported Payment Collection Report to Excel',                          ip:'192.168.1.105', device:'Chrome 124 · Windows'   },
  { id:'L024', ts:'2026-05-27T08:05:00', type:'access', user:'admin@billbee.ph',      userName:'System Administrator', userRole:'admin',    module:'Audit Logs',      action:'Page Visit',       description:'Viewed Audit Logs',                                                     ip:'192.168.1.1',   device:'Firefox 125 · macOS'    },
  { id:'L025', ts:'2026-05-26T14:32:00', type:'access', user:'j.reyes@sunsetapts.ph', userName:'Jose Reyes',           userRole:'landlord', module:'Dashboard',       action:'Page Visit',       description:'Viewed Landlord Dashboard',                                             ip:'10.0.1.55',     device:'Safari 17 · iOS'        },
  { id:'L026', ts:'2026-05-26T11:00:00', type:'access', user:'admin@billbee.ph',      userName:'System Administrator', userRole:'admin',    module:'User Management', action:'Bulk Export',      description:'Exported full user list to CSV (8 records)',                            ip:'192.168.1.1',   device:'Firefox 125 · macOS'    },
]

/* ══════════════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════════════ */

const TYPE_META: Record<LogType, {
  label: string
  icon: typeof LogIn
  chip: string
  row: string
}> = {
  auth:        { label:'Auth',        icon: LogIn,          chip:'bg-accent-soft text-accent-2',   row:'' },
  transaction: { label:'Transaction', icon: FilePen,        chip:'bg-surface-2 text-ink-2',        row:'' },
  error:       { label:'Error',       icon: AlertCircle,    chip:'bg-danger/10 text-danger',        row:'' },
  access:      { label:'Access',      icon: MonitorSmartphone, chip:'bg-info-soft text-info',      row:'' },
}

const SUSPICIOUS_ROW = 'border-l-[3px] border-l-warning bg-warning/[0.03]'

const ALL_MODULES = [...new Set(ALL_LOGS.map(l => l.module))].sort()
const ALL_USERS   = [...new Set(ALL_LOGS.filter(l => l.userRole !== 'system').map(l => l.user))].sort()

type TabId    = 'all' | LogType
type DateRange = 'all' | 'today' | '7d' | '30d'

const RANGES: { label: string; value: DateRange }[] = [
  { label: 'All time', value: 'all' },
  { label: 'Today',    value: 'today' },
  { label: '7 days',   value: '7d' },
  { label: '30 days',  value: '30d' },
]

/* ══════════════════════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════════════════════ */

function fmtTs(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-PH', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isInRange(iso: string, range: DateRange): boolean {
  if (range === 'all') return true
  const now  = new Date()
  const date = new Date(iso)
  const diffMs = now.getTime() - date.getTime()
  if (range === 'today') return diffMs < 86_400_000
  if (range === '7d')    return diffMs < 7 * 86_400_000
  return diffMs < 30 * 86_400_000
}

function hasDetail(log: LogEntry): boolean {
  return !!(log.oldValue !== undefined || log.newValue !== undefined || log.stackTrace)
}

/* ══════════════════════════════════════════════════════════════
   Log type badge
══════════════════════════════════════════════════════════════ */

function TypeBadge({ type, suspicious }: { type: LogType; suspicious?: boolean }) {
  const meta = TYPE_META[type]
  const Icon = meta.icon
  return (
    <span className={[
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[11.5px] font-semibold',
      suspicious ? 'bg-warning/15 text-warning' : meta.chip,
    ].join(' ')}>
      {suspicious
        ? <ShieldAlert size={11} strokeWidth={2} />
        : <Icon size={11} strokeWidth={2} />
      }
      {meta.label}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   Role chip
══════════════════════════════════════════════════════════════ */

function RoleChip({ role }: { role: ActorRole }) {
  const s = {
    admin:    'text-ink-2 font-medium',
    landlord: 'text-accent-2',
    system:   'text-ink-4 italic',
  }[role]
  return <span className={`text-[11.5px] ${s}`}>{role}</span>
}

/* ══════════════════════════════════════════════════════════════
   Detail expansion content
══════════════════════════════════════════════════════════════ */

function DetailContent({ log }: { log: LogEntry }) {
  // Error: show stack trace
  if (log.stackTrace) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-4">Stack trace</p>
        <pre className="text-[12px] font-mono text-danger bg-danger/5 border border-danger/20
                        rounded-btn px-4 py-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {log.stackTrace}
        </pre>
      </div>
    )
  }

  // Transaction: show old → new diff
  if (log.oldValue !== undefined || log.newValue !== undefined) {
    function fmt(v: string | null | undefined) {
      if (!v) return <span className="text-ink-4 italic">—</span>
      try {
        return (
          <pre className="text-[12px] font-mono text-ink-2 whitespace-pre-wrap">
            {JSON.stringify(JSON.parse(v), null, 2)}
          </pre>
        )
      } catch {
        return <pre className="text-[12px] font-mono text-ink-2">{v}</pre>
      }
    }
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-4 mb-2">Before</p>
          <div className="bg-surface-2 border border-border rounded-btn px-3 py-2.5">
            {fmt(log.oldValue)}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-4 mb-2">After</p>
          <div className="bg-success/5 border border-success/20 rounded-btn px-3 py-2.5">
            {fmt(log.newValue)}
          </div>
        </div>
      </div>
    )
  }

  return null
}

/* ══════════════════════════════════════════════════════════════
   Tab bar
══════════════════════════════════════════════════════════════ */

function Tab({
  label, count, active, warn, onClick,
}: { label: string; count: number; active: boolean; warn?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-medium border-b-2 transition-ui whitespace-nowrap -mb-px',
        active
          ? 'border-ink text-ink'
          : 'border-transparent text-ink-3 hover:text-ink-2 hover:border-border',
      ].join(' ')}
    >
      {label}
      <span className={[
        'inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[11px] font-bold px-1.5',
        active
          ? 'bg-ink text-white'
          : warn
            ? 'bg-warning text-white'
            : 'bg-surface-2 text-ink-3',
      ].join(' ')}>
        {count}
      </span>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════ */

const SEL_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors appearance-none pr-8'

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

export function AuditLogs() {
  const [tab,           setTab]           = useState<TabId>('all')
  const [search,        setSearch]        = useState('')
  const [userFilter,    setUserFilter]    = useState('all')
  const [moduleFilter,  setModuleFilter]  = useState('all')
  const [dateRange,     setDateRange]     = useState<DateRange>('all')
  const [expandedId,    setExpandedId]    = useState<string | null>(null)
  const [exportStrip,   setExportStrip]   = useState<string | null>(null)
  const [suspiciousOnly, setSuspiciousOnly] = useState(false)

  /* ── Counts per tab (unaffected by tab filter so badges always show) ── */
  const countFor = (t: LogType) => ALL_LOGS.filter(l => l.type === t).length
  const suspCount = ALL_LOGS.filter(l => l.suspicious).length

  /* ── Filtered entries ── */
  const filtered = useMemo(() => {
    return ALL_LOGS.filter(log => {
      if (tab !== 'all' && log.type !== tab)             return false
      if (suspiciousOnly && !log.suspicious)             return false
      if (!isInRange(log.ts, dateRange))                 return false
      if (userFilter   !== 'all' && log.user !== userFilter)     return false
      if (moduleFilter !== 'all' && log.module !== moduleFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          log.userName.toLowerCase().includes(q)    ||
          log.user.toLowerCase().includes(q)        ||
          log.description.toLowerCase().includes(q) ||
          log.module.toLowerCase().includes(q)      ||
          log.action.toLowerCase().includes(q)      ||
          log.ip.includes(q)
        )
      }
      return true
    })
  }, [tab, suspiciousOnly, dateRange, userFilter, moduleFilter, search])

  const suspiciousInView = filtered.filter(l => l.suspicious).length

  function toggleExpand(id: string, log: LogEntry) {
    if (!hasDetail(log)) return
    setExpandedId(prev => prev === id ? null : id)
  }

  function handleExport(fmt: 'csv' | 'excel') {
    setExportStrip(`Audit log exported as ${fmt.toUpperCase()} — ${filtered.length} entries`)
  }

  const TH = 'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3 text-left whitespace-nowrap'
  const TD = 'px-4 py-3 text-[13.5px] align-top'

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      <PageHead
        title="Audit Logs"
        subtitle={`${ALL_LOGS.length} entries · auto-archived after 90 days · oldest entry: ${fmtDate(ALL_LOGS[ALL_LOGS.length - 1].ts)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={() => handleExport('csv')}>
              <Download size={13} strokeWidth={1.75} />
              Export CSV
            </Button>
            <Button variant="default" size="sm" onClick={() => handleExport('excel')}>
              <Download size={13} strokeWidth={1.75} />
              Export Excel
            </Button>
          </div>
        }
      />

      {/* Export confirmation strip */}
      {exportStrip && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-btn border border-success/30 bg-success/5">
          <Download size={14} strokeWidth={1.75} className="text-success shrink-0" />
          <p className="flex-1 text-[13.5px] text-ink">{exportStrip}</p>
          <button type="button" onClick={() => setExportStrip(null)}
            className="text-ink-4 hover:text-ink transition-colors">
            <X size={14} strokeWidth={1.75} />
          </button>
        </div>
      )}

      {/* Suspicious activity banner */}
      {suspiciousInView > 0 && tab !== 'access' && tab !== 'error' && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-btn border border-warning/40 bg-warning/5">
          <ShieldAlert size={15} strokeWidth={1.75} className="text-warning shrink-0" />
          <p className="flex-1 text-[13.5px] text-ink">
            <strong className="font-semibold">{suspiciousInView} suspicious {suspiciousInView === 1 ? 'entry' : 'entries'}</strong>
            {' '}in current view — repeated failed logins from IP{' '}
            <span className="font-mono text-[12.5px]">10.0.0.42</span> ending in account lockout.
          </p>
          <button
            type="button"
            onClick={() => { setSuspiciousOnly(true); setTab('auth') }}
            className="text-[12.5px] font-medium text-warning hover:underline underline-offset-2 shrink-0"
          >
            Show only suspicious →
          </button>
          {suspiciousOnly && (
            <button
              type="button"
              onClick={() => setSuspiciousOnly(false)}
              className="text-ink-4 hover:text-ink transition-colors"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>
      )}

      {/* Main card */}
      <div className="border border-border rounded-card overflow-hidden bg-surface">

        {/* Tab bar */}
        <div className="flex items-end px-4 border-b border-border overflow-x-auto">
          <Tab label="All"         count={ALL_LOGS.length}  active={tab === 'all'}         onClick={() => setTab('all')} />
          <Tab label="Auth"        count={countFor('auth')}        active={tab === 'auth'}        warn={suspCount > 0}  onClick={() => setTab('auth')} />
          <Tab label="Transaction" count={countFor('transaction')} active={tab === 'transaction'}       onClick={() => setTab('transaction')} />
          <Tab label="Error"       count={countFor('error')}       active={tab === 'error'}       onClick={() => setTab('error')} />
          <Tab label="Access"      count={countFor('access')}      active={tab === 'access'}      onClick={() => setTab('access')} />

          {/* Refresh stub */}
          <button
            type="button"
            className="ml-auto mb-2.5 flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] text-ink-3
                       hover:text-ink border border-border rounded-btn hover:border-border-strong transition-ui shrink-0"
          >
            <RefreshCw size={12} strokeWidth={1.75} />
            Refresh
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-wrap bg-surface-2">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search size={14} strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search user, action, module…"
              className={`${INPUT_CLS} pl-8 py-1.5 text-[13px]`}
            />
          </div>

          {/* User filter */}
          <div className="relative">
            <select value={userFilter} onChange={e => setUserFilter(e.target.value)}
              className={`${SEL_CLS} py-1.5 text-[13px] min-w-[160px]`}>
              <option value="all">All users</option>
              {ALL_USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <ChevronDown size={13} strokeWidth={1.75}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          </div>

          {/* Module filter */}
          <div className="relative">
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
              className={`${SEL_CLS} py-1.5 text-[13px] min-w-[160px]`}>
              <option value="all">All modules</option>
              {ALL_MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={13} strokeWidth={1.75}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          </div>

          {/* Date range */}
          <div className="relative">
            <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)}
              className={`${SEL_CLS} py-1.5 text-[13px] min-w-[130px]`}>
              {RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <ChevronDown size={13} strokeWidth={1.75}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          </div>

          {/* Active filters summary + clear */}
          <div className="ml-auto flex items-center gap-2">
            {suspiciousOnly && (
              <span className="flex items-center gap-1.5 px-2 py-1 bg-warning/10 text-warning text-[12px] font-medium rounded-xs">
                <AlertTriangle size={11} strokeWidth={2} />
                Suspicious only
                <button type="button" onClick={() => setSuspiciousOnly(false)}
                  className="ml-0.5 hover:opacity-70">
                  <X size={11} strokeWidth={2} />
                </button>
              </span>
            )}
            <span className="text-[12.5px] text-ink-4">
              {filtered.length} of {ALL_LOGS.length} entries
            </span>
          </div>
        </div>

        {/* Log table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className={TH}>Timestamp</th>
                <th className={TH}>Type</th>
                <th className={TH}>User</th>
                <th className={TH}>Module</th>
                <th className={TH}>Action</th>
                <th className={TH}>Description</th>
                <th className={TH}>IP Address</th>
                <th className={TH} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[13.5px] text-ink-4">
                    No log entries match the current filters.
                  </td>
                </tr>
              ) : filtered.map(log => {
                const isExpanded  = expandedId === log.id
                const expandable  = hasDetail(log)
                const isLastEntry = filtered[filtered.length - 1].id === log.id

                return (
                  <>
                    <tr
                      key={log.id}
                      onClick={() => toggleExpand(log.id, log)}
                      className={[
                        'border-b border-border transition-colors',
                        isExpanded && !isLastEntry ? '' : isLastEntry && !isExpanded ? 'last:border-0' : '',
                        log.suspicious ? SUSPICIOUS_ROW : '',
                        expandable ? 'cursor-pointer hover:bg-surface-2' : 'hover:bg-surface-2/60',
                      ].join(' ')}
                    >
                      {/* Timestamp */}
                      <td className={`${TD} whitespace-nowrap`}>
                        <span className="font-mono text-[12px] text-ink-3">{fmtTs(log.ts)}</span>
                      </td>

                      {/* Type */}
                      <td className={TD}>
                        <TypeBadge type={log.type} suspicious={log.suspicious} />
                      </td>

                      {/* User */}
                      <td className={TD}>
                        <p className="text-[13px] font-medium text-ink leading-tight">{log.userName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <RoleChip role={log.userRole} />
                        </div>
                      </td>

                      {/* Module */}
                      <td className={`${TD} text-ink-3 text-[13px] whitespace-nowrap`}>
                        {log.module}
                      </td>

                      {/* Action */}
                      <td className={TD}>
                        <span className={[
                          'text-[13px] font-medium',
                          log.type === 'error'         ? 'text-danger'  :
                          log.suspicious               ? 'text-warning' :
                          log.action.includes('Failed') || log.action.includes('Locked') ? 'text-warning' :
                          'text-ink',
                        ].join(' ')}>
                          {log.action}
                        </span>
                      </td>

                      {/* Description */}
                      <td className={`${TD} max-w-[280px]`}>
                        <p className="text-[12.5px] text-ink-3 leading-snug line-clamp-2">
                          {log.description}
                        </p>
                        {log.device && (
                          <p className="text-[11.5px] text-ink-4 mt-0.5">{log.device}</p>
                        )}
                      </td>

                      {/* IP */}
                      <td className={`${TD} whitespace-nowrap`}>
                        <span className={[
                          'font-mono text-[12px]',
                          log.suspicious ? 'text-warning font-semibold' : 'text-ink-4',
                        ].join(' ')}>
                          {log.ip}
                        </span>
                      </td>

                      {/* Expand chevron */}
                      <td className={`${TD} text-right pr-4`}>
                        {expandable && (
                          <ChevronRight
                            size={15} strokeWidth={1.75}
                            className={[
                              'text-ink-4 transition-transform',
                              isExpanded ? 'rotate-90' : '',
                            ].join(' ')}
                          />
                        )}
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr key={`${log.id}-detail`} className="border-b border-border bg-surface-2">
                        <td colSpan={8} className="px-6 py-4">
                          <DetailContent log={log} />
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-surface-2 flex items-center justify-between">
            <p className="text-[12.5px] text-ink-4">
              Showing <span className="font-medium text-ink-2">{filtered.length}</span> entries
              {filtered.some(l => l.suspicious) && (
                <> · <span className="text-warning font-medium">{filtered.filter(l => l.suspicious).length} suspicious</span></>
              )}
            </p>
            <div className="flex items-center gap-1 text-[12.5px] text-ink-4">
              <Lock size={11} strokeWidth={1.75} />
              Admin-only · read-only view
            </div>
          </div>
        )}

      </div>

    </main>
  )
}
