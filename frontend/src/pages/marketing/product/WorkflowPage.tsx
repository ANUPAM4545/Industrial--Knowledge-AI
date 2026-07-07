import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { m } from 'framer-motion'
import { FileUp, Cpu, Network, Zap, CheckCircle2 } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/animations'

export function WorkflowPage() {
  const steps = [
    {
      title: '1. Ingestion',
      description: 'Upload manuals, CAD drawings, and P&IDs. Our pipeline automatically extracts text, tables, and images using advanced OCR.',
      icon: <FileUp className="w-6 h-6 text-forge-400" />
    },
    {
      title: '2. Entity Extraction',
      description: 'Specialized NER models identify equipment tags, sensor IDs, and maintenance codes from unstructured text.',
      icon: <Cpu className="w-6 h-6 text-indigo-400" />
    },
    {
      title: '3. Knowledge Graph Construction',
      description: 'Extracted entities are linked. A pump is connected to its motor, its SOP, and its historical incident logs.',
      icon: <Network className="w-6 h-6 text-amber-400" />
    },
    {
      title: '4. Agentic Reasoning',
      description: 'When a user asks a question, LangGraph agents traverse both the vector index and the knowledge graph to synthesize an accurate answer.',
      icon: <Zap className="w-6 h-6 text-emerald-400" />
    }
  ]

  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <m.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Intelligence Pipeline</span>
          </m.h1>
          <m.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-[var(--text-secondary)] leading-relaxed">
            See exactly how NEXO transforms your raw industrial documents into a dynamic, queryable knowledge engine.
          </m.p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-forge-500/50 via-indigo-500/50 to-transparent -translate-x-1/2" />

          <div className="space-y-24">
            {steps.map((step, i) => (
              <m.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-16 md:pl-0`}>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
                </div>
                
                <div className="absolute left-8 md:relative md:left-auto w-16 h-16 rounded-full bg-[var(--surface-primary)] border-4 border-[var(--bg-primary)] shadow-[0_0_20px_rgba(91,110,244,0.3)] flex items-center justify-center shrink-0 z-10 -translate-x-1/2 md:translate-x-0">
                  {step.icon}
                </div>
                
                <div className="flex-1 hidden md:block" />
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
