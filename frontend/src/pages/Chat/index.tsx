import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, RefreshCw, Trash2, Copy, Search } from 'lucide-react';
import { chatService, Conversation, Message, Citation } from '../../services/chatService';
import DeveloperModeToggle from '../../components/observability/DeveloperModeToggle';
import PipelineTimeline from '../../components/observability/PipelineTimeline';
import RetrievalBreakdown from '../../components/observability/RetrievalBreakdown';
import CitationInspector from '../../components/observability/CitationInspector';
import MetricsDashboard from '../../components/observability/MetricsDashboard';
import { observabilityService, PipelineDiagnostics } from '../../services/observabilityService';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [diagnostics, setDiagnostics] = useState<PipelineDiagnostics | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
      loadDiagnostics(activeConversationId);
    } else {
      setMessages([]);
      setDiagnostics(null);
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      const data = await chatService.getConversationDetails(id);
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadDiagnostics = async (id: string) => {
    try {
      const data = await observabilityService.getPipelineDiagnostics(id);
      setDiagnostics(data);
    } catch (e) {
      setDiagnostics(null);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage.content, activeConversationId);
      
      const nextConversationId = activeConversationId || response.conversation_id;
      if (!activeConversationId) {
        setActiveConversationId(response.conversation_id);
        loadConversations();
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        context_json: { citations: response.citations },
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      if (nextConversationId) {
        setTimeout(() => loadDiagnostics(nextConversationId), 500);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatService.deleteConversation(id);
      if (activeConversationId === id) {
        setActiveConversationId(undefined);
      }
      loadConversations();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r p-4 flex flex-col">
        <button
          onClick={() => setActiveConversationId(undefined)}
          className="bg-indigo-600 text-white rounded-md py-2 px-4 w-full flex items-center justify-center mb-6 hover:bg-indigo-700 transition"
        >
          <span className="font-semibold">+ New Chat</span>
        </button>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Chats</h3>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition ${
                activeConversationId === conv.id ? 'bg-indigo-100 text-indigo-900' : 'hover:bg-gray-200'
              }`}
            >
              <span className="truncate text-sm font-medium pr-2">
                {conv.title || 'New Conversation'}
              </span>
              <button 
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="h-14 border-b px-6 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-700">
            {activeConversationId ? 'Active Chat' : 'New Chat Session'}
          </h2>
          <DeveloperModeToggle isDevMode={isDevMode} onToggle={() => setIsDevMode(!isDevMode)} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Search size={48} className="mb-4 text-indigo-200" />
              <h2 className="text-2xl font-bold text-gray-700">NEXO</h2>
              <p className="mt-2">Ask a question about your uploaded documents.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  
                  {/* Citations */}
                  {msg.role === 'assistant' && msg.context_json?.citations && msg.context_json.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.context_json.citations.map((cit, i) => (
                          <div key={i} className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-600 flex items-center shadow-sm cursor-help" title={cit.text}>
                            <span className="font-medium mr-1">{cit.document_name}</span>
                            {cit.page_number && <span className="opacity-75">p.{cit.page_number}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm border border-gray-200">
                <div className="flex space-x-2 items-center h-5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm disabled:bg-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Side Telemetry dashboard */}
      {isDevMode && (
        <div className="w-96 bg-slate-950 border-l border-slate-800 p-5 overflow-y-auto space-y-6 text-slate-100 flex flex-col h-full shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span>RAG Diagnostic Hub</span>
            </h2>
          </div>
          
          <MetricsDashboard
            activeConversationId={activeConversationId}
            confidenceScore={diagnostics ? diagnostics.confidence_score : 0}
          />
          
          <PipelineTimeline diagnostics={diagnostics} />
          
          <RetrievalBreakdown diagnostics={diagnostics} />
          
          <CitationInspector
            diagnostics={diagnostics}
            citations={messages.length > 0 && messages[messages.length - 1].role === 'assistant' ? messages[messages.length - 1].context_json?.citations || [] : []}
          />
        </div>
      )}
    </div>
  );
}

