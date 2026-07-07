import React from 'react'
import { m, useScroll, useTransform } from 'framer-motion'
import { SectionContainer } from './SectionContainer'
import { fadeUp } from '@/lib/animations'

const logos = [
  'SIEMENS', 'Schneider Electric', 'ABB', 'Honeywell', 
  'EMERSON', 'Atlas Copco', 'Bosch', 'Rockwell Automation'
]

const stats = [
  { label: 'Enterprise Clients', value: '50+' },
  { label: 'Documents Processed', value: '100K+' },
  { label: 'Confidence Score', value: '98.6%' },
  { label: 'Vectors Indexed', value: '1M+' },
]

export function TrustSection() {
  const { scrollYProgress } = useScroll()
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <SectionContainer noPadding className="py-20 border-y border-[var(--border-subtle)] bg-[var(--surface-primary)] overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      
      <m.div 
        style={{ scale, opacity }}
        className="max-w-7xl mx-auto px-6 mb-16 relative z-10"
      >
        <div className="text-center mb-12">
          <m.h3 variants={fadeUp} initial="hidden" whileInView="visible" className="text-sm font-bold text-forge-500 uppercase tracking-widest mb-4">
            Trusted by Industry Leaders
          </m.h3>
        </div>

        <m.div 
          variants={fadeUp} 
          initial="hidden" 
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-large)] hover:-translate-y-1 transition-all">
              <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2 bg-clip-text text-transparent bg-gradient-to-r from-forge-500 to-forge-400">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </m.div>
      </m.div>

      <div className="relative flex overflow-x-hidden group py-4">
        <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-[var(--surface-primary)] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-[var(--surface-primary)] to-transparent z-10 pointer-events-none" />
        
        <div className="animate-marquee flex whitespace-nowrap group-hover:animation-pause">
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <m.div 
              key={index} 
              whileHover={{ scale: 1.1, opacity: 1, color: "var(--text-primary)" }}
              className="mx-12 md:mx-20 text-2xl md:text-4xl font-black text-[var(--text-muted)] opacity-30 transition-all duration-300 cursor-pointer"
            >
              {logo}
            </m.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}
