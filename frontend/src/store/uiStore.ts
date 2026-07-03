import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeDocumentId: string | null
  uploadModalOpen: boolean

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveDocument: (id: string | null) => void
  setUploadModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  activeDocumentId: null,
  uploadModalOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveDocument: (id) => set({ activeDocumentId: id }),
  setUploadModalOpen: (open) => set({ uploadModalOpen: open }),
}))
