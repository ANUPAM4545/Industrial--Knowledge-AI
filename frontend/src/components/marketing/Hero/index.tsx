import React, { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, ShieldCheck, Database, LayoutDashboard, 
  Terminal, Search, Settings, FileText, Bot
} from 'lucide-react'

// Mock previews for the interactive simulator
const SIMULATION_VIEWS = [
  { id: 'dashboard', name: 'Executive Dashboard', icon: LayoutDashboard, color: 'text-forge-400' },
  { id: 'chat', name: 'AI Chat', icon: Bot, color: 'text-purple-400' },
  { id: 'knowledge', name: 'Knowledge Explorer', icon: Database, color: 'text-amber-400' },
  { id: 'security', name: 'Security Center', icon: ShieldCheck, color: 'text-red-400' },
  { id: 'dev', name: 'Developer Mode', icon: Terminal, color: 'text-green-400' },
]

export function Hero() {
  const [activeViewIndex, setActiveViewIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveViewIndex((prev) => (prev + 1) % SIMULATION_VIEWS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const activeView = SIMULATION_VIEWS[activeViewIndex]

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden">
      {/* Cinematic Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-forge-500/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side: Typography & CTA */}
        <div className="space-y-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forge-500/10 border border-forge-500/20 text-forge-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forge-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-forge-500"></span>
              </span>
              ForgeMind AI v2.0 is live
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              The Enterprise <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-400 via-purple-400 to-amber-400 animate-gradient-x">
                Knowledge OS.
              </span>
            </h1>
          </m.div>

          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg lg:text-xl text-slate-400 max-w-xl leading-relaxed"
          >
            Unify your industrial data. ForgeMind is a complete AI platform featuring hybrid retrieval, RBAC, adaptive security, and an explainable reasoning engine.
          </m.p>

          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link to="/register" className="btn-primary group h-12 px-6 text-base">
              Start Building Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#demo" className="btn-secondary h-12 px-6 text-base">
              View Interactive Demo
            </a>
          </m.div>
        </div>

        {/* Right Side: Interactive Product Simulation */}
        <m.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative perspective-1000"
        >
          {/* Glass Mockup Frame */}
          <div className="relative w-full aspect-[4/3] rounded-2xl liquid-glass border border-white/10 shadow-2xl overflow-hidden transform-gpu hover:rotate-y-[-5deg] hover:rotate-x-[5deg] transition-transform duration-700 ease-out">
            
            {/* Fake Mac Header */}
            <div className="h-10 bg-white/[0.03] border-b border-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="mx-auto px-4 py-1 rounded-md bg-white/[0.02] border border-white/5 text-[10px] text-slate-500 font-mono flex items-center gap-2">
                <Search className="w-3 h-3" />
                forgemind.app / {activeView.id}
              </div>
            </div>

            {/* Simulated UI Content */}
            <div className="relative h-full w-full bg-[#0B0F19] p-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <m.div
                  key={activeView.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 p-6 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`p-2 rounded-lg bg-white/[0.03] border border-white/5`}>
                      <activeView.icon className={`w-5 h-5 ${activeView.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{activeView.name}</h3>
                  </div>

                  {/* Abstract skeleton representation of the UI */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="h-24 flex-1 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
                      <div className="h-24 flex-1 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse delay-75" />
                      <div className="h-24 flex-1 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse delay-150" />
                    </div>
                    <div className="flex-1 rounded-xl bg-white/[0.02] border border-white/5 flex p-4 gap-4">
                       <div className="w-1/3 h-full rounded-lg bg-white/[0.02]" />
                       <div className="flex-1 h-full rounded-lg bg-white/[0.02]" />
                    </div>
                  </div>
                </m.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Floating UI Badges */}
          <m.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-8 top-12 p-4 rounded-xl liquid-glass border border-white/10 shadow-xl flex items-center gap-3"
          >
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <div className="text-xs font-medium text-white">AI Guardrails Active</div>
          </m.div>

          <m.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-8 bottom-12 p-4 rounded-xl liquid-glass border border-white/10 shadow-xl flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-forge-500 animate-ping" />
            <div className="text-xs font-medium text-white">60fps Streaming</div>
          </m.div>
        </m.div>

      </div>
    </section>
  )
}
