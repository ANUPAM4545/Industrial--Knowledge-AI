import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, Variants } from 'framer-motion'
import {
  FileText, Search, MessageSquare, TrendingUp,
  CheckCircle2, Clock, ArrowUpRight, Cpu, Database,
  Sparkles, ShieldAlert, RefreshCw, Plus, Zap, Activity, Upload
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import { useUIStore } from '@/store/uiStore'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { apiClient } from '@/services/apiClient'
import {
  dashboardService,
  DashboardOverview,
  KnowledgeHealth,
  SearchAnalytics,
  SystemHealth,
  DashboardTrends,
  SmartInsight
} from '@/services/dashboardService'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user: clerkUser } = useUser()
  const { isSignedIn, getToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { workspaceMode, setWorkspaceMode, setTourState } = useUIStore()

  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [knowledge, setKnowledge] = useState<KnowledgeHealth | null>(null)
  const [search, setSearch] = useState<SearchAnalytics | null>(null)
  const [system, setSystem] = useState<SystemHealth | null>(null)
  const [trends, setTrends] = useState<DashboardTrends | null>(null)
  const [insights, setInsights] = useState<SmartInsight[]>([])

  const { data: dbUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const token = await getToken()
      const res = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5,
  })

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
  }, [workspaceMode])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-32 rounded-2xl shimmer-loading" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl shimmer-loading" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-xl shimmer-loading" />
          <div className="h-64 rounded-xl shimmer-loading" />
        </div>
      </div>
    )
  }

  const healthyCount = overview?.indexed_documents ?? 0
  const totalCount = overview?.total_documents ?? 0
  const healthPercent = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 100

  const firstName = dbUser?.full_name?.split(' ')[0] || clerkUser?.firstName || 'Operator'

  if (workspaceMode === 'live' && totalCount === 0 && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto mt-12"
      >
        <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8 shadow-glow-sm relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl" />
          <Sparkles className="w-12 h-12 text-indigo-400 relative z-10" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Your Workspace is Empty</h1>
        <p className="text-[var(--text-secondary)] text-lg mb-8 leading-relaxed">
          Welcome to ForgeMind AI! Start by uploading your industrial documents, or explore the platform using our pre-configured Demo Workspace.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setWorkspaceMode('demo')
              setTourState({ isActive: true, currentStep: 0, hasSeenTour: false })
            }}
            className="px-6 py-3 bg-forge-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-glow-md flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Explore Demo Workspace
          </button>
          <button
            onClick={() => navigate('/app/upload')}
            className="px-6 py-3 bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold rounded-xl hover:bg-[var(--bg-glass-hover)] transition-all flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Documents
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="relative rounded-2xl overflow-hidden liquid-glass p-8 sm:p-10 border border-[var(--border-subtle)] group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-forge-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-forge-500/30 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
              Welcome back, <span className="gradient-text">{firstName}</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base mb-6">
              Your enterprise AI workspace is ready. What would you like to explore today?
            </p>
            
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Sparkles className="w-5 h-5 text-forge-400" />
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-glass)] border border-[var(--border-strong)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-forge-500/50 shadow-glass-sm transition-all text-sm"
                placeholder="Ask your AI assistant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery) navigate('/app/chat')
                }}
              />
              <button 
                onClick={() => navigate('/app/chat')}
                className="absolute inset-y-1.5 right-1.5 px-3 bg-forge-600 hover:bg-forge-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Ask AI
              </button>
            </div>
            
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {['Summarize recent docs', 'Analyze search trends', 'System health check'].map((prompt, i) => (
                <button
                  key={i}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-forge-500/30 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end gap-3 text-right">
             <button
                onClick={() => fetchDashboardData(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] text-xs font-medium transition-colors shadow-sm"
              >
                <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                Refresh Data
              </button>
              <div className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border shadow-sm',
                system?.overall_system_health === 'Healthy'
                  ? 'bg-green-500/10 border-green-500/20 text-green-500'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              )}>
                <CheckCircle2 className="w-4 h-4" />
                {system?.overall_system_health === 'Healthy' ? 'Systems Operational' : 'Degraded Mode'}
              </div>
          </div>
        </div>
      </motion.div>

      {/* ─── KPI Cards ──────────────────────────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-forge-500/10 flex items-center justify-center border border-forge-500/20 group-hover:bg-forge-500/20 transition-colors">
              <FileText className="w-5 h-5 text-forge-500" />
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-glass)] px-2 py-1 rounded-md border border-[var(--border-subtle)]">
              {overview?.pending_documents} pending
            </span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mb-1 tracking-tight">
            <AnimatedCounter value={overview?.total_documents ?? 0} />
          </p>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Total Documents</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-forge-600 to-forge-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
              <Database className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-glass)] px-2 py-1 rounded-md border border-[var(--border-subtle)]">
              {overview?.total_chunks} chunks
            </span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mb-1 tracking-tight">
             <AnimatedCounter value={overview?.total_vectors ?? 0} />
          </p>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Total Vectors</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
              <MessageSquare className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
              +{overview?.questions_today} today
            </span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mb-1 tracking-tight">
             <AnimatedCounter value={overview?.total_conversations ?? 0} />
          </p>
          <p className="text-sm font-medium text-[var(--text-secondary)]">RAG Conversations</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-glass)] px-2 py-1 rounded-md border border-[var(--border-subtle)]">
              {overview?.average_latency}ms avg
            </span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mb-1 tracking-tight">
             <AnimatedCounter value={(overview?.average_confidence ?? 0) * 100} format={(v) => `${Math.round(v)}%`} />
          </p>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Confidence Accuracy</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </motion.div>

      {/* ─── Main Content Grid ──────────────────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Knowledge Health */}
        <motion.div variants={itemVariants} className="glass-panel p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-forge-500" />
                Knowledge Base Health Index
              </h2>
              <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-glass)] px-2 py-1 rounded-md border border-[var(--border-subtle)]">
                Target: 95%
              </span>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex-1 h-3 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${healthPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-forge-600 to-forge-400 rounded-full"
                />
              </div>
              <span className="text-xl font-bold text-forge-500 w-14 text-right">
                <AnimatedCounter value={healthPercent} format={(v) => `${Math.round(v)}%`} />
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-5 leading-relaxed">
              Based on <span className="font-semibold text-[var(--text-primary)]">{overview?.indexed_documents}</span> fully indexed files out of <span className="font-semibold text-[var(--text-primary)]">{overview?.total_documents}</span> uploaded.
              Failed ingests reduce the health index.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-[var(--border-strong)] pt-5 mt-5">
            <div className="text-center p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)]">
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Indexed</p>
              <p className="text-lg font-bold text-green-500">{overview?.indexed_documents}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)]">
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Pending</p>
              <p className="text-lg font-bold text-amber-500">{overview?.pending_documents}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)]">
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Failed</p>
              <p className="text-lg font-bold text-red-500">{overview?.failed_documents}</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/app/upload')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)] hover:border-forge-500/30 group shadow-sm"
              >
                <span className="text-sm font-medium flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-forge-500/10 text-forge-500"><Plus className="w-4 h-4" /></span>
                  Upload Document
                </span>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-forge-500 transition-colors" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/app/chat')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)] hover:border-green-500/30 group shadow-sm"
              >
                <span className="text-sm font-medium flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-green-500/10 text-green-500"><MessageSquare className="w-4 h-4" /></span>
                  Start AI Chat
                </span>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-green-500 transition-colors" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/app/knowledge-base')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)] hover:border-purple-500/30 group shadow-sm"
              >
                <span className="text-sm font-medium flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500"><Database className="w-4 h-4" /></span>
                  Manage Indexing
                </span>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-purple-500 transition-colors" />
              </motion.button>
            </div>
          </div>
          <div className="mt-6 text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-glass)] p-3 rounded-lg border border-[var(--border-subtle)]">
            Use the command palette <kbd className="font-mono bg-[var(--bg-primary)] px-1 py-0.5 rounded border border-[var(--border-subtle)] mx-1">⌘K</kbd> for faster navigation anywhere in the app.
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Trends Charts ──────────────────────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-6">Activity Trends (7 Days)</h2>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends?.daily_queries ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="queriesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b6ef4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5b6ef4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-strong)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-glass-md)', backdropFilter: 'blur(12px)' }}
                />
                <Area type="monotone" name="Queries count" dataKey="value" stroke="#5b6ef4" fill="url(#queriesGrad)" strokeWidth={3} activeDot={{ r: 6, fill: '#5b6ef4', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-6">Latency vs Accuracy</h2>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends?.latency_trend ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-strong)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis unit="ms" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  cursor={{ fill: 'var(--bg-glass-hover)' }}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-glass-md)', backdropFilter: 'blur(12px)' }}
                />
                <Bar dataKey="value" name="Latency (ms)" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {(trends?.latency_trend ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 150 ? '#ef4444' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
      
      {/* ─── Search Insights & System Status ──────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="glass-panel p-6 lg:col-span-2">
           <div className="flex items-center justify-between mb-6 border-b border-[var(--border-strong)] pb-4">
            <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Search className="w-5 h-5 text-forge-500" />
              Search Intelligence
            </h2>
            <span className="text-xs font-medium text-[var(--text-secondary)]">Avg length: {search?.average_query_length ?? 0} chars</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Popular Questions
              </p>
              <div className="space-y-3">
                {search?.most_frequent_queries && search.most_frequent_queries.length > 0 ? (
                  search.most_frequent_queries.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-sm group hover:border-[var(--border-strong)] transition-colors">
                      <span className="text-[var(--text-primary)] truncate pr-4 font-medium">{q.query_text}</span>
                      <span className="px-2.5 py-1 rounded-md bg-forge-500/10 text-forge-500 text-xs font-bold">{q.frequency}x</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-[var(--bg-glass)] rounded-xl border border-[var(--border-subtle)] border-dashed">
                    <Search className="w-8 h-8 text-[var(--text-muted)] mb-3" />
                    <p className="text-sm font-medium text-[var(--text-secondary)]">No search history</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Queries will appear here once users start chatting.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database className="w-3.5 h-3.5" /> Top Keywords
              </p>
              <div className="space-y-3">
                {search?.top_keywords && search.top_keywords.length > 0 ? (
                  search.top_keywords.map((kw, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-sm group hover:border-[var(--border-strong)] transition-colors">
                      <span className="text-[var(--text-primary)] font-medium">{kw.keyword}</span>
                      <span className="text-[var(--text-secondary)] text-xs font-mono bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">{kw.count} hits</span>
                    </div>
                  ))
                ) : (
                   <div className="flex flex-col items-center justify-center py-8 text-center bg-[var(--bg-glass)] rounded-xl border border-[var(--border-subtle)] border-dashed">
                    <FileText className="w-8 h-8 text-[var(--text-muted)] mb-3" />
                    <p className="text-sm font-medium text-[var(--text-secondary)]">No keyword tokens</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Run indexing to extract tokens.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Heartbeat */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
          
          <div>
            <h2 className="font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-500" />
              AI Services Stack
            </h2>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)]">
                <span className="text-xs font-medium text-[var(--text-secondary)]">LLM Provider</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{system?.llm_provider || 'OpenAI'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)]">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Embeddings</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{system?.embedding_provider || 'OpenAI'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)]">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Vector Store</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{system?.vector_store || 'Qdrant'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-subtle)]">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Retriever</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{system?.retriever || 'LangChain RAG'}</span>
              </div>
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-xs font-medium text-green-500 flex items-start gap-3 mt-6 relative z-10">
            <div className="relative flex h-3 w-3 mt-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            Core AI providers running perfectly without execution dropouts.
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Documents list & Smart Insights ───────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Referenced Documents */}
        <motion.div variants={itemVariants} className="glass-panel p-6 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-[var(--border-strong)] pb-4">
            <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Most Referenced Documents
            </h2>
            <button className="text-xs font-medium text-forge-500 hover:text-forge-400 transition-colors">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider">
                  <th className="pb-4 font-semibold">Title</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold text-right">Confidence</th>
                  <th className="pb-4 font-semibold text-right">RAG Refs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {knowledge?.most_referenced_documents && knowledge.most_referenced_documents.length > 0 ? (
                  knowledge.most_referenced_documents.map((doc, idx) => (
                    <tr key={idx} className="group hover:bg-[var(--bg-glass)] transition-colors">
                      <td className="py-4 font-medium text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-xs">{doc.title}</td>
                      <td className="py-4">
                        <span className={cn(
                          'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border',
                          doc.status === 'ready' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        )}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-[var(--text-secondary)] font-medium">{Math.round(doc.confidence_score * 100)}%</td>
                      <td className="py-4 text-right">
                        <span className="font-bold text-[var(--text-primary)] bg-[var(--bg-glass)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]">
                          {doc.references_count}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Database className="w-10 h-10 text-[var(--text-muted)] mb-3" />
                        <p className="text-sm font-medium text-[var(--text-secondary)]">No document references registered</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">Upload documents and start chatting to generate knowledge references.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Smart Insights & Alert Feed */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between mb-6 border-b border-[var(--border-strong)] pb-4">
            <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Smart Telemetry
            </h2>
            <Clock className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {insights && insights.length > 0 ? (
              insights.map((ins, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className={cn(
                    'p-4 rounded-xl border flex items-start gap-3 transition-all hover:-translate-y-0.5 shadow-sm',
                    ins.type === 'success' && 'bg-green-500/5 border-green-500/20 text-green-500',
                    ins.type === 'warning' && 'bg-amber-500/5 border-amber-500/20 text-amber-500',
                    ins.type === 'alert' && 'bg-red-500/5 border-red-500/20 text-red-500',
                    ins.type === 'info' && 'bg-blue-500/5 border-blue-500/20 text-blue-500'
                  )}
                >
                  {ins.type === 'warning' || ins.type === 'alert' ? (
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : ins.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Activity className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium leading-snug">{ins.text}</p>
                    <span className="text-[10px] opacity-70 block mt-1.5 font-semibold uppercase tracking-wider">{ins.timestamp}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                 <Activity className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-50" />
                 <p className="text-sm font-medium text-[var(--text-secondary)]">System stable</p>
                 <p className="text-xs text-[var(--text-muted)] mt-1">No anomalies detected.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

