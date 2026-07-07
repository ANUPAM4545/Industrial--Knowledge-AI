import type { IDashboardProvider } from './types'
import type { DashboardOverview, KnowledgeHealth, SearchAnalytics, SystemHealth, DashboardTrends, SmartInsight, DocumentMetadataHealth } from '../dashboardService'

export class DemoDashboardProvider implements IDashboardProvider {
  async getOverview(): Promise<DashboardOverview> {
    return {
      total_documents: 12,
      indexed_documents: 12,
      pending_documents: 0,
      failed_documents: 0,
      total_chunks: 4328,
      total_vectors: 4328,
      total_conversations: 86,
      questions_today: 14,
      average_confidence: 0.968,
      average_latency: 248,
      average_retrieval_score: 96.8
    }
  }

  async getKnowledge(): Promise<KnowledgeHealth> {
    const mockDocs: DocumentMetadataHealth[] = [
      {
        document_id: "demo_doc_1",
        title: "Pump Maintenance Manual.pdf",
        references_count: 54,
        confidence_score: 0.98,
        file_size_bytes: 4200000,
        status: "ready",
        created_at: new Date().toISOString()
      },
      {
        document_id: "demo_doc_2",
        title: "Hydraulic System Guide.pdf",
        references_count: 38,
        confidence_score: 0.95,
        file_size_bytes: 3100000,
        status: "ready",
        created_at: new Date().toISOString()
      },
      {
        document_id: "demo_doc_3",
        title: "Safety Procedures.pdf",
        references_count: 22,
        confidence_score: 0.99,
        file_size_bytes: 1100000,
        status: "ready",
        created_at: new Date().toISOString()
      }
    ]
    return {
      most_referenced_documents: mockDocs,
      least_used_documents: [],
      documents_missing_metadata: [],
      low_confidence_documents: [],
      failed_processing_jobs: [],
      largest_documents: mockDocs,
      newest_documents: mockDocs
    }
  }

  async getSearch(): Promise<SearchAnalytics> {
    return {
      most_frequent_queries: [
        { query_text: "How do I replace the hydraulic pump?", frequency: 24 },
        { query_text: "Summarize inspection procedure.", frequency: 18 },
        { query_text: "Explain valve calibration.", frequency: 14 }
      ],
      top_keywords: [
        { keyword: "pump", count: 145 },
        { keyword: "maintenance", count: 112 },
        { keyword: "safety", count: 98 },
        { keyword: "valve", count: 87 }
      ],
      average_query_length: 7.2,
      retrieval_success_rate: 98.4,
      average_similarity: 0.92,
      average_citation_count: 2.8
    }
  }

  async getSystem(): Promise<SystemHealth> {
    return {
      embedding_provider: "FastEmbed (bge-small-en-v1.5)",
      llm_provider: "OpenAI (gpt-4o-mini)",
      vector_store: "Qdrant Vector Database",
      retriever: "Hybrid Search (Vector + BM25)",
      evaluation_framework: "NEXO Evaluation Suite",
      overall_system_health: "Healthy"
    }
  }

  async getTrends(): Promise<DashboardTrends> {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
    })
    
    return {
      daily_uploads: dates.map((d, i) => ({ date: d, value: [1, 2, 0, 4, 1, 2, 2][i] })),
      daily_queries: dates.map((d, i) => ({ date: d, value: [12, 14, 10, 18, 22, 15, 24][i] })),
      confidence_trend: dates.map((d, i) => ({ date: d, value: [94.5, 95.1, 95.8, 96.2, 96.5, 96.8, 96.8][i] })),
      latency_trend: dates.map((d, i) => ({ date: d, value: [280, 275, 260, 255, 250, 248, 248][i] })),
      document_growth: dates.map((d, i) => ({ date: d, value: [2, 4, 4, 8, 9, 11, 12][i] })),
      vector_growth: dates.map((d, i) => ({ date: d, value: [800, 1500, 1500, 2800, 3200, 3900, 4328][i] }))
    }
  }

  async getInsights(): Promise<SmartInsight[]> {
    return [
      {
        text: "Confidence increased by 8% over the last week.",
        type: "success",
        timestamp: new Date().toISOString()
      },
      {
        text: "Pump Maintenance Manual is the most referenced document.",
        type: "info",
        timestamp: new Date().toISOString()
      },
      {
        text: "Hybrid retrieval improved response quality for technical queries.",
        type: "success",
        timestamp: new Date().toISOString()
      },
      {
        text: "Average latency decreased to 248ms this week.",
        type: "success",
        timestamp: new Date().toISOString()
      }
    ]
  }
}
