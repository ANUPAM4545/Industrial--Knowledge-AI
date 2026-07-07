import React from 'react'
import { m } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { SectionContainer } from './SectionContainer'
import { SectionTitle } from './SectionTitle'
import { fadeUp, staggerContainer } from '@/lib/animations'

export function Comparison() {
  const rows = [
    { feature: 'Search Accuracy', traditional: 'Low (Keyword only)', forge: 'High (Hybrid RAG)' },
    { feature: 'Explainability', traditional: 'None', forge: 'Exact source citations' },
    { feature: 'Latency', traditional: 'Seconds', forge: 'Sub-second streaming' },
    { feature: 'Developer Tools', traditional: 'Limited', forge: 'Full observability trace' },
    { feature: 'Security', traditional: 'Basic', forge: 'Tenant isolation' },
    { feature: 'Data Analytics', traditional: 'None', forge: 'Real-time telemetry' },
  ]

  return (
    <SectionContainer className="bg-[var(--surface-glass)]">
      <SectionTitle 
        title="Why ForgeMind AI?"
        subtitle="See how we stack up against traditional enterprise search solutions."
      />

      <m.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-4xl mx-auto bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-[var(--shadow-large)] relative"
      >
        {/* Glow for ForgeMind Column */}
        <m.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-b from-forge-500/5 via-forge-500/10 to-forge-500/5 pointer-events-none"
        />

        <div className="grid grid-cols-3 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] p-6 relative z-10">
          <div className="font-semibold text-[var(--text-secondary)]">Feature</div>
          <div className="font-semibold text-center text-[var(--text-secondary)]">Traditional Search</div>
          <div className="font-bold text-center text-forge-500 flex items-center justify-center gap-2">
            ForgeMind AI
          </div>
        </div>

        <div className="divide-y divide-[var(--border-subtle)] relative z-10">
          {rows.map((row, i) => (
            <m.div 
              key={i} 
              variants={fadeUp}
              className="grid grid-cols-3 p-6 items-center hover:bg-[var(--surface-glass)] transition-colors group"
            >
              <div className="font-medium text-[var(--text-primary)]">{row.feature}</div>
              <div className="flex flex-col items-center gap-2 text-sm text-[var(--text-secondary)] opacity-70 group-hover:opacity-100 transition-opacity">
                <X className="w-5 h-5 text-status-danger" />
                <span className="text-center">{row.traditional}</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-sm text-[var(--text-primary)] font-semibold relative">
                <m.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 + (i * 0.1) }}
                >
                  <Check className="w-6 h-6 text-status-success drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </m.div>
                <span className="text-center group-hover:text-forge-500 transition-colors">{row.forge}</span>
              </div>
            </m.div>
          ))}
        </div>
      </m.div>
    </SectionContainer>
  )
}
