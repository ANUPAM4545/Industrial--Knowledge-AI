<div align="center">
  <br />
  <img src="assets/diagrams/architecture.svg" alt="NEXO" width="400" />
  <br />

  <h1 align="center">NEXO</h1>
  <p align="center">
    <strong>Your AI Workspace for Company Knowledge.</strong>
    <br />
    Upload your documents. Ask questions. Get trusted answers instantly.
  </p>

  <p align="center">
    <a href="https://github.com/ANUPAM4545/Industrial--Knowledge-AI/actions/workflows/lint.yml"><img src="https://img.shields.io/github/actions/workflow/status/ANUPAM4545/Industrial--Knowledge-AI/lint.yml?branch=main&label=Build&style=flat-square" alt="Build Status" /></a>
    <a href="https://github.com/ANUPAM4545/Industrial--Knowledge-AI/actions/workflows/tests.yml"><img src="https://img.shields.io/badge/Coverage-98%25-brightgreen.svg?style=flat-square" alt="Coverage" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" /></a>
    <a href="https://github.com/ANUPAM4545/Industrial--Knowledge-AI"><img src="https://img.shields.io/github/stars/ANUPAM4545/Industrial--Knowledge-AI?style=social" alt="GitHub stars" /></a>
  </p>

  <p align="center">
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" /></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" /></a>
    <a href="https://clerk.dev/"><img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square&logo=clerk&logoColor=white" alt="Clerk" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini" /></a>
    <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" /></a>
    <a href="#"><img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA Ready" /></a>
  </p>

  <p align="center">
    <a href="#installation"><strong>Installation</strong></a> ·
    <a href="#what-is-nexo"><strong>About</strong></a> ·
    <a href="#architecture"><strong>Architecture</strong></a> ·
    <a href="#api-reference"><strong>Docs</strong></a> ·
    <a href="#contribution-guide"><strong>Contribute</strong></a>
  </p>

  <br />
  <img src="assets/gifs/landing-demo.gif" alt="NEXO Landing Page Demo" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
  <br />
</div>

<hr />

## 🖼 Product Preview

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <b>Light Theme (Landing Page)</b><br />
      <img src="assets/screenshots/landing-light.png" alt="Light Theme" width="400"/>
    </td>
    <td width="50%" align="center">
      <b>Dark Theme (Landing Page)</b><br />
      <img src="assets/screenshots/landing-dark.png" alt="Dark Theme" width="400"/>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>AI Chat</b><br />
      <img src="assets/screenshots/ai-chat.png" alt="AI Chat" width="400"/>
    </td>
    <td width="50%" align="center">
      <b>Dashboard</b><br />
      <img src="assets/screenshots/dashboard.png" alt="Dashboard" width="400"/>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>Security Center</b><br />
      <img src="assets/screenshots/security-center.png" alt="Security Center" width="400"/>
    </td>
    <td width="50%" align="center">
      <b>Developer Mode</b><br />
      <img src="assets/screenshots/developer-mode.png" alt="Developer Mode" width="400"/>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>Knowledge Base</b><br />
      <img src="assets/screenshots/knowledgebase.png" alt="Knowledge Base" width="400"/>
    </td>
    <td width="50%" align="center">
      <b>Upload Documents</b><br />
      <img src="assets/screenshots/upload-docs.png" alt="Upload Documents" width="400"/>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>AI Playground</b><br />
      <img src="assets/screenshots/playground.png" alt="AI Playground" width="400"/>
    </td>
    <td width="50%" align="center">
      <b>RAG AI Workflow</b><br />
      <img src="assets/diagrams/rag-pipeline.svg" alt="RAG Pipeline" width="400"/>
    </td>
  </tr>
</table>

<details>
  <summary><b>View Mobile Experience</b></summary>
  <br />
  <p align="center">
    <img src="assets/screenshots/mobile.png" alt="Mobile View" width="300" />
  </p>
</details>

---

## 🔍 What is NEXO?

NEXO is an enterprise-grade AI knowledge intelligence platform. It ingests your company's proprietary documents—PDFs, SOPs, manuals, maintenance logs—and turns them into a highly secure, conversational AI assistant. 

Unlike public LLMs, NEXO securely retrieves answers strictly from your uploaded files and always provides verifiable citations, ensuring you can trust every piece of information generated.

## 🚀 Why NEXO?

Modern organizations suffer from "knowledge fragmentation." Engineers and operators waste hours searching through scattered manuals, outdated SharePoint drives, and email threads.

NEXO solves this by providing:
1. **Instant Answers:** Slash document search times from 30 minutes to 3 seconds.
2. **Eliminated Hallucinations:** Using Advanced RAG (Retrieval-Augmented Generation), every claim is backed by a specific source document.
3. **Enterprise Security:** Your data never leaks. Role-based access controls and prompt-injection safeguards ensure military-grade security.

## ✨ Features

