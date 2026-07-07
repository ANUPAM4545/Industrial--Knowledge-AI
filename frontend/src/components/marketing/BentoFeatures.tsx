import React, { useRef } from 'react'
import { m, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Search, Brain, Terminal, BarChart3, Eye, MessageSquare, FileCheck, Shield } from 'lucide-react'
import { SectionContainer } from './SectionContainer'
import { SectionTitle } from './SectionTitle'
import { staggerContainer, fadeUp } from '@/lib/animations'

const features = [
  { 
    icon: Search, 
    title: 'Hybrid Retrieval', 
    desc: 'Combines Qdrant vector search with dense BM25 keyword matching for optimal recall.',
    size: 'lg',
    visual: (
      <div className="absolute right-4 bottom-4 w-32 h-24 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity flex items-end justify-between">
        <div className="w-4 h-full bg-forge-500 rounded-t-sm animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-4 h-3/4 bg-forge-500 rounded-t-sm animate-pulse" style={{ animationDelay: '100ms' }} />
        <div className="w-4 h-1/2 bg-forge-500 rounded-t-sm animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="w-4 h-5/6 bg-forge-500 rounded-t-sm animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    )
  },
  { 
    icon: Brain, 
    title: 'Explainable AI', 
    desc: 'Deep link highlights direct to source document pages.',
    size: 'md',
    visual: (
      <div className="absolute right-4 bottom-4 w-24 h-24 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
        <div className="w-full h-4 bg-forge-500/50 mb-2 rounded" />
        <div className="w-3/4 h-4 bg-forge-500 mb-2 rounded" />
        <div className="w-5/6 h-4 bg-forge-500/50 rounded" />
      </div>
    )
  },
  { 
    icon: Terminal, 
    title: 'Developer Trace', 
    desc: 'Real-time observability trace console displaying query metrics.',
    size: 'sm',
    visual: null
  },
  { 
    icon: BarChart3, 
    title: 'Executive Dashboard', 
    desc: 'Visual dashboards tracking knowledge base health, citation counts, and token telemetry.',
    size: 'lg',
    visual: (
       <svg className="absolute right-4 bottom-4 w-32 h-24 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" viewBox="0 0 100 50">
          <path d="M0 50 Q 25 10 50 40 T 100 10" fill="none" stroke="currentColor" strokeWidth="4" className="text-forge-500" strokeDasharray="200" strokeDashoffset="0">
             <animate attributeName="stroke-dashoffset" from="200" to="0" dur="3s" repeatCount="indefinite" />
          </path>
       </svg>
    )
  },
  { 
    icon: Eye, 
    title: 'Knowledge Analytics', 
    desc: 'Monitor embedding drift, token usage, and search metrics.',
    size: 'md',
    visual: null
  },
  { 
    icon: MessageSquare, 
    title: 'Streaming Chat', 
    desc: 'Sub-second latency token streaming.',
    size: 'sm',
    visual: null
  },
  { 
    icon: FileCheck, 
    title: 'Document Intelligence', 
    desc: 'Extract unstructured data from PDFs, Word documents, and complex schematics.',
    size: 'md',
    visual: null
  },
  { 
    icon: Shield, 
    title: 'Enterprise Security', 
    desc: 'Role-based access controls and isolated tenant vectors for strict data governance.',
    size: 'md',
    visual: (
      <div className="absolute right-8 bottom-8 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
        <Shield className="w-16 h-16 text-forge-500" />
      </div>
    )
  }
]

export function FeatureCard({ feature, index }: { feature: any, index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"])

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

  const getColSpan = () => {
    switch (feature.size) {
      case 'lg': return 'md:col-span-2'
      case 'sm': return 'md:col-span-1'
      case 'md': 
      default: return 'md:col-span-1'
    }
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
      className={`group p-6 rounded-3xl bg-[var(--surface-primary)] border border-[var(--border-subtle)] hover:border-forge-500/50 transition-colors duration-300 relative overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-large)] ${getColSpan()} perspective-1000 cursor-default`}
    >
      <div className="absolute top-0 right-0 p-32 bg-forge-500/5 rounded-full blur-[60px] group-hover:bg-forge-500/15 transition-colors pointer-events-none transform-gpu" />
      
      <div 
        className="w-12 h-12 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 group-hover:bg-forge-500 transition-colors relative z-10 group-hover:border-forge-500"
        style={{ transform: "translateZ(30px)" }}
      >
        <feature.icon className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
      </div>
      
      <div style={{ transform: "translateZ(20px)" }} className="relative z-10">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-[80%]">{feature.desc}</p>
      </div>

      {feature.visual}
    </m.div>
  )
}

export function BentoFeatures() {
  return (
    <SectionContainer id="features" className="bg-[var(--surface-glass)]">
      <SectionTitle 
        title="Platform Capabilities"
        subtitle="Everything you need to deploy enterprise-grade AI applications securely. Built for the modern industrial stack."
      />

      <m.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6"
      >
        {features.map((feature, i) => (
          <FeatureCard key={i} feature={feature} index={i} />
        ))}
      </m.div>
    </SectionContainer>
  )
}
