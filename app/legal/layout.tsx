import { branding } from '@/lib/config/branding'
import Link from 'next/link'
import Image from 'next/image'
import { Home } from 'lucide-react'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/logo-icon.png"
                alt={branding.name}
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                {branding.name}
              </span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8 md:p-12">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} {branding.name}. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/legal/terms" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Privacy
              </Link>
              <Link href="/legal/refund" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Refund
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
