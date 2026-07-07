import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'

export function PrivacyPolicyPage() {
  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 py-20 lg:py-32">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Privacy Policy</h1>
        <p className="text-[var(--text-secondary)] mb-12">Last updated: October 2026</p>

        <div className="prose prose-invert max-w-none prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-a:text-forge-500 hover:prose-a:text-forge-400">
          <p>
            At NEXO, we take your privacy and the security of your industrial data seriously. This Privacy Policy outlines how we collect, use, and protect your information.
          </p>
          
          <h2>1. Data Collection</h2>
          <p>
            We collect data that you provide directly to us when you use the NEXO platform, including but not limited to uploaded P&IDs, manuals, standard operating procedures, and user account information.
          </p>

          <h2>2. Data Usage</h2>
          <p>
            Your proprietary documents are used strictly to build a Knowledge Graph and vector index scoped entirely to your tenant. We do <strong>not</strong> use your industrial data to train foundational models or share it across tenants.
          </p>

          <h2>3. Data Retention</h2>
          <p>
            You have full control over your data. Upon termination of service, all vectors, graphs, and raw documents are cryptographically erased from our servers within 30 days.
          </p>

          <h2>4. Contact Us</h2>
          <p>
            If you have questions regarding this policy, please contact our Data Protection Officer at privacy@nexo.ai.
          </p>
        </div>
      </div>
    </MarketingLayout>
  )
}
