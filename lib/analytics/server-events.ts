/**
 * Server-side analytics tracking
 * Use this for tracking events from server actions and API routes
 */

import { PostHog } from 'posthog-node'

// Initialize PostHog client (singleton pattern)
let posthogClient: PostHog | null = null

function getPostHogClient(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      flushAt: 1, // Flush immediately in serverless
      flushInterval: 0,
    })
  }

  return posthogClient
}

export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogClient()
  if (!client) return

  try {
    client.capture({
      distinctId,
      event,
      properties,
    })

    // Flush immediately for serverless
    await client.flush()
  } catch (error) {
    console.error('PostHog server tracking error:', error)
  }
}

export async function identifyUser(userId: string, properties?: Record<string, unknown>) {
  const client = getPostHogClient()
  if (!client) return

  try {
    client.identify({
      distinctId: userId,
      properties,
    })

    await client.flush()
  } catch (error) {
    console.error('PostHog server identify error:', error)
  }
}

// Graceful shutdown
export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown()
  }
}
