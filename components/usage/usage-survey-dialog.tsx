'use client'

/**
 * Usage Survey Dialog
 * Collects manual usage data for non-OAuth subscriptions
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { saveManualUsage, type UsageFrequency } from '@/lib/usage/manual-usage-actions'

interface Subscription {
  id: string
  service_id: string | null
  custom_service_name: string | null
  services?: {
    id: string
    name: string
    category: string
  } | null
}

interface UsageSurveyDialogProps {
  subscription: Subscription
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const FREQUENCY_OPTIONS: Array<{
  value: UsageFrequency
  label: string
  description: string
}> = [
  { value: 'daily', label: 'Daily', description: 'I use this almost every day' },
  { value: 'weekly', label: 'Weekly', description: 'I use this a few times per week' },
  { value: 'monthly', label: 'Monthly', description: 'I use this once or twice a month' },
  { value: 'rarely', label: 'Rarely', description: 'I barely use this anymore' },
  { value: 'never', label: 'Never', description: "I haven't used this in months" },
]

export function UsageSurveyDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: UsageSurveyDialogProps) {
  const [frequency, setFrequency] = React.useState<UsageFrequency>('weekly')
  const [lastUsedDate, setLastUsedDate] = React.useState<Date | undefined>(new Date())
  const [note, setNote] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  const serviceName = subscription.services?.name || subscription.custom_service_name || 'this service'

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const result = await saveManualUsage({
        subscription_id: subscription.id,
        usage_frequency: frequency,
        last_used_date: lastUsedDate ? format(lastUsedDate, 'yyyy-MM-dd') : null,
        manual_usage_note: note.trim() || undefined,
      })

      if (result.success) {
        toast.success('Usage data saved successfully!')
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast.error(result.error || 'Failed to save usage data')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>How often do you use {serviceName}?</DialogTitle>
          <DialogDescription>
            Help us understand your usage to provide smart recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Frequency Selection */}
          <div className="space-y-3">
            <Label>Usage Frequency</Label>
            <RadioGroup value={frequency} onValueChange={(value) => setFrequency(value as UsageFrequency)}>
              {FREQUENCY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Last Used Date */}
          {frequency !== 'never' && (
            <div className="space-y-2">
              <Label>When did you last use it?</Label>
              <Popover modal={true} open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {lastUsedDate ? format(lastUsedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="center"
                  side="bottom"
                  sideOffset={4}
                  avoidCollisions={false}
                >
                  <Calendar
                    mode="single"
                    selected={lastUsedDate}
                    onSelect={(date) => {
                      setLastUsedDate(date)
                      setCalendarOpen(false)
                    }}
                    disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Optional Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Notes (optional)</Label>
            <Textarea
              id="note"
              placeholder="Any additional details about your usage..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Usage Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
