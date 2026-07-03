import {
  FileText, Users, Search, MessageSquare, TrendingUp,
  CheckCircle2, Clock, ArrowUpRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { cn } from '@/lib/utils'

// Placeholder data — will come from /api/v1/analytics/dashboard
const mockStats = [
  { label: 'Total Documents', value: '—', icon: FileText,      color: 'text-forge-400', bg: 'bg-forge-400/10'   },
  { label: 'Total Users',     value: '—', icon: Users,         color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Searches',        value: '—', icon: Search,        color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
  { label: 'AI Conversations',value: '—', icon: MessageSquare, color: 'text-green-400',  bg: 'bg-green-400/10'  },
]

const mockChartData = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  searches: 0,
  conversations: 0,
}))

const mockDocuments = [
  { name: 'No documents yet', status: 'empty', type: '—', date: '—' },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ready:      { label: 'Ready',      cls: 'bg-green-400/10 text-green-400 border-green-400/20'  },
    processing: { label: 'Processing', cls: 'bg-amber-400/10 text-amber-400 border-amber-400/20'  },
    failed:     { label: 'Failed',     cls: 'bg-red-400/10   text-red-400   border-red-400/20'    },
    empty:      { label: '—',          cls: 'bg-white/5      text-slate-500 border-white/10'      },
  }
  const { label, cls } = map[status] ?? map.empty
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', cls)}>
      {label}
    </span>
  )
}

export function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Your industrial knowledge platform at a glance
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-medium">
          <CheckCircle2 className="w-3 h-3" />
          All Systems Operational
        </div>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {mockStats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
                <Icon className={cn('w-5 h-5', color)} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ─── Knowledge Health ───────────────────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Knowledge Base Health</h2>
          <TrendingUp className="w-4 h-4 text-forge-400" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-gradient-to-r from-forge-600 to-forge-400 rounded-full transition-all duration-1000" />
          </div>
          <span className="text-sm text-slate-400 w-12">0%</span>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Upload documents and start chatting to improve your knowledge health score.
        </p>
      </div>

      {/* ─── Charts ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-6">Activity — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="searchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b6ef4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5b6ef4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f1327', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="searches" stroke="#5b6ef4" fill="url(#searchGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="conversations" stroke="#8b5cf6" fill="url(#chatGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Documents */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Documents</h2>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-3">
            {mockDocuments.map((doc, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-300">{doc.name}</p>
                    <p className="text-xs text-slate-600">{doc.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={doc.status} />
                  <span className="text-xs text-slate-600">{doc.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <a href="/app/knowledge-base" className="text-xs text-forge-400 hover:text-forge-300 flex items-center gap-1 transition-colors">
              View all documents <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
