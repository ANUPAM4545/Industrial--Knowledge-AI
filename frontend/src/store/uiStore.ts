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
  demoMode: boolean
  theme: 'dark' | 'light' | 'system'

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveDocument: (id: string | null) => void
  setUploadModalOpen: (open: boolean) => void
  setSplitPaneWidth: (width: number) => void
  setZoomLevel: (zoom: number) => void
  setLastViewedPage: (docId: string, page: number) => void
  setDeveloperMode: (mode: boolean) => void
  setDemoMode: (mode: boolean) => void
  setTheme: (theme: 'dark' | 'light' | 'system') => void
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
  demoMode: getLocal('demoMode', false),
  theme: getLocal<'dark' | 'light' | 'system'>('theme', 'dark'),

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

  setDemoMode: (mode) => set(() => {
    setLocal('demoMode', mode)
    if (mode) {
      // Auto enable Developer Mode for best dashboard diagnostics display
      setLocal('developerMode', true)
      return { demoMode: true, developerMode: true }
    }
    return { demoMode: false }
  }),

  setTheme: (theme) => set(() => {
    setLocal('theme', theme)
    applyTheme(theme)
    return { theme }
  }),
}))

// Run theme check immediately at runtime bootstrap
applyTheme(getLocal<'dark' | 'light' | 'system'>('theme', 'dark'))

