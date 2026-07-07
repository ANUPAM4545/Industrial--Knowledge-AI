import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Database, Upload, MessageSquare, Network, GitMerge, Terminal,
  BarChart3, Settings, LogOut, Menu, X, Zap, Users, Sparkles, Bell, Search, Download
} from 'lucide-react'
import { useAuth, useUser, useClerk } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { useUIStore } from '@/store/uiStore'
import { useToastStore } from '@/store/toastStore'
import { ToastContainer } from '@/components/ui/Toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { DemoTour } from '@/components/ui/DemoTour'
import { cn } from '@/lib/utils'
import { apiClient } from '@/services/apiClient'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '@/hooks/usePWA'

const navItems = [
  { path: '/app/dashboard',      icon: LayoutDashboard,  label: 'Dashboard',      id: 'nav-dashboard'      },
  { path: '/app/explorer',       icon: Network,           label: 'Knowledge Explorer', id: 'nav-explorer'  },
  { path: '/app/workflows',      icon: GitMerge,          label: 'AI Workflows',   id: 'nav-workflows'      },
  { path: '/app/playground',     icon: Terminal,          label: 'AI Playground',  id: 'nav-playground'     },
  { path: '/app/knowledge-base', icon: Database,          label: 'Knowledge Base', id: 'nav-knowledge'      },
  { path: '/app/upload',         icon: Upload,            label: 'Upload Documents', id: 'nav-upload'       },
  { path: '/app/chat',           icon: MessageSquare,     label: 'AI Chat',        id: 'nav-chat'           },
  { path: '/app/analytics',      icon: BarChart3,         label: 'Analytics',      id: 'nav-analytics'      },
  { path: '/app/settings',       icon: Settings,          label: 'Settings',       id: 'nav-settings'       },
]

export function AppLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { user: clerkUser } = useUser()
  const { signOut } = useClerk()
  
  const { sidebarOpen, toggleSidebar, workspaceMode, setWorkspaceMode } = useUIStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()
  
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)
  const { isInstalled, canInstall, promptInstall, needRefresh, updateApp, closeUpdatePrompt } = usePWA()

  const { data: dbUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const token = await getToken()
      const res = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5,
  })

  if (!isLoaded) {
    return (
      <div className="h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="shimmer-loading w-32 h-32 rounded-full opacity-50 absolute mix-blend-screen" />
        <Zap className="w-8 h-8 text-forge-500 animate-pulse relative z-10" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden mesh-bg relative pt-safe pb-safe">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-forge-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      <ToastContainer />
      <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />
      <DemoTour />

      {/* PWA Update Toast */}
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 p-4 rounded-2xl liquid-glass border border-forge-500/30 shadow-glow-md"
          >
            <div className="w-10 h-10 rounded-full bg-forge-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-forge-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">New version available</p>
              <p className="text-xs text-[var(--text-secondary)]">Update now to get the latest features.</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button onClick={closeUpdatePrompt} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] transition-all">Later</button>
              <button onClick={updateApp} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-forge-gradient text-white shadow-glow-sm hover:opacity-90 transition-all">Update Now</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Install Banner */}
      <AnimatePresence>
        {canInstall && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden absolute top-0 left-0 w-full z-40 bg-forge-600 text-white px-4 py-2 flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Install NEXO</span>
              <span className="text-xs text-white/80">Add to home screen</span>
            </div>
            <button onClick={promptInstall} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">Install</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Floating Sidebar ─────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="flex flex-col m-4 mr-0 rounded-2xl liquid-glass z-20 border border-[var(--border-subtle)] relative overflow-hidden"
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] h-20">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
              >
                <div className="w-8 h-8 rounded-xl bg-forge-gradient flex items-center justify-center shadow-glow-sm">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-[var(--text-primary)] tracking-wide">NEXO</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] transition-all ml-auto"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Demo Mode Button */}
        <div className="p-4">
          <button
            onClick={() => setWorkspaceMode(workspaceMode === 'demo' ? 'live' : 'demo')}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold w-full transition-all border overflow-hidden",
              workspaceMode === 'demo'
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-glow-sm"
                : "bg-[var(--bg-glass)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
            )}
            title="Toggle Demo Workspace"
          >
            <Sparkles className={cn("w-4 h-4 shrink-0", workspaceMode === 'demo' ? "text-indigo-400 animate-spin" : "")} />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex justify-between items-center flex-1 whitespace-nowrap overflow-hidden"
                >
                  <span className="ml-1">Demo Workspace</span>
                  <span className={cn("text-[10px] uppercase px-1.5 py-0.5 rounded ml-2", workspaceMode === 'demo' ? "bg-indigo-500/20 text-indigo-300" : "bg-[var(--bg-glass-hover)] text-[var(--text-muted)]")}>
                    {workspaceMode === 'demo' ? 'ON' : 'OFF'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label, id }) => (
            <NavLink
              key={path}
              id={id}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden whitespace-nowrap',
                  isActive
                    ? 'text-forge-400 bg-forge-500/10 border border-forge-500/20 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] border border-transparent'
                )
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}

          {/* Admin link */}
          {dbUser?.role === 'admin' && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 mt-4 border-t border-[var(--border-subtle)] pt-4 group overflow-hidden whitespace-nowrap',
                  isActive
                    ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                    : 'text-[var(--text-secondary)] hover:text-amber-400 hover:bg-amber-400/5'
                )
              }
              title={!sidebarOpen ? 'Admin Panel' : undefined}
            >
              <Users className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Admin Panel
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-center lg:justify-start gap-3 p-2 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-forge-gradient flex items-center justify-center flex-shrink-0 text-sm font-bold text-white shadow-glow-sm">
              {dbUser?.full_name?.charAt(0) ?? clerkUser?.firstName?.charAt(0) ?? 'U'}
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0 flex justify-between items-center pr-1"
              >
                <div className="flex flex-col truncate">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{dbUser?.full_name ?? clerkUser?.fullName}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold truncate">{dbUser?.department ?? dbUser?.role ?? 'Role'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ─── Main Content Container ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Floating Top Navbar */}
        <header className="h-20 px-8 flex items-center justify-between z-30 flex-shrink-0">
          <div className="flex-1 max-w-xl">
            <div 
              onClick={() => setCmdPaletteOpen(true)}
              className="flex items-center px-4 py-2.5 rounded-full liquid-glass border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:shadow-glass-md transition-all cursor-text group"
            >
              <Search className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-forge-400 transition-colors mr-3" />
              <span className="flex-1 text-sm text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                Search documents, insights, chats...
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-md text-[10px] text-[var(--text-secondary)] font-mono font-bold">
                ⌘ K
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            {canInstall && (
              <button 
                onClick={promptInstall}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-forge-500/10 border border-forge-500/20 hover:border-forge-500/40 text-forge-400 text-sm font-semibold transition-all shadow-glow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Install NEXO</span>
              </button>
            )}
            <ThemeToggle />
            <NotificationDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 relative scroll-smooth">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

