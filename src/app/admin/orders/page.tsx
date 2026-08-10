'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Order,
  OrderStatus,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/types'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<
    OrderStatus | 'All'
  >('All')

  const fetchOrders = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, product:products(*)')
        .order('created_at', {
          ascending: false,
        })

      if (error) {
        toast.error(`خطأ في جلب الطلبات: ${error.message}`)
      } else {
        setOrders((data || []) as Order[])
      }
    } catch {
      toast.error('فشل الاتصال بقاعدة البيانات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  /*
  =====================================================
  STATUS CHANGE
  =====================================================
  */

  const handleStatusChange = async (
    groupId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const targetOrder = orders.find(
        (order) =>
          (order.group_id || order.id) === groupId
      )

      const userId =
        targetOrder?.user_id || null

      const statusLabel =
        STATUS_LABELS[newStatus]

      const res = await fetch(
        '/api/update-order-status',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId,
            newStatus,
            userId,
            statusLabel,
          }),
        }
      )

      const data = await res.json()

      if (data.success) {
        toast.success(
          'تم تحديث حالة الطلب بنجاح'
        )

        setOrders((prev) =>
          prev.map((order) =>
            (order.group_id || order.id) ===
            groupId
              ? {
                  ...order,
                  status: newStatus,
                }
              : order
          )
        )
      } else {
        toast.error(
          `خطأ: ${
            data.error || 'فشل التحديث'
          }`
        )
      }
    } catch {
      toast.error(
        'فشل الاتصال بالسيرفر'
      )
    }
  }

  /*
  =====================================================
  GROUP ORDERS
  =====================================================
  */

  const groupedOrders = orders.reduce(
    (
      acc,
      order
    ) => {
      const id =
        order.group_id || order.id

      if (!acc[id]) {
        acc[id] = {
          ...order,
          items: [order],
        }
      } else {
        acc[id].items.push(order)

        if (
          !acc[id].full_name &&
          order.full_name
        ) {
          acc[id].full_name =
            order.full_name
        }

        if (
          !acc[id].phone_number &&
          order.phone_number
        ) {
          acc[id].phone_number =
            order.phone_number
        }

        if (
          !acc[id].shipping_address &&
          order.shipping_address
        ) {
          acc[id].shipping_address =
            order.shipping_address
        }
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

  /*
  =====================================================
  FILTER
  =====================================================
  */

  const filteredGroups =
    Object.values(groupedOrders).filter(
      (group) =>
        filterStatus === 'All' ||
        group.status === filterStatus
    )

  const statuses: (
    | OrderStatus
    | 'All'
  )[] = [
    'All',
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ]

  /*
  =====================================================
  HELPERS
  =====================================================
  */

  const getTotalPrice = (
    value: unknown
  ) => {
    const number =
      typeof value === 'number'
        ? value
        : parseFloat(
            String(value ?? 0)
          )

    return Number.isFinite(number)
      ? number
      : 0
  }

  const getOrderTotal = (
    items: Order[]
  ) => {
    return items.reduce(
      (sum, item) =>
        sum +
        getTotalPrice(
          item.total_price
        ),
      0
    )
  }

  const getStatusStyle = (
    status: OrderStatus
  ) => {
    switch (status) {
      case 'Pending':
        return {
          background:
            'rgba(180,154,104,.10)',
          borderColor:
            'rgba(180,154,104,.25)',
          color: '#9A7940',
        }

      case 'Processing':
        return {
          background:
            'rgba(100,130,150,.10)',
          borderColor:
            'rgba(100,130,150,.20)',
          color: '#607D8B',
        }

      case 'Shipped':
        return {
          background:
            'rgba(92,125,108,.10)',
          borderColor:
            'rgba(92,125,108,.20)',
          color: '#5C7D6C',
        }

      case 'Delivered':
        return {
          background:
            'rgba(74,125,91,.10)',
          borderColor:
            'rgba(74,125,91,.20)',
          color: '#4A7D5B',
        }

      case 'Cancelled':
        return {
          background:
            'rgba(170,85,75,.08)',
          borderColor:
            'rgba(170,85,75,.18)',
          color: '#A9554B',
        }

      default:
        return {
          background:
            'rgba(41,42,40,.05)',
          borderColor:
            'rgba(41,42,40,.10)',
          color: '#77716A',
        }
    }
  }

  return (
    <div
      dir="rtl"
      className="space-y-5 sm:space-y-6"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className="w-7 h-px"
              style={{
                background:
                  '#B49A68',
              }}
            />

            <span
              className="text-[10px] uppercase tracking-[0.16em]"
              style={{
                color:
                  '#A88C58',
              }}
            >
              Orders
            </span>
          </div>

          <h1
            className="text-xl sm:text-2xl font-semibold"
            style={{
              color:
                '#292A28',
            }}
          >
            إدارة الطلبات
          </h1>

          <p
            className="text-xs sm:text-sm mt-1"
            style={{
              color:
                '#9A9288',
            }}
          >
            متابعة وإدارة جميع طلبات المتجر
          </p>
        </div>

        <div
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2"
          style={{
            background:
              'rgba(255,255,255,.55)',
            border:
              '1px solid rgba(41,42,40,.08)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background:
                '#B49A68',
            }}
          />

          <span
            className="text-xs font-medium"
            style={{
              color:
                '#6F6961',
            }}
          >
            {filteredGroups.length} طلب
          </span>
        </div>
      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        dir="rtl"
      >
        {statuses.map((status) => {
          const active =
            filterStatus === status

          return (
            <button
              key={status}
              type="button"
              onClick={() =>
                setFilterStatus(
                  status
                )
              }
              className="flex-shrink-0 px-4 py-2.5 text-xs font-medium transition-all duration-300"
              style={{
                background: active
                  ? '#292A28'
                  : 'rgba(255,255,255,.55)',
                color: active
                  ? '#F5F2ED'
                  : '#77716A',
                border: active
                  ? '1px solid #292A28'
                  : '1px solid rgba(41,42,40,.09)',
                boxShadow: active
                  ? '0 6px 18px rgba(41,42,40,.08)'
                  : 'none',
              }}
            >
              {status === 'All'
                ? 'الكل'
                : STATUS_LABELS[
                    status
                  ]}
            </button>
          )
        })}
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div
          className="p-12 sm:p-16 text-center"
          style={{
            background:
              'rgba(255,255,255,.45)',
            border:
              '1px solid rgba(41,42,40,.07)',
          }}
        >
          <span
            className="inline-block w-7 h-7 border-2 rounded-full animate-spin"
            style={{
              borderColor:
                'rgba(180,154,104,.25)',
              borderTopColor:
                '#B49A68',
            }}
          />
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="space-y-4">
          {filteredGroups.map(
            (group) => {
              const groupId =
                group.group_id ||
                group.id

              const total =
                getOrderTotal(
                  group.items
                )

              const statusStyle =
                getStatusStyle(
                  group.status
                )

              return (
                <div
                  key={groupId}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    background:
                      'rgba(255,255,255,.52)',
                    border:
                      '1px solid rgba(41,42,40,.08)',
                    boxShadow:
                      '0 10px 30px rgba(41,42,40,.035)',
                  }}
                >
                  {/* =================================================
                      ORDER HEADER
                  ================================================= */}

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* CUSTOMER */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            dir="ltr"
                            className="text-[9px] sm:text-[10px] font-mono px-2 py-1"
                            style={{
                              background:
                                'rgba(41,42,40,.045)',
                              color:
                                '#8F887F',
                              border:
                                '1px solid rgba(41,42,40,.06)',
                            }}
                          >
                            #
                            {groupId.slice(
                              0,
                              8
                            )}
                          </span>

                          <span
                            className="text-[10px]"
                            style={{
                              color:
                                '#AAA198',
                            }}
                          >
                            {new Date(
                              group.created_at
                            ).toLocaleDateString(
                              'ar-EG',
                              {
                                year: 'numeric',
                                month:
                                  'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute:
                                  '2-digit',
                              }
                            )}
                          </span>
                        </div>

                        <p
                          className="text-sm font-semibold truncate"
                          style={{
                            color:
                              '#292A28',
                          }}
                        >
                          {group.full_name ||
                            group
                              .profile
                              ?.full_name ||
                            'بدون اسم'}
                        </p>

                        <p
                          dir="ltr"
                          className="text-xs mt-1 text-right"
                          style={{
                            color:
                              '#8F887F',
                          }}
                        >
                          {group.phone_number ||
                            group
                              .profile
                              ?.phone_number ||
                            '-'}
                        </p>

                        <p
                          className="text-xs mt-2 leading-relaxed"
                          style={{
                            color:
                              '#9A9288',
                          }}
                        >
                          {group.shipping_address ||
                            group
                              .profile
                              ?.shipping_address ||
                            'لا يوجد عنوان شحن'}
                        </p>
                      </div>

                      {/* STATUS + TOTAL */}

                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={
                              group.status
                            }
                            onChange={(
                              event
                            ) =>
                              handleStatusChange(
                                groupId,
                                event
                                  .target
                                  .value as OrderStatus
                              )
                            }
                            className="min-w-[130px] px-3 py-2.5 text-xs outline-none cursor-pointer appearance-none text-center"
                            style={{
                              background:
                                '#F5F2ED',
                              border:
                                '1px solid rgba(41,42,40,.10)',
                              color:
                                '#4D4944',
                            }}
                          >
                            {(
                              Object.keys(
                                STATUS_LABELS
                              ) as OrderStatus[]
                            ).map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                  style={{
                                    background:
                                      '#F5F2ED',
                                    color:
                                      '#292A28',
                                  }}
                                >
                                  {
                                    STATUS_LABELS[
                                      status
                                    ]
                                  }
                                </option>
                              )
                            )}
                          </select>

                          <span
                            className="px-3 py-2 text-[10px] font-medium whitespace-nowrap"
                            style={{
                              background:
                                statusStyle.background,
                              border:
                                `1px solid ${statusStyle.borderColor}`,
                              color:
                                statusStyle.color,
                            }}
                          >
                            {
                              STATUS_LABELS[
                                group
                                  .status
                              ]
                            }
                          </span>
                        </div>

                        <div className="text-right">
                          <p
                            className="text-[9px] uppercase tracking-[0.12em] mb-0.5"
                            style={{
                              color:
                                '#AAA198',
                            }}
                          >
                            Order Total
                          </p>

                          <span
                            dir="ltr"
                            className="text-base sm:text-lg font-semibold"
                            style={{
                              color:
                                '#A88C58',
                            }}
                          >
                            {total.toFixed(
                              2
                            )}{' '}
                            EGP
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      ITEMS
                  ================================================= */}

                  <div
                    className="px-4 sm:px-5 pb-4 sm:pb-5"
                  >
                    <div
                      className="h-px w-full mb-3"
                      style={{
                        background:
                          'rgba(41,42,40,.07)',
                      }}
                    />

                    <div className="space-y-2">
                      {group.items.map(
                        (item) => {
                          const itemTotal =
                            getTotalPrice(
                              item.total_price
                            )

                          return (
                            <div
                              key={
                                item.id
                              }
                              className="flex items-center gap-3 p-2.5 sm:p-3"
                              style={{
                                background:
                                  'rgba(245,242,237,.65)',
                                border:
                                  '1px solid rgba(41,42,40,.045)',
                              }}
                            >
                              {/* IMAGE */}

                              {item.product
                                ?.images
                                ?.length ? (
                                <img
                                  src={
                                    item
                                      .product
                                      .images[0]
                                  }
                                  alt=""
                                  className="w-12 h-12 sm:w-14 sm:h-14 object-cover flex-shrink-0"
                                  style={{
                                    border:
                                      '1px solid rgba(41,42,40,.08)',
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0"
                                  style={{
                                    background:
                                      'rgba(41,42,40,.04)',
                                    border:
                                      '1px solid rgba(41,42,40,.07)',
                                  }}
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.3"
                                    className="text-[#B7B0A7]"
                                  >
                                    <rect
                                      x="3"
                                      y="3"
                                      width="18"
                                      height="18"
                                      rx="2"
                                    />
                                    <circle
                                      cx="8.5"
                                      cy="8.5"
                                      r="1.5"
                                    />
                                    <path d="M21 15l-5-5L5 21" />
                                  </svg>
                                </div>
                              )}

                              {/* PRODUCT */}

                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-xs sm:text-sm font-medium truncate"
                                  style={{
                                    color:
                                      '#4A4743',
                                  }}
                                >
                                  {item
                                    .product
                                    ?.title ||
                                    'منتج محذوف'}
                                </p>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                  <span
                                    className="text-[10px]"
                                    style={{
                                      color:
                                        '#9A9288',
                                    }}
                                  >
                                    الكمية:{' '}
                                    {
                                      item.quantity
                                    }
                                  </span>

                                  {item.size && (
                                    <span
                                      className="text-[10px]"
                                      style={{
                                        color:
                                          '#A88C58',
                                      }}
                                    >
                                      المقاس:{' '}
                                      {
                                        item.size
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* ITEM PRICE */}

                              <span
                                dir="ltr"
                                className="text-xs sm:text-sm font-semibold whitespace-nowrap"
                                style={{
                                  color:
                                    '#A88C58',
                                }}
                              >
                                {itemTotal.toFixed(
                                  2
                                )}{' '}
                                EGP
                              </span>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                </div>
              )
            }
          )}
        </div>
      ) : (
        <div
          className="p-12 sm:p-16 text-center"
          style={{
            background:
              'rgba(255,255,255,.45)',
            border:
              '1px solid rgba(41,42,40,.07)',
          }}
        >
          <div
            className="w-12 h-12 mx-auto mb-4 flex items-center justify-center"
            style={{
              background:
                'rgba(180,154,104,.08)',
              border:
                '1px solid rgba(180,154,104,.14)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B49A68"
              strokeWidth="1.3"
            >
              <path d="M6 2h12v4H6z" />
              <path d="M6 4H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
              <path d="M8 11h8M8 15h5" />
            </svg>
          </div>

          <p
            className="text-sm"
            style={{
              color:
                '#77716A',
            }}
          >
            لا توجد طلبات
            {filterStatus !==
              'All'
              ? ' بهذه الحالة'
              : ''}
          </p>

          <p
            className="text-[11px] mt-1"
            style={{
              color:
                '#AAA198',
            }}
          >
            ستظهر الطلبات الجديدة هنا
          </p>
        </div>
      )}
    </div>
  )
}