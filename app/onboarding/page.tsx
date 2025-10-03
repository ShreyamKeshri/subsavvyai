'use client'

/**
 * Onboarding Flow - Neo-Minimalist Design
 * Progressive data collection for new users
 * Collects: Full name, preferences, notification settings
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, CheckCircle2 } from 'lucide-react'

type OnboardingStep = 'name' | 'preferences' | 'notifications' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [step, setStep] = useState<OnboardingStep>('name')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Name
  const [fullName, setFullName] = useState('')

  // Step 2: Preferences
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  // Step 3: Notifications
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(true)

  const supabase = createClientComponentClient()

  const categoryOptions = [
    { id: 'streaming', label: 'Streaming (Netflix, Spotify, etc.)' },
    { id: 'saas', label: 'SaaS & Productivity' },
    { id: 'fitness', label: 'Fitness & Wellness' },
    { id: 'news', label: 'News & Media' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'education', label: 'Education & Learning' },
  ]

  const handleNameStep = async () => {
    if (!fullName.trim()) {
      setError('Please enter your name')
      return
    }

    setError(null)
    setStep('preferences')
  }

  const handlePreferencesStep = () => {
    setError(null)
    setStep('notifications')
  }

  const handleComplete = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Update profile with collected data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          monthly_budget: monthlyBudget ? parseInt(monthlyBudget) : null,
          preferred_categories: categories,
          email_notifications: emailNotifications,
          sms_notifications: smsNotifications,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        setError('Failed to save your preferences')
        setLoading(false)
        return
      }

      // Show success state briefly
      setStep('complete')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      console.error('Onboarding error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-16 rounded-full transition-all ${step === 'name' || step === 'preferences' || step === 'notifications' || step === 'complete' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-16 rounded-full transition-all ${step === 'preferences' || step === 'notifications' || step === 'complete' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-16 rounded-full transition-all ${step === 'notifications' || step === 'complete' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Step 1: Name */}
          {step === 'name' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  What&apos;s your name?
                </h1>
                <p className="text-gray-500 text-sm">
                  Let&apos;s personalize your experience
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleNameStep}
                disabled={!fullName.trim()}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 'preferences' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Set your preferences
                </h1>
                <p className="text-gray-500 text-sm">
                  Help us understand your subscription habits
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget" className="text-gray-900 font-medium">
                  Monthly Budget (Optional)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="5000"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="h-12 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 pl-8"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  We&apos;ll help you track spending against this budget
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 font-medium">
                  Interested Categories (Optional)
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {categoryOptions.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                        categories.includes(category.id)
                          ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-700'
                          : 'bg-gray-50 border-2 border-transparent text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handlePreferencesStep}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all"
              >
                Continue
              </Button>

              <button
                onClick={() => setStep('name')}
                className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Notifications */}
          {step === 'notifications' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Stay updated
                </h1>
                <p className="text-gray-500 text-sm">
                  Choose how you want to receive alerts
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500 mt-1">Renewal reminders & weekly summaries</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-xs text-gray-500 mt-1">Urgent renewal alerts via SMS</p>
                  </div>
                  <button
                    onClick={() => setSmsNotifications(!smsNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      smsNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        smsNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleComplete}
                disabled={loading}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>

              <button
                onClick={() => setStep('preferences')}
                className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  All set, {fullName.split(' ')[0]}!
                </h1>
                <p className="text-gray-500 text-sm">
                  Redirecting you to your dashboard...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
