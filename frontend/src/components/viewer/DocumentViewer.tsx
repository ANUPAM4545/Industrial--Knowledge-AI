import React, { useState, useEffect } from 'react'
import { X, FileText } from 'lucide-react'
import { PDFViewer } from './PDFViewer'
import { viewerService } from '../../services/viewerService'

export interface DocumentTab {
  documentId: string
  title: string
  activeCitationId?: string | null
}

interface DocumentViewerProps {
  initialDocumentId: string
  initialCitationId?: string | null
  onClose?: () => void
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  initialDocumentId,
  initialCitationId,
  onClose
}) => {
  const [tabs, setTabs] = useState<DocumentTab[]>([])
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0)

  // Append new document tab if it is not already open
  useEffect(() => {
    const addTab = async () => {
      const exists = tabs.findIndex(t => t.documentId === initialDocumentId)
      if (exists !== -1) {
        // Tab exists, switch to it and update active citation
        setActiveTabIdx(exists)
        if (initialCitationId) {
          const updated = [...tabs]
          updated[exists].activeCitationId = initialCitationId
          setTabs(updated)
        }
        return
      }

      // Fetch title to show in tab header
      let title = 'Document'
      try {
        const metadata = await viewerService.getViewerInfo(initialDocumentId)
        title = metadata.title
      } catch (e) {
        console.warn('Failed to load viewer title for tabs', e)
      }

      const newTab: DocumentTab = {
        documentId: initialDocumentId,
        title,
        activeCitationId: initialCitationId
      }
      setTabs(prev => [...prev, newTab])
      setActiveTabIdx(tabs.length)
    }

    if (initialDocumentId) {
      addTab()
    }
  }, [initialDocumentId, initialCitationId])

  const closeTab = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const filtered = tabs.filter((_, i) => i !== idx)
    setTabs(filtered)

    if (filtered.length === 0) {
      if (onClose) onClose()
      return
    }

    // Shift active index if needed
    if (activeTabIdx >= filtered.length) {
      setActiveTabIdx(filtered.length - 1)
    }
  }

  if (tabs.length === 0) return null

  const activeTab = tabs[activeTabIdx]

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      
      {/* Tab Headers */}
      <div className="flex items-center bg-slate-950 px-2 py-1 gap-1 border-b border-slate-800 overflow-x-auto select-none scrollbar-thin">
        {tabs.map((tab, idx) => (
          <div
            key={tab.documentId}
            onClick={() => setActiveTabIdx(idx)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-t-md border-t-2 cursor-pointer transition shrink-0 ${
              activeTabIdx === idx
                ? 'bg-slate-900 border-indigo-500 text-slate-100'
                : 'bg-slate-950/40 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="max-w-[120px] truncate">{tab.title}</span>
            <button
              onClick={(e) => closeTab(idx, e)}
              className="p-0.5 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Active Tab Panel */}
      <div className="flex-1 overflow-hidden">
        {activeTab && (
          <PDFViewer
            key={activeTab.documentId}
            documentId={activeTab.documentId}
            activeCitationId={activeTab.activeCitationId}
            onClose={onClose}
          />
        )}
      </div>

    </div>
  )
}
