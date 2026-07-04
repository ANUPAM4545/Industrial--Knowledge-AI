/**
 * EmptyState — displayed when a list has no items.
 * Accepts an icon, title, description, and optional CTA button.
 */
import type { ReactNode } from 'react'
import { FileX2 } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon = <FileX2 className="w-10 h-10 text-slate-600" />,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
      <div className="w-20 h-20 rounded-2xl bg-slate-800/60 flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-300">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
