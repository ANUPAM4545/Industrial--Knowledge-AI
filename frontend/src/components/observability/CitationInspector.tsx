import React from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PipelineDiagnostics } from '../../services/observabilityService';

interface CitationInspectorProps {
  diagnostics: PipelineDiagnostics | null;
  citations: any[];
}

export default function CitationInspector({ diagnostics, citations }: CitationInspectorProps) {
  if (!diagnostics) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-teal-500" />
        <span>Citation grounding & verification</span>
      </h3>

      <div className="space-y-4">
        {/* Risk Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Hallucination Risk</span>
            <span className={`text-xs font-bold flex items-center gap-1.5 mt-1 ${
              diagnostics.hallucination_risk === 'HIGH'
                ? 'text-red-400'
                : diagnostics.hallucination_risk === 'MEDIUM'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              {diagnostics.hallucination_risk} RISK
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Citations Quality</span>
            <span className="text-xs font-bold text-slate-200 mt-1 block">
              {diagnostics.citations_count} parsed references
            </span>
          </div>
        </div>

        {/* Citations List */}
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          {citations && citations.length > 0 ? (
            citations.map((cit, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-850/80 rounded p-2.5 flex items-start gap-3 transition-colors hover:border-slate-700"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-semibold text-slate-200 block">
                    Source Document: {cit.document_name}
                  </span>
                  {cit.page_number && (
                    <span className="text-slate-400 font-mono text-[10px] bg-slate-900 border border-slate-850 px-1 py-0.25 rounded inline-block mt-1">
                      Page {cit.page_number}
                    </span>
                  )}
                  {cit.text && (
                    <p className="text-slate-500 mt-1 italic line-clamp-2">
                      "{cit.text}"
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-slate-500 italic py-4 text-center">
              No citation footprints found in generating context.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
