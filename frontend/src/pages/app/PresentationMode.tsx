import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, SkipForward, ArrowRight, Database, Server, Cog, FileText, Bot, Hexagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PresentationMode() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const script = [
    {
      title: 'The Challenge',
      subtitle: 'Industrial Knowledge is fragmented across manuals, P&IDs, incident logs, and siloed databases.',
      icon: <Database size={48} className="text-forge-400" />
    },
    {
      title: 'The Solution: NEXO',
      subtitle: 'A Multi-Agent Enterprise Intelligence Platform powered by dynamic Knowledge Graphs.',
      icon: <Server size={48} className="text-indigo-400" />
    },
    {
      title: 'Upload to Automation',
      subtitle: 'Documents are processed instantly. Entities are extracted. A Knowledge Graph is built automatically.',
      icon: <Cog size={48} className="text-emerald-400 animate-spin-slow" />
    },
    {
      title: 'Industrial Copilot',
      subtitle: 'Agents reason over graph connections and dense vectors simultaneously, solving complex engineering queries.',
      icon: <Bot size={48} className="text-amber-400" />
    },
    {
      title: 'Built for Enterprise',
      subtitle: 'Fully auditable AI. Explanable graph paths. High confidence. Welcome to the future of Industrial AI.',
      icon: <Hexagon size={48} className="text-forge-500" />
    }
  ];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setStep(s => {
          if (s >= script.length - 1) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 5000); // 5 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] text-white overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-forge-600/30 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[150px]" />
      </div>

      {/* Top Bar */}
      <div className="flex justify-between items-center p-8 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forge-gradient flex items-center justify-center">
            <Hexagon size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">NEXO</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isPlaying ? <span className="text-xs font-bold uppercase tracking-widest">Pause</span> : <Play size={20} />}
          </button>
          <button 
            onClick={() => {
              if (step < script.length - 1) setStep(s => s + 1);
            }}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <SkipForward size={20} />
          </button>
          <button 
            onClick={() => navigate('/app/dashboard')}
            className="px-6 py-3 rounded-full bg-forge-gradient font-bold text-sm shadow-glow-md flex items-center gap-2 hover:scale-105 transition-transform"
          >
            Exit Presentation
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-5xl"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="w-32 h-32 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-12 shadow-[0_0_100px_rgba(59,130,246,0.2)]"
            >
              {script[step].icon}
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50 leading-tight">
              {script[step].title}
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/60 leading-relaxed font-light max-w-3xl mx-auto">
              {script[step].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 w-full bg-white/5 z-10 relative">
        <motion.div 
          className="h-full bg-forge-500"
          initial={{ width: `${(step / script.length) * 100}%` }}
          animate={{ width: `${((step + 1) / script.length) * 100}%` }}
          transition={{ duration: isPlaying ? 5 : 0.5, ease: "linear" }}
        />
      </div>
    </div>
  );
}
