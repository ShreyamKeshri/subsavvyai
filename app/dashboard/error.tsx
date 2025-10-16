'use client'

/**
 * Dashboard Error Boundary
 * Catches errors in the dashboard and provides a contextual fallback UI
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card } from '@/components/ui/card'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Dashboard error:', error)

    // TODO: Send error to monitoring service (Sentry) in production
  }, [error])

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Dashboard Error
              </h2>
              <p className="text-sm text-muted-foreground">
                We encountered an error while loading the dashboard. Your data is safe.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 text-left">
                <p className="text-xs font-mono text-red-800 dark:text-red-300 break-all">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={reset}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
