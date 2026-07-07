import React, { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { FileText, TextSelect, Layers, Zap, Database, Search, Brain, Shield, Layout } from 'lucide-react'
import { SectionContainer } from './SectionContainer'
import { SectionTitle } from './SectionTitle'

const workflowSteps = [
  { id: 'upload', icon: FileText, title: 'Upload', desc: 'PDF, DOCX, TXT', tech: 'Blob Storage', latency: '1.2s' },
  { id: 'ocr', icon: TextSelect, title: 'OCR', desc: 'Extract text', tech: 'Vision API', latency: '800ms' },
  { id: 'chunk', icon: Layers, title: 'Chunking', desc: 'Semantic split', tech: 'LangChain', latency: '150ms' },
  { id: 'embed', icon: Zap, title: 'Embed', desc: 'Vectors', tech: 'FastEmbed', latency: '400ms' },
  { id: 'vector', icon: Database, title: 'Qdrant', desc: 'Indexing', tech: 'Qdrant DB', latency: '12ms' },
  { id: 'search', icon: Search, title: 'Hybrid', desc: 'Vector + Keyword', tech: 'BM25 + Cosine', latency: '45ms' },
  { id: 'llm', icon: Brain, title: 'Gemini', desc: 'Reasoning', tech: 'Gemini 1.5 Pro', latency: '1.8s' },
  { id: 'explain', icon: Shield, title: 'Citations', desc: 'Verification', tech: 'Custom Engine', latency: '30ms' },
  { id: 'insights', icon: Layout, title: 'Dashboard', desc: 'Analytics', tech: 'React', latency: '16ms' },
]

// Reusable animated particle
function FlowParticle({ startNode, endNode, delay = 0, isActive }: { startNode: number, endNode: number, delay?: number, isActive: boolean }) {
  if (!isActive) return null
  return (
    <m.div 
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: '100%', opacity: [0, 1, 1, 0] }}
      transition={{ 
        repeat: Infinity, 
        duration: 1.5, 
        ease: "linear",
        delay 
      }}
      className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[2px] pointer-events-none"
    >
      <div className="w-16 h-full bg-gradient-to-r from-transparent via-forge-500 to-white shadow-[0_0_10px_rgba(91,110,244,0.8)]" />
    </m.div>
  )
}

function WorkflowNode({ 
  step, 
  index, 
  total,
  activeStep,
  setActiveStep 
}: { 
  step: typeof workflowSteps[0], 
  index: number, 
  total: number,
  activeStep: number,
  setActiveStep: (i: number) => void 
}) {
  const isPast = index < activeStep
  const isActive = index === activeStep
  const isFuture = index > activeStep

  return (
    <div className="relative flex flex-col items-center group cursor-pointer z-20 shrink-0 w-32 md:w-36"
         onMouseEnter={() => setActiveStep(index)}
    >
      <m.div 
        layout
        className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border flex items-center justify-center mb-4 transition-all duration-500 shadow-lg relative
          ${isActive ? 'bg-forge-500 border-forge-500 shadow-[0_0_30px_rgba(91,110,244,0.5)] scale-110' : 
            isPast ? 'bg-forge-500/20 border-forge-500/50 text-forge-500' : 
            'bg-[var(--surface-primary)] border-[var(--border-strong)] opacity-50'}
        `}
      >
        <step.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-white' : isPast ? 'text-forge-500' : 'text-[var(--text-secondary)]'}`} />
        
        {/* Pulse effect for active node */}
        {isActive && (
          <m.div 
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-2xl border-2 border-forge-500 pointer-events-none"
          />
        )}
      </m.div>
      
      <div className="text-center relative">
        <h4 className={`text-xs md:text-sm font-bold mb-1 transition-colors ${isActive || isPast ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
          {step.title}
        </h4>
        
        <AnimatePresence>
          {isActive && (
            <m.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-4 rounded-xl bg-[var(--surface-primary)] border border-forge-500/30 shadow-[var(--shadow-large)] z-50 pointer-events-none"
            >
              <p className="text-xs text-[var(--text-secondary)] mb-2 leading-relaxed">{step.desc}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                <span className="px-2 py-1 rounded bg-forge-500/10 text-[10px] font-mono text-forge-500">
                  {step.tech}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                  ~{step.latency}
                </span>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connection Line to next node (horizontal) */}
      {index < total - 1 && (
        <div className="hidden lg:block absolute top-7 md:top-8 left-[50%] w-[100%] h-[2px] -z-10 bg-[var(--border-subtle)] overflow-hidden">
           {isPast && <div className="absolute inset-0 bg-forge-500/50" />}
           <FlowParticle startNode={index} endNode={index + 1} isActive={isActive} />
        </div>
      )}
    </div>
  )
}

export function Workflow() {
  const [activeStep, setActiveStep] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-advance narrative
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <SectionContainer id="workflow" className="relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <SectionTitle 
        title="Living AI System"
        subtitle="Watch documents transform into intelligent, actionable insights in real-time across our specialized pipeline."
      />

      <div className="relative max-w-7xl mx-auto py-12 px-4" ref={containerRef}>
        
        {/* We use a flex wrap container for responsive layout. The horizontal line is handled in WorkflowNode for LG screens. */}
        <div className="flex flex-wrap lg:flex-nowrap justify-center gap-y-16 gap-x-4 lg:gap-x-0 relative z-10">
          {workflowSteps.map((step, i) => (
            <WorkflowNode 
              key={step.id} 
              step={step} 
              index={i} 
              total={workflowSteps.length}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}
