import { useState } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import {
  Home,
  Dumbbell,
  TrendingUp,
  Target,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@repo/ui/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, end: true },
  { name: 'Workouts', href: '/workouts', icon: Dumbbell, end: false },
  { name: 'Progress', href: '/progress', icon: TrendingUp, end: true },
  { name: 'Goals', href: '/goals', icon: Target, end: true },
  { name: 'Calendar', href: '/calendar', icon: Calendar, end: true },
]

export default function UserLayout() {
  const { signOut, profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      {/* Mobile: top bar with menu */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-neutral-800 bg-neutral-950">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <span className="font-bold text-neutral-100">PrimeFit</span>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-neutral-800 lg:bg-neutral-950 lg:p-6 shrink-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">PrimeFit</h1>
            <p className="text-sm text-neutral-500 truncate">
              {profile?.fullname || profile?.username || 'User'}
            </p>
          </div>
          <nav className="space-y-2 flex-1">
            {navigation.map(item => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100'
                  )
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
            <div className="border-t border-neutral-800 my-4" />
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100 transition-colors"
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100 transition-colors text-left"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/60"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
            <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-neutral-950 border-r border-neutral-800 p-6 flex flex-col animate-slide-in-left">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold">PrimeFit</h1>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-neutral-100"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-neutral-500 mb-4 truncate">
                {profile?.fullname || profile?.username || 'User'}
              </p>
              <nav className="space-y-1 flex-1">
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                <div className="border-t border-neutral-800 my-4" />
                <Link
                  to="/settings"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                >
                  <Settings size={20} />
                  <span className="font-medium">Settings</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100 text-left"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Main content: padding for bottom nav on mobile */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur safe-area-pb"
        aria-label="Main navigation"
      >
        {navigation.map(item => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-2 text-xs gap-1 min-w-0',
                isActive ? 'text-blue-400' : 'text-neutral-500'
              )
            }
          >
            <item.icon size={22} strokeWidth={2} />
            <span className="truncate max-w-full">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
