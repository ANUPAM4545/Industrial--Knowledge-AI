import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { path: '/admin/users',     icon: Users,           label: 'Users'    },
  { path: '/admin/security',  icon: ShieldCheck,     label: 'Security Center' },
  { path: '/admin/settings',  icon: Settings,        label: 'Settings' },
]

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-[#0a0d1a] overflow-hidden">
      <aside className="w-64 flex flex-col bg-[#0f1327] border-r border-amber-500/10">
        {/* Logo */}
        <div className="flex items-center gap-2 p-4 border-b border-amber-500/10 h-16">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">NEXO</span>
            <p className="text-xs text-amber-400">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {adminNavItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                    : 'text-slate-400 hover:text-amber-400 hover:bg-amber-400/5'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
