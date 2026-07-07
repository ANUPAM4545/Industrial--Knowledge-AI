import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, X, FileText, Database, MessageSquare, Sparkles, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePWA } from '@/hooks/usePWA'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { canInstall, promptInstall } = usePWA()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // If we want to open from global state, this needs to be handled via store,
          // but for now, we assume AppLayout controls it or it manages itself in a portal.
        }
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isOpen, onClose])

  const handleSelect = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-glass-lg pointer-events-auto overflow-hidden liquid-glass"
            >
              <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)]">
                <Search className="w-5 h-5 text-[var(--text-secondary)] mr-3" />
                <input
                  autoFocus
                  type="text"
                  className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] text-base"
                  placeholder="Ask ForgeMind AI or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-secondary)] font-mono">
                  <Command className="w-3 h-3" /> K
                </div>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {query.length > 0 ? (
                  <div className="p-4 text-center">
                    <Sparkles className="w-6 h-6 text-forge-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-[var(--text-primary)] font-medium">Ask AI: "{query}"</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Press Enter to start chat</p>
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Quick Actions
                    </div>
                    <button
                      onClick={() => handleSelect('/app/chat')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors text-left text-[var(--text-primary)]"
                    >
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">New Conversation</span>
                        <span className="text-xs text-[var(--text-secondary)]">Start a new AI chat</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSelect('/app/upload')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors text-left text-[var(--text-primary)] mt-1"
                    >
                      <FileText className="w-4 h-4 text-forge-400" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Upload Document</span>
                        <span className="text-xs text-[var(--text-secondary)]">Index a new PDF or DOCX</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSelect('/app/knowledge-base')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors text-left text-[var(--text-primary)] mt-1"
                    >
                      <Database className="w-4 h-4 text-purple-400" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Knowledge Base</span>
                        <span className="text-xs text-[var(--text-secondary)]">Manage indexed vectors</span>
                      </div>
                    </button>
                    {canInstall && (
                      <button
                        onClick={() => {
                          promptInstall()
                          onClose()
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors text-left text-[var(--text-primary)] mt-1 border-t border-[var(--border-subtle)] pt-3"
                      >
                        <Download className="w-4 h-4 text-forge-400" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Install ForgeMind AI</span>
                          <span className="text-xs text-[var(--text-secondary)]">Install this app natively on your device</span>
                        </div>
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
