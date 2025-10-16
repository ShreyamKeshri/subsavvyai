'use client'

/**
 * Profile Section Component
 * User profile management based on Vercel design
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getUserProfile, updateProfile } from '@/lib/settings/settings-actions'
import { toast } from 'sonner'

interface ProfileFormData {
  full_name: string
  phone_number: string
}

export function ProfileSection() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone_number: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const result = await getUserProfile()
    if (result.success && result.data) {
      setFormData({
        full_name: result.data.profile.full_name || '',
        phone_number: result.data.profile.phone_number || '',
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.full_name) {
      toast.error('Name is required')
      return
    }

    setIsSaving(true)
    const result = await updateProfile(formData)

    if (result.success) {
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } else {
      toast.error(result.error || 'Failed to update profile')
    }
    setIsSaving(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
      </div>

      <div className="space-y-4">
        {/* Email Field (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2 rounded-lg bg-muted text-foreground border border-input opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Enter your full name"
            className="w-full px-4 py-2 rounded-lg bg-muted text-foreground border border-input disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Phone Number (Optional)</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="+91 9876543210"
            className="w-full px-4 py-2 rounded-lg bg-muted text-foreground border border-input disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false)
                  loadProfile() // Reload original data
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
