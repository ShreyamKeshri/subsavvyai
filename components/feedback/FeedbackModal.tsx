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
  const iframeRef = useRef<HTMLIFrameElement>(null)
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

  // Build Sleekplan embed URL with user identification
  const getSleekplanUrl = () => {
    const baseUrl = `https://sleekplan.com/sdk/${SLEEKPLAN_PROJECT_ID}`

    if (!userId) return baseUrl

    const params = new URLSearchParams({
      user_id: userId,
      ...(userEmail && { user_email: userEmail }),
      ...(userName && { user_name: userName }),
    })

    return `${baseUrl}?${params.toString()}`
  }

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
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
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

        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading feedback widget...</p>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={getSleekplanUrl()}
              className="w-full h-full border-0"
              title="Sleekplan Feedback Widget"
              allow="clipboard-write"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
