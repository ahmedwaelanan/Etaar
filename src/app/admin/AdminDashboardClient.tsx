'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  Order,
  Product,
} from '@/types'
import GlassPanel from '@/components/GlassPanel'

export default function AdminDashboardClient() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [recentOrders, setRecentOrders] = useState<
    (Order & { product?: Product })[]
  >([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)

    const [
      productsRes,
      ordersCountRes,
      pendingRes,
      recentOrdersRes,
    ] = await Promise.all([
      // Total products
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true }),

      // Total orders
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true }),

      // Pending orders
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending'),

      // Recent orders
      supabase
        .from('orders')
        .select('*, product:products(*)')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    if (!productsRes.error) {
      setTotalProducts(productsRes.count ?? 0)
    }

    if (!ordersCountRes.error) {
      setTotalOrders(ordersCountRes.count ?? 0)
    }

    if (!pendingRes.error) {
      setPendingCount(pendingRes.count ?? 0)
    }

    if (!recentOrdersRes.error && recentOrdersRes.data) {
      setRecentOrders(recentOrdersRes.data)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div
      dir="ltr"
      className="w-full max-w-[1400px] mx-auto space-y-6 sm:space-y-8"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-px bg-[#B49A68]" />

            <span className="text-[10px] uppercase tracking-[0.18em] text-[#A88C58]">
              Dashboard
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#292A28]">
            لوحة التحكم
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-[#8B837A]">
            نظرة عامة على متجر إطار
          </p>
        </div>

        {/* Refresh Button */}

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="
            self-start
            sm:self-auto
            inline-flex
            items-center
            justify-center
            gap-2
            px-4
            py-2.5
            text-xs
            font-medium
            transition-all
            duration-300
            disabled:opacity-50
            disabled:cursor-not-allowed
            hover:-translate-y-0.5
          "
          style={{
            background: '#292A28',
            color: '#F5F2ED',
            border: '1px solid #292A28',
            boxShadow: '0 8px 20px rgba(41,42,40,.08)',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={loading ? 'animate-spin' : ''}
          >
            <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
            <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
          </svg>

          تحديث
        </button>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {/* Products */}

        <GlassPanel className="p-5 sm:p-6 !bg-white/70 !border-[#292A28]/[0.07]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8B837A]">
                إجمالي المنتجات
              </p>

              <div className="mt-3">
                {loading ? (
                  <span
                    className="
                      inline-block
                      w-7
                      h-7
                      border-2
                      border-[#B49A68]/30
                      border-t-[#B49A68]
                      rounded-full
                      animate-spin
                    "
                  />
                ) : (
                  <p className="text-3xl font-semibold text-[#292A28]">
                    {totalProducts}
                  </p>
                )}
              </div>
            </div>

            <div
              className="
                w-10
                h-10
                flex
                items-center
                justify-center
                rounded-full
              "
              style={{
                background: 'rgba(180,154,104,.08)',
                border: '1px solid rgba(180,154,104,.15)',
                color: '#A88C58',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 9h8M8 13h6M8 17h4" />
              </svg>
            </div>
          </div>

          <div className="mt-5 h-px bg-[#292A28]/[0.06]" />

          <p className="mt-3 text-[10px] text-[#AAA198]">
            المنتجات المتاحة في المتجر
          </p>
        </GlassPanel>

        {/* Orders */}

        <GlassPanel className="p-5 sm:p-6 !bg-white/70 !border-[#292A28]/[0.07]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8B837A]">
                إجمالي الطلبات
              </p>

              <div className="mt-3">
                {loading ? (
                  <span
                    className="
                      inline-block
                      w-7
                      h-7
                      border-2
                      border-[#B49A68]/30
                      border-t-[#B49A68]
                      rounded-full
                      animate-spin
                    "
                  />
                ) : (
                  <p className="text-3xl font-semibold text-[#292A28]">
                    {totalOrders}
                  </p>
                )}
              </div>
            </div>

            <div
              className="
                w-10
                h-10
                flex
                items-center
                justify-center
                rounded-full
              "
              style={{
                background: 'rgba(41,42,40,.045)',
                border: '1px solid rgba(41,42,40,.08)',
                color: '#292A28',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <path d="M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" />
                <path d="M9 13h6M9 17h4" />
              </svg>
            </div>
          </div>

          <div className="mt-5 h-px bg-[#292A28]/[0.06]" />

          <p className="mt-3 text-[10px] text-[#AAA198]">
            جميع الطلبات المسجلة
          </p>
        </GlassPanel>

        {/* Pending */}

        <GlassPanel className="p-5 sm:p-6 !bg-white/70 !border-[#292A28]/[0.07]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8B837A]">
                طلبات قيد الانتظار
              </p>

              <div className="mt-3">
                {loading ? (
                  <span
                    className="
                      inline-block
                      w-7
                      h-7
                      border-2
                      border-[#B49A68]/30
                      border-t-[#B49A68]
                      rounded-full
                      animate-spin
                    "
                  />
                ) : (
                  <p className="text-3xl font-semibold text-[#A88C58]">
                    {pendingCount}
                  </p>
                )}
              </div>
            </div>

            <div
              className="
                w-10
                h-10
                flex
                items-center
                justify-center
                rounded-full
              "
              style={{
                background: 'rgba(180,154,104,.08)',
                border: '1px solid rgba(180,154,104,.15)',
                color: '#A88C58',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l2.5 2" />
              </svg>
            </div>
          </div>

          <div className="mt-5 h-px bg-[#292A28]/[0.06]" />

          <p className="mt-3 text-[10px] text-[#AAA198]">
            تحتاج إلى متابعة ومعالجة
          </p>
        </GlassPanel>
      </div>

      {/* =====================================================
          RECENT ORDERS
      ===================================================== */}

      <GlassPanel className="overflow-hidden !bg-white/70 !border-[#292A28]/[0.07]">
        {/* Section Header */}

        <div className="px-5 py-5 sm:px-6 sm:py-6 border-b border-[#292A28]/[0.06]">
          <div className="flex items-center gap-3">
            <span className="w-6 h-px bg-[#B49A68]" />

            <h2 className="text-sm font-semibold text-[#292A28]">
              آخر الطلبات
            </h2>
          </div>

          <p className="mt-1.5 text-[10px] text-[#AAA198]">
            أحدث الطلبات المسجلة في المتجر
          </p>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="py-14 flex justify-center">
            <span
              className="
                inline-block
                w-7
                h-7
                border-2
                border-[#B49A68]/30
                border-t-[#B49A68]
                rounded-full
                animate-spin
              "
            />
          </div>
        ) : recentOrders.length > 0 ? (
          <div>
            {recentOrders.map((order, index) => (
              <div
                key={order.id}
                className="
                  px-5
                  py-4
                  sm:px-6
                  sm:py-5
                  transition-colors
                  duration-200
                  hover:bg-[#292A28]/[0.02]
                "
                style={{
                  borderBottom:
                    index !== recentOrders.length - 1
                      ? '1px solid rgba(41,42,40,.055)'
                      : 'none',
                }}
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  {/* Product */}

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#292A28] truncate">
                      {order.product?.title || 'منتج محذوف'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                      <span className="text-[10px] text-[#AAA198]">
                        {new Date(
                          order.created_at
                        ).toLocaleDateString('ar-EG')}
                      </span>

                      <span className="text-[#C6BFB6]">·</span>

                      <span className="text-[10px] text-[#AAA198]">
                        الكمية: {order.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Price + Status */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      sm:justify-end
                      gap-3
                      flex-shrink-0
                    "
                  >
                    <span
                      className={`
                        inline-flex
                        items-center
                        px-2.5
                        py-1.5
                        text-[9px]
                        font-medium
                        rounded-sm
                        border
                        ${STATUS_COLORS[
                          order.status as keyof typeof STATUS_COLORS
                        ] || ''}
                      `}
                    >
                      {STATUS_LABELS[
                        order.status as keyof typeof STATUS_LABELS
                      ] || order.status}
                    </span>

                    <span className="text-[#A88C58] text-sm font-semibold whitespace-nowrap">
                      {order.total_price} LE
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 px-5 text-center">
            <div
              className="
                w-11
                h-11
                mx-auto
                mb-4
                rounded-full
                flex
                items-center
                justify-center
              "
              style={{
                background: 'rgba(180,154,104,.06)',
                border: '1px solid rgba(180,154,104,.12)',
                color: '#B49A68',
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8h12M6 12h8M6 16h5" />
                <rect x="3" y="4" width="18" height="16" rx="2" />
              </svg>
            </div>

            <p className="text-sm text-[#8B837A]">
              لا توجد طلبات بعد
            </p>

            <p className="mt-1 text-[10px] text-[#AAA198]">
              ستظهر الطلبات الجديدة هنا
            </p>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}
