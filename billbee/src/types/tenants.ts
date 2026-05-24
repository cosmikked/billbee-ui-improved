export type TenantStatus = 'active' | 'moved'

export interface Tenant {
  id: string
  name: string
  propertyName: string
  roomCode: string | null
  phone: string
  email: string | null
  moveInLabel: string
  moveOutLabel?: string
  status: TenantStatus
}

