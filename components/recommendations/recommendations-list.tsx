'use client'

/**
 * Recommendations List Component
 * Displays all optimization recommendations with total savings
 */

import { useEffect, useState } from 'react'
import { RecommendationCard } from './recommendation-card'
import { getPendingRecommendations, generateRecommendations } from '@/lib/recommendations/recommendation-actions'
import type { OptimizationRecommendation } from '@/lib/recommendations/recommendation-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Loader2, TrendingUp } from 'lucide-react'

export function RecommendationsList() {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [totalSavings, setTotalSavings] = useState<{ monthly: number; annual: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const fetchRecommendations = async () => {
    setLoading(true)
    const result = await getPendingRecommendations()
    if (result.success && result.data) {
      setRecommendations(result.data)
      setTotalSavings(result.totalSavings || null)
    }
    setLoading(false)
  }

  const handleGenerateRecommendations = async () => {
    setGenerating(true)
    await generateRecommendations()
    await fetchRecommendations()
    setGenerating(false)
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Total Savings Header */}
      {totalSavings && totalSavings.annual > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Potential Savings Identified</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    AI found {recommendations.length} optimization {recommendations.length === 1 ? 'opportunity' : 'opportunities'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">You could save</p>
                <p className="text-4xl font-bold text-green-600">₹{totalSavings.annual.toFixed(0)}</p>
                <p className="text-sm text-gray-500">per year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Recommendations</h3>
          <p className="text-sm text-gray-500 mt-1">Smart suggestions to optimize your subscriptions</p>
        </div>
        <Button
          onClick={handleGenerateRecommendations}
          disabled={generating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Recommendations
            </>
          )}
        </Button>
      </div>

      {/* Recommendations Grid */}
      {recommendations.length > 0 ? (
        <div className="grid gap-6">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onUpdate={fetchRecommendations}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Connect your services and sync usage data to get AI-powered optimization recommendations
            </p>
            <Button
              onClick={handleGenerateRecommendations}
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
