import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Palette, Mail, ShieldCheck, HardDrive, Bell, Wrench, Key,
  Eye, EyeOff, Copy, Plus, Trash2, X, CheckCircle2,
  ChevronDown, ExternalLink, AlertTriangle, RefreshCw,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { PageHead } from '../../components/ui/PageHead'

/* ══════════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════════ */

type SectionId =
  | 'branding' | 'email' | 'security'
  | 'backup' | 'notifications' | 'maintenance' | 'api'

interface ApiKey { id: string; name: string; maskedKey: string; created: string }

/* ══════════════════════════════════════════════════════════════
   Form primitives
══════════════════════════════════════════════════════════════ */

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

const SEL_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full appearance-none'

function Field({
  label, hint, required = false, children,
}: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11.5px] text-ink-4">{hint}</p>}
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

function Toggle({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
        checked ? 'bg-accent' : 'bg-border'
      }`}
      aria-label={label}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
      }`} />
    </button>
  )
}

function TagInput({ tags, onAdd, onRemove, placeholder, validate }: {
  tags: string[]
  onAdd: (t: string) => void
  onRemove: (t: string) => void
  placeholder?: string
  validate?: (t: string) => boolean
}) {
  const [input, setInput] = useState('')
  const [err,   setErr]   = useState(false)

  function commit() {
    const val = input.trim()
    if (!val) return
    if (validate && !validate(val)) { setErr(true); return }
    if (!tags.includes(val)) onAdd(val)
    setInput('')
    setErr(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() }
    if (e.key === 'Backspace' && !input && tags.length) onRemove(tags[tags.length - 1])
    setErr(false)
  }

  return (
    <div className={`border rounded-btn p-2 min-h-[42px] flex flex-wrap gap-1.5 focus-within:border-accent transition-colors ${
      err ? 'border-danger' : 'border-border'
    }`}>
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-surface-2 border border-border rounded-chip text-[12.5px] text-ink-2">
          {t}
          <button type="button" onClick={() => onRemove(t)} className="text-ink-3 hover:text-danger ml-0.5">
            <X size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => { setInput(e.target.value); setErr(false) }}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] text-[13.5px] text-ink bg-transparent outline-none placeholder:text-ink-4"
      />
    </div>
  )
}

function ColorSwatch({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-9 h-9 rounded-btn border border-border shadow-sm shrink-0 hover:scale-105 transition-transform"
          style={{ background: value }}
          title="Click to open color picker"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={INPUT_CLS}
          placeholder="#6366f1"
          maxLength={7}
        />
        <input
          ref={ref}
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="sr-only"
        />
      </div>
    </Field>
  )
}

function ImageUpload({ label, value, onChange, shape = 'circle', size = 64, hint }: {
  label: string; value: string | null; onChange: (v: string | null) => void
  shape?: 'circle' | 'square'; size?: number; hint?: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-4">
        <div
          onClick={() => ref.current?.click()}
          className={`${shape === 'circle' ? 'rounded-full' : 'rounded-btn'} border border-border bg-surface-2 flex items-center justify-center overflow-hidden cursor-pointer hover:border-accent transition-colors shrink-0`}
          style={{ width: size, height: size }}
        >
          {value
            ? <img src={value} alt="preview" className="w-full h-full object-cover" />
            : <span className="text-[10px] text-ink-4 text-center px-1 leading-tight">No image</span>
          }
        </div>
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="ghost" onClick={() => ref.current?.click()}>Upload Image</Button>
          {value && (
            <button type="button" onClick={() => onChange(null)} className="text-[12px] text-ink-3 hover:text-danger transition-colors text-left">
              Remove
            </button>
          )}
        </div>
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} className="sr-only" />
      </div>
    </Field>
  )
}

/* ── Shared save footer ─────────────────────────────────────── */

