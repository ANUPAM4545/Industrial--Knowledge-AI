import axios from 'axios'

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

const API_BASE = '/api/v1/documents'

export const viewerService = {
  getViewerInfo: async (id: string): Promise<DocumentViewerInfo> => {
    const resp = await axios.get(`${API_BASE}/${id}/viewer`)
    return resp.data
  },

  getPageContent: async (id: string, page: number): Promise<DocumentPageData> => {
    const resp = await axios.get(`${API_BASE}/${id}/page/${page}`)
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
    const resp = await axios.get(`${API_BASE}/${id}/citation/${citationId}`)
    return resp.data
  },

  searchInsideDocument: async (id: string, query: string): Promise<DocumentSearchMatch[]> => {
    const resp = await axios.get(`${API_BASE}/${id}/search`, { params: { q: query } })
    return resp.data
  }
}
