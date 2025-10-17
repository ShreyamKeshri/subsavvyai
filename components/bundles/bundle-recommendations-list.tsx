'use client'

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { BundleRecommendationCard } from './bundle-recommendation-card'
import {
  generateBundleRecommendations,
  getBundleRecommendations,
  type BundleRecommendation,
} from '@/lib/bundles/bundle-actions'

export function BundleRecommendationsList() {
  const [recommendations, setRecommendations] = useState<BundleRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const loadRecommendations = async () => {
    setIsLoading(true)
    const result = await getBundleRecommendations()

    if (result.success && result.recommendations) {
      setRecommendations(result.recommendations)
    } else if (result.error) {
      toast.error(result.error)
    }
    setIsLoading(false)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    const result = await generateBundleRecommendations()

    if (result.success) {
      if (result.count && result.count > 0) {
        toast.success(`Found ${result.count} bundle${result.count > 1 ? 's' : ''} that could save you money!`)
        await loadRecommendations()
      } else {
        toast.info('No bundle recommendations found. Add more subscriptions to see recommendations.')
      }
    } else {
      toast.error(result.error || 'Failed to generate recommendations')
    }
    setIsGenerating(false)
  }

  const handleDismiss = async (recommendationId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
  }

  useEffect(() => {
    const initializeRecommendations = async () => {
      await loadRecommendations()

      // Auto-generate if no recommendations exist yet
      // This will run once on component mount
      const result = await getBundleRecommendations()
      if (result.success && (!result.recommendations || result.recommendations.length === 0)) {
        // Silently generate in the background
        generateBundleRecommendations()
          .then(genResult => {
            if (genResult.success && genResult.count && genResult.count > 0) {
              // Reload recommendations after generation
              loadRecommendations()
            }
          })
          .catch(error => {
            console.error('Failed to auto-generate bundles on mount:', error)
          })
      }
    }

    initializeRecommendations()
  }, [])

  // Calculate total potential savings
  const totalAnnualSavings = recommendations.reduce(
    (sum, rec) => sum + (rec.annual_savings || 0),
    0
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-green-600" />
            Bundle Optimizer
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading recommendations...</p>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-green-600" />
            Bundle Optimizer
          </h2>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find Bundles
              </>
            )}
          </Button>
        </div>

        <div className="border rounded-lg p-8 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Discover Bundle Savings</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            We&apos;ll analyze your subscriptions and find telecom bundles that could save you money
          </p>
          <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find Bundles for Me
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-green-600" />
            Switch to a Bundle & Save
          </h2>
          {totalAnnualSavings > 0 && (
            <p className="text-muted-foreground mt-1">
              Potential savings: <span className="font-semibold text-green-600">
                ₹{Math.round(totalAnnualSavings).toLocaleString()}/year
              </span>
            </p>
          )}
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          variant="outline"
          size="sm"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>How it works:</strong> We found {recommendations.length} telecom bundle{recommendations.length > 1 ? 's' : ''} that include multiple services you&apos;re already paying for separately. Switch to save money!
        </p>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map(recommendation => (
          <BundleRecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onDismiss={() => handleDismiss(recommendation.id)}
          />
        ))}
      </div>

      {/* Footer Note */}
      <p className="text-xs text-center text-muted-foreground">
        Prices and availability verified as of October 2025. Click through to provider website for latest offers.
      </p>
    </div>
  )
}
