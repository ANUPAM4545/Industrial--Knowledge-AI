# Embedding Pipeline Architecture (Milestone 3C)

## Overview

The Vector Embedding Pipeline takes semantic chunks of documents and converts them into dense vectors for similarity search. It uses a decoupled architecture adhering to the Dependency Inversion Principle, where the Core business logic (`EmbeddingService` and `SimilaritySearchService`) relies purely on abstract interfaces.

## Interfaces

```mermaid
classDiagram
    class EmbeddingProvider {
        <<interface>>
        +embed_text(text: str) List~float~
        +embed_batch(texts: List~str~) List~List~float~~
        +dimension() int
        +model_name() str
    }

    class VectorStore {
        <<interface>>
        +create_collection(name, dim)
        +upsert(name, ids, vectors, payloads)
        +search(name, query_vector, limit, filter) List
    }
    
    class FastEmbedProvider {
        -model: TextEmbedding
    }
    
    class QdrantVectorStore {
        -client: AsyncQdrantClient
    }
    
    EmbeddingProvider <|-- FastEmbedProvider
    VectorStore <|-- QdrantVectorStore
```

## AI Component Registry

All AI components (Providers, Stores, Retrievers) are registered in a centralized singleton `AIRegistry` (`app.ai.registry.registry`). 
The registry reads configuration from `.env` (via `Settings`) to instantiate and resolve the requested providers.

## Execution Flow

```mermaid
sequenceDiagram
    participant API as API Route
    participant Service as EmbeddingService
    participant Registry as AIRegistry
    participant DB as Postgres
    participant Provider as FastEmbedProvider
    participant VStore as QdrantVectorStore

    API->>Service: index_document(document_id)
    Service->>DB: Update Status (INDEXING)
    Service->>DB: Fetch Chunks
    DB-->>Service: List[Chunk]
    Service->>Registry: get_embedding_provider()
    Registry-->>Service: FastEmbedProvider
    Service->>Registry: get_vector_store()
    Registry-->>Service: QdrantVectorStore
    
    Service->>Provider: embed_batch(texts)
    Provider-->>Service: List[Vector]
    
    Service->>VStore: create_collection(documents, 384)
    Service->>VStore: upsert(documents, ids, vectors, metadata)
    
    Service->>DB: Update Document (COMPLETED)
    Service-->>API: Status Success
```

## Future Expansion
Due to the interface-driven design, supporting `OpenAI` or `Pinecone` simply involves adding a new class that implements the base interface, then adding a configuration switch in `AIRegistry`. No changes to `EmbeddingService` are required.
