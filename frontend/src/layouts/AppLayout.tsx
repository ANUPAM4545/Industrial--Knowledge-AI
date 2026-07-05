import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Database, Upload, MessageSquare,
  BarChart3, Settings, LogOut, Menu, X, Zap, Users, Sparkles
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useToastStore } from '@/store/toastStore'
import { ToastContainer } from '@/components/ui/Toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/app/dashboard',      icon: LayoutDashboard,  label: 'Dashboard'       },
  { path: '/app/knowledge-base', icon: Database,          label: 'Knowledge Base'  },
  { path: '/app/upload',         icon: Upload,            label: 'Upload Documents' },
  { path: '/app/chat',           icon: MessageSquare,     label: 'AI Chat'         },
  { path: '/app/analytics',      icon: BarChart3,         label: 'Analytics'       },
  { path: '/app/settings',       icon: Settings,          label: 'Settings'        },
]

import { Navigate } from 'react-router-dom'

export function AppLayout() {
  const { user, logout, isAuthenticated } = useAuthStore()
  const { sidebarOpen, toggleSidebar, demoMode, setDemoMode } = useUIStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleToggleDemoMode = () => {
    const nextMode = !demoMode
    setDemoMode(nextMode)
    addToast(
      nextMode ? 'Demo Mode enabled! Simulated document workspace registered.' : 'Demo Mode disabled.',
      nextMode ? 'success' : 'info'
    )
  }

  return (
    <div className="flex h-screen bg-[#0a0d1a] overflow-hidden">
      <ToastContainer />
      {/* ─── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={cn(
          'flex flex-col transition-all duration-300 ease-in-out',
          'bg-[#0f1327] border-r border-white/[0.06]',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06] h-16">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">ForgeMind AI</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors ml-auto"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Demo Mode Button */}
        <div className="p-3 border-b border-white/5">
          <button
            onClick={handleToggleDemoMode}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold w-full transition-all border",
              demoMode
                ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-400"
                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
            )}
            title="Toggle Demo Mode"
          >
            <Sparkles className={cn("w-4 h-4 shrink-0", demoMode ? "text-indigo-400 animate-spin" : "")} />
            {sidebarOpen && (
              <div className="flex justify-between items-center w-full">
                <span>Demo Mode</span>
                <span className={cn("text-[10px] uppercase px-1.5 py-0.5 rounded", demoMode ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-500")}>
                  {demoMode ? 'Active' : 'Off'}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-white bg-indigo-600/20 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}

          {/* Admin link — only for admins */}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mt-4 border-t border-white/5 pt-4',
                  isActive
                    ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                    : 'text-slate-400 hover:text-amber-400 hover:bg-amber-400/5'
                )
              }
              title={!sidebarOpen ? 'Admin Panel' : undefined}
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Admin Panel</span>}
            </NavLink>
          )}
        </nav>

        {/* Theme switcher */}
        {sidebarOpen && (
          <div className="px-6 py-2 border-t border-white/[0.06] flex justify-center">
            <ThemeToggle />
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {user?.full_name?.charAt(0) ?? 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
