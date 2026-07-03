import { TrendingUp, Search, MessageSquare, FileText, Users } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const mockData = Array.from({ length: 30 }, (_, i) => ({
  date: `Jul ${i + 1}`,
  searches: 0,
  conversations: 0,
  documents: 0,
}))

const cards = [
  { label: 'Total Searches',    value: '—', icon: Search,        color: 'text-forge-400',  bg: 'bg-forge-400/10'  },
  { label: 'AI Conversations',  value: '—', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Documents Indexed', value: '—', icon: FileText,      color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
  { label: 'Active Users',      value: '—', icon: Users,         color: 'text-green-400',  bg: 'bg-green-400/10'  },
]

export function AnalyticsPage() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Track your knowledge base performance</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors first:bg-forge-600/20 first:text-forge-400 first:border first:border-forge-500/30"
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-forge-400" />
          Activity Over Time
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="aSearchGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5b6ef4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5b6ef4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aChatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} interval={6} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0f1327', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
            <Legend wrapperStyle={{ color: '#64748b', fontSize: 12 }} />
            <Area type="monotone" dataKey="searches" name="Searches" stroke="#5b6ef4" fill="url(#aSearchGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="conversations" name="AI Chats" stroke="#8b5cf6" fill="url(#aChatGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-6">Documents by Status</h2>
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
            No data yet — upload documents to see breakdown
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-6">Top Search Queries</h2>
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
            No searches yet — start querying your knowledge base
          </div>
        </div>
      </div>
    </div>
  )
}
