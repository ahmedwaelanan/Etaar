'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationContext'
import { supabase } from '@/lib/supabase'
import { STATUS_LABELS, STATUS_COLORS, Order, Product, Notification } from '@/types'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone_number || '')
  const [address, setAddress] = useState(profile?.shipping_address || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [orders, setOrders] = useState<(Order & { product?: Product })[]>([])
  const [ordersLoaded, setOrdersLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'notifications'>('profile')

  const loadOrders = async () => {
    if (!user || ordersLoaded) return
    const { data } = await supabase
      .from('orders')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
    setOrdersLoaded(true)
  }

  const handleTabChange = (tab: 'profile' | 'orders' | 'notifications') => {
    setActiveTab(tab)
    if (tab === 'orders') loadOrders()
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone_number: phone, shipping_address: address })
      .eq('id', user.id)
    if (error) {
      toast.error('حدث خطأ أثناء الحفظ')
    } else {
      toast.success('تم حفظ البيانات بنجاح')
      refreshProfile()
    }
    setSavingProfile(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) {
      toast.error('حدث خطأ أثناء رفع الصورة')
      return
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)
    if (updateError) {
      toast.error('حدث خطأ أثناء تحديث الصورة')
    } else {
      toast.success('تم تحديث الصورة')
      refreshProfile()
    }
  }

  const tabs = [
    { key: 'profile' as const, label: 'البيانات الشخصية' },
    { key: 'orders' as const, label: 'طلباتي' },
    { key: 'notifications' as const, label: `الإشعارات${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" width={64} height={64} className="w-16 h-16 rounded-2xl object-cover border border-white/[0.08]" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
              <span className="text-gold font-bold text-xl">{profile?.full_name?.charAt(0) || 'م'}</span>
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -left-1 w-6 h-6 rounded-lg bg-gold flex items-center justify-center text-base shadow-lg"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{profile?.full_name || 'مستخدم'}</h1>
          <p className="text-white/30 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-gold text-base shadow-[0_0_20px_rgba(201,169,110,0.15)]'
                : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="glass p-6 sm:p-8 space-y-6 animate-fade-in">
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">الاسم الكامل</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-dark" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">رقم الجوال</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-dark" placeholder="05xxxxxxxx" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">عنوان الشحن الافتراضي</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input-dark min-h-[80px] resize-none" placeholder="المدينة، الحي، الشارع" />
          </div>
          <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-gold disabled:opacity-40">
            {savingProfile ? (
              <span className="inline-block w-5 h-5 border-2 border-base/30 border-t-base rounded-full animate-spin" />
            ) : (
              'حفظ التغييرات'
            )}
          </button>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in">
          {(() => {
            // تجميع الطلبات حسب الـ group_id
            const groupedOrders = orders.reduce((acc, order) => {
              const id = order.group_id || order.id
              if (!acc[id]) acc[id] = { ...order, items: [order] }
              else acc[id].items.push(order)
              return acc
            }, {} as Record<string, Order & { items: Order[] }>)

            return Object.values(groupedOrders).map((group) => (
              <div key={group.group_id || group.id} className="glass p-5 glass-hover">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <p className="text-white/20 text-[10px] font-mono mb-1">طلب #{(group.group_id || group.id).slice(0, 8)}</p>
                    <p className="text-white/30 text-xs">
                      {new Date(group.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-[11px] font-medium border ${STATUS_COLORS[group.status as keyof typeof STATUS_COLORS]}`}>
                      {STATUS_LABELS[group.status as keyof typeof STATUS_LABELS]}
                    </span>
                    <span className="text-gold font-bold text-sm whitespace-nowrap">{group.items.reduce((sum, i) => sum + i.total_price, 0)} LE</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {item.product?.images && item.product.images.length > 0 && (
                        <Image src={item.product.images[0]} alt="" width={48} height={48} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{item.product?.title || 'منتج محذوف'}</p>
                        <p className="text-white/30 text-xs mt-0.5">
                          الكمية: {item.quantity}
                          {item.size && <span> · المقاس: <span className="text-gold/60">{item.size}</span></span>}
                        </p>
                      </div>
                      <span className="text-gold font-bold text-sm whitespace-nowrap">{item.total_price} LE</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          })()}
          
          {orders.length === 0 && (
            <div className="glass p-16 text-center">
              <p className="text-white/30 text-sm">لا توجد طلبات بعد</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="animate-fade-in">
          {notifications.length > 0 && (
            <div className="flex justify-end mb-4">
              <button onClick={markAllAsRead} className="text-gold text-xs hover:underline">تحديد الكل كمقروء</button>
            </div>
          )}
          <div className="space-y-2">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`w-full text-right glass p-5 transition-all duration-200 hover:bg-white/[0.06] ${
                    !n.is_read ? 'border-gold/20 bg-gold/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!n.is_read && (
                      <span className="mt-1 w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                    )}
                    <div className={!n.is_read ? '' : 'mr-5'}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white text-sm font-semibold">{n.title}</p>
                        <span className="text-[10px] text-white/20 px-2 py-0.5 rounded-full bg-white/[0.04]">
                          {n.type === 'Order_Update' ? 'طلب' : 'إعلان'}
                        </span>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed">{n.message}</p>
                      <p className="text-white/20 text-[11px] mt-2">
                        {new Date(n.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="glass p-16 text-center">
                <p className="text-white/30 text-sm">لا توجد إشعارات</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}