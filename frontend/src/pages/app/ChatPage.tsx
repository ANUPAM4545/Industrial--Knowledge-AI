import { useState } from 'react'
import { MessageSquare, Send, Plus, Bot, User, FileText, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

const PLACEHOLDER_MESSAGES: Message[] = []

export function ChatPage() {
  const [inputValue, setInputValue] = useState('')
  const [messages, _setMessages] = useState<Message[]>(PLACEHOLDER_MESSAGES)

  const handleSend = () => {
    if (!inputValue.trim()) return
    // TODO: Implement API call to POST /api/v1/chat/conversations/{id}/message
    setInputValue('')
  }

  return (
    <div className="flex h-full">
      {/* ─── Conversation List ──────────────────────────────────── */}
      <div className="w-64 border-r border-white/[0.06] flex flex-col bg-[#0c0f22]">
        <div className="p-4 border-b border-white/[0.06]">
          <button id="new-chat-btn" className="btn-primary w-full text-sm">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-slate-500 text-sm">No conversations yet</p>
            <p className="text-slate-600 text-xs mt-1">Start a new chat to begin</p>
          </div>
        </div>
      </div>

      {/* ─── Chat Interface ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
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
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  msg.role === 'user' ? 'bg-forge-600' : 'bg-white/5 border border-white/10'
                )}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-forge-400" />
                  }
                </div>
                <div className={cn('max-w-[70%] space-y-2', msg.role === 'user' && 'items-end')}>
                  <div className={cn(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-forge-600 text-white rounded-tr-sm'
                      : 'glass-card text-slate-200 rounded-tl-sm'
                  )}>
                    {msg.content}
                  </div>
                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-1">
                      {msg.citations.map((cite, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-forge-600/10 border border-forge-500/20 text-xs">
                          <FileText className="w-3 h-3 text-forge-400 flex-shrink-0" />
                          <span className="text-forge-300">{cite.document_title}</span>
                          {cite.page_number && (
                            <span className="text-slate-500">p.{cite.page_number}</span>
                          )}
                          <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Input ──────────────────────────────────────────── */}
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
                className="input-field resize-none min-h-[42px] max-h-32 py-2.5 pr-4"
                placeholder="Ask anything about your documents..."
                style={{ overflow: 'hidden' }}
              />
            </div>
            <button
              id="chat-send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim()}
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
    </div>
  )
}
