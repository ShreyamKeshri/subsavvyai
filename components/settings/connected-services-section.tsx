'use client'

/**
 * Connected Services Section Component
 * OAuth service management based on Vercel design
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Loader2 } from 'lucide-react'
import { getConnectedServices } from '@/lib/usage/usage-actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  logo: string
  isConnected: boolean
  connectedDate?: string
}

const AVAILABLE_SERVICES: Service[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    logo: '🎵',
    isConnected: false,
  },
]

export function ConnectedServicesSection() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>(AVAILABLE_SERVICES)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    loadConnectedServices()
  }, [])

  const loadConnectedServices = async () => {
    const result = await getConnectedServices()
    if (result.success && result.data) {
      const connectedServiceNames = result.data
      setServices(prev =>
        prev.map(service => ({
          ...service,
          isConnected: connectedServiceNames.includes(service.id),
          connectedDate: connectedServiceNames.includes(service.id)
            ? new Date().toISOString().split('T')[0]
            : undefined,
        }))
      )
    }
  }

  const handleToggleService = async (id: string, isConnected: boolean) => {
    if (!isConnected) {
      // Connect service
      if (id === 'spotify') {
        setLoadingId(id)
        router.push('/api/oauth/spotify/connect')
      } else {
        toast.info('This service integration is coming soon')
      }
    } else {
      // Disconnect service
      toast.warning('Disconnect functionality coming soon')
    }
  }

  const connectedCount = services.filter(s => s.isConnected).length

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-purple-500" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">Connected Services</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {connectedCount} of {services.length} connected
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{service.logo}</div>
              <div>
                <p className="font-medium text-foreground">{service.name}</p>
                {service.isConnected && service.connectedDate && (
                  <p className="text-xs text-muted-foreground">Connected</p>
                )}
                {!service.isConnected && <p className="text-xs text-muted-foreground">Not connected</p>}
              </div>
            </div>

            <Button
              onClick={() => handleToggleService(service.id, service.isConnected)}
              disabled={loadingId === service.id}
              variant={service.isConnected ? 'outline' : 'default'}
              className={service.isConnected ? '' : 'bg-blue-500 hover:bg-blue-600 text-white'}
              size="sm"
            >
              {loadingId === service.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : service.isConnected ? (
                'Disconnect'
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-foreground">
          <span className="font-semibold">AI-Powered Recommendations:</span> Connect services to unlock personalized
          savings recommendations based on your actual usage patterns.
        </p>
      </div>
    </Card>
  )
}
