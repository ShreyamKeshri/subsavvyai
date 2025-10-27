'use client'

/**
 * Cancelled Timeline Component
 * Simplified timeline matching Vercel V0 design
 * Shows cancelled subscriptions with green timeline dots and savings
 */

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatINR, CANCELLATION_REASONS, OPTIMIZATION_LABELS } from '@/lib/savings/savings-utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { CancelledSubscription } from '@/lib/savings/savings-actions'

interface CancelledTimelineProps {
  subscriptions: CancelledSubscription[]
}

export function CancelledTimeline({ subscriptions }: CancelledTimelineProps) {
  const prefersReducedMotion = useReducedMotion()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCancellationReasonLabel = (reason: string) => {
    return CANCELLATION_REASONS[reason as keyof typeof CANCELLATION_REASONS] || reason
  }

  const getOptimizationBadgeColor = (type: string | null) => {
    switch (type) {
      case 'cancel':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
      case 'downgrade':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
      case 'bundle':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400'
    }
  }

  if (subscriptions.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Cancelled Subscriptions</h2>
          <p className="text-sm text-muted-foreground">
            Timeline of services you&apos;ve cancelled and savings achieved
          </p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No cancelled subscriptions yet. Mark subscriptions as cancelled to start tracking your savings.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: 0.4 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Cancelled Subscriptions</h2>
        <p className="text-sm text-muted-foreground">
          Timeline of services you&apos;ve cancelled and savings achieved
        </p>
      </div>

      <div className="space-y-3">
        {subscriptions.map((sub, idx) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.5,
              delay: prefersReducedMotion ? 0 : idx * 0.05,
              ease: 'easeOut',
            }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Timeline Dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
                  {idx < subscriptions.length - 1 && (
                    <div className="w-0.5 h-12 bg-border mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {sub.service?.name || sub.custom_service_name || 'Unknown Service'}
                        </h3>
                        {sub.optimization_type && (
                          <Badge className={`text-xs ${getOptimizationBadgeColor(sub.optimization_type)}`}>
                            {OPTIMIZATION_LABELS[sub.optimization_type as keyof typeof OPTIMIZATION_LABELS]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {sub.optimization_date ? formatDate(sub.optimization_date) : formatDate(sub.cancelled_at)}
                      </p>
                      {sub.cancellation_reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {getCancellationReasonLabel(sub.cancellation_reason)}
                        </p>
                      )}
                      {sub.optimization_notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {sub.optimization_notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-500">
                        {formatINR(sub.monthly_savings || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
