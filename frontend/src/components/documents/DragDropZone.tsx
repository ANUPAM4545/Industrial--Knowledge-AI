/**
 * DragDropZone — file drag-and-drop area.
 *
 * Handles drag events, click-to-browse, and file-change callbacks.
 * Does NOT own the file state — parent controls it via onFileSelect.
 */
import { useCallback, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'

const ACCEPTED_MIME = ['application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ACCEPTED_EXT = '.pdf,.docx'
const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

interface DragDropZoneProps {
  file: File | null
  onFileSelect: (file: File) => void
  onFileClear: () => void
  /** Optional error message to display below the zone */
  error?: string
}

export function DragDropZone({ file, onFileSelect, onFileClear, error }: DragDropZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const validate = (f: File): string | null => {
    if (!ACCEPTED_MIME.includes(f.type) && !f.name.match(/\.(pdf|docx)$/i)) {
      return 'Only PDF and DOCX files are accepted.'
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `File is too large (${formatFileSize(f.size)}). Maximum is 50 MB.`
    }
    return null
  }

  const handleFile = useCallback(
    (f: File) => {
      const err = validate(f)
      if (err) { setLocalError(err); return }
      setLocalError(null)
      onFileSelect(f)
    },
    [onFileSelect],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const f = e.dataTransfer.files[0]
      if (f) handleFile(f)
    },
    [handleFile],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    e.target.value = '' // allow re-selecting the same file
  }

  const displayError = error || localError

  return (
    <div className="space-y-2">
      <div
        id="upload-dropzone"
        role="button"
        tabIndex={0}
        aria-label="Upload document — drag and drop or click to browse"
        className={cn(
          'glass-card border-2 border-dashed p-12 flex flex-col items-center',
          'justify-center cursor-pointer transition-all duration-200 rounded-2xl',
          'focus:outline-none focus:ring-2 focus:ring-forge-500/50',
          dragOver && 'border-forge-500/70 bg-forge-600/10 scale-[1.01]',
          !dragOver && !file && 'border-white/10 hover:border-forge-500/40 hover:bg-forge-600/5',
          file && 'border-green-500/40 bg-green-600/5',
          displayError && 'border-red-500/40',
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('dz-file-input')?.click()}
        onKeyDown={(e) => e.key === 'Enter' && document.getElementById('dz-file-input')?.click()}
      >
        <input
          id="dz-file-input"
          type="file"
          accept={ACCEPTED_EXT}
          className="hidden"
          onChange={handleInputChange}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-green-400/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-green-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white truncate max-w-xs">{file.name}</p>
              <p className="text-sm text-slate-400 mt-0.5">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              id="dz-clear-btn"
              onClick={(e) => { e.stopPropagation(); onFileClear(); setLocalError(null) }}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors mt-1"
            >
              <X className="w-3 h-3" /> Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
              dragOver ? 'bg-forge-500/20' : 'bg-forge-600/10',
            )}>
              <Upload className={cn('w-7 h-7 transition-colors', dragOver ? 'text-forge-300' : 'text-forge-400')} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">
                {dragOver ? 'Drop it here!' : 'Drop your document here'}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">or click to browse</p>
            </div>
            <p className="text-xs text-slate-600 mt-1">PDF, DOCX · Max 50 MB</p>
          </div>
        )}
      </div>

      {displayError && (
        <p className="text-xs text-red-400 flex items-center gap-1.5 px-1">
          <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
          {displayError}
        </p>
      )}
    </div>
  )
}
