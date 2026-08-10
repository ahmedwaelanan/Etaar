'use client'

import { useState, useEffect, useRef } from 'react'
import { Profile } from '@/types'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function NotificationFormClient({
  users: initialUsers,
}: {
  users: Profile[]
}) {
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [filteredUsers, setFilteredUsers] =
    useState<Profile[]>(initialUsers)

  const [targetType, setTargetType] =
    useState<'all' | 'specific'>('all')

  const [selectedUser, setSelectedUser] =
    useState<Profile | null>(null)

  const [searchQuery, setSearchQuery] =
    useState('')

  const [showDropdown, setShowDropdown] =
    useState(false)

  const [title, setTitle] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [sending, setSending] =
    useState(false)

  const dropdownRef = useRef<HTMLDivElement | null>(null)

  /* =====================================================
     CLICK OUTSIDE
  ====================================================== */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  /* =====================================================
     FILTER USERS
  ====================================================== */

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
      return
    }

    const q = searchQuery.toLowerCase()

    setFilteredUsers(
      users.filter(
        (u) =>
          u.full_name
            ?.toLowerCase()
            .includes(q) ||
          u.id
            .toLowerCase()
            .includes(q) ||
          u.phone_number?.includes(q)
      )
    )
  }, [searchQuery, users])

  /* =====================================================
     SEND NOTIFICATION
  ====================================================== */

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error(
        'يرجى ملء العنوان والرسالة'
      )
      return
    }

    setSending(true)

    /* =================================================
       SEND TO ALL
    ================================================== */

    if (targetType === 'all') {
      const { error } =
        await supabase
          .from('notifications')
          .insert({
            user_id: null,
            title: title.trim(),
            message: message.trim(),
            type: 'Admin_Announcement',
          })

      if (error) {
        toast.error(
          'حدث خطأ أثناء الإرسال'
        )
      } else {
        toast.success(
          'تم إرسال الإشعار لجميع المستخدمين'
        )

        setTitle('')
        setMessage('')
      }
    }

    /* =================================================
       SEND TO SPECIFIC USER
    ================================================== */

    else {
      if (!selectedUser) {
        toast.error(
          'يرجى اختيار المستخدم'
        )

        setSending(false)
        return
      }

      const { error } =
        await supabase
          .from('notifications')
          .insert({
            user_id: selectedUser.id,
            title: title.trim(),
            message: message.trim(),
            type: 'Admin_Announcement',
          })

      if (error) {
        toast.error(
          'حدث خطأ أثناء الإرسال'
        )
      } else {
        toast.success(
          `تم إرسال الإشعار لـ ${
            selectedUser.full_name ||
            'المستخدم'
          }`
        )

        setTitle('')
        setMessage('')
        setSelectedUser(null)
        setSearchQuery('')
      }
    }

    setSending(false)
  }

  return (
    <div
      className="w-full"
      dir="rtl"
    >
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="w-8 h-px"
            style={{
              background: '#B49A68',
            }}
          />

          <h1
            className="text-xl sm:text-2xl font-semibold"
            style={{
              color: '#292A28',
            }}
          >
            إرسال إشعار
          </h1>
        </div>

        <p
          className="text-xs sm:text-sm"
          style={{
            color: '#9A9288',
          }}
        >
          بث إعلان أو إشعار للعملاء
        </p>
      </div>

      {/* =====================================================
          FORM CARD
      ====================================================== */}

      <div
        className="
          p-5
          sm:p-6
          space-y-6
          overflow-visible
        "
        style={{
          background:
            'rgba(255,255,255,.42)',
          border:
            '1px solid rgba(41,42,40,.08)',
          boxShadow:
            '0 14px 35px rgba(41,42,40,.045)',
          backdropFilter:
            'blur(14px)',
          WebkitBackdropFilter:
            'blur(14px)',
        }}
      >
        {/* =================================================
            TARGET TYPE
        ================================================== */}

        <div>
          <label
            className="text-xs mb-2 block"
            style={{
              color: '#8B837A',
            }}
          >
            الجهة المستقبلة
          </label>

          <div className="flex gap-3">
            {/* ALL USERS */}

            <button
              type="button"
              onClick={() => {
                setTargetType('all')
                setSelectedUser(null)
                setShowDropdown(false)
              }}
              className="
                flex-1
                py-3
                rounded-xl
                text-sm
                font-medium
                transition-all
                duration-300
              "
              style={{
                background:
                  targetType === 'all'
                    ? '#292A28'
                    : 'rgba(41,42,40,.035)',

                color:
                  targetType === 'all'
                    ? '#F5F2ED'
                    : '#8B837A',

                border:
                  targetType === 'all'
                    ? '1px solid #292A28'
                    : '1px solid rgba(41,42,40,.08)',

                boxShadow:
                  targetType === 'all'
                    ? '0 8px 20px rgba(41,42,40,.08)'
                    : 'none',
              }}
            >
              جميع المستخدمين
            </button>

            {/* SPECIFIC USER */}

            <button
              type="button"
              onClick={() =>
                setTargetType('specific')
              }
              className="
                flex-1
                py-3
                rounded-xl
                text-sm
                font-medium
                transition-all
                duration-300
              "
              style={{
                background:
                  targetType === 'specific'
                    ? '#292A28'
                    : 'rgba(41,42,40,.035)',

                color:
                  targetType === 'specific'
                    ? '#F5F2ED'
                    : '#8B837A',

                border:
                  targetType === 'specific'
                    ? '1px solid #292A28'
                    : '1px solid rgba(41,42,40,.08)',

                boxShadow:
                  targetType === 'specific'
                    ? '0 8px 20px rgba(41,42,40,.08)'
                    : 'none',
              }}
            >
              مستخدم محدد
            </button>
          </div>
        </div>

        {/* =================================================
            SPECIFIC USER
        ================================================== */}

        {targetType === 'specific' && (
          <div
            className="relative z-30"
            ref={dropdownRef}
          >
            <label
              className="text-xs mb-1.5 block"
              style={{
                color: '#8B837A',
              }}
            >
              اختر المستخدم
            </label>

            {/* SELECT BOX */}

            <button
              type="button"
              onClick={() =>
                setShowDropdown(
                  !showDropdown
                )
              }
              className="
                w-full
                min-h-[48px]
                px-4
                py-3
                rounded-xl
                flex
                items-center
                justify-between
                gap-3
                text-right
                transition-all
                duration-300
                outline-none
              "
              style={{
                background:
                  'rgba(245,242,237,.72)',

                border:
                  showDropdown
                    ? '1px solid rgba(180,154,104,.55)'
                    : '1px solid rgba(41,42,40,.10)',

                boxShadow:
                  showDropdown
                    ? '0 0 0 3px rgba(180,154,104,.06)'
                    : 'none',

                color:
                  selectedUser
                    ? '#292A28'
                    : '#AAA198',
              }}
            >
              {selectedUser ? (
                <span className="truncate text-sm">
                  {selectedUser.full_name ||
                    'بدون اسم'}

                  {' '}

                  <span
                    style={{
                      color: '#9A9288',
                    }}
                  >
                    (
                    {selectedUser.phone_number ||
                      selectedUser.id.slice(
                        0,
                        8
                      )}
                    )
                  </span>
                </span>
              ) : (
                <span className="text-sm">
                  اضغط هنا لاختيار مستخدم...
                </span>
              )}

              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`
                  flex-shrink-0
                  transition-transform
                  duration-200
                  ${
                    showDropdown
                      ? 'rotate-180'
                      : ''
                  }
                `}
                style={{
                  color: '#8B837A',
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* DROPDOWN */}

            {showDropdown && (
              <div
                className="
                  absolute
                  top-full
                  left-0
                  right-0
                  mt-2
                  z-50
                  rounded-2xl
                  overflow-hidden
                  flex
                  flex-col
                "
                style={{
                  background:
                    'rgba(251,249,246,.97)',

                  border:
                    '1px solid rgba(41,42,40,.09)',

                  boxShadow:
                    '0 20px 45px rgba(41,42,40,.13)',

                  backdropFilter:
                    'blur(20px)',

                  WebkitBackdropFilter:
                    'blur(20px)',

                  maxHeight: '320px',
                }}
              >
                {/* SEARCH */}

                <div
                  className="
                    p-3
                    flex-shrink-0
                    border-b
                  "
                  style={{
                    borderColor:
                      'rgba(41,42,40,.07)',
                  }}
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      px-4
                      py-2.5
                      rounded-xl
                      text-sm
                      outline-none
                      transition-all
                      duration-300
                    "
                    style={{
                      background:
                        'rgba(41,42,40,.035)',

                      border:
                        '1px solid rgba(41,42,40,.08)',

                      color: '#292A28',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        'rgba(180,154,104,.55)'

                      e.currentTarget.style.boxShadow =
                        '0 0 0 3px rgba(180,154,104,.06)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        'rgba(41,42,40,.08)'

                      e.currentTarget.style.boxShadow =
                        'none'
                    }}
                    placeholder="ابحث بالاسم أو رقم الجوال..."
                    autoFocus
                  />
                </div>

                {/* USERS */}

                <div className="overflow-y-auto flex-1">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u)
                          setShowDropdown(false)
                          setSearchQuery('')
                        }}
                        className="
                          w-full
                          text-right
                          px-4
                          py-3.5
                          text-sm
                          transition-all
                          duration-200
                          flex
                          items-center
                          justify-between
                          gap-3
                          border-b
                        "
                        style={{
                          background:
                            selectedUser?.id ===
                            u.id
                              ? 'rgba(180,154,104,.09)'
                              : 'transparent',

                          borderColor:
                            'rgba(41,42,40,.045)',

                          color:
                            selectedUser?.id ===
                            u.id
                              ? '#9A7C48'
                              : '#5F5952',
                        }}
                      >
                        <div className="min-w-0">
                          <p
                            className="
                              font-medium
                              text-sm
                              truncate
                            "
                            style={{
                              color:
                                selectedUser?.id ===
                                u.id
                                  ? '#9A7C48'
                                  : '#292A28',
                            }}
                          >
                            {u.full_name ||
                              'بدون اسم'}
                          </p>

                          <p
                            className="
                              text-[11px]
                              mt-0.5
                            "
                            style={{
                              color: '#9A9288',
                            }}
                          >
                            {u.phone_number ||
                              'بدون رقم'}
                          </p>
                        </div>

                        <span
                          className="
                            text-[10px]
                            font-mono
                            px-2
                            py-1
                            rounded-md
                            flex-shrink-0
                          "
                          style={{
                            background:
                              'rgba(41,42,40,.045)',
                            color: '#AAA198',
                          }}
                        >
                          {u.id.slice(0, 8)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div
                      className="
                        p-8
                        text-center
                        text-sm
                      "
                      style={{
                        color: '#AAA198',
                      }}
                    >
                      لا توجد نتائج مطابقة
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            TITLE
        ================================================== */}

        <div>
          <label
            className="
              text-xs
              mb-1.5
              block
            "
            style={{
              color: '#8B837A',
            }}
          >
            عنوان الإشعار
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="
              w-full
              px-4
              py-3
              rounded-xl
              outline-none
              text-sm
              transition-all
              duration-300
            "
            style={{
              background:
                'rgba(245,242,237,.72)',

              border:
                '1px solid rgba(41,42,40,.10)',

              color: '#292A28',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                'rgba(180,154,104,.55)'

              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(180,154,104,.06)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                'rgba(41,42,40,.10)'

              e.currentTarget.style.boxShadow =
                'none'
            }}
            placeholder="عنوان الإشعار"
          />
        </div>

        {/* =================================================
            MESSAGE
        ================================================== */}

        <div>
          <label
            className="
              text-xs
              mb-1.5
              block
            "
            style={{
              color: '#8B837A',
            }}
          >
            نص الرسالة
          </label>

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            className="
              w-full
              min-h-[120px]
              px-4
              py-3
              rounded-xl
              outline-none
              resize-none
              text-sm
              leading-[1.7]
              transition-all
              duration-300
            "
            style={{
              background:
                'rgba(245,242,237,.72)',

              border:
                '1px solid rgba(41,42,40,.10)',

              color: '#292A28',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                'rgba(180,154,104,.55)'

              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(180,154,104,.06)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                'rgba(41,42,40,.10)'

              e.currentTarget.style.boxShadow =
                'none'
            }}
            placeholder="اكتب رسالتك هنا..."
          />
        </div>

        {/* =================================================
            DIVIDER
        ================================================== */}

        <div
          className="h-px w-full"
          style={{
            background:
              'rgba(41,42,40,.07)',
          }}
        />

        {/* =================================================
            SEND BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="
            w-full
            inline-flex
            items-center
            justify-center
            gap-2
            py-3.5
            rounded-xl
            text-sm
            font-semibold
            transition-all
            duration-300
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
          style={{
            background: '#292A28',
            color: '#F5F2ED',
            border:
              '1px solid #292A28',
            boxShadow:
              '0 10px 25px rgba(41,42,40,.10)',
          }}
        >
          {sending ? (
            <span
              className="
                inline-block
                w-5
                h-5
                border-2
                rounded-full
                animate-spin
              "
              style={{
                borderColor:
                  'rgba(245,242,237,.25)',
                borderTopColor:
                  '#B49A68',
              }}
            />
          ) : (
            <span
              className="
                inline-flex
                items-center
                gap-2
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>

              إرسال الإشعار
            </span>
          )}
        </button>

        {/* =================================================
            HELPER TEXT
        ================================================== */}

        <p
          className="
            text-[10px]
            text-center
            leading-relaxed
          "
          style={{
            color: '#AAA198',
          }}
        >
          يمكنك إرسال الإشعار لجميع المستخدمين
          أو اختيار مستخدم محدد.
        </p>
      </div>
    </div>
  )
}