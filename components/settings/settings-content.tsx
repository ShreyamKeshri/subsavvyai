'use client'

/**
 * Settings Content Component
 * Modern settings page based on Vercel design with SubSavvyAI integration
 */

import { ProfileSection } from './profile-section'
import { AppearanceSection } from './appearance-section'
import { ConnectedServicesSection } from './connected-services-section'
import { AccountActionsSection } from './account-actions-section'
import { LegalSection } from './legal-section'

export function SettingsContent() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and connected services</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <ProfileSection />
        <ConnectedServicesSection />
        <AppearanceSection />
        <LegalSection />
        <AccountActionsSection />
      </div>
    </div>
  )
}