function useSave() {
  const [saved, setSaved] = useState(false)
  function save() { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  return { saved, save }
}

function SectionFooter({ onSave, saved, extra }: {
  onSave: () => void; saved: boolean; extra?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
      <div className="flex items-center gap-3">
        {saved ? (
          <span className="flex items-center gap-1.5 text-[12.5px] text-success font-medium">
            <CheckCircle2 size={13} strokeWidth={2} />
            Settings saved
          </span>
        ) : extra}
      </div>
      <Button size="sm" onClick={onSave}>Save Changes</Button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Preset accent colors (Branding)
══════════════════════════════════════════════════════════════ */

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
]

/* ══════════════════════════════════════════════════════════════
   Section 1 — Branding
══════════════════════════════════════════════════════════════ */

function BrandingSection() {
  const [siteName,    setSiteName]    = useState('BillBee')
  const [tagline,     setTagline]     = useState('Smart rental billing for landlords')
  const [logo,        setLogo]        = useState<string | null>(null)
  const [favicon,     setFavicon]     = useState<string | null>(null)
  const [primary,     setPrimary]     = useState('#6366f1')
  const [secondary,   setSecondary]   = useState('#8b5cf6')
  const { saved, save } = useSave()

  return (
    <Card>
      <div className="px-6 py-5 flex flex-col gap-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Branding</h2>
          <p className="text-[12.5px] text-ink-3 mt-0.5">Customize how BillBee appears to users.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Site Name" required>
            <input value={siteName} onChange={e => setSiteName(e.target.value)} className={INPUT_CLS} />
          </Field>
          <Field label="Tagline" hint="Shown under the site name on the login page.">
            <input value={tagline} onChange={e => setTagline(e.target.value)} className={INPUT_CLS} placeholder="Optional tagline…" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ImageUpload
            label="Logo"
            value={logo}
            onChange={setLogo}
            shape="circle"
            size={72}
            hint="Shown in the sidebar. Recommended: 128×128 PNG."
          />
          <ImageUpload
            label="Favicon"
            value={favicon}
            onChange={setFavicon}
            shape="square"
            size={40}
            hint="Browser tab icon. Recommended: 32×32 PNG."
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Theme Colors</p>
          {/* Preset swatches */}
          <div className="flex items-center gap-2 mb-1">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setPrimary(c)}
                title={c}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  primary === c ? 'border-ink scale-110' : 'border-transparent'
                }`}
                style={{ background: c }}
              />
            ))}
            <span className="text-[11.5px] text-ink-4 ml-1">Quick select</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ColorSwatch label="Primary / Accent Color"   value={primary}   onChange={setPrimary}   hint="Used for buttons, links, and highlights." />
            <ColorSwatch label="Secondary / Accent 2 Color" value={secondary} onChange={setSecondary} hint="Used for gradient accents and avatars." />
          </div>
        </div>

        <SectionFooter onSave={save} saved={saved} />
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Section 2 — Email Settings
══════════════════════════════════════════════════════════════ */

function EmailSection() {
  const [host,       setHost]       = useState('smtp.mailgun.org')
  const [port,       setPort]       = useState('587')
  const [encryption, setEncryption] = useState('tls')
  const [username,   setUsername]   = useState('postmaster@billbee.ph')
  const [password,   setPassword]   = useState('••••••••••••')
  const [showPw,     setShowPw]     = useState(false)
  const [fromName,   setFromName]   = useState('BillBee')
  const [fromEmail,  setFromEmail]  = useState('no-reply@billbee.ph')
  const [billTpl,    setBillTpl]    = useState(
    'Dear {tenant_name},\n\nYour bill for {period} is ready.\nAmount Due: {amount}\nDue Date: {due_date}\n\nPlease settle your balance on time.\n\n— {site_name}'
  )
  const [receiptTpl, setReceiptTpl] = useState(
    'Dear {tenant_name},\n\nWe have received your payment of {amount} on {payment_date}.\nReceipt No.: {receipt_no}\n\nThank you!\n\n— {site_name}'
  )
  const [testStrip, setTestStrip] = useState(false)
  const { saved, save } = useSave()

  function handleTest() {
    setTestStrip(true)
    setTimeout(() => setTestStrip(false), 3500)
  }

  const VARS = '{tenant_name}  {amount}  {period}  {due_date}  {receipt_no}  {payment_date}  {site_name}'

  return (
    <Card>
      <div className="px-6 py-5 flex flex-col gap-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Email Settings</h2>
          <p className="text-[12.5px] text-ink-3 mt-0.5">SMTP configuration and notification templates.</p>
        </div>

        {/* SMTP */}
        <div>
          <p className="text-[12px] font-semibold text-ink-2 mb-3 uppercase tracking-wide">SMTP Configuration</p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="col-span-2">
              <Field label="SMTP Host" required>
                <input value={host} onChange={e => setHost(e.target.value)} className={INPUT_CLS} placeholder="smtp.mailgun.org" />
              </Field>
            </div>
            <Field label="Port" required>
              <input value={port} onChange={e => setPort(e.target.value)} className={INPUT_CLS} placeholder="587" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <Field label="Encryption">
              <Sel value={encryption} onChange={setEncryption}>
                <option value="none">None</option>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
              </Sel>
            </Field>
            <Field label="Username">
              <input value={username} onChange={e => setUsername(e.target.value)} className={INPUT_CLS} />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={INPUT_CLS + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                >
                  {showPw ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
                </button>
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="From Name">
              <input value={fromName} onChange={e => setFromName(e.target.value)} className={INPUT_CLS} placeholder="BillBee" />
            </Field>
            <Field label="From Email" required>
              <input type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} className={INPUT_CLS} placeholder="no-reply@billbee.ph" />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={handleTest}>
              <RefreshCw size={13} strokeWidth={2} />
              Send Test Email
            </Button>
            {testStrip && (
              <span className="flex items-center gap-1.5 text-[12px] text-success font-medium">
                <CheckCircle2 size={13} strokeWidth={2} />
                Test email sent to {fromEmail}
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Notification templates */}
        <div>
          <p className="text-[12px] font-semibold text-ink-2 mb-1 uppercase tracking-wide">Notification Templates</p>
          <p className="text-[11.5px] text-ink-3 mb-3">
            Available variables: <code className="font-mono bg-surface-2 px-1 py-0.5 rounded text-[11px]">{VARS}</code>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bill Notice Template">
              <textarea
                value={billTpl}
                onChange={e => setBillTpl(e.target.value)}
                rows={7}
                className={INPUT_CLS + ' resize-none font-mono text-[12px]'}
              />
            </Field>
            <Field label="Payment Receipt Template">
              <textarea
                value={receiptTpl}
                onChange={e => setReceiptTpl(e.target.value)}
                rows={7}
                className={INPUT_CLS + ' resize-none font-mono text-[12px]'}
              />
            </Field>
          </div>
        </div>

        <SectionFooter onSave={save} saved={saved} />
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Section 3 — Security
══════════════════════════════════════════════════════════════ */

function SecuritySection() {
  const [minLength,       setMinLength]       = useState('8')
  const [requireUpper,    setRequireUpper]    = useState(true)
  const [requireNumbers,  setRequireNumbers]  = useState(true)
  const [requireSymbols,  setRequireSymbols]  = useState(false)
  const [pwExpiry,        setPwExpiry]        = useState('never')
  const [sessionTimeout,  setSessionTimeout]  = useState('60')
  const [mfaEnforcement,  setMfaEnforcement]  = useState('required_admins')
  const [maxAttempts,     setMaxAttempts]     = useState('5')
  const [lockoutDuration, setLockoutDuration] = useState('30')
  const { saved, save } = useSave()

  return (
    <Card>
      <div className="px-6 py-5 flex flex-col gap-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Security</h2>
          <p className="text-[12.5px] text-ink-3 mt-0.5">Password policy, session management, and 2FA settings.</p>
        </div>

        {/* Password Policy */}
        <div>
          <p className="text-[12px] font-semibold text-ink-2 mb-3 uppercase tracking-wide">Password Policy</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Minimum Password Length" hint="Recommended: 8 or more characters.">
              <input
                type="number"
                min={6} max={32}
                value={minLength}
                onChange={e => setMinLength(e.target.value)}
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Password Expiry">
              <Sel value={pwExpiry} onChange={setPwExpiry}>
                <option value="never">Never</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </Sel>
            </Field>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Require uppercase letter',   value: requireUpper,   setter: setRequireUpper   },
              { label: 'Require numbers',            value: requireNumbers, setter: setRequireNumbers },
              { label: 'Require special characters', value: requireSymbols, setter: setRequireSymbols },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex items-center justify-between py-2 px-3 bg-surface-2 rounded-btn">
                <span className="text-[13.5px] text-ink">{label}</span>
                <Toggle checked={value} onChange={setter} label={label} />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Session & MFA */}
        <div>
          <p className="text-[12px] font-semibold text-ink-2 mb-3 uppercase tracking-wide">Session &amp; Authentication</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Session Timeout" hint="Auto-logout after this period of inactivity.">
              <Sel value={sessionTimeout} onChange={setSessionTimeout}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="120">2 hours</option>
                <option value="never">Never</option>
              </Sel>
            </Field>
            <Field label="2FA / MFA Enforcement">
              <Sel value={mfaEnforcement} onChange={setMfaEnforcement}>
                <option value="optional">Optional</option>
                <option value="required_admins">Required for Admins</option>
                <option value="required_all">Required for All Users</option>
              </Sel>
            </Field>
            <Field label="Max Login Attempts" hint="Account locks after this many consecutive failures.">
              <input
                type="number"
                min={3} max={20}
                value={maxAttempts}
                onChange={e => setMaxAttempts(e.target.value)}
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Account Lockout Duration">
              <Sel value={lockoutDuration} onChange={setLockoutDuration}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="forever">Until admin reset</option>
              </Sel>
            </Field>
          </div>
        </div>

        <SectionFooter onSave={save} saved={saved} />
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Section 4 — Backup
══════════════════════════════════════════════════════════════ */

function BackupSection() {
  const [frequency,   setFrequency]   = useState('daily')
  const [time,        setTime]        = useState('02:00')
  const [retention,   setRetention]   = useState('30')
  const [recipients,  setRecipients]  = useState<string[]>(['admin@billbee.ph'])
  const { saved, save } = useSave()

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return (
    <Card>
      <div className="px-6 py-5 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Backup</h2>
            <p className="text-[12.5px] text-ink-3 mt-0.5">Automated backup schedule and notification recipients.</p>
          </div>
          <Link
            to="/admin/backups"
            className="flex items-center gap-1.5 text-[12.5px] text-accent hover:underline font-medium"
          >
            Backup Management
            <ExternalLink size={12} strokeWidth={2} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Backup Frequency">
            <Sel value={frequency} onChange={setFrequency}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Sel>
          </Field>
          <Field label="Time of Day">
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={INPUT_CLS} />
          </Field>
          <Field label="Retention Period">
            <Sel value={retention} onChange={setRetention}>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </Sel>
          </Field>
        </div>

        <Field
          label="Email Recipients"
          hint="Receive backup status notifications. Press Enter or comma to add. Multiple addresses supported."
        >
          <TagInput
            tags={recipients}
            onAdd={t => setRecipients(p => [...p, t])}
            onRemove={t => setRecipients(p => p.filter(r => r !== t))}
            placeholder="Add email address…"
            validate={t => emailRe.test(t)}
          />
        </Field>

        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-btn border border-border">
          <HardDrive size={15} strokeWidth={1.75} className="text-ink-3 shrink-0" />
          <p className="text-[13px] text-ink-2">
            To view backup history, run a manual backup, or check storage usage, visit the{' '}
            <Link to="/admin/backups" className="text-accent hover:underline font-medium">
              Backup Management
            </Link>{' '}
            page.
          </p>
        </div>

        <SectionFooter onSave={save} saved={saved} />
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Section 5 — Notifications
══════════════════════════════════════════════════════════════ */

const NOTIF_TYPES = [
  { id:'failed_login',     label:'Failed Login Attempts',  desc:'When consecutive login failures occur'       },
  { id:'account_lockout',  label:'Account Lockout',        desc:'When an account is automatically locked'     },
  { id:'backup_success',   label:'Backup Success',         desc:'When a scheduled or manual backup completes' },
  { id:'backup_failure',   label:'Backup Failure',         desc:'When a backup job fails or is incomplete'    },
  { id:'storage_warning',  label:'Storage Warning',        desc:'When backup storage exceeds 80%'             },
  { id:'system_error',     label:'System Error',           desc:'On critical application or server errors'    },
  { id:'new_registration', label:'New User Registration',  desc:'When a new landlord account is created'      },
]

const INIT_NOTIF: Record<string, { inApp: boolean; email: boolean }> = {
  failed_login:     { inApp: true,  email: true  },
  account_lockout:  { inApp: true,  email: true  },
  backup_success:   { inApp: true,  email: false },
  backup_failure:   { inApp: true,  email: true  },
  storage_warning:  { inApp: true,  email: true  },
  system_error:     { inApp: true,  email: true  },
  new_registration: { inApp: false, email: false },
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState(INIT_NOTIF)
  const { saved, save }   = useSave()

  function toggle(id: string, channel: 'inApp' | 'email') {
    setPrefs(prev => ({
      ...prev,
      [id]: { ...prev[id], [channel]: !prev[id][channel] },
    }))
  }

  return (
    <Card>
      <div className="px-6 py-5 flex flex-col gap-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Notifications</h2>
          <p className="text-[12.5px] text-ink-3 mt-0.5">Default notification preferences for administrator alerts.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 w-full">Notification Type</th>
                <th className="pb-2.5 px-6 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">In-App</th>
                <th className="pb-2.5 px-6 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {NOTIF_TYPES.map(({ id, label, desc }) => (
                <tr key={id} className="hover:bg-surface-2/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="text-[13.5px] font-medium text-ink">{label}</div>
                    <div className="text-[12px] text-ink-3 mt-0.5">{desc}</div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center">
                      <Toggle checked={prefs[id].inApp} onChange={() => toggle(id, 'inApp')} label={`${label} in-app`} />
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center">
                      <Toggle checked={prefs[id].email} onChange={() => toggle(id, 'email')} label={`${label} email`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionFooter onSave={save} saved={saved} />
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Section 6 — Maintenance Mode
══════════════════════════════════════════════════════════════ */

function MaintenanceSection() {
  const [enabled,    setEnabled]    = useState(false)
  const [message,    setMessage]    = useState("We're performing scheduled maintenance. We'll be back shortly. Thank you for your patience.")
  const [bypassIps,  setBypassIps]  = useState<string[]>(['127.0.0.1', '192.168.1.1'])
  const { saved, save } = useSave()

  return (
    <Card>
      <div className="px-6 py-5 flex flex-col gap-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Maintenance Mode</h2>
          <p className="text-[12.5px] text-ink-3 mt-0.5">Take the site offline for users while you perform updates.</p>
        </div>

        {/* Enable toggle — prominent */}
        <div className={`flex items-center justify-between p-4 rounded-btn border transition-colors ${
          enabled
            ? 'bg-warning/5 border-warning/30'
            : 'bg-surface-2 border-border'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              {enabled && <AlertTriangle size={15} strokeWidth={2} className="text-warning shrink-0" />}
              <p className={`text-[14px] font-semibold ${enabled ? 'text-warning' : 'text-ink'}`}>
                {enabled ? 'Maintenance Mode is ON' : 'Maintenance Mode'}
              </p>
            </div>
            <p className="text-[12.5px] text-ink-3 mt-0.5 ml-0">
              {enabled
                ? 'Users without a bypass IP cannot access the system.'
                : 'Enable to show a maintenance page to all users.'}
            </p>
          </div>
          <Toggle checked={enabled} onChange={setEnabled} label="Enable maintenance mode" />
        </div>

        <Field
          label="Maintenance Message"
          hint="Displayed to users when maintenance mode is active."
        >
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            className={INPUT_CLS + ' resize-none'}
          />
        </Field>

        <Field
          label="Bypass IP Addresses"
          hint="Users connecting from these IPs can still access the site. Press Enter to add."
        >
          <TagInput
            tags={bypassIps}
            onAdd={ip => setBypassIps(p => [...p, ip])}
            onRemove={ip => setBypassIps(p => p.filter(i => i !== ip))}
            placeholder="e.g. 192.168.1.1"
          />
        </Field>

        {/* Live preview */}
        {enabled && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Maintenance Page Preview</p>
            <div className="border border-border rounded-btn overflow-hidden">
              <div className="bg-surface-2 px-3 py-1.5 flex items-center gap-2 border-b border-border">
                {['bg-danger', 'bg-warning', 'bg-success'].map(c => (
                  <div key={c} className={`w-2.5 h-2.5 rounded-full ${c} opacity-60`} />
                ))}
                <div className="flex-1 mx-2 bg-surface border border-border rounded px-2 py-0.5 text-[11px] text-ink-3 truncate">
                  billbee.ph
                </div>
              </div>
              <div className="bg-bg flex flex-col items-center justify-center py-10 px-6 text-center gap-3">
                <div className="text-[28px]">🔧</div>
                <p className="text-[16px] font-bold text-ink">Under Maintenance</p>
                <p className="text-[13.5px] text-ink-2 max-w-sm leading-relaxed">{message}</p>
              </div>
            </div>
          </div>
        )}

        <SectionFooter onSave={save} saved={saved} />
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Section 7 — API Settings
══════════════════════════════════════════════════════════════ */

const INIT_API_KEYS: ApiKey[] = [
  { id:'k1', name:'Integration Key', maskedKey:'bb_live_a4f2••••••••••••c891', created:'2026-01-15' },
  { id:'k2', name:'Test Key',        maskedKey:'bb_test_9e3d••••••••••••b204', created:'2026-03-22' },
]

let keyCounter = 10

function generateRawKey(): string {
  const hex = 'abcdef0123456789'
  return 'bb_live_' + Array.from({ length: 32 }, () => hex[Math.floor(Math.random() * hex.length)]).join('')
}

function maskKey(raw: string): string {
  return raw.slice(0, 12) + '••••••••••••' + raw.slice(-4)
}

function ApiSection() {
  const [rateLimit,     setRateLimit]     = useState('120')
  const [apiKeys,       setApiKeys]       = useState<ApiKey[]>(INIT_API_KEYS)
  const [showGenModal,  setShowGenModal]  = useState(false)
  const [newKeyName,    setNewKeyName]    = useState('')
  const [generatedKey,  setGeneratedKey]  = useState<string | null>(null)
  const [copied,        setCopied]        = useState(false)
  const [toRevoke,      setToRevoke]      = useState<ApiKey | null>(null)
  const { saved, save } = useSave()

  function handleGenerate() {
    if (!newKeyName.trim()) return
    const raw = generateRawKey()
    setGeneratedKey(raw)
  }

  function handleModalClose() {
    if (generatedKey) {
      setApiKeys(prev => [...prev, {
        id:        `k${++keyCounter}`,
        name:      newKeyName.trim(),
        maskedKey: maskKey(generatedKey),
        created:   new Date().toISOString().slice(0, 10),
      }])
    }
    setShowGenModal(false)
    setNewKeyName('')
    setGeneratedKey(null)
    setCopied(false)
  }

  function handleCopy() {
    if (!generatedKey) return
    navigator.clipboard.writeText(generatedKey).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleRevoke(key: ApiKey) {
    setApiKeys(prev => prev.filter(k => k.id !== key.id))
    setToRevoke(null)
  }

  return (
    <>
      <Card>
        <div className="px-6 py-5 flex flex-col gap-6">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">API Settings</h2>
            <p className="text-[12.5px] text-ink-3 mt-0.5">Rate limits and API key management.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Rate Limit (requests / minute)" hint="Maximum API requests per minute per key.">
              <input
                type="number"
                min={10} max={10000}
                value={rateLimit}
                onChange={e => setRateLimit(e.target.value)}
                className={INPUT_CLS}
              />
            </Field>
          </div>

          <div className="border-t border-border" />

          {/* API Keys */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-ink-2 uppercase tracking-wide">API Keys</p>
              <Button size="sm" variant="ghost" onClick={() => setShowGenModal(true)}>
                <Plus size={13} strokeWidth={2} />
                Generate New Key
              </Button>
            </div>

            {apiKeys.length === 0 ? (
              <p className="text-[13px] text-ink-3 py-4 text-center">No API keys. Generate one above.</p>
            ) : (
              <div className="border border-border rounded-btn overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2">
                      {['Name', 'Key', 'Created', ''].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {apiKeys.map(key => (
                      <tr key={key.id} className="hover:bg-surface-2/50">
                        <td className="px-4 py-3 font-medium text-ink">{key.name}</td>
                        <td className="px-4 py-3">
                          <code className="font-mono text-[12px] text-ink-2 bg-surface-2 px-2 py-0.5 rounded">
                            {key.maskedKey}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-ink-3 whitespace-nowrap">{key.created}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setToRevoke(key)}
                            className="flex items-center gap-1.5 text-[12px] text-danger hover:underline font-medium"
                          >
                            <Trash2 size={12} strokeWidth={2} />
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-[11.5px] text-ink-4 mt-2">
              API keys grant programmatic access. Store them securely — they cannot be viewed again after generation.
            </p>
          </div>

          <SectionFooter onSave={save} saved={saved} />
        </div>
      </Card>

      {/* Generate Key Modal */}
      <Modal open={showGenModal} onClose={handleModalClose} title="Generate API Key">
        <div className="flex flex-col gap-4">
          {!generatedKey ? (
            <>
              <p className="text-[13.5px] text-ink-2">Give this key a name so you can identify it later.</p>
              <Field label="Key Name" required>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="e.g. Integration Key, CI/CD Key"
                  className={INPUT_CLS}
                  autoFocus
                />
              </Field>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={handleModalClose}>Cancel</Button>
                <Button size="sm" disabled={!newKeyName.trim()} onClick={handleGenerate}>
                  <Key size={13} strokeWidth={2} />
                  Generate
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-btn">
                <CheckCircle2 size={15} strokeWidth={2} className="text-success shrink-0" />
                <p className="text-[13px] text-success font-medium">API key generated for "{newKeyName}"</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Your New API Key</p>
                <div className="flex items-center gap-2 p-3 bg-surface-2 border border-border rounded-btn">
                  <code className="font-mono text-[12px] text-ink flex-1 break-all select-all">{generatedKey}</code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`shrink-0 flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded border transition-colors ${
                      copied
                        ? 'bg-success/10 border-success/20 text-success'
                        : 'border-border text-ink-2 hover:border-border-strong'
                    }`}
                  >
                    {copied ? <CheckCircle2 size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={2} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11.5px] text-warning font-medium flex items-center gap-1.5 mt-1">
                  <AlertTriangle size={12} strokeWidth={2} />
                  This key will not be shown again. Copy it now and store it securely.
                </p>
              </div>
              <div className="flex justify-end pt-1">
                <Button size="sm" onClick={handleModalClose}>Done</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Revoke confirm modal */}
      <Modal open={!!toRevoke} onClose={() => setToRevoke(null)} title="Revoke API Key">
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] text-ink-2">
            Revoke <strong className="text-ink font-semibold">{toRevoke?.name}</strong>? Any integrations using this key will immediately lose access. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setToRevoke(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => toRevoke && handleRevoke(toRevoke)}>
              <Trash2 size={13} strokeWidth={2} />
              Revoke Key
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   Nav definition
══════════════════════════════════════════════════════════════ */

const NAV_ITEMS: Array<{ id: SectionId; label: string; icon: React.ElementType; warn?: boolean }> = [
  { id:'branding',      label:'Branding',         icon: Palette     },
  { id:'email',         label:'Email Settings',   icon: Mail        },
  { id:'security',      label:'Security',         icon: ShieldCheck },
  { id:'backup',        label:'Backup',           icon: HardDrive   },
  { id:'notifications', label:'Notifications',    icon: Bell        },
  { id:'maintenance',   label:'Maintenance Mode', icon: Wrench      },
  { id:'api',           label:'API Settings',     icon: Key         },
]

/* ══════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════ */

export function SiteSettings() {
  const [section, setSection] = useState<SectionId>('branding')

  return (
    <main className="flex flex-col gap-5 px-8 py-6 max-w-[1200px]">
      <PageHead
        title="Site Settings"
        subtitle="Configure system-wide settings, branding, security, and integrations"
      />

      <div className="flex gap-6 items-start">

        {/* Left nav */}
        <nav className="w-52 shrink-0 flex flex-col gap-0.5 sticky top-[76px]">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={[
                'flex items-center gap-2.5 px-3 py-2.5 rounded-btn text-[13.5px] font-medium text-left transition-ui w-full',
                section === id
                  ? 'bg-ink text-white'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
              ].join(' ')}
            >
              <Icon
                size={15}
                strokeWidth={1.75}
                className={section === id ? 'stroke-white shrink-0' : 'stroke-ink-3 shrink-0'}
              />
              {label}
            </button>
          ))}
        </nav>

        {/* Section content */}
        <div className="flex-1 min-w-0">
          {section === 'branding'      && <BrandingSection />}
          {section === 'email'         && <EmailSection />}
          {section === 'security'      && <SecuritySection />}
          {section === 'backup'        && <BackupSection />}
          {section === 'notifications' && <NotificationsSection />}
          {section === 'maintenance'   && <MaintenanceSection />}
          {section === 'api'           && <ApiSection />}
        </div>
      </div>
    </main>
  )
}
