import { initSentry } from '@/lib/analytics/sentry'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry for server-side
    initSentry()
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Initialize Sentry for edge runtime
    initSentry()
  }
}

export const onRequestError = async (
  err: { digest: string } & Error,
  request: {
    path: string
    method: string
    headers: { [key: string]: string | string[] | undefined }
  }
) => {
  // Log errors to Sentry
  const { captureError } = await import('@/lib/analytics/sentry')
  captureError(err, {
    path: request.path,
    method: request.method,
  })
}
