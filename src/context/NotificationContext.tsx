'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Notification } from '@/types'
import { useAuth } from './AuthContext'
import { RealtimeChannel } from '@supabase/supabase-js'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!user) return
    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev])
            setUnreadCount((prev) => prev + 1)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: 'user_id=is.null',
          },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev])
            setUnreadCount((prev) => prev + 1)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
            )
            setUnreadCount((prev) => {
              const updated = payload.new as Notification
              if (updated.is_read && !prev) return prev
              const before = notifications.find((n) => n.id === updated.id)
              if (before && !before.is_read && updated.is_read) return prev - 1
              return prev
            })
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [user])

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    if (!user) return
    const unread = notifications.filter((n) => !n.is_read)
    if (unread.length === 0) return
    const ids = unread.map((n) => n.id)
    await supabase.from('notifications').update({ is_read: true }).in('id', ids)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications: fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) throw new Error('useNotifications must be used within a NotificationProvider')
  return context
}