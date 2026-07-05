import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, Brain, FileText, Search, Shield, BarChart3,
  ArrowRight, ChevronRight, CheckCircle2, Play, Database, Sparkles,
  Server, Cpu, Layers, HelpCircle
} from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Hybrid Retrieval Engine',
    desc: 'Combines Qdrant vector search with dense BM25 keyword matching for optimal recall.',
  },
  {
    icon: Brain,
    title: 'Explainable AI Citations',
    desc: 'Deep link highlights direct to source document pages, complete with similarity metrics.',
  },
  {
    icon: BarChart3,
    title: 'Executive Analytics',
    desc: 'Visual dashboards tracking knowledge base health, citation counts, and token telemetry.',
  },
  {
    icon: Cpu,
    title: 'Developer Diagnostics Mode',
    desc: 'Real-time observability trace console displaying query metrics and retrieval steps.',
  },
  {
    icon: Layers,
    title: 'Multi-Agent Quality Evals',
    desc: 'Automatic ground-truth validations checking context sufficiency and faithfulness.',
  },
  {
    icon: Server,
    title: 'Industrial Scaling Ready',
    desc: 'Containerized microservice architecture built with FastAPI, Redis, and Postgres.',
  }
]

const pipelineSteps = [
  { label: 'Upload', desc: 'Secure PDF/DOCX ingest' },
  { label: 'OCR Extraction', desc: 'Text normalisation & tables' },
  { label: 'Context Chunking', desc: 'Overlapped paragraph segmentation' },
  { label: 'Embedding Generation', desc: 'Vector representations via BGE-1.5' },
  { label: 'Hybrid Matching', desc: 'Sparse BM25 + Dense Qdrant lookup' },
  { label: 'LLM Generation', desc: 'Response synthesis via gpt-4o-mini' },
  { label: 'Sufficiency Eval', desc: 'Faithfulness & hallucination checks' },
  { label: 'Citation Mapping', desc: 'Opaque highlight coordinates resolve' }
]

const demoQueries = [
  {
    q: "What is the emergency pressure limit for safety valves?",
    answer: "Standard guidelines indicate that backup pressure check valves must trigger emergency indicators if pressure falls below **3.2 Bar** (Standard Safety SOP.pdf p.2).",
    doc: "Standard Safety SOP.pdf (Page 2)",
    score: "98.2%",
    latency: "215ms"
  },
  {
    q: "List troubleshooting guidelines for backup temperature sensors.",
    answer: "Emergency warnings trigger at **85°C**. Verify sensor calibrations immediately and audit check checklist specs sheet.",
    doc: "Valve Specs Checklist.docx (Page 1)",
    score: "95.1%",
    latency: "235ms"
  }
]

