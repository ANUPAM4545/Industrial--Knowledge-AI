import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// ─── Request Interceptor: attach JWT ────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    // @ts-ignore
    const clerk = window.Clerk
    if (clerk && clerk.session) {
      try {
        const token = await clerk.session.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (e) {
        console.error("Failed to fetch Clerk token", e)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor: handle 401 ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // @ts-ignore
      const clerk = window.Clerk
      if (clerk) {
        await clerk.signOut()
      }
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
