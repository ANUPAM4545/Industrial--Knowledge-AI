import React, { useEffect, useState } from 'react';
import { Activity, Clock, ShieldCheck, Heart, Database, AlertCircle } from 'lucide-react';
import { observabilityService, AIHealthStatus, SystemRuntimeMetrics } from '../../services/observabilityService';

interface MetricsDashboardProps {
  activeConversationId?: string;
  confidenceScore: number;
}

export default function MetricsDashboard({ activeConversationId, confidenceScore }: MetricsDashboardProps) {
  const [health, setHealth] = useState<AIHealthStatus | null>(null);
  const [runtime, setRuntime] = useState<SystemRuntimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [healthData, runtimeData] = await Promise.all([
        observabilityService.getAIHealth(),
        observabilityService.getAIRuntime()
      ]);
      setHealth(healthData);
      setRuntime(runtimeData);
    } catch (e) {
      console.error('Failed to load observability stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Healthy') return 'text-emerald-400 bg-emerald-950/30 border-emerald-500/25';
    if (status === 'Degraded') return 'text-amber-400 bg-amber-950/30 border-amber-500/25';
    return 'text-red-400 bg-red-950/30 border-red-500/25';
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Confidence Gauge */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-100">{confidenceScore}%</span>
              <span className="text-[10px] text-slate-500">score</span>
            </div>
            {/* Simple progress gauge */}
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3 border border-slate-850">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Latency card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Response Time</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-100">
                {runtime ? `${runtime.average_latency_ms}` : '---'}
              </span>
              <span className="text-[10px] text-slate-500">ms</span>
            </div>
            <span className="text-[9px] text-slate-500 block mt-3">
              P95 Latency: {runtime ? `${runtime.p95_latency_ms} ms` : '---'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Health Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>AI Health Check Overview</span>
        </h3>
        
        {health ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {/* Embeddings */}
              <div className={`p-2 border rounded flex justify-between items-center ${getStatusColor(health.embedding_status)}`}>
                <span>Embedding API</span>
                <span className="font-bold">{health.embedding_status}</span>
              </div>
              {/* LLM */}
              <div className={`p-2 border rounded flex justify-between items-center ${getStatusColor(health.llm_status)}`}>
                <span>LLM Generation</span>
                <span className="font-bold">{health.llm_status}</span>
              </div>
              {/* Vector */}
              <div className={`p-2 border rounded flex justify-between items-center ${getStatusColor(health.vector_store_status)}`}>
                <span>Vector Store</span>
                <span className="font-bold">{health.vector_store_status}</span>
              </div>
              {/* Retriever */}
              <div className={`p-2 border rounded flex justify-between items-center ${getStatusColor(health.retriever_status)}`}>
                <span>Retriever Rank</span>
                <span className="font-bold">{health.retriever_status}</span>
              </div>
            </div>
            
            <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-850">
              Overall Status: <span className="font-semibold text-slate-300 uppercase">{health.overall_status}</span>
            </div>
          </div>
        ) : (
          <div className="h-20 flex items-center justify-center text-xs text-slate-500">
            Querying provider endpoints...
          </div>
        )}
      </div>

      {/* System Runtime Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-500" />
          <span>Database & Vector Stats</span>
        </h3>

        {runtime ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-3">
              <span className="text-[9px] text-slate-500 block uppercase font-semibold">Indexed Docs</span>
              <span className="text-lg font-bold text-slate-200 font-mono">{runtime.documents_indexed}</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-3">
              <span className="text-[9px] text-slate-500 block uppercase font-semibold">Stored Vectors</span>
              <span className="text-lg font-bold text-slate-200 font-mono">{runtime.vectors_stored}</span>
            </div>
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center text-xs text-slate-500">
            Loading storage indices...
          </div>
        )}
      </div>
    </div>
  );
}
