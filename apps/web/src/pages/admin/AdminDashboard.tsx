import { Link } from 'react-router-dom'
import { useAuth } from '../../providers/AuthContext'
import { useAdminStats } from '../../hooks/useAdminStats'
import { Card } from '@repo/ui/Card'
import { Loader2, Users, Award, Activity, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const { data: stats, isLoading } = useAdminStats()

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
      trend: '+12%',
    },
    {
      title: 'Workouts Today',
      value: stats?.workoutsToday || 0,
      icon: Activity,
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-500',
      trend: '+8%',
    },
    {
      title: 'System Status',
      value: 'Healthy',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-500',
      showPulse: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, {profile?.fullname || 'Admin'}
          </p>
        </div>

        {/* Stats Grid - Mobile First (1 col mobile, 2 cols tablet, 4 cols desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="rounded-lg border border-border bg-card/50 p-4 sm:p-5 lg:p-6 hover:bg-card/70 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1">
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {stat.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin" />
                      ) : (
                        stat.value
                      )}
                    </p>
                    {stat.trend && (
                      <span className="text-xs sm:text-sm text-green-500 font-medium">
                        {stat.trend}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`p-2 sm:p-2.5 lg:p-3 rounded-lg ${stat.iconBg} flex-shrink-0 relative`}
                >
                  <stat.icon className={stat.iconColor} size={20} />
                  {stat.showPulse && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link to="/admin/users">
              <Card className="bg-card border-border p-4 sm:p-5 hover:border-orange-500/50 transition-all cursor-pointer active:scale-95 h-full">
                <Users className="text-blue-500 mb-2 sm:mb-3" size={24} />
                <h3 className="font-semibold text-sm sm:text-base text-foreground">Users</h3>
                <p className="text-xs text-muted-foreground mt-1">Manage all users</p>
              </Card>
            </Link>
            <Link to="/admin/exercises">
              <Card className="bg-neutral-900 border-neutral-800 p-4 sm:p-5 hover:border-purple-500/50 transition-all cursor-pointer active:scale-95 h-full">
                <Award className="text-purple-500 mb-2 sm:mb-3" size={24} />
                <h3 className="font-semibold text-sm sm:text-base text-foreground">Exercises</h3>
                <p className="text-xs text-muted-foreground mt-1">Exercise library</p>
              </Card>
            </Link>
            <Link to="/admin/workout-templates">
              <Card className="bg-neutral-900 border-neutral-800 p-4 sm:p-5 hover:border-green-500/50 transition-all cursor-pointer active:scale-95 h-full">
                <Activity className="text-green-500 mb-2 sm:mb-3" size={24} />
                <h3 className="font-semibold text-sm sm:text-base text-foreground">Templates</h3>
                <p className="text-xs text-muted-foreground mt-1">Workout plans</p>
              </Card>
            </Link>
            <Link to="/admin/activity-logs">
              <Card className="bg-neutral-900 border-neutral-800 p-4 sm:p-5 hover:border-orange-500/50 transition-all cursor-pointer active:scale-95 h-full">
                <TrendingUp className="text-orange-500 mb-2 sm:mb-3" size={24} />
                <h3 className="font-semibold text-sm sm:text-base text-foreground">Logs</h3>
                <p className="text-xs text-muted-foreground mt-1">Activity logs</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity Preview */}
        <Card className="mt-6 sm:mt-8 bg-card border-border p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground">
            Recent System Activity
          </h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                View detailed activity logs in the Activity Logs section
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
