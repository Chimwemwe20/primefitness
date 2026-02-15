import { useState } from 'react'
import { useAuth } from '../../providers/AuthContext'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { User, LogOut, Shield, Crown } from 'lucide-react'
import ProfileDialog from './ProfileDialog'

export default function UserSettings() {
  const { profile, signOut } = useAuth()
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  // Helper to get role badge
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          icon: Crown,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
        }
      case 'moderator':
        return {
          label: 'Moderator',
          icon: Shield,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        }
      default:
        return null
    }
  }

  const roleBadge = getRoleBadge(profile?.role)

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 mb-4 sm:mb-6">Settings</h1>

      <Card className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
            {roleBadge ? (
              <roleBadge.icon className={roleBadge.color} size={28} />
            ) : (
              <User className="text-neutral-500" size={28} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-neutral-100 truncate">
                {profile?.fullname || profile?.username || 'User'}
              </p>
              {roleBadge && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${roleBadge.bgColor} ${roleBadge.color} ${roleBadge.borderColor}`}
                >
                  <roleBadge.icon size={12} />
                  {roleBadge.label}
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500 truncate mt-0.5">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-1 mb-4">
          {profile?.height != null && (
            <p className="text-sm text-neutral-400">
              Height: <span className="text-neutral-200">{profile.height} cm</span>
            </p>
          )}
          {profile?.weight != null && (
            <p className="text-sm text-neutral-400">
              Weight: <span className="text-neutral-200">{profile.weight} kg</span>
            </p>
          )}
          {profile?.age != null && (
            <p className="text-sm text-neutral-400">
              Age: <span className="text-neutral-200">{profile.age}</span>
            </p>
          )}
          {profile?.gender && (
            <p className="text-sm text-neutral-400">
              Gender: <span className="text-neutral-200 capitalize">{profile.gender}</span>
            </p>
          )}
        </div>

        <Button
          onClick={() => setShowProfileDialog(true)}
          variant="outline"
          className="w-full sm:w-auto border-neutral-700 text-neutral-200 hover:bg-neutral-800"
        >
          Edit profile
        </Button>
      </Card>

      <Card className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 sm:p-6">
        <Button
          onClick={() => signOut()}
          variant="outline"
          className="w-full border-neutral-700 text-red-400 hover:bg-red-950/30 hover:border-red-900"
        >
          <LogOut size={18} className="mr-2" />
          Sign out
        </Button>
      </Card>

      <ProfileDialog open={showProfileDialog} onOpenChange={setShowProfileDialog} />
    </div>
  )
}
