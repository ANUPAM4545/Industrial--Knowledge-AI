import { apiClient } from './apiClient'
import { useUIStore } from '../store/uiStore'

export interface DocumentViewerInfo {
  document_id: string
  title: string
  mime_type: string
  total_pages: number
  status: string
  file_size: number
}

export interface DocumentHighlight {
  text: string
  start_offset: number
  end_offset: number
  chunk_id: string | null
  similarity: number
  confidence: number
  retrieval_method: string
}

export interface DocumentPageData {
  page_number: number
  text_content: string
  highlights: DocumentHighlight[]
}

export interface DocumentSearchMatch {
  page_number: number
  snippet: string
  text_match: string
}

const API_BASE = '/documents'

export const viewerService = {
  getViewerInfo: async (id: string): Promise<DocumentViewerInfo> => {
    if (useUIStore.getState().workspaceMode === 'demo' && id.startsWith('demo_')) {
      return {
        document_id: id,
        title: id === 'demo_1' ? "Standard Safety SOP.pdf" : "Valve Specs Checklist.docx",
        mime_type: id === 'demo_1' ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        total_pages: id === 'demo_1' ? 3 : 2,
        status: "ready",
        file_size: id === 'demo_1' ? 2048576 : 512400
      };
    }
    const resp = await apiClient.get(`${API_BASE}/${id}/viewer`)
    return resp.data
  },

  getPageContent: async (id: string, page: number): Promise<DocumentPageData> => {
    if (useUIStore.getState().workspaceMode === 'demo' && id.startsWith('demo_')) {
      if (id === 'demo_1') {
        return {
          page_number: page,
          text_content: page === 1 
            ? "ForgeMind Enterprise safety standards specify that backup pressure check valves must trigger immediate sensor indicators if backup power thresholds fall below emergency limit levels."
            : "Section 2: Regular maintenance operations require physical validation of hydraulic check rings.",
          highlights: page === 1 ? [
            {
              text: "backup pressure check valves",
              start_offset: 43,
              end_offset: 72,
              chunk_id: "demo_chunk_1",
              similarity: 0.94,
              confidence: 95.0,
              retrieval_method: "hybrid"
            }
          ] : []
        };
      } else {
        return {
          page_number: page,
          text_content: page === 1
            ? "Troubleshoot guidelines for valve specs and safety sensors trigger checklist parameters. Standard operations require temperature warnings at 85C."
            : "Section 2: Check backup power limits specifications sheet.",
          highlights: page === 1 ? [
            {
              text: "safety sensors trigger",
              start_offset: 41,
              end_offset: 63,
              chunk_id: "demo_chunk_2",
              similarity: 0.89,
              confidence: 92.5,
              retrieval_method: "vector"
            }
          ] : []
        };
      }
    }
    const resp = await apiClient.get(`${API_BASE}/${id}/page/${page}`)
    return resp.data
  },

  resolveCitation: async (id: string, citationId: string): Promise<{
    page_number: number
    chunk_id: string
    text: string
    similarity: number
    confidence: number
    retrieval_method: string
  }> => {
    if (useUIStore.getState().workspaceMode === 'demo' && id.startsWith('demo_')) {
      return {
        page_number: 1,
        chunk_id: citationId,
        text: citationId === "demo_chunk_1" ? "backup pressure check valves" : "safety sensors trigger",
        similarity: citationId === "demo_chunk_1" ? 0.94 : 0.89,
        confidence: citationId === "demo_chunk_1" ? 95.0 : 92.5,
        retrieval_method: citationId === "demo_chunk_1" ? "hybrid" : "vector"
      };
    }
    const resp = await apiClient.get(`${API_BASE}/${id}/citation/${citationId}`)
    return resp.data
  },

  searchInsideDocument: async (id: string, query: string): Promise<DocumentSearchMatch[]> => {
    if (useUIStore.getState().workspaceMode === 'demo' && id.startsWith('demo_')) {
      const q = query.toLowerCase();
      if (q.includes("valve") || q.includes("safety") || q.includes("sensor")) {
        return [
          {
            page_number: 1,
            snippet: id === 'demo_1' 
              ? "...specify that backup pressure check valves must trigger immediate..." 
              : "...specs and safety sensors trigger checklist parameters...",
            text_match: q.includes("valve") ? "valve" : (q.includes("sensor") ? "sensor" : "safety")
          }
        ];
      }
      return [];
    }
    const resp = await apiClient.get(`${API_BASE}/${id}/search`, { params: { q: query } })
    return resp.data
  }
}
