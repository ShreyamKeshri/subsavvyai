'use client'

/**
 * Subscriptions Page
 * Full-page subscription management with Vercel-inspired design
 */

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { SubscriptionsContent } from '@/components/subscriptions/subscriptions-content'

export default function SubscriptionsPage() {
  return (
    <DashboardLayout>
      <SubscriptionsContent />
    </DashboardLayout>
  )
}
