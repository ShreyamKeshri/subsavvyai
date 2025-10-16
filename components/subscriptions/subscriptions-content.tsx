'use client'

/**
 * Subscriptions Content Component
 * Full subscriptions management page based on Vercel design
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { getUserSubscriptions, deleteSubscription, type Subscription } from '@/lib/subscriptions/subscription-actions'
import { getAllUserUsageData, type ServiceUsage } from '@/lib/usage/usage-actions'
import { AddSubscriptionDialog } from '@/components/subscriptions/add-subscription-dialog'
import { EditSubscriptionDialog } from '@/components/subscriptions/edit-subscription-dialog'
import { UsageSurveyDialog } from '@/components/usage/usage-survey-dialog'
import { toast } from 'sonner'

export function SubscriptionsContent() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [usageData, setUsageData] = useState<ServiceUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [selectedSubscriptionForEdit, setSelectedSubscriptionForEdit] = useState<Subscription | null>(null)
  const [selectedSubscriptionForUsage, setSelectedSubscriptionForUsage] = useState<Subscription | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const [subsResult, usageResult] = await Promise.all([
      getUserSubscriptions(),
      getAllUserUsageData(),
    ])

    if (subsResult.success && subsResult.data) {
      setSubscriptions(subsResult.data)
    }
    if (usageResult.success && usageResult.data) {
      setUsageData(usageResult.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

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

  // Get unique categories from subscriptions
  const categories = ['all', ...new Set(
    subscriptions
      .map(s => s.service?.category)
      .filter((c): c is string => !!c)
  )]

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const filteredSubscriptions = selectedFilter === 'all'
    ? activeSubscriptions
    : activeSubscriptions.filter(s => s.service?.category === selectedFilter)

  const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => {
    const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost :
                        sub.billing_cycle === 'quarterly' ? sub.cost / 3 :
                        sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
    return sum + monthlyCost
  }, 0)

  const withoutUsageData = activeSubscriptions.filter(s => !hasUsageData(s.id)).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Manage all your active subscriptions</p>
        </div>
        <AddSubscriptionDialog onSuccess={fetchData}>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
        </AddSubscriptionDialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Spending</p>
          <p className="text-2xl font-bold text-foreground">₹{totalMonthlySpend.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">per month</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Active Subscriptions</p>
          <p className="text-2xl font-bold text-foreground">{activeSubscriptions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">services</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Missing Usage Data</p>
          <p className="text-2xl font-bold text-orange-500">{withoutUsageData}</p>
          <p className="text-xs text-muted-foreground mt-1">need attention</p>
        </Card>
      </div>

      {/* Filters */}
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedFilter(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === category ? 'bg-blue-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map((sub) => {
            const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost :
                                sub.billing_cycle === 'quarterly' ? sub.cost / 3 :
                                sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
            const needsUsageData = !hasUsageData(sub.id)

            return (
              <Card key={sub.id} className="p-6 relative">
                {needsUsageData && (
                  <div className="absolute top-4 right-4 bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  </div>
                )}

                <div className="pr-8">
                  <h3 className="font-semibold text-foreground text-lg">
                    {sub.service?.name || sub.custom_service_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {sub.service?.category || 'Custom'}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cost</span>
                      <span className="font-semibold text-foreground">₹{monthlyCost.toFixed(2)}/mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Billing</span>
                      <span className="text-sm text-foreground capitalize">{sub.billing_cycle}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Next Billing</span>
                      <span className="text-sm text-foreground">
                        {new Date(sub.next_billing_date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {needsUsageData && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 text-xs"
                      onClick={() => setSelectedSubscriptionForUsage(sub)}
                    >
                      Add Usage Data
                    </Button>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedSubscriptionForEdit(sub)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteSubscription(sub.id, sub.service?.name || sub.custom_service_name || 'subscription')}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-foreground font-semibold">No subscriptions yet</p>
            <p className="text-muted-foreground mt-1">Start tracking to unlock AI-powered savings</p>
          </div>
        )}
      </div>

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

      {/* Usage Survey Dialog */}
      {selectedSubscriptionForUsage && (
        <UsageSurveyDialog
          subscription={selectedSubscriptionForUsage}
          open={!!selectedSubscriptionForUsage}
          onOpenChange={(open) => {
            if (!open) setSelectedSubscriptionForUsage(null)
          }}
          onSuccess={() => {
            setSelectedSubscriptionForUsage(null)
            toast.success('Usage data saved!')
            fetchData()
          }}
        />
      )}
    </div>
  )
}
