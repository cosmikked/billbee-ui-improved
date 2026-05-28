import { useState, useRef, useEffect } from 'react'
import {
  Plus, Search, MoreHorizontal, Edit2, ShieldOff, ShieldCheck,
  UserX, KeyRound, Clock, Check, Camera, ChevronDown, X,
  UserPlus, CheckCircle2,
} from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { PageHead } from '../../components/ui/PageHead'

/* ══════════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════════ */

type UserRole   = 'admin' | 'landlord'
type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'

interface User {
  id:        string
  name:      string
  email:     string
  phone:     string
  role:      UserRole
  status:    UserStatus
  lastLogin: string | null   // ISO string or null
  created:   string          // ISO date
  initials:  string
}

interface LoginRecord {
  id:      string
  ts:      string
  ip:      string
  result:  'success' | 'failed' | 'locked'
  device:  string
}

/* ══════════════════════════════════════════════════════════════
   Mock data
══════════════════════════════════════════════════════════════ */

const INITIAL_USERS: User[] = [
  { id:'u1', name:'Maria Dela Cruz',       email:'maria@sunsetapts.ph',     phone:'09171234567', role:'landlord', status:'active',    lastLogin:'2026-05-27T09:14:00', created:'2026-01-03', initials:'MD' },
  { id:'u2', name:'System Administrator',  email:'admin@billbee.ph',        phone:'09279876543', role:'admin',    status:'active',    lastLogin:'2026-05-27T08:00:00', created:'2025-12-01', initials:'SA' },
  { id:'u3', name:'Jose Reyes',            email:'j.reyes@sunsetapts.ph',   phone:'09181112222', role:'landlord', status:'active',    lastLogin:'2026-05-26T14:30:00', created:'2026-02-15', initials:'JR' },
  { id:'u4', name:'Ana Santos',            email:'a.santos@property.ph',    phone:'09273334444', role:'landlord', status:'pending',   lastLogin:null,                  created:'2026-05-20', initials:'AS' },
  { id:'u5', name:'Roberto Cruz',          email:'r.cruz@billbee.ph',       phone:'09195556666', role:'landlord', status:'suspended', lastLogin:'2026-05-01T11:00:00', created:'2026-03-10', initials:'RC' },
  { id:'u6', name:'Lina Bautista',         email:'l.bautista@homes.ph',     phone:'09227778888', role:'landlord', status:'inactive',  lastLogin:'2026-04-15T16:45:00', created:'2026-01-20', initials:'LB' },
  { id:'u7', name:'Marco Villanueva',      email:'m.villanueva@props.ph',   phone:'09303334444', role:'landlord', status:'active',    lastLogin:'2026-05-25T08:20:00', created:'2026-03-01', initials:'MV' },
  { id:'u8', name:'Clara Mendoza',         email:'c.mendoza@realty.ph',     phone:'09189996666', role:'landlord', status:'active',    lastLogin:'2026-05-24T17:10:00', created:'2026-04-05', initials:'CM' },
]

const MOCK_LOGIN_HISTORY: LoginRecord[] = [
  { id:'l1', ts:'2026-05-27T09:14:00', ip:'192.168.1.105', result:'success', device:'Chrome 124 · Windows' },
  { id:'l2', ts:'2026-05-26T08:30:00', ip:'192.168.1.105', result:'success', device:'Chrome 124 · Windows' },
  { id:'l3', ts:'2026-05-25T07:55:00', ip:'10.0.0.42',     result:'failed',  device:'Safari 17 · macOS'   },
  { id:'l4', ts:'2026-05-25T07:56:00', ip:'10.0.0.42',     result:'failed',  device:'Safari 17 · macOS'   },
  { id:'l5', ts:'2026-05-25T07:57:00', ip:'10.0.0.42',     result:'locked',  device:'Safari 17 · macOS'   },
  { id:'l6', ts:'2026-05-24T14:22:00', ip:'192.168.1.105', result:'success', device:'Chrome 124 · Windows' },
  { id:'l7', ts:'2026-05-23T09:10:00', ip:'192.168.1.105', result:'success', device:'Chrome 124 · Windows' },
  { id:'l8', ts:'2026-05-22T08:45:00', ip:'172.16.0.8',    result:'success', device:'Firefox 125 · Linux'  },
]

/* ══════════════════════════════════════════════════════════════
   Module permissions (RBAC matrix)
══════════════════════════════════════════════════════════════ */

