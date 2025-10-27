'use client'

/**
 * Savings Metrics Component
 * Large animated metric cards showing total savings and projections
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { TrendingDown, Target } from 'lucide-react'
import { formatINR } from '@/lib/savings/savings-utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface SavingsMetricsProps {
  totalYearToDateSavings: number
  annualProjection: number
  cancelledCount: number
}

export function SavingsMetrics({
  totalYearToDateSavings,
  annualProjection,
  cancelledCount,
}: SavingsMetricsProps) {
  const [animatedSavings, setAnimatedSavings] = useState(0)
  const [animatedProjection, setAnimatedProjection] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  // Animated counter effect for total savings
  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedSavings(totalYearToDateSavings)
      return
    }

    let count = 0
    const increment = totalYearToDateSavings / 50
    const interval = setInterval(() => {
      count += increment
      if (count >= totalYearToDateSavings) {
        setAnimatedSavings(totalYearToDateSavings)
        clearInterval(interval)
      } else {
        setAnimatedSavings(count)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [totalYearToDateSavings, prefersReducedMotion])

  // Animated counter effect for annual projection
  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedProjection(annualProjection)
      return
    }

    let count = 0
    const increment = annualProjection / 50
    const interval = setInterval(() => {
      count += increment
      if (count >= annualProjection) {
        setAnimatedProjection(annualProjection)
        clearInterval(interval)
      } else {
        setAnimatedProjection(count)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [annualProjection, prefersReducedMotion])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Savings This Year */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Savings This Year</p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-500">
                {formatINR(animatedSavings)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                From {cancelledCount} optimization{cancelledCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Annual Projection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: 0.2 }}
      >
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Annual Savings Projection</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-500">
                {formatINR(animatedProjection)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Based on current savings rate</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
