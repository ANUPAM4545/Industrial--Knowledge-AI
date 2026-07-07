import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'

export function TermsOfServicePage() {
  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 py-20 lg:py-32">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Terms of Service</h1>
        <p className="text-[var(--text-secondary)] mb-12">Last updated: October 2026</p>

        <div className="prose prose-invert max-w-none prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-a:text-forge-500 hover:prose-a:text-forge-400">
          <p>
            Please read these Terms of Service carefully before using the NEXO platform operated by NEXO Inc.
          </p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our service, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2>2. Enterprise Usage</h2>
          <p>
            NEXO is an enterprise B2B platform. Access is granted via organizational accounts. You are responsible for safeguarding the credentials used to access the platform.
          </p>

          <h2>3. Intellectual Property</h2>
          <p>
            The platform and its original content (excluding data provided by users), features, and functionality are and will remain the exclusive property of NEXO Inc. Your uploaded data (documents, schemas, graphs) remains your exclusive intellectual property.
          </p>

          <h2>4. Liability</h2>
          <p>
            While NEXO strives for high accuracy, the AI-generated outputs are for informational and reasoning support only. A qualified human engineer must always review AI recommendations before executing critical industrial actions.
          </p>
        </div>
      </div>
    </MarketingLayout>
  )
}
