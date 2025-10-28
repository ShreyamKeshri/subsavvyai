'use client'

/**
 * Bundles Content Component
 * AI-matched bundle recommendations based on Vercel design
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Zap, TrendingDown, Loader2, ExternalLink, Check } from 'lucide-react'
import { getBundleRecommendations, type BundleRecommendation } from '@/lib/bundles/bundle-actions'
import { toast } from 'sonner'

export function BundlesContent() {
  const [bundles, setBundles] = useState<BundleRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const result = await getBundleRecommendations()
    if (result.success && result.recommendations) {
      setBundles(result.recommendations)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalPotentialSavings = bundles.reduce((sum, b) => sum + b.monthly_savings, 0)

  const handleViewDetails = (bundle: BundleRecommendation) => {
    if (bundle.bundle?.official_url) {
      window.open(bundle.bundle.official_url, '_blank')
    } else {
      toast.info('Bundle details coming soon')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bundle Deals</h1>
        <p className="text-muted-foreground mt-1">AI-generated bundles to maximize your savings</p>
      </div>

      {/* Summary Bar */}
      {bundles.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Potential Savings</p>
              <p className="text-3xl font-bold text-green-500">₹{totalPotentialSavings.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">if all bundles applied</p>
            </div>
            <TrendingDown className="w-12 h-12 text-green-500/30" />
          </div>
        </Card>
      )}

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bundles.length > 0 ? (
          bundles.map((bundle) => {
            const bundleInfo = bundle.bundle
            const isLimitedTime = bundleInfo?.notes?.toLowerCase().includes('limited') || false

            return (
              <Card key={bundle.id} className="p-6 relative overflow-hidden">
                {isLimitedTime && (
                  <div className="absolute top-4 right-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-red-500" />
                      <span className="text-xs font-semibold text-red-500">Limited Time</span>
                    </div>
                  </div>
                )}

                <div className="pr-24">
                  <h3 className="text-lg font-semibold text-foreground">
                    {bundleInfo?.plan_name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bundleInfo?.provider}
                  </p>

                  {/* Services List */}
                  {bundleInfo?.included_ott_services && bundleInfo.included_ott_services.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Includes:</p>
                      <ul className="space-y-1">
                        {bundleInfo.included_ott_services.map((service: string, idx: number) => (
                          <li key={idx} className="text-sm text-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Match Reason */}
                  {bundle.reasoning && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">{bundle.reasoning}</p>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="mt-6 space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Bundle Cost</span>
                      <span className="font-semibold text-foreground">
                        ₹{bundleInfo?.monthly_price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estimated Savings</span>
                      <span className="font-semibold text-green-500">
                        ₹{bundle.monthly_savings.toFixed(2)}
                      </span>
                    </div>
                    {bundle.confidence_score && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Match Score</span>
                        <span className="text-xs font-medium text-blue-500">
                          {(bundle.confidence_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Verified Sources */}
                  {bundleInfo?.sources && bundleInfo.sources.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <p className="text-xs font-medium mb-2 flex items-center gap-1">
                        {bundleInfo.is_verified && <Check className="w-3 h-3 text-green-600" />}
                        Verified Sources
                        {bundleInfo.last_verified && (
                          <span className="text-[10px] text-muted-foreground ml-1">
                            (Last checked: {new Date(bundleInfo.last_verified).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short'
                            })})
                          </span>
                        )}
                      </p>
                      <ul className="space-y-1">
                        {bundleInfo.sources.map((source: string, idx: number) => (
                          <li key={idx}>
                            <a
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              {new URL(source).hostname.replace('www.', '')}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => handleViewDetails(bundle)}
                >
                  View Details
                </Button>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-semibold">No bundles available yet</p>
              <p className="text-muted-foreground mt-1">
                Add more subscriptions to unlock AI-powered bundle recommendations
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
