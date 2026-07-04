/**
 * LoadingState — skeleton/spinner while data is being fetched.
 */
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  rows?: number
}

export function LoadingState({ message = 'Loading...', rows = 5 }: LoadingStateProps) {
  return (
    <div className="space-y-3 w-full" aria-busy="true" aria-label={message}>
      {/* Spinner row */}
      <div className="flex items-center gap-3 py-4">
        <Loader2 className="w-5 h-5 animate-spin text-forge-400" />
        <span className="text-sm text-slate-400">{message}</span>
      </div>

      {/* Skeleton rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl bg-slate-800/40 animate-pulse"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  )
}
