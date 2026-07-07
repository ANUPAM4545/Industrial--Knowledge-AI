# Hybrid Retrieval Architecture (Milestone 5A)

## Overview

ForgeMind AI's retrieval engine combines the high-precision semantic capabilities of **Vector Search** with the exact term matching performance of **BM25 Keyword Search**. The hybrid pipeline merges, deduplicates, and normalizes candidate outputs before passing them to a **Reranking Engine** for high-fidelity cross-encoder ordering.

## High-Level Pipeline Flow

```mermaid
graph TD
    Query[User Query + Chat History] --> QR[QueryRewriter]
    QR --> HR[HybridRetriever]
    HR --> VR[VectorRetriever]
    HR --> KR[KeywordRetriever]
    VR --> VS[(Vector Search + Metadata Filter)]
    KR --> KS[(BM25 Keyword Search + Metadata Filter)]
    VS --> MS[Merge Strategy RRF / Normalized]
    KS --> MS
    MS --> Rerank[Reranker Interface]
    Rerank --> CB[Context Builder]
```

## Detailed Execution Sequence

```mermaid
sequenceDiagram
    participant User
    participant API as Search API
    participant SVC as RetrievalService
    participant QR as QueryRewriter
    participant HR as HybridRetriever
    participant VR as VectorRetriever
    participant KR as KeywordRetriever
    participant MS as MergeStrategy
    participant RR as Reranker
    
    User->>API: POST /search/hybrid
    API->>SVC: search(query, limit, filter_dict, chat_history)
    SVC->>QR: rewrite(query, chat_history)
    QR-->>SVC: rewritten_query
    
    SVC->>HR: retrieve_with_diagnostics(rewritten_query, limit)
    Note over HR: Parallel Invocations
    par Vector Search
        HR->>VR: retrieve(rewritten_query)
        VR-->>HR: List[Chunk]
    and Keyword Search
        HR->>KR: retrieve(rewritten_query)
        KR-->>HR: List[Chunk]
    end
    
    HR->>MS: merge(vector_chunks, keyword_chunks)
    Note over MS: RRF or Min-Max Normalized score blending
    MS-->>HR: List[MergedChunk]
    HR-->>SVC: RetrievalResult
    
    SVC->>RR: rerank(rewritten_query, merged_chunks)
    RR-->>SVC: List[RerankedChunk]
    
    SVC-->>API: RetrievalResult (with metrics diagnostics)
    API-->>User: JSON Response (Chunks + Latency Diagnostics)
```

## Algorithms and Strategies

### 1. Query Formulation (QueryRewriter)
- **Pronoun Resolution**: Resolves relative references (e.g., "it", "this document") using sliding message history.
- **Formulation**: Formulates standalone vector search-friendly questions.

### 2. Reciprocal Rank Fusion (RRF)
RRF blends rankings from vector and keyword search without relying on scale normalization:
$$\text{RRF\_Score}(d \in D) = \sum_{m \in M} \frac{1}{k + \text{rank}_m(d)}$$
Where $k = 60$ is the fusion constant, and $\text{rank}_m(d)$ is the 1-based rank of document $d$ in the output of method $m$.

### 3. Min-Max Weighted Score Normalization
Alternatively, scores can be normalized to the $[0, 1]$ range:
$$\text{Norm\_Score} = \frac{\text{score} - \text{min\_score}}{\text{max\_score} - \text{min\_score}}$$
And combined:
$$\text{Final\_Score} = \alpha \cdot \text{Norm\_Vector\_Score} + (1 - \alpha) \cdot \text{Norm\_Keyword\_Score}$$
Where $\alpha$ determines the vector search weight bias (default is 0.5).

## Future Providers
The architecture is provider-independent:
- **Vector Stores**: Supports extending Qdrant to Pinecone, Milvus, or pgvector.
- **Keyword Search**: Supports swapping BM25 Okapi with Elasticsearch or OpenSearch.
- **Rerankers**: Interfaces support replacing PlaceholderReranker with BAAI/bge-reranker or Cohere Rerank API.
