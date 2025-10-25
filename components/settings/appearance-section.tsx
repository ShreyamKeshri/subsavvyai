'use client'

/**
 * Appearance Section Component
 * Theme and notification preferences based on Vercel design
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Moon, Sun, Bell, Mail } from 'lucide-react'
import { getUserProfile, updatePreferences, updateNotificationPreferences } from '@/lib/settings/settings-actions'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    emailReminders: false,
    savingsAlerts: false,
    weeklyDigest: false,
    newFeatures: false,
  })

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    const result = await getUserProfile()
    if (result.success && result.data) {
      const { notifications: notifPrefs } = result.data
      setNotifications({
        emailReminders: notifPrefs.email_enabled || false,
        savingsAlerts: notifPrefs.push_enabled || false,
        weeklyDigest: notifPrefs.push_enabled || false,
        newFeatures: notifPrefs.email_enabled || false,
      })
    }
  }

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)

    // Save to database
    const result = await updatePreferences({ theme: newTheme })
    if (result.success) {
      toast.success('Theme updated')
    }
  }

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    // eslint-disable-next-line security/detect-object-injection
    const newValue = !notifications[key]
    setNotifications((prev) => ({ ...prev, [key]: newValue }))

    // Map UI keys to database fields
    const mapping: Record<string, string> = {
      emailReminders: 'email_notifications',
      savingsAlerts: 'push_notifications',
      weeklyDigest: 'push_notifications',
      newFeatures: 'email_notifications',
    }

     
    const result = await updateNotificationPreferences({
      // eslint-disable-next-line security/detect-object-injection
      [mapping[key]]: newValue,
    })

    if (result.success) {
      toast.success('Notification preference updated')
    } else {
      // Revert on error
      setNotifications((prev) => ({ ...prev, [key]: !newValue }))
      toast.error('Failed to update preference')
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Appearance & Preferences</h2>

      {/* Theme Selection */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-foreground mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: null },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleThemeChange(id as 'light' | 'dark' | 'system')}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                theme === id ? 'border-blue-500 bg-blue-500/10' : 'border-border bg-muted/30 hover:bg-muted/50'
              }`}
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span className="font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Notifications</h3>
        <div className="space-y-3">
          {[
            {
              key: 'emailReminders' as keyof typeof notifications,
              label: 'Email Reminders',
              description: 'Get reminded about upcoming subscription renewals',
              icon: Mail,
            },
            {
              key: 'savingsAlerts' as keyof typeof notifications,
              label: 'Savings Alerts',
              description: 'Receive alerts when we find ways to save you money',
              icon: Bell,
            },
            {
              key: 'weeklyDigest' as keyof typeof notifications,
              label: 'Weekly Digest',
              description: 'Get a weekly summary of your subscriptions and savings',
              icon: Mail,
            },
            {
              key: 'newFeatures' as keyof typeof notifications,
              label: 'New Features',
              description: 'Be notified about new features and improvements',
              icon: Bell,
            },
          ].map(({ key, label, description, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>

              <button
                onClick={() => handleNotificationToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  // eslint-disable-next-line security/detect-object-injection
                  notifications[key] ? 'bg-blue-500' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    // eslint-disable-next-line security/detect-object-injection
                    notifications[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
