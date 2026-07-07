import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { m } from 'framer-motion'
import { Brain, Shield, Database, Zap, Network, Lock, FileSearch, Code } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/animations'

export function FeaturesPage() {
  const features = [
    {
      title: 'Multi-Agent Orchestration',
      description: 'Unlike standard RAG, our LangGraph-powered agents actively break down complex engineering problems, assign sub-tasks, and synthesize results.',
      icon: <Network className="w-8 h-8 text-forge-500" />,
      colSpan: 'md:col-span-2'
    },
    {
      title: 'Knowledge Graph Navigation',
      description: 'Visualize your entire enterprise knowledge. Connect SOPs to P&IDs automatically using our entity extraction pipeline.',
      icon: <Database className="w-8 h-8 text-indigo-500" />,
      colSpan: 'md:col-span-1'
    },
    {
      title: 'Hybrid Retrieval Engine',
      description: 'Combines dense vector search (Qdrant) with keyword search (BM25) and reranking for unmatched accuracy in technical documents.',
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      colSpan: 'md:col-span-1'
    },
    {
      title: 'Explanable AI',
      description: 'Every answer provides a complete trace, showing exactly which agents were used, latencies, and direct citations to your source PDFs.',
      icon: <FileSearch className="w-8 h-8 text-emerald-500" />,
      colSpan: 'md:col-span-2'
    },
    {
      title: 'Enterprise Security',
      description: 'Strict tenant isolation, SOC2 compliance, and granular Role-Based Access Control (RBAC) built into the core.',
      icon: <Shield className="w-8 h-8 text-rose-500" />,
      colSpan: 'md:col-span-3'
    }
  ]

  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <m.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <m.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Built for <span className="text-transparent bg-clip-text bg-forge-gradient">Industrial Scale</span>
          </m.h1>
          <m.p variants={fadeUp} className="text-lg text-[var(--text-secondary)] leading-relaxed">
            ForgeMind AI is not just another chatbot. It is a comprehensive intelligence platform designed specifically for complex engineering, manufacturing, and operational environments.
          </m.p>
        </m.div>

        <m.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <m.div 
              key={i} 
              variants={fadeUp}
              className={`bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-3xl p-8 hover:border-forge-500/50 transition-colors shadow-sm ${feature.colSpan}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-8 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </m.div>
          ))}
        </m.div>
      </div>
    </MarketingLayout>
  )
}
