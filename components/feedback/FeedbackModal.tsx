'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
 * Displays an embedded Sleekplan widget in a modal dialog.
 * Automatically identifies the logged-in user and tracks feedback submissions.
 */
export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const posthog = usePostHog()
  const hasTrackedSubmission = useRef(false)

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        setUserEmail(user.email || null)

        // Fetch user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()

        setUserName(profile?.name || user.email?.split('@')[0] || 'User')
      }

      setIsLoading(false)
    }

    if (isOpen) {
      fetchUser()
    }
  }, [isOpen])

  // Initialize Sleekplan widget inside modal
  useEffect(() => {
    if (!isOpen || isLoading) return

    // Initialize Sleekplan SDK
    const initSleekplan = () => {
      // Clear any existing Sleekplan instances
      if (window.$sleek) {
        window.$sleek = []
      }

      window.$sleek = []
      window.SLEEK_PRODUCT_ID = parseInt(SLEEKPLAN_PROJECT_ID, 10)

      // Identify user if available
      if (userId) {
        window.$sleek.push(['identify', {
          id: userId,
          email: userEmail || '',
          name: userName || '',
        }])
      }

      // Force widget to open in container
      window.$sleek.push(['show', {}])

      // Load Sleekplan script if not already loaded
      if (!document.querySelector('script[src*="sleekplan"]')) {
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://client.sleekplan.com/sdk/e.js'
        document.head.appendChild(script)

        script.onload = () => {
          console.log('✅ Sleekplan loaded in modal')
        }

        script.onerror = () => {
          console.error('❌ Failed to load Sleekplan')
        }
      }
    }

    // Delay to ensure DOM is ready
    const timer = setTimeout(initSleekplan, 100)

    return () => {
      clearTimeout(timer)
      // Hide widget when modal closes
      if (window.$sleek) {
        window.$sleek.push(['hide', {}])
      }
    }
  }, [isOpen, isLoading, userId, userEmail, userName])

  // Listen for messages from Sleekplan iframe (feedback submission)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from Sleekplan
      if (!event.origin.includes('sleekplan.com')) return

      // Check if feedback was submitted
      if (event.data?.type === 'feedback_submitted' || event.data?.event === 'post_created') {
        if (!hasTrackedSubmission.current) {
          hasTrackedSubmission.current = true

          // Track feedback submission
          if (posthog) {
            posthog.capture('feedback_submitted', {
              user_id: userId,
              timestamp: new Date().toISOString(),
            })
          }

          // Show thank you toast
          toast.success('Thank you for your feedback!', {
            description: 'We appreciate you taking the time to help us improve SubSavvyAI.',
            duration: 5000,
          })

          // Auto-close modal after 2 seconds
          setTimeout(() => {
            onClose()
            hasTrackedSubmission.current = false
          }, 2000)
        }
      }
    }

    if (isOpen) {
      window.addEventListener('message', handleMessage)
      return () => window.removeEventListener('message', handleMessage)
    }
  }, [isOpen, onClose, posthog, userId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl h-[85vh] p-0 gap-0"
        data-sleekplan-modal-open={isOpen ? "true" : "false"}
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              We&apos;d Love Your Feedback
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Help us make SubSavvyAI better by sharing your ideas, reporting bugs, or suggesting new features.
          </p>
        </DialogHeader>

        <div className="flex-1 relative overflow-auto">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading feedback widget...</p>
              </div>
            </div>
          ) : (
            <div
              id="sleekplan-modal-container"
              className="w-full h-full min-h-[600px]"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
