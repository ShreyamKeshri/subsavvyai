import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { getFirebaseApp } from './config'

/**
 * Request notification permission and get FCM token
 * This token is used to send push notifications to the user's device
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return null
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.warn('This browser does not support service workers')
      return null
    }

    // Request permission
    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      console.warn('Notification permission denied')
      return null
    }

    // Get FCM token
    const app = getFirebaseApp()
    const messaging = getMessaging(app)

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    if (token) {
      console.log('FCM Token:', token)
      return token
    } else {
      console.warn('No FCM token available')
      return null
    }
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

/**
 * Listen for foreground messages
 * These are messages received when the app is open and in focus
 */
export function onForegroundMessage(callback: (payload: unknown) => void) {
  try {
    const app = getFirebaseApp()
    const messaging = getMessaging(app)

    return onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)
      callback(payload)
    })
  } catch (error) {
    console.error('Error setting up foreground message listener:', error)
    return () => {} // Return empty cleanup function
  }
}
