"use client"

import { Card } from "@/components/ui/card"
import { TrendingDown, Zap, DollarSign, Link2 } from "lucide-react"

interface HeroMetricsProps {
  totalSpending: number
  potentialSavings: number
  activeSubscriptions: number
  connectedServices: number
}

export function HeroMetrics({
  totalSpending,
  potentialSavings,
  activeSubscriptions,
  connectedServices,
}: HeroMetricsProps) {
  const metrics = [
    {
      icon: DollarSign,
      label: "Total Spending",
      value: `₹${totalSpending.toFixed(2)}`,
      subtext: "per month",
      color: "text-blue-500",
    },
    {
      icon: TrendingDown,
      label: "Potential Savings",
      value: `₹${potentialSavings.toFixed(2)}`,
      subtext: "per month",
      color: "text-green-500",
    },
    {
      icon: Zap,
      label: "Active Subscriptions",
      value: activeSubscriptions.toString(),
      subtext: "services",
      color: "text-purple-500",
    },
    {
      icon: Link2,
      label: "Connected Services",
      value: connectedServices.toString(),
      subtext: "platforms",
      color: "text-orange-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon
        return (
          <Card key={idx} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.subtext}</p>
              </div>
              <Icon className={`w-8 h-8 ${metric.color}`} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
