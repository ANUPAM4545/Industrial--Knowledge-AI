import React, { useRef } from 'react'
import { m, useScroll, useTransform } from 'framer-motion'
import { 
  FileUp, Search, Brain, CheckCircle, Database, ShieldAlert,
  Settings2, Activity
} from 'lucide-react'

const PIPELINE_STEPS = [
  { id: 'upload', label: 'Document Ingestion', icon: FileUp, desc: 'Secure OCR & Parsing' },
  { id: 'chunking', label: 'Semantic Chunking', icon: Settings2, desc: 'Context-aware splits' },
  { id: 'embed', label: 'Vector Embeddings', icon: Database, desc: 'Multilingual models' },
  { id: 'retrieve', label: 'Hybrid Retrieval', icon: Search, desc: 'Keyword + Vector' },
  { id: 'security', label: 'AI Security Layer', icon: ShieldAlert, desc: 'Prompt Injection Guard' },
  { id: 'generate', label: 'LLM Reasoning', icon: Brain, desc: 'Explainable AI' },
  { id: 'validate', label: 'Citation Validation', icon: CheckCircle, desc: 'Hallucination Check' },
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
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            The Industrial AI <span className="text-forge-400">Pipeline</span>
          </h2>
          <p className="text-slate-400 text-lg">
            A secure, deterministic, and highly observable workflow that transforms unstructured industrial manuals into explainable answers.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Animated SVG Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-1 hidden md:block">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              <m.line 
                x1="50%" y1="0" x2="50%" y2="100%" 
                stroke="url(#pipeline-gradient)" 
                strokeWidth="4"
                style={{ pathLength }}
              />
              <defs>
                <linearGradient id="pipeline-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
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
                    <div className="p-6 rounded-2xl liquid-glass border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                       <h3 className="text-xl font-bold text-white mb-2">{step.label}</h3>
                       <p className="text-sm text-slate-400">{step.desc}</p>
                       <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-500 justify-end">
                         <Activity className="w-3 h-3 text-forge-400" />
                         <span>Latency: &lt;100ms</span>
                       </div>
                    </div>
                  </div>

                  <div className="relative z-10 w-16 h-16 shrink-0 rounded-2xl bg-[#0B0F19] border-2 border-forge-500/30 flex items-center justify-center shadow-glow-sm">
                    <step.icon className="w-6 h-6 text-forge-400" />
                  </div>

                  <div className="flex-1 md:hidden">
                    <h3 className="text-lg font-bold text-white mb-1">{step.label}</h3>
                    <p className="text-sm text-slate-400">{step.desc}</p>
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
