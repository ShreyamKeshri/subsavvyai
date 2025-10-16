'use client'

/**
 * Recommendations Page
 * AI-powered savings recommendations with Vercel-inspired design
 */

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { RecommendationsContent } from '@/components/recommendations/recommendations-content'

export default function RecommendationsPage() {
  return (
    <DashboardLayout>
      <RecommendationsContent />
    </DashboardLayout>
  )
}
