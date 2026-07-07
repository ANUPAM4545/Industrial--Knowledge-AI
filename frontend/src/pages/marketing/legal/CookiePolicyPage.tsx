import React from 'react'
import { MarketingLayout } from '@/layouts/MarketingLayout'

export function CookiePolicyPage() {
  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 py-20 lg:py-32">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Cookie Policy</h1>
        <p className="text-[var(--text-secondary)] mb-12">Last updated: October 2026</p>

        <div className="prose prose-invert max-w-none prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-a:text-forge-500 hover:prose-a:text-forge-400">
          <p>
            This Cookie Policy explains how NEXO uses cookies and similar technologies to recognize you when you visit our website and application.
          </p>
          
          <h2>1. What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>

          <h2>2. Essential Cookies</h2>
          <p>
            We use essential cookies to authenticate users, prevent fraudulent use of user accounts, and maintain session state across the LangGraph reasoning pipeline. These cannot be disabled.
          </p>

          <h2>3. Performance and Analytics Cookies</h2>
          <p>
            We use these cookies to understand how our users interact with the Knowledge Graph Explorer and Workflow Builder, which helps us optimize the user experience.
          </p>

          <h2>4. Managing Cookies</h2>
          <p>
            You have the right to decide whether to accept or reject non-essential cookies. You can set or amend your web browser controls to accept or refuse cookies.
          </p>
        </div>
      </div>
    </MarketingLayout>
  )
}
