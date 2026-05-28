import { useState } from 'react'
import {
  Activity, BarChart2, ClipboardList, SlidersHorizontal, Wand2,
  Download, Printer, Mail, Calendar, Star, Check,
  ChevronDown, Plus, Trash2, X, RefreshCw, FileText,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { PageHead } from '../../components/ui/PageHead'

/* ══════════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════════ */

type ReportTab = 'activity' | 'transactions' | 'audit' | 'usage' | 'custom'

type DataSource = 'users' | 'billing' | 'payments' | 'tenants' | 'audit' | 'system_usage'

interface FilterCondition {
  id:       string
  field:    string
  operator: string
  value:    string
}

/* ══════════════════════════════════════════════════════════════
   Mock data
══════════════════════════════════════════════════════════════ */

const USER_ACTIVITY_DATA = [
  { id:'a01', user:'Maria Dela Cruz',  role:'landlord', action:'Login',  module:'Auth',      desc:'Successful login from Chrome',              ts:'2026-05-28T09:14:00', ip:'192.168.1.105' },
  { id:'a02', user:'System Admin',     role:'admin',    action:'Update', module:'User Mgmt', desc:'Changed status: Active → Suspended',         ts:'2026-05-28T08:45:00', ip:'192.168.1.1'   },
  { id:'a03', user:'Jose Reyes',       role:'landlord', action:'Create', module:'Billing',   desc:'Generated 3 draft bills for May 2026',       ts:'2026-05-28T08:30:00', ip:'192.168.1.108' },
  { id:'a04', user:'Maria Dela Cruz',  role:'landlord', action:'Export', module:'Reports',   desc:'Exported tenant list to CSV',                ts:'2026-05-27T16:20:00', ip:'192.168.1.105' },
  { id:'a05', user:'System Admin',     role:'admin',    action:'Create', module:'User Mgmt', desc:'Created new landlord: Ana Santos',           ts:'2026-05-27T14:10:00', ip:'192.168.1.1'   },
  { id:'a06', user:'Marco Villanueva', role:'landlord', action:'Update', module:'Tenants',   desc:'Updated tenant move-out date',               ts:'2026-05-27T11:30:00', ip:'192.168.1.112' },
  { id:'a07', user:'Jose Reyes',       role:'landlord', action:'Login',  module:'Auth',      desc:'Successful login from Firefox',              ts:'2026-05-27T09:00:00', ip:'192.168.1.108' },
  { id:'a08', user:'Clara Mendoza',    role:'landlord', action:'Create', module:'Payments',  desc:'Recorded payment ₱6,500 for Room 204',      ts:'2026-05-26T15:45:00', ip:'192.168.1.115' },
  { id:'a09', user:'System Admin',     role:'admin',    action:'Delete', module:'User Mgmt', desc:'Deactivated account: Lina Bautista',         ts:'2026-05-26T10:20:00', ip:'192.168.1.1'   },
  { id:'a10', user:'Maria Dela Cruz',  role:'landlord', action:'Update', module:'Billing',   desc:'Posted bill #B-2026-051 for Room 101',      ts:'2026-05-25T14:00:00', ip:'192.168.1.105' },
  { id:'a11', user:'Marco Villanueva', role:'landlord', action:'Export', module:'Billing',   desc:'Downloaded bill PDF — tenant Cruz, May',    ts:'2026-05-25T10:30:00', ip:'192.168.1.112' },
  { id:'a12', user:'Jose Reyes',       role:'landlord', action:'Create', module:'Rooms',     desc:'Added new room: Room 305',                   ts:'2026-05-24T09:15:00', ip:'192.168.1.108' },
]

const TXN_DATA: Record<string, Record<string, { success: number; failed: number }>> = {
  'This Month': {
    Billing:  { success: 42, failed: 2 },
    Payments: { success: 38, failed: 1 },
    Users:    { success: 12, failed: 0 },
    Tenants:  { success: 8,  failed: 0 },
  },
  'Last Month': {
    Billing:  { success: 38, failed: 3 },
    Payments: { success: 31, failed: 2 },
    Users:    { success: 9,  failed: 1 },
    Tenants:  { success: 6,  failed: 0 },
  },
  'Custom': {
    Billing:  { success: 80, failed: 5 },
    Payments: { success: 69, failed: 3 },
    Users:    { success: 21, failed: 1 },
    Tenants:  { success: 14, failed: 0 },
  },
}

const AUDIT_TRAIL_DATA = [
  { id:'t01', ts:'2026-05-28T09:14:00', user:'Maria Dela Cruz',  module:'Auth',      action:'Login',        desc:'Successful login',               ip:'192.168.1.105' },
  { id:'t02', ts:'2026-05-28T08:45:00', user:'System Admin',     module:'User Mgmt', action:'Status Change',desc:'User suspended: Roberto Cruz',    ip:'192.168.1.1'   },
  { id:'t03', ts:'2026-05-28T08:30:00', user:'Jose Reyes',       module:'Billing',   action:'Create',       desc:'Draft bills generated ×3',        ip:'192.168.1.108' },
  { id:'t04', ts:'2026-05-27T16:20:00', user:'Maria Dela Cruz',  module:'Reports',   action:'Export',       desc:'Tenant list → CSV',               ip:'192.168.1.105' },
  { id:'t05', ts:'2026-05-27T14:10:00', user:'System Admin',     module:'User Mgmt', action:'Create',       desc:'User created: Ana Santos',        ip:'192.168.1.1'   },
  { id:'t06', ts:'2026-05-27T11:30:00', user:'Marco Villanueva', module:'Tenants',   action:'Update',       desc:'Move-out date set: 2026-06-30',   ip:'192.168.1.112' },
  { id:'t07', ts:'2026-05-26T15:45:00', user:'Clara Mendoza',    module:'Payments',  action:'Create',       desc:'Payment recorded: ₱6,500',        ip:'192.168.1.115' },
  { id:'t08', ts:'2026-05-26T10:20:00', user:'System Admin',     module:'User Mgmt', action:'Deactivate',   desc:'Account deactivated: Lina B.',    ip:'192.168.1.1'   },
  { id:'t09', ts:'2026-05-25T14:00:00', user:'Maria Dela Cruz',  module:'Billing',   action:'Post',         desc:'Bill #B-2026-051 posted',         ip:'192.168.1.105' },
  { id:'t10', ts:'2026-05-24T09:15:00', user:'Jose Reyes',       module:'Rooms',     action:'Create',       desc:'Room 305 created',                ip:'192.168.1.108' },
]

const USAGE_MONTHLY = [
  { period:'Jun\'25', logins:42, users:7, actions:98,  errors:2 },
  { period:'Jul\'25', logins:38, users:8, actions:110, errors:4 },
  { period:'Aug\'25', logins:51, users:8, actions:132, errors:1 },
  { period:'Sep\'25', logins:47, users:9, actions:120, errors:3 },
  { period:'Oct\'25', logins:55, users:9, actions:148, errors:2 },
  { period:'Nov\'25', logins:49, users:9, actions:135, errors:5 },
  { period:'Dec\'25', logins:44, users:9, actions:115, errors:1 },
  { period:'Jan\'26', logins:62, users:10, actions:160, errors:3 },
  { period:'Feb\'26', logins:58, users:10, actions:152, errors:2 },
  { period:'Mar\'26', logins:71, users:11, actions:180, errors:4 },
  { period:'Apr\'26', logins:65, users:11, actions:168, errors:2 },
  { period:'May\'26', logins:74, users:11, actions:192, errors:3 },
]

const USAGE_QUARTERLY = [
  { period:'Q3 \'25', logins:131, users:8,  actions:340, errors:7  },
  { period:'Q4 \'25', logins:148, users:9,  actions:398, errors:8  },
  { period:'Q1 \'26', logins:191, users:10, actions:492, errors:9  },
  { period:'Q2 \'26', logins:139, users:11, actions:360, errors:5  },
]

const USAGE_YEARLY = [
  { period:'2024', logins:460, users:6,  actions:1100, errors:22 },
  { period:'2025', logins:590, users:9,  actions:1580, errors:31 },
  { period:'2026', logins:330, users:11, actions:852,  errors:14 },
]

/* custom builder: columns and preview rows per source */
const COLUMNS_BY_SOURCE: Record<DataSource, string[]> = {
  users:    ['ID', 'Name', 'Email', 'Role', 'Status', 'Created', 'Last Login'],
  billing:  ['Bill ID', 'Tenant', 'Property', 'Period', 'Amount', 'Status', 'Due Date'],
  payments: ['Payment ID', 'Tenant', 'Amount', 'Method', 'Date', 'Receipt No.', 'Bill'],
  tenants:  ['Tenant ID', 'Name', 'Room', 'Property', 'Move-in', 'Status', 'Contact'],
  audit:        ['Timestamp', 'User', 'Module', 'Action', 'Description', 'IP Address'],
  system_usage: ['Period', 'Logins', 'Active Users', 'Total Actions', 'Errors', 'Error Rate'],
}

const PREVIEW_ROWS: Record<DataSource, Record<string, string>[]> = {
  users: [
    { ID:'u1', Name:'Maria Dela Cruz',  Email:'maria@sunsetapts.ph', Role:'Landlord', Status:'Active',    Created:'2026-01-03', 'Last Login':'2026-05-27' },
    { ID:'u2', Name:'System Admin',     Email:'admin@billbee.ph',    Role:'Admin',    Status:'Active',    Created:'2025-12-01', 'Last Login':'2026-05-28' },
    { ID:'u3', Name:'Jose Reyes',       Email:'j.reyes@sunset.ph',   Role:'Landlord', Status:'Active',    Created:'2026-02-15', 'Last Login':'2026-05-26' },
    { ID:'u4', Name:'Ana Santos',       Email:'a.santos@prop.ph',    Role:'Landlord', Status:'Pending',   Created:'2026-05-20', 'Last Login':'—'          },
    { ID:'u5', Name:'Roberto Cruz',     Email:'r.cruz@billbee.ph',   Role:'Landlord', Status:'Suspended', Created:'2026-03-10', 'Last Login':'2026-05-01' },
  ],
  billing: [
    { 'Bill ID':'B-2026-051', Tenant:'Ana Reyes',    Property:'Sunset Apts', Period:'May 2026', Amount:'₱6,500', Status:'Paid',         'Due Date':'2026-05-15' },
    { 'Bill ID':'B-2026-052', Tenant:'Carlo Tan',    Property:'Sunset Apts', Period:'May 2026', Amount:'₱5,800', Status:'Partially Paid','Due Date':'2026-05-15' },
    { 'Bill ID':'B-2026-053', Tenant:'Mia Santos',   Property:'Green Villas', Period:'May 2026', Amount:'₱4,200', Status:'Overdue',      'Due Date':'2026-05-10' },
    { 'Bill ID':'B-2026-054', Tenant:'Luis Cruz',    Property:'Sunset Apts', Period:'May 2026', Amount:'₱6,000', Status:'Posted',        'Due Date':'2026-05-20' },
    { 'Bill ID':'B-2026-055', Tenant:'Rosa Bernal',  Property:'Green Villas', Period:'May 2026', Amount:'₱3,900', Status:'Draft',        'Due Date':'2026-05-20' },
  ],
  payments: [
    { 'Payment ID':'P-001', Tenant:'Ana Reyes',   Amount:'₱6,500', Method:'Cash',          Date:'2026-05-14', 'Receipt No.':'RCP-001', Bill:'B-2026-051' },
    { 'Payment ID':'P-002', Tenant:'Carlo Tan',   Amount:'₱3,000', Method:'Bank Transfer', Date:'2026-05-13', 'Receipt No.':'RCP-002', Bill:'B-2026-052' },
    { 'Payment ID':'P-003', Tenant:'Luis Cruz',   Amount:'₱6,000', Method:'E-Wallet',      Date:'2026-05-18', 'Receipt No.':'RCP-003', Bill:'B-2026-054' },
    { 'Payment ID':'P-004', Tenant:'Ana Reyes',   Amount:'₱6,500', Method:'Cash',          Date:'2026-04-14', 'Receipt No.':'RCP-004', Bill:'B-2026-038' },
    { 'Payment ID':'P-005', Tenant:'Rosa Bernal', Amount:'₱3,900', Method:'Bank Transfer', Date:'2026-04-10', 'Receipt No.':'RCP-005', Bill:'B-2026-039' },
  ],
  tenants: [
    { 'Tenant ID':'TN-01', Name:'Ana Reyes',   Room:'101', Property:'Sunset Apts',  'Move-in':'2025-06-01', Status:'Active',    Contact:'09171234567' },
    { 'Tenant ID':'TN-02', Name:'Carlo Tan',   Room:'102', Property:'Sunset Apts',  'Move-in':'2025-08-15', Status:'Active',    Contact:'09182345678' },
    { 'Tenant ID':'TN-03', Name:'Mia Santos',  Room:'201', Property:'Green Villas', 'Move-in':'2025-07-01', Status:'Active',    Contact:'09193456789' },
    { 'Tenant ID':'TN-04', Name:'Luis Cruz',   Room:'204', Property:'Sunset Apts',  'Move-in':'2026-01-10', Status:'Active',    Contact:'09204567890' },
    { 'Tenant ID':'TN-05', Name:'Rosa Bernal', Room:'301', Property:'Green Villas', 'Move-in':'2025-09-20', Status:'Moved Out', Contact:'09215678901' },
  ],
  audit: [
    { Timestamp:'2026-05-28 09:14', User:'Maria Dela Cruz', Module:'Auth',      Action:'Login',   Description:'Successful login',           'IP Address':'192.168.1.105' },
    { Timestamp:'2026-05-28 08:45', User:'System Admin',    Module:'User Mgmt', Action:'Update',  Description:'Status changed: Suspended',   'IP Address':'192.168.1.1'   },
    { Timestamp:'2026-05-28 08:30', User:'Jose Reyes',      Module:'Billing',   Action:'Create',  Description:'Draft bills generated ×3',    'IP Address':'192.168.1.108' },
    { Timestamp:'2026-05-27 16:20', User:'Maria Dela Cruz', Module:'Reports',   Action:'Export',  Description:'Tenant list → CSV',           'IP Address':'192.168.1.105' },
    { Timestamp:'2026-05-27 14:10', User:'System Admin',    Module:'User Mgmt', Action:'Create',  Description:'User created: Ana Santos',    'IP Address':'192.168.1.1'   },
  ],
  system_usage: [
    { Period:"Mar '26", Logins:'71', 'Active Users':'11', 'Total Actions':'180', Errors:'4', 'Error Rate':'2.2%' },
    { Period:"Apr '26", Logins:'65', 'Active Users':'11', 'Total Actions':'168', Errors:'2', 'Error Rate':'1.2%' },
    { Period:"May '26", Logins:'74', 'Active Users':'11', 'Total Actions':'192', Errors:'3', 'Error Rate':'1.6%' },
    { Period:"Q1 '26",  Logins:'191','Active Users':'10', 'Total Actions':'492', Errors:'9', 'Error Rate':'1.8%' },
    { Period:"Q2 '26",  Logins:'139','Active Users':'11', 'Total Actions':'360', Errors:'5', 'Error Rate':'1.4%' },
  ],
}

/* ══════════════════════════════════════════════════════════════
   Shared form primitives
══════════════════════════════════════════════════════════════ */

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

const SEL_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full appearance-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">{label}</label>
      {children}
    </div>
  )
}

