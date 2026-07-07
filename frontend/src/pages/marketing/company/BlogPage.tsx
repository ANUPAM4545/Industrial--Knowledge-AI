import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { m } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function BlogPage() {
  const posts = [
    {
      category: 'Engineering',
      date: 'October 12, 2026',
      title: 'Why standard RAG fails in Industrial applications',
      description: 'Discover why keyword overlap and simple vector search aren\'t enough when querying complex P&IDs and technical manuals.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Product Updates',
      date: 'September 20, 2026',
      title: 'Introducing Multi-Agent Workflows with LangGraph',
      description: 'How we rebuilt our AI backend to support complex reasoning tasks using specialized LangChain agents.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
    },
    {
      category: 'Case Study',
      date: 'August 5, 2026',
      title: 'Reducing Pump Downtime by 40% with Knowledge Graphs',
      description: 'A deep dive into how a major energy provider used NEXO to predict failures and access historical maintenance logs instantly.',
      image: 'https://images.unsplash.com/photo-1531234799389-dcb5f7ce00eb?auto=format&fit=crop&w=800&q=80'
    }
  ]

  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">The Industrial AI Blog</h1>
          <p className="text-lg text-[var(--text-secondary)]">Insights, architecture deep-dives, and updates from the NEXO team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <m.article 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden group cursor-pointer hover:border-forge-500/50 transition-colors"
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-forge-400">{post.category}</span>
                  <span className="text-xs text-[var(--text-muted)]">{post.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-forge-400 transition-colors">{post.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">{post.description}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-forge-500">
                  Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </m.article>
          ))}
        </div>
      </div>
    </MarketingLayout>
  )
}
