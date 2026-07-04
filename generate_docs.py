import os

docs_dir = "/Users/anupam45/Industrial-Knowledge-Ai/Industrial--Knowledge-AI/docs"
os.makedirs(docs_dir, exist_ok=True)

files = {
    "01_overview.md": """# Project Overview

**ForgeMind AI** is an AI-Powered Industrial Knowledge Intelligence Platform. It is designed to allow organizations to ingest industrial documents (PDFs, DOCX, SOPs) and query them using state-of-the-art RAG-powered AI chat.

## Current Capabilities
The project is currently in a scaffolded state. 
- **Frontend**: A React 19 Single Page Application (SPA) with Vite, Tailwind CSS, and shadcn/ui.
- **Backend**: A FastAPI application with SQLAlchemy ORM, PostgreSQL integration, and basic endpoints for documents and auth.
- **AI Service**: A dedicated FastAPI microservice for LangChain-powered RAG and Qdrant vector database interactions (largely placeholder at the moment).

## Overall Architecture
The architecture is heavily decoupled into three main layers:
1. **Frontend**: React application served via Nginx.
2. **Backend API**: FastAPI application handling business logic, user auth, and PostgreSQL database interaction.
3. **AI Service**: FastAPI microservice dedicated to embedding, vector search (Qdrant), and OpenAI LLM generation.

## High-level Execution Flow
1. **User Interaction**: Users interact with the React frontend to upload documents or chat.
2. **Backend Routing**: API requests hit the Backend FastAPI service. Document metadata is stored in PostgreSQL.
3. **AI Delegation**: For RAG queries and chunking, the Backend delegates to the AI Service.
4. **Vector Storage**: The AI Service embeds text using BAAI/bge models and stores vectors in Qdrant.
5. **Generation**: AI Service queries the LLM and streams responses back through the Backend to the Frontend.
""",
    "02_folder_structure.md": """# Folder Structure

## Root Directory
- `frontend/`: React 19 + Vite SPA. Contains UI components, pages, routes, hooks, and services.
- `backend/`: FastAPI Python backend. Manages business logic, authentication, and metadata storage (PostgreSQL).
- `ai-service/`: LangChain RAG microservice (FastAPI). Manages embeddings and LLM interactions.
- `deployment/`: Nginx configurations and database initialization scripts.
- `docs/`: Technical documentation (this directory).
- `scripts/`: Utility scripts for seeding data and health checks.
- `docker-compose.yml` & `docker-compose.dev.yml`: Docker orchestration files.
- `Makefile`: Developer commands for building, running, and testing.

## Key Files
- `backend/app/main.py`: Entry point for the primary API.
- `ai-service/app/main.py`: Entry point for the AI microservice.
- `frontend/src/main.tsx`: Entry point for the React application.
- `backend/app/api/v1/documents.py`: Handles file uploads and document retrieval.
- `ai-service/app/api/rag.py`: Contains the structure for RAG querying (currently placeholder).
""",
    "03_execution_flow.md": """# Execution Flow

## Entry Point
The primary entry point for deployment is Docker Compose (`docker-compose up --build`). It spins up the Frontend (Nginx/Vite), Backend API (FastAPI on port 8000), AI Service (FastAPI on port 8001), PostgreSQL, Qdrant, and Redis.

## Step-by-Step Execution (Document Upload)
1. **Client**: Submits a multipart form data request (file + metadata) to `POST /api/v1/documents/upload`.
2. **Backend Router** (`documents.py`): Receives the file and validates it.
3. **Document Service** (`document_service.py`): Interacts with local storage to save the file and saves metadata to PostgreSQL.
4. **Asynchronous Processing**: The status is set to `uploaded` and background jobs (intended to be Celery) will process it into chunks.
5. **AI Service**: Chunks are embedded and stored in Qdrant.

## Start to Publish (Ingestion)
Since this is an industrial knowledge system rather than a content publisher, "publishing" refers to the system making a document available for RAG.
- Upload -> Process (Chunking/Embedding) -> Ready (Queryable).
""",
    "04_agent_architecture.md": """# Agent Architecture

## Current Agents
The repository outlines an architecture for AI agents via LangChain in the `ai-service` directory. Currently, explicit multi-agent workflows are not fully implemented. The primary "agent" is the RAG pipeline.

## Responsibilities
- **RAG Agent (Planned)**: Responsible for retrieving context from Qdrant based on user queries, augmenting the prompt, and generating a response with the LLM.

## Communication
- The Backend API communicates with the AI Service via internal HTTP REST calls.

## Dependencies
- LangChain
- Qdrant (Vector Store)
- OpenAI API (for generation)
- BAAI/bge-large-en-v1.5 (for embeddings)
""",
    "05_prompt_system.md": """# Prompt System

## Current Prompts
The codebase is in its foundational stages. Specific prompt templates (e.g., system prompts for RAG extraction, summarization, or chat) are not yet hardcoded into the `ai-service/app/rag/` or `ai-service/app/chat/` modules.

## Where It's Used (Planned)
- `ai-service/app/api/rag.py`: Will use prompt templates to structure context + conversation history before sending to the LLM.

## Inputs
- User query
- Retrieved chunks (from Qdrant)
- Conversation history

## Outputs
- Natural language response with exact source document and page citations.
""",
    "06_video_pipeline.md": """# Video Pipeline

> **Note:** The requirements specified an analysis of a Video Pipeline (Script generation, Voice generation, Video rendering, Upload pipeline). 

**This component does not exist in the ForgeMind AI repository.**

ForgeMind AI is an Industrial Knowledge Intelligence Platform focused on document ingestion (PDF, DOCX) and RAG (Retrieval-Augmented Generation) chat. It does not generate, render, or upload video content.

Any reference to Remotion, FFmpeg, Whisper, or Edge TTS is not applicable to the current system architecture.
""",
    "07_dashboard.md": """# Dashboard Architecture

## Dashboard Architecture
The dashboard is built within the `frontend` React application using Vite, Tailwind CSS, and shadcn/ui. 

## Data Sources
- **Backend API (`/api/v1/analytics/`)**: Provides aggregate metrics such as usage patterns, knowledge health, and search trends.
- **Document API**: Provides lists of documents and their processing statuses.

## Trigger System
Currently, dashboard updates are UI-driven (e.g., via React Query/Zustand fetching data on mount or polling). Real-time triggers (like WebSockets for processing updates) are not yet explicitly visible in the boilerplate.
""",
    "08_learning_system.md": """# Learning System

> **Note:** The requirements specified an analysis of a Learning System (Analytics loop, Weekly learning, Competitor study, Rule updates).

**This specific structure is not present in the repository.**

The system does include an `analytics` module in both the Backend and AI Service intended for:
- Tracking user queries
- Identifying knowledge gaps
- Monitoring usage metrics

However, automated "Weekly learning", "Competitor study", and "Rule updates" loops are not implemented. The analytics loop relies on human admins reviewing the dashboard to update industrial documents or adjust system configurations.
""",
    "09_external_services.md": """# External Services Integration

## Present in Codebase
- **PostgreSQL (16)**: Primary relational database for user and document metadata.
- **Qdrant**: Vector database for storing text embeddings and enabling semantic search.
- **Redis**: Intended for caching and as a message broker for background tasks (Celery).
- **OpenAI API**: Used for LLM generation (specified in `.env.example`).
- **Docker**: Used heavily for orchestrating the entire stack (`docker-compose.yml`).

## Not Present (Requested in Analysis)
The following services were requested but are **NOT** part of this repository:
- Claude Code
- Postiz
- YouTube API
- Analytics API (External)
- FFmpeg
- Remotion
- Edge TTS
- Whisper
- Windows Task Scheduler
""",
    "10_configuration.md": """# Configuration

## Environment Variables
Environment variables are heavily utilized and structured in `.env.example`. 
Key blocks include:
- `APP_*`: Application environment, debug mode, secret keys.
- `BACKEND_*`: Host and port configurations.
- `POSTGRES_*`: Database credentials.
- `JWT_*`: Token secrets and expiries.
- `QDRANT_*`: Vector DB connection info.
- `OPENAI_*` / `LLM_*`: Model selections and API keys.

## Config Files
- `backend/app/core/config.py`: Uses Pydantic `BaseSettings` to validate and load backend env vars.
- `ai-service/app/core/config.py`: Similar Pydantic settings for the AI microservice.
- `frontend/vite.config.ts`: Vite bundler configuration.
- `docker-compose.yml`: Defines the infrastructure and network for services.
""",
    "11_data_flow.md": """# Data Flow

## Input
- User uploads an industrial document (PDF/DOCX) via the React Frontend.
- The file is sent via HTTP POST to the Backend API.

## Processing
- **Storage**: Backend writes the file to Local Storage (or abstract Storage interface) and creates a PostgreSQL record.
- **Queue**: A background job is triggered.
- **AI Processing**: The AI Service fetches the document, parses it (PyMuPDF/docx), chunks it, and generates embeddings (BAAI/bge).

## Storage
- **Relational**: Metadata (title, author, status) is stored in PostgreSQL.
- **Vector**: Chunks and embeddings are stored in Qdrant.

## Output
- Users query the system via the chat UI.
- The query is embedded, relevant chunks are retrieved from Qdrant, and passed to the LLM.
- The LLM streams a generated response with citations back to the frontend.
""",
    "12_dependency_graph.md": """# Dependency Graph

```mermaid
graph TD
    UI[Frontend - React] --> API[Backend API - FastAPI]
    UI --> Auth[Auth Module]
    
    API --> DB[(PostgreSQL)]
    API --> Storage[Local Storage]
    API --> Celery[Celery Task Queue]
    
    Celery --> Redis[(Redis)]
    
    API --> AI_SVC[AI Service - FastAPI]
    
    AI_SVC --> Qdrant[(Qdrant Vector DB)]
    AI_SVC --> Embed[Embedding Model BAAI]
    AI_SVC --> LLM[OpenAI API]
```
""",
    "13_reusable_components.md": """# Reusable Components

## Can Reuse Directly
- **Frontend UI Library**: The `frontend/src/components/ui/` folder containing shadcn/ui components is highly reusable.
- **Backend Core**: `backend/app/core/config.py`, `security.py`, and `logging.py` are robust templates for any FastAPI project.
- **Docker Setup**: The `docker-compose.yml` defining the PostgreSQL, Qdrant, and Redis stack is plug-and-play.

## Needs Modification
- **Local Storage Service**: `backend/app/services/document_service.py` is currently tied to local disk storage. For production, it needs an S3/Blob storage adapter.
- **AI RAG API**: `ai-service/app/api/rag.py` has a `NotImplementedError` and requires the actual LangChain implementation.

## Should Be Removed
- `scripts/seed.py`: The seed script is currently heavily commented out and acts as a placeholder. It should be rewritten when the auth models are finalized.
""",
    "14_risks.md": """# Risks

## Technical Debt & Unimplemented Features
- **Empty Pipelines**: Major functions like `rag_query` in `ai-service/app/api/rag.py` raise `NotImplementedError`. The system cannot perform its core AI functionality yet.
- **Authentication**: `seed.py` indicates that auth logic is still pending completion.

## Tight Coupling
- **Storage**: Document processing currently assumes a shared volume or local filesystem (`UPLOAD_DIR=/app/uploads`). This couples the backend and AI service to the same physical node unless properly abstracted via cloud storage (S3).

## Hardcoded Paths
- Environment variables exist, but reliance on `/app/uploads` in Docker setups can cause issues if not strictly managed across containers.

## Scalability Concerns
- **OCR & Document Parsing**: Running PyMuPDF and Tesseract locally inside the AI service container is CPU intensive. As concurrent uploads increase, this service will become a bottleneck and should be offloaded to dedicated workers.
""",
    "15_refactoring_recommendations.md": """# Refactoring Recommendations

> **Note:** These are recommendations only. No implementation has been executed.

1. **Implement RAG Logic**: Fulfill the `TODO` items in `ai-service/app/api/rag.py` to establish the LangChain pipeline, as this is the core value proposition of the system.
2. **Abstract Storage Layer**: Modify `Storage` dependencies to easily swap between Local, AWS S3, or Azure Blob Storage to decouple services.
3. **Dedicated Task Workers**: Formalize the Celery worker structure in a separate container, rather than relying strictly on the API backend container for background processing.
4. **Cross-Service Auth**: Ensure secure internal communication between the Backend API and AI Service, perhaps using internal API keys or mTLS, as the AI service is currently completely open (`allow_origins=["*"]`).
5. **Seed Script Realization**: Complete `scripts/seed.py` so new developers can instantly spin up a working environment with an admin user and dummy documents.
"""
}

for filename, content in files.items():
    with open(os.path.join(docs_dir, filename), "w") as f:
        f.write(content)

print(f"Successfully generated {len(files)} markdown files in {docs_dir}")
