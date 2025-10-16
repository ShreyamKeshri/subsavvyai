'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MoreVertical, Pencil, Trash2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSubscription, type Subscription } from '@/lib/subscriptions/subscription-actions'
import { EditSubscriptionDialog } from './edit-subscription-dialog'

interface SubscriptionsListProps {
  subscriptions: Subscription[]
  onUpdate: () => void
}

export function SubscriptionsList({ subscriptions, onUpdate }: SubscriptionsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  const handleDelete = async (subscriptionId: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete ${serviceName}?`)) {
      return
    }

    setDeletingId(subscriptionId)

    try {
      const result = await deleteSubscription(subscriptionId)

      if (result.success) {
        toast.success('Subscription deleted successfully')
        onUpdate()
      } else {
        toast.error(result.error || 'Failed to delete subscription')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setDeletingId(null)
    }
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    }
    // eslint-disable-next-line security/detect-object-injection
    return symbols[currency] || currency
  }

  const getBillingCycleBadge = (cycle: string) => {
    const colors: Record<string, string> = {
      monthly: 'bg-blue-100 text-blue-700',
      quarterly: 'bg-purple-100 text-purple-700',
      yearly: 'bg-green-100 text-green-700',
      custom: 'bg-gray-100 text-gray-700',
    }
    // eslint-disable-next-line security/detect-object-injection
    return colors[cycle] || colors.custom
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-700',
    }
    // eslint-disable-next-line security/detect-object-injection
    return colors[status] || colors.active
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <div className="py-16 text-center space-y-6">
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
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Billing Cycle</TableHead>
              <TableHead>Next Billing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => {
              const serviceName = subscription.service?.name || subscription.custom_service_name || 'Unknown'
              const isDeleting = deletingId === subscription.id

              return (
                <TableRow key={subscription.id} className={isDeleting ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {subscription.service?.logo_url ? (
                        <Image
                          src={subscription.service.logo_url}
                          alt={serviceName}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{serviceName}</div>
                        {subscription.service?.category && (
                          <div className="text-xs text-gray-500">{subscription.service.category}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {getCurrencySymbol(subscription.currency)}{subscription.cost.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBillingCycleBadge(subscription.billing_cycle)}>
                      {subscription.billing_cycle}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(subscription.next_billing_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={isDeleting}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingSubscription(subscription)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(subscription.id, serviceName)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {editingSubscription && (
        <EditSubscriptionDialog
          subscription={editingSubscription}
          open={!!editingSubscription}
          onOpenChange={(open) => !open && setEditingSubscription(null)}
          onSuccess={() => {
            setEditingSubscription(null)
            onUpdate()
          }}
        />
      )}
    </>
  )
}
