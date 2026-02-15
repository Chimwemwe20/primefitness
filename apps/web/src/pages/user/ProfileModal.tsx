import React, { useState } from 'react'
import { useAuth } from '../../providers/AuthContext'
import { useUpdateUser } from '../../hooks/useUsers'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Input } from '@repo/ui/Input'
import { Loader2, X } from 'lucide-react'

interface ProfileModalProps {
  onClose: () => void
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
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
    <div className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <Card className="bg-neutral-900 border-neutral-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 sm:border-0 px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Complete Your Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors flex-shrink-0 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-4 sm:px-6 pb-6 sm:pb-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Full Name</label>
            <Input
              type="text"
              value={formData.fullname}
              onChange={e => setFormData({ ...formData, fullname: e.target.value })}
              className="bg-neutral-800 border-neutral-700 text-neutral-100 w-full h-12 text-base"
              placeholder="John Doe"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Height (cm) *</label>
            <Input
              type="number"
              value={formData.height}
              onChange={e => setFormData({ ...formData, height: e.target.value })}
              className="bg-neutral-800 border-neutral-700 text-neutral-100 w-full h-12 text-base"
              placeholder="170"
              inputMode="numeric"
            />
            {errors.height && <p className="text-red-500 text-xs mt-1.5">{errors.height}</p>}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Weight (kg) *</label>
            <Input
              type="number"
              value={formData.weight}
              onChange={e => setFormData({ ...formData, weight: e.target.value })}
              className="bg-neutral-800 border-neutral-700 text-neutral-100 w-full h-12 text-base"
              placeholder="70"
              inputMode="numeric"
            />
            {errors.weight && <p className="text-red-500 text-xs mt-1.5">{errors.weight}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Age *</label>
            <Input
              type="number"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              className="bg-neutral-800 border-neutral-700 text-neutral-100 w-full h-12 text-base"
              placeholder="25"
              inputMode="numeric"
            />
            {errors.age && <p className="text-red-500 text-xs mt-1.5">{errors.age}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Gender *</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
              className="w-full h-12 px-4 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1.5">{errors.gender}</p>}
          </div>

          {/* Submit Button - Sticky on mobile */}
          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 sm:h-11 text-base font-medium active:scale-[0.98]"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
