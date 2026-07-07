import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Terminal, LayoutDashboard, RefreshCcw } from 'lucide-react'
import { m } from 'framer-motion'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { usePWA } from '@/hooks/usePWA'

export function NotFoundPage() {
  const { clearCache } = usePWA()

  const handleClearCache = async () => {
    await clearCache()
    window.location.reload()
  }
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-8 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-forge-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="text-center max-w-2xl relative z-10">
        
        {/* Animated 404 Illustration */}
        <div className="relative w-64 h-64 mx-auto mb-8 perspective-1000">
           <m.div 
             animate={{ rotateY: [0, 10, -10, 0], rotateX: [0, 5, -5, 0] }} 
             transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
             className="w-full h-full bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-2xl shadow-2xl flex flex-col p-6 backdrop-blur-xl relative overflow-hidden"
           >
             <div className="absolute inset-0 bg-gradient-to-br from-forge-500/10 to-transparent pointer-events-none" />
             <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-subtle)] pb-2">
                <Terminal className="w-4 h-4 text-forge-500" />
                <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">system_error.log</span>
             </div>
             <div className="flex-1 font-mono text-left text-xs text-[var(--text-muted)] flex flex-col gap-2">
                <p><span className="text-status-danger">ERR!</span> Resource not located</p>
                <p><span className="text-forge-400">INFO</span> Initiating fallback...</p>
                <m.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-forge-500 mt-2" />
             </div>
             
             {/* Huge 404 Overlay */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-overlay">
               <span className="text-8xl font-black text-[var(--bg-primary)] opacity-50 select-none">404</span>
             </div>
           </m.div>
        </div>

        <m.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
          Page Not Found
        </m.h1>
        <m.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[var(--text-secondary)] text-lg mb-10 leading-relaxed max-w-md mx-auto">
          The page you're looking for doesn't exist, has been moved, or you don't have access to it.
        </m.p>
        
        <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/">
            <MagneticButton className="px-6 py-3 bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--bg-primary)] rounded-xl font-bold flex items-center gap-2 transition-colors">
              <Home className="w-4 h-4" /> Back to Home
            </MagneticButton>
          </Link>
          <Link to="/app/dashboard">
            <MagneticButton className="px-6 py-3 bg-[var(--surface-primary)] hover:bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl font-semibold flex items-center gap-2 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </MagneticButton>
          </Link>
        </m.div>

        <m.button 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }} 
          onClick={handleClearCache} 
          className="mt-6 text-sm font-semibold text-forge-400 hover:text-forge-300 flex items-center gap-2 mx-auto transition-colors group px-4 py-2 bg-forge-500/10 rounded-lg hover:bg-forge-500/20"
        >
          <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> Force Reload App (Fixes Missing Pages)
        </m.button>

        <m.button 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }} 
          onClick={() => window.history.back()} 
          className="mt-8 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-2 mx-auto transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Go back to previous page
        </m.button>
      </div>
    </div>
  )
}
