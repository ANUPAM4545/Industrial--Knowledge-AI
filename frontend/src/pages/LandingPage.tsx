import React from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { AnimatedBackground } from '@/components/marketing/AnimatedBackground'
import { Navbar } from '@/components/marketing/Navbar'
import { Hero } from '@/components/marketing/Hero'
import { AIPlatform } from '@/components/marketing/AIPlatform'
import { PlatformOverview } from '@/components/marketing/PlatformOverview'
import { InteractiveWorkflow } from '@/components/marketing/InteractiveWorkflow'
import { ProductShowcase } from '@/components/marketing/ProductShowcase'
import { Security } from '@/components/marketing/Security'
import { DeveloperExperience } from '@/components/marketing/DeveloperExperience'
import { KnowledgeExplorer } from '@/components/marketing/KnowledgeExplorer'
import { Analytics } from '@/components/marketing/Analytics'
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

        <main>
          <Hero />
          <PlatformOverview />
          <AIPlatform />
          <InteractiveWorkflow />
          <ProductShowcase />
          <Security />
          <DeveloperExperience />
          <KnowledgeExplorer />
          <Analytics />
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
