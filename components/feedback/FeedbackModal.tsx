'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePostHog } from 'posthog-js/react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

const SLEEKPLAN_PROJECT_ID = process.env.NEXT_PUBLIC_SLEEKPLAN_PROJECT_ID || '871283587'

/**
 * Feedback Modal Component
 *
 * Embeds Sleekplan feedback board using iframe.
 * URL format: https://embed-{PRODUCT_ID}.sleekplan.app/
 */
export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const posthog = usePostHog()

  const sleekplanUrl = `https://embed-${SLEEKPLAN_PROJECT_ID}.sleekplan.app/`

  const handleIframeLoad = () => {
    setIsLoading(false)

    // Track feedback widget opened
    if (posthog) {
      posthog.capture('feedback_widget_opened', {
        source: 'navbar_button',
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold">
            We&apos;d Love Your Feedback
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Help us make SubSavvyAI better by sharing your ideas, reporting bugs, or suggesting new features.
          </p>
        </DialogHeader>

        <div className="flex-1 relative">
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
            className="w-full h-full border-0"
            title="Sleekplan Feedback Board"
            onLoad={handleIframeLoad}
            allow="clipboard-write"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
