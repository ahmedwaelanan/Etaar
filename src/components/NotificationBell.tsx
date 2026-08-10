'use client'

import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '@/context/NotificationContext'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function NotificationBell() {
  const { user } = useAuth()

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  const [open, setOpen] = useState(false)

  const ref = useRef<HTMLDivElement | null>(null)

  /*
  =====================================================
  CLOSE WHEN CLICKING OUTSIDE
  =====================================================
  */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false)
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

  /*
  =====================================================
  MARK ALL AS READ WHEN OPENING
  =====================================================
  */

  useEffect(() => {
    if (open && unreadCount > 0) {
      markAllAsRead()
    }
  }, [
    open,
    unreadCount,
    markAllAsRead,
  ])

  if (!user) return null

  return (
    <div
      ref={ref}
      className="relative"
    >

      {/* =================================================
          NOTIFICATION BUTTON
      ================================================= */}

<button
  type="button"
  onClick={() => setOpen((prev) => !prev)}
  aria-label="Notifications"
  className="
    relative
    flex
    items-center
    justify-center
    w-10
    h-10
    text-[#080808]/60
    hover:text-[#C9A84C]
    transition-all
    duration-300
    hover:-translate-y-0.5
    focus:outline-none
  "
>
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>

  {unreadCount > 0 && (
    <span
      className="
        absolute
        top-1
        right-1

        min-w-[16px]
        h-[16px]
        px-1

        rounded-full

        flex
        items-center
        justify-center

        text-[8px]
        font-bold
        leading-none

        bg-[#C9A84C]
        text-[#0A0A08]

        border
        border-[#10100E]

        shadow-[0_0_10px_rgba(201,168,76,0.45)]
      "
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>

      {/* =================================================
          NOTIFICATIONS PANEL
      ================================================= */}

      {open && (
        <div
          className="
            fixed
            inset-x-4
            top-[75px]
            mx-auto
            sm:max-w-sm

            lg:absolute
            lg:inset-auto
            lg:right-0
            lg:top-full
            lg:mt-2
            lg:w-96
            lg:mx-0

            z-50

            bg-[#10100E]/95
            border
            border-white/[0.08]
            backdrop-blur-2xl

            rounded-2xl

            shadow-[0_25px_70px_rgba(0,0,0,0.55)]

            overflow-hidden

            animate-fade-in
          "
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              px-5
              py-4

              border-b
              border-white/[0.06]

              bg-white/[0.02]
            "
          >

            <div className="flex items-center gap-3">

              {/* GOLD LINE */}

              <span
                className="
                  w-5
                  h-px
                  bg-[#C9A84C]
                  opacity-70
                "
              />

              <h3
                className="
                  text-white
                  font-semibold
                  text-sm
                "
              >
                Notifications
              </h3>

            </div>

            {/* COUNT */}

            {notifications.length > 0 && (
              <span
                className="
                  text-[10px]
                  tracking-wide
                  text-white/25
                "
              >
                {notifications.length}
              </span>
            )}

          </div>

          {/* =================================================
              NOTIFICATIONS LIST
          ================================================= */}

          <div
            className="
              max-h-80
              overflow-y-auto
              scrolling-touch
            "
          >

            {notifications.length === 0 ? (

              /* EMPTY STATE */

              <div
                className="
                  px-6
                  py-14
                  text-center
                "
              >

                <div
                  className="
                    w-11
                    h-11
                    rounded-full
                    mx-auto
                    mb-4

                    flex
                    items-center
                    justify-center

                    bg-[#C9A84C]/[0.07]
                    border
                    border-[#C9A84C]/[0.12]

                    text-[#C9A84C]/60
                  "
                >

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>

                </div>

                <p className="text-white/35 text-sm">
                  No notifications yet
                </p>

                <p className="text-white/15 text-[10px] mt-1">
                  You're all caught up
                </p>

              </div>

            ) : (

              notifications
                .slice(0, 20)
                .map((n) => (

                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      markAsRead(n.id)
                    }}
                    className={`
                      w-full
                      text-left

                      px-5
                      py-4

                      border-b
                      border-white/[0.045]

                      transition-all
                      duration-200

                      hover:bg-white/[0.035]

                      flex
                      items-start
                      gap-3

                      focus:outline-none

                      ${
                        !n.is_read
                          ? 'bg-[#C9A84C]/[0.025]'
                          : 'bg-transparent'
                      }
                    `}
                  >

                    {/* STATUS DOT */}

                    <div className="pt-1.5 w-2 flex-shrink-0">

                      {!n.is_read && (
                        <span
                          className="
                            block
                            w-1.5
                            h-1.5
                            rounded-full

                            bg-[#C9A84C]

                            shadow-[0_0_8px_rgba(201,168,76,0.5)]
                          "
                        />
                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="flex-1 min-w-0">

                      <p
                        className={`
                          text-sm
                          break-words
                          leading-snug

                          ${
                            !n.is_read
                              ? 'font-semibold text-white'
                              : 'font-normal text-white/75'
                          }
                        `}
                      >
                        {n.title}
                      </p>

                      <p
                        className="
                          text-white/45
                          text-xs
                          mt-1.5
                          leading-relaxed
                          break-words
                        "
                      >
                        {n.message}
                      </p>

                      <p
                        className="
                          text-white/20
                          text-[10px]
                          mt-2
                        "
                      >
                        {new Date(
                          n.created_at
                        ).toLocaleDateString(
                          'en-US',
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

                  </button>

                ))
            )}

          </div>

          {/* =================================================
              VIEW ALL
          ================================================= */}

          {notifications.length > 20 && (

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="
                block

                px-4
                py-3.5

                text-center

                text-[#C9A84C]
                text-xs
                font-medium

                border-t
                border-white/[0.06]

                bg-white/[0.02]

                hover:bg-[#C9A84C]/[0.05]

                transition-all
              "
            >
              View All Notifications
            </Link>

          )}

        </div>
      )}

    </div>
  )
}