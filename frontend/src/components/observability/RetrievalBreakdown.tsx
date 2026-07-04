import React from 'react';
import { Layers, Database, Compass, Server } from 'lucide-react';
import { PipelineDiagnostics } from '../../services/observabilityService';

interface RetrievalBreakdownProps {
  diagnostics: PipelineDiagnostics | null;
}

export default function RetrievalBreakdown({ diagnostics }: RetrievalBreakdownProps) {
  if (!diagnostics) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-500" />
        <span>Hybrid Retrieval Breakdown</span>
      </h3>

      <div className="space-y-4">
        {/* Vector Search Stats */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Vector search (Qdrant)</span>
            </span>
            <span className="text-slate-300 font-mono">{diagnostics.vector_search_time_ms} ms</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-850">
            <div
              className="bg-indigo-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (diagnostics.vector_search_time_ms / (diagnostics.vector_search_time_ms + diagnostics.keyword_search_time_ms || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Keyword Search Stats */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Keyword search (BM25)</span>
            </span>
            <span className="text-slate-300 font-mono">{diagnostics.keyword_search_time_ms} ms</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-850">
            <div
              className="bg-sky-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (diagnostics.keyword_search_time_ms / (diagnostics.vector_search_time_ms + diagnostics.keyword_search_time_ms || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Scoring Indicators */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-2.5 flex items-center gap-3">
            <Server className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="text-[9px] text-slate-500 block uppercase">Top Score</span>
              <span className="text-xs font-mono font-bold text-slate-200">{diagnostics.top_similarity}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-2.5 flex items-center gap-3">
            <Server className="w-4 h-4 text-cyan-500" />
            <div>
              <span className="text-[9px] text-slate-500 block uppercase">Avg Score</span>
              <span className="text-xs font-mono font-bold text-slate-200">{diagnostics.average_similarity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
