'use client'

/**
 * Quarterly Progress Component
 * Shows savings progress broken down by quarter
 */

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { formatINR } from '@/lib/savings/savings-utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface QuarterlyProgressProps {
  monthlySavingsRate: number
}

export function QuarterlyProgress({
  monthlySavingsRate,
}: QuarterlyProgressProps) {
  const prefersReducedMotion = useReducedMotion()
  const currentMonth = new Date().getMonth() + 1 // 1-12

  // Calculate quarterly progress
  const quarters = [
    {
      quarter: 'Q1',
      months: [1, 2, 3],
      target: monthlySavingsRate * 3,
    },
    {
      quarter: 'Q2',
      months: [4, 5, 6],
      target: monthlySavingsRate * 3,
    },
    {
      quarter: 'Q3',
      months: [7, 8, 9],
      target: monthlySavingsRate * 3,
    },
    {
      quarter: 'Q4',
      months: [10, 11, 12],
      target: monthlySavingsRate * 3,
    },
  ]

  const quarterlyData = quarters.map((q) => {
    const monthsInQuarter = q.months.filter((m) => m <= currentMonth).length
    const saved = monthlySavingsRate * monthsInQuarter
    const progress = q.target > 0 ? Math.min(100, (saved / q.target) * 100) : 0

    return {
      ...q,
      saved,
      progress,
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: 0.3 }}
    >
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-500" />
          Quarterly Savings Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quarterlyData.map((quarter, idx) => (
            <motion.div
              key={quarter.quarter}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.3,
                delay: prefersReducedMotion ? 0 : 0.4 + idx * 0.1,
              }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{quarter.quarter}</span>
                <span className="text-xs text-muted-foreground">
                  {quarter.progress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${quarter.progress}%` }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.8,
                    delay: prefersReducedMotion ? 0 : 0.6 + idx * 0.1,
                    ease: 'easeOut',
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatINR(quarter.saved)} saved
              </p>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
