import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/ui/Sidebar'
import { Topbar } from '../components/ui/Topbar'
import { MOCK_DASHBOARD } from '../data/mock'

export function LandlordLayout() {
  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <Sidebar user={MOCK_DASHBOARD.user} />
      <div className="min-w-0">
        <Topbar notificationCount={MOCK_DASHBOARD.notifications.unreadCount} />
        <Outlet />
      </div>
    </div>
  )
}
