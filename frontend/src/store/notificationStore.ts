import { create } from 'zustand'
import { apiClient } from '@/services/apiClient'
import { useAuth } from '@clerk/clerk-react'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error' | 'system' | 'ai' | 'security' | 'workflow'
  category: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  action_url?: string
  action_label?: string
  icon?: string
  metadata_json?: any
  is_read: boolean
  created_at: string
  expires_at?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  eventSource: EventSource | null
  
  fetchNotifications: (token: string) => Promise<void>
  markAsRead: (id: string, token: string) => Promise<void>
  markAllAsRead: (token: string) => Promise<void>
  deleteNotification: (id: string, token: string) => Promise<void>
  
  connectSSE: (getToken: () => Promise<string | null>) => void
  disconnectSSE: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  eventSource: null,

  fetchNotifications: async (token: string) => {
    set({ isLoading: true })
    try {
      const res = await apiClient.get('/notifications?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const items = res.data.items || []
      set({ 
        notifications: items,
        unreadCount: items.filter((n: Notification) => !n.is_read).length,
        isLoading: false
      })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      set({ isLoading: false })
    }
  },

  markAsRead: async (id: string, token: string) => {
    try {
      await apiClient.post(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const { notifications } = get()
      const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
      
      set({ 
        notifications: updated,
        unreadCount: updated.filter(n => !n.is_read).length
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  },

  markAllAsRead: async (token: string) => {
    try {
      await apiClient.post(`/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const { notifications } = get()
      const updated = notifications.map(n => ({ ...n, is_read: true }))
      
      set({ 
        notifications: updated,
        unreadCount: 0
      })
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  },

  deleteNotification: async (id: string, token: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const { notifications } = get()
      const updated = notifications.filter(n => n.id !== id)
      
      set({ 
        notifications: updated,
        unreadCount: updated.filter(n => !n.is_read).length
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  },

  connectSSE: async (getToken: () => Promise<string | null>) => {
    const { eventSource } = get()
    if (eventSource) return // Already connected
    
    // Create EventSource URL (Vite proxies this in dev, NGINX in prod)
    // We pass the token as a query parameter because EventSource doesn't support headers natively
    // We'll append it just so NGINX/Auth can verify, but since we are using Clerk, standard EventSource might be tricky if backend requires Authorization header.
    // Wait, FastAPI with Clerk expects the token in the `Authorization` header.
    // Since browser native `EventSource` doesn't send headers, we usually append `?token=...` and handle it in the backend, or use `fetch-event-source` lib.
    
    const token = await getToken()
    if (!token) return

    // Instead of adding a new dependency like @microsoft/fetch-event-source right now,
    // we'll pass ?token=... to the SSE endpoint and let the backend extract it if the header is missing.
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/notifications/stream?token=${token}`
    
    const es = new EventSource(url)
    
    es.onopen = () => {
      console.log('SSE connection opened')
    }

    es.addEventListener('new_notification', (event) => {
      try {
        const newNotif = JSON.parse(event.data) as Notification
        const { notifications } = get()
        // Add to beginning of array
        const updated = [newNotif, ...notifications]
        set({ 
          notifications: updated,
          unreadCount: updated.filter(n => !n.is_read).length
        })
      } catch (error) {
        console.error('Failed to parse SSE notification:', error)
      }
    })

    es.onerror = (error) => {
      console.error('SSE connection error:', error)
      es.close()
      set({ eventSource: null })
      // Simple reconnect logic
      setTimeout(() => {
        get().connectSSE(getToken)
      }, 5000)
    }

    set({ eventSource: es })
  },

  disconnectSSE: () => {
    const { eventSource } = get()
    if (eventSource) {
      eventSource.close()
      set({ eventSource: null })
    }
  }
}))
