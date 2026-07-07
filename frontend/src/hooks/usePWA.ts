import { useState, useEffect, useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  // virtual:pwa-register hook handles SW registration and update lifecycle
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ', r)
    },
    onRegisterError(error: Error) {
      console.error('SW registration error', error)
    },
  })

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true)
    }

    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches)
    }

    const mql = window.matchMedia('(display-mode: standalone)')
    mql.addEventListener('change', handleDisplayModeChange)

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPromptEvent(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      mql.removeEventListener('change', handleDisplayModeChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!installPromptEvent) return

    installPromptEvent.prompt()
    const { outcome } = await installPromptEvent.userChoice
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setInstallPromptEvent(null)
    } else {
      console.log('User dismissed the install prompt')
    }
  }, [installPromptEvent])

  const clearCache = useCallback(async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('Caches cleared')
    }
  }, [])

  return {
    isInstalled,
    canInstall: !!installPromptEvent && !isInstalled,
    promptInstall,
    needRefresh,
    offlineReady,
    updateApp: () => updateServiceWorker(true),
    clearCache,
    closeUpdatePrompt: () => setNeedRefresh(false)
  }
}
