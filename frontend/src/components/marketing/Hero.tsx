import React, { useState, useEffect } from 'react'
import { m, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Play, Sparkles, Terminal, Database, Shield, Layout, 
  MessageSquare, Zap, FileText, Lock, Activity, CheckCircle2, Search,
  ChevronRight, BarChart2, Server, ArrowUpRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { fadeUp, staggerContainer, textReveal } from '@/lib/animations'
import { SectionContainer } from './SectionContainer'
import { MagneticButton } from '../ui/MagneticButton'

const titleWords = "Industrial Knowledge Intelligent Decisions.".split(" ")

export function Hero() {
  const { scrollY } = useScroll()
  const previewY = useTransform(scrollY, [0, 800], [0, -100])
  const previewScale = useTransform(scrollY, [0, 500], [1, 0.95])
  const previewRotateX = useTransform(scrollY, [0, 500], [0, 5])
  
  const [activeSimulation, setActiveSimulation] = useState(0)
  
  const simulations = [
    { id: 'dashboard', icon: Layout, label: 'Dashboard View' },
    { id: 'chat', icon: MessageSquare, label: 'Streaming AI Chat' },
    { id: 'dev', icon: Terminal, label: 'Developer Trace' },
    { id: 'vector', icon: Database, label: 'Vector Indexing' },
    { id: 'secure', icon: Shield, label: 'Tenant Isolation' }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSimulation((prev) => (prev + 1) % simulations.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <SectionContainer className="pt-32 pb-20 lg:pt-48 lg:pb-32 text-center overflow-hidden">
      <m.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto relative z-10"
      >
        <m.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold mb-8 uppercase tracking-wider backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-forge-500" />
          Enterprise AI Platform
        </m.div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8 tracking-tight text-[var(--text-primary)] flex flex-wrap justify-center gap-x-4">
          {titleWords.map((word, i) => (
            <m.span 
              key={i}
              custom={i}
              variants={textReveal}
              className={i >= 2 ? "text-transparent bg-clip-text bg-gradient-to-r from-forge-500 via-forge-400 to-forge-500 animate-shimmer bg-[length:200%_auto]" : ""}
            >
              {word}
            </m.span>
          ))}
        </h1>

        <m.p 
          variants={fadeUp}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Bridge standard operating procedures, manuals, and data checklists. Retrieve and explain matching references instantly using explainable hybrid AI.
        </m.p>

        <m.div 
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24"
        >
          <Link to="/register">
            <MagneticButton className="group px-8 py-4 bg-forge-500 hover:bg-forge-400 text-white rounded-xl text-base font-bold transition-all shadow-[0_0_40px_-10px_rgba(91,110,244,0.5)]">
              Explore Demo Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
          </Link>
          <MagneticButton className="px-8 py-4 bg-[var(--surface-glass)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-base font-semibold border border-[var(--border-subtle)] transition-all backdrop-blur-sm">
            <Play className="w-5 h-5 text-[var(--text-primary)]" /> See How It Works
          </MagneticButton>
        </m.div>
      </m.div>

      {/* Hero Interactive Simulation */}
      <m.div 
        style={{ y: previewY, scale: previewScale, rotateX: previewRotateX, transformPerspective: 1200 }}
        className="relative w-full max-w-6xl mx-auto aspect-[16/9] perspective-1000 mt-12 z-20"
      >
        <div className="absolute inset-0 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-card)] backdrop-blur-xl shadow-2xl p-6 relative overflow-hidden group flex flex-col">
          {/* MacOS style window header */}
          <div className="absolute inset-x-0 top-0 h-12 border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] flex items-center px-4 gap-2 z-30">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <div className="flex-1 flex justify-center">
              <AnimatePresence mode="wait">
                <m.div 
                  key={activeSimulation}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] bg-[var(--surface-elevated)] px-3 py-1 rounded-md border border-[var(--border-subtle)] shadow-sm"
                >
                  {React.createElement(simulations[activeSimulation].icon, { className: "w-3.5 h-3.5 text-forge-500" })}
                  {simulations[activeSimulation].label}
                </m.div>
              </AnimatePresence>
            </div>
            {/* Mock Navigation controls right */}
            <div className="flex gap-2">
               <div className="w-4 h-4 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)]" />
               <div className="w-4 h-4 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)]" />
            </div>
          </div>

          {/* Simulation Content Area */}
          <div className="mt-8 flex-1 relative bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-inner p-4">
            <AnimatePresence mode="wait">
              
              {/* STATE 0: DASHBOARD */}
              {activeSimulation === 0 && (
                <m.div key="dash" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full flex flex-col gap-4">
                  <div className="flex gap-4 h-32">
                    {/* Metric 1 */}
                    <div className="flex-1 bg-[var(--surface-primary)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col justify-between overflow-hidden relative shadow-sm">
                      <div className="flex justify-between items-center text-[var(--text-secondary)]">
                        <span className="text-xs font-semibold">Total Queries</span>
                        <Activity className="w-4 h-4 text-forge-500" />
                      </div>
                      <div className="text-3xl font-bold text-[var(--text-primary)]">1.2M</div>
                      <div className="text-xs text-status-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +12.4%</div>
                      <svg className="absolute bottom-0 left-0 w-full h-12 opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,100 L0,80 C20,80 30,20 50,40 C70,60 80,10 100,20 L100,100 Z" fill="url(#grad1)" />
                        <defs><linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b6ef4"/><stop offset="100%" stopColor="transparent"/></linearGradient></defs>
                      </svg>
                    </div>
                    {/* Metric 2 */}
                    <div className="flex-1 bg-[var(--surface-primary)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col justify-between overflow-hidden relative shadow-sm">
                      <div className="flex justify-between items-center text-[var(--text-secondary)]">
                        <span className="text-xs font-semibold">Avg Latency</span>
                        <Zap className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-3xl font-bold text-[var(--text-primary)]">245<span className="text-sm text-[var(--text-secondary)] ml-1">ms</span></div>
                      <div className="text-xs text-status-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> -5ms</div>
                      <div className="absolute bottom-4 left-4 right-4 h-8 flex items-end gap-1">
                        {[40, 60, 45, 80, 55, 30, 70, 50, 90, 65].map((h, i) => (
                           <m.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05 }} className="flex-1 bg-amber-500/20 rounded-t-sm hover:bg-amber-500/50 transition-colors" />
                        ))}
                      </div>
                    </div>
                    {/* Metric 3 */}
                    <div className="flex-1 bg-forge-500/5 rounded-xl border border-forge-500/20 p-4 flex flex-col justify-between shadow-sm">
                      <div className="flex justify-between items-center text-forge-500">
                        <span className="text-xs font-semibold">Retrieval Accuracy</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="text-3xl font-bold text-forge-400">98.9%</div>
                      <div className="text-xs text-forge-500/70">Based on BM25 + Vector Fusion</div>
                    </div>
                  </div>
                  {/* Large Chart Area */}
                  <div className="flex-1 bg-[var(--surface-primary)] rounded-xl border border-[var(--border-subtle)] relative overflow-hidden p-6 flex flex-col shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Token Usage vs Queries</div>
                      <div className="flex gap-2">
                        <div className="px-2 py-1 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[10px] font-semibold border border-[var(--border-subtle)]">7D</div>
                        <div className="px-2 py-1 rounded bg-forge-500 text-white text-[10px] font-semibold">30D</div>
                      </div>
                    </div>
                    {/* Mock Grid */}
                    <div className="flex-1 relative border-l border-b border-[var(--border-subtle)]">
                      <div className="absolute inset-0 flex flex-col justify-between opacity-10">
                        {[1,2,3,4].map(i => <div key={i} className="w-full h-px bg-[var(--text-secondary)]" />)}
                      </div>
                      {/* Animated Line */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <m.path 
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          d="M0,80 Q10,60 20,70 T40,40 T60,50 T80,20 T100,10" 
                          fill="none" 
                          stroke="#5b6ef4" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                        />
                      </svg>
                      {/* Data Points */}
                      {[
                        { x: '20%', y: '70%' }, { x: '40%', y: '40%' }, 
                        { x: '60%', y: '50%' }, { x: '80%', y: '20%' }
                      ].map((pos, i) => (
                        <m.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + (i * 0.2) }} 
                          className="absolute w-3 h-3 bg-white border-2 border-forge-500 rounded-full -ml-1.5 -mt-1.5 shadow-[0_0_10px_#5b6ef4]" 
                          style={{ left: pos.x, top: pos.y }} 
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-[var(--text-muted)] font-mono">
                      <span>Oct 1</span>
                      <span>Oct 15</span>
                      <span>Oct 31</span>
                    </div>
                  </div>
                </m.div>
              )}

              {/* STATE 1: CHAT */}
              {activeSimulation === 1 && (
                <m.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col relative">
                  <div className="flex-1 flex flex-col gap-4 overflow-hidden mb-4 p-2">
                    {/* User Message */}
                    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[80%] self-end">
                      <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl rounded-tr-sm p-4 shadow-sm text-sm">
                        What is the emergency shutdown sequence for Compressor C-402?
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] text-right mt-1 mr-1">You • 10:42 AM</div>
                    </m.div>
                    
                    {/* AI Message */}
                    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-[85%] self-start flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-forge-500 flex items-center justify-center shrink-0 shadow-lg shadow-forge-500/20">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="bg-forge-500/10 border border-forge-500/20 text-[var(--text-primary)] rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed shadow-sm">
                          <p className="mb-3">According to the <span className="inline-flex items-center gap-1 bg-forge-500/20 text-forge-400 px-1.5 py-0.5 rounded text-[10px] font-bold border border-forge-500/30 cursor-pointer hover:bg-forge-500/30 transition-colors">Plant Operations Manual v3.2</span>, the emergency shutdown sequence for Compressor C-402 is:</p>
                          <ol className="list-decimal pl-4 space-y-1 text-sm font-medium">
                            <m.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>Isolate the main fuel gas supply valve (FV-104).</m.li>
                            <m.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>Engage the manual blowdown override.</m.li>
                            <m.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>Verify depressurization below 50 PSI.</m.li>
                          </ol>
                          <m.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-forge-500 mt-2 rounded-sm inline-block" />
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-2 flex items-center gap-2">
                           <Sparkles className="w-3 h-3 text-forge-500" />
                           Generated in 0.8s
                        </div>
                      </div>
                    </m.div>
                  </div>
                  
                  {/* Chat Input */}
                  <div className="h-14 w-full bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-xl mt-auto flex items-center px-4 gap-3 shadow-md">
                    <Search className="w-5 h-5 text-[var(--text-secondary)]" />
                    <div className="flex-1 text-sm text-[var(--text-muted)] font-mono">Ask ForgeMind AI...</div>
                    <div className="w-8 h-8 rounded-lg bg-forge-500 flex items-center justify-center cursor-pointer shadow-lg shadow-forge-500/20">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </m.div>
              )}

              {/* STATE 2: DEVELOPER TRACE */}
              {activeSimulation === 2 && (
                <m.div key="dev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full bg-[#0d1117] rounded-xl p-5 font-mono text-xs border border-forge-500/30 overflow-hidden relative shadow-inner">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#30363d]">
                    <div className="text-[#c9d1d9] font-bold flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> Trace Console
                    </div>
                    <div className="flex gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">200 OK</span>
                      <span className="px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">845ms</span>
                    </div>
                  </div>

                  <m.div className="space-y-3">
                    <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex gap-4">
                      <span className="text-[#8b949e]">00:00.00</span>
                      <span className="text-blue-400 font-bold">GET</span>
                      <span className="text-[#c9d1d9]">/api/v1/query</span>
                    </m.div>
                    
                    <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex gap-4 pl-16">
                      <div className="w-full relative">
                        <div className="text-[#8b949e] mb-1">↳ Embedding Generation (FastEmbed)</div>
                        <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
                          <m.div initial={{ width: 0 }} animate={{ width: '30%' }} transition={{ delay: 0.3, duration: 0.5 }} className="h-full bg-purple-500" />
                        </div>
                        <div className="text-[9px] text-[#8b949e] mt-0.5 text-right">150ms</div>
                      </div>
                    </m.div>

                    <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="flex gap-4 pl-16">
                      <div className="w-full relative">
                        <div className="text-[#8b949e] mb-1">↳ Qdrant Vector Search (Hybrid BM25)</div>
                        <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
                          <m.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ delay: 0.6, duration: 0.2 }} className="h-full bg-amber-500" />
                        </div>
                        <div className="text-[9px] text-[#8b949e] mt-0.5 text-right">45ms</div>
                      </div>
                    </m.div>

                    <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="flex gap-4 pl-16">
                      <div className="w-full relative">
                        <div className="text-[#8b949e] mb-1">↳ LLM Synthesis (Gemini 1.5)</div>
                        <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
                          <m.div initial={{ width: 0 }} animate={{ width: '80%' }} transition={{ delay: 0.9, duration: 1.5 }} className="h-full bg-emerald-500" />
                        </div>
                        <div className="text-[9px] text-[#8b949e] mt-0.5 text-right">650ms</div>
                      </div>
                    </m.div>
                    
                    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-4 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
                      <div className="text-[#c9d1d9]">
                        <span className="text-pink-400">"matches"</span>: [
                        <br />&nbsp;&nbsp;{'{'} <span className="text-pink-400">"score"</span>: <span className="text-amber-400">0.92</span>, <span className="text-pink-400">"doc_id"</span>: <span className="text-emerald-400">"SOP-402"</span> {'}'}
                        <br />]
                      </div>
                    </m.div>
                  </m.div>

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d1117] pointer-events-none" />
                </m.div>
              )}

              {/* STATE 3: VECTOR INDEXING */}
              {activeSimulation === 3 && (
                <m.div key="vector" initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(10px)' }} className="h-full grid grid-cols-3 gap-4">
                  {/* Left Column: Document List */}
                  <div className="col-span-1 bg-[var(--surface-primary)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs font-bold text-[var(--text-primary)]">Ingestion Queue</div>
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-forge-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-forge-500"></span>
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-1">
                      {[
                        { file: 'turbine_specs_v2.pdf', status: 'Chunking...', progress: 45 },
                        { file: 'safety_manual_2023.docx', status: 'Embedding...', progress: 80 },
                        { file: 'maintenance_logs.csv', status: 'Done', progress: 100 }
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)] relative overflow-hidden group">
                          <div className="absolute bottom-0 left-0 h-0.5 bg-forge-500 transition-all duration-1000 ease-out" style={{ width: `${item.progress}%` }} />
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                            <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{item.file}</div>
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">{item.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-span-2 grid grid-rows-3 gap-4">
                     {/* Database Visualization */}
                     <div className="row-span-2 bg-[var(--surface-primary)] rounded-xl border border-[var(--border-subtle)] p-6 relative overflow-hidden flex items-center justify-center shadow-sm">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(91,110,244,0.12)_0%,transparent_70%)]" />
                        
                        {/* Animated Vector Data Streams */}
                        <div className="absolute left-10 top-1/4 text-[8px] font-mono text-forge-500/50 flex flex-col gap-1">
                          <m.div animate={{ x: [0, 100], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }}>[0.12, -0.45, 0.88, ...]</m.div>
                          <m.div animate={{ x: [0, 100], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}>[-0.91, 0.33, -0.11, ...]</m.div>
                        </div>
                        
                        <div className="w-48 h-full border border-dashed border-forge-500/40 rounded-xl flex items-center justify-center relative bg-[var(--bg-secondary)] shadow-inner">
                          {/* Flowing particles into DB */}
                          <m.div animate={{ x: ['-200%', '100%'], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-1 bg-forge-500 shadow-[0_0_12px_#5b6ef4] rounded-full z-10" />
                          <m.div animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="relative z-20">
                            <Database className="w-16 h-16 text-forge-500 drop-shadow-[0_0_15px_rgba(91,110,244,0.5)]" />
                          </m.div>
                        </div>
                     </div>

                     {/* Embedding Metrics */}
                     <div className="row-span-1 flex gap-4">
                        <div className="flex-1 bg-forge-500/5 rounded-xl border border-forge-500/20 p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
                          <div className="absolute right-0 top-0 w-24 h-24 bg-forge-500/10 rounded-full blur-xl" />
                          <div>
                            <div className="text-[10px] text-forge-500 uppercase font-bold mb-1 tracking-wider">Vectors Indexed</div>
                            <div className="text-2xl font-black text-forge-400">1.42M</div>
                          </div>
                          <BarChart2 className="w-8 h-8 text-forge-500/50" />
                        </div>
                        <div className="flex-1 bg-[var(--surface-primary)] rounded-xl border border-[var(--border-subtle)] p-4 flex items-center justify-between shadow-sm">
                          <div>
                            <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1 tracking-wider">Index Health</div>
                            <div className="flex items-center gap-2">
                               <div className="w-2.5 h-2.5 rounded-full bg-status-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                               <span className="text-base font-bold text-[var(--text-primary)]">Optimal</span>
                            </div>
                          </div>
                          <Server className="w-8 h-8 text-[var(--text-secondary)]/50" />
                        </div>
                     </div>
                  </div>
                </m.div>
              )}

              {/* STATE 4: TENANT ISOLATION */}
              {activeSimulation === 4 && (
                <m.div key="secure" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="h-full flex gap-4 relative">
                  {/* Background scanning line */}
                  <m.div animate={{ x: ['0%', '300%'] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-0 pointer-events-none" />
                  
                  {[
                    { name: 'Tenant A (HR)', color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', doc: 'Payroll_Q3.pdf' },
                    { name: 'Tenant B (Eng)', color: 'text-forge-400', bg: 'bg-forge-500/5', border: 'border-forge-500/20', doc: 'Turbine_Specs.dwg' },
                    { name: 'Tenant C (Exec)', color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20', doc: 'M&A_Strategy.docx' }
                  ].map((tenant, i) => (
                    <div key={i} className={`flex-1 ${tenant.bg} ${tenant.border} border rounded-xl p-5 flex flex-col relative overflow-hidden group shadow-sm z-10`}>
                      
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6 border-b border-inherit pb-4">
                        <div className="flex items-center gap-2">
                           <Shield className={`w-5 h-5 ${tenant.color}`} />
                           <div className={`text-xs font-bold ${tenant.color}`}>{tenant.name}</div>
                        </div>
                        <Lock className={`w-4 h-4 ${tenant.color} opacity-50`} />
                      </div>
                      
                      {/* Secure Data representation */}
                      <div className="flex-1 flex flex-col justify-center gap-3">
                         <div className="bg-[var(--surface-primary)] border border-inherit rounded-lg p-3">
                            <div className="text-[10px] text-[var(--text-muted)] font-mono mb-1">Encrypted Vector Space</div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-3 h-3 text-[var(--text-secondary)]" />
                              <span className="text-xs font-medium text-[var(--text-primary)] truncate">{tenant.doc}</span>
                            </div>
                         </div>
                         
                         <div className="flex gap-2">
                            <div className={`h-1.5 flex-1 rounded ${tenant.color.replace('text-', 'bg-')}/30`} />
                            <div className={`h-1.5 w-8 rounded ${tenant.color.replace('text-', 'bg-')}/30`} />
                            <div className={`h-1.5 w-12 rounded ${tenant.color.replace('text-', 'bg-')}/30`} />
                         </div>
                      </div>

                      {/* Isolation walls (Visual barriers) */}
                      {i < 2 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3/4 w-px bg-[var(--border-strong)] translate-x-2" />
                      )}
                      
                      {/* Blocked access animation */}
                      {i === 1 && (
                        <m.div animate={{ x: [-20, 0, -20], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -left-2 top-1/2 -translate-y-1/2 text-status-danger">
                          <ChevronRight className="w-4 h-4" />
                        </m.div>
                      )}
                    </div>
                  ))}
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </m.div>
    </SectionContainer>
  )
}
