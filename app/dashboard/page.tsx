'use client'

/**
 * Dashboard Page - V0 Design with Backend Integration
 * Combines v0's beautiful UI with our AI recommendation engine
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/lib/auth/auth-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  TrendingUp,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Loader2,
  BarChart3,
  Shield,
  Zap,
  Settings,
  Package,
} from 'lucide-react'
import { getUserSubscriptions, type Subscription } from '@/lib/subscriptions/subscription-actions'
import { getPendingRecommendations, acceptRecommendation, dismissRecommendation, type OptimizationRecommendation } from '@/lib/recommendations/recommendation-actions'
import { getConnectedServices } from '@/lib/usage/usage-actions'
import { AddSubscriptionDialog } from '@/components/subscriptions/add-subscription-dialog'
import { BundleRecommendationsList } from '@/components/bundles/bundle-recommendations-list'
import { branding } from '@/lib/config/branding'
import { toast } from 'sonner'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [totalSavings, setTotalSavings] = useState<{ monthly: number; annual: number } | null>(null)
  const [connectedServices, setConnectedServices] = useState<string[]>([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  const fetchSubscriptions = async () => {
    setLoadingSubscriptions(true)
    const result = await getUserSubscriptions()
    if (result.success && result.data) {
      setSubscriptions(result.data)
    }
    setLoadingSubscriptions(false)
  }

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true)
    const result = await getPendingRecommendations()
    if (result.success && result.data) {
      setRecommendations(result.data)
      setTotalSavings(result.totalSavings || null)
    }
    setLoadingRecommendations(false)
  }

  const fetchConnectedServices = async () => {
    const result = await getConnectedServices()
    if (result.success && result.data) {
      setConnectedServices(result.data)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions()
      fetchRecommendations()
      fetchConnectedServices()
    }
  }, [isAuthenticated])

  const handleSignOut = async () => {
    await auth.signOut()
    router.push('/login')
  }

  const handleAcceptRecommendation = async (id: string) => {
    const rec = recommendations.find((r) => r.id === id)
    if (rec) {
      const result = await acceptRecommendation(id)
      if (result.success) {
        toast.success(`Accepted: ${rec.title}`, {
          description: `You'll save ₹${rec.monthly_savings}/month`,
        })
        fetchRecommendations()
      }
    }
  }

  const handleDismissRecommendation = async (id: string) => {
    const result = await dismissRecommendation(id)
    if (result.success) {
      toast.info('Recommendation dismissed')
      fetchRecommendations()
    }
  }

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'downgrade':
        return 'border-l-blue-500'
      case 'cancel':
        return 'border-l-red-500'
      case 'bundle':
        return 'border-l-purple-500'
      default:
        return 'border-l-gray-300'
    }
  }

  const getRecommendationBadge = (type: string) => {
    switch (type) {
      case 'downgrade':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Downgrade
          </Badge>
        )
      case 'cancel':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancel
          </Badge>
        )
      case 'bundle':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Bundle
          </Badge>
        )
      default:
        return null
    }
  }

  // Calculate stats
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => {
    const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost :
                        sub.billing_cycle === 'quarterly' ? sub.cost / 3 :
                        sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
    return sum + monthlyCost
  }, 0)

  const upcomingRenewals = activeSubscriptions.filter(sub => {
    const nextDate = new Date(sub.next_billing_date)
    const today = new Date()
    const diffTime = nextDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  }).length

  if (loading || loadingSubscriptions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-icon.png" alt={branding.name} width={48} height={48} className="rounded-xl" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{branding.name}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">{branding.taglines.ai}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Stats Section */}
        <section className="space-y-4">
          {/* Total Potential Savings Hero Card - ALWAYS SHOW */}
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-medium opacity-90">Total Potential Savings</span>
                  </div>
                  {totalSavings && totalSavings.annual > 0 ? (
                    <>
                      <h2 className="text-4xl md:text-5xl font-extrabold mb-2">
                        ₹{totalSavings.annual.toFixed(0)}/year
                      </h2>
                      <p className="text-sm opacity-90">
                        Save ₹{totalSavings.monthly.toFixed(0)}/month with our AI recommendations
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-4xl md:text-5xl font-extrabold mb-2">
                        Find Your Savings
                      </h2>
                      <p className="text-sm opacity-90">
                        Connect services below to discover how much you can save
                      </p>
                    </>
                  )}
                </div>
                <div className="hidden md:block">
                  <BarChart3 className="h-16 w-16 opacity-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3 Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-indigo-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Active Subscriptions</span>
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-4xl font-extrabold text-gray-900">{activeSubscriptions.length}</p>
                <p className="text-xs text-gray-500 mt-1">₹{totalMonthlySpend.toFixed(0)}/month total</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Monthly Spending</span>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-4xl font-extrabold text-gray-900">₹{totalMonthlySpend.toFixed(0)}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3" />
                  Track your spending
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Upcoming Renewals</span>
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-4xl font-extrabold text-gray-900">{upcomingRenewals}</p>
                <p className="text-xs text-gray-500 mt-1">In next 7 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Action CTAs - Connect Services & Find Savings */}
          {(!connectedServices.length || activeSubscriptions.length < 2) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Connect Spotify CTA */}
              {connectedServices.length === 0 && (
                <Card className="border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:border-indigo-400 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <Sparkles className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Connect Spotify</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          See if you&apos;re overpaying. Find up to ₹1,428/year in savings based on your listening habits.
                        </p>
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => router.push('/api/oauth/spotify')}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Connect Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Find Bundle Savings CTA */}
              {activeSubscriptions.length >= 2 && (
                <Card className="border-2 border-dashed border-green-300 bg-green-50/50 hover:border-green-400 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Find Bundle Savings</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          You have {activeSubscriptions.length} subscriptions. Check if bundling can save you money!
                        </p>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            const bundleSection = document.getElementById('bundle-section')
                            bundleSection?.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Check Bundles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </section>

        {/* AI Recommendations Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="h-6 w-6 text-indigo-600" />
                AI-Powered Savings Opportunities
              </h2>
              <p className="text-sm text-gray-600 mt-1">Based on your usage patterns and spending behavior</p>
            </div>
            {totalSavings && totalSavings.monthly > 0 && (
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-green-100 text-green-700">
                ₹{totalSavings.monthly.toFixed(0)}/mo potential savings
              </Badge>
            )}
          </div>

          {loadingRecommendations ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
              </CardContent>
            </Card>
          ) : recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All optimized!</h3>
                <p className="text-sm text-gray-600">
                  No recommendations at the moment. Connect services and sync usage to get AI-powered insights.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className={`border-l-4 ${getRecommendationColor(rec.type)} hover:shadow-lg transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                      </div>
                      {getRecommendationBadge(rec.type)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{rec.description}</p>

                    {/* Savings Highlight */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">Monthly Savings</span>
                        <span className="text-2xl font-bold text-green-700 flex items-center gap-1">
                          <ArrowUpRight className="h-5 w-5" />₹{rec.monthly_savings.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Annual Savings</span>
                        <span className="text-sm font-semibold text-green-700">₹{rec.annual_savings.toFixed(0)}</span>
                      </div>
                    </div>

                    {/* Cost Comparison */}
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current</p>
                        <p className="font-semibold">₹{rec.current_cost}</p>
                      </div>
                      <ArrowDownRight className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Optimized</p>
                        <p className="font-semibold text-green-600">₹{rec.optimized_cost}</p>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">AI Confidence</span>
                        <span className="font-medium">{Math.round(rec.confidence_score * 100)}%</span>
                      </div>
                      <Progress value={rec.confidence_score * 100} className="h-2" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAcceptRecommendation(rec.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDismissRecommendation(rec.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Bundle Optimizer Section */}
        {activeSubscriptions.length >= 2 && (
          <section id="bundle-section" className="space-y-4">
            <BundleRecommendationsList />
          </section>
        )}

        {/* Subscriptions Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Subscriptions</h2>
            <AddSubscriptionDialog onSuccess={fetchSubscriptions} />
          </div>

          {loadingSubscriptions ? (
            <Card>
              <CardContent className="py-16">
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          ) : subscriptions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Add your first subscription to start tracking and optimizing
                </p>
                <AddSubscriptionDialog onSuccess={fetchSubscriptions} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map((sub) => {
                const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost :
                                    sub.billing_cycle === 'quarterly' ? sub.cost / 3 :
                                    sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost

                return (
                  <Card key={sub.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{sub.service?.name || sub.custom_service_name}</h3>
                          <div className="mt-2">
                            <p className="text-3xl font-extrabold text-gray-900">₹{monthlyCost.toFixed(0)}</p>
                            <p className="text-xs text-gray-500">/month</p>
                          </div>
                          {sub.billing_cycle !== 'monthly' && (
                            <p className="text-xs text-gray-500 mt-1">
                              ₹{sub.cost} billed {sub.billing_cycle}
                            </p>
                          )}
                        </div>
                        <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                          {sub.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Next billing</span>
                          <span className="font-medium">{new Date(sub.next_billing_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            // TODO: Add edit functionality
                            toast.info('Edit subscription coming soon!')
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            // TODO: Add delete confirmation
                            toast.info('Delete confirmation coming soon!')
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
