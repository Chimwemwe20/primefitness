import { useState } from 'react'
import { useAuth } from '../../providers/AuthContext'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { User, LogOut } from 'lucide-react'
import ProfileModal from './ProfileModal'

export default function UserSettings() {
  const { profile, signOut } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 mb-4 sm:mb-6">Settings</h1>

      <Card className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
            <User className="text-neutral-500" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-neutral-100 truncate">
              {profile?.fullname || profile?.username || 'User'}
            </p>
            <p className="text-sm text-neutral-500 truncate">{profile?.email}</p>
          </div>
        </div>
        {profile?.height != null && (
          <p className="text-sm text-neutral-400 mb-1">
            Height: <span className="text-neutral-200">{profile.height} cm</span>
          </p>
        )}
        {profile?.weight != null && (
          <p className="text-sm text-neutral-400 mb-1">
            Weight: <span className="text-neutral-200">{profile.weight} kg</span>
          </p>
        )}
        {profile?.age != null && (
          <p className="text-sm text-neutral-400 mb-1">
            Age: <span className="text-neutral-200">{profile.age}</span>
          </p>
        )}
        {profile?.gender && (
          <p className="text-sm text-neutral-400 mb-4">
            Gender: <span className="text-neutral-200 capitalize">{profile.gender}</span>
          </p>
        )}
        <Button
          onClick={() => setShowProfileModal(true)}
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

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  )
}
