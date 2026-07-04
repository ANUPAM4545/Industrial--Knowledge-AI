import React from 'react';
import { Settings, ShieldAlert } from 'lucide-react';

interface DeveloperModeToggleProps {
  isDevMode: boolean;
  onToggle: () => void;
}

export default function DeveloperModeToggle({ isDevMode, onToggle }: DeveloperModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm ${
        isDevMode
          ? 'bg-amber-950/40 text-amber-400 border-amber-500/50 hover:bg-amber-950/60 ring-2 ring-amber-500/20'
          : 'bg-slate-900/60 text-slate-400 border-slate-700/80 hover:bg-slate-900/90 hover:text-slate-200'
      }`}
      title="Toggle Developer Mode Observability panel"
    >
      <Settings className={`w-3.5 h-3.5 ${isDevMode ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
      <span>Dev Mode: {isDevMode ? 'ON' : 'OFF'}</span>
      {isDevMode && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
      )}
    </button>
  );
}
