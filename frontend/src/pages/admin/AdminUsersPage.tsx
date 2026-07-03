import { Search, UserPlus } from 'lucide-react'

export function AdminUsersPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage platform users and their roles</p>
        </div>
        <button id="invite-user-btn" className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" id="user-search" placeholder="Search users..." className="input-field pl-10" />
        </div>
        <select id="role-filter" className="input-field w-40">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="engineer">Engineer</option>
          <option value="manager">Manager</option>
          <option value="operator">Operator</option>
        </select>
      </div>

      {/* User Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">User</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Role</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Joined</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center py-16 text-slate-500 text-sm">
                No users found — invite team members to get started
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
