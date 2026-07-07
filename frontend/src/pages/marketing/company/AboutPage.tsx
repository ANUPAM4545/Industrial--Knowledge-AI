import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { m } from 'framer-motion'
import { Users, Globe2, Target } from 'lucide-react'

export function AboutPage() {
  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Building the Brain of <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-400 to-indigo-500">Industry 4.0</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            We are a team of AI researchers, mechanical engineers, and software architects dedicated to solving the unstructured data problem in heavy industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-3xl p-8 text-center">
            <Users className="w-12 h-12 text-forge-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-4">Founded by Engineers</h3>
            <p className="text-[var(--text-secondary)] text-sm">Born out of the frustration of searching through thousands of PDF manuals on the factory floor.</p>
          </div>
          <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-3xl p-8 text-center">
            <Target className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-4">Our Mission</h3>
            <p className="text-[var(--text-secondary)] text-sm">To eliminate equipment downtime by making tribal knowledge and technical specs instantly accessible and explainable.</p>
          </div>
          <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-3xl p-8 text-center">
            <Globe2 className="w-12 h-12 text-blue-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-4">Global Reach</h3>
            <p className="text-[var(--text-secondary)] text-sm">Trusted by leading manufacturers and energy providers across North America and Europe.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Revolution</h2>
          <p className="text-[var(--text-secondary)] mb-8">We are always looking for brilliant minds to join our mission. Check out our open roles.</p>
          <button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
            View Careers
          </button>
        </div>
      </div>
    </MarketingLayout>
  )
}
