export type RoomStatus   = 'active' | 'inactive' | 'maintenance'
export type RentMode     = 'Room Total (Split)' | 'Per-Tenant'
export type RoomChargeType = 'fixed' | 'non-fixed'

export interface RoomTenant {
  id: string
  name: string
  moveInLabel: string  // e.g. "Jan 2024"
}

export interface RoomCharge {
  id: string
  name: string
  type: RoomChargeType
  scope: 'room-level' | 'room-fixed'
  /** null for non-fixed (entered via CSV) */
  amountPHP: number | null
  description: string  // e.g. "room-level · amount via CSV"
}

export interface RoomAvailableCharge {
  id: string
  name: string
}

export interface Room {
  id: string
  name: string
  propertyId: string
  status: RoomStatus
  capacity: number
  monthlyRentPHP: number
  rentMode: RentMode
  notes: string
  tenants: RoomTenant[]
  charges: RoomCharge[]
  availableCharges: RoomAvailableCharge[]
}
