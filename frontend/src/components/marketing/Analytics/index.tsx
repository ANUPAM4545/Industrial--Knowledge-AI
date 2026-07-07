import React from 'react'
import { m } from 'framer-motion'
import { BarChart3, TrendingUp, Users } from 'lucide-react'

export function Analytics() {
  return (
    <section className="py-24 relative overflow-hidden bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4" />
              Executive Dashboard
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
              Insights at <span className="text-purple-400">scale</span>.
            </h2>
            
            <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed">
              Track token consumption, query volume, and active sessions across your entire organization. NEXO's analytics engine provides real-time visibility into how your teams are utilizing the knowledge base.
            </p>
            
            <ul className="space-y-4">
              {[
                { icon: TrendingUp, title: 'Token Analytics', desc: 'Monitor API costs and usage trends.' },
                { icon: Users, title: 'Session Tracking', desc: 'Active users and interaction frequency.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-[var(--text-primary)] font-semibold">{item.title}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </m.div>

          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl liquid-glass border border-[var(--border-strong)] p-6 flex flex-col gap-4 overflow-hidden"
          >
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Total Tokens</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">1.2M</div>
                  <div className="text-xs text-green-400 mt-1">↑ 12% vs last week</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Avg Response Time</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">94ms</div>
                  <div className="text-xs text-green-400 mt-1">↓ 5ms vs last week</div>
                </div>
             </div>
             
             <div className="flex-1 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-4 flex flex-col justify-end gap-2 overflow-hidden">
                <div className="text-xs text-[var(--text-secondary)] mb-4">Query Volume (30 days)</div>
                <div className="flex items-end gap-2 h-32 w-full">
                  {[30, 45, 25, 60, 75, 40, 90, 85, 50, 70, 45, 65].map((h, i) => (
                    <m.div 
                      key={i} 
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="flex-1 bg-purple-500/40 hover:bg-purple-500/60 transition-colors rounded-t-sm" 
                    />
                  ))}
                </div>
             </div>
          </m.div>

        </div>
      </div>
    </section>
  )
}
