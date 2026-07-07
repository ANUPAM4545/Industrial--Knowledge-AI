import { useState } from 'react'
import { Search, UserPlus, Shield, User, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { apiClient } from '@/services/apiClient'
import { format } from 'date-fns'
import { useToastStore } from '@/store/toastStore'

interface DBUser {
  id: string
  clerk_user_id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export function AdminUsersPage() {
  const { getToken } = useAuth()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Fetch Users
  const { data: users = [], isLoading } = useQuery<DBUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const token = await getToken()
      const res = await apiClient.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    }
  })

  // Mutate Role
  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      const token = await getToken()
      return apiClient.patch(`/admin/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    },
    onSuccess: () => {
      addToast("User role updated", "success")
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => {
      addToast("Failed to update role", "error")
    }
  })

  // Mutate Status
  const statusMutation = useMutation({
    mutationFn: async ({ userId, is_active }: { userId: string, is_active: boolean }) => {
      const token = await getToken()
      return apiClient.patch(`/admin/users/${userId}/status`, { is_active }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    },
    onSuccess: () => {
      addToast("User status updated", "success")
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => {
      addToast("Failed to update status", "error")
    }
  })

  const handleInviteUser = () => {
    // We mock this since Clerk normally handles invites in the B2B dashboard
    setShowInviteModal(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter ? user.role === roleFilter : true
    return matchesSearch && matchesRole
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage platform users and their roles</p>
        </div>
        <button id="invite-user-btn" className="btn-primary" onClick={handleInviteUser}>
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            id="user-search" 
            placeholder="Search users..." 
            className="input-field pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          id="role-filter" 
          className="input-field w-40"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="engineer">Engineer</option>
          <option value="manager">Manager</option>
          <option value="operator">Operator</option>
        </select>
      </div>

      {/* User Table */}
      <div className="glass-card overflow-visible">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Role</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Joined</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-slate-500 text-sm">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-slate-500 text-sm border-t border-white/5">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-forge-500/20 text-forge-400 flex items-center justify-center font-bold text-xs">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{user.full_name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-transparent border border-white/10 rounded-md text-xs text-slate-300 px-2 py-1 focus:outline-none focus:border-amber-500"
                      value={user.role}
                      onChange={(e) => roleMutation.mutate({ userId: user.id, role: e.target.value })}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="engineer">Engineer</option>
                      <option value="operator">Operator</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.is_active ? (
                       <button 
                        onClick={() => statusMutation.mutate({ userId: user.id, is_active: false })}
                        className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button 
                        onClick={() => statusMutation.mutate({ userId: user.id, is_active: true })}
                        className="text-xs text-green-400 hover:text-green-300 font-medium px-3 py-1.5 rounded-md hover:bg-green-500/10 transition-colors"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal Mock */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-forge-500/20 flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-forge-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Invite Team Member</h2>
            <p className="text-sm text-slate-400 mb-6">
              Invitations and SSO integrations are managed centrally via the Clerk Administrator Dashboard.
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowInviteModal(false)}>
                Cancel
              </button>
              <a 
                href="https://dashboard.clerk.com" 
                target="_blank" 
                rel="noreferrer" 
                className="btn-primary"
                onClick={() => setShowInviteModal(false)}
              >
                Open Clerk Dashboard
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
