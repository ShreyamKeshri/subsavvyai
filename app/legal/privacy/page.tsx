import { Metadata } from 'next'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { MarkdownRenderer } from '@/components/legal/markdown-renderer'
import { legalDates } from '@/lib/config/legal'
import { Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | SubSavvyAI',
  description: 'Learn how SubSavvyAI protects your privacy and handles your data. DPDP Act 2023 compliant privacy policy for Indian users.',
  openGraph: {
    title: 'Privacy Policy | SubSavvyAI',
    description: 'Privacy Policy for SubSavvyAI - Learn how we protect your data',
  },
}

export default async function PrivacyPage() {
  const content = await readFile(
    join(process.cwd(), 'content', 'legal', 'privacy-policy.md'),
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
          <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Last updated: {legalDates.privacy}
          </p>
        </div>
      </div>

      {/* Compliance Badge */}
      <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              DPDP Act 2023 Compliant
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              This privacy policy complies with the Digital Personal Data Protection Act, 2023 and relevant Indian IT Rules.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div id="content" className="mt-8">
        <MarkdownRenderer content={content} />
      </div>

      {/* Contact CTA */}
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Privacy Questions or Data Requests?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You have the right to access, correct, or delete your personal data. Contact us for any privacy-related inquiries.
        </p>
        <a
          href="mailto:contact.subsavvyai@gmail.com"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Contact Privacy Team
        </a>
      </div>
    </div>
  )
}
