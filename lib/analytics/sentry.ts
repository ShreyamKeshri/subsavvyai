import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Performance Monitoring
      tracesSampleRate: 1.0,

      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Environment
      environment: process.env.NODE_ENV,

      // Filter out sensitive data
      beforeSend(event) {
        // Remove sensitive data from events
        if (event.request?.cookies) {
          delete event.request.cookies
        }
        return event
      },
    })
  }
}

// Helper to capture errors with context
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  })
}

// Helper to add breadcrumb
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  })
}