const LANDLORD_MODULES = [
  'Dashboard', 'Properties', 'Rooms', 'Tenants',
  'Charge Catalog', 'Billing Center', 'Payment History', 'Reports',
]
const ADMIN_MODULES = [
  'User Management', 'Audit Logs', 'Backups',
  'Import & Export', 'Admin Reports', 'Site Settings',
]

/* ══════════════════════════════════════════════════════════════
   Shared form primitives
══════════════════════════════════════════════════════════════ */

const INPUT_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full placeholder:text-ink-4'

const SEL_CLS =
  'border border-border rounded-btn px-3 py-2 text-[13.5px] text-ink bg-surface ' +
  'focus:outline-none focus:border-accent transition-colors w-full appearance-none'

function Field({
  label, required = false, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
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

/* ══════════════════════════════════════════════════════════════
   Avatar upload widget
══════════════════════════════════════════════════════════════ */

function AvatarUpload({ name, value, onChange }: {
  name: string; value: string | null; onChange: (v: string | null) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const initials = name
    ? name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-[68px] h-[68px] rounded-full border-2 border-border hover:border-accent
                   relative overflow-hidden flex items-center justify-center shrink-0
                   bg-surface-2 transition-ui group"
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-display font-bold text-[22px] text-ink-3 select-none">
            {initials}
          </span>
        )}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100
                        transition-opacity flex items-center justify-center">
          <Camera size={16} strokeWidth={1.75} className="text-white" />
        </div>
      </button>
      <div>
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="text-[13px] font-medium text-accent hover:text-accent-2 transition-colors"
        >
          Upload photo
        </button>
        {value && (
          <button
            type="button"
            onClick={() => { onChange(null); if (ref.current) ref.current.value = '' }}
            className="ml-3 text-[13px] text-ink-3 hover:text-danger transition-colors"
          >
            Remove
          </button>
        )}
        <p className="text-[11.5px] text-ink-4 mt-0.5">JPG or PNG · max 2 MB</p>
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFile} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Module permission matrix (read-only, role-driven)
══════════════════════════════════════════════════════════════ */

function ModuleMatrix({ role }: { role: UserRole }) {
  const isAdmin = role === 'admin'

  function ModuleRow({ label, allowed }: { label: string; allowed: boolean }) {
    return (
      <div className="flex items-center gap-2.5 py-1.5 px-3">
        <span className={[
          'w-4 h-4 rounded flex items-center justify-center shrink-0',
          allowed ? 'bg-success/15 text-success' : 'bg-surface-2 text-ink-4',
        ].join(' ')}>
          {allowed
            ? <Check size={10} strokeWidth={3} />
            : <X size={9} strokeWidth={2.5} />}
        </span>
        <span className={`text-[13px] ${allowed ? 'text-ink' : 'text-ink-4'}`}>{label}</span>
        <span className="ml-auto text-[11px] text-ink-4">
          {allowed ? 'Included' : 'Restricted'}
        </span>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-btn overflow-hidden">
      {/* Landlord modules */}
      <div className="bg-surface-2 px-3 py-1.5 border-b border-border">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-4">
          Landlord modules
        </p>
      </div>
      {LANDLORD_MODULES.map(m => <ModuleRow key={m} label={m} allowed />)}

      {/* Admin-only modules */}
      <div className="bg-surface-2 px-3 py-1.5 border-t border-b border-border">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-4">
          Administrator modules
        </p>
      </div>
      {ADMIN_MODULES.map(m => <ModuleRow key={m} label={m} allowed={isAdmin} />)}

      <div className="px-3 py-2 bg-surface-2 border-t border-border">
        <p className="text-[11.5px] text-ink-4">
          Permissions are assigned by role and cannot be overridden individually.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Create user drawer
══════════════════════════════════════════════════════════════ */

interface CreateDrawerProps { open: boolean; onClose: () => void; onCreated: (u: User) => void }

function CreateUserDrawer({ open, onClose, onCreated }: CreateDrawerProps) {
  const [avatar,   setAvatar]   = useState<string | null>(null)
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [role,     setRole]     = useState<UserRole>('landlord')
  const [status,   setStatus]   = useState<UserStatus>('active')
  const [invite,   setInvite]   = useState(true)

  function reset() {
    setAvatar(null); setName(''); setEmail(''); setPhone('')
    setRole('landlord'); setStatus('active'); setInvite(true)
  }

  function handleClose() { reset(); onClose() }

  function handleCreate() {
    const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    onCreated({
      id:        `u${Date.now()}`,
      name, email, phone, role, status,
      lastLogin: null,
      created:   new Date().toISOString().split('T')[0],
      initials,
    })
    handleClose()
  }

  const canSubmit = name.trim() !== '' && email.trim() !== ''

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      side="right"
      width="50vw"
      title="Create user"
      subtitle="Add a new administrator or landlord account"
      footer={
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={invite}
              onChange={e => setInvite(e.target.checked)}
              className="accent-accent w-4 h-4"
            />
            <span className="text-[13px] text-ink-2">Send invitation email</span>
          </label>
          <div className="flex gap-2">
            <Button variant="default" onClick={handleClose}>Cancel</Button>
            <Button variant="accent" onClick={handleCreate} disabled={!canSubmit}>
              <UserPlus size={14} strokeWidth={1.75} />
              Create user
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">

        {/* ── Profile ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-3">
            Profile
          </p>
          <div className="flex flex-col gap-4">
            <AvatarUpload name={name} value={avatar} onChange={setAvatar} />

            <Field label="Full name" required>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className={INPUT_CLS} placeholder="e.g. Juan Dela Cruz" autoFocus />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" required>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={INPUT_CLS} placeholder="user@example.com" />
              </Field>
              <Field label="Phone" hint="optional">
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className={INPUT_CLS} placeholder="09XX XXX XXXX" />
              </Field>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* ── Role & access ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-3">
            Role &amp; access
          </p>
          <div className="flex flex-col gap-4">
            <Field label="Role" required>
              <div className="flex gap-2">
                {(['landlord', 'admin'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={[
                      'flex-1 py-2.5 rounded-btn border text-[13.5px] font-medium transition-ui',
                      role === r
                        ? 'bg-ink text-white border-ink'
                        : 'bg-surface text-ink-2 border-border hover:border-border-strong hover:bg-surface-2',
                    ].join(' ')}
                  >
                    {r === 'admin' ? 'Administrator' : 'Landlord'}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label="Module access"
              hint="Permissions are determined by role and cannot be overridden individually."
            >
              <ModuleMatrix role={role} />
            </Field>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* ── Status ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-3">
            Account status
          </p>
          <Field label="Status">
            <div className="relative">
              <select value={status} onChange={e => setStatus(e.target.value as UserStatus)}
                className={SEL_CLS}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <ChevronDown size={14} strokeWidth={1.75}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            </div>
          </Field>
        </div>

      </div>
    </Drawer>
  )
}

/* ══════════════════════════════════════════════════════════════
   Edit user drawer
══════════════════════════════════════════════════════════════ */

interface EditDrawerProps { user: User | null; onClose: () => void; onSaved: (u: User) => void }

function EditUserDrawer({ user, onClose, onSaved }: EditDrawerProps) {
  const [avatar, setAvatar]   = useState<string | null>(null)
  const [name,   setName]     = useState('')
  const [email,  setEmail]    = useState('')
  const [phone,  setPhone]    = useState('')
  const [role,   setRole]     = useState<UserRole>('landlord')
  const [status, setStatus]   = useState<UserStatus>('active')

  // Sync state when user prop changes
  useEffect(() => {
    if (user) {
      setAvatar(null); setName(user.name); setEmail(user.email)
      setPhone(user.phone); setRole(user.role); setStatus(user.status)
    }
  }, [user])

  if (!user) return null

  function handleSave() {
    if (!user) return
    const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    onSaved({ ...user, name, email, phone, role, status, initials })
    onClose()
  }

  const canSubmit = name.trim() !== '' && email.trim() !== ''

  return (
    <Drawer
      open={!!user}
      onClose={onClose}
      side="right"
      width="50vw"
      title="Edit user"
      subtitle={user.email}
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={handleSave} disabled={!canSubmit}>
            Save changes
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">

        {/* ── Profile ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-3">
            Profile
          </p>
          <div className="flex flex-col gap-4">
            <AvatarUpload name={name} value={avatar} onChange={setAvatar} />

            <Field label="Full name" required>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className={INPUT_CLS} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" required>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={INPUT_CLS} />
              </Field>
              <Field label="Phone" hint="optional">
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className={INPUT_CLS} placeholder="09XX XXX XXXX" />
              </Field>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* ── Role & access ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-3">
            Role &amp; access
          </p>
          <div className="flex flex-col gap-4">
            <Field label="Role" required>
              <div className="flex gap-2">
                {(['landlord', 'admin'] as UserRole[]).map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={[
                      'flex-1 py-2.5 rounded-btn border text-[13.5px] font-medium transition-ui',
                      role === r
                        ? 'bg-ink text-white border-ink'
                        : 'bg-surface text-ink-2 border-border hover:border-border-strong hover:bg-surface-2',
                    ].join(' ')}>
                    {r === 'admin' ? 'Administrator' : 'Landlord'}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Module access">
              <ModuleMatrix role={role} />
            </Field>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* ── Status ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3 mb-3">
            Account status
          </p>
          <div className="flex flex-col gap-3">
            <Field label="Status">
              <div className="relative">
                <select value={status} onChange={e => setStatus(e.target.value as UserStatus)}
                  className={SEL_CLS}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <ChevronDown size={14} strokeWidth={1.75}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
              </div>
            </Field>

            {/* Password reset shortcut */}
            <div className="flex items-center justify-between px-3 py-2.5 border border-border rounded-btn bg-surface">
              <div>
                <p className="text-[13.5px] font-medium text-ink">Password reset</p>
                <p className="text-[11.5px] text-ink-4">Send a reset link to {user.email}</p>
              </div>
              <Button variant="default" size="sm">
                <KeyRound size={12} strokeWidth={1.75} />
                Send reset email
              </Button>
            </div>
          </div>
        </div>

      </div>
    </Drawer>
  )
}

/* ══════════════════════════════════════════════════════════════
   Login history drawer
══════════════════════════════════════════════════════════════ */

function LoginHistoryDrawer({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null

  const RESULT_STYLE = {
    success: 'bg-success/10 text-success',
    failed:  'bg-warning/10 text-warning',
    locked:  'bg-danger/10  text-danger',
  }

  function fmtTs(iso: string) {
    const d = new Date(iso)
    return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Drawer
      open={!!user}
      onClose={onClose}
      side="right"
      width="50vw"
      title="Login history"
      subtitle={`${user.name} · ${user.email}`}
    >
      <div className="border border-border rounded-btn overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-2 border-b border-border">
              {['Date & time', 'IP address', 'Result', 'Device'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_LOGIN_HISTORY.map(record => (
              <tr key={record.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                <td className="px-4 py-3 text-[13px] font-mono text-ink-2 whitespace-nowrap">
                  {fmtTs(record.ts)}
                </td>
                <td className="px-4 py-3 font-mono text-[12.5px] text-ink-3">
                  {record.ip}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11.5px] font-semibold capitalize ${RESULT_STYLE[record.result]}`}>
                    {record.result}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12.5px] text-ink-3">
                  {record.device}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  )
}

/* ══════════════════════════════════════════════════════════════
   Confirm modal (status change / reset access)
══════════════════════════════════════════════════════════════ */

interface ConfirmAction {
  kind:    'activate' | 'deactivate' | 'suspend' | 'reset-access' | 'reset-password'
  user:    User
}

const CONFIRM_COPY: Record<ConfirmAction['kind'], { title: string; body: (u: User) => string; cta: string; danger?: boolean }> = {
  activate:       { title: 'Activate account',  body: u => `${u.name}'s account will be set to Active and they will be able to log in.`,              cta: 'Activate'       },
  deactivate:     { title: 'Deactivate account', body: u => `${u.name} will no longer be able to log in. You can reactivate at any time.`,             cta: 'Deactivate',    danger: true },
  suspend:        { title: 'Suspend account',    body: u => `${u.name} will be suspended. All active sessions will be invalidated.`,                   cta: 'Suspend',       danger: true },
  'reset-access': { title: 'Reset access',       body: u => `This will unlock ${u.name}'s account after too many failed attempts.`,                    cta: 'Reset access'   },
  'reset-password':{ title:'Send password reset', body: u => `A password reset link will be sent to ${u.email}.`,                                       cta: 'Send reset email' },
}

function ConfirmModal({
  action, onClose, onConfirm,
}: { action: ConfirmAction | null; onClose: () => void; onConfirm: () => void }) {
  if (!action) return null
  const copy = CONFIRM_COPY[action.kind]
  return (
    <Modal
      open={!!action}
      onClose={onClose}
      title={copy.title}
      width={440}
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button
            variant="accent"
            className={copy.danger ? 'bg-danger border-danger hover:bg-danger/90 hover:border-danger/90' : ''}
            onClick={onConfirm}
          >
            {copy.cta}
          </Button>
        </div>
      }
    >
      <p className="text-[14px] text-ink-2 leading-relaxed">{copy.body(action.user)}</p>
    </Modal>
  )
}

/* ══════════════════════════════════════════════════════════════
   Row action menu
══════════════════════════════════════════════════════════════ */

function ActionMenu({
  user,
  onEdit, onConfirm, onLoginHistory,
}: {
  user: User
  onEdit: () => void
  onConfirm: (kind: ConfirmAction['kind']) => void
  onLoginHistory: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function item(label: string, icon: React.ReactNode, onClick: () => void, danger = false) {
    return (
      <button
        type="button"
        onClick={() => { onClick(); setOpen(false) }}
        className={[
          'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors',
          danger ? 'text-danger hover:bg-danger/5' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        ].join(' ')}
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-btn text-ink-4 hover:text-ink hover:bg-surface-2 transition-colors"
        aria-label="Actions"
      >
        <MoreHorizontal size={16} strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-surface border border-border rounded-btn shadow-lg z-20 py-1 overflow-hidden">
          {item('Edit', <Edit2 size={13} strokeWidth={1.75} />, onEdit)}

          <div className="border-t border-border my-1" />

          {user.status !== 'active'    && item('Set active',     <ShieldCheck size={13} strokeWidth={1.75} />, () => onConfirm('activate'))}
          {user.status !== 'inactive'  && item('Set inactive',   <ShieldOff   size={13} strokeWidth={1.75} />, () => onConfirm('deactivate'), true)}
          {user.status !== 'suspended' && item('Suspend',        <UserX       size={13} strokeWidth={1.75} />, () => onConfirm('suspend'), true)}

          <div className="border-t border-border my-1" />

          {item('Reset access',   <ShieldCheck size={13} strokeWidth={1.75} />, () => onConfirm('reset-access'))}
          {item('Reset password', <KeyRound    size={13} strokeWidth={1.75} />, () => onConfirm('reset-password'))}

          <div className="border-t border-border my-1" />

          {item('Login history', <Clock size={13} strokeWidth={1.75} />, onLoginHistory)}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Inline badges
══════════════════════════════════════════════════════════════ */

const STATUS_STYLE: Record<UserStatus, string> = {
  active:    'bg-success/10 text-success',
  inactive:  'bg-surface-2 text-ink-3',
  suspended: 'bg-danger/10  text-danger',
  pending:   'bg-warning/10 text-warning',
}

const ROLE_STYLE: Record<UserRole, string> = {
  admin:    'bg-ink text-white',
  landlord: 'bg-accent-soft text-accent-2',
}

function StatusChip({ status }: { status: UserStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11.5px] font-semibold capitalize ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  )
}

function RoleChip({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11.5px] font-semibold ${ROLE_STYLE[role]}`}>
      {role === 'admin' ? 'Administrator' : 'Landlord'}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════ */

export function UserManagement() {
  const [users,          setUsers]          = useState<User[]>(INITIAL_USERS)
  const [search,         setSearch]         = useState('')
  const [roleFilter,     setRoleFilter]     = useState<'all' | UserRole>('all')
  const [statusFilter,   setStatusFilter]   = useState<'all' | UserStatus>('all')
  const [createOpen,     setCreateOpen]     = useState(false)
  const [editUser,       setEditUser]       = useState<User | null>(null)
  const [historyUser,    setHistoryUser]    = useState<User | null>(null)
  const [confirmAction,  setConfirmAction]  = useState<ConfirmAction | null>(null)
  const [successStrip,   setSuccessStrip]   = useState<string | null>(null)

  /* ── Derived ── */
  const filtered = users.filter(u => {
    const matchSearch = search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter   === 'all' || u.role   === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const stats = {
    total:     users.length,
    active:    users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    pending:   users.filter(u => u.status === 'pending').length,
  }

  /* ── Handlers ── */
  function handleCreated(u: User) {
    setUsers(prev => [u, ...prev])
    setSuccessStrip(`${u.name} has been created.`)
  }

  function handleSaved(u: User) {
    setUsers(prev => prev.map(x => x.id === u.id ? u : x))
    setSuccessStrip(`${u.name} has been updated.`)
  }

  function handleConfirm() {
    if (!confirmAction) return
    const { kind, user } = confirmAction
    const statusMap: Partial<Record<ConfirmAction['kind'], UserStatus>> = {
      activate: 'active', deactivate: 'inactive', suspend: 'suspended',
    }
    if (statusMap[kind]) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: statusMap[kind]! } : u))
      setSuccessStrip(`${user.name} has been ${kind}d.`)
    } else {
      setSuccessStrip(
        kind === 'reset-access'
          ? `Access reset for ${user.name}.`
          : `Password reset email sent to ${user.email}.`
      )
    }
    setConfirmAction(null)
  }

  function fmtLogin(iso: string | null) {
    if (!iso) return 'Never'
    const d = new Date(iso)
    const today = new Date()
    const diff  = Math.floor((today.getTime() - d.getTime()) / 86400000)
    if (diff === 0) return d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
    if (diff === 1) return 'Yesterday'
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const TH = 'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3 text-left whitespace-nowrap'
  const TD = 'px-4 py-3 text-[13.5px] align-middle'

  return (
    <>
      <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

        <PageHead
          title="User Management"
          subtitle={`${stats.total} users · ${stats.active} active · ${stats.suspended} suspended · ${stats.pending} pending`}
          actions={
            <Button variant="accent" onClick={() => setCreateOpen(true)}>
              <Plus size={14} strokeWidth={1.75} />
              Create user
            </Button>
          }
        />

        {/* Success strip */}
        {successStrip && (
          <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-btn border border-success/30 bg-success/5">
            <CheckCircle2 size={15} strokeWidth={1.75} className="text-success shrink-0" />
            <p className="flex-1 text-[13.5px] text-ink">{successStrip}</p>
            <button type="button" onClick={() => setSuccessStrip(null)}
              className="text-ink-4 hover:text-ink transition-colors">
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search size={14} strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className={`${INPUT_CLS} pl-8`}
            />
          </div>

          {/* Role filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
              className={`${SEL_CLS} pr-8 w-auto min-w-[140px]`}
            >
              <option value="all">All roles</option>
              <option value="admin">Administrator</option>
              <option value="landlord">Landlord</option>
            </select>
            <ChevronDown size={13} strokeWidth={1.75}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className={`${SEL_CLS} pr-8 w-auto min-w-[140px]`}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown size={13} strokeWidth={1.75}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          </div>

          <span className="ml-auto text-[12.5px] text-ink-4">
            {filtered.length} of {users.length} users
          </span>
        </div>

        {/* User table */}
        <div className="border border-border rounded-card overflow-hidden bg-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className={TH}>User</th>
                <th className={TH}>Role</th>
                <th className={TH}>Status</th>
                <th className={TH}>Modules</th>
                <th className={TH}>Last login</th>
                <th className={TH}>Created</th>
                <th className={TH} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13.5px] text-ink-4">
                    No users match the current filters.
                  </td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id}
                  className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">

                  {/* User */}
                  <td className={TD}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0
                                   text-white font-display font-semibold text-[13px]"
                        style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))' }}
                      >
                        {user.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-ink truncate">{user.name}</p>
                        <p className="text-[12px] text-ink-4 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className={TD}>
                    <RoleChip role={user.role} />
                  </td>

                  {/* Status */}
                  <td className={TD}>
                    <StatusChip status={user.status} />
                  </td>

                  {/* Modules */}
                  <td className={`${TD} text-ink-3 text-[12.5px]`}>
                    {user.role === 'admin'
                      ? <span className="text-ink-2 font-medium">All modules</span>
                      : `${LANDLORD_MODULES.length} modules`}
                  </td>

                  {/* Last login */}
                  <td className={`${TD} text-ink-3 tabular-nums text-[12.5px]`}>
                    {fmtLogin(user.lastLogin)}
                  </td>

                  {/* Created */}
                  <td className={`${TD} text-ink-4 text-[12.5px]`}>
                    {fmtDate(user.created)}
                  </td>

                  {/* Actions */}
                  <td className={`${TD} text-right`}>
                    <ActionMenu
                      user={user}
                      onEdit={() => setEditUser(user)}
                      onConfirm={kind => setConfirmAction({ kind, user })}
                      onLoginHistory={() => setHistoryUser(user)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>

      {/* Drawers */}
      <CreateUserDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <EditUserDrawer
        user={editUser}
        onClose={() => setEditUser(null)}
        onSaved={handleSaved}
      />
      <LoginHistoryDrawer
        user={historyUser}
        onClose={() => setHistoryUser(null)}
      />

      {/* Confirm modal */}
      <ConfirmModal
        action={confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
      />
    </>
  )
}
