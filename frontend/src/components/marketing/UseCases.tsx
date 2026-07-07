import React, { useRef } from 'react'
import { m, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Factory, Droplets, Zap, Pickaxe, Car, Pill, HardHat, Plane } from 'lucide-react'
import { SectionContainer } from './SectionContainer'
import { SectionTitle } from './SectionTitle'
import { staggerContainer, fadeUp } from '@/lib/animations'

const useCases = [
  { icon: Factory, title: 'Manufacturing', desc: 'SOPs, Maintenance Logs, Schematics' },
  { icon: Droplets, title: 'Oil & Gas', desc: 'Safety Manuals, Compliance, Reports' },
  { icon: Zap, title: 'Energy', desc: 'Grid Documentation, Operations' },
  { icon: Pickaxe, title: 'Mining', desc: 'Equipment Manuals, Survey Data' },
  { icon: Car, title: 'Automotive', desc: 'Assembly Guidelines, QA Checklists' },
  { icon: Pill, title: 'Pharmaceuticals', desc: 'Regulatory Filings, Formulations' },
  { icon: HardHat, title: 'Construction', desc: 'Blueprints, Site Safety, Contracts' },
  { icon: Plane, title: 'Aerospace', desc: 'Flight Manuals, Engineering Docs' },
]

function UseCaseCard({ useCase }: { useCase: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div 
      ref={ref}
      variants={fadeUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-[var(--surface-primary)] border border-[var(--border-subtle)] hover:border-forge-500/50 transition-colors shadow-sm hover:shadow-[var(--shadow-large)] cursor-pointer overflow-hidden"
    >
      {/* Background visual hover effect */}
      <m.div 
        className="absolute inset-0 bg-forge-500/0 group-hover:bg-forge-500/5 transition-colors duration-500 pointer-events-none" 
      />
      
      {/* Icon */}
      <div 
        className="w-16 h-16 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center mb-6 group-hover:bg-forge-500 transition-colors relative z-10 group-hover:scale-110 duration-300"
        style={{ transform: "translateZ(30px)" }}
      >
        <useCase.icon className="w-8 h-8 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
      </div>
      
      {/* Text Content */}
      <div style={{ transform: "translateZ(20px)" }} className="relative z-10">
        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-forge-500 transition-colors">{useCase.title}</h4>
        <p className="text-sm text-[var(--text-secondary)]">{useCase.desc}</p>
      </div>
    </m.div>
  )
}

export function UseCases() {
  return (
    <SectionContainer id="use-cases" className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
      <SectionTitle 
        title="Powering Smarter Operations"
        subtitle="Designed for industrial teams dealing with complex documentation, SOPs, manuals, and operational knowledge."
      />

      <m.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 perspective-1000"
      >
        {useCases.map((useCase, i) => (
          <UseCaseCard key={i} useCase={useCase} />
        ))}
      </m.div>
    </SectionContainer>
  )
}
