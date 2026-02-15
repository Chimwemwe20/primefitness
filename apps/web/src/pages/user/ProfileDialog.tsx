import { useState, useEffect } from 'react'
import { useAuth } from '../../providers/AuthContext'
import { useUpdateUser } from '../../hooks/useUsers'
import { Dialog } from '@repo/ui/Dialog'
import { Button } from '@repo/ui/Button'
import { Input } from '@repo/ui/Input'
import { Loader2 } from 'lucide-react'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { profile, user } = useAuth()
  const updateUserMutation = useUpdateUser()

  const [formData, setFormData] = useState({
    fullname: '',
    height: '',
    weight: '',
    age: '',
    gender: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sync form data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        fullname: profile?.fullname || '',
        height: profile?.height?.toString() || '',
        weight: profile?.weight?.toString() || '',
        age: profile?.age?.toString() || '',
        gender: profile?.gender || '',
      })
      setErrors({})
    }
  }, [open, profile])

  const handleSubmit = async () => {
    setErrors({})

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
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Profile"
      description="Update your personal details."
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Full Name</label>
          <Input
            type="text"
            value={formData.fullname}
            onChange={e => setFormData({ ...formData, fullname: e.target.value })}
            className="bg-neutral-800 border-neutral-700 text-neutral-100 w-full"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Height (cm) *</label>
          <Input
            type="number"
            value={formData.height}
            onChange={e => setFormData({ ...formData, height: e.target.value })}
            className="bg-neutral-800 border-neutral-700 text-neutral-100 w-full"
            placeholder="170"
            inputMode="numeric"
          />
          {errors.height && <p className="text-red-500 text-xs mt-1.5">{errors.height}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Weight (kg) *</label>
          <Input
            type="number"
            value={formData.weight}
            onChange={e => setFormData({ ...formData, weight: e.target.value })}
            className="bg-neutral-800 border-neutral-700 text-neutral-100 w-full"
            placeholder="70"
            inputMode="numeric"
          />
          {errors.weight && <p className="text-red-500 text-xs mt-1.5">{errors.weight}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Age *</label>
          <Input
            type="number"
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className="bg-neutral-800 border-neutral-700 text-neutral-100 w-full"
            placeholder="25"
            inputMode="numeric"
          />
          {errors.age && <p className="text-red-500 text-xs mt-1.5">{errors.age}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Gender *</label>
          <select
            value={formData.gender}
            onChange={e => setFormData({ ...formData, gender: e.target.value })}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-colors"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs mt-1.5">{errors.gender}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateUserMutation.isPending}
            className="border-neutral-700/80 text-neutral-300 bg-transparent hover:bg-white/[0.04] hover:text-neutral-100 hover:border-neutral-600 transition-all duration-150"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-900/30 font-medium transition-all duration-150"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </span>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
