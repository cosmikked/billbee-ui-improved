import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandlordLayout } from './layouts/LandlordLayout'
import { Dashboard } from './pages/landlord/Dashboard'
import { Properties } from './pages/landlord/Properties'
import { PropertyHub } from './pages/landlord/PropertyHub'
import { Charges } from './pages/landlord/Charges'
import { Rooms } from './pages/landlord/Rooms'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landlord/dashboard" replace />} />
        <Route path="/landlord" element={<LandlordLayout />}>
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="properties"     element={<Properties />} />
          <Route path="properties/:id" element={<PropertyHub />} />
          <Route path="charges"        element={<Charges />} />
          <Route path="rooms"          element={<Rooms />} />
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
