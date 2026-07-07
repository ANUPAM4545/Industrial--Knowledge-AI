import React from 'react'
import { m } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { SectionContainer } from './SectionContainer'
import { SectionTitle } from './SectionTitle'
import { staggerContainer, fadeUp } from '@/lib/animations'
import { MagneticButton } from '../ui/MagneticButton'

export function Pricing() {
  return (
    <SectionContainer id="pricing" className="bg-[var(--surface-primary)] border-t border-[var(--border-subtle)] relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-forge-500/5 rounded-full blur-[120px] pointer-events-none" />

      <SectionTitle 
        title="Simple, Transparent Pricing"
        subtitle="Start for free, upgrade when you need enterprise capabilities."
      />

      <m.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10 perspective-1000"
      >
        {/* Starter Plan */}
        <m.div 
          variants={fadeUp} 
          whileHover={{ y: -10 }}
          className="p-8 rounded-3xl bg-[var(--surface-glass)] border border-[var(--border-subtle)] flex flex-col hover:shadow-[var(--shadow-large)] transition-shadow"
        >
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Starter</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-6">Perfect for small teams and prototyping.</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-[var(--text-primary)]">$0</span>
            <span className="text-[var(--text-secondary)]">/mo</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-sm text-[var(--text-secondary)]">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Up to 500 documents</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Standard Hybrid Search</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Basic Analytics</li>
          </ul>
          <button className="w-full py-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-semibold transition-colors">
            Start Free
          </button>
        </m.div>

        {/* Professional Plan */}
        <m.div 
          variants={fadeUp} 
          whileHover={{ y: -10, scale: 1.02 }}
          className="p-8 rounded-3xl bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface-primary)] border border-forge-500 relative flex flex-col shadow-[0_0_40px_rgba(91,110,244,0.15)] md:-translate-y-4 group"
        >
          {/* Animated gradient border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-forge-500/20 to-transparent pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-forge-500 text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-[0_0_20px_rgba(91,110,244,0.5)]">
            <Sparkles className="w-3 h-3" /> Most Popular
          </div>
          
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 relative z-10">Professional</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-6 relative z-10">For growing businesses needing scale.</p>
          <div className="mb-6 relative z-10">
            <span className="text-4xl font-bold text-[var(--text-primary)]">$99</span>
            <span className="text-[var(--text-secondary)]">/mo</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-sm text-[var(--text-secondary)] relative z-10">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Up to 50,000 documents</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Explainable AI & Citations</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Developer Trace Mode</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> PWA Offline Support</li>
          </ul>
          
          <MagneticButton className="w-full py-4 rounded-xl bg-forge-500 hover:bg-forge-400 text-white font-bold transition-colors shadow-lg shadow-forge-500/25">
            Start 14-Day Trial
          </MagneticButton>
        </m.div>

        {/* Enterprise Plan */}
        <m.div 
          variants={fadeUp} 
          whileHover={{ y: -10 }}
          className="p-8 rounded-3xl bg-[var(--surface-glass)] border border-[var(--border-subtle)] flex flex-col hover:shadow-[var(--shadow-large)] transition-shadow"
        >
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Enterprise</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-6">Mission-critical support and security.</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-[var(--text-primary)]">Custom</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-sm text-[var(--text-secondary)]">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Unlimited documents</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Custom Vector Isolation</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> Dedicated Infrastructure</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-status-success" /> 24/7 SLA Support</li>
          </ul>
          <button className="w-full py-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-semibold transition-colors">
            Contact Sales
          </button>
        </m.div>

      </m.div>
    </SectionContainer>
  )
}
