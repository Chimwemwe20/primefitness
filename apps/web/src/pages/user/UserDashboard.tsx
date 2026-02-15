import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../providers/AuthContext'
import { useUserStats } from '../../hooks/useUserStats'
import { useRecentWorkouts } from '../../hooks/useRecentWorkouts'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Loader2, Dumbbell, Target, Calendar, Activity, Award, Plus, History } from 'lucide-react'
import ProfileModal from './ProfileModal.tsx'
import DashboardSidebar from './DashboardSidebar.tsx'

export default function UserDashboard() {
  const { profile } = useAuth()
  const { data: stats, isLoading: statsLoading } = useUserStats()
  const { data: recentWorkouts, isLoading: workoutsLoading } = useRecentWorkouts()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const navigate = useNavigate()

  // Check if user needs to complete profile
  useEffect(() => {
    if (profile && (!profile.height || !profile.weight || !profile.age || !profile.gender)) {
      setShowProfileModal(true)
    }
  }, [profile])

  const statCards = [
    {
      title: 'Workouts',
      value: stats?.totalWorkouts || 0,
      icon: Dumbbell,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Streak',
      value: stats?.streak || 0,
      suffix: 'days',
      icon: Activity,
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-500',
    },
    {
      title: 'This Week',
      value: stats?.workoutsThisWeek || 0,
      suffix: 'workouts',
      icon: Calendar,
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-500',
    },
    {
      title: 'Goals',
      value: stats?.activeGoals || 0,
      icon: Target,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-500',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-foreground">
            Welcome back, {profile?.fullname || profile?.username || 'there'}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            Ready to crush your fitness goals today?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link to="/workouts/log">
              <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white h-12 sm:h-10">
                <Plus size={18} className="mr-2" />
                Log Workout
              </Button>
            </Link>
            <Link to="/workouts/history">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-border text-muted-foreground hover:text-foreground h-12 sm:h-10"
              >
                <History size={18} className="mr-2" />
                Workout History
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="rounded-lg border border-border bg-card/50 p-3 sm:p-4 lg:p-6"
            >
              <div className="flex flex-col">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </h3>
                  <div className={`p-1.5 sm:p-2 lg:p-3 rounded-lg ${stat.iconBg} flex-shrink-0`}>
                    <stat.icon className={stat.iconColor} size={16} />
                  </div>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                    {statsLoading ? (
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  {stat.suffix && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                      {stat.suffix}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Workouts */}
          <Card className="lg:col-span-2 bg-card border-border p-4 sm:p-6 order-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold flex items-center gap-2">
                <Dumbbell size={18} className="sm:w-5 sm:h-5" />
                Recent Workouts
              </h2>
              <Link to="/workouts/history">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto border-border text-muted-foreground hover:text-foreground text-sm h-10"
                >
                  <History size={14} className="mr-1.5" />
                  View All
                </Button>
              </Link>
            </div>

            {workoutsLoading ? (
              <div className="flex items-center justify-center py-12 sm:py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentWorkouts && recentWorkouts.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentWorkouts.slice(0, 5).map(workout => (
                  <div
                    key={workout.id}
                    onClick={() => navigate(`/workouts/${workout.id}`)}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer active:scale-[0.98] sm:active:scale-100"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 sm:p-2.5 rounded-lg bg-blue-500/20 flex-shrink-0">
                        <Dumbbell className="text-blue-500" size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                          {workout.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {workout.exercises?.length || 0} exercises
                          {workout.duration ? <> &middot; {workout.duration} min</> : null}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                          {new Date(workout.startTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {workout.completedAt && (
                      <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/20 flex-shrink-0 ml-2">
                        <Award className="text-green-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <Dumbbell className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  No workouts logged yet
                </p>
                <Link to="/workouts/log">
                  <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 h-12 sm:h-10">
                    Log Your First Workout
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Sidebar */}
          <DashboardSidebar
            profile={profile}
            stats={stats}
            onEditProfile={() => setShowProfileModal(true)}
            className="order-2"
          />
        </div>
      </div>

      {/* Profile Completion Modal */}
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  )
}
