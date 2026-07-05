import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Search, MessageSquare, TrendingUp,
  CheckCircle2, Clock, ArrowUpRight, Cpu, Database,
  Sparkles, ShieldAlert, RefreshCw, Plus, Zap
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell
} from 'recharts'
import { cn } from '@/lib/utils'
import {
  dashboardService,
  DashboardOverview,
  KnowledgeHealth,
  SearchAnalytics,
  SystemHealth,
  DashboardTrends,
  SmartInsight
} from '@/services/dashboardService'

export function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [knowledge, setKnowledge] = useState<KnowledgeHealth | null>(null)
  const [search, setSearch] = useState<SearchAnalytics | null>(null)
  const [system, setSystem] = useState<SystemHealth | null>(null)
  const [trends, setTrends] = useState<DashboardTrends | null>(null)
  const [insights, setInsights] = useState<SmartInsight[]>([])

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [overRes, knowRes, searchRes, sysRes, trendRes, insRes] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getKnowledge(),
        dashboardService.getSearch(),
        dashboardService.getSystem(),
        dashboardService.getTrends(),
        dashboardService.getInsights()
      ])

      setOverview(overRes)
      setKnowledge(knowRes)
      setSearch(searchRes)
      setSystem(sysRes)
      setTrends(trendRes)
      setInsights(insRes)
    } catch (err) {
      console.error('Failed to load dashboard statistics', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse bg-[#0a0d1a] min-h-screen text-slate-400">
        <div className="h-8 w-48 bg-white/5 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
          <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
        </div>
      </div>
    )
  }

  // Calculate health progress
  const healthyCount = overview?.indexed_documents ?? 0
  const totalCount = overview?.total_documents ?? 0
  const healthPercent = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 100

  return (
    <div className="p-8 space-y-8 bg-[#0a0d1a] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Knowledge Dashboard
            {refreshing && <RefreshCw className="w-4 h-4 animate-spin text-forge-400" />}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            ForgeMind Executive Analytics & System Observability
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            Refresh Stats
          </button>
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border',
            system?.overall_system_health === 'Healthy'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          )}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {system?.overall_system_health === 'Healthy' ? 'All Systems Operational' : 'Degraded Mode'}
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="stat-card bg-[#0f1327] border border-white/[0.04] p-5 rounded-xl relative overflow-hidden group hover:border-forge-500/25 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-forge-400/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-forge-400" />
            </div>
            <span className="text-xs text-slate-500">{overview?.pending_documents} pending</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{overview?.total_documents}</p>
          <p className="text-sm text-slate-400">Total Documents</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-forge-600 to-forge-400" />
        </div>

        {/* Total Vectors */}
        <div className="stat-card bg-[#0f1327] border border-white/[0.04] p-5 rounded-xl relative overflow-hidden group hover:border-purple-500/25 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs text-slate-500">{overview?.total_chunks} chunks</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {overview?.total_vectors ? overview.total_vectors.toLocaleString() : '0'}
          </p>
          <p className="text-sm text-slate-400">Total Vectors</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400" />
        </div>

        {/* RAG Queries */}
        <div className="stat-card bg-[#0f1327] border border-white/[0.04] p-5 rounded-xl relative overflow-hidden group hover:border-green-500/25 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xs text-green-400">+{overview?.questions_today} today</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{overview?.total_conversations}</p>
          <p className="text-sm text-slate-400">RAG Conversations</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 to-green-400" />
        </div>

        {/* Avg Confidence */}
        <div className="stat-card bg-[#0f1327] border border-white/[0.04] p-5 rounded-xl relative overflow-hidden group hover:border-amber-500/25 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-xs text-slate-500">{overview?.average_latency}ms avg latency</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {overview?.average_confidence ? `${Math.round(overview.average_confidence * 100)}%` : '0%'}
          </p>
          <p className="text-sm text-slate-400">Confidence Accuracy</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-amber-400" />
        </div>
      </div>

      {/* ─── Knowledge Health Tracker ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 bg-[#0f1327] border border-white/5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-forge-400" />
                Knowledge Base Health Index
              </h2>
              <span className="text-xs text-slate-500">Goal: 95%</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-forge-600 to-forge-400 rounded-full transition-all duration-1000"
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
              <span className="text-lg font-bold text-forge-400 w-12 text-right">{healthPercent}%</span>
            </div>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Based on {overview?.indexed_documents} fully indexed files out of {overview?.total_documents} uploaded.
              Failed ingests reduce the health index. Clean up files in error states using the Knowledge panel.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-4">
            <div className="text-center">
              <p className="text-xs text-slate-500">Indexed</p>
              <p className="text-base font-semibold text-green-400">{overview?.indexed_documents}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Pending</p>
              <p className="text-base font-semibold text-amber-400">{overview?.pending_documents}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Failed</p>
              <p className="text-base font-semibold text-red-400">{overview?.failed_documents}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-card p-6 bg-[#0f1327] border border-white/5 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => navigate('/app/upload')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
              >
                <span className="text-sm font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4 text-forge-400" />
                  Upload Document
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => navigate('/app/chat')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
              >
                <span className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  Start AI Chat
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => navigate('/app/knowledge-base')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
              >
                <span className="text-sm font-medium flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  Manage Indexing
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 leading-normal">
            Shortcuts update the enterprise database. View system diagnostics in the sidebar toggle.
          </div>
        </div>
      </div>

      {/* ─── Trends Charts ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uploads and Queries */}
        <div className="glass-card p-6 bg-[#0f1327] border border-white/5 rounded-xl">
          <h2 className="font-semibold text-white mb-6">Activity Trends — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trends?.daily_queries ?? []}>
              <defs>
                <linearGradient id="queriesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b6ef4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5b6ef4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f1327', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f8fafc' }}
              />
              <Area type="monotone" name="Queries count" dataKey="value" stroke="#5b6ef4" fill="url(#queriesGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Latency and Confidence */}
        <div className="glass-card p-6 bg-[#0f1327] border border-white/5 rounded-xl">
          <h2 className="font-semibold text-white mb-6">Latency Performance vs Accuracy</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trends?.latency_trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis unit="ms" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f1327', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f8fafc' }}
              />
              <Bar dataKey="value" name="Latency (ms)" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                {(trends?.latency_trend ?? []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 150 ? '#f43f5e' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Search Insights & System Status ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Keywords / Frequent Queries */}
        <div className="glass-card p-6 bg-[#0f1327] border border-white/5 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-forge-400" />
              Frequent Search Queries & Keywords
            </h2>
            <span className="text-xs text-slate-500">Average query: {search?.average_query_length ?? 0} chars</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Popular Questions</p>
              <div className="space-y-2">
                {search?.most_frequent_queries && search.most_frequent_queries.length > 0 ? (
                  search.most_frequent_queries.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-sm">
                      <span className="text-slate-300 truncate pr-4">{q.query_text}</span>
                      <span className="px-2 py-0.5 rounded bg-forge-600/20 text-forge-400 text-xs font-bold">{q.frequency}x</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-600 py-4">No search history recorded yet.</div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Top Keyword tokens</p>
              <div className="space-y-2">
                {search?.top_keywords && search.top_keywords.length > 0 ? (
                  search.top_keywords.map((kw, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-sm">
                      <span className="text-slate-300">{kw.keyword}</span>
                      <span className="text-slate-500 text-xs">{kw.count} hits</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-600 py-4">No tokens index computed.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* System Heartbeat Widget */}
        <div className="glass-card p-6 bg-[#0f1327] border border-white/5 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-forge-400" />
              AI Service Providers
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-500">LLM Provider</span>
                <span className="text-sm font-semibold text-slate-300">{system?.llm_provider}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-500">Embedding Layer</span>
                <span className="text-sm font-semibold text-slate-300">{system?.embedding_provider}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-500">Vector Datastore</span>
                <span className="text-sm font-semibold text-slate-300">{system?.vector_store}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-500">Retriever Module</span>
                <span className="text-sm font-semibold text-slate-300">{system?.retriever}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-slate-500">Evaluation Engine</span>
                <span className="text-sm font-semibold text-slate-300">{system?.evaluation_framework}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-xs text-slate-500 flex items-center gap-2 mt-4">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            Core providers running successfully without execution dropouts.
          </div>
        </div>
      </div>

      {/* ─── Documents list & Smart Insights ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referenced Documents Table */}
        <div className="glass-card p-6 bg-[#0f1327] border border-white/5 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Most Referenced Documents</h2>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 font-medium text-xs uppercase tracking-wider">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Confidence</th>
                  <th className="pb-3 text-right">RAG Refs</th>
                </tr>
              </thead>
              <tbody>
                {knowledge?.most_referenced_documents && knowledge.most_referenced_documents.length > 0 ? (
                  knowledge.most_referenced_documents.map((doc, idx) => (
                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01]">
                      <td className="py-3 font-medium text-slate-300 truncate max-w-xs">{doc.title}</td>
                      <td className="py-3">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-semibold',
                          doc.status === 'ready' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        )}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-300">{Math.round(doc.confidence_score * 100)}%</td>
                      <td className="py-3 text-right font-bold text-forge-400">{doc.references_count}x</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-slate-600">No document references registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smart Insights & Alert Feed */}
        <div className="glass-card p-6 bg-[#0f1327] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forge-400" />
              Smart Telemetry Insights
            </h2>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="space-y-3.5 overflow-y-auto max-h-[300px]">
            {insights && insights.length > 0 ? (
              insights.map((ins, idx) => (
                <div key={idx} className={cn(
                  'p-3.5 rounded-xl border flex items-start gap-3 transition-colors',
                  ins.type === 'success' && 'bg-green-500/5 border-green-500/10 text-green-400',
                  ins.type === 'warning' && 'bg-amber-500/5 border-amber-500/10 text-amber-400',
                  ins.type === 'alert' && 'bg-red-500/5 border-red-500/10 text-red-400',
                  ins.type === 'info' && 'bg-blue-500/5 border-blue-500/10 text-blue-400'
                )}>
                  {ins.type === 'warning' || ins.type === 'alert' ? (
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium leading-relaxed text-slate-200">{ins.text}</p>
                    <span className="text-[10px] text-slate-500 block mt-1">{ins.timestamp}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-600 py-6 text-center">No quality insights computed yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
