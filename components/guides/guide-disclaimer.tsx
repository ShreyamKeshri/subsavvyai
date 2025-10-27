'use client'

/**
 * Guide Disclaimer Component
 * Displays disclaimer and last verified information for cancellation guides
 */

import { AlertTriangle, Calendar, Flag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface GuideDisclaimerProps {
  lastVerified: string
}

export function GuideDisclaimer({ lastVerified }: GuideDisclaimerProps) {
  const [showReportModal, setShowReportModal] = useState(false)

  // Format last verified date
  const formattedDate = new Date(lastVerified).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <Card className="bg-muted/40 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              The steps provided in this guide are for informational purposes and may vary slightly based on your
              subscription plan or app version. SubSavvyAI strives to keep this information accurate and up to date, but
              we recommend verifying the final steps on the official service website or app before completing your
              cancellation.
            </p>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Last verified: {formattedDate}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReportModal(true)}
              className="gap-2"
            >
              <Flag className="w-3 h-3" />
              Report an Issue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowReportModal(false)}
        >
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <Flag className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Report an Issue</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Thank you for helping us keep our guides accurate! Issue reporting will be available soon.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    For now, please reach out to us through the Feedback button in the bottom right corner.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowReportModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
