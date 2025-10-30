import { Metadata } from 'next'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { MarkdownRenderer } from '@/components/legal/markdown-renderer'
import { legalDates } from '@/lib/config/legal'
import { RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | SubSavvyAI',
  description: 'Understand SubSavvyAI\'s refund and cancellation policy. Learn about eligibility, timelines, and how to request refunds.',
  openGraph: {
    title: 'Refund & Cancellation Policy | SubSavvyAI',
    description: 'Refund & Cancellation Policy for SubSavvyAI',
  },
}

export default async function RefundPage() {
  const content = await readFile(
    join(process.cwd(), 'content', 'legal', 'refund-cancellation-policy.md'),
    'utf-8'
  )

  return (
    <div>
      {/* Skip to content link for accessibility */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-purple-600 focus:text-white focus:rounded"
      >
        Skip to content
      </a>

      {/* Header with icon */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
          <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Last updated: {legalDates.refund}
          </p>
        </div>
      </div>

      {/* Key Info Highlights */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-100 uppercase tracking-wide mb-1">
            Cancellation
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Cancel anytime through Settings. Access remains until end of billing cycle.
          </p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-xs font-medium text-green-900 dark:text-green-100 uppercase tracking-wide mb-1">
            Refund Window
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            7 days for eligible refund requests (technical errors, duplicate charges).
          </p>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs font-medium text-amber-900 dark:text-amber-100 uppercase tracking-wide mb-1">
            Processing Time
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Approved refunds processed within 7-10 business days.
          </p>
        </div>
      </div>

      {/* Content */}
      <div id="content" className="mt-8">
        <MarkdownRenderer content={content} />
      </div>

      {/* Contact CTA */}
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Need Help with Refunds or Cancellations?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Our support team responds to all refund and cancellation queries within 48 working hours.
        </p>
        <a
          href="mailto:contact.subsavvyai@gmail.com"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}
