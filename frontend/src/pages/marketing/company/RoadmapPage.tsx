import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { m } from 'framer-motion'
import { Map, Clock, CheckCircle, ArrowRight } from 'lucide-react'

export function RoadmapPage() {
  const quarters = [
    {
      title: 'Q4 2026',
      status: 'In Progress',
      items: [
        'Real-time IoT Sensor Data Integration',
        'Predictive Maintenance AI Agents',
        'Offline Mode for Mobile Tablets'
      ]
    },
    {
      title: 'Q1 2027',
      status: 'Planned',
      items: [
        'Automated Root Cause Analysis Reports',
        'Integration with Augmented Reality (AR) headsets',
        'Multi-lingual Knowledge Graph generation'
      ]
    },
    {
      title: 'Q2 2027',
      status: 'Exploring',
      items: [
        'Digital Twin bidirectional sync',
        'Autonomous Work Order generation',
        'Voice-first Copilot interface'
      ]
    }
  ]

  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Product Roadmap</h1>
          <p className="text-lg text-[var(--text-secondary)]">See where ForgeMind AI is heading next. We are constantly pushing the boundaries of Industrial Intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quarters.map((q, i) => (
            <m.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-3xl p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">{q.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                  q.status === 'In Progress' ? 'bg-forge-500/20 text-forge-400' :
                  q.status === 'Planned' ? 'bg-indigo-500/20 text-indigo-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {q.status}
                </span>
              </div>
              
              <ul className="space-y-4">
                {q.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </m.div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  )
}