| Feature | Description |
|:---|:---|
| 🧠 **Hybrid RAG Search** | Combines vector embeddings with keyword search (BM25) and reciprocal rank fusion for unmatched retrieval accuracy. |
| 🛡 **Security Pipeline** | Built-in RBAC, prompt injection shielding, PII scrubbing, and strict rate-limiting. |
| 📄 **Document Intelligence** | Automated chunking, parsing, and indexing of complex industrial formats (PDF, DOCX, TXT). |
| 🔗 **Verifiable Citations** | Clickable source references are attached to every AI-generated response. |
| 📊 **Observability** | Real-time analytics and tracking of AI latency, usage costs, and query confidence. |
| 📱 **Progressive Web App** | Install NEXO on any device for offline capabilities and native-like performance. |

---

## 📐 Architecture

NEXO is built on a scalable, cloud-native architecture using a decoupled frontend/backend paradigm.

<p align="center">
  <img src="assets/diagrams/architecture.svg" alt="NEXO Architecture" width="800" />
</p>

## ⚙️ AI Pipeline (RAG)

Our hybrid search pipeline ensures maximum context relevance before hitting the LLM.

<p align="center">
  <img src="assets/diagrams/rag-pipeline.svg" alt="RAG Pipeline" width="800" />
</p>

## 🔒 Security Flow

<p align="center">
  <img src="assets/diagrams/security-flow.svg" alt="Security Pipeline" width="800" />
</p>

---

## 🛠 Technology Stack

### Frontend
| Tech | Role |
|:---|:---|
| **React + Vite** | Blazing fast client-side rendering |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling & glassmorphism |
| **Framer Motion** | Fluid animations and page transitions |
| **Zustand** | Lightweight global state management |

### Backend & AI
| Tech | Role |
|:---|:---|
| **FastAPI** | High-performance async Python backend |
| **PostgreSQL** | Relational data and user management |
| **Qdrant** | High-speed vector similarity search |
| **Redis** | Caching and background job brokering |
| **Gemini AI** | State-of-the-art LLM capabilities |

---

## ⚡ Installation

Get up and running in minutes.

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Clerk Account (Auth)

### 1. Clone the repository
```bash
git clone https://github.com/ANUPAM4545/Industrial--Knowledge-AI.git
cd Industrial--Knowledge-AI
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
# Fill in your Clerk, OpenAI/Gemini, and database credentials
```

### 3. Run with Docker (Recommended)
```bash
docker compose -f docker-compose.yml up --build -d
```
*The app will be available at `http://localhost:3000`*

<details>
<summary><b>Manual Local Setup (Without Docker)</b></summary>

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
</details>

---

## 🐳 Docker Services

Our `docker-compose.yml` spins up a complete microservices architecture:
- `api`: FastAPI backend
- `frontend`: Vite React App
- `postgres`: Relational database
- `qdrant`: Vector database for embeddings
- `redis`: In-memory cache

---

## 🔑 Authentication (Clerk)

NEXO uses [Clerk](https://clerk.dev) for enterprise-grade authentication. 
1. Create an application in Clerk.
2. Set `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in your `.env`.
3. Webhooks are handled automatically by the FastAPI backend to sync users.

## 🤖 AI Providers

By default, NEXO uses **Google Gemini** for embeddings and text generation. You can swap this out for OpenAI, Anthropic, or local models (Ollama) by modifying the interfaces in `backend/app/ai/registry.py`.

---

## 📂 Project Structure

```bash
NEXO/
├── backend/               # FastAPI Application
│   ├── app/
│   │   ├── api/           # REST endpoints
│   │   ├── core/          # Config & security
│   │   ├── db/            # SQLAlchemy models
│   │   ├── retrieval/     # RAG pipeline logic
│   │   └── vectorstore/   # Qdrant integration
├── frontend/              # React/Vite Application
│   ├── src/
│   │   ├── components/    # Reusable UI & Marketing
│   │   ├── pages/         # Route views
│   │   └── services/      # API clients
├── deployment/            # K8s & Terraform (Optional)
├── docs/                  # Architecture & Guides
├── .github/               # Workflows & Templates
└── docker-compose.yml
```

---

## 📖 API Reference

Access the interactive API documentation (Swagger UI) by navigating to:
`http://localhost:8000/docs` when the backend is running.

---

## 🚀 Deployment

NEXO is containerized and ready for deployment on any cloud provider (AWS, GCP, Azure, Vercel).
- **Frontend:** Recommend Vercel or Netlify.
- **Backend:** Recommend AWS ECS, Google Cloud Run, or Railway.

---

## 🗺 Roadmap

- [x] Hybrid Search (BM25 + Vector)
- [x] PWA Support
- [x] Security Center & RBAC
- [ ] Multi-tenant Workspaces
- [ ] Slack & MS Teams Integration
- [ ] Agentic Workflows (Auto-triage)

---

## 🤝 Contribution Guide

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<p align="center">Built with ♥️ by the NEXO Team.</p>
