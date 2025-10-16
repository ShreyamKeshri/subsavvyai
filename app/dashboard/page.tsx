'use client'

/**
 * Dashboard Page - New Vercel Design
 * Modern sidebar layout with cleaner UI
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { HeroMetrics } from '@/components/dashboard/hero-metrics'
import { OnboardingChecklistCard } from '@/components/dashboard/onboarding-checklist-card'
import { RecommendationsFeedCard } from '@/components/dashboard/recommendations-feed-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { getUserSubscriptions, type Subscription } from '@/lib/subscriptions/subscription-actions'
import { getPendingRecommendations, dismissRecommendation, type OptimizationRecommendation } from '@/lib/recommendations/recommendation-actions'
import { getConnectedServices } from '@/lib/usage/usage-actions'
import { AddSubscriptionDialog } from '@/components/subscriptions/add-subscription-dialog'
import { BundleRecommendationsList } from '@/components/bundles/bundle-recommendations-list'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [totalSavings, setTotalSavings] = useState<{ monthly: number; annual: number } | null>(null)
  const [connectedServices, setConnectedServices] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showChecklist, setShowChecklist] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  const fetchData = async () => {
    setLoadingData(true)

    // Fetch all data in parallel
    const [subsResult, recsResult, servicesResult] = await Promise.all([
      getUserSubscriptions(),
      getPendingRecommendations(),
      getConnectedServices(),
    ])

    if (subsResult.success && subsResult.data) {
      setSubscriptions(subsResult.data)
    }

    if (recsResult.success && recsResult.data) {
      setRecommendations(recsResult.data)
      setTotalSavings(recsResult.totalSavings || null)
    }

    if (servicesResult.success && servicesResult.data) {
      setConnectedServices(servicesResult.data)
    }

    setLoadingData(false)
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const handleDismissRecommendation = async (id: string) => {
    const result = await dismissRecommendation(id)
    if (result.success) {
      toast.info('Recommendation dismissed')
      fetchData()
    }
  }

  // Calculate metrics
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => {
    const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost :
                        sub.billing_cycle === 'quarterly' ? sub.cost / 3 :
                        sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
    return sum + monthlyCost
  }, 0)

  // Onboarding checklist tasks
  const checklistTasks = [
    {
      id: 'add_subscription',
      title: 'Add your first subscription',
      description: 'Track subscriptions with 52 pre-loaded Indian services',
      completed: activeSubscriptions.length > 0,
      action: () => {
        const addButton = document.querySelector('[data-add-subscription]') as HTMLButtonElement
        addButton?.click()
      }
    },
    {
      id: 'connect_spotify',
      title: 'Connect Spotify for AI recommendations',
      description: 'Get smart downgrade alerts based on your listening habits',
      completed: connectedServices.includes('spotify'),
      action: () => router.push('/api/oauth/spotify/connect')
    },
    {
      id: 'view_recommendation',
      title: 'Review your first AI recommendation',
      description: 'See AI-powered savings opportunities',
      completed: recommendations.length > 0 && activeSubscriptions.length > 0,
    },
    {
      id: 'find_bundles',
      title: 'Find telecom bundle savings',
      description: 'Check if bundling can save you ₹10,000+/year',
      completed: activeSubscriptions.length >= 2,
      action: () => {
        const bundleSection = document.getElementById('bundle-section')
        bundleSection?.scrollIntoView({ behavior: 'smooth' })
      }
    },
  ]

  if (loading || loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Metrics Section */}
        <HeroMetrics
          totalSpending={totalMonthlySpend}
          potentialSavings={totalSavings?.monthly || 0}
          activeSubscriptions={activeSubscriptions.length}
          connectedServices={connectedServices.length}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Onboarding & Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Onboarding Checklist */}
            {showChecklist && (
              <OnboardingChecklistCard
                tasks={checklistTasks}
                onDismiss={() => setShowChecklist(false)}
              />
            )}

            {/* AI Recommendations Feed */}
            <RecommendationsFeedCard
              recommendations={recommendations}
              onDismiss={handleDismissRecommendation}
              onView={(_id) => {
                toast.info('View recommendation details')
                // TODO: Open recommendation details modal
              }}
            />

            {/* Bundle Optimizer */}
            {activeSubscriptions.length >= 2 && (
              <div id="bundle-section">
                <BundleRecommendationsList />
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Add Subscription */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <AddSubscriptionDialog onSuccess={fetchData}>
                <Button
                  data-add-subscription
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscription
                </Button>
              </AddSubscriptionDialog>

              {/* Connect Spotify CTA */}
              {!connectedServices.includes('spotify') && (
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => router.push('/api/oauth/spotify/connect')}
                >
                  Connect Spotify
                </Button>
              )}
            </Card>

            {/* Recent Subscriptions */}
            {activeSubscriptions.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Recent Subscriptions</h3>
                <div className="space-y-3">
                  {activeSubscriptions.slice(0, 3).map((sub) => {
                    const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost :
                                        sub.billing_cycle === 'quarterly' ? sub.cost / 3 :
                                        sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost

                    return (
                      <div key={sub.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">
                            {sub.service?.name || sub.custom_service_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ₹{monthlyCost.toFixed(0)}/month
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          sub.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {activeSubscriptions.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => router.push('/dashboard/subscriptions')}
                  >
                    View All Subscriptions
                  </Button>
                )}
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Spending</span>
                  <span className="font-bold text-foreground">₹{totalMonthlySpend.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Potential Savings</span>
                  <span className="font-bold text-green-600">₹{(totalSavings?.monthly || 0).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Services</span>
                  <span className="font-bold text-foreground">{activeSubscriptions.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
