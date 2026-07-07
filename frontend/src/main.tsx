import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { router } from './routes'
import { useThemeStore } from './store/themeStore'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Access the key from .env
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''
console.log("Loaded Clerk Key:", CLERK_PUBLISHABLE_KEY)

function ClerkThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (theme === 'system') {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
      
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches)
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    } else {
      setIsDark(theme === 'dark')
    }
  }, [theme])

  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: '#3b82f6', // Tailwind blue-500
        }
      }}
    >
      {children}
    </ClerkProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkThemeWrapper>
        <RouterProvider router={router} />
      </ClerkThemeWrapper>
    </QueryClientProvider>
  </StrictMode>,
)
