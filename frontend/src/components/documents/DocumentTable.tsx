/**
 * DocumentTable — tabular view for the knowledge base document list.
 * Sortable columns, status badges, and per-row action buttons.
 */
import { FileText, Trash2, Download, ExternalLink } from 'lucide-react'
import { cn, formatFileSize, formatDate } from '@/lib/utils'
import type { Document, DocumentStatus } from '@/types'

const STATUS_CONFIG: Record<DocumentStatus, { label: string; dot: string }> = {
  uploaded:   { label: 'Uploaded',   dot: 'bg-blue-400'   },
  processing: { label: 'Processing', dot: 'bg-amber-400 animate-pulse' },
  extracting: { label: 'Extracting', dot: 'bg-purple-400 animate-pulse' },
  embedding:  { label: 'Embedding',  dot: 'bg-indigo-400 animate-pulse' },
  ready:      { label: 'Ready',      dot: 'bg-green-400'  },
  failed:     { label: 'Failed',     dot: 'bg-red-400'    },
}

interface DocumentTableProps {
  documents: Document[]
  onDelete: (id: string) => void
  onDownload: (id: string) => void
}

export function DocumentTable({ documents, onDelete, onDownload }: DocumentTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5">
      <table className="w-full text-sm text-left" role="table" aria-label="Document list">
        <thead>
          <tr className="border-b border-white/5 bg-slate-900/50">
            <th className="px-4 py-3 font-medium text-slate-400 w-8" />
            <th className="px-4 py-3 font-medium text-slate-400">Title</th>
            <th className="px-4 py-3 font-medium text-slate-400 hidden sm:table-cell">Type</th>
            <th className="px-4 py-3 font-medium text-slate-400">Status</th>
            <th className="px-4 py-3 font-medium text-slate-400 hidden md:table-cell">Size</th>
            <th className="px-4 py-3 font-medium text-slate-400 hidden lg:table-cell">Uploaded</th>
            <th className="px-4 py-3 font-medium text-slate-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, idx) => {
            const status = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.uploaded
            return (
              <tr
                key={doc.id}
                id={`doc-row-${doc.id}`}
                className={cn(
                  'border-b border-white/5 hover:bg-white/[0.02] transition-colors',
                  idx === documents.length - 1 && 'border-b-0',
                )}
              >
                {/* Icon */}
                <td className="px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-forge-600/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-forge-400" />
                  </div>
                </td>

                {/* Title + filename */}
                <td className="px-4 py-3 max-w-[200px]">
                  <p className="font-medium text-white truncate" title={doc.title}>{doc.title}</p>
                  <p className="text-xs text-slate-500 truncate">{doc.original_filename}</p>
                </td>

                {/* Type */}
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="uppercase text-xs font-mono text-slate-500">
                    {doc.mime_type.split('/').pop()?.replace('vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx')}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.dot)} />
                    <span className="text-xs text-slate-300">{status.label}</span>
                  </div>
                </td>

                {/* Size */}
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                  {formatFileSize(doc.file_size)}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                  {formatDate(doc.created_at)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      id={`tbl-download-${doc.id}`}
                      type="button"
                      onClick={() => onDownload(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      aria-label={`Download ${doc.title}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      id={`tbl-delete-${doc.id}`}
                      type="button"
                      onClick={() => onDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      aria-label={`Delete ${doc.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
