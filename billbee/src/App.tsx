import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandlordLayout } from './layouts/LandlordLayout'
import { Dashboard } from './pages/landlord/Dashboard'
import { Properties } from './pages/landlord/Properties'
import { PropertyLayout } from './pages/landlord/PropertyLayout'
import { PropertyHub } from './pages/landlord/PropertyHub'
import { PropertyCharges } from './pages/landlord/PropertyCharges'
import { PropertyRooms } from './pages/landlord/PropertyRooms'
import { PropertyTenants } from './pages/landlord/PropertyTenants'
import { Charges } from './pages/landlord/Charges'
import { Rooms } from './pages/landlord/Rooms'
import { Tenants } from './pages/landlord/Tenants'
import { TenantDetail } from './pages/landlord/TenantDetail'
import { BillingCenter } from './pages/landlord/BillingCenter'
import { CycleDetail } from './pages/landlord/CycleDetail'
import { GenerateBills } from './pages/landlord/GenerateBills'
import { DraftBill } from './pages/landlord/DraftBill'
import { PostedBill } from './pages/landlord/PostedBill'
import { PaymentsReceipts } from './pages/landlord/PaymentsReceipts'
import { Reports } from './pages/landlord/Reports'
import { RoomDetail } from './pages/landlord/RoomDetail'
// v2 — Improved Billing prototype
import { BillsHub }       from './pages/landlord/v2/BillsHub'
import { CycleDetailV2 }  from './pages/landlord/v2/CycleDetailV2'
import { CreateBills }    from './pages/landlord/v2/CreateBills'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landlord/dashboard" replace />} />
        <Route path="/landlord" element={<LandlordLayout />}>
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="properties"          element={<Properties />} />
          <Route path="properties/:id"      element={<PropertyLayout />}>
            <Route index                    element={<PropertyHub />} />
            <Route path="charges"           element={<PropertyCharges />} />
            <Route path="rooms"             element={<PropertyRooms />} />
            <Route path="tenants"           element={<PropertyTenants />} />
          </Route>
          <Route path="charges"        element={<Charges />} />
          <Route path="rooms"          element={<Rooms />} />
          <Route path="rooms/:id"      element={<RoomDetail />} />
          <Route path="tenants"        element={<Tenants />} />
          <Route path="tenants/:id"    element={<TenantDetail />} />
          <Route path="billing"                        element={<BillingCenter />} />
          <Route path="billing/cycle/:id"            element={<CycleDetail />} />
          <Route path="billing/generate"             element={<GenerateBills />} />
          <Route path="billing/draft/:id"           element={<DraftBill />} />
          <Route path="billing/posted/:id"          element={<PostedBill />} />
          <Route path="payments"                    element={<PaymentsReceipts />} />
          <Route path="reports"                     element={<Reports />} />
          {/* v2 — Improved Billing prototype */}
          <Route path="billing-v2"                  element={<BillsHub />} />
          <Route path="billing-v2/cycle/:id"        element={<CycleDetailV2 />} />
          <Route path="billing-v2/create"           element={<CreateBills />} />
          {/* Stub routes — pages not yet implemented */}
          <Route path="*" element={<ComingSoon />} />
        </Route>
        <Route path="*" element={<Navigate to="/landlord/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function ComingSoon() {
  return (
    <main className="flex items-center justify-center h-64 text-ink-3 text-[14px]">
      Page coming soon
    </main>
  )
}
