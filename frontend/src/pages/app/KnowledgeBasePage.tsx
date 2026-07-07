/**
 * KnowledgeBasePage — document library with search, filter, and view toggle.
 *
 * Fetches documents via useDocuments (TanStack Query).
 * Supports table and card grid views.
 * Handles delete with confirmation and download.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, Search, Grid, List, RefreshCw, SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDocuments, useDeleteDocument, downloadDocument } from '@/hooks/useDocuments'
import { DocumentTable } from '@/components/documents/DocumentTable'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useUIStore } from '@/store/uiStore'

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All',        value: ''           },
  { label: 'Uploaded',   value: 'uploaded'   },
  { label: 'Processing', value: 'processing' },
  { label: 'Ready',      value: 'ready'      },
  { label: 'Failed',     value: 'failed'     },
]

type ViewMode = 'table' | 'grid'

export function KnowledgeBasePage() {
  const navigate = useNavigate()
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]               = useState(1)
  const [view, setView]               = useState<ViewMode>('table')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const { workspaceMode, setWorkspaceMode, setTourState } = useUIStore()

  const { data, isLoading, isError, refetch } = useDocuments({
    page,
    page_size: 20,
    search:        search  || undefined,
    status_filter: statusFilter || undefined,
  })

  const deleteMutation = useDeleteDocument()

  const handleDelete = (id: string) => setDeleteConfirm(id)

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    await deleteMutation.mutateAsync(deleteConfirm)
    setDeleteConfirm(null)
  }

  const handleDownload = async (id: string) => {
    const doc = data?.items.find((d) => d.id === id)
    if (!doc) return
    await downloadDocument(id, doc.original_filename)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div className="p-6 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Knowledge Base</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            {data ? `${data.total} document${data.total !== 1 ? 's' : ''}` : 'Loading…'}
          </p>
        </div>
        <button
          id="upload-new-doc-btn"
          type="button"
          onClick={() => navigate('/app/upload')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            id="kb-search"
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by title or filename…"
            className="input-field pl-9 w-full"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <select
            id="kb-status-filter"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input-field pl-9 pr-8 appearance-none min-w-[160px]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 glass-card p-1 rounded-xl">
          <button
            id="view-table-btn"
            type="button"
            onClick={() => setView('table')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              view === 'table' ? 'bg-forge-500/20 text-forge-400' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)]',
            )}
            aria-label="Table view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            id="view-grid-btn"
            type="button"
            onClick={() => setView('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              view === 'grid' ? 'bg-forge-500/20 text-forge-400' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)]',
            )}
            aria-label="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            id="kb-refresh-btn"
            type="button"
            onClick={() => refetch()}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] transition-colors"
            aria-label="Refresh document list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading && <LoadingState message="Loading documents…" />}

      {isError && (
        <div className="glass-card p-6 rounded-2xl text-center space-y-3">
          <p className="text-red-400">Failed to load documents.</p>
          <button type="button" onClick={() => refetch()} className="btn-secondary text-sm">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          {data.items.length === 0 ? (
            <EmptyState
              title="No documents yet"
              description={
                search || statusFilter
                  ? 'No documents match your current filters.'
                  : 'Upload your first industrial document to get started.'
              }
              action={
                !search && !statusFilter ? (
                  <div className="flex gap-3 justify-center mt-4">
                    {workspaceMode === 'live' && (
                      <button
                        onClick={() => {
                          setWorkspaceMode('demo')
                          setTourState({ isActive: true, currentStep: 0, hasSeenTour: false })
                        }}
                        className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        Explore Demo Workspace
                      </button>
                    )}
                    <button
                      id="empty-upload-btn"
                      type="button"
                      onClick={() => navigate('/app/upload')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </button>
                  </div>
                ) : undefined
              }
            />
          ) : view === 'table' ? (
            <DocumentTable
              documents={data.items}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.items.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="kb-prev-page"
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--text-secondary)]">
                Page {page} of {data.total_pages}
              </span>
              <button
                id="kb-next-page"
                type="button"
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="glass-card rounded-2xl p-6 w-full max-w-sm space-y-4 border border-red-500/20 animate-fade-in">
            <h2 id="delete-dialog-title" className="text-lg font-semibold text-[var(--text-primary)]">
              Delete Document?
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              This will permanently remove the document and its stored file.
              This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                id="delete-cancel-btn"
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                id="delete-confirm-btn"
                type="button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700
                           text-white font-medium text-sm transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
