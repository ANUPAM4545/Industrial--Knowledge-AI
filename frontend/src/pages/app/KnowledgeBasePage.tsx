import { FileText, Search, Filter, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your industrial documents</p>
        </div>
        <Link to="/app/upload" className="btn-primary">
          <Plus className="w-4 h-4" />
          Upload Document
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            id="kb-search"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button className="btn-secondary gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Empty State */}
      <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-forge-600/10 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-forge-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">No documents yet</h2>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          Start building your knowledge base by uploading industrial documents,
          SOPs, manuals, or maintenance logs.
        </p>
        <Link to="/app/upload" className="btn-primary">
          <Plus className="w-4 h-4" />
          Upload Your First Document
        </Link>
      </div>
    </div>
  )
}
