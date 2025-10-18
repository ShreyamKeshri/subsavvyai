'use client'

import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'

interface SleekplanProps {
  projectId?: string
  user?: {
    id: string
    name?: string
    email?: string
  }
}

/**
 * Sleekplan Feedback Widget Integration
 *
 * Setup Instructions:
 * 1. Sign up at https://sleekplan.com
 * 2. Create a new project
 * 3. Copy your Project ID from Settings > Installation
 * 4. Add to .env.local: NEXT_PUBLIC_SLEEKPLAN_PROJECT_ID=your_project_id
 * 5. The widget will appear automatically on all pages
 *
 * Features:
 * - Feedback collection (bugs, features, improvements)
 * - Upvoting system
 * - Roadmap display
 * - Changelog announcements
 * - Email notifications
 */
export function Sleekplan({ projectId, user }: SleekplanProps) {
  const posthog = usePostHog()

  useEffect(() => {
    // Skip if no project ID configured
    const sleekplanId = projectId || process.env.NEXT_PUBLIC_SLEEKPLAN_PROJECT_ID

    if (!sleekplanId) {
      console.warn(
        '⚠️ Sleekplan not configured. Add NEXT_PUBLIC_SLEEKPLAN_PROJECT_ID to .env.local'
      )
      return
    }

    // Initialize Sleekplan widget
    const initSleekplan = () => {
      if (window.Sleekplan) {
        return // Already initialized
      }

      // Load Sleekplan script
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://client.sleekplan.com/sdk/e.js'

      script.onload = () => {
        if (!window.Sleekplan) {
          console.error('Sleekplan failed to load')
          return
        }

        // Initialize with project ID
        window.Sleekplan.initialize({
          productId: sleekplanId,
          // Pass user data if available (for better tracking)
          user: user
            ? {
                id: user.id,
                name: user.name || 'User',
                email: user.email,
              }
            : undefined,
        })

        // Track widget loaded
        if (posthog) {
          posthog.capture('sleekplan_loaded', {
            projectId: sleekplanId,
            hasUser: !!user,
          })
        }
      }

      document.head.appendChild(script)
    }

    initSleekplan()

    // Cleanup
    return () => {
      // Sleekplan doesn't provide cleanup method
      // Widget will persist across page navigation (SPA behavior)
    }
  }, [projectId, user, posthog])

  // Widget is injected by Sleekplan script, no UI needed
  return null
}

// TypeScript declaration for Sleekplan global
declare global {
  interface Window {
    Sleekplan?: {
      initialize: (config: {
        productId: string
        user?: {
          id: string
          name: string
          email?: string
        }
      }) => void
      open?: () => void
      close?: () => void
    }
  }
}
