import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import { Menu } from 'lucide-react'

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="fixed inset-0 bg-neutral-950 text-neutral-100 overflow-hidden">
      <AdminSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Mobile header with menu trigger */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center h-14 px-4 border-b border-neutral-800 bg-neutral-950">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <span className="ml-2 font-bold text-neutral-100">Admin</span>
      </header>

      {/* Main content area - fills remaining space */}
      <main className="fixed inset-0 lg:left-64 pt-14 lg:pt-0 overflow-y-auto bg-neutral-950">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl animate-fade-in min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