function Sel({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className={SEL_CLS}>
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
    </div>
  )
}

function fmtTs(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

/* ══════════════════════════════════════════════════════════════
   SVG chart helpers — Transaction bar chart
══════════════════════════════════════════════════════════════ */

function TxnBarChart({ data }: { data: Record<string, { success: number; failed: number }> }) {
  const cats  = Object.keys(data)
  const rawMax = Math.max(...cats.flatMap(c => [data[c].success, data[c].failed]))
  const maxVal = rawMax * 1.2 || 10
  const W = 520, H = 180
  const PAD_L = 36, PAD_B = 28, PAD_T = 12, PAD_R = 16
  const cW = W - PAD_L - PAD_R
  const cH = H - PAD_T - PAD_B
  const groupW = cW / cats.length
  const BAR = Math.min(20, (groupW - 24) / 2)

  function barH(v: number) { return Math.max(2, (v / maxVal) * cH) }
  const baseY = PAD_T + cH

  const yLines = [0.25, 0.5, 0.75, 1.0]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-[180px]">
      {/* Gridlines */}
      {yLines.map(f => {
        const y = baseY - f * cH
        return (
          <g key={f}>
            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="var(--color-border)" strokeDasharray={f < 1 ? '2 4' : undefined} />
            <text x={PAD_L - 4} y={y + 4} textAnchor="end" fontSize={9} fill="var(--color-ink-4)" fontFamily="monospace">
              {Math.round(maxVal * f)}
            </text>
          </g>
        )
      })}
      {/* Bars */}
      {cats.map((cat, i) => {
        const cx = PAD_L + i * groupW + groupW / 2
        const sx = cx - BAR - 2
        const fx = cx + 2
        const sh = barH(data[cat].success)
        const fh = barH(data[cat].failed)
        return (
          <g key={cat}>
            <rect x={sx} y={baseY - sh} width={BAR} height={sh} fill="var(--color-accent)" rx={2} opacity={0.85} />
            <rect x={fx} y={baseY - fh} width={BAR} height={fh} fill="var(--color-danger)"  rx={2} opacity={0.85} />
            {/* value labels */}
            <text x={sx + BAR / 2} y={baseY - sh - 3} textAnchor="middle" fontSize={9} fill="var(--color-accent)" fontWeight="600">
              {data[cat].success}
            </text>
            <text x={fx + BAR / 2} y={baseY - fh - 3} textAnchor="middle" fontSize={9} fill="var(--color-danger)" fontWeight="600">
              {data[cat].failed}
            </text>
            <text x={cx} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--color-ink-3)">{cat}</text>
          </g>
        )
      })}
      {/* Legend */}
      <g>
        <rect x={W - PAD_R - 90} y={PAD_T} width={10} height={10} fill="var(--color-accent)"  rx={2} />
        <text x={W - PAD_R - 77} y={PAD_T + 9} fontSize={10} fill="var(--color-ink-2)">Success</text>
        <rect x={W - PAD_R - 90} y={PAD_T + 16} width={10} height={10} fill="var(--color-danger)" rx={2} />
        <text x={W - PAD_R - 77} y={PAD_T + 25} fontSize={10} fill="var(--color-ink-2)">Failed</text>
      </g>
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════
   SVG chart helpers — System Usage line chart
══════════════════════════════════════════════════════════════ */

function UsageLineChart({ data }: { data: Array<{ period: string; logins: number; users: number; actions: number }> }) {
  const W = 560, H = 190
  const PAD_L = 40, PAD_B = 28, PAD_T = 14, PAD_R = 16
  const cW = W - PAD_L - PAD_R
  const cH = H - PAD_T - PAD_B
  const n = data.length

  const maxLogins  = Math.max(...data.map(d => d.logins))  * 1.15 || 10
  const maxActions = Math.max(...data.map(d => d.actions)) * 1.15 || 10

  function xp(i: number) { return PAD_L + (n <= 1 ? cW / 2 : (i / (n - 1)) * cW) }
  function yLogin(v: number) { return PAD_T + cH - (v / maxLogins) * cH }
  function yAction(v: number) { return PAD_T + cH - (v / maxActions) * cH }

  const loginPts  = data.map((d, i) => `${xp(i).toFixed(1)},${yLogin(d.logins).toFixed(1)}`).join(' ')
  const actionPts = data.map((d, i) => `${xp(i).toFixed(1)},${yAction(d.actions).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-[190px]">
      {/* Gridlines */}
      {[0.25, 0.5, 0.75, 1.0].map(f => {
        const y = PAD_T + cH - f * cH
        return (
          <g key={f}>
            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="var(--color-border)" strokeDasharray={f < 1 ? '2 4' : undefined} />
            <text x={PAD_L - 4} y={y + 4} textAnchor="end" fontSize={9} fill="var(--color-ink-4)" fontFamily="monospace">
              {Math.round(maxLogins * f)}
            </text>
          </g>
        )
      })}
      {/* Actions line (dashed, secondary) */}
      <polyline points={actionPts} fill="none" stroke="var(--color-success)" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" opacity={0.7} />
      {/* Logins line (solid, primary) */}
      <polyline points={loginPts} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinejoin="round" />
      {/* Login dots */}
      {data.map((d, i) => (
        <circle key={i} cx={xp(i)} cy={yLogin(d.logins)} r={3} fill="var(--color-accent)" />
      ))}
      {/* X labels — skip some if crowded */}
      {data.map((d, i) => {
        if (data.length > 6 && i % 2 !== 0) return null
        return (
          <text key={i} x={xp(i)} y={H - 6} textAnchor="middle" fontSize={9} fill="var(--color-ink-4)">
            {d.period}
          </text>
        )
      })}
      {/* Legend */}
      <g>
        <line x1={W - PAD_R - 110} y1={PAD_T + 7} x2={W - PAD_R - 98} y2={PAD_T + 7} stroke="var(--color-accent)" strokeWidth={2} />
        <text x={W - PAD_R - 94} y={PAD_T + 11} fontSize={10} fill="var(--color-ink-2)">Logins</text>
        <line x1={W - PAD_R - 110} y1={PAD_T + 22} x2={W - PAD_R - 98} y2={PAD_T + 22} stroke="var(--color-success)" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={W - PAD_R - 94} y={PAD_T + 26} fontSize={10} fill="var(--color-ink-2)">Actions</text>
      </g>
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════
   Export toolbar
══════════════════════════════════════════════════════════════ */

interface ExportToolbarProps {
  onPdf:      () => void
  onExcel:    () => void
  onPrint:    () => void
  onEmail:    () => void
  onSchedule: () => void
  saved:      boolean
  onSave:     () => void
}

function ExportToolbar({ onPdf, onExcel, onPrint, onEmail, onSchedule, saved, onSave }: ExportToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface border border-border rounded-btn">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onPdf}>
          <FileText size={13} strokeWidth={1.75} />
          PDF
        </Button>
        <Button size="sm" variant="ghost" onClick={onExcel}>
          <Download size={13} strokeWidth={1.75} />
          Excel
        </Button>
        <Button size="sm" variant="ghost" onClick={onPrint}>
          <Printer size={13} strokeWidth={1.75} />
          Print
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button size="sm" variant="ghost" onClick={onEmail}>
          <Mail size={13} strokeWidth={1.75} />
          Email Report
        </Button>
        <Button size="sm" variant="ghost" onClick={onSchedule}>
          <Calendar size={13} strokeWidth={1.75} />
          Schedule
        </Button>
      </div>
      <button
        type="button"
        onClick={onSave}
        title={saved ? 'Configuration saved' : 'Save this report configuration'}
        className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${
          saved ? 'text-warning' : 'text-ink-3 hover:text-ink'
        }`}
      >
        <Star size={14} strokeWidth={1.75} fill={saved ? 'currentColor' : 'none'} />
        {saved ? 'Saved' : 'Save Config'}
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Modals — Schedule & Email
══════════════════════════════════════════════════════════════ */

function ScheduleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [freq, setFreq]   = useState('monthly')
  const [time, setTime]   = useState('08:00')
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)

  function handleSave() {
    setSent(true)
    setTimeout(() => { setSent(false); onClose() }, 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule Report">
      <div className="flex flex-col gap-4">
        <p className="text-[13.5px] text-ink-2">
          Auto-generate and email this report on a recurring schedule.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Frequency">
            <Sel value={freq} onChange={setFreq}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Sel>
          </Field>
          <Field label="Time of Day">
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={INPUT_CLS} />
          </Field>
        </div>
        <Field label="Recipient Email">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@billbee.ph"
            className={INPUT_CLS}
          />
        </Field>
        <div className="flex items-center justify-end gap-2 pt-1">
          {sent && (
            <span className="flex items-center gap-1.5 text-[12px] text-success font-medium mr-2">
              <Check size={13} strokeWidth={2} /> Schedule saved
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>
            <Calendar size={13} strokeWidth={2} />
            Save Schedule
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function EmailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [to,      setTo]      = useState('')
  const [subject, setSubject] = useState('BillBee Admin Report')
  const [note,    setNote]    = useState('')
  const [sent,    setSent]    = useState(false)

  function handleSend() {
    setSent(true)
    setTimeout(() => { setSent(false); onClose() }, 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="Email Report">
      <div className="flex flex-col gap-4">
        <Field label="Recipient">
          <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" className={INPUT_CLS} />
        </Field>
        <Field label="Subject">
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className={INPUT_CLS} />
        </Field>
        <Field label="Note (optional)">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="Add a message to include with the report…"
            className={INPUT_CLS + ' resize-none'}
          />
        </Field>
        <div className="flex items-center justify-end gap-2 pt-1">
          {sent && (
            <span className="flex items-center gap-1.5 text-[12px] text-success font-medium mr-2">
              <Check size={13} strokeWidth={2} /> Report sent
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSend}>
            <Mail size={13} strokeWidth={2} />
            Send Report
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════════════════════════
   Shared: export strip + useExportStrip hook
══════════════════════════════════════════════════════════════ */

function ExportStrip({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-success/10 border border-success/20 rounded-btn text-[13px] text-success font-medium">
      <Check size={14} strokeWidth={2} className="shrink-0" />
      {msg}
      <button type="button" onClick={onClose} className="ml-auto text-success/60 hover:text-success">
        <X size={13} strokeWidth={2} />
      </button>
    </div>
  )
}

function useExportActions() {
  const [strip, setStrip] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [showEmail,    setShowEmail]    = useState(false)
  const [saved,        setSaved]        = useState(false)

  function flash(msg: string) { setStrip(msg); setTimeout(() => setStrip(null), 3500) }

  return {
    strip, showSchedule, showEmail, saved,
    toolbarProps: {
      onPdf:      () => flash('Report exported to PDF. Check your downloads.'),
      onExcel:    () => flash('Report exported to Excel. Check your downloads.'),
      onPrint:    () => flash('Print preview sent to your printer.'),
      onEmail:    () => setShowEmail(true),
      onSchedule: () => setShowSchedule(true),
      saved,
      onSave:     () => { setSaved(s => !s) },
    },
    closeSchedule: () => setShowSchedule(false),
    closeEmail:    () => setShowEmail(false),
    closeStrip:    () => setStrip(null),
  }
}

/* ══════════════════════════════════════════════════════════════
   Tab 1 — User Activity Report
══════════════════════════════════════════════════════════════ */

function UserActivityTab() {
  const [dateFrom,    setDateFrom]    = useState('')
  const [dateTo,      setDateTo]      = useState('')
  const [role,        setRole]        = useState('all')
  const [actionType,  setActionType]  = useState('all')
  const [generated,   setGenerated]   = useState(false)
  const exp = useExportActions()

  const rows = generated
    ? USER_ACTIVITY_DATA.filter(r => {
        if (role !== 'all' && r.role !== role) return false
        if (actionType !== 'all' && r.action.toLowerCase() !== actionType) return false
        return true
      })
    : []

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Date From">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={INPUT_CLS} />
            </Field>
            <Field label="Date To">
              <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className={INPUT_CLS} />
            </Field>
            <Field label="User Role">
              <Sel value={role} onChange={setRole}>
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="landlord">Landlord</option>
              </Sel>
            </Field>
            <Field label="Action Type">
              <Sel value={actionType} onChange={setActionType}>
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="export">Export</option>
              </Sel>
            </Field>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setGenerated(true)}>
              <RefreshCw size={14} strokeWidth={2} />
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {generated && (
        <>
          {exp.strip && <ExportStrip msg={exp.strip} onClose={exp.closeStrip} />}
          <ExportToolbar {...exp.toolbarProps} />
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    {['Timestamp', 'User', 'Role', 'Action', 'Module', 'Description', 'IP'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-[13px] text-ink-3">No records match the selected filters.</td></tr>
                  )}
                  {rows.map(r => (
                    <tr key={r.id} className="hover:bg-surface-2/50">
                      <td className="px-4 py-3 whitespace-nowrap text-ink-2">{fmtTs(r.ts)}</td>
                      <td className="px-4 py-3 font-medium text-ink">{r.user}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-chip text-[11px] font-semibold border ${r.role === 'admin' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-surface-2 text-ink-2 border-border'}`}>
                          {r.role === 'admin' ? 'Admin' : 'Landlord'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-2">{r.action}</td>
                      <td className="px-4 py-3 text-ink-2">{r.module}</td>
                      <td className="px-4 py-3 text-ink-2 max-w-[260px] truncate">{r.desc}</td>
                      <td className="px-4 py-3 text-ink-3 font-mono text-[12px]">{r.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-border text-[12px] text-ink-3">
              {rows.length} record{rows.length !== 1 ? 's' : ''} · PDF, Excel, Print available above
            </div>
          </Card>
        </>
      )}
      <ScheduleModal open={exp.showSchedule} onClose={exp.closeSchedule} />
      <EmailModal    open={exp.showEmail}    onClose={exp.closeEmail}    />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Tab 2 — Transaction Summary
══════════════════════════════════════════════════════════════ */

function TransactionSummaryTab() {
  const [period,    setPeriod]    = useState('This Month')
  const [category,  setCategory]  = useState('all')
  const [status,    setStatus]    = useState('all')
  const [generated, setGenerated] = useState(false)
  const exp = useExportActions()

  const baseData = TXN_DATA[period] ?? TXN_DATA['This Month']
  const cats = category === 'all' ? Object.keys(baseData) : Object.keys(baseData).filter(c => c.toLowerCase() === category.toLowerCase())

  const totals = cats.reduce(
    (acc, c) => ({ success: acc.success + baseData[c].success, failed: acc.failed + baseData[c].failed }),
    { success: 0, failed: 0 }
  )

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Period">
              <Sel value={period} onChange={setPeriod}>
                <option>This Month</option>
                <option>Last Month</option>
                <option value="Custom">Custom (All Time)</option>
              </Sel>
            </Field>
            <Field label="Category">
              <Sel value={category} onChange={setCategory}>
                <option value="all">All Categories</option>
                <option value="Billing">Billing</option>
                <option value="Payments">Payments</option>
                <option value="Users">Users</option>
                <option value="Tenants">Tenants</option>
              </Sel>
            </Field>
            <Field label="Status">
              <Sel value={status} onChange={setStatus}>
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </Sel>
            </Field>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setGenerated(true)}>
              <RefreshCw size={14} strokeWidth={2} />
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {generated && (
        <>
          {exp.strip && <ExportStrip msg={exp.strip} onClose={exp.closeStrip} />}
          <ExportToolbar {...exp.toolbarProps} />

          {/* Summary stat tiles */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Transactions', value: totals.success + totals.failed, cls: 'text-ink' },
              { label: 'Successful',          value: totals.success,                 cls: 'text-success' },
              { label: 'Failed',              value: totals.failed,                  cls: 'text-danger'  },
              { label: 'Success Rate',        value: `${totals.success + totals.failed > 0 ? Math.round((totals.success / (totals.success + totals.failed)) * 100) : 0}%`, cls: 'text-accent' },
            ].map(({ label, value, cls }) => (
              <Card key={label}>
                <div className="px-4 py-3 text-center">
                  <div className={`text-[22px] font-bold ${cls}`}>{value}</div>
                  <div className="text-[11.5px] text-ink-3 mt-0.5">{label}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Bar chart */}
          <Card>
            <div className="px-5 py-4">
              <p className="text-[13px] font-semibold text-ink mb-4">Transactions by Category</p>
              <TxnBarChart data={Object.fromEntries(cats.map(c => [c, baseData[c]]))} />
            </div>
          </Card>

          {/* Detail table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    {['Category', 'Successful', 'Failed', 'Total', 'Success Rate'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cats.map(cat => {
                    const d   = baseData[cat]
                    const tot = d.success + d.failed
                    const pct = tot > 0 ? Math.round((d.success / tot) * 100) : 0
                    if (status === 'success' && d.success === 0) return null
                    if (status === 'failed'  && d.failed  === 0) return null
                    return (
                      <tr key={cat} className="hover:bg-surface-2/50">
                        <td className="px-4 py-3 font-medium text-ink">{cat}</td>
                        <td className="px-4 py-3 text-success font-semibold tabular-nums">{d.success}</td>
                        <td className="px-4 py-3 text-danger  font-semibold tabular-nums">{d.failed}</td>
                        <td className="px-4 py-3 text-ink-2 tabular-nums">{tot}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-surface-2 rounded-full overflow-hidden">
                              <div className="h-full bg-success rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-ink-2 tabular-nums">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-border text-[12px] text-ink-3">
              Period: {period} · {cats.length} categor{cats.length !== 1 ? 'ies' : 'y'}
            </div>
          </Card>
        </>
      )}
      <ScheduleModal open={exp.showSchedule} onClose={exp.closeSchedule} />
      <EmailModal    open={exp.showEmail}    onClose={exp.closeEmail}    />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Tab 3 — Audit Trail Report
══════════════════════════════════════════════════════════════ */

function AuditTrailTab() {
  const [user,      setUser]      = useState('all')
  const [module,    setModule]    = useState('all')
  const [action,    setAction]    = useState('all')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [generated, setGenerated] = useState(false)
  const exp = useExportActions()

  const users   = Array.from(new Set(AUDIT_TRAIL_DATA.map(r => r.user)))
  const modules = Array.from(new Set(AUDIT_TRAIL_DATA.map(r => r.module)))
  const actions = Array.from(new Set(AUDIT_TRAIL_DATA.map(r => r.action)))

  const rows = generated
    ? AUDIT_TRAIL_DATA.filter(r => {
        if (user   !== 'all' && r.user   !== user)   return false
        if (module !== 'all' && r.module !== module) return false
        if (action !== 'all' && r.action !== action) return false
        return true
      })
    : []

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="User">
              <Sel value={user} onChange={setUser}>
                <option value="all">All Users</option>
                {users.map(u => <option key={u}>{u}</option>)}
              </Sel>
            </Field>
            <Field label="Module">
              <Sel value={module} onChange={setModule}>
                <option value="all">All Modules</option>
                {modules.map(m => <option key={m}>{m}</option>)}
              </Sel>
            </Field>
            <Field label="Action">
              <Sel value={action} onChange={setAction}>
                <option value="all">All Actions</option>
                {actions.map(a => <option key={a}>{a}</option>)}
              </Sel>
            </Field>
            <Field label="Date From">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={INPUT_CLS} />
            </Field>
            <Field label="Date To">
              <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className={INPUT_CLS} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setGenerated(true)}>
              <RefreshCw size={14} strokeWidth={2} />
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {generated && (
        <>
          {exp.strip && <ExportStrip msg={exp.strip} onClose={exp.closeStrip} />}
          <ExportToolbar {...exp.toolbarProps} />
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    {['Timestamp', 'User', 'Module', 'Action', 'Description', 'IP Address'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-[13px] text-ink-3">No records match the selected filters.</td></tr>
                  )}
                  {rows.map(r => (
                    <tr key={r.id} className="hover:bg-surface-2/50">
                      <td className="px-4 py-3 whitespace-nowrap text-ink-2">{fmtTs(r.ts)}</td>
                      <td className="px-4 py-3 font-medium text-ink">{r.user}</td>
                      <td className="px-4 py-3 text-ink-2">{r.module}</td>
                      <td className="px-4 py-3 text-ink-2">{r.action}</td>
                      <td className="px-4 py-3 text-ink-2 max-w-[240px] truncate">{r.desc}</td>
                      <td className="px-4 py-3 text-ink-3 font-mono text-[12px]">{r.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-border text-[12px] text-ink-3">
              {rows.length} record{rows.length !== 1 ? 's' : ''} · Admin-only · read-only
            </div>
          </Card>
        </>
      )}
      <ScheduleModal open={exp.showSchedule} onClose={exp.closeSchedule} />
      <EmailModal    open={exp.showEmail}    onClose={exp.closeEmail}    />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Tab 4 — System Usage Statistics
══════════════════════════════════════════════════════════════ */

type UsagePeriod = 'Monthly' | 'Quarterly' | 'Yearly'

const USAGE_DATASETS: Record<UsagePeriod, typeof USAGE_MONTHLY> = {
  Monthly:   USAGE_MONTHLY,
  Quarterly: USAGE_QUARTERLY,
  Yearly:    USAGE_YEARLY,
}

function SystemUsageTab() {
  const [period,    setPeriod]    = useState<UsagePeriod>('Monthly')
  const [generated, setGenerated] = useState(false)
  const exp = useExportActions()

  const data = USAGE_DATASETS[period]
  const totLogins  = data.reduce((s, d) => s + d.logins,  0)
  const totActions = data.reduce((s, d) => s + d.actions, 0)
  const totErrors  = data.reduce((s, d) => s + d.errors,  0)
  const avgUsers   = Math.round(data.reduce((s, d) => s + d.users, 0) / data.length)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="px-5 py-4 flex items-end gap-4">
          <div className="w-48">
            <Field label="Period Grouping">
              <Sel value={period} onChange={v => setPeriod(v as UsagePeriod)}>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </Sel>
            </Field>
          </div>
          <Button onClick={() => setGenerated(true)}>
            <RefreshCw size={14} strokeWidth={2} />
            Generate Report
          </Button>
        </div>
      </Card>

      {generated && (
        <>
          {exp.strip && <ExportStrip msg={exp.strip} onClose={exp.closeStrip} />}
          <ExportToolbar {...exp.toolbarProps} />

          {/* Stat tiles */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Logins',     value: totLogins,           cls: 'text-accent'  },
              { label: 'Avg Active Users', value: avgUsers,            cls: 'text-ink'     },
              { label: 'Total Actions',    value: totActions,          cls: 'text-success' },
              { label: 'Total Errors',     value: totErrors,           cls: 'text-danger'  },
            ].map(({ label, value, cls }) => (
              <Card key={label}>
                <div className="px-4 py-3 text-center">
                  <div className={`text-[22px] font-bold ${cls}`}>{value}</div>
                  <div className="text-[11.5px] text-ink-3 mt-0.5">{label}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Line chart */}
          <Card>
            <div className="px-5 py-4">
              <p className="text-[13px] font-semibold text-ink mb-1">Logins &amp; Actions Over Time</p>
              <p className="text-[12px] text-ink-3 mb-4">{period} breakdown · {data.length} period{data.length !== 1 ? 's' : ''}</p>
              <UsageLineChart data={data} />
            </div>
          </Card>

          {/* Detail table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    {['Period', 'Logins', 'Active Users', 'Total Actions', 'Errors', 'Error Rate'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.map(d => {
                    const errRate = d.actions > 0 ? ((d.errors / d.actions) * 100).toFixed(1) : '0.0'
                    return (
                      <tr key={d.period} className="hover:bg-surface-2/50">
                        <td className="px-4 py-3 font-medium text-ink">{d.period}</td>
                        <td className="px-4 py-3 text-accent  font-semibold tabular-nums">{d.logins}</td>
                        <td className="px-4 py-3 text-ink-2 tabular-nums">{d.users}</td>
                        <td className="px-4 py-3 text-success font-semibold tabular-nums">{d.actions}</td>
                        <td className="px-4 py-3 text-danger  font-semibold tabular-nums">{d.errors}</td>
                        <td className="px-4 py-3 text-ink-2 tabular-nums">{errRate}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-border text-[12px] text-ink-3">
              {data.length} {period.toLowerCase().replace('ly', '')} period{data.length !== 1 ? 's' : ''}
            </div>
          </Card>
        </>
      )}
      <ScheduleModal open={exp.showSchedule} onClose={exp.closeSchedule} />
      <EmailModal    open={exp.showEmail}    onClose={exp.closeEmail}    />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Tab 5 — Custom Report Builder
══════════════════════════════════════════════════════════════ */

const OPERATORS = ['equals', 'contains', 'starts with', 'greater than', 'less than', 'is not empty']

let condId = 0

function CustomBuilderTab() {
  const [source,     setSource]     = useState<DataSource>('users')
  const [columns,    setColumns]    = useState<string[]>(COLUMNS_BY_SOURCE.users)
  const [conditions, setConditions] = useState<FilterCondition[]>([])
  const [previewed,  setPreviewed]  = useState(false)
  const exp = useExportActions()

  function handleSourceChange(s: DataSource) {
    setSource(s)
    setColumns(COLUMNS_BY_SOURCE[s])
    setConditions([])
    setPreviewed(false)
  }

  function toggleColumn(col: string) {
    setColumns(prev =>
      prev.includes(col)
        ? prev.filter(c => c !== col)
        : [...prev, col]
    )
  }

  function addCondition() {
    if (conditions.length >= 3) return
    setConditions(prev => [...prev, {
      id: `c${++condId}`,
      field:    COLUMNS_BY_SOURCE[source][0],
      operator: 'contains',
      value:    '',
    }])
  }

  function updateCondition(id: string, key: keyof FilterCondition, value: string) {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, [key]: value } : c))
  }

  function removeCondition(id: string) {
    setConditions(prev => prev.filter(c => c.id !== id))
  }

  const allCols   = COLUMNS_BY_SOURCE[source]
  const previewRows = PREVIEW_ROWS[source].map(row =>
    Object.fromEntries(columns.filter(c => allCols.includes(c)).map(c => [c, row[c] ?? '—']))
  )

  const SOURCE_OPTIONS: Array<{ id: DataSource; label: string; desc: string }> = [
    { id:'users',        label:'Users',         desc:'Accounts, roles, status'          },
    { id:'billing',      label:'Billing',       desc:'Bills, periods, amounts'          },
    { id:'payments',     label:'Payments',      desc:'Payments, methods, receipts'      },
    { id:'tenants',      label:'Tenants',       desc:'Tenant profiles, occupancy'       },
    { id:'audit',        label:'Audit Log',     desc:'System events, actions, IPs'      },
    { id:'system_usage', label:'System Usage',  desc:'Logins, actions, errors by period'},
  ]

  return (
    <div className="flex flex-col gap-4">

      {/* Step 1 — Data Source */}
      <Card>
        <div className="px-5 py-4">
          <p className="text-[13.5px] font-semibold text-ink mb-3">Step 1 — Select Data Source</p>
          <div className="grid grid-cols-3 gap-2">
            {SOURCE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSourceChange(opt.id)}
                className={`flex flex-col gap-0.5 p-3 rounded-btn border text-left transition-colors ${
                  source === opt.id
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-border hover:border-border-strong text-ink-2'
                }`}
              >
                <span className="text-[13px] font-semibold">{opt.label}</span>
                <span className="text-[11px] text-ink-3">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Step 2 — Columns */}
      <Card>
        <div className="px-5 py-4">
          <p className="text-[13.5px] font-semibold text-ink mb-3">Step 2 — Choose Columns</p>
          <div className="flex flex-wrap gap-2">
            {allCols.map(col => (
              <label
                key={col}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-chip border cursor-pointer text-[13px] transition-colors ${
                  columns.includes(col)
                    ? 'border-accent bg-accent/5 text-ink'
                    : 'border-border text-ink-3 hover:border-border-strong'
                }`}
              >
                <input
                  type="checkbox"
                  checked={columns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  className="accent-accent w-3 h-3"
                />
                {col}
              </label>
            ))}
          </div>
          {columns.length === 0 && (
            <p className="text-[12px] text-danger mt-2">Select at least one column.</p>
          )}
        </div>
      </Card>

      {/* Step 3 — Filters */}
      <Card>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13.5px] font-semibold text-ink">Step 3 — Add Filters <span className="text-[12px] font-normal text-ink-3">(optional, max 3)</span></p>
            <Button size="sm" variant="ghost" onClick={addCondition} disabled={conditions.length >= 3}>
              <Plus size={13} strokeWidth={2} />
              Add Condition
            </Button>
          </div>

          {conditions.length === 0 && (
            <p className="text-[13px] text-ink-3 py-2">No filters added — report will return all records.</p>
          )}

          <div className="flex flex-col gap-2">
            {conditions.map((cond, i) => (
              <div key={cond.id} className="flex items-center gap-2">
                <span className="text-[11.5px] text-ink-3 w-8 text-right shrink-0">
                  {i === 0 ? 'WHERE' : 'AND'}
                </span>
                <div className="relative flex-1">
                  <select
                    value={cond.field}
                    onChange={e => updateCondition(cond.id, 'field', e.target.value)}
                    className={SEL_CLS + ' text-[12.5px] py-1.5'}
                  >
                    {allCols.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <select
                    value={cond.operator}
                    onChange={e => updateCondition(cond.id, 'operator', e.target.value)}
                    className={SEL_CLS + ' text-[12.5px] py-1.5'}
                  >
                    {OPERATORS.map(op => <option key={op}>{op}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
                </div>
                <input
                  type="text"
                  value={cond.value}
                  onChange={e => updateCondition(cond.id, 'value', e.target.value)}
                  placeholder="value…"
                  className={INPUT_CLS + ' text-[12.5px] py-1.5 flex-1'}
                />
                <button type="button" onClick={() => removeCondition(cond.id)} className="text-ink-3 hover:text-danger p-1 rounded-btn transition-colors">
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button disabled={columns.length === 0} onClick={() => setPreviewed(true)}>
              <RefreshCw size={14} strokeWidth={2} />
              Preview Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview */}
      {previewed && (
        <>
          {exp.strip && <ExportStrip msg={exp.strip} onClose={exp.closeStrip} />}
          <ExportToolbar {...exp.toolbarProps} />
          <Card>
            <div className="px-5 py-4 border-b border-border">
              <p className="text-[13.5px] font-semibold text-ink">Report Preview</p>
              <p className="text-[12px] text-ink-3 mt-0.5">
                Source: <span className="font-medium text-ink-2 capitalize">{source}</span> ·{' '}
                {columns.length} column{columns.length !== 1 ? 's' : ''} ·{' '}
                {conditions.length} filter{conditions.length !== 1 ? 's' : ''} ·{' '}
                Showing sample data
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    {columns.filter(c => allCols.includes(c)).map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previewRows.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-2/50">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-4 py-3 text-ink-2">{val as string}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-border text-[12px] text-ink-3">
              Sample preview · Full export includes all matching records
            </div>
          </Card>
        </>
      )}
      <ScheduleModal open={exp.showSchedule} onClose={exp.closeSchedule} />
      <EmailModal    open={exp.showEmail}    onClose={exp.closeEmail}    />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Tab bar definition
══════════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'activity'     as const, label: 'User Activity',       icon: Activity          },
  { id: 'transactions' as const, label: 'Transaction Summary', icon: BarChart2         },
  { id: 'audit'        as const, label: 'Audit Trail',         icon: ClipboardList     },
  { id: 'usage'        as const, label: 'System Usage',        icon: SlidersHorizontal },
  { id: 'custom'       as const, label: 'Custom Builder',      icon: Wand2             },
]

/* ══════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════ */

export function AdminReports() {
  const [tab, setTab] = useState<ReportTab>('activity')

  return (
    <main className="flex flex-col gap-5 px-8 py-6 max-w-[1200px]">
      <PageHead
        title="Admin Reports"
        subtitle="Generate, filter, export, and schedule system-wide reports"
      />

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap',
              tab === id
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-3 hover:text-ink',
            ].join(' ')}
          >
            <Icon size={14} strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tab === 'activity'     && <UserActivityTab />}
      {tab === 'transactions' && <TransactionSummaryTab />}
      {tab === 'audit'        && <AuditTrailTab />}
      {tab === 'usage'        && <SystemUsageTab />}
      {tab === 'custom'       && <CustomBuilderTab />}
    </main>
  )
}
