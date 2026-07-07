import React from 'react'
import { m } from 'framer-motion'
import { Network, Search, Database } from 'lucide-react'

export function KnowledgeExplorer() {
  return (
    <section className="py-24 relative overflow-hidden bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
            <Network className="w-4 h-4" />
            Knowledge Graph Explorer
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            See the connections.
          </h2>
          <p className="text-lg text-slate-400">
            Industrial intelligence isn't just about search; it's about context. The Knowledge Explorer visually maps relationships across thousands of technical manuals, failure logs, and schematics.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-[2/1] rounded-3xl liquid-glass border border-white/10 overflow-hidden group"
        >
          {/* Simulated Graph Background */}
          <div className="absolute inset-0 bg-[#0B0F19]">
             {/* We will draw a few animated nodes and edges to simulate a graph */}
             <svg className="w-full h-full opacity-30" preserveAspectRatio="none">
               <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#f59e0b" strokeWidth="1" />
               <line x1="50%" y1="50%" x2="80%" y2="40%" stroke="#f59e0b" strokeWidth="1" />
               <line x1="50%" y1="50%" x2="60%" y2="80%" stroke="#f59e0b" strokeWidth="1" />
               <line x1="20%" y1="30%" x2="30%" y2="70%" stroke="#f59e0b" strokeWidth="1" />
             </svg>
             <div className="absolute top-[30%] left-[20%] w-4 h-4 rounded-full bg-amber-500 shadow-glow-sm shadow-amber-500 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
             <div className="absolute top-[50%] left-[50%] w-6 h-6 rounded-full bg-forge-500 shadow-glow-sm shadow-forge-500 -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute top-[40%] left-[80%] w-4 h-4 rounded-full bg-purple-500 shadow-glow-sm shadow-purple-500 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
             <div className="absolute top-[80%] left-[60%] w-4 h-4 rounded-full bg-green-500 shadow-glow-sm shadow-green-500 -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute top-[70%] left-[30%] w-4 h-4 rounded-full bg-amber-500 shadow-glow-sm shadow-amber-500 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent pointer-events-none" />

          {/* Floating UI overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full liquid-glass border border-white/10 flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-300">
               <Database className="w-4 h-4 text-forge-400" />
               145k Nodes
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-sm text-slate-300">
               <Network className="w-4 h-4 text-amber-400" />
               1.2M Edges
            </div>
          </div>
        </m.div>

      </div>
    </section>
  )
}
