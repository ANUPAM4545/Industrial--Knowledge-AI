import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'

export function registerBackgroundSync() {
  const analyticsQueue = new BackgroundSyncPlugin('queued-analytics', {
    maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
  })

  const feedbackQueue = new BackgroundSyncPlugin('queued-feedback', {
    maxRetentionTime: 24 * 60 
  })

  // Register route for analytics mutations (POST, PUT, DELETE)
  registerRoute(
    ({ url }) => url.pathname.includes('/api/v1/analytics'),
    new NetworkOnly({
      plugins: [analyticsQueue]
    }),
    'POST'
  )

  // Register route for feedback mutations
  registerRoute(
    ({ url }) => url.pathname.includes('/api/v1/feedback'),
    new NetworkOnly({
      plugins: [feedbackQueue]
    }),
    'POST'
  )
}
