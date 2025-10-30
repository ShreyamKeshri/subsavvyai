'use client'

/**
 * Tier Badge Component
 * Shows user's subscription tier
 */

import { Crown, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TierBadgeProps {
  tier: 'free' | 'pro'
  variant?: 'default' | 'outline'
  showIcon?: boolean
  className?: string
}

export function TierBadge({
  tier,
  variant = 'default',
  showIcon = true,
  className = '',
}: TierBadgeProps) {
  if (tier === 'free') {
    return (
      <Badge
        variant={variant}
        className={`gap-1 ${variant === 'default' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300' : ''} ${className}`}
      >
        {showIcon && <Zap className="w-3 h-3" />}
        Free
      </Badge>
    )
  }

  return (
    <Badge
      variant={variant}
      className={`gap-1 ${variant === 'default' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300' : 'border-green-600 text-green-600'} ${className}`}
    >
      {showIcon && <Crown className="w-3 h-3" />}
      Pro
    </Badge>
  )
}
