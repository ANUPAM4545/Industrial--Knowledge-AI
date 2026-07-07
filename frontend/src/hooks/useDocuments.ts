/**
 * Document API hooks — TanStack Query wrappers for document endpoints.
 *
 * All hooks use the apiClient (Axios) which automatically attaches
 * the JWT Bearer token and handles 401 refresh.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ProviderFactory } from '@/services/providers/ProviderFactory'
import type { Document, PaginatedResponse } from '@/types'

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
      return ProviderFactory.getDocumentProvider().getDocuments(params)
    },
    staleTime: 30_000, // 30 s
  })
}

/** Fetch a single document by ID. */
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: async (): Promise<Document> => {
      return ProviderFactory.getDocumentProvider().getDocument(id)
    },
    enabled: Boolean(id),
  })
}

/** Poll document processing status (every 5 s while not ready/failed). */
export function useDocumentStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: documentKeys.status(id),
    queryFn: async (): Promise<Pick<Document, 'id' | 'status'>> => {
      return ProviderFactory.getDocumentProvider().getDocumentStatus(id)
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

      const data = await ProviderFactory.getDocumentProvider().uploadDocument(form, onProgress)
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
      await ProviderFactory.getDocumentProvider().deleteDocument(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
    },
  })
}

/** Trigger a browser download for a document. */
export async function downloadDocument(id: string, filename: string): Promise<void> {
  const blob = await ProviderFactory.getDocumentProvider().downloadDocument(id)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
