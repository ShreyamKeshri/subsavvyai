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
import { Plus, Loader2, Edit2, Trash2, Mail } from 'lucide-react'
import { getUserSubscriptions, deleteSubscription, type Subscription } from '@/lib/subscriptions/subscription-actions'
import { getPendingRecommendations, dismissRecommendation, generateRecommendations, type OptimizationRecommendation } from '@/lib/recommendations/recommendation-actions'
import { getConnectedServices, getAllUserUsageData, type ServiceUsage } from '@/lib/usage/usage-actions'
import { AddSubscriptionDialog } from '@/components/subscriptions/add-subscription-dialog'
import { EditSubscriptionDialog } from '@/components/subscriptions/edit-subscription-dialog'
import { BundleRecommendationsList } from '@/components/bundles/bundle-recommendations-list'
import { UsageSurveyDialog } from '@/components/usage/usage-survey-dialog'
import { GmailScanDialog } from '@/components/gmail/gmail-scan-dialog'
import { isGmailConnected } from '@/lib/gmail/import-actions'
import { toast } from 'sonner'
import { trackDashboardViewed, trackSessionStarted } from '@/lib/analytics/events'
import { getSessionMetadata } from '@/lib/analytics/utils'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [totalSavings, setTotalSavings] = useState<{ monthly: number; annual: number } | null>(null)
  const [connectedServices, setConnectedServices] = useState<string[]>([])
  const [usageData, setUsageData] = useState<ServiceUsage[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showChecklist, setShowChecklist] = useState(true)
  const [selectedSubscriptionForUsage, setSelectedSubscriptionForUsage] = useState<Subscription | null>(null)
  const [selectedSubscriptionForEdit, setSelectedSubscriptionForEdit] = useState<Subscription | null>(null)
  const [showGmailScanDialog, setShowGmailScanDialog] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  const fetchData = async () => {
    setLoadingData(true)

    // Fetch all data in parallel
    const [subsResult, recsResult, servicesResult, usageResult, gmailResult] = await Promise.all([
      getUserSubscriptions(),
      getPendingRecommendations(),
      getConnectedServices(),
      getAllUserUsageData(),
      isGmailConnected(),
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

    if (usageResult.success && usageResult.data) {
      setUsageData(usageResult.data)
    }

    if (gmailResult.success) {
      setGmailConnected(gmailResult.connected)
    }

    setLoadingData(false)
  }

  // Track session start (engagement metrics)
  useEffect(() => {
    if (isAuthenticated && user) {
      const sessionMetadata = getSessionMetadata()
      if (sessionMetadata) {
        trackSessionStarted(user.id, sessionMetadata)
      }

      // Track dashboard view
      trackDashboardViewed()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated) {
      const initializeData = async () => {
        await fetchData()

        // Auto-generate recommendations if none exist and user has usage data
        const recsResult = await getPendingRecommendations()
        if (recsResult.success && (!recsResult.data || recsResult.data.length === 0)) {
          // Silently generate in the background
          generateRecommendations()
            .then(genResult => {
              if (genResult.success && genResult.data && genResult.data.length > 0) {
                // Reload recommendations after generation
                fetchData()
              }
            })
            .catch(error => {
              console.error('Failed to auto-generate recommendations on mount:', error)
            })
        }
      }

      initializeData()
    }
  }, [isAuthenticated])

  const handleDismissRecommendation = async (id: string) => {
    const result = await dismissRecommendation(id)
    if (result.success) {
      toast.info('Recommendation dismissed')
      fetchData()
    }
  }

  // Check if a subscription has usage data
  const hasUsageData = (subscriptionId: string) => {
    return usageData.some(usage => usage.subscription_id === subscriptionId)
  }

  const handleDeleteSubscription = (subscriptionId: string, subscriptionName: string) => {
    toast.warning(`Delete "${subscriptionName}"?`, {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          const result = await deleteSubscription(subscriptionId)
          if (result.success) {
            toast.success('Subscription deleted successfully')
            fetchData()
          } else {
            toast.error(result.error || 'Failed to delete subscription')
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          toast.info('Deletion cancelled')
        },
      },
      duration: 10000,
    })
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
      id: 'connect_gmail',
      title: 'Connect Gmail for auto-detection',
      description: 'Find subscriptions automatically from your inbox',
      completed: gmailConnected,
      action: () => router.push('/api/gmail/connect')
    },
    {
      id: 'scan_gmail',
      title: 'Scan your first subscriptions',
      description: 'Auto-detect subscriptions from last 90 days',
      completed: false, // TODO: Track if user has scanned before
      action: () => setShowGmailScanDialog(true)
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
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              onView={(_id) => {
                toast.info('View recommendation details')
                // TODO: Open recommendation details modal
              }}
              hasSubscriptions={activeSubscriptions.length > 0}
              hasConnectedServices={connectedServices.length > 0}
              onAddSubscription={() => {
                const addButton = document.querySelector('[data-add-subscription]') as HTMLButtonElement
                addButton?.click()
              }}
              onConnectService={() => router.push('/api/oauth/spotify/connect')}
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

              {/* Gmail Scan Button (if connected) */}
              {gmailConnected && (
                <Button
                  data-scan-gmail
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  onClick={() => setShowGmailScanDialog(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Scan Gmail
                </Button>
              )}

              {/* Connect Gmail (if not connected) */}
              {!gmailConnected && (
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  onClick={() => router.push('/api/gmail/connect')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Connect Gmail
                </Button>
              )}

              {/* Manual Add */}
              <AddSubscriptionDialog onSuccess={fetchData}>
                <Button
                  data-add-subscription
                  variant="outline"
                  className={`w-full ${gmailConnected ? 'mt-3' : 'mt-3'}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manually
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
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Subscriptions</h3>
              {activeSubscriptions.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {activeSubscriptions.slice(0, 3).map((sub) => {
                      const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost :
                                          sub.billing_cycle === 'quarterly' ? sub.cost / 3 :
                                          sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
                      const needsUsageData = !hasUsageData(sub.id)

                      return (
                        <div key={sub.id} className="relative">
                          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-sm text-foreground">
                                  {sub.service?.name || sub.custom_service_name}
                                </p>
                                {needsUsageData && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    Track usage
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-1 rounded ${
                                  sub.status === 'active'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                  {sub.status}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                ₹{monthlyCost.toFixed(2)}/month
                                {sub.original_currency && sub.original_currency !== 'INR' && (
                                  <span className="text-[10px] ml-1 opacity-70">
                                    (was {sub.original_currency} {sub.original_cost?.toFixed(2)})
                                  </span>
                                )}
                              </p>
                              {needsUsageData && (
                                <button
                                  onClick={() => setSelectedSubscriptionForUsage(sub)}
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 block"
                                >
                                  Add usage data
                                </button>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => setSelectedSubscriptionForEdit(sub)}
                                className="p-1 hover:bg-background rounded transition-colors"
                                title="Edit subscription"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubscription(sub.id, sub.service?.name || sub.custom_service_name || 'subscription')}
                                className="p-1 hover:bg-background rounded transition-colors"
                                title="Delete subscription"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          </div>
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
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No subscriptions yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start tracking to unlock savings
                  </p>
                </div>
              )}
            </Card>

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

      {/* Usage Survey Dialog */}
      {selectedSubscriptionForUsage && (
        <UsageSurveyDialog
          subscription={selectedSubscriptionForUsage}
          open={!!selectedSubscriptionForUsage}
          onOpenChange={(open) => {
            if (!open) setSelectedSubscriptionForUsage(null)
          }}
          onSuccess={() => {
            toast.success('Usage data saved!')
            fetchData()
          }}
        />
      )}

      {/* Edit Subscription Dialog */}
      {selectedSubscriptionForEdit && (
        <EditSubscriptionDialog
          subscription={selectedSubscriptionForEdit}
          open={!!selectedSubscriptionForEdit}
          onOpenChange={(open) => {
            if (!open) setSelectedSubscriptionForEdit(null)
          }}
          onSuccess={() => {
            setSelectedSubscriptionForEdit(null)
            fetchData()
          }}
        />
      )}

      {/* Gmail Scan Dialog */}
      <GmailScanDialog
        open={showGmailScanDialog}
        onOpenChange={setShowGmailScanDialog}
        onSuccess={() => {
          fetchData()
        }}
      />
    </DashboardLayout>
  )
}
