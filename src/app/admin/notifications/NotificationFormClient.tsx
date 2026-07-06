'use client'

import { useState, useEffect, useRef } from 'react'
import { Profile } from '@/types'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function NotificationFormClient({ users: initialUsers }: { users: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>(initialUsers)
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const q = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (u) =>
            u.full_name?.toLowerCase().includes(q) ||
            u.id.toLowerCase().includes(q) ||
            u.phone_number?.includes(q)
        )
      )
    }
  }, [searchQuery, users])

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('يرجى ملء العنوان والرسالة')
      return
    }
    setSending(true)

    if (targetType === 'all') {
      const { error } = await supabase.from('notifications').insert({
        user_id: null,
        title: title.trim(),
        message: message.trim(),
        type: 'Admin_Announcement',
      })
      if (error) toast.error('حدث خطأ أثناء الإرسال')
      else {
        toast.success('تم إرسال الإشعار لجميع المستخدمين')
        setTitle('')
        setMessage('')
      }
    } else {
      if (!selectedUser) {
        toast.error('يرجى اختيار المستخدم')
        setSending(false)
        return
      }
      const { error } = await supabase.from('notifications').insert({
        user_id: selectedUser.id,
        title: title.trim(),
        message: message.trim(),
        type: 'Admin_Announcement',
      })
      if (error) toast.error('حدث خطأ أثناء الإرسال')
      else {
        toast.success(`تم إرسال الإشعار لـ ${selectedUser.full_name || 'المستخدم'}`)
        setTitle('')
        setMessage('')
        setSelectedUser(null)
        setSearchQuery('')
      }
    }
    setSending(false)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">إرسال إشعار</h1>
        <p className="text-white/30 text-sm mt-1">بث إعلان أو إشعار للعملاء</p>
      </div>

      <div className="glass p-6 space-y-5 !overflow-visible">
        <div>
          <label className="text-white/40 text-xs mb-2 block">الجهة المستقبلة</label>
          <div className="flex gap-3">
            <button
              onClick={() => { setTargetType('all'); setSelectedUser(null) }}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                targetType === 'all'
                  ? 'bg-gold text-base shadow-[0_0_16px_rgba(201,169,110,0.15)]'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]'
              }`}
            >
              جميع المستخدمين
            </button>
            <button
              onClick={() => setTargetType('specific')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                targetType === 'specific'
                  ? 'bg-gold text-base shadow-[0_0_16px_rgba(201,169,110,0.15)]'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]'
              }`}
            >
              مستخدم محدد
            </button>
          </div>
        </div>

        {targetType === 'specific' && (
          <div className="relative z-30" ref={dropdownRef}>
            <label className="text-white/40 text-xs mb-1.5 block">اختر المستخدم</label>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="input-dark cursor-pointer flex items-center justify-between"
            >
              {selectedUser ? (
                <span className="text-white truncate">{selectedUser.full_name || 'بدون اسم'} ({selectedUser.phone_number || selectedUser.id.slice(0, 8)})</span>
              ) : (
                <span className="text-white/30">اضغط هنا لاختيار مستخدم...</span>
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`text-white/40 flex-shrink-0 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0c0c12]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/50 max-h-72 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-white/[0.06] flex-shrink-0">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold/40 transition-all"
                    placeholder="ابحث بالاسم أو رقم الجوال..."
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto flex-1">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u)
                          setShowDropdown(false)
                          setSearchQuery('')
                        }}
                        className={`w-full text-right px-4 py-3.5 text-sm transition-all hover:bg-white/[0.06] flex items-center justify-between border-b border-white/[0.03] last:border-0 ${
                          selectedUser?.id === u.id ? 'bg-gold/[0.08] text-gold' : 'text-white/70'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-sm">{u.full_name || 'بدون اسم'}</p>
                          <p className="text-[11px] text-white/30 mt-0.5">{u.phone_number || 'بدون رقم'}</p>
                        </div>
                        <span className="text-[10px] text-white/20 font-mono bg-white/[0.04] px-2 py-1 rounded-md">{u.id.slice(0, 8)}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-white/30 text-sm">لا توجد نتائج مطابقة</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="text-white/40 text-xs mb-1.5 block">عنوان الإشعار</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-dark" placeholder="عنوان الإشعار" />
        </div>

        <div>
          <label className="text-white/40 text-xs mb-1.5 block">نص الرسالة</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input-dark min-h-[120px] resize-none" placeholder="اكتب رسالتك هنا..." />
        </div>

        <button onClick={handleSend} disabled={sending} className="btn-gold w-full !py-3.5 disabled:opacity-40">
          {sending ? (
            <span className="inline-block w-5 h-5 border-2 border-base/30 border-t-base rounded-full animate-spin" />
          ) : (
            <span className="inline-flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              إرسال الإشعار
            </span>
          )}
        </button>
      </div>
    </div>
  )
}