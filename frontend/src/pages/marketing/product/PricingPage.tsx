import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { m } from 'framer-motion'
import { Check, X, Zap } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'

export function PricingPage() {
  const tiers = [
    {
      name: 'Starter',
      price: '$499',
      interval: '/mo',
      description: 'For small engineering teams getting started with AI.',
      features: ['Up to 10,000 documents', 'Basic Hybrid Search (BM25 + Vectors)', '5 Team Members', 'Standard LLM Models', 'Email Support'],
      missing: ['Knowledge Graph Creation', 'Multi-Agent Orchestration', 'SSO & RBAC', 'On-Premise Deployment'],
      highlight: false
    },
    {
      name: 'Professional',
      price: '$1,299',
      interval: '/mo',
      description: 'For growing departments needing graph intelligence.',
      features: ['Up to 100,000 documents', 'Advanced Knowledge Graph', 'LangGraph Multi-Agent Workflows', '25 Team Members', 'Premium LLM Models (GPT-4o, Claude 3.5)', 'Priority Support'],
      missing: ['On-Premise Deployment', 'Dedicated Account Manager'],
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      interval: '',
      description: 'For large industrial operations with strict security.',
      features: ['Unlimited Documents', 'Dedicated VPC or On-Premise', 'Unlimited Team Members', 'Fine-Tuned Custom Models', 'SSO (Okta/SAML) & Strict RBAC', '24/7 SLA Support', 'Dedicated Account Manager'],
      missing: [],
      highlight: false
    }
  ]

  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Simple, Transparent Pricing</h1>
          <p className="text-lg text-[var(--text-secondary)]">Start small, scale to the entire plant. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, i) => (
            <m.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-3xl p-8 border ${
                tier.highlight 
                  ? 'bg-forge-500/10 border-forge-500 shadow-glow-lg scale-105 z-10' 
                  : 'bg-[var(--surface-primary)] border-[var(--border-subtle)]'
              } flex flex-col`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-forge-500 text-white text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6 h-10">{tier.description}</p>
              
              <div className="mb-8">
                <span className="text-5xl font-black">{tier.price}</span>
                <span className="text-[var(--text-secondary)] font-medium">{tier.interval}</span>
              </div>
              
              <MagneticButton className={`w-full py-3 rounded-xl font-bold mb-8 transition-all ${
                tier.highlight ? 'bg-forge-gradient text-white shadow-glow-md' : 'bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}>
                Get Started
              </MagneticButton>

              <div className="space-y-4 flex-1">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-[var(--text-primary)]">{feature}</span>
                  </div>
                ))}
                {tier.missing.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 opacity-50">
                    <X className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                    <span className="text-sm text-[var(--text-muted)] line-through">{feature}</span>
                  </div>
                ))}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  )
}
