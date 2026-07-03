import { User, Lock, Bell, Palette, Building } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const tabs = [
  { id: 'profile',        label: 'Profile',        icon: User      },
  { id: 'security',       label: 'Security',        icon: Lock      },
  { id: 'notifications',  label: 'Notifications',   icon: Bell      },
  { id: 'organization',   label: 'Organization',    icon: Building  },
  { id: 'appearance',     label: 'Appearance',      icon: Palette   },
]

export function SettingsPage() {
  const { user } = useAuthStore()

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`settings-tab-${id}`}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-left first:text-white first:bg-forge-600/20 first:border first:border-forge-500/30"
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 glass-card p-6 space-y-6">
          <h2 className="font-semibold text-white text-lg">Profile Information</h2>

          <div className="flex items-center gap-4 pb-6 border-b border-white/5">
            <div className="w-16 h-16 rounded-full bg-forge-600 flex items-center justify-center text-xl font-bold text-white">
              {user?.full_name?.charAt(0) ?? 'U'}
            </div>
            <div>
              <p className="font-medium text-white">{user?.full_name ?? '—'}</p>
              <p className="text-sm text-slate-400">{user?.email ?? '—'}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-forge-600/20 text-forge-400 border border-forge-500/20 capitalize mt-1">
                {user?.role ?? 'operator'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                id="settings-fullname"
                className="input-field"
                defaultValue={user?.full_name ?? ''}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
              <input
                type="text"
                id="settings-department"
                className="input-field"
                defaultValue={user?.department ?? ''}
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
              <textarea
                id="settings-bio"
                rows={3}
                className="input-field resize-none"
                defaultValue={user?.bio ?? ''}
                placeholder="Brief description about yourself..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button id="settings-save" className="btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}
