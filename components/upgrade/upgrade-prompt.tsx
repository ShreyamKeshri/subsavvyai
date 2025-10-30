'use client'

/**
 * Upgrade Prompt Component
 * Shows upgrade modal when users hit subscription limits
 */

import { useState } from 'react'
import { Sparkles, Zap, Crown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

interface UpgradePromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: 'subscription_limit' | 'feature_locked' | 'trial_ended'
  title?: string
  description?: string
}

const triggerContent = {
  subscription_limit: {
    icon: Crown,
    title: "You've reached your subscription limit",
    description: 'Free users can track up to 5 subscriptions. Upgrade to Pro for unlimited subscriptions and AI-powered savings recommendations.',
    benefits: [
      'Unlimited subscriptions',
      'AI-powered smart recommendations',
      'Bundle optimizer',
      'Cancellation guides with UPI steps',
    ],
  },
  feature_locked: {
    icon: Sparkles,
    title: 'Unlock Pro features',
    description: 'This feature is available for Pro users. Upgrade now to access AI recommendations, bundle optimizer, and more.',
    benefits: [
      'AI-powered smart recommendations',
      'Advanced analytics & insights',
      'Bundle optimizer (telecom/OTT)',
      'Priority email support',
    ],
  },
  trial_ended: {
    icon: Zap,
    title: 'Your trial has ended',
    description: "Continue enjoying all Pro features for just ₹99/month or ₹999/year. You've already saved money with our AI recommendations!",
    benefits: [
      'Unlimited subscriptions',
      'AI-powered recommendations',
      'Save ₹10,000+/year',
      '7-day money-back guarantee',
    ],
  },
}

export function UpgradePrompt({
  open,
  onOpenChange,
  trigger = 'subscription_limit',
  title,
  description,
}: UpgradePromptProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  // Get content based on trigger type (safe object access)
  let content = triggerContent.subscription_limit
  if (trigger === 'feature_locked') {
    content = triggerContent.feature_locked
  } else if (trigger === 'trial_ended') {
    content = triggerContent.trial_ended
  }

  const Icon = content.icon

  const handleUpgrade = () => {
    setIsNavigating(true)
    router.push('/upgrade')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20">
            <Icon className="w-6 h-6 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            {title || content.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description || content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3 text-slate-900 dark:text-white">
              Pro features include:
            </h3>
            <ul className="space-y-2">
              {content.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-green-600">₹99/month</span>
            <span>or</span>
            <span className="font-semibold text-green-600">₹999/year</span>
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
              Save 16%
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isNavigating}
          >
            Maybe Later
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleUpgrade}
            disabled={isNavigating}
          >
            {isNavigating ? (
              'Redirecting...'
            ) : (
              <>
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          7-day free trial • Cancel anytime
        </p>
      </DialogContent>
    </Dialog>
  )
}
