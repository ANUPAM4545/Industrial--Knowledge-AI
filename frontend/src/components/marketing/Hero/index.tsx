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

            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.15] mb-6">
              Turn your documents into an{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-400 via-purple-400 to-amber-400 animate-gradient-x block sm:inline">
                AI assistant your team can chat with.
              </span>
            </h1>
          </m.div>

          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg lg:text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed"
          >
            Find answers in thousands of PDFs, manuals, and reports in seconds. Every answer includes the exact document it came from, so you can always trust the source.
          </m.p>

          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link to="/register" className="btn-primary group h-12 px-6 text-base">
              Upload Your First Document
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#demo" className="btn-secondary h-12 px-6 text-base">
              See How It Works
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
          <div className="relative w-full aspect-[4/3] rounded-2xl liquid-glass border border-[var(--border-subtle)] shadow-2xl overflow-hidden transform-gpu hover:rotate-y-[-5deg] hover:rotate-x-[5deg] transition-transform duration-700 ease-out">
            
            {/* Fake Mac Header */}
            <div className="h-10 bg-[var(--bg-glass)] border-b border-[var(--border-subtle)] flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="mx-auto px-4 py-1 rounded-md bg-[var(--bg-glass-hover)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-2">
                <Search className="w-3 h-3" />
                forgemind.app / {activeView.id}
              </div>
            </div>

            {/* Simulated UI Content */}
            <div className="relative h-full w-full bg-[var(--bg-primary)] p-6 overflow-hidden">
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
                    <div className={`p-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-subtle)]`}>
                      <activeView.icon className={`w-5 h-5 ${activeView.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{activeView.name}</h3>
                  </div>

                  <div className="flex-1 flex flex-col gap-4">
                    {activeView.id === 'dashboard' && (
                      <>
                        <div className="flex gap-4">
                          <div className="h-24 flex-1 rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 flex flex-col justify-center">
                            <div className="text-xs text-[var(--text-secondary)]">Total Queries</div>
                            <div className="text-xl font-bold text-[var(--text-primary)]">1.2M</div>
                          </div>
                          <div className="h-24 flex-1 rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 flex flex-col justify-center">
                            <div className="text-xs text-[var(--text-secondary)]">Avg Latency</div>
                            <div className="text-xl font-bold text-[var(--text-primary)]">42ms</div>
                          </div>
                          <div className="h-24 flex-1 rounded-xl bg-green-500/10 border border-green-500/20 p-3 flex flex-col justify-center">
                            <div className="text-xs text-[var(--text-secondary)]">Active Agents</div>
                            <div className="text-xl font-bold text-[var(--text-primary)]">14</div>
                          </div>
                        </div>
                        <div className="flex-1 rounded-xl bg-[var(--bg-glass-hover)] border border-[var(--border-subtle)] p-4 flex items-end gap-2">
                          {[40, 70, 45, 90, 65, 85, 120, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-forge-500/40 rounded-t-sm" style={{ height: `${h}px` }} />
                          ))}
                        </div>
                      </>
                    )}
                    {activeView.id === 'chat' && (
                      <>
                        <div className="flex-1 rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col gap-3 overflow-hidden">
                          <div className="bg-[var(--bg-glass)] p-3 rounded-xl rounded-tl-none self-start max-w-[80%] border border-[var(--border-subtle)]">
                            <div className="text-xs text-[var(--text-primary)]">Analyze the Q3 sensor data from Plant Alpha.</div>
                          </div>
                          <div className="bg-purple-500/10 p-3 rounded-xl rounded-tr-none self-end max-w-[80%] border border-purple-500/20">
                            <div className="text-xs text-[var(--text-primary)]">Analysis complete. Detected 15% increase in thermal variance.</div>
                          </div>
                        </div>
                        <div className="h-10 rounded-xl bg-[var(--bg-glass-hover)] border border-[var(--border-subtle)] flex items-center px-3 gap-2">
                          <div className="w-4 h-4 rounded-full bg-forge-500/50" />
                          <div className="h-2 w-32 bg-[var(--text-muted)]/30 rounded-full" />
                        </div>
                      </>
                    )}
                    {activeView.id === 'knowledge' && (
                      <>
                        <div className="flex gap-2">
                          <div className="h-8 flex-1 rounded-lg bg-[var(--bg-glass-hover)] border border-[var(--border-subtle)] px-3 flex items-center text-xs text-[var(--text-secondary)]">Search vector DB...</div>
                          <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <Search className="w-3 h-3 text-amber-500" />
                          </div>
                        </div>
                        <div className="flex-1 rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-subtle)]">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <div className="flex-1">
                              <div className="h-2 w-24 bg-[var(--text-primary)] rounded-full mb-1" />
                              <div className="h-1.5 w-16 bg-[var(--text-muted)] rounded-full" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-subtle)]">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <div className="flex-1">
                              <div className="h-2 w-32 bg-[var(--text-primary)] rounded-full mb-1" />
                              <div className="h-1.5 w-20 bg-[var(--text-muted)] rounded-full" />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {activeView.id === 'security' && (
                      <>
                        <div className="h-24 rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center justify-between">
                          <div>
                            <div className="text-red-400 font-bold mb-1">2 Threats Blocked</div>
                            <div className="text-xs text-[var(--text-secondary)]">Prompt injections mitigated in the last 1h.</div>
                          </div>
                          <ShieldCheck className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="flex-1 rounded-xl bg-[var(--bg-glass-hover)] border border-[var(--border-subtle)] p-4">
                          <div className="text-xs font-mono text-[var(--text-muted)] mb-3">Recent Activity</div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-red-400">Blocked: "Ignore previous..."</span>
                              <span className="text-[var(--text-muted)]">2m ago</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-green-400">Allowed: "Summarize logs"</span>
                              <span className="text-[var(--text-muted)]">5m ago</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {activeView.id === 'dev' && (
                      <div className="flex-1 rounded-xl bg-[#0a0a0a] border border-[var(--border-subtle)] p-4 font-mono text-xs flex flex-col gap-2 overflow-hidden shadow-inner">
                        <div className="text-green-400">$ npm install @forgemind/sdk</div>
                        <div className="text-slate-400">Installing dependencies...</div>
                        <div className="text-blue-400">added 12 packages in 2s</div>
                        <div className="text-green-400 mt-2">$ forgemind init</div>
                        <div className="text-slate-300">Initializing new AI workspace...</div>
                        <div className="flex gap-2 mt-2">
                          <span className="text-purple-400">import</span> 
                          <span className="text-yellow-300">&#123; ForgeMind &#125;</span> 
                          <span className="text-purple-400">from</span> 
                          <span className="text-green-300">'@forgemind/sdk'</span>
                        </div>
                      </div>
                    )}
                  </div>
                </m.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Floating UI Badges */}
          <m.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-8 top-12 p-4 rounded-xl liquid-glass border border-[var(--border-subtle)] shadow-xl flex items-center gap-3"
          >
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <div className="text-xs font-medium text-[var(--text-primary)]">AI Guardrails Active</div>
          </m.div>

          <m.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-8 bottom-12 p-4 rounded-xl liquid-glass border border-[var(--border-subtle)] shadow-xl flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-forge-500 animate-ping" />
            <div className="text-xs font-medium text-[var(--text-primary)]">60fps Streaming</div>
          </m.div>
        </m.div>

      </div>
    </section>
  )
}
