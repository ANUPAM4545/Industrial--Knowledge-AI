import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { m } from 'framer-motion'
import { GitCommit } from 'lucide-react'

export function ChangelogPage() {
  const logs = [
    {
      version: 'v1.4.0',
      date: 'October 15, 2026',
      tag: 'New Feature',
      title: 'LangGraph Multi-Agent Workflows released',
      description: 'We have completely overhauled the retrieval engine to use LangGraph. ForgeMind now deploys specialized agents (Chief, Retrieval, Knowledge Graph, Reasoning) for every complex engineering query.'
    },
    {
      version: 'v1.3.2',
      date: 'September 28, 2026',
      tag: 'Improvement',
      title: 'PostgreSQL Graph Provider',
      description: 'Added support for PostgreSQL as a first-class Graph Provider. You can now build massive Knowledge Graphs without needing a dedicated Neo4j instance.'
    },
    {
      version: 'v1.3.0',
      date: 'September 10, 2026',
      tag: 'New Feature',
      title: 'Visual Workflow Builder',
      description: 'Introduced a drag-and-drop workflow builder (powered by React Flow) for designing custom document ingestion and extraction pipelines.'
    },
    {
      version: 'v1.2.0',
      date: 'August 15, 2026',
      tag: 'Release',
      title: 'SOC2 Type II Certification Achieved',
      description: 'Security is paramount for industrial operations. We are proud to announce full SOC2 Type II compliance.'
    }
  ]

  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-32">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Changelog</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-16">See what's new in ForgeMind AI.</p>

        <div className="space-y-16">
          {logs.map((log, i) => (
            <m.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-8 relative"
            >
              <div className="md:w-48 shrink-0 relative">
                <div className="sticky top-24">
                  <span className="text-[var(--text-primary)] font-mono font-bold">{log.version}</span>
                  <div className="text-sm text-[var(--text-muted)] mt-1">{log.date}</div>
                </div>
              </div>
              
              {/* Timeline dot */}
              <div className="hidden md:flex absolute left-48 top-0 bottom-0 -translate-x-1/2 w-px bg-[var(--border-subtle)] justify-center">
                <div className="w-4 h-4 rounded-full bg-[var(--surface-primary)] border-2 border-forge-500 mt-1 shadow-[0_0_10px_rgba(91,110,244,0.5)] z-10 flex items-center justify-center">
                  <GitCommit className="w-2 h-2 text-forge-400" />
                </div>
              </div>

              <div className="flex-1 md:pl-12">
                <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-4 ${
                  log.tag === 'New Feature' ? 'bg-emerald-500/10 text-emerald-400' :
                  log.tag === 'Improvement' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-forge-500/10 text-forge-400'
                }`}>
                  {log.tag}
                </span>
                <h3 className="text-2xl font-bold mb-4">{log.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{log.description}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  )
}
