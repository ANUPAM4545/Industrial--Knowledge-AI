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
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  // ─── Public ─────────────────────────────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
  },

  // ─── Auth ────────────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
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
    ],
  },

  // ─── 404 ─────────────────────────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
