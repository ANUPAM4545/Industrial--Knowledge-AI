import React from 'react'
import { m } from 'framer-motion'
import { ShieldAlert, Activity, Search, ShieldCheck, Database, LayoutDashboard, Command, Smartphone } from 'lucide-react'

const FEATURES = [
  {
    title: 'Enterprise Security Center',
    description: 'Monitor prompt injections, rate limits, and audit logs in real-time.',
    icon: ShieldAlert,
    colSpan: 'col-span-1 md:col-span-2 lg:col-span-2',
    bg: 'bg-red-500/5',
    border: 'border-red-500/20',
    color: 'text-red-400',
    content: (
      <div className="mt-6 flex flex-col gap-2">
        <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
           <span className="text-sm font-medium text-red-400">Prompt Injection Blocked</span>
           <span className="text-xs font-mono text-red-500">2ms ago</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
           <span className="text-sm text-slate-300">Rate Limit Exceeded</span>
           <span className="text-xs font-mono text-slate-500">14m ago</span>
        </div>
      </div>
    )
  },
  {
    title: 'Hybrid Retrieval',
    description: 'Combines BM25 keyword search with BGE-M3 vector embeddings for unmatched accuracy.',
    icon: Search,
    colSpan: 'col-span-1 md:col-span-1 lg:col-span-1',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    color: 'text-amber-400',
    content: (
      <div className="mt-8 flex justify-center">
         <div className="relative w-32 h-32 rounded-full border border-dashed border-amber-500/30 flex items-center justify-center animate-spin-slow">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 blur-md absolute" />
            <Search className="w-8 h-8 text-amber-400" />
         </div>
      </div>
    )
  },
  {
    title: 'Command Palette',
    description: 'Navigate anywhere instantly with ⌘K shortcuts.',
    icon: Command,
    colSpan: 'col-span-1 md:col-span-1 lg:col-span-1',
    bg: 'bg-forge-500/5',
    border: 'border-forge-500/20',
    color: 'text-forge-400',
    content: (
      <div className="mt-8 flex flex-col items-center">
         <div className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white font-mono text-sm flex gap-2">
           <span className="text-slate-500">⌘</span> K
         </div>
      </div>
    )
  },
  {
    title: 'Executive Dashboard',
    description: 'Track token usage, document health, and search queries.',
    icon: LayoutDashboard,
    colSpan: 'col-span-1 md:col-span-2 lg:col-span-2',
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/20',
    color: 'text-purple-400',
    content: (
      <div className="mt-6 flex gap-4 h-24">
         <div className="flex-1 rounded-lg bg-white/[0.02] border border-white/5 flex items-end p-2 gap-1">
            {[40, 70, 45, 90, 60].map((h, i) => (
              <div key={i} className="flex-1 bg-purple-500/40 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
         </div>
      </div>
    )
  }
]

export function ProductShowcase() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Everything you need. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-400 to-purple-400">
              Nothing you don't.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <m.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`p-8 rounded-3xl liquid-glass border hover:border-white/20 transition-all duration-300 group ${feature.colSpan} ${feature.bg} ${feature.border}`}
            >
              <feature.icon className={`w-8 h-8 mb-4 ${feature.color}`} />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              
              {feature.content}
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
