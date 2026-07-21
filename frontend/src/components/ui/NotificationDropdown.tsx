import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, MessageSquare, FileText, AlertTriangle, XCircle, Settings, ShieldCheck, GitMerge, Loader2, Info } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import { useNotificationStore, Notification } from '@/store/notificationStore'
import { formatDistanceToNow } from 'date-fns'

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { getToken, isSignedIn } = useAuth()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    fetchNotifications, 
    markAllAsRead, 
    markAsRead, 
    connectSSE, 
    disconnectSSE 
  } = useNotificationStore()

  // Connect to SSE when signed in
  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (isSignedIn) {
        const token = await getToken()
        if (token && mounted) {
          fetchNotifications(token)
          connectSSE(getToken)
        }
      }
    }
    init()
    
    return () => {
      mounted = false
      disconnectSSE()
    }
  }, [isSignedIn, getToken])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    const token = await getToken()
    if (token) {
      await markAllAsRead(token)
    }
  }

  const handleMarkRead = async (id: string, is_read: boolean) => {
    if (is_read) return
    const token = await getToken()
    if (token) {
      await markAsRead(id, token)
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'error': return <XCircle className="w-4 h-4" />
      case 'system': return <Settings className="w-4 h-4" />
      case 'ai': return <MessageSquare className="w-4 h-4" />
      case 'security': return <ShieldCheck className="w-4 h-4" />
      case 'workflow': return <GitMerge className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getColorForType = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 border-green-400/20 bg-green-400/10'
      case 'warning': return 'text-amber-400 border-amber-400/20 bg-amber-400/10'
      case 'error': return 'text-red-400 border-red-400/20 bg-red-400/10'
      case 'system': return 'text-[var(--text-secondary)] border-[var(--border-subtle)] bg-[var(--bg-glass)]'
      case 'ai': return 'text-forge-400 border-forge-500/20 bg-forge-500/10'
      case 'security': return 'text-purple-400 border-purple-400/20 bg-purple-400/10'
      case 'workflow': return 'text-blue-400 border-blue-400/20 bg-blue-400/10'
      default: return 'text-gray-400 border-gray-400/20 bg-gray-400/10'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full liquid-glass text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all relative"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-80 liquid-glass rounded-xl border border-[var(--border-subtle)] shadow-glass-xl overflow-hidden z-50 flex flex-col max-h-96"
          >
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)]">
              <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
                Notifications
                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-[var(--text-muted)]" />}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs text-forge-400 hover:text-forge-300 transition-colors font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--text-muted)] flex flex-col items-center gap-2">
                  <Bell className="w-8 h-8 opacity-20" />
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => handleMarkRead(notif.id, notif.is_read)}
                      className={`p-3 rounded-lg flex gap-3 transition-colors cursor-pointer ${!notif.is_read ? 'bg-[var(--bg-glass-hover)]' : 'hover:bg-[var(--bg-glass-hover)]'}`}
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${getColorForType(notif.type)}`}>
                        {getIconForType(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium truncate ${!notif.is_read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap mt-0.5">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-forge-500 mt-1.5 flex-shrink-0 shadow-glow-sm" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-glass)] text-center">
              <button className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
