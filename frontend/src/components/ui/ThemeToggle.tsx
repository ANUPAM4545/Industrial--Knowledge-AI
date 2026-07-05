import React from 'react'
import { useUIStore } from '@/store/uiStore'
import { Sun, Moon, Monitor } from 'lucide-react'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useUIStore()

  return (
    <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 p-1 rounded-lg w-fit">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded transition-all ${
          theme === 'light' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
        }`}
        title="Light theme"
        aria-label="Set light theme"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded transition-all ${
          theme === 'dark' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
        }`}
        title="Dark theme"
        aria-label="Set dark theme"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded transition-all ${
          theme === 'system' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
        }`}
        title="System theme"
        aria-label="Set system theme"
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
export default ThemeToggle
