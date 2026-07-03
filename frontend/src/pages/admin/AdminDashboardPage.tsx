import {
  Users, FileText, MessageSquare, Search,
  TrendingUp, ShieldCheck, Activity
} from 'lucide-react'

const stats = [
  { label: 'Total Users',     value: '—', icon: Users,         color: 'text-forge-400',  bg: 'bg-forge-400/10'  },
  { label: 'Documents',       value: '—', icon: FileText,      color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
  { label: 'Conversations',   value: '—', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Searches Today',  value: '—', icon: Search,        color: 'text-green-400',  bg: 'bg-green-400/10'  },
]

export function AdminDashboardPage() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
          </div>
          <p className="text-slate-400 text-sm">Platform-wide statistics and controls</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-medium">
          <Activity className="w-3 h-3" />
          Admin Mode
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card p-6 hover:border-amber-500/20 transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Service Health */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          System Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Database', 'Qdrant', 'Redis', 'AI Service'].map((service) => (
            <div key={service} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="text-sm text-slate-300">{service}</span>
              <div className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm">
          No activity yet — connect services to see real-time events
        </div>
      </div>
    </div>
  )
}
