import { Metadata } from 'next'
import { MessageSquare, TrendingUp, Lightbulb, Bug } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Feedback | SubSavvyAI',
  description: 'Share your ideas, suggestions, and bug reports to help us improve SubSavvyAI',
}

/**
 * Dedicated Feedback Page
 *
 * Full-page Canny board embedding via iframe.
 * Provides a comprehensive feedback experience with features list,
 * voting, commenting, and status tracking.
 */
export default function FeedbackPage() {
  // Get board token from environment
  const boardToken = process.env.NEXT_PUBLIC_CANNY_BOARD_TOKEN || ''

  // Construct Canny iframe URL
  // Format: https://canny.io/board/BOARD_TOKEN
  const cannyIframeUrl = `https://canny.io/board/${boardToken}`

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-[#2a9d8f]/10">
              <MessageSquare className="h-6 w-6 text-[#2a9d8f]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Feedback & Suggestions
              </h1>
              <p className="text-muted-foreground mt-1">
                Help us build a better SubSavvyAI experience
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background border border-border">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Lightbulb className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Share Ideas</h3>
                <p className="text-xs text-muted-foreground">
                  Suggest new features and improvements
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-background border border-border">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Bug className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Report Bugs</h3>
                <p className="text-xs text-muted-foreground">
                  Help us identify and fix issues
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-background border border-border">
              <div className="p-2 rounded-lg bg-[#2a9d8f]/10">
                <TrendingUp className="h-4 w-4 text-[#2a9d8f]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Vote & Track</h3>
                <p className="text-xs text-muted-foreground">
                  Upvote ideas and track their progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canny Iframe Embed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
          {boardToken ? (
            <iframe
              src={cannyIframeUrl}
              className="w-full min-h-[600px] h-[calc(100vh-400px)]"
              style={{
                border: 'none',
                backgroundColor: 'var(--background)',
              }}
              title="SubSavvyAI Feedback Board"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="p-4 rounded-full bg-destructive/10 mb-4">
                <MessageSquare className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Feedback Board Not Configured
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                The Canny board token is missing. Please configure{' '}
                <code className="px-2 py-1 rounded bg-muted text-foreground">
                  NEXT_PUBLIC_CANNY_BOARD_TOKEN
                </code>{' '}
                in your environment variables.
              </p>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Vote on ideas you&apos;d like to see prioritized.
            We review feedback regularly and use it to guide our development roadmap.
          </p>
        </div>
      </div>
    </div>
  )
}
