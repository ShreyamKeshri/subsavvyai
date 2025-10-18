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

    // Prevent multiple initializations
    if (window.$sleek || document.querySelector('script[src*="sleekplan"]')) {
      console.log('Sleekplan already loaded, skipping initialization')
      return
    }

    // Initialize Sleekplan widget (official method)
    const initSleekplan = () => {
      // Initialize $sleek array
      window.$sleek = []

      // Set product ID
      window.SLEEK_PRODUCT_ID = parseInt(sleekplanId, 10)

      // CRITICAL: Disable all greeting/hello messages
      window.$sleek.push(['widget', 'trigger-only']) // Show only button, no auto-open
      window.$sleek.push(['greeting', 'hide']) // Hide greeting completely
      window.$sleek.push(['hello', false]) // Disable hello message

      // Set user info if available
      if (user) {
        window.$sleek.push(['identify', {
          id: user.id,
          name: user.name || 'User',
          email: user.email,
        }])
      }

      // Load Sleekplan script
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://client.sleekplan.com/sdk/e.js'
      script.setAttribute('data-sleekplan-loaded', 'true')

      script.onload = () => {
        console.log('✅ Sleekplan widget loaded successfully')

        // Track widget loaded
        if (posthog) {
          posthog.capture('sleekplan_loaded', {
            projectId: sleekplanId,
            hasUser: !!user,
          })
        }
      }

      script.onerror = () => {
        console.error('❌ Failed to load Sleekplan script')
      }

      document.head.appendChild(script)
    }

    initSleekplan()

    // Cleanup
    return () => {
      // Note: Sleekplan widget persists across navigation (intentional for SPA)
    }
  }, [projectId, user, posthog])

  // Widget is injected by Sleekplan script, no UI needed
  return null
}

// TypeScript declaration for Sleekplan global
declare global {
  interface Window {
    $sleek?: Array<[string, unknown]>
    SLEEK_PRODUCT_ID?: number
  }
}
