"use client"

import { Card } from "@/components/ui/card"
import { TrendingDown, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OptimizationRecommendation } from "@/lib/recommendations/recommendation-actions"

interface RecommendationsFeedCardProps {
  recommendations: OptimizationRecommendation[]
  onDismiss?: (id: string) => void
  onView?: (id: string) => void
}

export function RecommendationsFeedCard({
  recommendations,
  onDismiss,
  onView,
}: RecommendationsFeedCardProps) {
  const getRecommendationIcon = (type: string) => {
    const icons: Record<string, string> = {
      downgrade: "📉",
      cancel: "❌",
      bundle: "📦",
      overlap: "🔄",
    }
    // eslint-disable-next-line security/detect-object-injection
    return icons[type] || "💡"
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">AI Recommendations</h2>
      <div className="space-y-3">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <span className="text-2xl">{getRecommendationIcon(rec.type)}</span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{rec.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(rec.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-500">
                      Save ₹{rec.monthly_savings.toFixed(0)}/mo
                    </span>
                  </div>
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(rec.id)}
                      className="h-7 text-xs"
                    >
                      View Details
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">All caught up! No new recommendations.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Add more subscriptions or connect services to get AI-powered savings tips.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