export function LandingPage() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [step, setStep] = useState<'idle' | 'query' | 'retrieve' | 'cite' | 'answer'>('idle')
  const [displayedAnswer, setDisplayedAnswer] = useState('')
  const [activePipeline, setActivePipeline] = useState(0)

  const startDemo = (index: number) => {
    setActiveDemo(index)
    setStep('query')
    setDisplayedAnswer('')

    setTimeout(() => setStep('retrieve'), 1000)
    setTimeout(() => setStep('cite'), 2000)
    setTimeout(() => setStep('answer'), 3000)
  }

  useEffect(() => {
    if (step === 'answer') {
      const fullText = demoQueries[activeDemo].answer
      let currentIdx = 0
      const interval = setInterval(() => {
        setDisplayedAnswer(prev => prev + fullText.charAt(currentIdx))
        currentIdx++
        if (currentIdx >= fullText.length) {
          clearInterval(interval)
        }
      }, 25)
      return () => clearInterval(interval)
    }
  }, [step, activeDemo])

  // Cycle pipeline steps automatically for nice visuals
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePipeline(prev => (prev + 1) % pipelineSteps.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0d1a] text-white">
      {/* ─── Navigation ───────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0d1a]/85 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">ForgeMind AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3 h-3" />
            Enterprise Industrial Knowledge RAG
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Industrial Knowledge<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400">Intelligence Engine</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Bridge standard operating procedures, manuals, and data checklists. Retrieve and explain matching references instantly using hybrid vector semantic search.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-base font-semibold transition-colors flex items-center gap-2 justify-center shadow-lg shadow-indigo-500/20">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="px-6 py-3 bg-slate-900/60 hover:bg-slate-800 rounded-lg text-base font-semibold border border-slate-800 transition-all flex items-center gap-2 justify-center">
              Login to Console <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ─── Social Proof Metric Bar ──────────────────────────────── */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-900/30 border border-slate-850 p-6 rounded-2xl mb-16 text-center backdrop-blur-md">
          <div>
            <p className="text-2xl font-bold text-white">245ms</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Avg Latency</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">94.2%</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Retrieval Score</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">12,840+</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Docs Indexed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">425K+</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Vectors Stored</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-2xl font-bold text-emerald-400">99.99%</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Availability</p>
          </div>
        </div>

        {/* ─── Interactive Hero Simulator ───────────────────────────── */}
        <div className="max-w-4xl mx-auto bg-slate-950/70 border border-slate-850 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 pb-6 border-b border-slate-850">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-slate-200">Interactive Pipeline Simulator</h3>
              </div>
              <p className="text-xs text-slate-400">Select an industrial query to trigger the RAG pipeline flow.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {demoQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => startDemo(idx)}
                  className={`text-xs px-3.5 py-2 rounded-lg font-medium border transition-all ${
                    activeDemo === idx && step !== 'idle'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Query #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            {/* Step 1: Prompt */}
            <div className={`p-4 rounded-xl border transition-all ${
              step === 'query' ? 'bg-indigo-950/50 border-indigo-500 text-white scale-105 shadow-xl' : 'bg-slate-900/40 border-slate-850 text-slate-500'
            }`}>
              <HelpCircle className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">1. Prompt</h4>
              <p className="text-[11px] leading-snug">{step !== 'idle' ? demoQueries[activeDemo].q : 'Awaiting input...'}</p>
            </div>

            {/* Step 2: Retrieval */}
            <div className={`p-4 rounded-xl border transition-all ${
              step === 'retrieve' ? 'bg-indigo-950/50 border-indigo-500 text-white scale-105 shadow-xl' : 'bg-slate-900/40 border-slate-850 text-slate-500'
            }`}>
              <Database className={`w-5 h-5 mx-auto mb-2 text-indigo-400 ${step === 'retrieve' ? 'animate-bounce' : ''}`} />
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">2. Hybrid Query</h4>
              <p className="text-[11px] leading-snug">
                {step === 'retrieve' || step === 'cite' || step === 'answer' ? 'BM25 + Qdrant similarity match' : '---'}
              </p>
            </div>

            {/* Step 3: Citation */}
            <div className={`p-4 rounded-xl border transition-all ${
              step === 'cite' ? 'bg-indigo-950/50 border-indigo-500 text-white scale-105 shadow-xl' : 'bg-slate-900/40 border-slate-850 text-slate-500'
            }`}>
              <FileText className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">3. Citation match</h4>
              <p className="text-[11px] leading-snug">
                {step === 'cite' || step === 'answer' ? `${demoQueries[activeDemo].doc} (${demoQueries[activeDemo].score})` : '---'}
              </p>
            </div>

            {/* Step 4: Answer */}
            <div className={`p-4 rounded-xl border transition-all ${
              step === 'answer' ? 'bg-indigo-950/50 border-indigo-500 text-white scale-105 shadow-xl' : 'bg-slate-900/40 border-slate-850 text-slate-500'
            }`}>
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">4. Generative</h4>
              <p className="text-[11px] leading-snug">
                {step === 'answer' ? 'Answer synthesized' : '---'}
              </p>
            </div>
          </div>

          {step === 'answer' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
              <div className="md:col-span-2 p-4 bg-slate-900 border border-slate-850 rounded-xl">
                <h4 className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider">Answer Stream</h4>
                <p className="text-sm font-mono text-slate-200 leading-relaxed min-h-12">{displayedAnswer}</p>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-2 text-xs">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Developer Trace</h4>
                <div className="space-y-1 text-slate-400 font-mono">
                  <p>Latency: <span className="text-slate-200">{demoQueries[activeDemo].latency}</span></p>
                  <p>Evaluation: <span className="text-emerald-400 font-bold">FAITHFUL</span></p>
                  <p>Embedding: <span className="text-slate-200">bge-small-en</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Animated Pipeline Section ────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-900/10 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">The ForgeMind Ingestion Pipeline</h2>
            <p className="text-slate-400 max-w-xl mx-auto">How raw industrial data is transformed into structured knowledge graphs in real time.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineSteps.map((stepItem, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border transition-all duration-300 ${
                  activePipeline === idx
                    ? 'bg-indigo-950/40 border-indigo-500 scale-102 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/30 border-slate-850'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-indigo-400">Step {idx + 1}</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${activePipeline === idx ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{stepItem.label}</h3>
                <p className="text-xs text-slate-400 leading-snug">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Showcase Features ────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise Ingest & Retract</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A comprehensive list of visual and analytical features built for critical systems operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-900/40 border border-slate-850 p-6 rounded-xl hover:border-indigo-500/50 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4 group-hover:bg-indigo-600/30 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-500 text-sm bg-slate-950/20">
        © 2025 ForgeMind AI. Built with ❤️ for Industrial Intelligence.
      </footer>
    </div>
  )
}
export default LandingPage
