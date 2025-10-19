'use client'

import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePostHog } from 'posthog-js/react'
import { toast } from 'sonner'

interface CannyModalProps {
  isOpen: boolean
  onClose: () => void
}

// Canny configuration
const CANNY_BOARD_TOKEN = process.env.NEXT_PUBLIC_CANNY_BOARD_TOKEN || ''

/**
 * CannyModal Component
 *
 * Renders a full-screen modal with Canny feedback board embedded.
 * Features:
 * - Auto user identification from Supabase
 * - PostHog analytics tracking
 * - Responsive design matching SubSavvyAI theme
 * - Keyboard navigation (ESC to close)
 * - Loading states
 */
export function CannyModal({ isOpen, onClose }: CannyModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const posthog = usePostHog()

  // Initialize Canny SDK and render widget
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(true)
      return
    }

    const renderCannyWidget = async () => {
      if (!window.Canny) return

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Clear Canny storage to prevent user caching issues
        try {
          // Clear localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.toLowerCase().includes('canny')) {
              localStorage.removeItem(key)
            }
          })

          // Clear sessionStorage
          Object.keys(sessionStorage).forEach(key => {
            if (key.toLowerCase().includes('canny')) {
              sessionStorage.removeItem(key)
            }
          })

          // Clear cookies
          document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim()
            if (name.toLowerCase().includes('canny')) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
            }
          })

          // Clear IndexedDB
          if (window.indexedDB) {
            window.indexedDB.databases().then((dbs) => {
              dbs.forEach((db) => {
                if (db.name?.toLowerCase().includes('canny')) {
                  window.indexedDB.deleteDatabase(db.name!)
                }
              })
            }).catch(() => {})
          }
        } catch (e) {
          console.warn('Could not clear Canny storage:', e)
        }

        // Force complete DOM cleanup
        const cannyContainer = document.querySelector('[data-canny]')
        if (cannyContainer) {
          cannyContainer.innerHTML = ''
        }

        // Remove any existing Canny iframes
        document.querySelectorAll('iframe[id^="canny-"]').forEach(iframe => iframe.remove())

        // Update tracked user ID
        if (user) {
          setCurrentUserId(user.id)
        }

        let ssoToken: string | undefined = undefined

        if (user) {
          // Fetch SSO token from server
          try {
            const response = await fetch('/api/canny/sso')
            if (response.ok) {
              const data = await response.json()
              ssoToken = data.ssoToken
            } else {
              toast.error('Could not authenticate with feedback system')
            }
          } catch (error) {
            console.error('Error fetching Canny SSO token:', error)
            toast.error('Authentication error')
          }
        }

        // Render Canny board with SSO token
        const renderConfig: {
          boardToken: string
          basePath: null
          ssoToken?: string
        } = {
          boardToken: CANNY_BOARD_TOKEN,
          basePath: null,
        }

        if (ssoToken) {
          renderConfig.ssoToken = ssoToken
        }

        // Remove any existing Canny iframes before rendering
        document.querySelectorAll('iframe[id^="canny-"]').forEach(iframe => iframe.remove())

        // Render with small delay to ensure cleanup completes
        setTimeout(() => {
          if (window.Canny) {
            window.Canny('render', renderConfig)
          }
        }, 100)

        setIsLoading(false)

        posthog?.capture('feedback_modal_opened', {
          source: 'floating_button',
          has_user: !!user,
          user_id: user?.id,
        })
      } catch (error) {
        console.error('Error initializing Canny:', error)
        toast.error('Could not load feedback board')
        setIsLoading(false)
      }
    }

    const loadCannySDK = () => {
      if (window.Canny) {
        renderCannyWidget()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://canny.io/sdk.js'
      script.async = true
      script.onload = () => renderCannyWidget()
      script.onerror = () => {
        console.error('Failed to load Canny SDK')
        toast.error('Failed to load feedback widget')
        setIsLoading(false)
      }

      document.body.appendChild(script)
    }

    loadCannySDK()
  }, [isOpen, posthog, currentUserId])

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Cleanup Canny iframe when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        document.querySelectorAll('iframe[id^="canny-"]').forEach(iframe => iframe.remove())
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-5xl h-[90vh] bg-background rounded-2xl shadow-2xl overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <h2
            id="feedback-modal-title"
            className="text-xl font-semibold text-foreground"
          >
            Feedback & Suggestions
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]"
            aria-label="Close feedback modal"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content Area */}
        <div className="relative h-[calc(90vh-72px)] overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
              <Loader2 className="h-10 w-10 animate-spin text-[#2a9d8f] mb-4" />
              <p className="text-sm text-muted-foreground">Loading feedback board...</p>
            </div>
          )}

          {/* Canny renders into this container */}
          <div
            data-canny
            className="w-full h-full overflow-auto"
            style={{ backgroundColor: 'var(--background)' }}
          />
        </div>
      </div>
    </div>
  )
}

// TypeScript declaration for Canny global
declare global {
  interface Window {
    Canny?: (action: string, ...args: unknown[]) => void
  }
}
