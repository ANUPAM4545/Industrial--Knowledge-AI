import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Zap } from 'lucide-react'

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }
  return (
    <div className="min-h-screen bg-[#0a0d1a] flex">
      {/* ─── Left Panel (Branding) ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 forge-gradient-bg opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-forge-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ForgeMind AI</span>
          </div>

          {/* Hero Text */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Industrial Knowledge<br />
              <span className="text-forge-300">Intelligence Platform</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
              Upload SOPs, manuals, and maintenance logs. Query your entire
              knowledge base with AI-powered RAG chat and source citations.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-3 pt-4">
              {['RAG-Powered Chat', 'OCR Ready', 'Source Citations', 'Role-Based Access'].map((feat) => (
                <span
                  key={feat}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-slate-400 text-sm">
            © 2025 ForgeMind AI. Built for industrial teams.
          </p>
        </div>
      </div>

      {/* ─── Right Panel (Form) ─────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-forge-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">ForgeMind AI</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
