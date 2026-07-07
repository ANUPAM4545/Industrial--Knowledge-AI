import {
  Users, FileText, MessageSquare, Search,
  TrendingUp, ShieldCheck, Activity, Clock
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { apiClient } from '@/services/apiClient'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface AdminStats {
  total_users: number
  total_documents: number
  total_conversations: number
  searches_today: number
}

interface SystemHealth {
  database: 'healthy' | 'unhealthy' | 'unknown'
  qdrant: 'healthy' | 'unhealthy' | 'unknown'
  redis: 'healthy' | 'unhealthy' | 'unknown'
  ai_service: 'healthy' | 'unhealthy' | 'unknown'
}

interface ActivityEvent {
  id: string
  action: string
  user_id: string
  created_at: string
}

export function AdminDashboardPage() {
  const { getToken } = useAuth()

  // Fetch Stats
  const { data: statsData } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const token = await getToken()
      const res = await apiClient.get('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    },
    refetchInterval: 30000 // Poll every 30s
  })

  // Fetch System Health
  const { data: healthData } = useQuery<SystemHealth>({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const token = await getToken()
      const res = await apiClient.get('/admin/system/health', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    },
    refetchInterval: 15000 // Poll every 15s
  })

  // Fetch Recent Activity
  const { data: activityData } = useQuery<ActivityEvent[]>({
    queryKey: ['admin-activity'],
    queryFn: async () => {
      const token = await getToken()
      const res = await apiClient.get('/admin/activity', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    },
    refetchInterval: 15000
  })

  const stats = [
    { label: 'Total Users',     value: statsData?.total_users ?? '—', icon: Users,         color: 'text-forge-400',  bg: 'bg-forge-400/10'  },
    { label: 'Documents',       value: statsData?.total_documents ?? '—', icon: FileText,      color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
    { label: 'Conversations',   value: statsData?.total_conversations ?? '—', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Searches Today',  value: statsData?.searches_today ?? '—', icon: Search,        color: 'text-green-400',  bg: 'bg-green-400/10'  },
  ]

  const healthServices = [
    { name: 'Database', key: 'database' as keyof SystemHealth },
    { name: 'Qdrant', key: 'qdrant' as keyof SystemHealth },
    { name: 'Redis', key: 'redis' as keyof SystemHealth },
    { name: 'AI Service', key: 'ai_service' as keyof SystemHealth },
  ]

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
          <Activity className="w-3 h-3 animate-pulse" />
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
            <p className="text-3xl font-bold text-white mb-1">
              {value}
            </p>
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
          {healthServices.map((service) => {
            const status = healthData?.[service.key] ?? 'unknown'
            return (
              <div key={service.name} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-sm text-slate-300">{service.name}</span>
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full shadow-glow-sm",
                  status === 'healthy' ? "bg-green-500 shadow-green-500/50" : 
                  status === 'unhealthy' ? "bg-red-500 shadow-red-500/50 animate-pulse" : 
                  "bg-slate-600"
                )} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4">Recent Activity</h2>
        
        {!activityData || activityData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
            No activity yet — connect services to see real-time events
          </div>
        ) : (
          <div className="space-y-3">
            {activityData.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                    <Activity className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{event.action}</p>
                    <p className="text-xs text-slate-400 font-mono">User: {event.user_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
