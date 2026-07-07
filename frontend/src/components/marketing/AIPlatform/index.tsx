import React from 'react'
import { m } from 'framer-motion'

export function AIPlatform() {
  return (
    <section className="py-32 relative overflow-hidden bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
        <m.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] leading-tight"
        >
          Important information is <br/> <span className="text-forge-400">often buried</span>.
        </m.h2>

        <m.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto"
        >
          Inside PDFs, manuals, spreadsheets, and reports. Finding the right answer can take hours.
        </m.p>

        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-12"
        >
          <div className="inline-block relative">
             <div className="absolute inset-0 bg-forge-500/20 blur-2xl rounded-full" />
             <h3 className="relative text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-forge-400 to-purple-400">
               ForgeMind changes that.
             </h3>
          </div>
        </m.div>
      </div>
    </section>
  )
}
