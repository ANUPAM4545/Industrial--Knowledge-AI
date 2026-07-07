import React, { useRef } from 'react'
import { m, useScroll, useTransform } from 'framer-motion'
import { 
  FileUp, Search, Brain, CheckCircle, Database, ShieldAlert,
  Settings2, Activity
} from 'lucide-react'

const PIPELINE_STEPS = [
  { id: 'upload', label: 'Upload Files', icon: FileUp, desc: '(Data Ingestion)' },
  { id: 'chunking', label: 'Read Documents', icon: Settings2, desc: '(Parsing & Chunking)' },
  { id: 'embed', label: 'Build AI Knowledge', icon: Database, desc: '(Vector Embeddings)' },
  { id: 'retrieve', label: 'Search Smarter', icon: Search, desc: '(Hybrid Search)' },
  { id: 'security', label: 'Block Threats', icon: ShieldAlert, desc: '(Prompt Injection Guards)' },
  { id: 'generate', label: 'Generate Answers', icon: Brain, desc: '(LLM Synthesis)' },
  { id: 'validate', label: 'Show Sources', icon: CheckCircle, desc: '(Citation Mapping)' },
]

export function InteractiveWorkflow() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })

  // We will map scrollYProgress to draw an SVG path connecting the nodes.
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section ref={containerRef} className="relative min-h-[150vh] py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
            How NEXO <span className="text-forge-400">Works</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">
            A simple, secure process that turns your scattered documents into a powerful AI assistant.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Animated Energy Line */}
          <div className="absolute left-[32px] md:left-1/2 top-8 bottom-8 -translate-x-1/2 w-1 bg-[var(--border-subtle)] overflow-hidden rounded-full z-0">
            <m.div 
              animate={{ top: ["-20%", "120%"] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute w-full h-[20%] bg-gradient-to-b from-transparent via-forge-500 to-transparent"
            />
          </div>

          <div className="space-y-24 relative">
            {PIPELINE_STEPS.map((step, index) => {
              const isEven = index % 2 === 0
              return (
                <m.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`flex items-center gap-8 md:gap-16 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`flex-1 hidden md:block ${isEven ? 'text-right' : 'text-left'}`}>
                    {/* Glass Preview Panel - changes based on step */}
                    <div className="group p-6 rounded-2xl liquid-glass border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated)] transition-colors cursor-default">
                       <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{step.label}</h3>
                       <p className="text-sm text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">{step.desc}</p>
                       <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] justify-end">
                         <Activity className="w-3 h-3 text-forge-400" />
                         <span>Latency: &lt;100ms</span>
                       </div>
                    </div>
                  </div>

                  <div className="relative z-10 w-16 h-16 shrink-0 rounded-2xl bg-[var(--surface-primary)] border-2 border-forge-500/30 flex items-center justify-center shadow-glow-sm">
                    <step.icon className="w-6 h-6 text-forge-400" />
                  </div>

                  <div className="flex-1 md:hidden">
                    <div className="group">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{step.label}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{step.desc}</p>
                    </div>
                  </div>
                  
                  {/* Empty div for desktop alignment */}
                  <div className="flex-1 hidden md:block" />
                </m.div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
