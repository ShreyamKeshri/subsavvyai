'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  updateSubscription,
  calculateNextBillingDate,
  type Subscription,
  type BillingCycle,
  type SubscriptionStatus,
  type UpdateSubscriptionInput
} from '@/lib/subscriptions/subscription-actions'

const updateSchema = z.object({
  cost: z.string().min(1, 'Cost is required'),
  currency: z.string(),
  billing_cycle: z.enum(['monthly', 'quarterly', 'yearly', 'custom']),
  billing_date: z.string().min(1, 'Billing date is required'),
  status: z.enum(['active', 'paused', 'cancelled', 'cancellation_initiated', 'expired']),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof updateSchema>

interface EditSubscriptionDialogProps {
  subscription: Subscription
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditSubscriptionDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess
}: EditSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      cost: subscription.cost.toString(),
      currency: subscription.currency,
      billing_cycle: subscription.billing_cycle,
      billing_date: subscription.next_billing_date,
      status: subscription.status,
      notes: subscription.notes || '',
    },
  })

  // Reset form when subscription changes
  useEffect(() => {
    form.reset({
      cost: subscription.cost.toString(),
      currency: subscription.currency,
      billing_cycle: subscription.billing_cycle,
      billing_date: subscription.next_billing_date,
      status: subscription.status,
      notes: subscription.notes || '',
    })
  }, [subscription, form])

  const handleSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const input: UpdateSubscriptionInput = {
        cost: parseFloat(data.cost),
        currency: data.currency,
        billing_cycle: data.billing_cycle as BillingCycle,
        billing_date: data.billing_date,
        next_billing_date: calculateNextBillingDate(data.billing_date, data.billing_cycle as BillingCycle),
        status: data.status as SubscriptionStatus,
        notes: data.notes
      }

      const result = await updateSubscription(subscription.id, input)

      if (result.success) {
        toast.success('Subscription updated successfully!')
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to update subscription')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const serviceName = subscription.service?.name || subscription.custom_service_name || 'Subscription'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit {serviceName}</DialogTitle>
          <DialogDescription>
            Update subscription details and billing information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
          {/* Cost */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register('cost')}
              />
              {form.formState.errors.cost && (
                <p className="text-sm text-destructive">{form.formState.errors.cost.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={form.watch('currency')}
                onValueChange={(value) => form.setValue('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ INR</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                  <SelectItem value="GBP">£ GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Billing Cycle */}
          <div className="space-y-2">
            <Label>Billing Cycle</Label>
            <Select
              value={form.watch('billing_cycle')}
              onValueChange={(value) => form.setValue('billing_cycle', value as BillingCycle)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Billing Date */}
          <div className="space-y-2">
            <Label htmlFor="billing_date">Next Billing Date</Label>
            <Input
              id="billing_date"
              type="date"
              {...form.register('billing_date')}
            />
            {form.formState.errors.billing_date && (
              <p className="text-sm text-destructive">{form.formState.errors.billing_date.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value as SubscriptionStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Add any notes about this subscription"
              {...form.register('notes')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
