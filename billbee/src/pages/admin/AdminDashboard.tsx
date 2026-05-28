import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, UserCheck, UserX, UserPlus,
  ShieldAlert, Lock, HardDrive, Database,
  UserCog, ClipboardList, BarChart2, Settings,
  ChevronRight, RefreshCw, AlertTriangle, CheckCircle2,
  Activity, Zap,
} from 'lucide-react'
import { Card, CardHead } from '../../components/ui/Card'
import { StatTile } from '../../components/ui/StatTile'
import { Pill } from '../../components/ui/Pill'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

/* ══════════════════════════════════════════════════════════════
   Mock data
══════════════════════════════════════════════════════════════ */

// 30 days of daily system data (March 2026)
const ALL_DAYS = [
  { d:'Mar 1',  reg:0, active:8,  logins:12, txns:7,  loadMs:920,  errPct:0.2 },
  { d:'Mar 2',  reg:1, active:7,  logins:9,  txns:5,  loadMs:880,  errPct:0.0 },
  { d:'Mar 3',  reg:0, active:9,  logins:15, txns:8,  loadMs:1050, errPct:0.5 },
  { d:'Mar 4',  reg:0, active:8,  logins:11, txns:6,  loadMs:940,  errPct:0.0 },
  { d:'Mar 5',  reg:1, active:10, logins:18, txns:11, loadMs:870,  errPct:0.3 },
  { d:'Mar 6',  reg:0, active:7,  logins:8,  txns:4,  loadMs:1120, errPct:0.8 },
  { d:'Mar 7',  reg:0, active:6,  logins:6,  txns:3,  loadMs:900,  errPct:0.0 },
  { d:'Mar 8',  reg:0, active:9,  logins:14, txns:9,  loadMs:850,  errPct:0.0 },
  { d:'Mar 9',  reg:0, active:8,  logins:13, txns:7,  loadMs:960,  errPct:0.4 },
  { d:'Mar 10', reg:0, active:10, logins:16, txns:10, loadMs:890,  errPct:0.1 },
  { d:'Mar 11', reg:1, active:11, logins:19, txns:12, loadMs:820,  errPct:0.0 },
  { d:'Mar 12', reg:0, active:9,  logins:14, txns:8,  loadMs:1080, errPct:0.6 },
  { d:'Mar 13', reg:0, active:8,  logins:11, txns:6,  loadMs:930,  errPct:0.2 },
  { d:'Mar 14', reg:0, active:7,  logins:9,  txns:5,  loadMs:870,  errPct:0.0 },
  { d:'Mar 15', reg:0, active:9,  logins:15, txns:9,  loadMs:910,  errPct:0.3 },
  { d:'Mar 16', reg:0, active:10, logins:17, txns:11, loadMs:840,  errPct:0.0 },
  { d:'Mar 17', reg:1, active:11, logins:20, txns:13, loadMs:800,  errPct:0.1 },
  { d:'Mar 18', reg:0, active:9,  logins:14, txns:8,  loadMs:950,  errPct:0.4 },
  { d:'Mar 19', reg:0, active:8,  logins:12, txns:7,  loadMs:920,  errPct:0.2 },
  { d:'Mar 20', reg:0, active:7,  logins:10, txns:5,  loadMs:1000, errPct:0.5 },
  { d:'Mar 21', reg:0, active:6,  logins:7,  txns:3,  loadMs:890,  errPct:0.0 },
  { d:'Mar 22', reg:0, active:9,  logins:14, txns:8,  loadMs:860,  errPct:0.1 },
  { d:'Mar 23', reg:0, active:10, logins:16, txns:10, loadMs:820,  errPct:0.0 },
  { d:'Mar 24', reg:1, active:11, logins:18, txns:12, loadMs:800,  errPct:0.2 },
  { d:'Mar 25', reg:0, active:9,  logins:13, txns:7,  loadMs:930,  errPct:0.3 },
  { d:'Mar 26', reg:0, active:8,  logins:11, txns:6,  loadMs:970,  errPct:0.4 },
  { d:'Mar 27', reg:0, active:7,  logins:9,  txns:5,  loadMs:910,  errPct:0.1 },
  { d:'Mar 28', reg:0, active:8,  logins:12, txns:7,  loadMs:880,  errPct:0.0 },
  { d:'Mar 29', reg:0, active:9,  logins:14, txns:9,  loadMs:850,  errPct:0.2 },
  { d:'Mar 30', reg:0, active:10, logins:15, txns:10, loadMs:810,  errPct:0.0 },
]

