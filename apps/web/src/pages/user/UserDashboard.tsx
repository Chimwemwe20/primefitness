import React, { useState, useEffect } from 'react'
import { useAuth } from '../../providers/AuthContext'
import { useUserStats } from '../../hooks/useUserStats'
import { useRecentWorkouts } from '../../hooks/useRecentWorkouts'
import { useUpdateUser } from '../../hooks/useUsers'
import { Button } from '../../../../../packages/ui/components/ui/button'
import { Card } from '../../../../../packages/ui/components/ui/card'
import { Input } from '../../../../../packages/ui/components/ui/input'
import {
  Loader2,
  Dumbbell,
  Target,
  Calendar,
  Activity,
  Award,
  Plus,
  X,
  User,
  Ruler,
  Scale,
  Cake,
  Users,
} from 'lucide-react'

export default function UserDashboard() {
  const { profile } = useAuth()
  const { data: stats, isLoading: statsLoading } = useUserStats()
  const { data: recentWorkouts, isLoading: workoutsLoading } = useRecentWorkouts()
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Check if user needs to complete profile
  useEffect(() => {
    if (profile && (!profile.height || !profile.weight || !profile.age || !profile.gender)) {
      setShowProfileModal(true)
    }
  }, [profile])

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-neutral-100">
            Welcome back, {profile?.fullname || profile?.username || 'there'}!
          </h1>
          <p className="text-neutral-400">Ready to crush your fitness goals today?</p>
        </div>
        <Button
          onClick={() => (window.location.href = '/workouts/log')}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus size={20} className="mr-2" />
          Log Workout
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Total Workouts
              </h3>
              <p className="text-3xl font-bold text-neutral-100">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.totalWorkouts || 0
                )}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Dumbbell className="text-blue-500" size={24} />
            </div>
          </div>
        </Card>

        <Card className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Current Streak
              </h3>
              <p className="text-3xl font-bold text-neutral-100">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.streak || 0}
              </p>
              <p className="text-sm text-neutral-500 mt-1">days</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/20">
              <Activity className="text-orange-500" size={24} />
            </div>
          </div>
        </Card>

        <Card className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                This Week
              </h3>
              <p className="text-3xl font-bold text-neutral-100">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.workoutsThisWeek || 0
                )}
              </p>
              <p className="text-sm text-neutral-500 mt-1">workouts</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <Calendar className="text-green-500" size={24} />
            </div>
          </div>
        </Card>

        <Card className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Active Goals
              </h3>
              <p className="text-3xl font-bold text-neutral-100">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats?.activeGoals || 0
                )}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Target className="text-purple-500" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Workouts & Quick Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Workouts */}
        <Card className="lg:col-span-2 bg-neutral-900 border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Dumbbell size={20} />
              Recent Workouts
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="border-neutral-700 text-neutral-400 hover:text-neutral-100"
              onClick={() => (window.location.href = '/workouts/history')}
            >
              View All
            </Button>
          </div>

          {workoutsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            </div>
          ) : recentWorkouts && recentWorkouts.length > 0 ? (
            <div className="space-y-4">
              {recentWorkouts.slice(0, 5).map(workout => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <Dumbbell className="text-blue-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-100">{workout.title}</h3>
                      <p className="text-sm text-neutral-400">
                        {workout.exercises?.length || 0} exercises •{' '}
                        {workout.duration ? `${workout.duration} min` : 'In progress'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(workout.startTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  {workout.completedAt && (
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Award className="text-green-500" size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Dumbbell className="mx-auto h-12 w-12 text-neutral-700 mb-4" />
              <p className="text-neutral-500 mb-4">No workouts logged yet</p>
              <Button
                onClick={() => (window.location.href = '/workouts/log')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Log Your First Workout
              </Button>
            </div>
          )}
        </Card>

        {/* Personal Records & Profile */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User size={18} />
                Profile
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="border-neutral-700 text-xs"
                onClick={() => setShowProfileModal(true)}
              >
                Edit
              </Button>
            </div>

            <div className="space-y-3">
              {profile?.height && (
                <div className="flex items-center gap-3 text-sm">
                  <Ruler className="text-neutral-500" size={16} />
                  <span className="text-neutral-400">Height:</span>
                  <span className="text-neutral-100 font-medium">{profile.height} cm</span>
                </div>
              )}
              {profile?.weight && (
                <div className="flex items-center gap-3 text-sm">
                  <Scale className="text-neutral-500" size={16} />
                  <span className="text-neutral-400">Weight:</span>
                  <span className="text-neutral-100 font-medium">{profile.weight} kg</span>
                </div>
              )}
              {profile?.age && (
                <div className="flex items-center gap-3 text-sm">
                  <Cake className="text-neutral-500" size={16} />
                  <span className="text-neutral-400">Age:</span>
                  <span className="text-neutral-100 font-medium">{profile.age} years</span>
                </div>
              )}
              {profile?.gender && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="text-neutral-500" size={16} />
                  <span className="text-neutral-400">Gender:</span>
                  <span className="text-neutral-100 font-medium capitalize">{profile.gender}</span>
                </div>
              )}

              {!profile?.height && !profile?.weight && (
                <p className="text-neutral-500 text-sm text-center py-4">
                  Complete your profile to get personalized insights
                </p>
              )}
            </div>
          </Card>

          {/* Personal Records */}
          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award size={18} />
              Personal Records
            </h2>

            {stats?.personalRecords && stats.personalRecords.length > 0 ? (
              <div className="space-y-3">
                {stats.personalRecords.slice(0, 3).map((record, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">{record.exercise}</span>
                    <span className="text-sm font-bold text-blue-500">{record.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm text-center py-4">
                No personal records yet. Keep training!
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Profile Completion Modal */}
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  )
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  const { profile, user } = useAuth()
  const updateUserMutation = useUpdateUser()
  const [formData, setFormData] = useState({
    fullname: profile?.fullname || '',
    height: profile?.height?.toString() || '',
    weight: profile?.weight?.toString() || '',
    age: profile?.age?.toString() || '',
    gender: profile?.gender || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async () => {
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.height) newErrors.height = 'Height is required'
    if (!formData.weight) newErrors.weight = 'Weight is required'
    if (!formData.age) newErrors.age = 'Age is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await updateUserMutation.mutateAsync({
        uid: user?.uid || '',
        data: {
          fullname: formData.fullname || undefined,
          height: parseInt(formData.height),
          weight: parseInt(formData.weight),
          age: parseInt(formData.age),
          gender: formData.gender as 'male' | 'female',
        },
      })
      onClose()
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-neutral-900 border-neutral-800 p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Full Name</label>
            <Input
              type="text"
              value={formData.fullname}
              onChange={e => setFormData({ ...formData, fullname: e.target.value })}
              className="bg-neutral-800 border-neutral-700 text-neutral-100"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Height (cm) *</label>
            <Input
              type="number"
              value={formData.height}
              onChange={e => setFormData({ ...formData, height: e.target.value })}
              className="bg-neutral-800 border-neutral-700 text-neutral-100"
              placeholder="170"
            />
            {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Weight (kg) *</label>
            <Input
              type="number"
              value={formData.weight}
              onChange={e => setFormData({ ...formData, weight: e.target.value })}
              className="bg-neutral-800 border-neutral-700 text-neutral-100"
              placeholder="70"
            />
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Age *</label>
            <Input
              type="number"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              className="bg-neutral-800 border-neutral-700 text-neutral-100"
              placeholder="25"
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Gender *</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
