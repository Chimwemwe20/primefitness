import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Activity, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../providers/AuthContext'
import { cn } from '@repo/ui/utils'

export default function AdminSidebar() {
  const { profile, signOut } = useAuth()

  const navItems = [
    {
      to: '/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
      end: true,
    },
    {
      to: '/admin/users',
      icon: Users,
      label: 'User Management',
    },
    {
      to: '/admin/activity-logs',
      icon: Activity,
      label: 'Activity Logs',
    },
    {
      to: '/admin/settings',
      icon: Settings,
      label: 'Settings',
    },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-800 bg-neutral-950 text-neutral-400">
      {/* Logo Area */}
      <div className="flex h-16 items-center border-b border-neutral-800 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 text-neutral-100">
            <span className="font-bebas text-lg font-bold">A</span>
          </div>
          <span className="text-lg font-bold tracking-wider text-neutral-100 uppercase">
            Admin<span className="text-neutral-600">Panel</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-neutral-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-400">
            <span className="text-sm font-bold">{profile?.email?.[0].toUpperCase() || 'A'}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-neutral-200">
              {profile?.fullname || 'Admin User'}
            </p>
            <p className="truncate text-xs text-neutral-500">{profile?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-md p-2 text-neutral-400 hover:bg-neutral-800 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
