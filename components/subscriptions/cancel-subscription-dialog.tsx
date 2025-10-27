'use client'

/**
 * Cancel Subscription Dialog
 * Allows users to cancel a subscription with a reason
 */

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cancelSubscription } from '@/lib/savings/savings-actions'
import { CANCELLATION_REASONS, type CancellationReason } from '@/lib/savings/savings-utils'
import type { Subscription } from '@/lib/subscriptions/subscription-actions'

interface CancelSubscriptionDialogProps {
  subscription: Subscription
  isOpen: boolean
  onClose: () => void
}

export function CancelSubscriptionDialog({
  subscription,
  isOpen,
  onClose,
}: CancelSubscriptionDialogProps) {
  const [selectedReason, setSelectedReason] = useState<CancellationReason>('not_using')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const serviceName =
    subscription.service?.name || subscription.custom_service_name || 'this subscription'

  const handleCancel = async () => {
    setIsSubmitting(true)

    const result = await cancelSubscription(subscription.id, selectedReason)

    if (result.success) {
      toast.success(`${serviceName} has been cancelled`)
      onClose()
    } else {
      toast.error(result.error || 'Failed to cancel subscription')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Cancel Subscription
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning message */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Are you sure you want to cancel {serviceName}?
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                This will mark the subscription as cancelled and start tracking your savings.
              </p>
            </div>
          </div>

          {/* Reason selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Why are you cancelling?
            </label>
            <div className="space-y-2">
              {Object.entries(CANCELLATION_REASONS).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={key}
                    checked={selectedReason === key}
                    onChange={(e) => setSelectedReason(e.target.value as CancellationReason)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-300"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-900 dark:text-white">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Info message */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 After cancelling, you can track your savings in the Savings Dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Keep Subscription
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      </div>
    </div>
  )
}
