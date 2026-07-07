import React from 'react';
import { motion } from 'framer-motion';
import { Network, Database, Cpu, Bot, Zap, Code2, ArrowRight } from 'lucide-react';

export function HackathonShowcasePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-forge-500/30 font-sans">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-forge-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="px-4 py-2 rounded-full bg-forge-500/10 text-forge-400 text-sm font-bold tracking-widest uppercase border border-forge-500/20 mb-8 inline-block">
              ET AI Hackathon Submission
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-slate-500"
          >
            ForgeMind Enterprise <br />
            Industrial Intelligence
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
          >
            A multi-agent, knowledge-graph powered platform that transforms siloed industrial data into actionable engineering intelligence.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex justify-center gap-4">
            <a href="/app/presentation" className="px-8 py-4 bg-forge-gradient text-white rounded-xl font-bold shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2">
              <Zap size={20} /> Launch Pitch Deck
            </a>
            <a href="/app/explorer" className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
              <Network size={20} /> Open Graph Explorer
            </a>
          </motion.div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 px-8 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">System Architecture</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">We moved beyond simple vector search. ForgeMind orchestrates specialized AI agents over both dense vectors and relational knowledge graphs.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-2xl border border-white/5 hover:border-forge-500/30 transition-colors group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Network className="text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Knowledge Graph</h3>
              <p className="text-slate-400">PostgreSQL-backed relational mapping of Equipment, People, Incidents, and Standards using a custom GraphProvider abstraction.</p>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot className="text-emerald-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">LangGraph Agents</h3>
              <p className="text-slate-400">A multi-agent orchestrator featuring Chief Routing, Retrieval, Knowledge Graph, and Reasoning agents for complex task resolution.</p>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="text-purple-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Explainable AI</h3>
              <p className="text-slate-400">Developer playground and tracing UI that exposes exact latency, agent routing decisions, and confidence scores for every query.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">The Stack</h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'Framer Motion', 'React Flow', 'Force Graph 2D', 'Tailwind', 'FastAPI', 'LangGraph', 'Qdrant', 'PostgreSQL', 'SQLAlchemy'].map((tech) => (
              <span key={tech} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white font-medium flex items-center gap-2">
                <Code2 size={16} className="text-slate-400" /> {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
