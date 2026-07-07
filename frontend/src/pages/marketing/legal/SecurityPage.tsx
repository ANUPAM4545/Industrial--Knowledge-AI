import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { Shield, Lock, Server, FileCheck } from 'lucide-react'
import { m } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'

export function SecurityPage() {
  const principles = [
    {
      title: 'SOC 2 Type II Certified',
      description: 'We undergo regular third-party audits to ensure our security controls, availability, and processing integrity meet the highest enterprise standards.',
      icon: <FileCheck className="w-8 h-8 text-emerald-500" />
    },
    {
      title: 'End-to-End Encryption',
      description: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Your proprietary CAD files and manuals are never exposed.',
      icon: <Lock className="w-8 h-8 text-forge-500" />
    },
    {
      title: 'Strict Tenant Isolation',
      description: 'Your vectors, graph nodes, and raw documents are physically and logically separated from other tenants. We never train public LLMs on your data.',
      icon: <Server className="w-8 h-8 text-indigo-500" />
    },
    {
      title: 'Granular RBAC & SSO',
      description: 'Control exactly who has access to which knowledge spaces with Role-Based Access Control and native integrations with Okta, Azure AD, and SAML 2.0.',
      icon: <Shield className="w-8 h-8 text-rose-500" />
    }
  ]

  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <m.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Security & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Trust</span>
          </m.h1>
          <m.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Industrial intelligence requires industrial-grade security. We protect your proprietary data with the same rigor you protect your physical assets.
          </m.p>
        </div>

        <m.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32"
        >
          {principles.map((p, i) => (
            <m.div 
              key={i}
              variants={fadeUp}
              className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-3xl p-8 hover:border-forge-500/30 transition-colors shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 shadow-inner">
                {p.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{p.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{p.description}</p>
            </m.div>
          ))}
        </m.div>

        <div className="max-w-4xl mx-auto bg-forge-gradient rounded-3xl p-12 text-center text-white shadow-glow-lg">
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Request our SOC 2 Report</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Our full SOC 2 Type II report and detailed security architecture whitepaper are available upon request under NDA.
          </p>
          <button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
            Contact Security Team
          </button>
        </div>
      </div>
    </MarketingLayout>
  )
}
