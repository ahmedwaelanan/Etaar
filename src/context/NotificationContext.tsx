'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
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

const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined)

export function NotificationProvider({
  children,
}: {
  children: ReactNode
}) {
  const { user } = useAuth()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  /*
   * جلب الإشعارات:
   *
   * 1. الإشعارات الخاصة بالمستخدم
   * 2. الإشعارات العامة التي user_id فيها NULL
   */
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return
    }

    if (data) {
      setNotifications(data as Notification[])
      setUnreadCount(
        data.filter((notification) => !notification.is_read).length
      )
    }
  }, [user])

  /*
   * جلب الإشعارات عند تسجيل الدخول
   */
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  /*
   * Realtime
   *
   * مهم:
   * Supabase Realtime لا يسمح لنا هنا بعمل filter
   * بالشكل:
   *
   * user_id = user.id OR user_id IS NULL
   *
   * لذلك نستمع لكل INSERT في جدول notifications
   * ثم نحدد في الكود هل الإشعار يخص المستخدم أم أنه عام.
   */
  useEffect(() => {
    if (!user) return

    let channel: RealtimeChannel

    const setupChannel = () => {
      channel = supabase
        .channel(`notifications-realtime-${user.id}`)

        /*
         * INSERT
         */
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            const notification = payload.new as Notification

            /*
             * نقبل:
             *
             * user_id = المستخدم الحالي
             *
             * أو
             *
             * user_id = null
             *
             * يعني إشعار عام
             */
            if (
              notification.user_id !== null &&
              notification.user_id !== user.id
            ) {
              return
            }

            setNotifications((prev) => {
              /*
               * منع تكرار الإشعار إذا كان موجودًا بالفعل
               */
              if (prev.some((n) => n.id === notification.id)) {
                return prev
              }

              return [notification, ...prev]
            })

            setUnreadCount((prev) => prev + 1)
          }
        )

        /*
         * UPDATE
         */
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            const updated = payload.new as Notification

            /*
             * لو الإشعار ليس للمستخدم الحالي
             * وليس إشعارًا عامًا، نتجاهله.
             */
            if (
              updated.user_id !== null &&
              updated.user_id !== user.id
            ) {
              return
            }

            setNotifications((prev) => {
              const existing = prev.find(
                (notification) => notification.id === updated.id
              )

              /*
               * لو الإشعار غير موجود عند المستخدم
               * لا نضيفه من UPDATE.
               */
              if (!existing) {
                return prev
              }

              return prev.map((notification) =>
                notification.id === updated.id
                  ? updated
                  : notification
              )
            })

            /*
             * إعادة حساب unreadCount من الـ state
             * بدل التلاعب بالرقم مباشرة.
             */
            setNotifications((current) => {
              setUnreadCount(
                current.filter((notification) => !notification.is_read).length
              )

              return current
            })
          }
        )

        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Notifications realtime connected')
          }
        })
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  /*
   * تحديد إشعار كمقروء
   */
  const markAsRead = async (id: string) => {
    if (!user) return

    const notification = notifications.find(
      (item) => item.id === id
    )

    /*
     * لو الإشعار بالفعل مقروء
     * لا نعمل update مرة أخرى.
     */
    if (!notification || notification.is_read) {
      return
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
      return
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification
      )
    )

    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  /*
   * تحديد كل الإشعارات كمقروءة
   */
  const markAllAsRead = async () => {
    if (!user) return

    const unread = notifications.filter(
      (notification) => !notification.is_read
    )

    if (unread.length === 0) return

    const ids = unread.map((notification) => notification.id)

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids)

    if (error) {
      console.error(
        'Error marking all notifications as read:',
        error
      )
      return
    }

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    )

    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)

  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }

  return context
}