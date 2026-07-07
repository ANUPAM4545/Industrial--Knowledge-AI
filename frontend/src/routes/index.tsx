import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

// Pages
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/app/DashboardPage'
import { KnowledgeBasePage } from '@/pages/app/KnowledgeBasePage'
import { UploadPage } from '@/pages/app/UploadPage'
import { ChatPage } from '@/pages/app/ChatPage'
import { AnalyticsPage } from '@/pages/app/AnalyticsPage'
import { SettingsPage } from '@/pages/app/SettingsPage'
import { KnowledgeExplorerPage } from '@/pages/app/KnowledgeExplorerPage'
import { WorkflowBuilderPage } from '@/pages/app/WorkflowBuilderPage'
import { PlaygroundPage } from '@/pages/app/PlaygroundPage'
import { PresentationMode } from '@/pages/app/PresentationMode'
import { SecurityDashboardPage } from '@/pages/app/security/SecurityDashboardPage'
import { HackathonShowcasePage } from '@/pages/marketing/HackathonShowcasePage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Marketing Pages - Product
import { FeaturesPage } from '@/pages/marketing/product/FeaturesPage'
import { WorkflowPage } from '@/pages/marketing/product/WorkflowPage'
import { IntegrationsPage } from '@/pages/marketing/product/IntegrationsPage'
import { PricingPage } from '@/pages/marketing/product/PricingPage'
import { ChangelogPage } from '@/pages/marketing/product/ChangelogPage'

// Marketing Pages - Company
import { AboutPage } from '@/pages/marketing/company/AboutPage'
import { RoadmapPage } from '@/pages/marketing/company/RoadmapPage'
import { BlogPage } from '@/pages/marketing/company/BlogPage'
import { ContactPage } from '@/pages/marketing/company/ContactPage'

// Marketing Pages - Legal
import { PrivacyPolicyPage } from '@/pages/marketing/legal/PrivacyPolicyPage'
import { TermsOfServicePage } from '@/pages/marketing/legal/TermsOfServicePage'
import { CookiePolicyPage } from '@/pages/marketing/legal/CookiePolicyPage'
import { SecurityPage } from '@/pages/marketing/legal/SecurityPage'

export const router = createBrowserRouter([
  // ─── Public ─────────────────────────────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
  },
  { path: '/features', element: <FeaturesPage /> },
  { path: '/workflow', element: <WorkflowPage /> },
  { path: '/integrations', element: <IntegrationsPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/changelog', element: <ChangelogPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/roadmap', element: <RoadmapPage /> },
  { path: '/blog', element: <BlogPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/privacy', element: <PrivacyPolicyPage /> },
  { path: '/terms', element: <TermsOfServicePage /> },
  { path: '/cookies', element: <CookiePolicyPage /> },
  { path: '/security', element: <SecurityPage /> },
  { path: '/showcase', element: <HackathonShowcasePage /> },

  // ─── Auth ────────────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: '/login/*', element: <LoginPage /> },
      { path: '/register/*', element: <RegisterPage /> },
    ],
  },

  // ─── App (Protected) ─────────────────────────────────────────────
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'knowledge-base', element: <KnowledgeBasePage /> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'chat/:conversationId', element: <ChatPage /> },
      { path: 'explorer', element: <KnowledgeExplorerPage /> },
      { path: 'workflows', element: <WorkflowBuilderPage /> },
      { path: 'playground', element: <PlaygroundPage /> },
      { path: 'presentation', element: <PresentationMode /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  // ─── Admin (Protected + Admin Role) ──────────────────────────────
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'security', element: <SecurityDashboardPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },

  // ─── 404 ─────────────────────────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
