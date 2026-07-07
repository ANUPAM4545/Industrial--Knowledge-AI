import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeDocumentId: string | null
  uploadModalOpen: boolean

  // Explainable Viewer Preferences
  splitPaneWidth: number
  zoomLevel: number
  lastViewedPages: Record<string, number>
  developerMode: boolean
  workspaceMode: 'empty' | 'demo' | 'live'
  tourState: {
    isActive: boolean
    currentStep: number
    hasSeenTour: boolean
  }
  theme: 'dark' | 'light' | 'system'
  
  // Notification Preferences
  notifications: {
    email: boolean
    push: boolean
    weeklyReport: boolean
  }

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveDocument: (id: string | null) => void
  setUploadModalOpen: (open: boolean) => void
  setSplitPaneWidth: (width: number) => void
  setZoomLevel: (zoom: number) => void
  setLastViewedPage: (docId: string, page: number) => void
  setDeveloperMode: (mode: boolean) => void
  setWorkspaceMode: (mode: 'empty' | 'demo' | 'live') => void
  resetDemoWorkspace: () => void
  setTourState: (state: Partial<UIState['tourState']>) => void
  setTheme: (theme: 'dark' | 'light' | 'system') => void
  setNotifications: (prefs: Partial<UIState['notifications']>) => void
}

export const applyTheme = (theme: 'dark' | 'light' | 'system') => {
  try {
    const el = document.documentElement
    if (theme === 'light') {
      el.classList.add('light')
    } else if (theme === 'dark') {
      el.classList.remove('light')
    } else {
      const systemIsLight = window.matchMedia('(prefers-color-scheme: light)').matches
      if (systemIsLight) {
        el.classList.add('light')
      } else {
        el.classList.remove('light')
      }
    }
  } catch {}
}

const getLocal = <T>(key: string, def: T): T => {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : def
  } catch {
    return def
  }
}

const setLocal = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {}
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  activeDocumentId: null,
  uploadModalOpen: false,

  splitPaneWidth: getLocal('splitPaneWidth', 50),
  zoomLevel: getLocal('zoomLevel', 100),
  lastViewedPages: getLocal('lastViewedPages', {}),
  developerMode: getLocal('developerMode', false),
  workspaceMode: getLocal('workspaceMode', 'live'),
  tourState: getLocal('tourState', { isActive: false, currentStep: 0, hasSeenTour: false }),
  theme: getLocal<'dark' | 'light' | 'system'>('theme', 'dark'),
  
  notifications: getLocal('notifications', {
    email: true,
    push: false,
    weeklyReport: true
  }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveDocument: (id) => set({ activeDocumentId: id }),
  setUploadModalOpen: (open) => set({ uploadModalOpen: open }),

  setSplitPaneWidth: (width) => set(() => {
    setLocal('splitPaneWidth', width)
    return { splitPaneWidth: width }
  }),

  setZoomLevel: (zoom) => set(() => {
    setLocal('zoomLevel', zoom)
    return { zoomLevel: zoom }
  }),

  setLastViewedPage: (docId, page) => set((state) => {
    const updated = { ...state.lastViewedPages, [docId]: page }
    setLocal('lastViewedPages', updated)
    return { lastViewedPages: updated }
  }),

  setDeveloperMode: (mode) => set(() => {
    setLocal('developerMode', mode)
    return { developerMode: mode }
  }),

  setWorkspaceMode: (mode) => set(() => {
    setLocal('workspaceMode', mode)
    if (mode === 'demo') {
      setLocal('developerMode', true)
      return { workspaceMode: 'demo', developerMode: true }
    }
    return { workspaceMode: mode }
  }),

  resetDemoWorkspace: () => set(() => {
    // Clear any local mutations or reset the demo
    setLocal('tourState', { isActive: false, currentStep: 0, hasSeenTour: false })
    return {
      tourState: { isActive: false, currentStep: 0, hasSeenTour: false }
    }
  }),

  setTourState: (stateUpdate) => set((state) => {
    const updated = { ...state.tourState, ...stateUpdate }
    setLocal('tourState', updated)
    return { tourState: updated }
  }),

  setTheme: (theme) => set(() => {
    setLocal('theme', theme)
    applyTheme(theme)
    return { theme }
  }),

  setNotifications: (prefs) => set((state) => {
    const updated = { ...state.notifications, ...prefs }
    setLocal('notifications', updated)
    return { notifications: updated }
  }),
}))

// Run theme check immediately at runtime bootstrap
applyTheme(getLocal<'dark' | 'light' | 'system'>('theme', 'dark'))

