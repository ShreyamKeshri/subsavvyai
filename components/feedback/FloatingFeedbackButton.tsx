'use client'

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { CannyModal } from './CannyModal'
import { createClient } from '@/lib/supabase/client'

/**
 * FloatingFeedbackButton Component
 *
 * A floating action button fixed at the bottom-right corner of the screen.
 * Opens the Canny feedback modal when clicked.
 *
 * Features:
 * - SubSavvyAI brand colors (#2a9d8f Persian Green)
 * - Smooth animations and hover effects
 * - Responsive design (hides text on mobile)
 * - Accessible with ARIA labels and keyboard support
 * - Drop shadow for depth
 * - Force re-renders modal when user changes (key prop)
 */
export function FloatingFeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Track current user to force modal re-mount when user changes
  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }

    fetchUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="
          fixed bottom-6 right-6 z-40
          flex items-center gap-2
          px-5 py-3
          bg-[#2a9d8f] hover:bg-[#238276]
          text-white font-medium
          rounded-full
          shadow-lg hover:shadow-xl
          transition-all duration-300
          hover:scale-105
          focus:outline-none focus:ring-4 focus:ring-[#2a9d8f]/30
          active:scale-95
        "
        aria-label="Open feedback and suggestions"
        title="Share your feedback"
      >
        <MessageSquare className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Canny Modal - key prop forces complete re-mount when user changes */}
      <CannyModal
        key={userId || 'no-user'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
