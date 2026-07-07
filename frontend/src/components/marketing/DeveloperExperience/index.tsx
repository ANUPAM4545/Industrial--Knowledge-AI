import React from 'react'
import { m } from 'framer-motion'
import { Terminal, Code, Cpu, Workflow } from 'lucide-react'

export function DeveloperExperience() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#080B14]">
      <div className="absolute inset-0 bg-forge-500/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-forge-500/20 via-transparent to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Code Window Simulation */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 rounded-2xl bg-[#0d1117] border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="h-10 bg-[#161b22] border-b border-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="mx-auto text-[10px] text-slate-500 font-mono">retrieval_pipeline.py</div>
            </div>
            <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
<pre className="text-slate-300">
<span className="text-purple-400">async def</span> <span className="text-blue-400">execute_pipeline</span>(query: str):
<br/>
    <span className="text-slate-500"># 1. Parallel Hybrid Retrieval</span>
    docs = <span className="text-purple-400">await</span> asyncio.gather(
        vector_retriever.search(query, k=<span className="text-amber-400">10</span>),
        keyword_retriever.search(query, k=<span className="text-amber-400">10</span>)
    )
<br/>
    <span className="text-slate-500"># 2. Reciprocal Rank Fusion</span>
    merged_docs = rrf_strategy.merge(docs)
<br/>
    <span className="text-slate-500"># 3. Cross-Encoder Reranking</span>
    reranked = <span className="text-purple-400">await</span> reranker.score(query, merged_docs)
<br/>
    <span className="text-purple-400">return</span> reranked[:<span className="text-amber-400">5</span>]
</pre>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forge-500/10 border border-forge-500/20 text-forge-400 text-sm font-medium mb-6">
              <Terminal className="w-4 h-4" />
              Developer Experience
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Observable <span className="text-forge-400">by design</span>.
            </h2>
            
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Every stage of the ForgeMind pipeline is fully observable. Built by engineers, for engineers. Toggle Developer Mode to instantly view latencies, RRF scores, and citation mappings in real-time.
            </p>
            
            <ul className="grid grid-cols-2 gap-4">
              {[
                { icon: Code, title: 'Clean Architecture' },
                { icon: Cpu, title: 'GPU Accelerated' },
                { icon: Terminal, title: 'Developer Mode' },
                { icon: Workflow, title: 'Pipeline Timelines' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <item.icon className="w-4 h-4 text-forge-400" />
                  <span className="text-sm font-medium text-slate-300">{item.title}</span>
                </li>
              ))}
            </ul>
          </m.div>

        </div>
      </div>
    </section>
  )
}
