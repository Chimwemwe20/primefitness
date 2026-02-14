// apps/web/src/layouts/UserLayout.tsx
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import { Home, Dumbbell, TrendingUp, Target, Calendar, Settings, LogOut } from 'lucide-react'

export default function UserLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Workouts', href: '/workouts', icon: Dumbbell },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-neutral-800 bg-neutral-950 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">PrimeFit</h1>
            <p className="text-sm text-neutral-500">
              {profile?.fullname || profile?.username || 'User'}
            </p>
          </div>

          <nav className="space-y-2">
            {navigation.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-500 text-white'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            <div className="border-t border-neutral-800 my-4"></div>

            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100 transition-colors"
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>

            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
