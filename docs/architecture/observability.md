# AI Observability and Developer Mode (Milestone 5B)

## Overview
Milestone 5B introduces telemetry dashboards and step-by-step latency tracking for the RAG pipeline. Developer Mode allows real-time visualization of query processing details, retrieval profiles, source verification matching, and system stats.

## Architecture

```mermaid
graph TD
    UserChat[React UI Chat] -->|Toggle Dev Mode| DevPanel[Developer Mode Panel]
    DevPanel --> Timeline[Pipeline Timeline]
    DevPanel --> Breakdown[Retrieval Breakdown]
    DevPanel --> Health[AI Health Dashboard]
    
    DevPanel -->|API Requests| ObsRouter[Observability Router]
    ObsRouter --> Diagnostics[PipelineDiagnosticsManager]
    ObsRouter --> HealthSvc[HealthService]
    ObsRouter --> MetricsSvc[MetricsService]
    ObsRouter --> RuntimeSvc[RuntimeService]
    
    Diagnostics -->|Reads metrics| EvalDB[(InMemoryEvaluationRepository)]
    Diagnostics -->|Reads timings| ProfHistory[(RetrievalProfiler)]
```

## Sequence Execution Flow

```mermaid
sequenceDiagram
    participant UI as Chat Page
    participant Router as Observability Router
    participant Diag as PipelineDiagnosticsManager
    participant EvalDB as InMemoryEvaluationRepository
    participant Prof as RetrievalProfiler
    
    UI->>Router: GET /ai/pipeline/{conversation_id}
    Router->>Diag: compile_diagnostics(conversation_id)
    
    Diag->>EvalDB: get_by_conversation(conversation_id)
    EvalDB-->>Diag: Latest EvaluationResult (relevance stats, confidence, risk)
    
    Diag->>Prof: get_history()
    Prof-->>Diag: Match search profile (embedding, search, merge latency)
    
    Diag-->>Router: Compiled PipelineDiagnostics
    Router-->>UI: 200 OK (Timeline and latency data)
```

## Metrics Definitions

| Metric | Category | Formula / Definition | Source |
| --- | --- | --- | --- |
| **Embedding Latency** | Timing | Duration (ms) taken to compute query vectors. | `RetrievalProfiler` |
| **Vector Search Latency** | Timing | Duration (ms) taken by Qdrant similarity searches. | `RetrievalProfiler` |
| **Keyword Search Latency** | Timing | Duration (ms) taken by BM25 search scans. | `RetrievalProfiler` |
| **Merge Latency** | Timing | Duration (ms) taken to execute RRF (Reciprocal Rank Fusion) ranking. | `RetrievalProfiler` |
| **Rerank Latency** | Timing | Duration (ms) taken by Cross-Encoder re-scores. | `RetrievalProfiler` |
| **Confidence Index** | Quality | Blended score of similarity bounds, citation count, and length. | `EvaluationResult` |
| **Hallucination Risk** | Quality | Classification (LOW/MEDIUM/HIGH) based on reference mismatches. | `EvaluationResult` |
| **Percentile Latency (P95)** | System | 95th percentile latency of active RAG requests. | `MetricsService` |
| **Documents Indexed** | System | Total document count loaded in PostgreSQL database. | `RuntimeService` |
| **Vectors Stored** | System | Total vector chunks saved in Chunk table / Qdrant. | `RuntimeService` |

## Developer Mode Dashboard Overview
When Developer Mode is enabled on the React chat interface, a collapsible dashboard is mounted side-by-side with the chat history. This hub renders:
1. **AI Health Panel**: Real-time heartbeats for embedding APIs, vector store services, LLMs, and evaluation registries.
2. **Pipeline Timeline**: Visual tracking highlighting timings (Query -> Embed -> Search -> Merge -> Rerank -> Prompt -> LLM -> Eval -> Stream).
3. **Retrieval Breakdown**: Interactive chart comparing dense Vector similarities vs BM25 Keyword matches.
4. **Citation Grounding**: Verified document mappings flagging ungrounded claims.
