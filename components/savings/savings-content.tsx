'use client'

/**
 * Savings Content Component
 * Main layout for savings tracker - based on Vercel V0 design
 */

import { Button } from '@/components/ui/button'
import { Share2, TrendingDown } from 'lucide-react'
import { SavingsMetrics } from './savings-metrics'
import { QuarterlyProgress } from './quarterly-progress'
import { CancelledTimeline } from './cancelled-timeline'
import { QuickStats } from './quick-stats'
import type { SavingsData } from '@/lib/savings/savings-actions'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface SavingsContentProps {
  savingsData: SavingsData
}

export function SavingsContent({ savingsData }: SavingsContentProps) {
  const {
    totalYearToDateSavings,
    monthlySavingsRate,
    annualProjection,
    cancelledSubscriptions,
  } = savingsData

  const handleShare = async () => {
    const shareText = `I saved ₹${totalYearToDateSavings.toFixed(0)} this year with SubSavvyAI!\n\nSmarter Subscriptions. Bigger Savings.\nhttps://subsavvy.ai`

    try {
      if (navigator.share) {
        await navigator.share({ text: shareText })
        toast.success('Shared successfully!')
      } else {
        await navigator.clipboard.writeText(shareText)
        toast.success('Copied to clipboard!')
      }
    } catch (err) {
      // Ignore AbortError (user cancelled the share)
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      // For other errors, silently fail (don't show error to user)
      console.error('Share failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Share Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Savings Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Track your subscription savings and cancelled services
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-muted transition-colors bg-transparent"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {/* Main Metrics */}
      <SavingsMetrics
        totalYearToDateSavings={totalYearToDateSavings}
        annualProjection={annualProjection}
        cancelledCount={cancelledSubscriptions.length}
      />

      {/* Quarterly Progress */}
      <QuarterlyProgress
        monthlySavingsRate={monthlySavingsRate}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Cancelled Subscriptions Timeline */}
        <div className="lg:col-span-2">
          <CancelledTimeline subscriptions={cancelledSubscriptions} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Maximize Savings Card */}
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Maximize Your Savings
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review our AI recommendations to find more subscriptions you can optimize or
                  cancel.
                </p>
                <Link href="/dashboard/recommendations">
                  <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    View Recommendations
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <QuickStats
            cancelledCount={cancelledSubscriptions.length}
            totalSaved={totalYearToDateSavings}
            avgPerMonth={monthlySavingsRate}
          />
        </div>
      </div>
    </div>
  )
}
