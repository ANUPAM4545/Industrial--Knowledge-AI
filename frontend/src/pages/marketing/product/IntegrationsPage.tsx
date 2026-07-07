import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { m } from 'framer-motion'
import { Database, Box, FileText, Settings, Shield, Cloud, Server, Cpu } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/animations'

export function IntegrationsPage() {
  const integrations = [
    { name: 'SAP ERP', type: 'Enterprise Systems', icon: <Database className="w-8 h-8 text-blue-500" />, status: 'Native' },
    { name: 'Microsoft SharePoint', type: 'Document Storage', icon: <Cloud className="w-8 h-8 text-sky-500" />, status: 'Native' },
    { name: 'Atlassian Confluence', type: 'Knowledge Base', icon: <FileText className="w-8 h-8 text-blue-400" />, status: 'Native' },
    { name: 'Siemens Teamcenter', type: 'PLM', icon: <Settings className="w-8 h-8 text-teal-500" />, status: 'Beta' },
    { name: 'IBM Maximo', type: 'Asset Management', icon: <Server className="w-8 h-8 text-indigo-500" />, status: 'Native' },
    { name: 'Autodesk Vault', type: 'CAD Storage', icon: <Box className="w-8 h-8 text-emerald-500" />, status: 'Beta' },
    { name: 'Okta / Azure AD', type: 'Identity & SSO', icon: <Shield className="w-8 h-8 text-purple-500" />, status: 'Native' },
    { name: 'Custom REST API', type: 'Developer Tools', icon: <Cpu className="w-8 h-8 text-forge-400" />, status: 'Native' },
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
            Connects to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Tech Stack</span>
          </m.h1>
          <m.p variants={fadeUp} className="text-lg text-[var(--text-secondary)] leading-relaxed">
            ForgeMind AI ingests data from where it already lives. No data migration required. We index, vectorize, and build graphs directly from your existing sources.
          </m.p>
        </m.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrations.map((item, i) => (
            <m.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 hover:shadow-glow-sm hover:border-forge-500/30 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  item.status === 'Native' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {item.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{item.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{item.type}</p>
            </m.div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  )
}
