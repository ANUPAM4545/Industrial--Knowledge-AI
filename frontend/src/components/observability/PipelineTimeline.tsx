import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Cpu, Search, HelpCircle, Activity } from 'lucide-react';
import { PipelineDiagnostics } from '../../services/observabilityService';

interface PipelineTimelineProps {
  diagnostics: PipelineDiagnostics | null;
}

export default function PipelineTimeline({ diagnostics }: PipelineTimelineProps) {
  if (!diagnostics) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400 flex flex-col items-center justify-center min-h-[200px]">
        <Clock className="w-8 h-8 mb-2 text-slate-600 animate-pulse" />
        <p className="text-sm">Awaiting RAG pipeline execution diagnostics...</p>
      </div>
    );
  }

  const stages = [
    {
      name: 'Query Input',
      desc: `Raw question: "${diagnostics.query.substring(0, 30)}..."`,
      time: 0,
      icon: Search,
      details: `Length: ${diagnostics.query.length} chars`
    },
    {
      name: 'Embedding Generation',
      desc: `${diagnostics.embedding_provider} (${diagnostics.embedding_model})`,
      time: diagnostics.embedding_time_ms,
      icon: Cpu,
      details: 'Converts query to dense vector representations.'
    },
    {
      name: 'Hybrid Retrieval',
      desc: `Qdrant Search & BM25 Keyword Indexing`,
      time: Math.round((diagnostics.vector_search_time_ms + diagnostics.keyword_search_time_ms) * 10) / 10,
      icon: Activity,
      details: `Retrieved Chunks: ${diagnostics.retrieved_chunks}`
    },
    {
      name: 'Rank Merge',
      desc: 'Reciprocal Rank Fusion (RRF)',
      time: diagnostics.merge_time_ms,
      icon: ArrowRight,
      details: `Merged Chunks: ${diagnostics.merged_chunks}`
    },
    {
      name: 'Reranker Engine',
      desc: 'Cross-Encoder Re-scoring',
      time: diagnostics.rerank_time_ms,
      icon: Cpu,
      details: `Top Similarity: ${diagnostics.top_similarity}`
    },
    {
      name: 'Context Builder',
      desc: 'Token truncation & deduplication',
      time: diagnostics.context_build_time_ms,
      icon: ArrowRight,
      details: 'Structures citation references and clean markdown.'
    },
    {
      name: 'Prompt Assembly',
      desc: 'Inject instructions & metadata',
      time: diagnostics.prompt_build_time_ms,
      icon: ArrowRight,
      details: 'Formats prompt with rules and query boundaries.'
    },
    {
      name: 'LLM Generation',
      desc: `${diagnostics.llm_provider} (${diagnostics.llm_model})`,
      time: diagnostics.generation_time_ms,
      icon: Cpu,
      details: 'Generates answer from formatted grounding context.'
    },
    {
      name: 'Response Evaluation',
      desc: 'Quality framework validation',
      time: 8.5,
      icon: CheckCircle2,
      details: `Confidence: ${diagnostics.confidence_score}%, Risk: ${diagnostics.hallucination_risk}`
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <h3 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4 text-amber-500" />
        <span>RAG Pipeline Execution Stages</span>
      </h3>

      <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div key={idx} className="relative pl-6 group">
              {/* Timeline marker */}
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 bg-amber-500/80 ring-4 ring-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              </div>

              {/* Box Details */}
              <div className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-700/80 rounded-lg p-3 transition-all duration-300">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{stage.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{stage.desc}</p>
                  </div>
                  {stage.time > 0 && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {stage.time} ms
                    </span>
                  )}
                </div>
                
                {/* Expandable tooltips details */}
                <div className="mt-2 pt-2 border-t border-slate-900/60 text-[10px] text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-slate-600" />
                  <span>{stage.details}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-850 flex justify-between items-center text-xs text-slate-400 font-mono">
        <span>Total Telemetry Latency</span>
        <span className="text-amber-400 font-bold">{diagnostics.total_latency_ms} ms</span>
      </div>
    </div>
  );
}
