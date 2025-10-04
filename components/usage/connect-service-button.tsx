'use client'

/**
 * Connect Service Button Component
 * Initiates OAuth flow to connect external services
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Link as LinkIcon } from 'lucide-react'

interface ConnectServiceButtonProps {
  serviceName: string
  provider: 'spotify' | 'netflix' | 'youtube' | 'prime_video'
  isConnected?: boolean
  onConnect?: () => void
}

export function ConnectServiceButton({
  serviceName,
  provider,
  isConnected = false,
  onConnect
}: ConnectServiceButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)

    // Redirect to OAuth flow
    if (provider === 'spotify') {
      window.location.href = '/api/oauth/spotify/connect'
    }
    // Add more providers here as needed

    onConnect?.()
  }

  if (isConnected) {
    return (
      <Button
        disabled
        variant="outline"
        className="rounded-xl border-green-200 bg-green-50 text-green-700 font-medium"
      >
        <LinkIcon className="w-4 h-4 mr-2" />
        Connected
      </Button>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <LinkIcon className="w-4 h-4 mr-2" />
          Connect {serviceName}
        </>
      )}
    </Button>
  )
}
