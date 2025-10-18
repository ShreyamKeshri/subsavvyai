'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { usePostHog } from 'posthog-js/react'
import { toast } from 'sonner'

interface CannyFeedbackProps {
  isOpen: boolean
  onClose: () => void
}

// Canny configuration
const CANNY_APP_ID = process.env.NEXT_PUBLIC_CANNY_APP_ID || ''
const CANNY_BOARD_TOKEN = process.env.NEXT_PUBLIC_CANNY_BOARD_TOKEN || ''

/**
 * Canny Feedback Widget Component
 *
 * Embeds Canny feedback board with auto user identification.
 * Better UX than Sleekplan - no sign-in prompts for anonymous users.
 */
export function CannyFeedback({ isOpen, onClose }: CannyFeedbackProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [cannyLoaded, setCannyLoaded] = useState(false)
  const posthog = usePostHog()

  // Initialize Canny widget
  useEffect(() => {
    if (!isOpen || cannyLoaded) return

    const initCanny = async () => {
      // Load Canny SDK if not already loaded
      if (!window.Canny) {
        const script = document.createElement('script')
        script.src = 'https://canny.io/sdk.js'
        script.async = true

        script.onload = () => {
          setCannyLoaded(true)
          initCannyWidget()
        }

        script.onerror = () => {
          console.error('Failed to load Canny SDK')
          toast.error('Failed to load feedback widget')
          setIsLoading(false)
        }

        document.body.appendChild(script)
      } else {
        setCannyLoaded(true)
        initCannyWidget()
      }
    }

    const initCannyWidget = async () => {
      if (!window.Canny) return

      try {
        // Fetch user from Supabase for auto-identification
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        let cannyUser = null
        if (user) {
          // Fetch user profile for name
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single()

          cannyUser = {
            id: user.id,
            email: user.email,
            name: profile?.name || user.email?.split('@')[0] || 'User',
            avatarURL: user.user_metadata?.avatar_url,
          }
        }

        // Initialize Canny
        window.Canny('identify', cannyUser || {
          // Anonymous user
        })

        // Render Canny board
        window.Canny('render', {
          boardToken: CANNY_BOARD_TOKEN,
          basePath: null, // Don't use basePath for iframe mode
          ssoToken: null, // Optional: Implement SSO later
        })

        setIsLoading(false)

        // Track feedback widget opened
        if (posthog) {
          posthog.capture('feedback_widget_opened', {
            source: 'navbar_button',
            has_user: !!user,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('Error initializing Canny:', error)
        setIsLoading(false)
      }
    }

    initCanny()
  }, [isOpen, cannyLoaded, posthog])

  // Listen for Canny events
  useEffect(() => {
    if (!isOpen || !window.Canny) return

    const handleCannyEvent = (event: string, data: unknown) => {
      if (event === 'post:create') {
        // Track feedback submission
        if (posthog) {
          posthog.capture('feedback_submitted', {
            platform: 'canny',
            timestamp: new Date().toISOString(),
          })
        }

        // Show thank you toast
        toast.success('Thanks for helping us improve!', {
          description: 'Your feedback has been submitted successfully.',
          duration: 5000,
          action: {
            label: 'Close',
            onClick: () => {
              onClose()
            },
          },
        })
      }
    }

    // Canny SDK events
    window.Canny('on', 'post:create', (data: unknown) => {
      handleCannyEvent('post:create', data)
    })

    return () => {
      if (window.Canny) {
        window.Canny('off', 'post:create')
      }
    }
  }, [isOpen, onClose, posthog])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Feedback & Suggestions
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative min-h-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading feedback board...</p>
              </div>
            </div>
          )}

          {/* Canny renders into this container */}
          <div
            id="canny-container"
            data-canny-container
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// TypeScript declaration for Canny global
declare global {
  interface Window {
    Canny?: (
      action: string,
      ...args: unknown[]
    ) => void
  }
}
