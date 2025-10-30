'use client'

/**
 * Paywall Banner Component
 * Shows upgrade banner on premium features
 */

import { Crown, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface PaywallBannerProps {
  feature: string
  description?: string
  className?: string
}

export function PaywallBanner({
  feature,
  description = 'This feature is available for Pro users only.',
  className = '',
}: PaywallBannerProps) {
  const router = useRouter()

  return (
    <Card className={`p-6 border-2 border-green-600 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-slate-900 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Crown className="w-6 h-6 text-green-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {feature} is a Pro Feature
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3 h-3 text-green-600" />
              <span>Unlimited subscriptions</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3 h-3 text-green-600" />
              <span>AI recommendations</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3 h-3 text-green-600" />
              <span>Bundle optimizer</span>
            </div>
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => router.push('/upgrade')}
          >
            Upgrade to Pro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
