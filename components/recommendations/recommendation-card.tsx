'use client'

/**
 * Recommendation Card Component
 * Displays a single optimization recommendation with action buttons
 */

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingDown, X, Check, Sparkles, AlertCircle } from 'lucide-react'
import { acceptRecommendation, dismissRecommendation } from '@/lib/recommendations/recommendation-actions'
import type { OptimizationRecommendation } from '@/lib/recommendations/recommendation-actions'

interface RecommendationCardProps {
  recommendation: OptimizationRecommendation
  onUpdate?: () => void
}

export function RecommendationCard({ recommendation, onUpdate }: RecommendationCardProps) {
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    const result = await acceptRecommendation(recommendation.id)
    setLoading(false)

    if (result.success) {
      onUpdate?.()
    }
  }

  const handleDismiss = async () => {
    setLoading(true)
    const result = await dismissRecommendation(recommendation.id)
    setLoading(false)

    if (result.success) {
      onUpdate?.()
    }
  }

  const getTypeIcon = () => {
    switch (recommendation.type) {
      case 'downgrade':
        return <TrendingDown className="w-5 h-5 text-blue-600" />
      case 'cancel':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Sparkles className="w-5 h-5 text-purple-600" />
    }
  }

  const getTypeColor = () => {
    switch (recommendation.type) {
      case 'downgrade':
        return 'bg-blue-50 border-blue-200'
      case 'cancel':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-purple-50 border-purple-200'
    }
  }

  const confidencePercentage = Math.round(recommendation.confidence_score * 100)

  return (
    <Card className={`border-2 ${getTypeColor()} shadow-sm hover:shadow-md transition-shadow`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">{getTypeIcon()}</div>
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-gray-900">
                {recommendation.title}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-gray-600">
                {recommendation.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Savings Display */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Monthly Savings</p>
              <p className="text-2xl font-bold text-green-600">₹{recommendation.monthly_savings.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Annual Savings</p>
              <p className="text-2xl font-bold text-green-600">₹{recommendation.annual_savings.toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="flex items-center gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Current:</span>
            <span className="font-semibold text-gray-900">₹{recommendation.current_cost}</span>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Optimized:</span>
            <span className="font-semibold text-green-600">₹{recommendation.optimized_cost}</span>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${confidencePercentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600">
            {confidencePercentage}% confident
          </span>
        </div>

        {/* Action Buttons */}
        {recommendation.status === 'pending' && (
          <div className="flex gap-3">
            <Button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              onClick={handleDismiss}
              disabled={loading}
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50 rounded-xl font-medium"
            >
              <X className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
          </div>
        )}

        {recommendation.status === 'accepted' && (
          <div className="bg-green-100 text-green-800 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            Accepted
          </div>
        )}

        {recommendation.status === 'dismissed' && (
          <div className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2">
            <X className="w-4 h-4" />
            Dismissed
          </div>
        )}
      </CardContent>
    </Card>
  )
}
