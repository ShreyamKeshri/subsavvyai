'use client'

/**
 * Legal Section Component
 * Links to legal policy pages (Terms, Privacy, Refund)
 */

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { legalDates } from '@/lib/config/legal'
import { ExternalLink, Scale, Shield, RefreshCw } from 'lucide-react'

export function LegalSection() {
  const legalLinks = [
    {
      title: 'Terms of Service',
      description: 'Review our terms and conditions',
      href: '/legal/terms',
      icon: Scale,
      updated: legalDates.terms,
    },
    {
      title: 'Privacy Policy',
      description: 'Learn how we protect your data (DPDP Act 2023 compliant)',
      href: '/legal/privacy',
      icon: Shield,
      updated: legalDates.privacy,
    },
    {
      title: 'Refund & Cancellation',
      description: 'Understand our refund and cancellation policy',
      href: '/legal/refund',
      icon: RefreshCw,
      updated: legalDates.refund,
    },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Section Header */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">Legal & Policies</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View our legal documents and policies
          </p>
        </div>

        {/* Legal Links */}
        <div className="space-y-3">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-colors group"
            >
              {/* Icon */}
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <link.icon className="h-5 w-5 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {link.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Last updated: {link.updated}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Contact Info */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Questions about our policies?{' '}
            <a
              href="mailto:contact.subsavvyai@gmail.com"
              className="text-primary hover:underline font-medium"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </Card>
  )
}
