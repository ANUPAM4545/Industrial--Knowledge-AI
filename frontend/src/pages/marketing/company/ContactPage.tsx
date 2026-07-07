import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { m } from 'framer-motion'
import { MapPin, Mail, Phone } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'

export function ContactPage() {
  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Get in touch</h1>
            <p className="text-lg text-[var(--text-secondary)] mb-12">
              Interested in deploying ForgeMind AI at your facility? Have questions about our architecture? Our engineering team is ready to talk.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-forge-500/10 border border-forge-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-forge-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Headquarters</h4>
                  <p className="text-[var(--text-secondary)]">100 Innovation Drive<br />San Francisco, CA 94105</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Email Us</h4>
                  <p className="text-[var(--text-secondary)]">hello@forgemind.ai</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Call Us</h4>
                  <p className="text-[var(--text-secondary)]">+1 (800) 555-0199</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-forge-500/10 rounded-full blur-[80px]" />
            <form className="relative z-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">First Name</label>
                  <input type="text" className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 focus:outline-none focus:border-forge-500 transition-colors" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">Last Name</label>
                  <input type="text" className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 focus:outline-none focus:border-forge-500 transition-colors" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">Work Email</label>
                <input type="email" className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 focus:outline-none focus:border-forge-500 transition-colors" placeholder="john@company.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">Message</label>
                <textarea rows={4} className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 focus:outline-none focus:border-forge-500 transition-colors resize-none" placeholder="Tell us about your use case..."></textarea>
              </div>
              <MagneticButton className="w-full py-4 bg-forge-gradient text-white font-bold rounded-xl shadow-glow-md">
                Send Message
              </MagneticButton>
            </form>
          </div>

        </div>
      </div>
    </MarketingLayout>
  )
}
