#!/bin/bash
set -e

cd /Users/anupam45/Industrial-Knowledge-Ai/Industrial--Knowledge-AI

# Commit 1
git add backend/alembic/ backend/app/db/
git commit -m "feat(db): add alembic migrations for security, marketing, and intelligence models"

# Commit 2
git add backend/app/models/ backend/app/schemas/
git commit -m "feat(models): implement postgres sqlalchemy models for rbac, security, and telemetry"

# Commit 3
git add backend/app/security/
git commit -m "feat(security): implement ai prompt injection guards and rate limiting middleware"

# Commit 4
git add backend/app/ai/ backend/app/retrieval/ backend/app/reranking/ backend/app/rag/
git commit -m "feat(rag): add hybrid retrieval, bge reranking, and query rewriting pipelines"

# Commit 5
git add backend/app/core/ backend/app/main.py backend/app/services/ backend/requirements.txt backend/pytest.ini backend/tests/ docker-compose.* .env.example
git commit -m "chore(backend): update core config, services, and test suite"

# Commit 6
git add frontend/src/services/ frontend/src/store/ frontend/package.json frontend/package-lock.json frontend/tsconfig.tsbuildinfo frontend/vite.config.ts frontend/src/vite-env.d.ts
git commit -m "refactor(frontend): restructure auth store and introduce environment providers"

# Commit 7
git add frontend/src/components/marketing/ frontend/src/pages/marketing/ frontend/src/layouts/MarketingLayout.tsx frontend/src/pages/LandingPage.tsx
git commit -m "feat(frontend): build marketing landing pages and legal policy views"

# Commit 8
git add frontend/src/components/ui/ frontend/src/pwa/ frontend/src/hooks/usePWA.ts frontend/public/ frontend/src/lib/ frontend/src/index.css frontend/tailwind.config.ts frontend/index.html frontend/src/main.tsx frontend/src/App.tsx frontend/src/layouts/AuthLayout.tsx frontend/src/layouts/AppLayout.tsx frontend/src/pages/NotFoundPage.tsx
git commit -m "feat(frontend): implement pwa support, ui components, and core layouts" || true

# Commit 9
git add frontend/src/components/documents/ frontend/src/hooks/useDocuments.ts frontend/src/pages/app/ChatPage.tsx frontend/src/pages/app/DashboardPage.tsx frontend/src/pages/app/KnowledgeBasePage.tsx frontend/src/pages/app/SettingsPage.tsx frontend/src/pages/app/UploadPage.tsx frontend/src/pages/app/AnalyticsPage.tsx frontend/src/pages/app/KnowledgeExplorerPage.tsx frontend/src/pages/app/PlaygroundPage.tsx frontend/src/pages/app/PresentationMode.tsx frontend/src/pages/app/WorkflowBuilderPage.tsx frontend/src/pages/auth/ frontend/src/routes/
git commit -m "feat(app): build application features, document management, and chat interface"

# Commit 10 - Catch remaining like admin/security dashboards and docs
git add .
git commit -m "feat(admin): implement user management, security center dashboard, and admin apis"

