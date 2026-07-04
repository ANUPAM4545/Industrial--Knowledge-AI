import apiClient from './apiClient';

export interface PipelineDiagnostics {
  conversation_id?: string;
  query: string;
  embedding_provider: string;
  embedding_model: string;
  llm_provider: string;
  llm_model: string;
  embedding_time_ms: number;
  vector_search_time_ms: number;
  keyword_search_time_ms: number;
  merge_time_ms: number;
  rerank_time_ms: number;
  context_build_time_ms: number;
  prompt_build_time_ms: number;
  generation_time_ms: number;
  total_latency_ms: number;
  retrieved_chunks: number;
  merged_chunks: number;
  reranked_chunks: number;
  top_similarity: number;
  average_similarity: number;
  confidence_score: number;
  hallucination_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  citations_count: number;
  documents_used: number;
  token_estimate: number;
  provider_status: string;
}

export interface AIHealthStatus {
  embedding_status: string;
  vector_store_status: string;
  retriever_status: string;
  llm_status: string;
  evaluation_status: string;
  overall_status: string;
}

export interface SystemRuntimeMetrics {
  average_latency_ms: number;
  p95_latency_ms: number;
  average_confidence: number;
  average_retrieval_score: number;
  average_citations: number;
  queries_today: number;
  documents_indexed: number;
  vectors_stored: number;
}

export const observabilityService = {
  async getAIHealth(): Promise<AIHealthStatus> {
    const response = await apiClient.get('/ai/health');
    return response.data;
  },

  async getAIMetrics(): Promise<any> {
    const response = await apiClient.get('/ai/metrics');
    return response.data;
  },

  async getAIProviders(): Promise<any> {
    const response = await apiClient.get('/ai/providers');
    return response.data;
  },

  async getAIRuntime(): Promise<SystemRuntimeMetrics> {
    const response = await apiClient.get('/ai/runtime');
    return response.data;
  },

  async getPipelineDiagnostics(conversationId: string): Promise<PipelineDiagnostics> {
    const response = await apiClient.get(`/ai/pipeline/${conversationId}`);
    return response.data;
  }
};
