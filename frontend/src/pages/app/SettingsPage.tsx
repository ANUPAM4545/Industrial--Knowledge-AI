import { useState } from 'react'
import { User, Lock, Bell, Palette, Building, Smartphone, CheckCircle, Trash2, RefreshCw, Moon, Sun, Monitor, ShieldCheck, Mail, Zap, Sparkles } from 'lucide-react'
import { useUser, useOrganization, useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/apiClient'
import { usePWA } from '@/hooks/usePWA'
import { useUIStore } from '@/store/uiStore'
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'profile',        label: 'Profile',        icon: User      },
  { id: 'pwa',            label: 'PWA & Offline',  icon: Smartphone},
  { id: 'security',       label: 'Security',        icon: Lock      },
  { id: 'notifications',  label: 'Notifications',   icon: Bell      },
  { id: 'organization',   label: 'Organization',    icon: Building  },
  { id: 'appearance',     label: 'Appearance',      icon: Palette   },
]

export function SettingsPage() {
  const { user: clerkUser } = useUser()
  const { organization } = useOrganization()
  const { isInstalled, updateApp, clearCache } = usePWA()
  const { theme, setTheme, notifications, setNotifications, workspaceMode, setWorkspaceMode, resetDemoWorkspace, developerMode, setDeveloperMode, setTourState } = useUIStore()
  const [activeTab, setActiveTab] = useState('profile')
  
  const { getToken } = useAuth()
  const { addToast } = useToastStore()
  const [isSaving, setIsSaving] = useState(false)

  // Use the same query logic as AppLayout to fetch the user from DB
  const { data: dbUser, refetch: refetchUser } = useQuery({
    queryKey: ['me'],
    enabled: false, // already fetched in layout, this just reads from cache
  })

  const [fullName, setFullName] = useState(clerkUser?.fullName ?? '')
  const [department, setDepartment] = useState((dbUser as any)?.department ?? '')

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const token = await getToken()
      await apiClient.put('/auth/me', 
        { full_name: fullName, department },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await refetchUser()
      addToast('Profile updated successfully!', 'success')
    } catch (err) {
      addToast('Failed to update profile', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`settings-tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left",
                  activeTab === id
                    ? "text-[var(--text-primary)] bg-[var(--bg-glass-hover)] border border-[var(--border-strong)] shadow-glow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] border border-transparent"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 liquid-glass p-8 border border-[var(--border-subtle)] rounded-2xl relative overflow-hidden">
          {/* Subtle glow background for active content area */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-forge-500/5 rounded-full blur-[80px] pointer-events-none" />
          {activeTab === 'profile' && (
            <div className="space-y-6 relative z-10">
              <h2 className="font-semibold text-[var(--text-primary)] text-lg">Profile Information</h2>

              <div className="flex items-center gap-4 pb-6 border-b border-[var(--border-subtle)]">
                <div className="w-16 h-16 rounded-full bg-forge-gradient shadow-glow-sm flex items-center justify-center text-xl font-bold text-white">
                  {clerkUser?.firstName?.charAt(0) ?? 'U'}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{clerkUser?.fullName ?? '—'}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{clerkUser?.primaryEmailAddress?.emailAddress ?? '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-forge-500 transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Department</label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-forge-500 transition-all"
                    placeholder="e.g. Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)]">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-forge-gradient text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-glow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-6 relative z-10">
              <h2 className="font-semibold text-[var(--text-primary)] text-lg">App Installation & Offline</h2>
              
              <div className="bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-forge-500/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-forge-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] text-sm">Installation Status</p>
                      <p className="text-xs text-[var(--text-muted)]">Run ForgeMind natively on your device.</p>
                    </div>
                  </div>
                  {isInstalled ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-400/20">
                      <CheckCircle className="w-4 h-4" /> Installed
                    </div>
                  ) : (
                    <div className="text-[var(--text-secondary)] text-sm font-medium bg-[var(--bg-glass-hover)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                      Not Installed
                    </div>
                  )}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mb-4">
                  ForgeMind AI is built as a Progressive Web App (PWA). You can install it on your device to enable quick launching, offline capabilities, and enhanced performance.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <RefreshCw className="w-4 h-4 text-blue-400" />
                    <p className="font-semibold text-[var(--text-primary)] text-sm">Check Updates</p>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-4">Manually check if there is a newer version of the application available.</p>
                  <button 
                    onClick={updateApp}
                    className="w-full py-2 bg-[var(--bg-glass-hover)] hover:bg-forge-500/10 border border-[var(--border-subtle)] hover:border-forge-500/30 text-[var(--text-primary)] text-sm font-medium rounded-lg transition-all"
                  >
                    Check for Updates
                  </button>
                </div>

                <div className="bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl p-5 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <p className="font-semibold text-[var(--text-primary)] text-sm">Clear Local Cache</p>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-4">Clear all cached files, documents, and offline data to free up space.</p>
                  <button 
                    onClick={clearCache}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-all"
                  >
                    Clear Offline Cache
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 relative z-10">
              <h2 className="font-semibold text-[var(--text-primary)] text-lg">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Email Alerts</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Receive email notifications for important system events.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.email} onChange={(e) => setNotifications({ email: e.target.checked })} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forge-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Push Notifications</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Receive native push notifications on this device.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.push} onChange={(e) => setNotifications({ push: e.target.checked })} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forge-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Weekly Report</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">A weekly digest of your AI workspace usage.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.weeklyReport} onChange={(e) => setNotifications({ weeklyReport: e.target.checked })} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forge-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8 relative z-10">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)] text-lg mb-4">Theme Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={() => setTheme('light')} className={cn("p-4 rounded-xl border flex flex-col items-center gap-3 transition-all", theme === 'light' ? "border-forge-500 bg-forge-500/10 shadow-glow-sm" : "border-[var(--border-subtle)] bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)]")}>
                    <div className="p-3 bg-white text-forge-500 rounded-full shadow-sm"><Sun className="w-6 h-6" /></div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Light</span>
                  </button>
                  <button onClick={() => setTheme('dark')} className={cn("p-4 rounded-xl border flex flex-col items-center gap-3 transition-all", theme === 'dark' ? "border-forge-500 bg-forge-500/10 shadow-glow-sm" : "border-[var(--border-subtle)] bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)]")}>
                    <div className="p-3 bg-slate-900 text-forge-400 rounded-full shadow-sm border border-slate-700"><Moon className="w-6 h-6" /></div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Dark</span>
                  </button>
                  <button onClick={() => setTheme('system')} className={cn("p-4 rounded-xl border flex flex-col items-center gap-3 transition-all", theme === 'system' ? "border-forge-500 bg-forge-500/10 shadow-glow-sm" : "border-[var(--border-subtle)] bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)]")}>
                    <div className="p-3 bg-gradient-to-tr from-slate-200 to-slate-800 text-slate-100 rounded-full shadow-sm border border-slate-600"><Monitor className="w-6 h-6" /></div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">System</span>
                  </button>
                </div>
              </div>

              <div>
                <h2 className="font-semibold text-[var(--text-primary)] text-lg mb-4">Advanced UI Features</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Demo Workspace</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Enables simulated data on the dashboard for presentations.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={workspaceMode === 'demo'} onChange={(e) => setWorkspaceMode(e.target.checked ? 'demo' : 'live')} />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                  
                  {workspaceMode === 'demo' && (
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Reset Demo Data</h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Clear all simulated uploads and chat history.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          resetDemoWorkspace()
                          setTourState({ isActive: true, currentStep: 0, hasSeenTour: false })
                        }}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-all"
                      >
                        Reset Workspace
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Developer Mode</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Exposes advanced telemetry and retrieval statistics in chat.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={developerMode} onChange={(e) => setDeveloperMode(e.target.checked)} disabled={workspaceMode === 'demo'} />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 opacity-disabled"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 relative z-10 flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-glass-hover)] border border-[var(--border-subtle)] flex items-center justify-center mb-2 shadow-glow-sm">
                <ShieldCheck className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="font-semibold text-[var(--text-primary)] text-xl">Account Security</h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-4">
                Your authentication is securely managed by Clerk. Passwords, Multi-Factor Authentication (MFA), and active sessions can be managed in your Clerk profile.
              </p>
              <button 
                onClick={() => document.querySelector('.cl-userButtonTrigger')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                className="px-6 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] hover:bg-[var(--bg-glass-hover)] hover:border-[var(--border-strong)] text-[var(--text-primary)] font-semibold text-sm rounded-xl transition-all"
              >
                Open Security Profile
              </button>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="space-y-6 relative z-10">
              <h2 className="font-semibold text-[var(--text-primary)] text-lg">Organization Details</h2>
              
              {organization ? (
                <div className="bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    {organization.imageUrl ? (
                      <img src={organization.imageUrl} alt={organization.name} className="w-16 h-16 rounded-xl border border-[var(--border-subtle)] shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[var(--bg-glass-hover)] border border-[var(--border-subtle)] flex items-center justify-center shadow-sm">
                        <Building className="w-8 h-8 text-[var(--text-secondary)]" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">{organization.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Enterprise Plan</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--border-subtle)]">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-1">Members</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{organization.membersCount ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-1">Organization ID</p>
                      <p className="text-sm font-mono text-[var(--text-secondary)]">{organization.id}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-glass)] p-8">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-glass-hover)] flex items-center justify-center mb-4">
                    <Building className="w-6 h-6 text-[var(--text-muted)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No Active Organization</h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">You are currently using a personal workspace. Create or join an organization to collaborate with your team.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
