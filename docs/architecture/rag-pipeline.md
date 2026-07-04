# RAG Pipeline Architecture (Milestone 4A)

## Overview

The Retrieval-Augmented Generation (RAG) orchestration layer manages the flow of user queries through document retrieval and AI text generation, culminating in a response formatted with citations. It implements the "Chat" capabilities of ForgeMind AI.

## Flow of Data

```mermaid
sequenceDiagram
    participant User
    participant API as Chat API
    participant Service as ChatService
    participant Memory as ConversationMemory
    participant QueryProc as QueryProcessor
    participant Retriever as RAGRetriever
    participant Context as ContextBuilder
    participant Prompt as PromptBuilder
    participant LLM as LLMProvider
    participant Citations as CitationBuilder
    participant DB as ChatRepository

    User->>API: POST /chat (query)
    API->>Service: process_chat(query)
    Service->>DB: create or get Conversation
    Service->>Memory: format_history(messages)
    Service->>QueryProc: process(query, history)
    QueryProc-->>Service: normalized_query
    
    Service->>Retriever: retrieve(normalized_query)
    Retriever-->>Service: top_k_chunks
    
    Service->>Context: build(chunks)
    Context-->>Service: context_string
    
    Service->>Citations: build(chunks)
    Citations-->>Service: List[Citation]
    
    Service->>Prompt: build_system_prompt(context_string)
    Service->>Prompt: build_user_prompt(normalized_query)
    
    Service->>LLM: generate(user_prompt, system_prompt)
    LLM-->>Service: answer_string
    
    Service->>DB: save User Message
    Service->>DB: save AI Message (with citations)
    
    Service-->>API: ChatResponse
    API-->>User: JSON Response
```

## LLM Providers
Supported Providers via `LLMProvider` interface in `app/ai/interfaces.py`:
- `OpenAIProvider`: Calls OpenAI models.
- `GeminiProvider`: Calls Google Gemini models.
- `OllamaProvider`: Placeholder for future local LLMs.
Providers are centrally managed and instantiated by the `AIRegistry` singleton based on the `.env` configuration (`LLM_PROVIDER`).

## Streaming
Responses can optionally be streamed via Server-Sent Events (SSE) using the `/chat/stream` endpoint, mapping closely to the standard logic flow but returning an `AsyncGenerator` instead.
