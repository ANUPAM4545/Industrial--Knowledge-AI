import React, { useRef } from 'react'
import { m, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Layout, Terminal } from 'lucide-react'
import { SectionContainer } from './SectionContainer'
import { fadeUp } from '@/lib/animations'
import { Link } from 'react-router-dom'
import { MagneticButton } from '../ui/MagneticButton'

export function CTA() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100])

  return (
    <SectionContainer className="relative overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] text-center py-32 md:py-48" ref={ref as any}>
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-forge-500/20 rounded-[100%] blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <m.div animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-forge-500/50 blur-[1px]" />
           <m.div animate={{ y: [0, 30, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-forge-400/50 blur-[2px]" />
        </div>
      </div>

      {/* Floating 3D Cards */}
      <m.div style={{ y: y1 }} className="hidden xl:flex absolute left-4 2xl:left-12 top-1/4 w-72 h-56 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-2xl flex-col gap-3 -rotate-6 backdrop-blur-xl z-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-br from-forge-500/5 to-transparent pointer-events-none" />
         <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-2">
           <div className="flex items-center gap-2 text-[10px] font-mono text-forge-400 font-bold uppercase tracking-wider"><Terminal className="w-3.5 h-3.5" /> Pipeline Trace</div>
           <div className="flex gap-1.5">
             <div className="w-2 h-2 rounded-full bg-status-danger/80" />
             <div className="w-2 h-2 rounded-full bg-status-warning/80" />
             <div className="w-2 h-2 rounded-full bg-status-success/80" />
           </div>
         </div>
         
         <div className="flex flex-col gap-2 font-mono text-[9px] text-[var(--text-secondary)]">
           <m.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="flex gap-2">
             <span className="text-emerald-400">OK</span>
             <span className="truncate">Extracting entities from SOP-A</span>
           </m.div>
           <m.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="flex gap-2">
             <span className="text-emerald-400">OK</span>
             <span className="truncate">Generating 768-d embeddings</span>
           </m.div>
           <m.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} className="flex gap-2">
             <span className="text-forge-400">DB</span>
             <span className="truncate text-[var(--text-primary)]">Upserting to Qdrant cluster</span>
           </m.div>
           <m.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 1.5 }} className="flex gap-2">
             <span className="text-amber-400">WAIT</span>
             <span className="truncate text-amber-400/80 hover:text-amber-400">Awaiting vector convergence...</span>
           </m.div>
         </div>
         
         {/* Animated terminal cursor */}
         <div className="mt-auto flex items-center gap-2 font-mono text-[9px] text-forge-500">
           <span>{'>'}</span>
           <m.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-3 bg-forge-500 block" />
         </div>
      </m.div>

      <m.div style={{ y: y2 }} className="hidden xl:flex absolute right-4 2xl:right-12 top-1/3 w-72 h-56 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-2xl flex-col rotate-6 backdrop-blur-xl z-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-bl from-forge-500/5 to-transparent pointer-events-none" />
         <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-4">
           <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider"><Layout className="w-3.5 h-3.5" /> Analytics Overview</div>
         </div>
         
         <div className="flex gap-4 mb-4">
            <div>
               <div className="text-[10px] text-[var(--text-muted)] font-bold mb-0.5">Queries</div>
               <div className="text-lg font-black text-[var(--text-primary)]">24.5k</div>
            </div>
            <div>
               <div className="text-[10px] text-[var(--text-muted)] font-bold mb-0.5">Avg Precision</div>
               <div className="text-lg font-black text-forge-400">0.96</div>
            </div>
         </div>

         {/* Animated Chart Area */}
         <div className="flex-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] relative overflow-hidden flex items-end px-2 pt-4">
            <div className="absolute inset-0 flex flex-col justify-between py-2 opacity-10 pointer-events-none">
              {[1,2,3].map(i => <div key={i} className="w-full h-px bg-[var(--text-secondary)]" />)}
            </div>
            
            <div className="w-full h-full flex items-end justify-between gap-1 pb-2">
               {[40, 60, 45, 80, 55, 30, 70, 50, 90, 65, 85, 75].map((h, i) => (
                  <m.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    animate={{ height: `${h}%` }} 
                    transition={{ delay: i * 0.1, duration: 1, type: "spring" }} 
                    className="flex-1 bg-forge-500/30 rounded-t-sm hover:bg-forge-500 transition-colors"
                  />
               ))}
            </div>
            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent pointer-events-none" />
         </div>
      </m.div>

      <m.div 
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-20 max-w-3xl mx-auto px-4"
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-[var(--text-primary)] tracking-tight">
          Ready to Transform <br /> Industrial Knowledge?
        </h2>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-12">
          Join leading enterprises using ForgeMind AI to turn static documents into actionable intelligence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/register" className="w-full sm:w-auto">
            <MagneticButton className="group px-10 py-5 bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--bg-primary)] rounded-xl text-lg font-bold shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] w-full">
              Launch Platform <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
          </Link>
          <MagneticButton className="px-10 py-5 bg-[var(--surface-glass)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] rounded-xl text-lg font-semibold border border-[var(--border-subtle)] backdrop-blur-sm w-full sm:w-auto">
            Book Demo
          </MagneticButton>
        </div>
      </m.div>
    </SectionContainer>
  )
}
