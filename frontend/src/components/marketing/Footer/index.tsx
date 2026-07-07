import React, { useState } from 'react'
import { m } from 'framer-motion'
import { Zap, MessageSquare, Globe, Code, Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/services/apiClient'

export function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setStatus('loading')
    try {
      await apiClient.post('/api/v1/marketing/newsletter', { email })
      setStatus('success')
      setMessage('Subscribed successfully!')
      setEmail('')
      setTimeout(() => { setStatus('idle'); setMessage('') }, 3000)
    } catch (err: any) {
      setStatus('error')
      setMessage(err.response?.data?.detail || 'Failed to subscribe. Please try again.')
      setTimeout(() => { setStatus('idle'); setMessage('') }, 3000)
    }
  }

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const fade = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <footer className="border-t border-[var(--border-subtle)] py-20 px-6 bg-[var(--bg-secondary)] relative z-10 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-forge-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
        
        {/* Brand & Newsletter */}
        <div className="col-span-1 md:col-span-4 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <m.div whileHover={{ rotate: 90 }} transition={{ type: "spring" }}>
               <Zap className="w-5 h-5 text-forge-500" />
            </m.div>
            <span className="font-bold text-[var(--text-primary)] text-lg tracking-tight">NEXO</span>
          </div>
          <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed max-w-sm">
            A secure AI assistant for your entire company. Instantly find answers in your documents.
          </p>
          
          <form onSubmit={handleSubscribe} className="relative max-w-xs mb-8">
            <input 
              type="email" 
              placeholder="Subscribe to our newsletter" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-forge-500 focus:ring-1 focus:ring-forge-500 transition-all shadow-sm"
              required
            />
            <button 
              type="submit" 
              disabled={status === 'loading' || status === 'success' || !email}
              className="absolute right-1 top-1 bottom-1 px-3 bg-forge-500 hover:bg-forge-400 text-white rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
               status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
               <ArrowRight className="w-4 h-4" />}
            </button>
            {message && (
              <m.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`absolute -bottom-6 left-0 text-xs font-semibold ${status === 'success' ? 'text-status-success' : 'text-status-danger'}`}>
                {message}
              </m.div>
            )}
          </form>

          <div className="flex gap-4 mt-auto">
            <m.a whileHover={{ y: -3 }} href="https://github.com" target="_blank" rel="noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><Code className="w-5 h-5" /></m.a>
            <m.a whileHover={{ y: -3 }} href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-[var(--text-muted)] hover:text-[#0A66C2] transition-colors"><Globe className="w-5 h-5" /></m.a>
            <m.a whileHover={{ y: -3 }} href="https://twitter.com" target="_blank" rel="noreferrer" className="text-[var(--text-muted)] hover:text-[#1DA1F2] transition-colors"><MessageSquare className="w-5 h-5" /></m.a>
            <m.a whileHover={{ y: -3 }} href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'hello@nexo.ai'}`} className="text-[var(--text-muted)] hover:text-forge-500 transition-colors"><Mail className="w-5 h-5" /></m.a>
          </div>
        </div>

        {/* Product */}
        <m.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="col-span-1 md:col-span-2 md:col-start-6 flex flex-col gap-4">
          <h4 className="font-semibold text-[var(--text-primary)] mb-2 tracking-wide text-sm">Product</h4>
          {[
            { name: 'Features', path: '/features' },
            { name: 'Workflow', path: '/workflow' },
            { name: 'Integrations', path: '/integrations' },
            { name: 'Pricing', path: '/pricing' },
            { name: 'Changelog', path: '/changelog' }
          ].map(link => (
            <Link key={link.name} to={link.path}>
              <m.span variants={fade} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-block relative group w-fit">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--text-primary)] group-hover:w-full transition-all duration-300" />
              </m.span>
            </Link>
          ))}
        </m.div>

        {/* Company */}
        <m.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="col-span-1 md:col-span-2 flex flex-col gap-4">
          <h4 className="font-semibold text-[var(--text-primary)] mb-2 tracking-wide text-sm">Company</h4>
          {[
            { name: 'About NEXO', path: '/about' },
            { name: 'Roadmap', path: '/roadmap' },
            { name: 'Blog', path: '/blog' },
            { name: 'Contact', path: '/contact' }
          ].map(link => (
            <Link key={link.name} to={link.path}>
              <m.span variants={fade} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-block relative group w-fit">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--text-primary)] group-hover:w-full transition-all duration-300" />
              </m.span>
            </Link>
          ))}
        </m.div>

        {/* Legal */}
        <m.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="col-span-1 md:col-span-2 flex flex-col gap-4">
          <h4 className="font-semibold text-[var(--text-primary)] mb-2 tracking-wide text-sm">Legal</h4>
          {[
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Terms of Service', path: '/terms' },
            { name: 'Cookie Policy', path: '/cookies' },
            { name: 'Security', path: '/security' }
          ].map(link => (
            <Link key={link.name} to={link.path}>
              <m.span variants={fade} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-block relative group w-fit">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--text-primary)] group-hover:w-full transition-all duration-300" />
              </m.span>
            </Link>
          ))}
        </m.div>

      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[var(--text-muted)] text-sm flex items-center gap-2">
          © {new Date().getFullYear()} NEXO. All rights reserved.
          <span className="px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[10px] font-mono tracking-widest hidden sm:inline-block">v1.0.0</span>
        </p>
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer px-3 py-1.5 rounded-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="font-medium">All Systems Operational</span>
        </div>
      </div>
    </footer>
  )
}
