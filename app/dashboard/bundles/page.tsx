'use client'

/**
 * Bundles Page
 * AI-matched bundle recommendations with Vercel-inspired design
 */

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { BundlesContent } from '@/components/bundles/bundles-content'

export default function BundlesPage() {
  return (
    <DashboardLayout>
      <BundlesContent />
    </DashboardLayout>
  )
}
