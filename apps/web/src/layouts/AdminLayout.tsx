import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <AdminSidebar />
      <main className="pl-64">
        <div className="container mx-auto p-8 max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