type Day = typeof ALL_DAYS[number]

type Range = 'Today' | 'Week' | 'Month'

function getSlice(range: Range): Day[] {
  if (range === 'Today') return ALL_DAYS.slice(-1)
  if (range === 'Week')  return ALL_DAYS.slice(-7)
  return ALL_DAYS
}

/* ══════════════════════════════════════════════════════════════
   SVG chart helpers
══════════════════════════════════════════════════════════════ */

const CX0 = 44, CX1 = 656
const CY_BASE = 190, CY_TOP = 20

function toX(i: number, n: number) {
  return n <= 1 ? (CX0 + CX1) / 2 : CX0 + (i / (n - 1)) * (CX1 - CX0)
}
function toY(val: number, max: number) {
  if (max === 0) return CY_BASE
  return CY_BASE - ((val / max) * (CY_BASE - CY_TOP))
}
function linePoints(vals: number[], max: number, n: number) {
  return vals.map((v, i) => `${toX(i, n).toFixed(1)},${toY(v, max).toFixed(1)}`).join(' ')
}

const GRIDLINES_4 = [
  { y: CY_TOP,                               pct: 1.0 },
  { y: CY_TOP + (CY_BASE - CY_TOP) * 0.33,  pct: 0.67 },
  { y: CY_TOP + (CY_BASE - CY_TOP) * 0.67,  pct: 0.33 },
  { y: CY_BASE,                              pct: 0.0 },
]

