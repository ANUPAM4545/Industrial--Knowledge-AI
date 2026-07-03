import { Link } from 'react-router-dom'
import {
  Zap, Brain, FileText, Search, Shield, BarChart3,
  ArrowRight, ChevronRight, CheckCircle2
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

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0d1a] text-white">
      {/* ─── Navigation ───────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0d1a]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forge-600 flex items-center justify-center">
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
              className="btn-primary text-sm px-4 py-2"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-forge-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forge-600/10 border border-forge-500/20 text-forge-400 text-xs font-medium mb-6 animate-fade-in">
            <Zap className="w-3 h-3" />
            AI-Powered Industrial Knowledge Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-fade-in">
            Transform Your{' '}
            <span className="gradient-text">Industrial Knowledge</span>
            {' '}Into Intelligence
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Upload SOPs, manuals, and maintenance logs. Query your entire knowledge base
            using AI-powered RAG chat with source citations. Built for industrial teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/register" className="btn-primary text-base px-6 py-3">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-6 py-3">
              Sign In <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
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
              <div key={title} className="glass-card p-6 hover:glow-border transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-forge-600/20 flex items-center justify-center mb-4 group-hover:bg-forge-600/30 transition-colors">
                  <Icon className="w-5 h-5 text-forge-400" />
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
              <div key={role} className="glass-card p-5 hover:glow-border transition-all duration-300">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-forge-600/20 text-forge-400 text-xs font-medium mb-4">
                  {role}
                </div>
                <ul className="space-y-2">
                  {perms.map((perm) => (
                    <li key={perm} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forge-400 mt-0.5 flex-shrink-0" />
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
          <div className="glass-card glow-border p-12 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-forge-600/10 to-purple-600/5 pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Ready to forge your knowledge?</h2>
              <p className="text-slate-400 mb-8">
                Join industrial teams using ForgeMind AI to unlock the intelligence hidden in their documents.
              </p>
              <Link to="/register" className="btn-primary text-base px-8 py-3">
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
