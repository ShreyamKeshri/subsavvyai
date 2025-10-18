'use client'

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CannyFeedback } from './CannyFeedback'
import { usePostHog } from 'posthog-js/react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const FEEDBACK_TOOLTIP_KEY = 'subsavvyai_feedback_tooltip_seen'

/**
 * Feedback Button Component
 *
 * Displays a feedback button in the navbar that opens the Sleekplan modal.
 * Tracks user interactions with PostHog and shows a tooltip for first-time users.
 */
export function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const posthog = usePostHog()

  // Check if user has seen the tooltip before
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem(FEEDBACK_TOOLTIP_KEY)
    if (!hasSeenTooltip) {
      setShowTooltip(true)
      // Auto-hide tooltip after 5 seconds
      const timer = setTimeout(() => {
        setShowTooltip(false)
        localStorage.setItem(FEEDBACK_TOOLTIP_KEY, 'true')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setShowTooltip(false)
    localStorage.setItem(FEEDBACK_TOOLTIP_KEY, 'true')

    // Track feedback widget opened
    if (posthog) {
      posthog.capture('feedback_widget_opened', {
        source: 'navbar_button',
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenModal}
              className="
                relative
                bg-[oklch(0.616_0.132_165.572)]
                hover:bg-[oklch(0.566_0.132_165.572)]
                dark:bg-[oklch(0.269_0_0)]
                dark:hover:bg-[oklch(0.35_0_0)]
                text-white
                dark:text-foreground
                border-transparent
                rounded-xl
                shadow-sm
                hover:shadow-md
                transition-all
                duration-200
                gap-2
              "
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-[oklch(0.616_0.132_165.572)] text-white border-transparent"
          >
            <p className="flex items-center gap-1">
              We&apos;re Listening 👂
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <CannyFeedback
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
