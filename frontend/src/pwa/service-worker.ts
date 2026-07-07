/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoutes } from './cache'
import { registerBackgroundSync } from './background-sync'

declare let self: ServiceWorkerGlobalScope

// Skip waiting if requested (e.g. from the update prompt)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Automatically claim clients so new SW takes over immediately after activation
clientsClaim()

// Precache the Vite build assets
precacheAndRoute(self.__WB_MANIFEST)

// Register caching strategies
registerRoutes()

// Register background sync queues
registerBackgroundSync()
