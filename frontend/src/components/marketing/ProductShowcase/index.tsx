import React from 'react'
import { m } from 'framer-motion'
import { ShieldAlert, Activity, Search, ShieldCheck, Database, LayoutDashboard, Command, Smartphone } from 'lucide-react'

const FEATURES = [
  {
    title: 'Keep your data secure',
    description: 'Control exactly who can see which documents. Your data is always protected.',
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
        <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
           <span className="text-sm text-[var(--text-secondary)]">Rate Limit Exceeded</span>
           <span className="text-xs font-mono text-[var(--text-muted)]">14m ago</span>
        </div>
      </div>
    )
  },
  {
    title: 'Find the right information instantly',
    description: 'ForgeMind combines keyword search and AI understanding to find the most accurate answer.',
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
    title: 'Search or navigate anywhere instantly',
    description: 'Jump between chats, documents, and settings with a single keyboard shortcut.',
    icon: Command,
    colSpan: 'col-span-1 md:col-span-1 lg:col-span-1',
    bg: 'bg-forge-500/5',
    border: 'border-forge-500/20',
    color: 'text-forge-400',
    content: (
      <div className="mt-8 flex flex-col items-center">
         <div className="px-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] font-mono text-sm flex gap-2">
           <span className="text-[var(--text-muted)]">⌘</span> K
         </div>
      </div>
    )
  },
  {
    title: 'Track how your team uses AI',
    description: 'Get clear insights into what your team is searching for, how much time they are saving, and where knowledge gaps exist.',
    icon: LayoutDashboard,
    colSpan: 'col-span-1 md:col-span-2 lg:col-span-2',
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/20',
    color: 'text-purple-400',
    content: (
      <div className="mt-6 flex gap-4 h-24">
         <div className="flex-1 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-end p-2 gap-1">
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
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
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
              className={`p-8 rounded-3xl liquid-glass border hover:border-[var(--border-strong)] transition-all duration-300 group ${feature.colSpan} ${feature.bg} ${feature.border}`}
            >
              <feature.icon className={`w-8 h-8 mb-4 ${feature.color}`} />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{feature.description}</p>
              
              {feature.content}
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
