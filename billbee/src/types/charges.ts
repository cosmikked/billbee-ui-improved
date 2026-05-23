export type ChargeType  = 'fixed' | 'non-fixed' | 'tenant-specific'
export type ChargeScope = 'room-level' | 'room-fixed' | 'tenant-level'

export interface Charge {
  id: string
  name: string
  category: string
  type: ChargeType
  scope: ChargeScope
  defaultAmountPHP: number | null
  /** null for tenant-level charges (not attached to rooms) */
  attachedRooms: { count: number; total: number } | null
  status: 'active' | 'inactive'
  propertyId: string
}
