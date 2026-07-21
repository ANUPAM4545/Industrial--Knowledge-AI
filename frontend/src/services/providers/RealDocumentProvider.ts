import apiClient from '../apiClient'
import type { IDocumentProvider } from './types'
import type { Document, PaginatedResponse } from '@/types'

export class RealDocumentProvider implements IDocumentProvider {
  async getDocuments(params: { page?: number, page_size?: number, status_filter?: string, search?: string }): Promise<PaginatedResponse<Document>> {
    const { data } = await apiClient.get('/documents/', { params })
    return data
  }

  async getDocument(id: string): Promise<Document> {
    const { data } = await apiClient.get(`/documents/${id}`)
    return data
  }

  async getDocumentStatus(id: string): Promise<Pick<Document, 'id' | 'status'>> {
    const { data } = await apiClient.get(`/documents/${id}/status`)
    return data
  }

  async uploadDocument(payload: FormData, onProgress?: (pct: number) => void): Promise<Document> {
    const { data } = await apiClient.post('/documents/upload', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0, // Disable timeout for large file uploads
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded / evt.total) * 100))
        }
      }
    })
    return data
  }

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`)
  }

  async downloadDocument(id: string): Promise<Blob> {
    const { data } = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob'
    })
    return data
  }
}
