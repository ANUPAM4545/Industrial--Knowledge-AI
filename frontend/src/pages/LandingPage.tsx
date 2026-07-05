import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, Brain, FileText, Search, Shield, BarChart3,
  ArrowRight, ChevronRight, CheckCircle2, Play, Database, Sparkles
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Multi-Format Ingestion',
    desc: 'Upload PDFs, DOCX, SOPs, maintenance logs, and images with automatic OCR processing.',
  },
  {
    icon: Brain,
    title: 'RAG-Powered AI Chat',
    desc: 'Query your knowledge base in natural language. Every answer includes precise source citations.',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    desc: 'Vector similarity search powered by Qdrant and BAAI BGE embeddings for accurate retrieval.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Fine-grained permissions for Admin, Engineer, Manager, and Operator roles.',
  },
  {
    icon: BarChart3,
    title: 'Knowledge Analytics',
    desc: 'Track usage patterns, knowledge gaps, and conversation metrics across your team.',
  },
  {
    icon: Zap,
    title: 'Production Ready',
    desc: 'Containerized with Docker Compose, async FastAPI backend, and React 19 frontend.',
  },
]

const roles = [
  { role: 'Admin', perms: ['Full platform access', 'User management', 'System configuration'] },
  { role: 'Engineer', perms: ['Upload documents', 'Full AI chat', 'View all analytics'] },
  { role: 'Manager', perms: ['Upload documents', 'AI chat', 'Team analytics'] },
  { role: 'Operator', perms: ['AI chat access', 'Limited upload', 'Basic search'] },
]

const demoQueries = [
  {
    q: "What is the pressure limit for safety valves?",
    answer: "According to standard operations, backup pressure check valves must trigger emergency indicators if pressure falls below **3.2 Bar** limit.",
    doc: "Standard Safety SOP.pdf (Page 2)",
    score: "98.2%"
  },
  {
    q: "How to resolve temperature warnings?",
    answer: "Standard operations specify temperature warnings trigger at **85°C**. Verify sensor calibrations immediately.",
    doc: "Valve Specs Checklist.docx (Page 1)",
    score: "94.5%"
  }
]

export function LandingPage() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [step, setStep] = useState<'idle' | 'query' | 'retrieve' | 'cite' | 'answer'>('idle')
  const [displayedAnswer, setDisplayedAnswer] = useState('')

  const startDemo = (index: number) => {
    setActiveDemo(index)
    setStep('query')
    setDisplayedAnswer('')

    setTimeout(() => {
      setStep('retrieve')
    }, 1200)

    setTimeout(() => {
      setStep('cite')
    }, 2400)

    setTimeout(() => {
      setStep('answer')
    }, 3600)
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
      }, 30)
      return () => clearInterval(interval)
    }
  }, [step, activeDemo])

  return (
    <div className="min-h-screen bg-[#0a0d1a] text-white">
      {/* ─── Navigation ───────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0d1a]/80 backdrop-blur-lg">
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
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            AI-Powered Industrial Knowledge Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Transform Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Industrial Knowledge</span>
            {' '}Into Intelligence
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload SOPs, manuals, and maintenance logs. Query your entire knowledge base
            using AI-powered RAG chat with source citations. Built for industrial teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-base font-semibold transition-colors flex items-center gap-2 justify-center">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 rounded-lg text-base font-semibold border border-slate-800 transition-colors flex items-center gap-2 justify-center">
              Sign In <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ─── Interactive RAG Widget ─────────────────────────────── */}
        <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-2xl relative">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 pb-6 border-b border-slate-850">
            <div>
              <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-1">RAG Pipeline Simulator</h3>
              <p className="text-xs text-slate-400">Click a sample query below to simulate real-time enterprise retrieval.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {demoQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => startDemo(idx)}
                  className={`text-xs px-3 py-2 rounded-lg font-medium border transition-all ${
                    activeDemo === idx && step !== 'idle'
                      ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-200 shadow-lg'
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
              step === 'query' ? 'bg-indigo-950/40 border-indigo-500 text-white scale-105 shadow-xl' : 'bg-slate-900/40 border-slate-850 text-slate-500'
            }`}>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-2">
                <Play className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">1. User Query</h4>
              <p className="text-[11px] leading-snug">{step !== 'idle' ? demoQueries[activeDemo].q : 'Awaiting prompt input...'}</p>
            </div>

            {/* Step 2: Retrieval */}
            <div className={`p-4 rounded-xl border transition-all ${
              step === 'retrieve' ? 'bg-indigo-950/40 border-indigo-500 text-white scale-105 shadow-xl' : 'bg-slate-900/40 border-slate-850 text-slate-500'
            }`}>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-2">
                <Database className={`w-4 h-4 ${step === 'retrieve' ? 'animate-bounce' : ''}`} />
              </div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">2. Semantic Match</h4>
              <p className="text-[11px] leading-snug">
                {step === 'retrieve' || step === 'cite' || step === 'answer' ? 'Scanning Qdrant & BM25 indexes...' : '---'}
              </p>
            </div>

            {/* Step 3: Citation */}
            <div className={`p-4 rounded-xl border transition-all ${
              step === 'cite' ? 'bg-indigo-950/40 border-indigo-500 text-white scale-105 shadow-xl' : 'bg-slate-900/40 border-slate-850 text-slate-500'
            }`}>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">3. Citation match</h4>
              <p className="text-[11px] leading-snug">
                {step === 'cite' || step === 'answer' ? `${demoQueries[activeDemo].doc} (Score: ${demoQueries[activeDemo].score})` : '---'}
              </p>
            </div>

            {/* Step 4: Answer */}
            <div className={`p-4 rounded-xl border transition-all ${
              step === 'answer' ? 'bg-indigo-950/40 border-indigo-500 text-white scale-105 shadow-xl' : 'bg-slate-900/40 border-slate-850 text-slate-500'
            }`}>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">4. Generative RAG</h4>
              <p className="text-[11px] leading-snug">
                {step === 'answer' ? 'Streaming response...' : '---'}
              </p>
            </div>
          </div>

          {step === 'answer' && (
            <div className="mt-6 p-4 bg-slate-900 border border-slate-850 rounded-xl animate-fade-in">
              <h4 className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider">Answer Stream Output</h4>
              <p className="text-sm font-mono text-slate-200 leading-relaxed min-h-12">{displayedAnswer}</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything your team needs</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete platform for industrial knowledge management with enterprise-grade AI capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-900/50 border border-slate-850 p-6 rounded-xl hover:border-indigo-500/50 transition-all duration-300 group">
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

      {/* ─── Roles ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Role-Based Access Control</h2>
            <p className="text-slate-400 text-lg">Fine-grained permissions for every team member.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map(({ role, perms }) => (
              <div key={role} className="bg-slate-900/50 border border-slate-850 p-5 rounded-xl hover:border-indigo-500/50 transition-all duration-300">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-medium mb-4">
                  {role}
                </div>
                <ul className="space-y-2">
                  {perms.map((perm) => (
                    <li key={perm} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-slate-900/50 border border-indigo-500/30 p-12 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/5 pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Ready to forge your knowledge?</h2>
              <p className="text-slate-400 mb-8">
                Join industrial teams using ForgeMind AI to unlock the intelligence hidden in their documents.
              </p>
              <Link to="/register" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-base font-semibold transition-colors inline-flex items-center gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-500 text-sm">
        © 2025 ForgeMind AI. Built with ❤️ for Industrial Intelligence.
      </footer>
    </div>
  )
}
