import React, { useEffect, useState } from 'react';
import { Shield, Activity, Users, AlertTriangle, Terminal, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock types for the API responses
interface SecurityStats {
  prompt_injections_24h: number;
  blocked_requests_24h: number;
  active_sessions: number;
  average_risk_score: number;
}

interface TimelineEvent {
  id: string;
  source_table: string;
  event_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  user_id?: string;
  ip_address?: string;
  action_taken: string;
}

export function SecurityDashboardPage() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll every 15 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, use the API client
        const resStats = await fetch('/api/v1/security-center/stats');
        if (resStats.ok) {
          const data = await resStats.json();
          setStats(data);
        }
        
        const resTimeline = await fetch('/api/v1/security-center/timeline?limit=10');
        if (resTimeline.ok) {
          const data = await resTimeline.json();
          setEvents(data.events);
        }
      } catch (err) {
        console.error("Failed to fetch security data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Enterprise Security Center
          </h1>
          <p className="text-slate-400 mt-2">Real-time threat monitoring and observability</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium">System Secure</span>
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Avg Risk Score</p>
              <h3 className="text-3xl font-bold mt-2">{loading ? '--' : stats?.average_risk_score}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Prompt Injections</p>
              <h3 className="text-3xl font-bold mt-2 text-rose-400">{loading ? '--' : stats?.prompt_injections_24h}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Blocked Requests</p>
              <h3 className="text-3xl font-bold mt-2 text-orange-400">{loading ? '--' : stats?.blocked_requests_24h}</h3>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Active Sessions</p>
              <h3 className="text-3xl font-bold mt-2 text-cyan-400">{loading ? '--' : stats?.active_sessions}</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Feed */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Live Threat Timeline</h2>
            <Terminal className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="space-y-4">
            {events.length === 0 && !loading && (
              <div className="text-center py-12 text-slate-500">
                No recent security events.
              </div>
            )}
            
            <AnimatePresence>
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 items-start"
                >
                  <div className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getSeverityColor(event.severity)}`}>
                    {event.severity}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-200">{event.event_type}</h4>
                      <span className="text-xs text-slate-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-400">
                      {event.user_id && <span>User: {event.user_id.split('_')[1] || event.user_id}</span>}
                      {event.ip_address && <span>IP: {event.ip_address}</span>}
                      <span className="text-slate-500">•</span>
                      <span className="text-indigo-400">Action: {event.action_taken}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Actions / Developer Mode Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-white/5">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full btn-secondary text-left justify-start">
                Block IP Address
              </button>
              <button className="w-full btn-secondary text-left justify-start">
                Terminate User Session
              </button>
              <button className="w-full btn-secondary text-left justify-start">
                Export Audit Logs
              </button>
            </div>
          </div>
          
          <div className="glass-card p-6 border border-indigo-500/20 bg-indigo-500/5">
            <h2 className="text-lg font-bold mb-2 text-indigo-400">Developer Mode</h2>
            <p className="text-sm text-slate-400 mb-4">
              Detailed latency tracing and AI pipeline observability active.
            </p>
            <div className="text-xs font-mono text-indigo-300 space-y-1">
              <div>&gt; PI Detector: 24ms</div>
              <div>&gt; Adaptive Rate Limit: 1ms</div>
              <div>&gt; Event Bus Pub: 0.4ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
