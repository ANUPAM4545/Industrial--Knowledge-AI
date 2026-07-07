import React from 'react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import { AnimatedBackground } from '@/components/marketing/AnimatedBackground'
import { Navbar } from '@/components/marketing/Navbar'
import { Hero } from '@/components/marketing/Hero'
import { TrustSection } from '@/components/marketing/TrustSection'
import { BentoFeatures } from '@/components/marketing/BentoFeatures'
import { Workflow } from '@/components/marketing/Workflow'
import { UseCases } from '@/components/marketing/UseCases'
import { Comparison } from '@/components/marketing/Comparison'
import { Testimonials } from '@/components/marketing/Testimonials'
import { Pricing } from '@/components/marketing/Pricing'
import { CTA } from '@/components/marketing/CTA'
import { Footer } from '@/components/marketing/Footer'
import { usePWA } from '@/hooks/usePWA'

export function LandingPage() {
  const { needRefresh, updateApp, closeUpdatePrompt } = usePWA()

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans selection:bg-forge-500/30">
        <AnimatedBackground />
        <Navbar />
        
        {/* PWA Update Toast */}
        <AnimatePresence>
          {needRefresh && (
            <m.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[99] flex items-center gap-4 p-4 rounded-2xl liquid-glass border border-forge-500/30 shadow-glow-md bg-[var(--surface-primary)]"
            >
              <div className="w-10 h-10 rounded-full bg-forge-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-forge-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">New version available</p>
                <p className="text-xs text-[var(--text-secondary)]">Update now to get the latest features.</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={closeUpdatePrompt} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] transition-all">Later</button>
                <button onClick={updateApp} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-forge-gradient text-white shadow-glow-sm hover:opacity-90 transition-all">Update Now</button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <main>
          <Hero />
          <TrustSection />
          
          <BentoFeatures />
          <Workflow />
          <UseCases />
          <Comparison />
          <Testimonials />
          <Pricing />
          <CTA />
        </main>

        <Footer />
      </div>
    </LazyMotion>
  )
}

export default LandingPage
