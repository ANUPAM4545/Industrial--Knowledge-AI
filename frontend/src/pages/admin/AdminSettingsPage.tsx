import { Settings, Shield, Bell } from 'lucide-react'

export function AdminSettingsPage() {
  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure global platform behavior and defaults</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-forge-500/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-forge-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">General Configuration</h2>
              <p className="text-sm text-slate-400">Global defaults for new workspaces</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Default User Role</label>
              <select className="input-field max-w-md">
                <option value="operator">Operator</option>
                <option value="viewer">Viewer</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Automatically assigned to newly registered users.</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl max-w-md">
              <div>
                <h3 className="text-sm font-semibold text-white">Maintenance Mode</h3>
                <p className="text-xs text-slate-400 mt-0.5">Disable access for non-admins.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forge-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Security Constraints</h2>
              <p className="text-sm text-slate-400">Rate limits and risk thresholds</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Global Rate Limit (RPM)</label>
              <input type="number" defaultValue={60} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Max Tokens per Request</label>
              <input type="number" defaultValue={4096} className="input-field" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
