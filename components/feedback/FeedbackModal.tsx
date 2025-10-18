'use client'

import { useState, useEffect, useRef } from 'react'
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

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

const SLEEKPLAN_PROJECT_ID = process.env.NEXT_PUBLIC_SLEEKPLAN_PROJECT_ID || '871283587'

/**
 * Feedback Modal Component
 *
 * Embeds Sleekplan feedback board using iframe with auto user identification.
 * URL format: https://embed-{PRODUCT_ID}.sleekplan.app/
 */
export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const posthog = usePostHog()
  const hasTrackedOpen = useRef(false)
  const hasTrackedSubmission = useRef(false)

  // Fetch user from Supabase for auto-identification
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserEmail(user.email || null)

        // Fetch user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()

        setUserName(profile?.name || user.email?.split('@')[0] || null)
      }
    }

    if (isOpen) {
      fetchUser()
    }
  }, [isOpen])

  // Build Sleekplan URL with user identification parameters
  const sleekplanUrl = (() => {
    const baseUrl = `https://embed-${SLEEKPLAN_PROJECT_ID}.sleekplan.app/`

    // Add user identification via hash parameters (privacy-friendly, not sent to server)
    if (userEmail || userName) {
      const params = new URLSearchParams()
      if (userEmail) params.set('email', userEmail)
      if (userName) params.set('name', userName)
      return `${baseUrl}#/?${params.toString()}`
    }

    return baseUrl
  })()

  const handleIframeLoad = () => {
    setIsLoading(false)

    // Track feedback widget opened (only once per modal open)
    if (posthog && !hasTrackedOpen.current) {
      hasTrackedOpen.current = true
      posthog.capture('feedback_widget_opened', {
        source: 'navbar_button',
        has_user_email: !!userEmail,
        has_user_name: !!userName,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Listen for postMessage from Sleekplan iframe to detect feedback submission
  useEffect(() => {
    if (!isOpen) return

    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from Sleekplan
      if (!event.origin.includes('sleekplan.app')) return

      // Check for feedback submission events
      // Sleekplan may send events like 'post_created', 'feedback_submitted', etc.
      const data = event.data

      if (
        data?.type === 'post_created' ||
        data?.type === 'feedback_submitted' ||
        data?.event === 'post_created' ||
        (typeof data === 'string' && data.includes('post_created'))
      ) {
        // Only track once per session
        if (!hasTrackedSubmission.current) {
          hasTrackedSubmission.current = true

          // Track feedback submission
          if (posthog) {
            posthog.capture('feedback_submitted', {
              user_email: userEmail || 'anonymous',
              user_name: userName || 'anonymous',
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
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isOpen, onClose, posthog, userEmail, userName])

  // Reset tracking refs when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasTrackedOpen.current = false
      hasTrackedSubmission.current = false
    }
  }, [isOpen])

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

          <iframe
            src={sleekplanUrl}
            className="w-full h-full border-0 block"
            title="Sleekplan Feedback Board"
            onLoad={handleIframeLoad}
            allow="clipboard-write"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
