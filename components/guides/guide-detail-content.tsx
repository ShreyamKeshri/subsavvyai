'use client'

/**
 * Guide Detail Content Component
 * Displays step-by-step cancellation instructions - based on Vercel V0 design
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CancellationGuide, DifficultyLevel } from '@/lib/guides/guide-actions'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { GuideDisclaimer } from './guide-disclaimer'

interface GuideDetailContentProps {
  guide: CancellationGuide
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

const UPI_PROVIDER_NAMES: Record<string, string> = {
  gpay: 'Google Pay',
  phonepe: 'PhonePe',
  paytm: 'Paytm',
  amazonpay: 'Amazon Pay',
}

export function GuideDetailContent({ guide }: GuideDetailContentProps) {
  const [expandedUPI, setExpandedUPI] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Find the primary deep link from the first step if available
  const primaryDeepLink = guide.steps.find((step) => step.deepLink && !step.deepLink.startsWith('#'))?.deepLink

  // Extract important notes from steps
  // Prioritize explicit isImportant flag, fallback to title-based detection
  const importantNotes = guide.steps
    .filter(
      (step) =>
        step.isImportant === true ||
        step.title.toLowerCase().includes('important') ||
        step.title.toLowerCase().includes('note')
    )
    .map((step) => step.description)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/guides" className="inline-flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to Guides
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
      >
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{guide.service_name}</h1>
              <p className="text-muted-foreground">Estimated time: {guide.estimated_time_minutes} mins</p>
            </div>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
              {DIFFICULTY_LABELS[guide.difficulty_level]}
            </span>
          </div>
        </Card>
      </motion.div>

      {/* Deep Link Button */}
      {primaryDeepLink && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.1 }}
        >
          <a href={primaryDeepLink} target="_blank" rel="noopener noreferrer">
            <Button className="w-full md:w-auto gap-2">
              <ExternalLink className="w-4 h-4" />
              Go to {guide.service_name} Account
            </Button>
          </a>
        </motion.div>
      )}

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
      >
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Cancellation Steps</h2>
          <div className="space-y-6">
            {guide.steps.map((step, index) => {
              // Skip steps that are just pointers to UPI instructions
              if (step.deepLink?.startsWith('#upi')) {
                return null
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.3 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                    {step.deepLink && !step.deepLink.startsWith('#') && (
                      <a
                        href={step.deepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                      >
                        Open link
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>
      </motion.div>

      {/* UPI AutoPay Section */}
      {guide.upi_mandate_instructions && guide.upi_mandate_instructions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.4 }}
        >
          <Card className="p-6">
            <button
              onClick={() => setExpandedUPI(!expandedUPI)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="text-lg font-semibold text-foreground">UPI AutoPay Cancellation</h3>
              {expandedUPI ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {expandedUPI && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-border space-y-4"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  If you subscribed via UPI AutoPay, you also need to cancel the recurring payment from your UPI app:
                </p>
                {guide.upi_mandate_instructions.map((provider, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="font-semibold text-foreground">
                      {UPI_PROVIDER_NAMES[provider.provider] || provider.provider}
                    </h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {provider.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="text-sm text-muted-foreground ml-2">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </motion.div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Notes Section */}
      {importantNotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
        >
          <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold text-foreground mb-4">Important Notes</h3>
            <ul className="space-y-2">
              {importantNotes.map((note, index) => (
                <li key={index} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.6 }}
      >
        <GuideDisclaimer lastVerified={guide.last_verified_at} />
      </motion.div>
    </div>
  )
}
