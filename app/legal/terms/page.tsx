import { Metadata } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'
import { MarkdownRenderer } from '@/components/legal/markdown-renderer'
import { Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | SubSavvyAI',
  description: 'Read SubSavvyAI\'s Terms of Service. Understand your rights and responsibilities when using our subscription management platform.',
  openGraph: {
    title: 'Terms of Service | SubSavvyAI',
    description: 'Terms of Service for SubSavvyAI - India\'s AI-powered subscription optimizer',
  },
}

export default function TermsPage() {
  const content = readFileSync(
    join(process.cwd(), 'content', 'legal', 'terms-of-service.md'),
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
          <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Last updated: October 2025
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
          Questions about our Terms?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          If you have any questions or concerns about these Terms of Service, please don&apos;t hesitate to reach out.
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
