import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, Plus, Bot, User, FileText, ExternalLink, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { chatService, Conversation, Message } from '@/services/chatService'
import { useUIStore } from '@/store/uiStore'
import { useToastStore } from '@/store/toastStore'
import { DocumentViewer } from '@/components/viewer/DocumentViewer'

export function ChatPage() {
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Split-pane layout preferences
  const splitPaneWidth = useUIStore((state) => state.splitPaneWidth)
  const setSplitPaneWidth = useUIStore((state) => state.setSplitPaneWidth)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleCitationClick = (docId: string, citationId?: string | null) => {
    setSelectedDocId(docId)
    setSelectedCitationId(citationId || null)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const pct = (e.clientX / window.innerWidth) * 100
      if (pct > 20 && pct < 80) {
        setSplitPaneWidth(pct)
      }
    }
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId)
    } else {
      setMessages([])
    }
  }, [activeConversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadMessages = async (id: string) => {
    try {
      const data = await chatService.getConversationDetails(id)
      setMessages(data.messages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await chatService.sendMessage(userMessage.content, activeConversationId)
      
      if (!activeConversationId) {
        setActiveConversationId(response.conversation_id)
        loadConversations()
      }

      const aiMessage: Message = {
        id: Date.now().toString() + 1,
        role: 'assistant',
        content: response.answer,
        context_json: { citations: response.citations },
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full select-none overflow-hidden">
      {/* ─── Conversation List ──────────────────────────────────── */}
      <div className="w-64 border-r border-white/[0.06] flex flex-col bg-[#0c0f22] shrink-0">
        <div className="p-4 border-b border-white/[0.06]">
          <button 
            id="new-chat-btn" 
            className="btn-primary w-full text-sm"
            onClick={() => setActiveConversationId(undefined)}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 p-3 overflow-y-auto space-y-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-slate-500 text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate",
                  activeConversationId === conv.id
                    ? "bg-forge-600 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                {conv.title}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main split-pane content panel */}
      <div className="flex-1 flex overflow-hidden relative bg-[#0b0c16]">
        
        {/* Left Side: Chat Screen */}
        <div
          style={{ width: selectedDocId ? `${splitPaneWidth}%` : '100%' }}
          className="flex flex-col h-full overflow-hidden transition-all duration-75 shrink-0"
        >
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-forge-600/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-forge-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">ForgeMind AI Chat</h2>
              <p className="text-slate-400 text-sm max-w-md mb-8">
                Ask questions about your industrial documents. The AI will retrieve relevant information
                and provide answers with exact source citations.
              </p>

              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {[
                  'What are the safety procedures for the hydraulic press?',
                  'Summarize the Q3 maintenance report findings',
                  'What are the torque specifications for engine assembly?',
                  'List all SOPs related to electrical safety',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInputValue(prompt)}
                    className="glass-card text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:glow-border transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={cn('flex gap-3 group', msg.role === 'user' && 'flex-row-reverse')}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    msg.role === 'user' ? 'bg-indigo-600' : 'bg-white/5 border border-white/10'
                  )}>
                    {msg.role === 'user'
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-indigo-400" />
                    }
                  </div>
                  <div className={cn('max-w-[70%] space-y-2', msg.role === 'user' && 'items-end')}>
                    <div className={cn(
                      'px-4 py-3 rounded-2xl text-sm leading-relaxed prose prose-sm prose-invert max-w-none relative',
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                    )}>
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <div>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(msg.content);
                                const { addToast } = useToastStore.getState();
                                addToast('Message copied to clipboard!', 'success');
                              }}
                              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                              title="Copy answer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Citations */}
                    {msg.role === 'assistant' && msg.context_json?.citations && msg.context_json.citations.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sources</p>
                        {msg.context_json.citations.map((cite, i) => (
                          <button
                            key={i}
                            onClick={() => handleCitationClick(cite.document_id || 'mock-id', cite.chunk_id || null)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-xs text-left cursor-pointer hover:bg-indigo-600/20 transition-all duration-150 w-max max-w-full"
                          >
                            <FileText className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                            <span className="text-indigo-300 truncate">{cite.document_name}</span>
                            {cite.page_number && (
                              <span className="text-slate-500 flex-shrink-0">p.{cite.page_number}</span>
                            )}
                            <ExternalLink className="w-3 h-3 text-slate-500 ml-2 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Suggested follow-up queries inside last message bubble */}
                    {msg.role === 'assistant' && idx === messages.length - 1 && (
                      <div className="flex gap-2 flex-wrap mt-3 pt-2">
                        {[
                          'What is the emergency backup valve procedure?',
                          'List warning limit thresholds'
                        ].map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => setInputValue(prompt)}
                            className="text-xs px-2.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-300 hover:border-indigo-500 transition-colors"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input block */}
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  id="chat-input"
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={isLoading}
                  className="input-field resize-none min-h-[42px] max-h-32 py-2.5 pr-4 disabled:opacity-50"
                  placeholder="Ask anything about your documents..."
                  style={{ overflow: 'hidden' }}
                />
              </div>
              <button
                id="chat-send-btn"
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="btn-primary py-2.5 px-4 flex-shrink-0 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2 text-center">
              AI responses include source citations from your knowledge base.
            </p>
          </div>
        </div>

        {/* Resizable Divider */}
        {selectedDocId && (
          <div
            onMouseDown={handleMouseDown}
            className={`w-1 cursor-col-resize hover:bg-indigo-500/80 bg-slate-800 transition-colors self-stretch z-10 ${
              isDragging ? 'bg-indigo-500' : ''
            }`}
          />
        )}

        {/* Right Side: Explainable Document Viewer */}
        {selectedDocId && (
          <div
            style={{ width: `${100 - splitPaneWidth}%` }}
            className="h-full overflow-hidden transition-all duration-75 shrink-0 z-0"
          >
            <DocumentViewer
              initialDocumentId={selectedDocId}
              initialCitationId={selectedCitationId}
              onClose={() => setSelectedDocId(null)}
            />
          </div>
        )}

      </div>
    </div>
  )
}
