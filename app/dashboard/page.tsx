'use client'

/**
 * Dashboard Page - Neo-Minimalist Design
 * Main landing page after successful authentication
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/lib/auth/auth-helpers'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2, LogOut, Package, Bell, CreditCard, TrendingUp } from 'lucide-react'
import { AddSubscriptionDialog } from '@/components/subscriptions/add-subscription-dialog'
import { SubscriptionsList } from '@/components/subscriptions/subscriptions-list'
import { getUserSubscriptions, type Subscription } from '@/lib/subscriptions/subscription-actions'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions()
    }
  }, [isAuthenticated])

  const handleSignOut = async () => {
    await auth.signOut()
    router.push('/login')
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

  if (loading) {
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Unsubscribr</h1>
                <p className="text-xs text-gray-500">Manage your subscriptions</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="h-10 border-gray-200 hover:bg-gray-50 rounded-xl font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'}!
          </h2>
          <p className="text-gray-500">
            Here&apos;s an overview of your subscription management dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle>Active Subscriptions</CardTitle>
                  <CardDescription>Total subscriptions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSubscriptions ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{activeSubscriptions.length}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Monthly Spending</CardTitle>
                  <CardDescription>Current month</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSubscriptions ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">₹{totalMonthlySpend.toFixed(2)}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Upcoming Renewals</CardTitle>
                  <CardDescription>Next 7 days</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSubscriptions ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{upcomingRenewals}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Your Subscriptions</h3>
              <p className="text-gray-500 text-sm mt-1">Manage and track all your subscriptions in one place</p>
            </div>
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
          ) : (
            <SubscriptionsList subscriptions={subscriptions} onUpdate={fetchSubscriptions} />
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Track Spending</CardTitle>
              <CardDescription>Monitor your monthly subscription costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-gray-500">
                <TrendingUp className="w-5 h-5" />
                <p className="text-sm">View detailed spending analytics and insights</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Set Reminders</CardTitle>
              <CardDescription>Never miss a renewal date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-gray-500">
                <Bell className="w-5 h-5" />
                <p className="text-sm">Get notified via SMS and email before renewals</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
