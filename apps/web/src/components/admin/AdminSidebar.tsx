import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Activity, Settings, LogOut, X } from 'lucide-react'
import { useAuth } from '../../providers/AuthContext'
import { cn } from '@repo/ui/utils'

interface AdminSidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  const { profile, signOut } = useAuth()
  const location = useLocation()

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
    // {
    //   to: '/admin/exercises',
    //   icon: Dumbbell,
    //   label: 'Exercise Management',
    // },
    {
      to: '/admin/workout-templates',
      icon: FileText,
      label: 'Workout Templates',
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

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 text-neutral-100">
            <span className="font-bebas text-lg font-bold">A</span>
          </div>
          <span className="text-lg font-bold tracking-wider text-neutral-100 uppercase">
            Admin<span className="text-neutral-600">Panel</span>
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map(item => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-neutral-800 p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 shrink-0">
            <span className="text-sm font-bold">{profile?.email?.[0].toUpperCase() || 'A'}</span>
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <p className="truncate text-sm font-medium text-neutral-200">
              {profile?.fullname || 'Admin User'}
            </p>
            <p className="truncate text-xs text-neutral-500">{profile?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-md p-2 text-neutral-400 hover:bg-neutral-800 hover:text-red-400 transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  )

  const isMobile = !!onClose
  return (
    <>
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r border-neutral-800 bg-neutral-950 text-neutral-400 flex flex-col transition-transform duration-200 ease-out',
          isMobile && !mobileOpen && '-translate-x-full',
          'lg:z-40 lg:translate-x-0'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