function ChartGridlines({ maxVal }: { maxVal: number }) {
  return (
    <>
      {GRIDLINES_4.map(({ y, pct }) => (
        <g key={y}>
          {y < CY_BASE
            ? <line x1={CX0} y1={y} x2={CX1} y2={y} stroke="var(--color-border-subtle)" strokeDasharray="2 4" />
            : <line x1={CX0} y1={y} x2={CX1} y2={y} stroke="var(--color-border)" />
          }
          <text x={CX0 - 6} y={y + 4} textAnchor="end"
            fontFamily="Geist Mono, monospace" fontSize="10" fill="var(--color-ink-3)">
            {Math.round(maxVal * pct)}
          </text>
        </g>
      ))}
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   1. User Registrations Chart
══════════════════════════════════════════════════════════════ */

function UserRegistrationsChart({ series }: { series: Day[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const n = series.length

  const maxActive = Math.max(...series.map(d => d.active), 1)
  const activePoints = linePoints(series.map(d => d.active), maxActive, n)
  const regPoints    = series.map((d, i) => ({ x: toX(i, n), y: toY(d.reg, 3), d }))

  const hoveredDay = series.find(d => d.d === hovered) ?? series[series.length - 1]

  function Swatch({ className }: { className: string }) {
    return <span className={`inline-block w-[10px] h-[10px] rounded-[2px] ${className}`} />
  }

  return (
    <Card>
      <CardHead
        title="User Statistics"
        subtitle="active users per day · new registrations"
        actions={
          <div className="flex items-center gap-4 text-[12px] text-ink-3">
            <span className="flex items-center gap-1.5">
              <Swatch className="bg-ink" /> active
            </span>
            <span className="flex items-center gap-1.5">
              <Swatch className="bg-accent rounded-full" /> new reg.
            </span>
          </div>
        }
      />

      <svg viewBox="0 0 700 215" width="100%" height="215" style={{ display: 'block', overflow: 'visible' }}>
        <ChartGridlines maxVal={maxActive} />

        {/* Active users line */}
        <polyline
          points={activePoints}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dot highlights for active users */}
        {series.map((d, i) => (
          <circle
            key={d.d}
            cx={toX(i, n)} cy={toY(d.active, maxActive)} r="3"
            fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.5"
            onMouseEnter={() => setHovered(d.d)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'default' }}
          />
        ))}

        {/* New registration dots */}
        {regPoints.map(({ x, y, d }) => d.reg > 0 && (
          <circle
            key={d.d + '-reg'}
            cx={x} cy={y} r="5"
            fill="var(--color-accent)"
            onMouseEnter={() => setHovered(d.d)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'default' }}
          />
        ))}

        {/* X-axis labels — show every other when >14 points */}
        {series.map((d, i) => {
          if (n > 14 && i % 5 !== 0 && i !== n - 1) return null
          return (
            <text key={d.d} x={toX(i, n)} y="210" textAnchor="middle"
              fontFamily="Inter, sans-serif" fontSize="10" fill="var(--color-ink-3)">
              {d.d.replace('Mar ', '')}
            </text>
          )
        })}

        {/* Hover tooltip */}
        {hoveredDay && (() => {
          const i = series.indexOf(hoveredDay)
          const tx = Math.min(Math.max(toX(i, n), 60), 580)
          const ty = Math.max(toY(hoveredDay.active, maxActive) - 42, 6)
          return (
            <g transform={`translate(${tx},${ty})`}>
              <rect x="-4" y="-4" width="108" height="36" rx="6" fill="var(--color-ink)" />
              <text x="0" y="7" fontFamily="Inter, sans-serif" fontSize="10" fill="rgba(255,255,255,0.6)">
                {hoveredDay.d} · {hoveredDay.reg > 0 ? `+${hoveredDay.reg} new` : 'no new'}
              </text>
              <text x="0" y="22" fontFamily="Geist Mono, monospace" fontSize="12" fontWeight="600" fill="white">
                {hoveredDay.active} active
              </text>
            </g>
          )
        })()}
      </svg>

      {/* Footer KPIs */}
      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border-subtle text-[12.5px] text-ink-3 flex-wrap">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[14px] font-semibold text-ink">
            {series[series.length - 1].active}
          </span>
          <span>active today</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[14px] font-semibold text-ink">
            {series.reduce((s, d) => s + d.reg, 0)}
          </span>
          <span>new registrations</span>
        </div>
        <div className="ml-auto text-ink-4 text-[11.5px]">
          updated <span className="font-mono">just now</span>
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   2. Transaction Overview Chart (grouped bars)
══════════════════════════════════════════════════════════════ */

function TransactionOverviewChart({ series }: { series: Day[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const n = series.length

  const maxTxns = Math.max(...series.map(d => d.logins + d.txns), 1)
  const groupW = (CX1 - CX0) / Math.max(n, 1)
  const barW = Math.min(28, Math.floor(groupW * 0.35))
  const gap = 2

  function Swatch({ className }: { className: string }) {
    return <span className={`inline-block w-[10px] h-[10px] rounded-[2px] ${className}`} />
  }

  return (
    <Card>
      <CardHead
        title="Transaction Overview"
        subtitle="logins + system activity per day"
        actions={
          <div className="flex items-center gap-4 text-[12px] text-ink-3">
            <span className="flex items-center gap-1.5">
              <Swatch className="bg-surface-2 border border-border-strong" /> logins
            </span>
            <span className="flex items-center gap-1.5">
              <Swatch className="bg-ink" /> activity
            </span>
          </div>
        }
      />

      <svg viewBox="0 0 700 215" width="100%" height="215" style={{ display: 'block', overflow: 'visible' }}>
        <ChartGridlines maxVal={maxTxns} />

        {series.map((d, i) => {
          const cx   = CX0 + i * groupW + groupW / 2
          const lH   = Math.round((d.logins / maxTxns) * (CY_BASE - CY_TOP))
          const tH   = Math.round((d.txns   / maxTxns) * (CY_BASE - CY_TOP))
          const isHov = hovered === d.d
          return (
            <g key={d.d}
              onMouseEnter={() => setHovered(d.d)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Logins bar */}
              <rect
                x={cx - barW - gap / 2} y={CY_BASE - lH} width={barW} height={lH} rx="3"
                fill="var(--color-surface-2)" stroke="var(--color-border-strong)"
                opacity={isHov ? 0.85 : 1}
              />
              {/* Activity bar */}
              <rect
                x={cx + gap / 2} y={CY_BASE - tH} width={barW} height={tH} rx="3"
                fill="var(--color-ink)"
                opacity={isHov ? 0.75 : 1}
              />
              {/* X label */}
              {(n <= 7 || i % 5 === 0 || i === n - 1) && (
                <text x={cx} y="210" textAnchor="middle"
                  fontFamily="Inter, sans-serif" fontSize="10"
                  fill="var(--color-ink-3)">
                  {d.d.replace('Mar ', '')}
                </text>
              )}

              {/* Tooltip */}
              {isHov && (() => {
                const tx = Math.min(Math.max(cx, 60), 580)
                const ty = Math.max(CY_BASE - Math.max(lH, tH) - 44, 6)
                return (
                  <g transform={`translate(${tx},${ty})`}>
                    <rect x="-4" y="-4" width="120" height="36" rx="6" fill="var(--color-ink)" />
                    <text x="0" y="7" fontFamily="Inter, sans-serif" fontSize="10" fill="rgba(255,255,255,0.6)">
                      {d.d}
                    </text>
                    <text x="0" y="22" fontFamily="Geist Mono, monospace" fontSize="11" fontWeight="600" fill="white">
                      {d.logins} logins · {d.txns} txns
                    </text>
                  </g>
                )
              })()}
            </g>
          )
        })}
      </svg>

      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border-subtle text-[12.5px] text-ink-3 flex-wrap">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[14px] font-semibold text-ink">
            {series.reduce((s, d) => s + d.logins, 0)}
          </span>
          <span>total logins</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[14px] font-semibold text-ink">
            {series.reduce((s, d) => s + d.txns, 0)}
          </span>
          <span>transactions</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[14px] font-semibold text-ink">
            {(series.reduce((s, d) => s + d.logins + d.txns, 0) / series.length).toFixed(1)}
          </span>
          <span>avg / day</span>
        </div>
        <div className="ml-auto text-ink-4 text-[11.5px]">
          updated <span className="font-mono">just now</span>
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   3. Performance Metrics Chart (dual line)
══════════════════════════════════════════════════════════════ */

function PerformanceMetricsChart({ series }: { series: Day[] }) {
  const n = series.length
  const maxLoad = Math.max(...series.map(d => d.loadMs), 1)
  const maxErr  = Math.max(...series.map(d => d.errPct), 0.1)

  const loadPoints = linePoints(series.map(d => d.loadMs), maxLoad, n)
  const errPoints  = linePoints(series.map(d => d.errPct), maxErr,  n)

  const avgLoad = Math.round(series.reduce((s, d) => s + d.loadMs, 0) / series.length)
  const maxErrVal = Math.max(...series.map(d => d.errPct))

  // Threshold: 1000ms load time
  const thresholdY = toY(1000, maxLoad)

  return (
    <Card>
      <CardHead
        title="Performance Metrics"
        subtitle="page load time (ms) · error rate (%)"
      />

      <svg viewBox="0 0 700 190" width="100%" height="190" style={{ display: 'block', overflow: 'visible' }}>

        {/* Threshold line at 1000ms */}
        {thresholdY > CY_TOP && thresholdY < CY_BASE && (
          <line x1={CX0} y1={thresholdY} x2={CX1} y2={thresholdY}
            stroke="var(--color-danger)" strokeDasharray="3 5" strokeWidth="1" opacity="0.5" />
        )}

        {/* Gridlines */}
        {[CY_TOP, CY_TOP + (CY_BASE - CY_TOP) / 2, CY_BASE].map(y => (
          <line key={y} x1={CX0} y1={y} x2={CX1} y2={y}
            stroke={y === CY_BASE ? 'var(--color-border)' : 'var(--color-border-subtle)'}
            strokeDasharray={y === CY_BASE ? undefined : '2 4'} />
        ))}

        <text x={CX0 - 6} y={CY_TOP + 4} textAnchor="end"
          fontFamily="Geist Mono, monospace" fontSize="10" fill="var(--color-ink-3)">
          {maxLoad}ms
        </text>
        <text x={CX0 - 6} y={CY_BASE + 4} textAnchor="end"
          fontFamily="Geist Mono, monospace" fontSize="10" fill="var(--color-ink-3)">
          0
        </text>

        {/* Load time line */}
        <polyline
          points={loadPoints}
          fill="none" stroke="var(--color-ink)" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round"
        />

        {/* Error rate line */}
        <polyline
          points={errPoints}
          fill="none" stroke="var(--color-danger)" strokeWidth="1.5"
          strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 3"
          opacity="0.7"
        />

        {/* X labels */}
        {series.map((d, i) => {
          if (n > 7 && i % 5 !== 0 && i !== n - 1) return null
          return (
            <text key={d.d} x={toX(i, n)} y="205" textAnchor="middle"
              fontFamily="Inter, sans-serif" fontSize="10" fill="var(--color-ink-3)">
              {d.d.replace('Mar ', '')}
            </text>
          )
        })}

        {/* Threshold label */}
        {thresholdY > CY_TOP && thresholdY < CY_BASE && (
          <text x={CX1 + 4} y={thresholdY + 4}
            fontFamily="Geist Mono, monospace" fontSize="9" fill="var(--color-danger)" opacity="0.7">
            1s
          </text>
        )}
      </svg>

      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border-subtle text-[12.5px] text-ink-3 flex-wrap">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-mono text-[14px] font-semibold ${avgLoad > 1000 ? 'text-danger' : 'text-ink'}`}>
            {avgLoad}ms
          </span>
          <span>avg load</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`font-mono text-[14px] font-semibold ${maxErrVal > 1 ? 'text-danger' : 'text-ink'}`}>
            {maxErrVal.toFixed(1)}%
          </span>
          <span>peak error rate</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="inline-block w-6 h-[2px] bg-danger opacity-60 mr-1" style={{ borderTop: '2px dashed' }} />
          <span className="text-[11.5px] text-ink-4">error rate</span>
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   4. System Health
══════════════════════════════════════════════════════════════ */

function SystemHealthCard() {
  const metrics = [
    {
      label: 'Server uptime',
      value: '99.8%',
      sub: '14 days, 3 hrs continuous',
      status: 'ok' as const,
    },
    {
      label: 'Database size',
      value: '1.4 GB',
      sub: '↑ 42 MB from last week',
      status: 'ok' as const,
      bar: 14,
    },
    {
      label: 'Storage usage',
      value: '2.3 GB',
      sub: 'of 10 GB allocated',
      status: 'ok' as const,
      bar: 23,
    },
  ]

  const statusColor = {
    ok:   'bg-success',
    warn: 'bg-warning',
    crit: 'bg-danger',
  }

  return (
    <Card>
      <CardHead title="System Health" subtitle="live infrastructure snapshot" />
      <div className="flex flex-col gap-4">
        {metrics.map(m => (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor[m.status]}`} />
                <span className="text-[13px] text-ink-2">{m.label}</span>
              </div>
              <span className="font-mono text-[13px] font-semibold text-ink">{m.value}</span>
            </div>
            {m.bar !== undefined && (
              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-ui ${m.bar > 80 ? 'bg-danger' : m.bar > 60 ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${m.bar}%` }}
                />
              </div>
            )}
            <p className="text-[11.5px] text-ink-4 pl-4">{m.sub}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   5. Recent Activities
══════════════════════════════════════════════════════════════ */

const RECENT_ACTIVITIES = [
  { icon: UserPlus,     color: 'text-success',  label: 'New landlord registered',           actor: 'j.reyes@sunsetapts.ph',         time: '2m ago' },
  { icon: ShieldAlert,  color: 'text-warning',  label: '5 failed login attempts',            actor: 'IP 192.168.1.42',               time: '14m ago' },
  { icon: CheckCircle2, color: 'text-success',  label: 'Scheduled backup completed',         actor: 'System',                        time: '2h ago' },
  { icon: UserX,        color: 'text-danger',   label: 'Account suspended',                  actor: 'Admin → m.santos@tenant.ph',    time: '3h ago' },
  { icon: UserCheck,    color: 'text-ink-3',    label: 'User role changed to Landlord',      actor: 'Admin → a.lim@props.ph',        time: '5h ago' },
  { icon: Database,     color: 'text-info',     label: 'Database size crossed 1 GB',         actor: 'System monitor',                time: 'Mar 29' },
  { icon: Lock,         color: 'text-warning',  label: 'Account auto-locked after 5 attempts', actor: 'r.cruz@billbee.ph',           time: 'Mar 29' },
  { icon: CheckCircle2, color: 'text-success',  label: 'Manual backup completed',            actor: 'Admin',                         time: 'Mar 28' },
]

function RecentActivitiesCard() {
  const navigate = useNavigate()
  return (
    <Card noPadding>
      <div className="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display text-[16px] font-semibold text-ink tracking-[-0.01em]">
            Recent Activities
          </h3>
          <p className="text-[12.5px] text-ink-3 mt-0.5">real-time feed of system actions</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/audit-logs')}
          className="text-[12.5px] text-ink-3 hover:text-ink transition-colors flex items-center gap-1"
        >
          View all <ChevronRight size={13} strokeWidth={1.75} />
        </button>
      </div>

      <div className="divide-y divide-border">
        {RECENT_ACTIVITIES.map((a, i) => {
          const Icon = a.icon
          return (
            <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-surface-2 transition-colors">
              <span className={`shrink-0 mt-0.5 ${a.color}`}>
                <Icon size={15} strokeWidth={1.75} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink">{a.label}</p>
                <p className="text-[11.5px] text-ink-4 truncate">{a.actor}</p>
              </div>
              <span className="text-[11.5px] text-ink-4 shrink-0 tabular-nums">{a.time}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   6. Admin Quick Actions
══════════════════════════════════════════════════════════════ */

const ADMIN_ACTIONS = [
  {
    icon: UserCog,      label: 'Create user',
    sub: 'add a new landlord or admin account',
    href: '/admin/users/new', primary: true,
  },
  {
    icon: ClipboardList, label: 'View audit logs',
    sub: 'review recent system actions',
    href: '/admin/audit-logs',
  },
  {
    icon: HardDrive,    label: 'Run backup',
    sub: 'create a manual system snapshot',
    href: '/admin/backups',
  },
  {
    icon: BarChart2,    label: 'View reports',
    sub: 'user activity, system usage',
    href: '/admin/reports',
  },
  {
    icon: Settings,     label: 'Open settings',
    sub: 'branding, email, security, backup',
    href: '/admin/settings',
  },
]

function AdminQuickActions() {
  const navigate = useNavigate()
  return (
    <Card>
      <CardHead title="Quick actions" subtitle="shortcuts for frequent tasks" />
      <div className="flex flex-col gap-2 mt-4">
        {ADMIN_ACTIONS.map(({ icon: Icon, label, sub, href, primary }) => (
          <button
            key={href}
            type="button"
            onClick={() => navigate(href)}
            className={[
              'flex items-center gap-3 px-[14px] py-3 rounded-btn text-left border transition-ui',
              primary
                ? 'bg-ink border-ink hover:bg-ink-2 hover:border-ink-2'
                : 'bg-surface border-border hover:bg-surface-2 hover:border-border-strong',
            ].join(' ')}
          >
            <span className={[
              'w-9 h-9 rounded-chip inline-flex items-center justify-center shrink-0',
              primary ? 'bg-white/10 text-white' : 'bg-surface-2 text-ink-2',
            ].join(' ')}>
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <div className="flex-1 min-w-0">
              <div className={`text-[14px] font-semibold mb-px ${primary ? 'text-white' : 'text-ink'}`}>
                {label}
              </div>
              <div className={`text-[12px] ${primary ? 'text-white/65' : 'text-ink-3'}`}>
                {sub}
              </div>
            </div>
            <ChevronRight
              size={16} strokeWidth={1.75}
              className={primary ? 'text-white/40 shrink-0' : 'text-ink-4 shrink-0'}
            />
          </button>
        ))}
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Stat grid
══════════════════════════════════════════════════════════════ */

const SZ = 14, SW = 1.75

function AdminStatGrid() {
  const navigate = useNavigate()
  return (
    <div className="grid grid-cols-4 max-[1100px]:grid-cols-2"
      style={{ gap: 'var(--gap-grid)', marginBottom: 'var(--gap-grid)' }}>

      <StatTile
        label="Total users"
        value={12}
        sub="9 active · 2 pending"
        icon={<Users size={SZ} strokeWidth={SW} />}
        onClick={() => navigate('/admin/users')}
      />
      <StatTile
        label="Active now"
        value={4}
        sub="last 15 minutes"
        icon={<Activity size={SZ} strokeWidth={SW} />}
        iconVariant="success"
        onClick={() => navigate('/admin/users')}
      />
      <StatTile
        label="New registrations"
        value={3}
        delta={{ label: '+1 vs last week', variant: 'up' }}
        icon={<UserPlus size={SZ} strokeWidth={SW} />}
        iconVariant="accent"
        onClick={() => navigate('/admin/users')}
      />
      <StatTile
        label="Suspended"
        value={1}
        sub="pending review"
        icon={<UserX size={SZ} strokeWidth={SW} />}
        iconVariant="warn"
        valueVariant="attention"
        onClick={() => navigate('/admin/users')}
      />

      <StatTile
        label="Failed logins today"
        value={5}
        sub="from 2 IPs"
        icon={<ShieldAlert size={SZ} strokeWidth={SW} />}
        iconVariant="warn"
        valueVariant="attention"
        onClick={() => navigate('/admin/audit-logs')}
      />
      <StatTile
        label="Account lockouts"
        value={1}
        sub="needs admin reset"
        icon={<Lock size={SZ} strokeWidth={SW} />}
        iconVariant="danger"
        valueVariant="danger"
        onClick={() => navigate('/admin/users')}
      />
      <StatTile
        label="Last backup"
        value="2h ago"
        delta={{ label: 'successful', variant: 'up' }}
        icon={<HardDrive size={SZ} strokeWidth={SW} />}
        iconVariant="success"
        onClick={() => navigate('/admin/backups')}
      />
      <StatTile
        label="Storage usage"
        value="2.3 GB"
        sub="of 10 GB · 23%"
        icon={<Database size={SZ} strokeWidth={SW} />}
        onClick={() => navigate('/admin/data-controls')}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Alerts strip
══════════════════════════════════════════════════════════════ */

function AlertsStrip({ onDismiss }: { onDismiss: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-btn border border-warning/30 bg-warning/5">
      <AlertTriangle size={15} strokeWidth={1.75} className="text-warning shrink-0" />
      <p className="flex-1 text-[13.5px] text-ink">
        <strong className="font-semibold">5 failed login attempts</strong> from IP 192.168.1.42 in the last hour.
        {' '}
        <button
          type="button"
          onClick={() => navigate('/admin/audit-logs')}
          className="underline underline-offset-2 hover:text-ink-2 transition-colors"
        >
          View in audit logs →
        </button>
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-ink-4 hover:text-ink transition-colors text-[11px] font-medium"
      >
        Dismiss
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════ */

const RANGES = ['Today', 'Week', 'Month'] as const

export function AdminDashboard() {
  const [range,       setRange]       = useState<Range>('Week')
  const [alertVisible, setAlertVisible] = useState(true)
  const [refreshLabel, setRefreshLabel] = useState('just now')

  const series = getSlice(range)

  function handleRefresh() {
    setRefreshLabel('refreshing…')
    setTimeout(() => setRefreshLabel('just now'), 800)
  }

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] leading-[1.1] text-ink mb-1">
            Good morning, Admin 👋
          </h1>
          <p className="text-[14px] text-ink-3 leading-[1.45]">
            System overview · refreshed{' '}
            <span className="font-mono">{refreshLabel}</span>
            {' '}· 12 users total
          </p>
        </div>

        {/* Date range filter + refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <SegmentedControl
            options={RANGES}
            value={range}
            onChange={setRange}
          />
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-[7px] bg-surface border border-border rounded-btn
                       text-[12.5px] text-ink-3 hover:text-ink hover:border-border-strong transition-ui"
          >
            <RefreshCw size={13} strokeWidth={1.75} />
            Refresh
          </button>
        </div>
      </div>

      {/* Alert strip */}
      {alertVisible && <AlertsStrip onDismiss={() => setAlertVisible(false)} />}

      {/* Stat grid — 8 tiles */}
      <AdminStatGrid />

      {/* Row 1: User Stats chart + Quick Actions */}
      <div
        className="grid grid-cols-[2fr_1fr] max-[1100px]:grid-cols-1"
        style={{ gap: 'var(--gap-grid)', marginBottom: 'var(--gap-grid)' }}
      >
        <UserRegistrationsChart series={series} />
        <AdminQuickActions />
      </div>

      {/* Row 2: Transaction Overview + System Health */}
      <div
        className="grid grid-cols-[2fr_1fr] max-[1100px]:grid-cols-1"
        style={{ gap: 'var(--gap-grid)', marginBottom: 'var(--gap-grid)' }}
      >
        <TransactionOverviewChart series={series} />
        <SystemHealthCard />
      </div>

      {/* Row 3: Recent Activities + Performance Metrics */}
      <div
        className="grid grid-cols-[2fr_1fr] max-[1100px]:grid-cols-1"
        style={{ gap: 'var(--gap-grid)' }}
      >
        <RecentActivitiesCard />
        <PerformanceMetricsChart series={series} />
      </div>

    </main>
  )
}
