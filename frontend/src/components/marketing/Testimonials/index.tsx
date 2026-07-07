import React from 'react'
import { m } from 'framer-motion'
import { SectionContainer } from '../SectionContainer'
import { SectionTitle } from '../SectionTitle'
import { Quote } from 'lucide-react'

const testimonials = [
  { quote: "We used to spend hours digging through engineering manuals. Now, our technicians just ask ForgeMind and get the exact page they need instantly.", author: "Sarah Jenkins", role: "VP of Engineering, Apex Manufacturing" },
  { quote: "Our maintenance team is 30% faster on the floor. Instead of guessing, they get immediate, accurate answers straight from our equipment logs.", author: "David Chen", role: "Director of Operations, Nexus Energy" },
  { quote: "Onboarding new logistics coordinators used to take months. With ForgeMind, they just ask questions and instantly learn our complex shipping protocols.", author: "Elena Rodriguez", role: "Logistics Manager, Horizon Freight" },
]

export function Testimonials() {
  return (
    <SectionContainer className="bg-[var(--bg-primary)] overflow-hidden">
      <SectionTitle 
        title="Trusted by Industry Leaders"
        subtitle="See what our customers are saying about ForgeMind AI."
      />
      
      <div className="relative flex overflow-x-hidden group py-8 perspective-1000">
        {/* Left/Right Gradients */}
        <div className="absolute top-0 left-0 w-16 md:w-48 h-full bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 md:w-48 h-full bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
        
        <div className="animate-marquee flex whitespace-nowrap gap-6 group-hover:animation-pause">
          {[...testimonials, ...testimonials, ...testimonials].map((t, index) => (
            <m.div 
              key={index} 
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-[350px] md:w-[450px] flex-shrink-0 whitespace-normal p-8 rounded-3xl bg-[var(--surface-primary)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-large)] hover:border-forge-500/30 transition-colors group/card cursor-default"
            >
              <Quote className="w-10 h-10 text-forge-500/20 mb-6 group-hover/card:text-forge-500/50 transition-colors" />
              <p className="text-[var(--text-primary)] text-lg mb-8 leading-relaxed font-medium">"{t.quote}"</p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forge-500 to-forge-400 p-[2px]">
                   <div className="w-full h-full rounded-full bg-[var(--surface-primary)] flex items-center justify-center text-forge-500 font-bold text-xl">
                      {t.author.charAt(0)}
                   </div>
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">{t.author}</h4>
                  <p className="text-sm text-[var(--text-secondary)]">{t.role}</p>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}
