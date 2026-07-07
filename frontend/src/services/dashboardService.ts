import apiClient from './apiClient';
import { useUIStore } from '../store/uiStore';

export interface DashboardOverview {
  total_documents: number;
  indexed_documents: number;
  pending_documents: number;
  failed_documents: number;
  total_chunks: number;
  total_vectors: number;
  total_conversations: number;
  questions_today: number;
  average_confidence: number;
  average_latency: number;
  average_retrieval_score: number;
}

export interface DocumentMetadataHealth {
  document_id: string;
  title: string;
  references_count: number;
  confidence_score: number;
  file_size_bytes: number;
  status: string;
  created_at: string;
}

export interface KnowledgeHealth {
  most_referenced_documents: DocumentMetadataHealth[];
  least_used_documents: DocumentMetadataHealth[];
  documents_missing_metadata: DocumentMetadataHealth[];
  low_confidence_documents: DocumentMetadataHealth[];
  failed_processing_jobs: DocumentMetadataHealth[];
  largest_documents: DocumentMetadataHealth[];
  newest_documents: DocumentMetadataHealth[];
}

export interface QueryMetric {
  query_text: string;
  frequency: number;
}

export interface KeywordMetric {
  keyword: string;
  count: number;
}

export interface SearchAnalytics {
  most_frequent_queries: QueryMetric[];
  top_keywords: KeywordMetric[];
  average_query_length: number;
  retrieval_success_rate: number;
  average_similarity: number;
  average_citation_count: number;
}

export interface SystemHealth {
  embedding_provider: string;
  llm_provider: string;
  vector_store: string;
  retriever: string;
  evaluation_framework: string;
  overall_system_health: string;
}

export interface TrendDatapoint {
  date: string;
  value: number;
}

export interface DashboardTrends {
  daily_uploads: TrendDatapoint[];
  daily_queries: TrendDatapoint[];
  confidence_trend: TrendDatapoint[];
  latency_trend: TrendDatapoint[];
  document_growth: TrendDatapoint[];
  vector_growth: TrendDatapoint[];
}

export interface SmartInsight {
  text: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
}

import { ProviderFactory } from './providers/ProviderFactory';

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    return ProviderFactory.getDashboardProvider().getOverview();
  },

  async getKnowledge(): Promise<KnowledgeHealth> {
    return ProviderFactory.getDashboardProvider().getKnowledge();
  },

  async getSearch(): Promise<SearchAnalytics> {
    return ProviderFactory.getDashboardProvider().getSearch();
  },

  async getSystem(): Promise<SystemHealth> {
    return ProviderFactory.getDashboardProvider().getSystem();
  },

  async getTrends(): Promise<DashboardTrends> {
    return ProviderFactory.getDashboardProvider().getTrends();
  },

  async getInsights(): Promise<SmartInsight[]> {
    return ProviderFactory.getDashboardProvider().getInsights();
  }
};
