/**
 * Document API hooks — TanStack Query wrappers for document endpoints.
 *
 * All hooks use the apiClient (Axios) which automatically attaches
 * the JWT Bearer token and handles 401 refresh.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/services/apiClient'
import type { Document, PaginatedResponse } from '@/types'
import { useUIStore } from '@/store/uiStore'

// ── Query Keys ───────────────────────────────────────────────────────────────

export const documentKeys = {
  all:    ['documents'] as const,
  lists:  () => [...documentKeys.all, 'list'] as const,
  list:   (params: ListParams) => [...documentKeys.lists(), params] as const,
  detail: (id: string) => [...documentKeys.all, 'detail', id] as const,
  status: (id: string) => [...documentKeys.all, 'status', id] as const,
}

// ── Types ────────────────────────────────────────────────────────────────────

interface ListParams {
  page?: number
  page_size?: number
  status_filter?: string
  search?: string
}

interface UploadPayload {
  file: File
  title: string
  description?: string
  category?: string
  tags?: string
  department?: string
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/** Fetch paginated document list. */
export function useDocuments(params: ListParams = {}) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: async (): Promise<PaginatedResponse<Document>> => {
      if (useUIStore.getState().demoMode) {
        return {
          items: [
            {
              id: "demo_1",
              title: "Standard Safety SOP.pdf",
              description: "Emergency checklist for backpressure valve limits",
              original_filename: "Standard_Safety_SOP.pdf",
              file_size: 2048576,
              mime_type: "application/pdf",
              document_type: "sop",
              status: "ready",
              tags: "safety, valves, sop",
              category: "Manuals",
              department: "Engineering",
              is_ocr_processed: true,
              language: "en",
              owner_id: "demo_user",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: "demo_2",
              title: "Valve Specs Checklist.docx",
              description: "Specifications datasheet of backpressure check valve systems",
              original_filename: "Valve_Specs_Checklist.docx",
              file_size: 512400,
              mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              document_type: "manual",
              status: "ready",
              tags: "valves, checklist, specs",
              category: "Datasheets",
              department: "Maintenance",
              is_ocr_processed: true,
              language: "en",
              owner_id: "demo_user",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          total: 2,
          page: 1,
          page_size: 20,
          total_pages: 1
        };
      }
      const { data } = await apiClient.get('/documents/', { params })
      return data
    },
    staleTime: 30_000, // 30 s
  })
}

/** Fetch a single document by ID. */
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: async (): Promise<Document> => {
      if (useUIStore.getState().demoMode && id.startsWith("demo_")) {
        return {
          id,
          title: id === "demo_1" ? "Standard Safety SOP.pdf" : "Valve Specs Checklist.docx",
          description: id === "demo_1" ? "Emergency checklist for backpressure valve limits" : "Specifications datasheet of backpressure check valve systems",
          original_filename: id === "demo_1" ? "Standard_Safety_SOP.pdf" : "Valve_Specs_Checklist.docx",
          file_size: id === "demo_1" ? 2048576 : 512400,
          mime_type: id === "demo_1" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          document_type: id === "demo_1" ? "sop" : "manual",
          status: "ready",
          tags: id === "demo_1" ? "safety, valves, sop" : "valves, checklist, specs",
          category: id === "demo_1" ? "Manuals" : "Datasheets",
          department: id === "demo_1" ? "Engineering" : "Maintenance",
          is_ocr_processed: true,
          language: "en",
          owner_id: "demo_user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      const { data } = await apiClient.get(`/documents/${id}`)
      return data
    },
    enabled: Boolean(id),
  })
}

/** Poll document processing status (every 5 s while not ready/failed). */
export function useDocumentStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: documentKeys.status(id),
    queryFn: async (): Promise<Pick<Document, 'id' | 'status'>> => {
      if (useUIStore.getState().demoMode && id.startsWith("demo_")) {
        return { id, status: "ready" };
      }
      const { data } = await apiClient.get(`/documents/${id}/status`)
      return data
    },
    enabled: Boolean(id) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'ready' || status === 'failed') return false
      return 5_000 // poll every 5 s while processing
    },
  })
}

/**
 * Upload mutation — tracks progress via XMLHttpRequest.
 *
 * Provides a `progress` value (0–100) via the onUploadProgress callback.
 * On success, invalidates the document list so it refreshes automatically.
 */
export function useUploadDocument(onProgress?: (pct: number) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UploadPayload): Promise<Document> => {
      const form = new FormData()
      form.append('file', payload.file)
      form.append('title', payload.title)
      if (payload.description) form.append('description', payload.description)
      if (payload.category)    form.append('category',    payload.category)
      if (payload.tags)        form.append('tags',        payload.tags)
      if (payload.department)  form.append('department',  payload.department)

      const { data } = await apiClient.post('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            onProgress(Math.round((evt.loaded / evt.total) * 100))
          }
        },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
    },
  })
}

/** Delete mutation — removes document and refreshes list. */
export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/documents/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
    },
  })
}

/** Trigger a browser download for a document. */
export async function downloadDocument(id: string, filename: string): Promise<void> {
  const response = await apiClient.get(`/documents/${id}/download`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
