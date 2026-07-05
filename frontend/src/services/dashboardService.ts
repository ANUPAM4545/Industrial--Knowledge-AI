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

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    if (useUIStore.getState().demoMode) {
      return {
        total_documents: 14,
        indexed_documents: 14,
        pending_documents: 0,
        failed_documents: 0,
        total_chunks: 425,
        total_vectors: 425,
        total_conversations: 8,
        questions_today: 12,
        average_confidence: 94.2,
        average_latency: 245,
        average_retrieval_score: 89.6
      };
    }
    const response = await apiClient.get('/dashboard/overview');
    return response.data;
  },

  async getKnowledge(): Promise<KnowledgeHealth> {
    if (useUIStore.getState().demoMode) {
      const mockDocs: DocumentMetadataHealth[] = [
        {
          document_id: "demo_1",
          title: "Standard Safety SOP.pdf",
          references_count: 42,
          confidence_score: 98.4,
          file_size_bytes: 2048576,
          status: "ready",
          created_at: new Date().toISOString()
        },
        {
          document_id: "demo_2",
          title: "Valve Specs Checklist.docx",
          references_count: 28,
          confidence_score: 95.1,
          file_size_bytes: 512400,
          status: "ready",
          created_at: new Date().toISOString()
        }
      ];
      return {
        most_referenced_documents: mockDocs,
        least_used_documents: [],
        documents_missing_metadata: [],
        low_confidence_documents: [],
        failed_processing_jobs: [],
        largest_documents: mockDocs,
        newest_documents: mockDocs
      };
    }
    const response = await apiClient.get('/dashboard/knowledge');
    return response.data;
  },

  async getSearch(): Promise<SearchAnalytics> {
    if (useUIStore.getState().demoMode) {
      return {
        most_frequent_queries: [
          { query_text: "What are the temperature parameters for emergency backup valves?", frequency: 18 },
          { query_text: "How to troubleshoot backup safety power limits?", frequency: 12 }
        ],
        top_keywords: [
          { keyword: "valve", count: 32 },
          { keyword: "safety", count: 28 },
          { keyword: "sensor", count: 21 }
        ],
        average_query_length: 8.5,
        retrieval_success_rate: 98.2,
        average_similarity: 0.89,
        average_citation_count: 3.2
      };
    }
    const response = await apiClient.get('/dashboard/search');
    return response.data;
  },

  async getSystem(): Promise<SystemHealth> {
    if (useUIStore.getState().demoMode) {
      return {
        embedding_provider: "FastEmbed (bge-small-en-v1.5)",
        llm_provider: "OpenAI (gpt-4o-mini)",
        vector_store: "Qdrant Vector Database",
        retriever: "Hybrid Search (Vector + BM25)",
        evaluation_framework: "ForgeMind Evaluation Suite",
        overall_system_health: "Optimal"
      };
    }
    const response = await apiClient.get('/dashboard/system');
    return response.data;
  },

  async getTrends(): Promise<DashboardTrends> {
    if (useUIStore.getState().demoMode) {
      const dates = ["07-01", "07-02", "07-03", "07-04", "07-05"];
      return {
        daily_uploads: dates.map((d, i) => ({ date: d, value: [1, 2, 0, 3, 2][i] })),
        daily_queries: dates.map((d, i) => ({ date: d, value: [5, 8, 12, 10, 15][i] })),
        confidence_trend: dates.map((d, i) => ({ date: d, value: [92.1, 93.4, 94.2, 94.0, 94.2][i] })),
        latency_trend: dates.map((d, i) => ({ date: d, value: [280, 260, 245, 250, 245][i] })),
        document_growth: dates.map((d, i) => ({ date: d, value: [8, 10, 10, 13, 14][i] })),
        vector_growth: dates.map((d, i) => ({ date: d, value: [210, 280, 280, 390, 425][i] }))
      };
    }
    const response = await apiClient.get('/dashboard/trends');
    return response.data;
  },

  async getInsights(): Promise<SmartInsight[]> {
    if (useUIStore.getState().demoMode) {
      return [
        {
          text: "Hybrid search accuracy increased by 4.2% after optimizing BM25 parameters.",
          type: "success",
          timestamp: new Date().toISOString()
        },
        {
          text: "Document index size is growing. Consider enabling auto-pruning parameters for temp manuals.",
          type: "info",
          timestamp: new Date().toISOString()
        }
      ];
    }
    const response = await apiClient.get('/dashboard/insights');
    return response.data;
  }
};
