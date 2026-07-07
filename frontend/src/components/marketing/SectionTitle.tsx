import React from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/animations'

interface SectionTitleProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionTitle({ title, subtitle, align = 'center' }: SectionTitleProps) {
  return (
    <motion.div 
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={`mb-16 md:mb-24 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
