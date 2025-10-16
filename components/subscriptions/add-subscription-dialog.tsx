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
  DialogTrigger,
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
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  createSubscription,
  getServices,
  calculateNextBillingDate,
  type BillingCycle,
  type CreateSubscriptionInput
} from '@/lib/subscriptions/subscription-actions'

const subscriptionSchema = z.object({
  serviceType: z.enum(['existing', 'custom']),
  service_id: z.string().optional(),
  custom_service_name: z.string().optional(),
  cost: z.string().min(1, 'Cost is required'),
  currency: z.string(),
  billing_cycle: z.enum(['monthly', 'quarterly', 'yearly', 'custom']),
  billing_date: z.string().min(1, 'Billing date is required'),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.serviceType === 'existing' && !data.service_id) {
    return false
  }
  if (data.serviceType === 'custom' && !data.custom_service_name) {
    return false
  }
  return true
}, {
  message: 'Please select a service or enter a custom name',
  path: ['service_id']
})

type FormData = z.infer<typeof subscriptionSchema>

interface Service {
  id: string
  name: string
  category: string
  logo_url: string | null
}

interface AddSubscriptionDialogProps {
  onSuccess?: () => void
  children?: React.ReactNode
}

export function AddSubscriptionDialog({ onSuccess, children }: AddSubscriptionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(true)

  const form = useForm<FormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      serviceType: 'existing',
      currency: 'INR',
      billing_cycle: 'monthly',
      billing_date: new Date().toISOString().split('T')[0],
    },
  })

  const serviceType = form.watch('serviceType')

  useEffect(() => {
    const fetchServices = async () => {
      const result = await getServices()
      if (result.success && result.data) {
        setServices(result.data)
      }
      setLoadingServices(false)
    }

    fetchServices()
  }, [])

  const handleSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const input: CreateSubscriptionInput = {
        cost: parseFloat(data.cost),
        currency: data.currency,
        billing_cycle: data.billing_cycle as BillingCycle,
        billing_date: data.billing_date,
        next_billing_date: await calculateNextBillingDate(data.billing_date, data.billing_cycle as BillingCycle),
        notes: data.notes
      }

      if (data.serviceType === 'existing' && data.service_id) {
        input.service_id = data.service_id
      } else if (data.serviceType === 'custom' && data.custom_service_name) {
        input.custom_service_name = data.custom_service_name
      }

      const result = await createSubscription(input)

      if (result.success) {
        toast.success('Subscription added successfully!')
        form.reset()
        setOpen(false)
        onSuccess?.()
      } else {
        toast.error(result.error || 'Failed to add subscription')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 px-8">
            <Plus className="w-5 h-5 mr-2" />
            Add Subscription
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
          <DialogDescription>
            Track a new subscription to manage renewals and spending
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
          {/* Service Type Selection */}
          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select
              value={form.watch('serviceType')}
              onValueChange={(value) => form.setValue('serviceType', value as 'existing' | 'custom')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="existing">Popular Service</SelectItem>
                <SelectItem value="custom">Custom Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service Selection or Custom Name */}
          {serviceType === 'existing' ? (
            <div className="space-y-2">
              <Label htmlFor="service">Select Service</Label>
              {loadingServices ? (
                <div className="h-10 flex items-center justify-center border rounded-xl">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : (
                <Select
                  value={form.watch('service_id')}
                  onValueChange={(value) => form.setValue('service_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} <span className="text-xs text-gray-500">({service.category})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.service_id && (
                <p className="text-sm text-destructive">{form.formState.errors.service_id.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="custom_service_name">Service Name</Label>
              <Input
                id="custom_service_name"
                placeholder="e.g., My Gym Membership"
                {...form.register('custom_service_name')}
              />
              {form.formState.errors.custom_service_name && (
                <p className="text-sm text-destructive">{form.formState.errors.custom_service_name.message}</p>
              )}
            </div>
          )}

          {/* Cost */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="1"
                min="0"
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
            <Label htmlFor="billing_date">Last/Current Billing Date</Label>
            <Input
              id="billing_date"
              type="date"
              {...form.register('billing_date')}
            />
            <p className="text-xs text-gray-500">
              Enter the date you were last charged (or will be charged if it&apos;s a new subscription). The next renewal will be calculated automatically.
            </p>
            {form.formState.errors.billing_date && (
              <p className="text-sm text-destructive">{form.formState.errors.billing_date.message}</p>
            )}
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
              onClick={() => setOpen(false)}
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
                  Adding...
                </>
              ) : (
                'Add Subscription'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
