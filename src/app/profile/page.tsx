'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationContext'
import { supabase } from '@/lib/supabase'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  Order,
  Product,
  Notification,
} from '@/types'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone_number || '')
  const [address, setAddress] = useState(profile?.shipping_address || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [orders, setOrders] = useState<(Order & { product?: Product })[]>([])
  const [loading, setLoading] = useState(false)

  const [activeTab, setActiveTab] = useState<
    'orders' | 'notifications'
  >('orders')

  const [isProfileModalOpen, setIsProfileModalOpen] =
    useState(false)

  /* =========================
     ORDERS
  ========================= */

  const loadOrders = async () => {
    if (!user) return

    setLoading(true)

    try {
      const { data: userOrders, error: userError } =
        await supabase
          .from('orders')
          .select('*, product:products(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

      if (userError) throw userError

      setOrders(userOrders || [])
    } catch (err) {
      console.error('Fetch orders error:', err)
      toast.error('حدث خطأ أثناء تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (user) {
      const guestId = localStorage.getItem('guest_id')

      if (guestId) {
        fetch('/api/link-orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            guestId: guestId,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              toast.success(
                'تم ربط طلباتك السابقة بحسابك!'
              )

              localStorage.removeItem('guest_id')
              loadOrders()
            }
          })
          .catch((err) =>
            console.error('Link API error:', err)
          )
      } else {
        loadOrders()
      }
    }
  }, [user])

  /* =========================
     TABS
  ========================= */

  const handleTabChange = (
    tab: 'orders' | 'notifications'
  ) => {
    setActiveTab(tab)

    if (tab === 'orders') {
      loadOrders()
    }
  }

  /* =========================
     SAVE PROFILE
  ========================= */

  const handleSaveProfile = async () => {
    if (!user) return

    setSavingProfile(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone_number: phone,
        shipping_address: address,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('حدث خطأ أثناء الحفظ')
    } else {
      toast.success('تم حفظ البيانات بنجاح')
      refreshProfile()
      setIsProfileModalOpen(false)
    }

    setSavingProfile(false)
  }

  /* =========================
     AVATAR
  ========================= */

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file || !user) return

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } =
      await supabase.storage
        .from('avatars')
        .upload(path, file, {
          upsert: true,
        })

    if (uploadError) {
      toast.error('حدث خطأ أثناء رفع الصورة')
      return
    }

    const { data: urlData } =
      supabase.storage
        .from('avatars')
        .getPublicUrl(path)

    const { error: updateError } =
      await supabase
        .from('profiles')
        .update({
          avatar_url: urlData.publicUrl,
        })
        .eq('id', user.id)

    if (updateError) {
      toast.error('حدث خطأ أثناء تحديث الصورة')
    } else {
      toast.success('تم تحديث الصورة')
      refreshProfile()
    }
  }

  const tabs = [
    {
      key: 'orders' as const,
      label: 'طلباتي',
    },
    {
      key: 'notifications' as const,
      label: `الإشعارات${
        unreadCount > 0
          ? ` (${unreadCount})`
          : ''
      }`,
    },
  ]

  return (
    <div
      dir="rtl"
      className="min-h-screen px-4 py-10 sm:px-6 lg:px-8"
      style={{
        background: '#F5F2ED',
        fontFamily: 'Tajawal, sans-serif',
      }}
    >
      <div className="mx-auto max-w-4xl">

{/* =========================
    PROFILE HEADER
========================= */}

<div
  dir="ltr"
  className="mb-8 flex items-center justify-between"
>

  {/* Profile — Left */}
  <div className="flex items-center gap-4">

    {/* Avatar */}
    <div className="relative">

      {profile?.avatar_url ? (
        <Image
          src={profile.avatar_url}
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 rounded-2xl object-cover"
          style={{
            border: '1px solid #D8D0C5',
          }}
        />
      ) : (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: 'rgba(180,154,104,0.08)',
            border: '1px solid rgba(180,154,104,0.35)',
          }}
        >
          <span
            className="text-xl font-bold"
            style={{
              color: '#B49A68',
              fontFamily: 'Amiri, serif',
            }}
          >
            {profile?.full_name?.charAt(0) || 'م'}
          </span>
        </div>
      )}

      {/* Upload */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-300 hover:-translate-y-0.5"
        style={{
          background: '#292A28',
          color: '#F7F5F1',
          boxShadow: '0 4px 12px rgba(41,42,40,.12)',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
    </div>


    {/* Name + Email */}
    <div className="text-left">

      <h1
        className="text-xl font-semibold sm:text-2xl"
        style={{
          color: '#292A28',
          fontFamily: 'Tajawal, sans-serif',
        }}
      >
        {profile?.full_name || 'مستخدم'}
      </h1>

      <p
        className="mt-1 text-xs sm:text-sm"
        style={{
          color: '#9B9388',
          direction: 'ltr',
        }}
      >
        {user?.email}
      </p>

    </div>

  </div>


  {/* Settings — Right */}
  <button
    onClick={() => setIsProfileModalOpen(true)}
    className="rounded-full p-2 transition-all duration-300 hover:bg-black/[0.035]"
    style={{
      color: '#91897E',
    }}
    title="Edit Profile"
    aria-label="Edit Profile"
  >
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />

      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </button>

</div>

        {/* =========================
            TABS
        ========================= */}

        <div
          className="mb-8 flex gap-2 overflow-x-auto pb-1"
        >
          {tabs.map((tab) => {
            const active =
              activeTab === tab.key

            return (
              <button
                key={tab.key}
                onClick={() =>
                  handleTabChange(tab.key)
                }
                className="flex-shrink-0 rounded-full px-5 py-2.5 text-xs font-medium transition-all duration-300"
                style={{
                  background: active
                    ? '#292A28'
                    : 'rgba(255,255,255,0.38)',

                  color: active
                    ? '#F7F5F1'
                    : '#777168',

                  border: active
                    ? '1px solid #292A28'
                    : '1px solid #D8D0C5',

                  boxShadow: active
                    ? '0 5px 18px rgba(41,42,40,.08)'
                    : 'none',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* =========================
            ORDERS
        ========================= */}

        {activeTab === 'orders' && (
          <div className="space-y-4">

            {loading ? (
              <div
                className="rounded-2xl p-16 text-center"
                style={{
                  background: '#FAF8F4',
                  border:
                    '1px solid #D8D0C5',
                }}
              >
                <span
                  className="inline-block h-6 w-6 animate-spin rounded-full border-2"
                  style={{
                    borderColor:
                      'rgba(180,154,104,.25)',
                    borderTopColor:
                      '#B49A68',
                  }}
                />
              </div>
            ) : orders.length === 0 ? (
              <div
                className="rounded-2xl p-16 text-center"
                style={{
                  background: '#FAF8F4',
                  border:
                    '1px solid #D8D0C5',
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: '#A39B91',
                  }}
                >
                  لا توجد طلبات بعد
                </p>
              </div>
            ) : (
              (() => {
                const groupedOrders =
                  orders.reduce(
                    (acc, order) => {
                      const id =
                        order.group_id ||
                        order.id

                      if (!acc[id]) {
                        acc[id] = {
                          ...order,
                          items: [order],
                        }
                      } else {
                        acc[id].items.push(order)
                      }

                      return acc
                    },
                    {} as Record<
                      string,
                      Order & {
                        items: Order[]
                      }
                    >
                  )

                return Object.values(
                  groupedOrders
                ).map((group) => (
                  <div
                    key={
                      group.group_id ||
                      group.id
                    }
                    className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: '#FAF8F4',
                      border:
                        '1px solid #D8D0C5',
                      boxShadow:
                        '0 8px 30px rgba(41,42,40,.035)',
                    }}
                  >

                    <div
                      className="mb-4 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center"
                      style={{
                        borderColor:
                          '#E4DED6',
                      }}
                    >
                      <div>
                        <p
                          className="mb-1 font-mono text-[10px]"
                          style={{
                            color: '#A39B91',
                          }}
                        >
                          طلب #
                          {(
                            group.group_id ||
                            group.id
                          ).slice(0, 8)}
                        </p>

                        <p
                          className="text-xs"
                          style={{
                            color: '#9B9388',
                          }}
                        >
                          {new Date(
                            group.created_at
                          ).toLocaleDateString(
                            'ar-EG',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">

                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-medium border ${STATUS_COLORS[group.status as keyof typeof STATUS_COLORS]}`}
                        >
                          {STATUS_LABELS[
                            group.status as keyof typeof STATUS_LABELS
                          ]}
                        </span>

                        <span
                          className="whitespace-nowrap text-sm font-bold"
                          style={{
                            color: '#9A8255',
                          }}
                        >
                          {group.items.reduce(
                            (sum, i) =>
                              sum +
                              i.total_price,
                            0
                          )}{' '}
                          LE
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">

                      {group.items.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4"
                          >

                            {item.product
                              ?.images &&
                              item.product
                                .images
                                .length >
                                0 && (
                                <Image
                                  src={
                                    item
                                      .product
                                      .images[0]
                                  }
                                  alt=""
                                  width={48}
                                  height={48}
                                  className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
                                />
                              )}

                            <div className="min-w-0 flex-1">

                              <p
                                className="text-sm font-medium"
                                style={{
                                  color:
                                    '#292A28',
                                }}
                              >
                                {item.product
                                  ?.title ||
                                  'منتج محذوف'}
                              </p>

                              <p
                                className="mt-0.5 text-xs"
                                style={{
                                  color:
                                    '#9B9388',
                                }}
                              >
                                الكمية:{' '}
                                {item.quantity}

                                {item.size && (
                                  <span>
                                    {' '}
                                    · المقاس:{' '}
                                    <span
                                      style={{
                                        color:
                                          '#B49A68',
                                      }}
                                    >
                                      {item.size}
                                    </span>
                                  </span>
                                )}
                              </p>
                            </div>

                            <span
                              className="whitespace-nowrap text-sm font-bold"
                              style={{
                                color:
                                  '#9A8255',
                              }}
                            >
                              {item.total_price}{' '}
                              LE
                            </span>

                          </div>
                        )
                      )}

                    </div>
                  </div>
                ))
              })()
            )}

          </div>
        )}

        {/* =========================
            NOTIFICATIONS
        ========================= */}

        {activeTab === 'notifications' && (
          <div>

            {notifications.length > 0 && (
              <div className="mb-4 flex justify-start">
                <button
                  onClick={markAllAsRead}
                  className="text-xs transition-colors duration-300 hover:opacity-70"
                  style={{
                    color: '#9A8255',
                  }}
                >
                  تحديد الكل كمقروء
                </button>
              </div>
            )}

            <div className="space-y-2">

              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() =>
                      markAsRead(n.id)
                    }
                    className="w-full rounded-2xl p-5 text-right transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: n.is_read
                        ? '#FAF8F4'
                        : 'rgba(180,154,104,.055)',

                      border: n.is_read
                        ? '1px solid #D8D0C5'
                        : '1px solid rgba(180,154,104,.28)',

                      boxShadow:
                        '0 6px 24px rgba(41,42,40,.025)',
                    }}
                  >

                    <div className="flex items-start gap-3">

                      {!n.is_read && (
                        <span
                          className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                          style={{
                            background:
                              '#B49A68',
                          }}
                        />
                      )}

                      <div
                        className={
                          !n.is_read
                            ? ''
                            : 'mr-5'
                        }
                      >

                        <div className="mb-1 flex items-center gap-2">

                          <p
                            className="text-sm font-semibold"
                            style={{
                              color:
                                '#292A28',
                            }}
                          >
                            {n.title}
                          </p>

                          <span
                            className="rounded-full px-2 py-0.5 text-[10px]"
                            style={{
                              color:
                                '#9B9388',
                              background:
                                '#F0ECE6',
                            }}
                          >
                            {n.type ===
                            'Order_Update'
                              ? 'طلب'
                              : 'إعلان'}
                          </span>

                        </div>

                        <p
                          className="text-sm leading-relaxed"
                          style={{
                            color: '#777168',
                          }}
                        >
                          {n.message}
                        </p>

                        <p
                          className="mt-2 text-[11px]"
                          style={{
                            color: '#A39B91',
                          }}
                        >
                          {new Date(
                            n.created_at
                          ).toLocaleDateString(
                            'ar-EG',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>

                      </div>
                    </div>

                  </button>
                ))
              ) : (
                <div
                  className="rounded-2xl p-16 text-center"
                  style={{
                    background: '#FAF8F4',
                    border:
                      '1px solid #D8D0C5',
                  }}
                >
                  <p
                    className="text-sm"
                    style={{
                      color: '#A39B91',
                    }}
                  >
                    لا توجد إشعارات
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* =========================
          PROFILE MODAL
      ========================= */}

      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background:
              'rgba(41,42,40,.42)',
            backdropFilter:
              'blur(10px)',
          }}
        >

          <div
            className="relative w-full max-w-md rounded-2xl p-6 sm:p-8"
            style={{
              background: '#FAF8F4',
              border:
                '1px solid #D8D0C5',
              boxShadow:
                '0 30px 80px rgba(41,42,40,.18)',
            }}
          >

            {/* Close */}

            <button
              onClick={() =>
                setIsProfileModalOpen(false)
              }
              className="absolute left-4 top-4 rounded-full p-1 transition-colors duration-300 hover:bg-black/[0.04]"
              style={{
                color: '#9B9388',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h2
              className="mb-7 text-center text-2xl font-bold"
              style={{
                color: '#292A28',
                fontFamily:
                  'Amiri, serif',
              }}
            >
              البيانات الشخصية
            </h2>

            <div className="space-y-5">

              {/* Name */}

              <div>
                <label
                  className="mb-1.5 block text-xs"
                  style={{
                    color: '#777168',
                  }}
                >
                  الاسم الكامل
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#B49A68]"
                  style={{
                    background: '#F5F2ED',
                    border:
                      '1px solid #D8D0C5',
                    color: '#292A28',
                  }}
                />
              </div>

              {/* Phone */}

              <div>
                <label
                  className="mb-1.5 block text-xs"
                  style={{
                    color: '#777168',
                  }}
                >
                  رقم الجوال
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#B49A68]"
                  style={{
                    background: '#F5F2ED',
                    border:
                      '1px solid #D8D0C5',
                    color: '#292A28',
                  }}
                  placeholder="05xxxxxxxx"
                />
              </div>

              {/* Address */}

              <div>
                <label
                  className="mb-1.5 block text-xs"
                  style={{
                    color: '#777168',
                  }}
                >
                  عنوان الشحن الافتراضي
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  className="min-h-[90px] w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#B49A68]"
                  style={{
                    background: '#F5F2ED',
                    border:
                      '1px solid #D8D0C5',
                    color: '#292A28',
                  }}
                  placeholder="المدينة، الحي، الشارع"
                />
              </div>

              {/* Save */}

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-40"
                style={{
                  background: '#292A28',
                  color: '#F7F5F1',
                  boxShadow:
                    '0 8px 20px rgba(41,42,40,.10)',
                }}
              >
                {savingProfile ? (
                  <span
                    className="inline-block h-5 w-5 animate-spin rounded-full border-2"
                    style={{
                      borderColor:
                        'rgba(247,245,241,.25)',
                      borderTopColor:
                        '#F7F5F1',
                    }}
                  />
                ) : (
                  'حفظ التغييرات'
                )}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}