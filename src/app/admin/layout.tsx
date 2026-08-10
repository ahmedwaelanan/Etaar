'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/admin',
    label: 'نظرة عامة',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    href: '/admin/products',
    label: 'المنتجات',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    href: '/admin/orders',
    label: 'الطلبات',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a1.5 1.5 0 001.5 1.5h3A1.5 1.5 0 0015 5M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    href: '/admin/reviews',
    label: 'التقييمات',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  },
  {
    href: '/admin/notifications',
    label: 'إرسال إشعار',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const currentPage =
    navItems.find((item) => item.href === pathname)?.label ||
    'لوحة التحكم'

  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{
        background: '#F5F2ED',
        color: '#292A28',
      }}
    >
      {/* =====================================================
          MOBILE HEADER
      ====================================================== */}

      <header
        className="
          fixed
          top-0
          left-0
          right-0
          z-50
          h-16
          lg:hidden
          flex
          items-center
          justify-between
          px-4
          border-b
        "
        style={{
          background: 'rgba(245,242,237,.92)',
          borderColor: 'rgba(41,42,40,.08)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        {/* Menu Button */}

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="فتح القائمة"
          className="
            w-10
            h-10
            rounded-xl
            flex
            items-center
            justify-center
            transition-all
            duration-300
            active:scale-95
          "
          style={{
            background: 'rgba(41,42,40,.045)',
            border: '1px solid rgba(41,42,40,.08)',
            color: '#292A28',
          }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>

        {/* Current Page */}

        <div className="text-center">
          <p
            className="
              text-[10px]
              tracking-[0.18em]
              uppercase
            "
            style={{
              color: '#A88C58',
            }}
          >
            ADMIN
          </p>

          <p
            className="
              text-sm
              font-semibold
              mt-0.5
            "
            style={{
              color: '#292A28',
            }}
          >
            {currentPage}
          </p>
        </div>

        {/* Spacer */}

        <div className="w-10 h-10" />
      </header>

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={closeSidebar}
          className="
            fixed
            inset-0
            z-[55]
            lg:hidden
          "
          style={{
            background: 'rgba(41,42,40,.28)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed
          top-0
          right-0
          bottom-0
          z-[60]
          w-[280px]
          max-w-[85vw]
          transition-transform
          duration-300
          ease-out

          lg:translate-x-0
          lg:w-60

          ${
            sidebarOpen
              ? 'translate-x-0'
              : 'translate-x-full'
          }
        `}
        style={{
          background: '#FBF9F6',
          borderLeft: '1px solid rgba(41,42,40,.08)',
          boxShadow:
            sidebarOpen
              ? '-15px 0 45px rgba(41,42,40,.10)'
              : 'none',
        }}
      >
        <div className="flex flex-col h-full">

          {/* =================================================
              SIDEBAR HEADER
          ================================================== */}

          <div
            className="
              h-16
              px-5
              flex
              items-center
              justify-between
              border-b
            "
            style={{
              borderColor: 'rgba(41,42,40,.07)',
            }}
          >
            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  tracking-[0.2em]
                "
                style={{
                  color: '#A88C58',
                }}
              >
                ADMIN
              </p>

              <p
                className="
                  text-[10px]
                  mt-0.5
                "
                style={{
                  color: '#9A9288',
                }}
              >
                لوحة التحكم
              </p>
            </div>

            {/* Close mobile */}

            <button
              type="button"
              onClick={closeSidebar}
              className="
                lg:hidden
                w-9
                h-9
                rounded-lg
                flex
                items-center
                justify-center
                transition-all
              "
              aria-label="إغلاق القائمة"
              style={{
                color: '#9A9288',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* =================================================
              NAVIGATION
          ================================================== */}

          <nav
            className="
              flex-1
              overflow-y-auto
              p-4
              space-y-1.5
            "
          >
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (
                  item.href !== '/admin' &&
                  pathname.startsWith(`${item.href}/`)
                )

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className="
                    group
                    relative
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3.5
                    rounded-xl
                    text-sm
                    transition-all
                    duration-200
                  "
                  style={{
                    color: active
                      ? '#9A7C48'
                      : '#7F7870',

                    background: active
                      ? 'rgba(180,154,104,.10)'
                      : 'transparent',

                    border: active
                      ? '1px solid rgba(180,154,104,.20)'
                      : '1px solid transparent',
                  }}
                >
                  {/* Active indicator */}

                  {active && (
                    <span
                      className="
                        absolute
                        right-0
                        top-1/2
                        -translate-y-1/2
                        w-[2px]
                        h-6
                        rounded-full
                      "
                      style={{
                        background: '#B49A68',
                      }}
                    />
                  )}

                  {/* Icon */}

                  <span
                    className="
                      w-8
                      h-8
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      transition-all
                      duration-200
                    "
                    style={{
                      background: active
                        ? 'rgba(180,154,104,.11)'
                        : 'rgba(41,42,40,.035)',
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={item.icon} />
                    </svg>
                  </span>

                  <span className="flex-1">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* =================================================
              SIDEBAR FOOTER
          ================================================== */}

          <div
            className="
              p-4
              border-t
            "
            style={{
              borderColor: 'rgba(41,42,40,.07)',
            }}
          >
            <Link
              href="/"
              onClick={closeSidebar}
              className="
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                text-xs
                transition-all
              "
              style={{
                color: '#8B837A',
              }}
            >
              <span
                className="
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                "
                style={{
                  background: 'rgba(41,42,40,.035)',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12l9-9 9 9" />
                  <path d="M5 10v10h14V10" />
                  <path d="M9 20v-6h6v6" />
                </svg>
              </span>

              <span>
                العودة للموقع
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className="
          min-h-screen
          lg:mr-60
          pt-16
          lg:pt-0
        "
      >
        <div
          className="
            w-full
            max-w-[1600px]
            mx-auto
            p-4
            sm:p-6
            lg:p-8
          "
        >
          {children}
        </div>
      </main>
    </div>
  )
}