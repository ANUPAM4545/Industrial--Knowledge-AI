/**
 * UploadProgress — animated progress bar for active uploads.
 *
 * Shows percentage, file name, and a status message.
 * Driven by a numeric progress value (0–100).
 */
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface UploadProgressProps {
  filename: string
  progress: number        // 0–100
  status: UploadStatus
  errorMessage?: string
}

const statusConfig: Record<UploadStatus, { label: string; color: string }> = {
  idle:      { label: 'Ready',     color: 'bg-slate-600'  },
  uploading: { label: 'Uploading', color: 'bg-forge-500'  },
  success:   { label: 'Complete',  color: 'bg-green-500'  },
  error:     { label: 'Failed',    color: 'bg-red-500'    },
}

export function UploadProgress({
  filename,
  progress,
  status,
  errorMessage,
}: UploadProgressProps) {
  const cfg = statusConfig[status]
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div
      id="upload-progress"
      className="glass-card p-4 rounded-xl space-y-3 animate-fade-in"
      aria-live="polite"
      aria-label={`Upload progress for ${filename}: ${status}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-forge-400 shrink-0" />}
          {status === 'success'   && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
          {status === 'error'     && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span className="text-sm text-white font-medium truncate">{filename}</span>
        </div>
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full shrink-0',
          status === 'uploading' && 'bg-forge-500/20 text-forge-300',
          status === 'success'   && 'bg-green-500/20 text-green-300',
          status === 'error'     && 'bg-red-500/20 text-red-300',
          status === 'idle'      && 'bg-slate-700 text-slate-400',
        )}>
          {cfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', cfg.color)}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* Bottom row */}
      <div className="flex justify-between text-xs text-slate-500">
        <span>{status === 'error' ? (errorMessage || 'Upload failed') : `${clampedProgress}%`}</span>
        {status === 'uploading' && <span>Please wait…</span>}
        {status === 'success'   && <span>Processing queued ✓</span>}
      </div>
    </div>
  )
}
