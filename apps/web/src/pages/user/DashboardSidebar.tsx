import React from 'react'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { User, Ruler, Scale, Cake, Users, Award } from 'lucide-react'

interface PersonalRecord {
  exercise: string
  value: string | number
}

interface UserProfile {
  fullname?: string
  username?: string
  height?: number
  weight?: number
  age?: number
  gender?: string
}

interface UserStats {
  totalWorkouts?: number
  streak?: number
  workoutsThisWeek?: number
  activeGoals?: number
  personalRecords?: PersonalRecord[]
  totalVolume?: number
  bestLift?: number
}

interface DashboardSidebarProps {
  profile: UserProfile | null | undefined
  stats: UserStats | null | undefined
  onEditProfile: () => void
  className?: string
}

export default function DashboardSidebar({
  profile,
  stats,
  onEditProfile,
  className = '',
}: DashboardSidebarProps) {
  const hasProfileData = profile?.height || profile?.weight || profile?.age || profile?.gender

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Profile Card */}
      <Card className="bg-neutral-900 border-neutral-800 p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <User size={16} className="sm:w-[18px] sm:h-[18px]" />
            Profile
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-700 text-xs sm:text-sm h-8 sm:h-9 px-3"
            onClick={onEditProfile}
          >
            Edit
          </Button>
        </div>

        {hasProfileData ? (
          <div className="space-y-3">
            {profile?.height && (
              <div className="flex items-center gap-3 text-sm">
                <Ruler className="text-neutral-500 flex-shrink-0" size={16} />
                <span className="text-neutral-400">Height:</span>
                <span className="text-neutral-100 font-medium ml-auto">{profile.height} cm</span>
              </div>
            )}
            {profile?.weight && (
              <div className="flex items-center gap-3 text-sm">
                <Scale className="text-neutral-500 flex-shrink-0" size={16} />
                <span className="text-neutral-400">Weight:</span>
                <span className="text-neutral-100 font-medium ml-auto">{profile.weight} kg</span>
              </div>
            )}
            {profile?.age && (
              <div className="flex items-center gap-3 text-sm">
                <Cake className="text-neutral-500 flex-shrink-0" size={16} />
                <span className="text-neutral-400">Age:</span>
                <span className="text-neutral-100 font-medium ml-auto">{profile.age} years</span>
              </div>
            )}
            {profile?.gender && (
              <div className="flex items-center gap-3 text-sm">
                <Users className="text-neutral-500 flex-shrink-0" size={16} />
                <span className="text-neutral-400">Gender:</span>
                <span className="text-neutral-100 font-medium capitalize ml-auto">
                  {profile.gender}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3">
              <User className="text-neutral-600" size={24} />
            </div>
            <p className="text-neutral-500 text-xs sm:text-sm mb-4">
              Complete your profile to get personalized insights
            </p>
            <Button
              onClick={onEditProfile}
              className="w-full bg-blue-500 hover:bg-blue-600 h-10 sm:h-9 text-sm"
            >
              Add Details
            </Button>
          </div>
        )}
      </Card>

      {/* Personal Records */}
      <Card className="bg-neutral-900 border-neutral-800 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          <Award size={16} className="sm:w-[18px] sm:h-[18px]" />
          Personal Records
        </h2>

        {stats?.personalRecords && stats.personalRecords.length > 0 ? (
          <div className="space-y-3">
            {stats.personalRecords.slice(0, 3).map((record, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
              >
                <span className="text-xs sm:text-sm text-neutral-400 truncate pr-3">
                  {record.exercise}
                </span>
                <span className="text-sm sm:text-base font-bold text-blue-500 flex-shrink-0">
                  {record.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3">
              <Award className="text-neutral-600" size={24} />
            </div>
            <p className="text-neutral-500 text-xs sm:text-sm">
              No personal records yet.
              <br />
              Keep training to set new PRs!
            </p>
          </div>
        )}
      </Card>

      {/* Quick Stats - Mobile Only */}
      <Card className="bg-neutral-900 border-neutral-800 p-4 lg:hidden">
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-neutral-800/50">
            <p className="text-xs text-neutral-500 mb-1">Total Volume</p>
            <p className="text-lg font-bold text-neutral-100">
              {stats?.totalVolume ? `${stats.totalVolume} kg` : '—'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-neutral-800/50">
            <p className="text-xs text-neutral-500 mb-1">Best Lift</p>
            <p className="text-lg font-bold text-neutral-100">
              {stats?.bestLift ? `${stats.bestLift} kg` : '—'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
