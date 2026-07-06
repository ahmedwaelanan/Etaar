'use client'

import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '@/context/NotificationContext'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function NotificationBell() {
  const { user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all duration-300 focus:outline-none"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-[75px] mx-auto sm:max-w-sm lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2 lg:w-96 lg:mx-0 z-50 bg-[#0f131f]/90 border border-white/[0.1] backdrop-blur-xl gold-glow animate-fade-in rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-white/[0.03]">
            <h3 className="text-white font-semibold text-sm">الإشعارات</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-gold text-xs font-medium hover:underline focus:outline-none">
                تحديد الكل كمقروء
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto scrolling-touch">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-white/30 text-sm">لا توجد إشعارات حالياً</div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`w-full text-right p-4 border-b border-white/[0.04] transition-all duration-200 hover:bg-white/[0.04] flex items-start gap-3 focus:outline-none ${
                    !n.is_read ? 'bg-white/[0.02]' : 'bg-transparent'
                  }`}
                >
                  {!n.is_read && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-gold flex-shrink-0 shadow-[0_0_8px_rgba(218,165,32,0.6)]" />
                  )}
                  <div className={`flex-1 min-w-0 ${!n.is_read ? '' : 'mr-5'}`}>
                    <p className={`text-white text-sm break-words leading-snug ${!n.is_read ? 'font-semibold' : 'font-normal text-white/90'}`}>
                      {n.title}
                    </p>
                    <p className="text-white/60 text-xs mt-1.5 leading-relaxed break-words">
                      {n.message}
                    </p>
                    <p className="text-white/30 text-[10px] mt-2 tracking-wide">
                      {new Date(n.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 20 && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block p-3 text-center text-gold text-xs font-medium border-t border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            >
              عرض جميع الإشعارات
            </Link>
          )}
        </div>
      )}
    </div>
  )
}