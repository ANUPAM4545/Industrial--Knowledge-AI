import React, { useState, useEffect } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Settings,
  HelpCircle,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { viewerService, DocumentHighlight, DocumentSearchMatch } from '../../services/viewerService'

interface PDFViewerProps {
  documentId: string
  activeCitationId?: string | null
  onClose?: () => void
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  documentId,
  activeCitationId,
  onClose
}) => {
  // Store UI state hooks
  const zoomLevel = useUIStore((state) => state.zoomLevel)
  const setZoomLevel = useUIStore((state) => state.setZoomLevel)
  const lastViewedPages = useUIStore((state) => state.lastViewedPages)
  const setLastViewedPage = useUIStore((state) => state.setLastViewedPage)
  const developerMode = useUIStore((state) => state.developerMode)
  const setDeveloperMode = useUIStore((state) => state.setDeveloperMode)

  // Local state
  const [info, setInfo] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState<number>(lastViewedPages[documentId] || 1)
  const [pageData, setPageData] = useState<any>(null)
  const [rotation, setRotation] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<DocumentSearchMatch[]>([])
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [showOutline, setShowOutline] = useState<boolean>(false)
  const [selectedHighlight, setSelectedHighlight] = useState<DocumentHighlight | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch document metadata
  useEffect(() => {
    const loadInfo = async () => {
      setLoading(true)
      try {
        const metadata = await viewerService.getViewerInfo(documentId)
        setInfo(metadata)
        
        // Resolve citation page if any
        if (activeCitationId) {
          try {
            const citeRes = await viewerService.resolveCitation(documentId, activeCitationId)
            setCurrentPage(citeRes.page_number)
            setLastViewedPage(documentId, citeRes.page_number)
          } catch (e) {
            console.warn('Failed to resolve citation page number', e)
          }
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load document info.')
      } finally {
        setLoading(false)
      }
    }
    loadInfo()
  }, [documentId, activeCitationId])

  // Fetch page content
  useEffect(() => {
    const loadPage = async () => {
      if (!documentId) return
      try {
        const data = await viewerService.getPageContent(documentId, currentPage)
        setPageData(data)
        // Automatically select the active citation highlight if available on this page
        if (activeCitationId && data.highlights.length > 0) {
          const match = data.highlights.find(h => h.chunk_id === activeCitationId)
          if (match) {
            setSelectedHighlight(match)
          }
        }
      } catch (e: any) {
        console.error('Failed to load page text content', e)
      }
    }
    loadPage()
  }, [documentId, currentPage, activeCitationId])

  // Save last page
  const handlePageChange = (pageNum: number) => {
    if (!info) return
    const target = Math.max(1, Math.min(info.total_pages, pageNum))
    setCurrentPage(target)
    setLastViewedPage(documentId, target)
  }

  // Handle in-document search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    try {
      const res = await viewerService.searchInsideDocument(documentId, searchQuery)
      setSearchResults(res)
    } catch (e) {
      console.error('Failed to search inside document', e)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-900 border-l border-slate-800 animate-pulse">
        <FileText className="w-12 h-12 mb-4 text-indigo-500 animate-bounce" />
        <p className="text-sm font-semibold tracking-wide">Loading explainable document view...</p>
      </div>
    )
  }

  if (error || !info) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-900 border-l border-slate-800 p-8">
        <AlertCircle className="w-12 h-12 mb-4 text-rose-500" />
        <p className="text-sm text-center text-rose-400 font-semibold mb-2">{error || 'Document information missing'}</p>
        <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-200 rounded-md hover:bg-slate-700 transition">
          Close Viewer
        </button>
      </div>
    )
  }

  // Helper to render highlights dynamically matching character indices
  const renderHighlightedText = () => {
    if (!pageData) return null
    const text = pageData.text_content
    const highlights = pageData.highlights

    if (!highlights || highlights.length === 0) {
      return <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-300">{text}</pre>
    }

    // Sort highlights by start_offset
    const sorted = [...highlights].sort((a, b) => a.start_offset - b.start_offset)
    const elements: React.ReactNode[] = []
    let lastIdx = 0

    sorted.forEach((h, i) => {
      // Add leading unhighlighted segment
      if (h.start_offset > lastIdx) {
        elements.push(text.slice(lastIdx, h.start_offset))
      }

      // Add highlighted span
      const targetText = text.slice(h.start_offset, h.end_offset) || h.text
      elements.push(
        <mark
          key={i}
          onClick={() => setSelectedHighlight(h)}
          className={`px-1 py-0.5 rounded cursor-pointer transition-all duration-200 border-b ${
            selectedHighlight?.chunk_id === h.chunk_id
              ? 'bg-yellow-500/40 text-yellow-100 border-yellow-400 scale-105 shadow-md shadow-yellow-500/10'
              : 'bg-yellow-500/20 text-yellow-200 border-yellow-600/40 hover:bg-yellow-500/35'
          }`}
        >
          {targetText}
        </mark>
      )
      lastIdx = h.end_offset
    })

    if (lastIdx < text.length) {
      elements.push(text.slice(lastIdx))
    }

    return <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-300">{elements}</pre>
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-l border-slate-800">
      
      {/* 1. Document Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOutline(!showOutline)}
            className={`p-1.5 rounded transition ${showOutline ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
            title="Toggle Outline"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-medium truncate max-w-[200px] text-slate-300">{info.title}</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs text-slate-400">
            Page {currentPage} of {info.total_pages}
          </span>
          <button
            disabled={currentPage >= info.total_pages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* View adjustments */}
        <div className="flex items-center gap-2">
          <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="p-1 rounded hover:bg-slate-800 text-slate-400">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300 w-10 text-center">{zoomLevel}%</span>
          <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="p-1 rounded hover:bg-slate-800 text-slate-400">
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button onClick={() => setRotation((rotation + 90) % 360)} className="p-1.5 rounded hover:bg-slate-800 text-slate-400" title="Rotate Document">
            <RotateCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded transition ${showSearch ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
            title="Search inside"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDeveloperMode(!developerMode)}
            className={`p-1.5 rounded transition ${developerMode ? 'bg-amber-600/20 text-amber-400' : 'hover:bg-slate-800 text-slate-400'}`}
            title="Toggle Developer Explainer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {onClose && (
            <button onClick={onClose} className="ml-2 text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 hover:bg-slate-700">
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main split display: Outline panel | Page Viewer | Citation Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. Document Outline */}
        {showOutline && (
          <div className="w-48 bg-slate-900 border-r border-slate-800 p-2 flex flex-col gap-2 overflow-y-auto">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Thumbnails</h4>
            {Array.from({ length: info.total_pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`py-3 px-2 rounded-md border text-center transition ${
                  currentPage === i + 1
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-950/65 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold mb-1">Page {i + 1}</div>
                <div className="w-full h-8 bg-slate-900 rounded border border-slate-800/60 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-500" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 3. Search Panel */}
        {showSearch && (
          <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Search inside document</h3>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find in page text..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500 text-slate-200"
              />
              <button type="submit" className="px-3 py-1 bg-indigo-600 rounded text-sm hover:bg-indigo-500">
                Go
              </button>
            </form>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500 mb-2">Matches: {searchResults.length}</span>
              {searchResults.map((match, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(match.page_number)}
                  className="p-2 text-left bg-slate-950 border border-slate-800 rounded hover:border-slate-700 transition"
                >
                  <div className="text-xs font-bold text-indigo-400 mb-1">Page {match.page_number}</div>
                  <div className="text-xs text-slate-400 line-clamp-2 italic">{match.snippet}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Page Content Canvas */}
        <div className="flex-1 overflow-auto p-8 flex items-start justify-center bg-slate-950/40">
          <div
            style={{
              transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-in-out'
            }}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-xl relative min-h-[500px]"
          >
            {pageData ? (
              renderHighlightedText()
            ) : (
              <div className="flex justify-center items-center h-48 text-slate-500 text-xs">
                Extracting page contents...
              </div>
            )}
          </div>
        </div>

        {/* 5. Citation Explainability Sidebar */}
        {selectedHighlight && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200">Explainable AI Citation</h3>
              <button
                onClick={() => setSelectedHighlight(null)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              
              {/* Context Block */}
              <div className="bg-slate-950 border border-slate-800/80 rounded p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Source Text Context</span>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{selectedHighlight.text}"
                </p>
              </div>

              {/* Match accuracy */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/80 border border-slate-800/40 rounded p-2 text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Similarity Score</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {Math.round(selectedHighlight.similarity * 100)}%
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/40 rounded p-2 text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Retrieval Confidence</span>
                  <span className="text-sm font-mono font-bold text-indigo-400">
                    {Math.round(selectedHighlight.confidence)}%
                  </span>
                </div>
              </div>

              {/* Explainability logic */}
              <div className="bg-slate-950 border border-slate-800/80 rounded p-3 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Explainability Diagnosis</span>
                
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-300">
                    Retrieved via <strong className="text-indigo-300 uppercase">{selectedHighlight.retrieval_method}</strong> pipeline.
                  </span>
                </div>

                <div className="flex items-start gap-2 mt-1">
                  <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    This document segment was matched with high accuracy vector similarities because it aligns with safety standards and troubleshooting terms in your prompt.
                  </p>
                </div>
              </div>

              {/* Developer stats */}
              {developerMode && (
                <div className="bg-amber-950/15 border border-amber-900/30 rounded p-3 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">Developer Mode Telemetry</span>
                  <div className="text-[11px] font-mono text-amber-400/90 flex flex-col gap-1">
                    <div>Chunk ID: <span className="text-amber-200">{selectedHighlight.chunk_id || 'N/A'}</span></div>
                    <div>Source Page: <span className="text-amber-200">{currentPage}</span></div>
                    <div>Offset Start: <span className="text-amber-200">{selectedHighlight.start_offset}</span></div>
                    <div>Offset End: <span className="text-amber-200">{selectedHighlight.end_offset}</span></div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
