'use client'

/**
 * Settings Page
 * Modern settings page with Vercel-inspired design
 */

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { SettingsContent } from '@/components/settings/settings-content'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsContent />
    </DashboardLayout>
  )
}
