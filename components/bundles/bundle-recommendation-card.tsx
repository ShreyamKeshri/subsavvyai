'use client'

import { useState } from 'react'
import { ExternalLink, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  dismissBundleRecommendation,
  trackBundleClick,
} from '@/lib/bundles/bundle-actions'
import type { BundleRecommendation } from '@/lib/bundles/bundle-actions'

interface BundleRecommendationCardProps {
  recommendation: BundleRecommendation
  onDismiss?: () => void
}

export function BundleRecommendationCard({
  recommendation,
  onDismiss,
}: BundleRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const bundle = recommendation.bundle
  if (!bundle) return null

  const handleViewBundle = async () => {
    await trackBundleClick(bundle.id, recommendation.id)
    window.open(bundle.official_url || '#', '_blank')
  }

  const handleDismiss = async () => {
    setIsProcessing(true)
    const result = await dismissBundleRecommendation(recommendation.id)

    if (result.success) {
      toast.success('Recommendation dismissed')
      onDismiss?.()
    } else {
      toast.error(result.error || 'Failed to dismiss recommendation')
    }
    setIsProcessing(false)
  }

  // Provider logo/emoji map
  const providerEmoji: Record<string, string> = {
    'Jio': '🔵',
    'Airtel': '🔴',
    'Vi': '🟣',
    'BSNL': '🟢',
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{providerEmoji[bundle.provider] || '📱'}</span>
              <CardTitle className="text-lg">{bundle.plan_name}</CardTitle>
            </div>
            <CardDescription className="text-sm">
              {bundle.provider} • {bundle.plan_type}
            </CardDescription>
          </div>

          {recommendation.confidence_score >= 0.8 && (
            <Badge variant="default" className="bg-green-500">
              Top Match
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Savings Highlight */}
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Monthly Savings
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{Math.round(recommendation.monthly_savings)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Yearly</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                ₹{Math.round(recommendation.annual_savings).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Price Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Cost</p>
            <p className="text-lg font-semibold line-through">
              ₹{Math.round(recommendation.current_monthly_cost)}/mo
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Bundle Cost</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              ₹{Math.round(recommendation.bundle_monthly_cost)}/mo
            </p>
          </div>
        </div>

        {/* Matched Services Preview */}
        <div>
          <p className="text-sm font-medium mb-2">
            Includes {recommendation.matched_subscription_count} of your services:
          </p>
          <div className="flex flex-wrap gap-2">
            {bundle.included_ott_services.slice(0, isExpanded ? undefined : 4).map((service, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                <Check className="w-3 h-3 mr-1" />
                {service}
              </Badge>
            ))}
            {bundle.included_ott_services.length > 4 && !isExpanded && (
              <Badge variant="outline" className="text-xs">
                +{bundle.included_ott_services.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            {/* Data Benefits */}
            {bundle.data_benefits && (
              <div>
                <p className="text-sm font-medium mb-1">Data Benefits</p>
                <p className="text-sm text-muted-foreground">{bundle.data_benefits}</p>
              </div>
            )}

            {/* Other Benefits */}
            {bundle.other_benefits && bundle.other_benefits.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Additional Benefits</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {bundle.other_benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reasoning */}
            <div>
              <p className="text-sm font-medium mb-1">Why we recommend this</p>
              <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
            </div>

            {/* Notes */}
            {bundle.notes && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">{bundle.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Toggle Details Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              View Full Details
            </>
          )}
        </Button>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleViewBundle} className="flex-1" size="lg">
            <ExternalLink className="w-4 h-4 mr-2" />
            Switch to This Bundle
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleDismiss}
            disabled={isProcessing}
            className="px-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Match Info */}
        <p className="text-xs text-center text-muted-foreground">
          {Math.round(recommendation.match_percentage)}% match •{' '}
          {Math.round(recommendation.confidence_score * 100)}% confidence
        </p>
      </CardContent>
    </Card>
  )
}
