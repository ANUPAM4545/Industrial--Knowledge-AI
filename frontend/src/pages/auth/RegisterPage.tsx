import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Database, BarChart3, ChevronLeft } from 'lucide-react'
import { SignUp } from '@clerk/clerk-react'

import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function RegisterPage() {
  return (
    <div className="min-h-screen flex w-full bg-slate-950 text-slate-200">
      
      {/* ─── LEFT SIDE (Visuals & Brand) ───────────────────────────────── */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden bg-slate-900 border-r border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute bottom-0 left-0 w-full h-[500px] bg-indigo-600/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-0 right-0 w-full h-[500px] bg-purple-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="relative z-10 p-12">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">ForgeMind AI</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              Empower your Operations with <br/>
              <span className="text-indigo-400">Contextual Knowledge</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Register an organizational account to ingest, search, and analyze industrial documents instantly.
            </p>
          </motion.div>

          <motion.div 
            className="mt-12 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[
              { icon: Database, title: 'Multi-Format Ingestion', desc: 'Securely parse complex PDFs and DOCX manuals.' },
              { icon: BarChart3, title: 'Knowledge Analytics', desc: 'Monitor embedding drift, token usage, and search metrics.' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── RIGHT SIDE (Auth Form) ────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative p-8 sm:p-12 lg:p-24 overflow-y-auto">
        
        <div className="absolute top-8 left-8 flex items-center gap-4">
          <Link to="/login" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
        
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <motion.div 
          className="w-full max-w-md mx-auto mt-12 lg:mt-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <SignUp routing="path" path="/register" signInUrl="/login" forceRedirectUrl="/app" />
        </motion.div>
      </div>
    </div>
  )
}
export default RegisterPage
