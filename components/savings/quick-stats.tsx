'use client'

/**
 * Quick Stats Component
 * Sidebar card showing key savings statistics
 */

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { formatINR } from '@/lib/savings/savings-utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface QuickStatsProps {
  cancelledCount: number
  totalSaved: number
  avgPerMonth: number
}

export function QuickStats({ cancelledCount, totalSaved, avgPerMonth }: QuickStatsProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: 0.5 }}
    >
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Optimizations</span>
            <span className="font-semibold text-foreground">{cancelledCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Saved</span>
            <span className="font-semibold text-green-600 dark:text-green-500">
              {formatINR(totalSaved)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Avg. per month</span>
            <span className="font-semibold text-foreground">{formatINR(avgPerMonth)}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
