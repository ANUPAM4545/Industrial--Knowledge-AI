import React, { ReactNode, useEffect } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { AnimatedBackground } from '@/components/marketing/AnimatedBackground'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

interface MarketingLayoutProps {
  children: ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  useEffect(() => {
    // Scroll to top on page load unless there is a hash
    if (!window.location.hash) {
      window.scrollTo(0, 0)
    }
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans selection:bg-forge-500/30 flex flex-col">
        <AnimatedBackground />
        <Navbar />
        
        <main className="flex-1 relative z-10 pt-20">
          {children}
        </main>

        <Footer />
      </div>
    </LazyMotion>
  )
}
