'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingDown, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { getPendingRecommendations, dismissRecommendation, type OptimizationRecommendation } from '@/lib/recommendations/recommendation-actions'
import { getUserSubscriptions, type Subscription } from '@/lib/subscriptions/subscription-actions'
import { toast } from 'sonner'

type FilterType = 'all' | 'downgrade' | 'cancel' | 'bundle' | 'upgrade'
type SortType = 'savings' | 'confidence'

export function RecommendationsContent() {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortType>('savings')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [totalSavings, setTotalSavings] = useState<{ monthly: number; annual: number } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const [recsResult, subsResult] = await Promise.all([
      getPendingRecommendations(),
      getUserSubscriptions(),
    ])
    if (recsResult.success && recsResult.data) {
      setRecommendations(recsResult.data)
      setTotalSavings(recsResult.totalSavings || null)
    }
    if (subsResult.success && subsResult.data) {
      setSubscriptions(subsResult.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDismiss = async (id: string) => {
    const result = await dismissRecommendation(id)
    if (result.success) {
      toast.info('Recommendation dismissed')
      fetchData()
    } else {
      toast.error(result.error || 'Failed to dismiss recommendation')
    }
  }

  const filteredRecommendations = recommendations
    .filter(r => filterType === 'all' || r.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'savings') {
        return b.monthly_savings - a.monthly_savings
      }
      return b.confidence_score - a.confidence_score
    })

  const getSubscriptionName = (subscriptionId: string | null) => {
    if (!subscriptionId) return 'General'
    const sub = subscriptions.find(s => s.id === subscriptionId)
    return sub?.service?.name || sub?.custom_service_name || 'Unknown'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'downgrade': return '📉'
      case 'cancel': return '❌'
      case 'bundle': return '📦'
      case 'upgrade': return '📈'
      default: return '💡'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'downgrade': return 'Downgrade opportunity'
      case 'cancel': return 'Unused subscription'
      case 'bundle': return 'Bundle opportunity'
      case 'upgrade': return 'Upgrade recommendation'
      default: return 'Recommendation'
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Recommendations</h1>
        <p className="text-muted-foreground mt-1">Personalized AI-powered savings opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Potential Savings</p>
              <p className="text-3xl font-bold text-green-500">
                ₹{(totalSavings?.monthly || 0).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per month</p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-500/30" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Recommendations</p>
              <p className="text-3xl font-bold text-blue-500">{filteredRecommendations.length}</p>
              <p className="text-xs text-muted-foreground mt-1">opportunities</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500/30" />
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'downgrade', 'cancel', 'bundle', 'upgrade'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === type ? 'bg-blue-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('savings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'savings' ? 'bg-blue-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Sort by Savings
          </button>
          <button
            onClick={() => setSortBy('confidence')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'confidence' ? 'bg-blue-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Sort by Confidence
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((rec) => (
            <Card key={rec.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{getTypeIcon(rec.type)}</div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getSubscriptionName(rec.subscription_id)} • {getTypeLabel(rec.type)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDismiss(rec.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-sm text-foreground mt-3 bg-muted/50 p-3 rounded-lg">
                    {rec.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-lg border border-blue-500/20 bg-blue-500/10 text-xs font-semibold text-blue-500">
                        {(rec.confidence_score * 100).toFixed(0)}% Confidence
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-500">
                          Save ₹{rec.monthly_savings.toFixed(2)}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-foreground font-semibold">All caught up!</p>
            <p className="text-muted-foreground mt-1">
              {recommendations.length === 0
                ? 'Add subscriptions and connect services to get AI recommendations'
                : 'No recommendations match your filters'}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
