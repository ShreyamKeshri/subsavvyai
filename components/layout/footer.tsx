import Link from 'next/link'
import Image from 'next/image'
import { branding } from '@/lib/config/branding'
import { Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/logo-icon.png"
                alt={branding.name}
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {branding.name}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {branding.tagline}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {branding.description}
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/refund"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Refund & Cancellation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Contact
            </h3>
            <a
              href="mailto:contact.subsavvyai@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <Mail className="h-4 w-4" />
              contact.subsavvyai@gmail.com
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              We respond to all inquiries within 48 working hours.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} {branding.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <span>Made with ❤️ in India</span>
              <span>•</span>
              <span>DPDP Act 2023 Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
