import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import { Menu } from 'lucide-react'

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <AdminSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      {/* Mobile header with menu trigger */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center h-14 px-4 border-b border-neutral-800 bg-neutral-950">
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
      <main className="lg:pl-64 min-h-screen">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl animate-fade-in pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
