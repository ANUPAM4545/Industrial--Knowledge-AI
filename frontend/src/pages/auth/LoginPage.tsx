import { motion } from 'framer-motion'
import { Zap, Brain, Shield } from 'lucide-react'
import { SignIn } from '@clerk/clerk-react'

import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function LoginPage() {
  return (
    <div className="min-h-screen flex w-full bg-slate-950 text-slate-200">
      
      {/* ─── LEFT SIDE (Visuals & Brand) ───────────────────────────────── */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden bg-slate-900 border-r border-slate-800">
        
        {/* Animated Background Gradients & Grid */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-600/30 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/4" />
          <div className="absolute bottom-0 right-0 w-full h-[500px] bg-purple-600/30 rounded-full blur-[120px] translate-y-1/2 translate-x-1/4" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">NEXO</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              Industrial Knowledge <br/>
              <span className="text-indigo-400">Intelligence Platform</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Connect your manuals, specs, and SOPs into a singular, queryable AI engine with deterministic citations.
            </p>
          </motion.div>

          <motion.div 
            className="mt-12 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[
              { icon: Brain, title: 'Explainable AI', desc: 'Every answer cited to the exact source paragraph.' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access controls and isolated tenant vectors.' },
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
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative p-8 sm:p-12 lg:p-24 overflow-hidden">
        
        {/* Mobile Logo & Theme Toggle */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white">NEXO</span>
        </div>
        
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <motion.div 
          className="w-full max-w-md mx-auto flex flex-col items-center justify-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <SignIn routing="path" path="/login" signUpUrl="/register" forceRedirectUrl="/app" />
        </motion.div>
      </div>
    </div>
  )
}
export default LoginPage
