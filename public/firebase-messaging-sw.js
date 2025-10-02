// Firebase Cloud Messaging Service Worker
// This handles background notifications when the app is not in focus

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: 'AIzaSyBZKzkH6ypsU9A4f2Gw0i7dzDI0FYg7JVY',
  authDomain: 'unsubscribr-9d33a.firebaseapp.com',
  projectId: 'unsubscribr-9d33a',
  storageBucket: 'unsubscribr-9d33a.firebasestorage.app',
  messagingSenderId: '784717330311',
  appId: '1:784717330311:web:8b4281bf78d060e56a4522',
})

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)

  const notificationTitle = payload.notification?.title || 'Unsubscribr'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon.png', // Add your app icon here
    badge: '/badge.png', // Add your badge icon here
    data: payload.data,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  event.notification.close()

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
