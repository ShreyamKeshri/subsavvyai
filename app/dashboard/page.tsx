'use client'

/**
 * Dashboard Page - Neo-Minimalist Design
 * Main landing page after successful authentication
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/lib/auth/auth-helpers'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2, LogOut, Package, Bell, CreditCard, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  const handleSignOut = async () => {
    await auth.signOut()
    router.push('/login')
  }

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
            Here's an overview of your subscription management dashboard
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
              <p className="text-3xl font-bold text-gray-900">0</p>
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
              <p className="text-3xl font-bold text-gray-900">₹0</p>
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
              <p className="text-3xl font-bold text-gray-900">0</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Package className="w-10 h-10 text-indigo-600" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No subscriptions yet
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Start by adding your first subscription to track renewals, manage payments, and optimize your spending
                </p>
              </div>

              <Button className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 px-8">
                <Package className="w-5 h-5 mr-2" />
                Add Your First Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

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
