/**
 * DocumentCard — grid card view for a single document.
 * Shows file type icon, title, status badge, size, and action buttons.
 */
import { FileText, Trash2, Download, MoreVertical } from 'lucide-react'
import { cn, formatFileSize, formatDate } from '@/lib/utils'
import type { Document, DocumentStatus } from '@/types'

// ── Status badge config ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DocumentStatus, { label: string; classes: string }> = {
  uploaded:   { label: 'Uploaded',   classes: 'bg-blue-500/15 text-blue-300 border-blue-500/20'   },
  processing: { label: 'Processing', classes: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
  extracting: { label: 'Extracting', classes: 'bg-purple-500/15 text-purple-300 border-purple-500/20' },
  embedding:  { label: 'Embedding',  classes: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20' },
  ready:      { label: 'Ready',      classes: 'bg-green-500/15 text-green-300 border-green-500/20'   },
  failed:     { label: 'Failed',     classes: 'bg-red-500/15 text-red-300 border-red-500/20'         },
}

interface DocumentCardProps {
  document: Document
  onDelete: (id: string) => void
  onDownload: (id: string) => void
}

export function DocumentCard({ document, onDelete, onDownload }: DocumentCardProps) {
  const status = STATUS_CONFIG[document.status] ?? STATUS_CONFIG.uploaded

  return (
    <div
      id={`doc-card-${document.id}`}
      className="glass-card p-5 rounded-2xl flex flex-col gap-4 hover:border-white/10 transition-all duration-200 group"
    >
      {/* Top: icon + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-forge-600/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-forge-400" />
        </div>
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full border',
          status.classes,
        )}>
          {status.label}
        </span>
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm leading-tight truncate" title={document.title}>
          {document.title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{document.original_filename}</p>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{formatFileSize(document.file_size)}</span>
        <span>{formatDate(document.created_at)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-white/5">
        <button
          id={`doc-download-${document.id}`}
          type="button"
          onClick={() => onDownload(document.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                     text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label={`Download ${document.title}`}
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
        <button
          id={`doc-delete-${document.id}`}
          type="button"
          onClick={() => onDelete(document.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                     text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          aria-label={`Delete ${document.title}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}
