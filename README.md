<div align="center">

<img src="https://img.shields.io/badge/NEXO_AI-Industrial_Knowledge_Intelligence-0f172a?style=for-the-badge&logo=brain&logoColor=white" alt="NEXO Banner" width="600"/>

# ⚡ NEXO

### AI-Powered Industrial Knowledge Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-DC143C?style=flat-square)](https://qdrant.tech/)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C?style=flat-square)](https://langchain.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

> **NEXO** transforms how industrial organizations interact with their knowledge assets.  
> Upload PDFs, DOCX files, SOPs, maintenance logs, and technical manuals — then query them using  
> state-of-the-art RAG-powered AI chat with source citations.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Services](#-services)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🌟 Overview

NEXO is a **production-grade, multi-service SaaS platform** designed for industrial enterprises. It enables organizations to:

- 📄 **Ingest** industrial documents (PDFs, DOCX, manuals, SOPs, maintenance logs)
- 🤖 **Query** documents using AI-powered natural language with RAG (Retrieval-Augmented Generation)
- 📍 **Cite** sources — every AI response links back to the exact document and page
- 📊 **Analyze** usage patterns, knowledge gaps, and search trends
- 🔐 **Control** access with role-based permissions (Admin / Engineer / Operator / Manager)

### Key Capabilities

| Feature | Description |
|---------|-------------|
| 📤 Document Upload | Multi-format ingestion (PDF, DOCX, TXT, Images with OCR) |
| 🧠 RAG Chat | Retrieval-Augmented Generation with page-level citations |
| 🔍 Semantic Search | Vector similarity search powered by Qdrant |
| 📊 Analytics | Usage metrics, knowledge health, conversation tracking |
| 🛡️ RBAC | Role-based access control across all resources |
| 🐳 Containerized | Fully Docker Compose orchestrated deployment |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NEXO Platform                       │
├──────────────────┬──────────────────┬───────────────────────────────┤
│   Frontend       │   Backend API    │      AI Service               │
│   React 19       │   FastAPI        │      LangChain + Qdrant        │
│   Vite + TS      │   Python 3.12    │      BAAI BGE Embeddings       │
│   Tailwind CSS   │   SQLAlchemy 2   │      OpenAI Compatible API     │
│   shadcn/ui      │   PostgreSQL     │      OCR Processing            │
│   Zustand        │   JWT Auth       │                               │
│   TanStack Q     │   Pydantic v2    │                               │
└──────────────────┴──────────────────┴───────────────────────────────┘
         │                   │                       │
         └───────────────────┴───────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │       Docker Compose         │
              │  nginx (reverse proxy)       │
              │  PostgreSQL 16               │
              │  Qdrant Vector DB            │
              │  Redis (cache/queue)         │
              └──────────────────────────────┘
```

### Data Flow

```
User → Frontend → Backend API ──→ PostgreSQL (metadata)
                      │
                      └──→ AI Service ──→ Qdrant (vectors)
                                │
                                └──→ OpenAI API (generation)
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| Vite | 5.x | Build tool & dev server |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | Latest | Component library |
| React Router | v7 | Client-side routing |
| TanStack Query | v5 | Server state management |
| Zustand | v5 | Client state management |
| React Hook Form | v7 | Form handling |
| Zod | v3 | Schema validation |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.115 | REST API framework |
| Python | 3.12 | Runtime |
| SQLAlchemy | 2.x | ORM |
| Alembic | Latest | Database migrations |
| PostgreSQL | 16 | Primary database |
| Pydantic | v2 | Data validation |
| PyJWT | Latest | JWT authentication |
| Celery | Latest | Background task queue |
| Redis | Latest | Cache & message broker |

### AI Service
| Technology | Purpose |
|-----------|---------|
| LangChain | RAG orchestration |
| Qdrant | Vector database |
| BAAI/bge-large-en | Embeddings model |
| OpenAI Compatible API | LLM generation |
| Tesseract + Pytesseract | OCR processing |
| PyMuPDF | PDF parsing |
| python-docx | DOCX parsing |

---

## 📁 Project Structure

```
industrial-knowledge-ai/
│
├── 📂 frontend/                    # React 19 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                 # shadcn/ui base components
│   │   │   ├── layout/             # Layout components
│   │   │   ├── chat/               # Chat interface components
│   │   │   ├── documents/          # Document management components
│   │   │   └── analytics/          # Analytics chart components
│   │   ├── pages/                  # Page components (routes)
│   │   ├── layouts/                # Page layouts (auth, app, admin)
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API client services
│   │   ├── routes/                 # Route configuration
│   │   ├── contexts/               # React contexts
│   │   ├── store/                  # Zustand stores
│   │   ├── types/                  # TypeScript type definitions
│   │   └── assets/                 # Static assets
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── 📂 backend/                     # FastAPI Python backend
│   ├── app/
│   │   ├── api/                    # API route handlers
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── documents.py
│   │   │       ├── chat.py
│   │   │       ├── analytics.py
│   │   │       └── admin.py
│   │   ├── core/                   # Core config & security
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── logging.py
│   │   │   └── exceptions.py
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── schemas/                # Pydantic v2 schemas
│   │   ├── services/               # Business logic layer
│   │   ├── repositories/           # Data access layer
│   │   ├── db/                     # Database setup & migrations
│   │   └── utils/                  # Utility functions
│   ├── alembic/                    # Database migrations
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── 📂 ai-service/                  # LangChain RAG microservice
│   ├── app/
│   │   ├── api/                    # AI service API endpoints
│   │   ├── core/                   # AI service configuration
│   │   ├── rag/                    # RAG pipeline
│   │   ├── embeddings/             # Embedding models
│   │   ├── chat/                   # Chat completion logic
│   │   ├── search/                 # Semantic search
│   │   ├── analytics/              # AI analytics
│   │   └── utils/                  # Utilities (OCR, parsers)
│   ├── requirements.txt
│   └── Dockerfile
│
├── 📂 deployment/                  # Infrastructure & deployment
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── conf.d/
│   ├── postgres/
│   │   └── init.sql
│   └── qdrant/
│       └── config.yaml
│
├── 📂 docs/                        # Documentation
│   ├── api/
│   ├── architecture/
│   └── guides/
│
├── 📂 scripts/                     # Utility scripts
│   ├── setup.sh
│   ├── seed.py
│   └── health_check.sh
│
├── docker-compose.yml              # Production compose
├── docker-compose.dev.yml          # Development compose override
├── .env.example                    # Environment variables template
├── .gitignore
├── Makefile                        # Developer commands
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose v2.x
- Node.js 20+ (for local frontend dev)
- Python 3.12+ (for local backend dev)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/forgemind-ai.git
cd forgemind-ai
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
nano .env
```

### 3. Start with Docker Compose

```bash
# Development mode (with hot reload)
make dev

# OR manually:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| AI Service | http://localhost:8001 |
| Qdrant Dashboard | http://localhost:6333/dashboard |
| pgAdmin | http://localhost:5050 |

### 5. Run Database Migrations

```bash
make migrate
# OR:
docker compose exec backend alembic upgrade head
```

### 6. Seed Initial Data

```bash
make seed
# OR:
docker compose exec backend python scripts/seed.py
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# ─── Application ───────────────────────────────────────
APP_NAME=NEXO
APP_ENV=development          # development | production
APP_DEBUG=true
APP_SECRET_KEY=your-super-secret-key-change-in-production

# ─── Backend ───────────────────────────────────────────
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# ─── Database ──────────────────────────────────────────
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=forgemind_db
POSTGRES_USER=forgemind
POSTGRES_PASSWORD=your-strong-password

# ─── JWT ───────────────────────────────────────────────
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# ─── Qdrant Vector DB ──────────────────────────────────
QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_COLLECTION_NAME=forgemind_docs

# ─── AI / LLM ──────────────────────────────────────────
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
EMBEDDING_MODEL=BAAI/bge-large-en-v1.5

# ─── Redis ─────────────────────────────────────────────
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# ─── File Storage ──────────────────────────────────────
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE_MB=50
ALLOWED_EXTENSIONS=pdf,docx,txt,png,jpg,jpeg

# ─── Frontend ──────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:8000
VITE_AI_SERVICE_URL=http://localhost:8001
VITE_APP_NAME=NEXO
```

---

## 🧩 Services

### Frontend (Port 3000)
React 19 SPA with Vite, TypeScript, Tailwind CSS, and shadcn/ui. Features:
- Authentication (Login / Register)
- Dashboard with KPI cards
- Document upload with progress tracking
- AI Chat interface with citation display
- Analytics dashboards
- Admin panel for user management

### Backend API (Port 8000)
FastAPI REST API with JWT authentication. Key endpoints:
- `POST /api/v1/auth/login` — Obtain JWT tokens
- `POST /api/v1/auth/register` — Register new user
- `GET /api/v1/documents/` — List user documents
- `POST /api/v1/documents/upload` — Upload document
- `POST /api/v1/chat/` — Start AI conversation
- `GET /api/v1/analytics/` — Fetch analytics data
- `GET /api/v1/admin/users` — Admin: manage users

### AI Service (Port 8001)
Dedicated LangChain microservice handling:
- Document chunking & embedding
- Vector similarity search via Qdrant
- RAG pipeline (retrieve → augment → generate)
- OCR processing for images/scanned PDFs
- Streaming chat responses

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Admin** | Full platform access, user management, system config |
| **Engineer** | Upload documents, chat, view all analytics |
| **Manager** | Upload documents, chat, view team analytics |
| **Operator** | Chat with documents, limited upload |

---

## 📡 API Documentation

Once running, interactive API docs are available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## 🛠️ Development Guide

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### AI Service Development

```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Make Commands

```bash
make dev          # Start development environment
make prod         # Start production environment
make build        # Build all Docker images
make migrate      # Run database migrations
make seed         # Seed initial data
make test         # Run all tests
make lint         # Run linters
make clean        # Remove containers and volumes
make logs         # Tail service logs
make shell-be     # Shell into backend container
make shell-ai     # Shell into AI service container
```

---

## 🚢 Deployment

### Production Deployment

```bash
# 1. Set environment to production
export APP_ENV=production

# 2. Build production images
make build

# 3. Start production services
make prod

# 4. Run migrations
make migrate
```

### Health Checks

```bash
# Check all services
./scripts/health_check.sh

# Individual checks
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:6333/healthz
```

---

## 🗺️ Roadmap

- [x] Project scaffold & architecture
- [ ] Authentication & RBAC implementation
- [ ] Document ingestion pipeline
- [ ] RAG chat implementation
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Multi-tenant support
- [ ] Webhook integrations
- [ ] Mobile app (React Native)
- [ ] On-premise LLM support (Ollama)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please follow the [Conventional Commits](https://conventionalcommits.org/) specification.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for Industrial Intelligence**

[Documentation](docs/) · [Report Bug](issues/) · [Request Feature](issues/)

</div>
