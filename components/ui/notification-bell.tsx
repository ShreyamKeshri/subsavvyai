'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getPendingRecommendations } from '@/lib/recommendations/recommendation-actions'
import { getUserSubscriptions } from '@/lib/subscriptions/subscription-actions'

interface Notification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  type: 'recommendation' | 'billing' | 'system'
}

const STORAGE_KEY = 'subsavvyai_notification_state'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    const [recsResult, subsResult] = await Promise.all([
      getPendingRecommendations(),
      getUserSubscriptions(),
    ])

    const newNotifications: Notification[] = []

    if (recsResult.success && recsResult.data) {
      recsResult.data.slice(0, 3).forEach((rec) => {
        newNotifications.push({
          id: `rec-${rec.id}`,
          title: '💰 Savings Opportunity',
          description: `${rec.title}: Save ₹${rec.monthly_savings.toFixed(2)}/month`,
          timestamp: new Date(rec.created_at).toLocaleDateString('en-IN'),
          read: false,
          type: 'recommendation',
        })
      })
    }

    if (subsResult.success && subsResult.data) {
      const activeSubscriptions = subsResult.data.filter(s => s.status === 'active')
      activeSubscriptions.forEach((sub) => {
        const nextBillingDate = new Date(sub.next_billing_date)
        const daysUntilBilling = Math.ceil((nextBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

        if (daysUntilBilling <= 3 && daysUntilBilling >= 0) {
          newNotifications.push({
            id: `billing-${sub.id}`,
            title: 'Subscription Expiring Soon',
            description: `${sub.service?.name || sub.custom_service_name} renews in ${daysUntilBilling} day${daysUntilBilling !== 1 ? 's' : ''}`,
            timestamp: new Date().toLocaleDateString('en-IN'),
            read: false,
            type: 'billing',
          })
        }
      })
    }

    // Load saved notification state from localStorage
    const savedState = loadNotificationState()

    // Merge saved state with new notifications
    const mergedNotifications = newNotifications.map(notification => {
      const saved = savedState[notification.id]
      if (saved) {
        return { ...notification, read: saved.read }
      }
      return notification
    })

    setNotifications(mergedNotifications.slice(0, 10))
  }

  const loadNotificationState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved) as Record<string, { read: boolean; deletedAt?: string }>
      }
    } catch (error) {
      console.error('Failed to load notification state:', error)
    }
    return {}
  }

  const saveNotificationState = (notifs: Notification[]) => {
    try {
      const state: Record<string, { read: boolean }> = {}
      notifs.forEach(n => {
        state[n.id] = { read: n.read }
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save notification state:', error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      saveNotificationState(updated)
      return updated
    })
  }

  const handleMarkAsUnread = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      saveNotificationState(updated)
      return updated
    })
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      saveNotificationState(updated)
      return updated
    })
  }

  const handleClearAll = () => {
    setIsLoading(true)
    setTimeout(() => {
      setNotifications([])
      setIsLoading(false)
    }, 300)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Clearing...' : 'Clear all'}
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-accent/50 transition-colors ${
                    !notification.read ? 'bg-accent/20' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground truncate">{notification.title}</h4>
                        {!notification.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-2">{notification.timestamp}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-2">
                    {!notification.read ? (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs px-2 py-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Mark read
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsUnread(notification.id)}
                        className="text-xs px-2 py-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Mark unread
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-xs px-2 py-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
