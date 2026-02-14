import { useAuth } from '../../providers/AuthContext'
import { useAdminStats } from '../../hooks/useAdminStats'
import { Loader2 } from 'lucide-react'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const { data: stats, isLoading } = useAdminStats()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-neutral-100">Dashboard</h1>
      <p className="text-neutral-400 mb-8">Welcome back, {profile?.fullname || 'Admin'}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-neutral-100">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalUsers}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Active Coaches
          </h3>
          <p className="text-3xl font-bold text-neutral-100">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.activeCoaches}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
            System Status
          </h3>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p className="text-3xl font-bold text-neutral-100">Healthy</p>
          </div>
        </div>
      </div>
    </div>
  )
}
