import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Code, Database, Search, GitBranch, Zap, Cpu } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export function PlaygroundPage() {
  const { theme } = useUIStore();
  const [query, setQuery] = useState('What maintenance is required for Pump-102?');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

  const steps = [
    { id: 'embed', label: 'Query Embedding', icon: Code, desc: 'Converting text to dense vectors' },
    { id: 'retrieve', label: 'Hybrid Search', icon: Search, desc: 'Fetching from Qdrant Vector Store' },
    { id: 'graph', label: 'Graph Traversal', icon: Database, desc: 'Expanding node neighborhood in Postgres' },
    { id: 'agent', label: 'Multi-Agent Routing', icon: GitBranch, desc: 'Chief Agent assigning task to Maintenance Agent' },
    { id: 'llm', label: 'LLM Synthesis', icon: Cpu, desc: 'Generating final response via gpt-4o' }
  ];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setActiveStep(0);
    
    // Fake timeline
    steps.forEach((_, idx) => {
      setTimeout(() => {
        setActiveStep(idx);
      }, 1000 + idx * 800);
    });
    
    setTimeout(() => {
      setIsSimulating(false);
    }, 1000 + steps.length * 800);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] max-w-6xl mx-auto py-8">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
          <Zap className="text-forge-500" /> AI Playground
        </h1>
        <p className="text-[var(--text-secondary)] mt-2 text-lg">
          Developer Mode. Visualize and debug the internal LangGraph Multi-Agent pipeline in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        
        {/* Input Panel */}
        <div className="lg:col-span-1 bg-[var(--surface-primary)] border border-[var(--border-secondary)] rounded-2xl p-6 flex flex-col shadow-xl">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Input Query</h2>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-4 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-forge-500 resize-none font-mono text-sm"
          />
          
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Model</label>
              <select className="w-full p-2.5 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-primary)] focus:outline-none">
                <option>GPT-4o (OpenAI)</option>
                <option>Claude 3.5 Sonnet (Anthropic)</option>
                <option>Llama 3 70B (Local)</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Agent Strategy</label>
              <select className="w-full p-2.5 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-primary)] focus:outline-none">
                <option>Enterprise Copilot (Full Graph)</option>
                <option>Fast Retrieval (Vector Only)</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="mt-auto w-full py-3 bg-forge-gradient text-white rounded-xl font-bold shadow-glow-sm hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isSimulating ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <Play size={18} />}
            {isSimulating ? 'Executing Graph...' : 'Trace Execution'}
          </button>
        </div>

        {/* Pipeline Visualization */}
        <div className="lg:col-span-2 bg-[var(--surface-primary)] border border-[var(--border-secondary)] rounded-2xl p-6 overflow-y-auto shadow-xl">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Pipeline Trace</h2>
          
          <div className="space-y-6 relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-[var(--border-secondary)]" />
            
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const isPast = activeStep > idx || (!isSimulating && activeStep !== -1);
              
              return (
                <div key={step.id} className={`flex items-start gap-6 relative transition-opacity duration-300 ${isSimulating && activeStep < idx ? 'opacity-30' : 'opacity-100'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 shadow-lg ${
                    isActive ? 'bg-forge-500 text-white' : isPast ? 'bg-emerald-500 text-white' : 'bg-[var(--surface-secondary)] text-[var(--text-muted)] border-2 border-[var(--border-secondary)]'
                  }`}>
                    <step.icon size={20} />
                    {isActive && (
                      <div className="absolute -inset-2 border-2 border-forge-500 rounded-full animate-ping opacity-20" />
                    )}
                  </div>
                  
                  <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-xl p-4">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`font-semibold ${isActive || isPast ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{step.label}</h3>
                      {isPast && <span className="text-xs text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">{(Math.random() * 150 + 40).toFixed(0)}ms</span>}
                      {isActive && <span className="text-xs text-forge-400 font-mono animate-pulse">Processing...</span>}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{step.desc}</p>
                    
                    {/* Mock payload details if past */}
                    {isPast && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] overflow-hidden">
                        {idx === 1 && '{"retrieved_chunks": 3, "score_threshold": 0.82}'}
                        {idx === 2 && '{"nodes_expanded": 14, "edges_evaluated": 42}'}
                        {idx === 3 && '{"routing_decision": "MaintenanceAgent", "confidence": 0.98}'}
                        {idx === 4 && '{"tokens_generated": 154, "finish_reason": "stop"}'}
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {(!isSimulating && activeStep !== -1) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <h4 className="text-sm font-bold text-emerald-500 mb-2">Final Output</h4>
              <p className="text-sm text-[var(--text-primary)]">
                Based on the maintenance logs and engineering specifications, Pump-102 requires a Level 2 inspection every 6 months. It was last serviced 7 months ago, meaning it is currently <strong>1 month overdue</strong>. The ISO-9001 compliance standard requires immediate remediation.
              </p>
            </motion.div>
          )}
        </div>
        
      </div>
    </div>
  );
}
