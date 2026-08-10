'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { getGuestId } from '@/lib/manual-link-order'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const getItemPrice = (item: any) => {
    const basePrice = parseFloat(String(item?.price)) || 0

    let parsedSizes: any[] = []

    try {
      if (Array.isArray(item?.sizes)) {
        parsedSizes = item.sizes.map((s: any) => {
          if (typeof s === 'string') {
            try {
              return JSON.parse(s)
            } catch {
              return s
            }
          }
          return s
        })
      } else if (typeof item?.sizes === 'string') {
        try {
          parsedSizes = JSON.parse(item.sizes || '[]')
        } catch {
          parsedSizes = []
        }
      }
    } catch {
      parsedSizes = []
    }

    if (parsedSizes.length > 0 && item.selected_size) {
      for (let i = 0; i < parsedSizes.length; i++) {
        const sizeItem = parsedSizes[i]

        const sizeName =
          typeof sizeItem === 'object' && sizeItem !== null
            ? sizeItem.name
            : String(sizeItem)

        if (
          sizeName === item.selected_size &&
          typeof sizeItem === 'object' &&
          typeof sizeItem.price === 'number'
        ) {
          return sizeItem.price
        }
      }
    }

    return basePrice
  }

  const realTotal = items.reduce(
    (sum, item) =>
      sum + getItemPrice(item) * item.quantity,
    0
  )

  const handleCheckout = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast.error('يرجى ملء جميع بيانات الشحن')
      return
    }

    if (items.length === 0) {
      toast.error('السلة فارغة')
      return
    }

    setLoading(true)

    try {
      const productIds = [...new Set(items.map((item) => item.id))]

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, stock, is_sold_out')
        .in('id', productIds)

      if (productsError) {
        toast.error(`تعذر التحقق من المنتجات: ${productsError.message}`)
        setLoading(false)
        return
      }

      const stockMap = new Map(
        (products ?? []).map((product) => [product.id, product])
      )

      for (const item of items) {
        const product = stockMap.get(item.id)

        if (
          !product ||
          product.is_sold_out ||
          (product.stock ?? 0) <= 0
        ) {
          toast.error(`المنتج "${item.title}" غير متوفر حالياً`)
          setLoading(false)
          return
        }

        if (item.quantity > (product.stock ?? 0)) {
          toast.error(
            `الكمية المطلوبة من "${item.title}" أكبر من المتاح (${product.stock})`
          )
          setLoading(false)
          return
        }
      }

      const generateId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
          /[xy]/g,
          (c) => {
            const r = (Math.random() * 16) | 0
            const v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
          }
        )
      }

      const groupId = generateId()

      const ordersToInsert = items.map((item) => ({
        user_id: user?.id || null,
        guest_id: user ? null : getGuestId(),
        product_id: item.id,
        quantity: item.quantity,
        total_price: getItemPrice(item) * item.quantity,
        status: 'Pending',
        size: item.selected_size || null,
        group_id: groupId,
        full_name: fullName.trim(),
        phone_number: phone.trim(),
        shipping_address: address.trim(),
      }))

      const { error } = await supabase
        .from('orders')
        .insert(ordersToInsert)

      if (error) {
        toast.error(`خطأ: ${error.message}`)
        setLoading(false)
        return
      }

      const stockUpdates = items.reduce(
        (acc, item) => {
          if (!acc[item.id]) {
            acc[item.id] = 0
          }

          acc[item.id] += item.quantity
          return acc
        },
        {} as Record<string, number>
      )

      for (const [productId, quantity] of Object.entries(stockUpdates)) {
        const product = stockMap.get(productId)

        if (product) {
          const newStock = Math.max(
            0,
            (product.stock || 0) - quantity
          )

          await supabase
            .from('products')
            .update({
              stock: newStock,
              is_sold_out: newStock <= 0,
            })
            .eq('id', productId)
        }
      }

      clearCart()
      setFullName('')
      setPhone('')
      setAddress('')

      setTimeout(() => {
        setIsSuccessModalOpen(true)
      }, 150)
    } catch (error: any) {
      toast.error(
        error?.message || 'حدث خطأ غير متوقع، حاول مرة أخرى'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: '#F8F5F0',
    border: '1px solid rgba(41,42,40,0.10)',
    color: '#292A28',
    fontFamily: 'Tajawal, sans-serif',
  }

  const primaryButtonStyle = {
    background: '#292A28',
    color: '#F7F4EF',
    border: '1px solid #292A28',
    fontFamily: 'Tajawal, sans-serif',
  }

  /* -------------------------------------------------
     SUCCESS MODAL
  ------------------------------------------------- */

  if (isSuccessModalOpen) {
    return (
      <div
        dir="rtl"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
        style={{
          background: 'rgba(41,42,40,0.48)',
          backdropFilter: 'blur(12px)',
        }}
        onClick={() => setIsSuccessModalOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-[24px] p-7 sm:p-9"
          style={{
            background: '#F7F4EF',
            border: '1px solid rgba(41,42,40,0.10)',
            boxShadow: '0 24px 80px rgba(41,42,40,0.18)',
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
              style={{
                background: 'rgba(180,154,104,0.10)',
                border: '1px solid rgba(180,154,104,0.28)',
                color: '#B49A68',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M5 12.5l4.2 4.2L19 7" />
              </svg>
            </div>

            <h2
              className="text-2xl font-bold mb-3"
              style={{
                color: '#292A28',
                fontFamily: 'Amiri, serif',
              }}
            >
              تم تقديم الطلب بنجاح
            </h2>

            {user ? (
              <>
                <p
                  className="text-sm mb-7 leading-7"
                  style={{
                    color: '#777066',
                    fontFamily: 'Tajawal, sans-serif',
                  }}
                >
                  سيتم التواصل معك لتأكيد الطلب.
                  يمكنك الذهاب إلى صفحة طلباتك لمتابعة الحالة.
                </p>

                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsSuccessModalOpen(false)
                      router.push('/profile')
                    }}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                    style={primaryButtonStyle}
                  >
                    طلباتي
                  </button>

                  <button
                    onClick={() => {
                      setIsSuccessModalOpen(false)
                      router.push('/shop')
                    }}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-300"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(41,42,40,0.12)',
                      color: '#5F5A52',
                      fontFamily: 'Tajawal, sans-serif',
                    }}
                  >
                    متابعة التسوق
                  </button>
                </div>
              </>
            ) : (
              <>
                <p
                  className="text-sm mb-7 leading-7"
                  style={{
                    color: '#777066',
                    fontFamily: 'Tajawal, sans-serif',
                  }}
                >
                  أنشئ حساباً وسجل الدخول لمتابعة طلبك
                  وحفظ بياناتك لتسهيل عملية الشراء في المرات القادمة.
                </p>

                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsSuccessModalOpen(false)
                      router.push('/auth/login')
                    }}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                    style={primaryButtonStyle}
                  >
                    إنشاء حساب / تسجيل الدخول
                  </button>

                  <button
                    onClick={() => {
                      setIsSuccessModalOpen(false)
                      router.push('/shop')
                    }}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-300"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(41,42,40,0.12)',
                      color: '#5F5A52',
                      fontFamily: 'Tajawal, sans-serif',
                    }}
                  >
                    متابعة التسوق
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* -------------------------------------------------
     EMPTY CART
  ------------------------------------------------- */

  if (items.length === 0) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex flex-col"
        style={{
          background: '#F5F2ED',
          color: '#292A28',
          fontFamily: 'Tajawal, sans-serif',
        }}
      >
        <main className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="text-center max-w-md">
            <div
              className="w-20 h-20 mx-auto mb-7 rounded-full flex items-center justify-center"
              style={{
                background: '#EEE8DE',
                border: '1px solid rgba(41,42,40,0.08)',
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#91897E"
                strokeWidth="1.4"
              >
                <path d="M3 4h2l2.2 11.2a2 2 0 002 1.6h7.9a2 2 0 001.9-1.4L21 8H6" />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
            </div>

            <h1
              className="text-2xl font-bold mb-3"
              style={{
                color: '#292A28',
                fontFamily: 'Amiri, serif',
              }}
            >
              السلة فارغة
            </h1>

            <p
              className="mb-8 text-sm"
              style={{
                color: '#8B8379',
              }}
            >
              لم تقم بإضافة أي منتجات بعد
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
              style={primaryButtonStyle}
            >
              تصفح المعرض
            </Link>
          </div>
        </main>
      </div>
    )
  }

  /* -------------------------------------------------
     MAIN CART
  ------------------------------------------------- */

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full"
      style={{
        background: '#F5F2ED',
        color: '#292A28',
        fontFamily: 'Tajawal, sans-serif',
      }}
    >
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header */}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <p
              className="text-[10px] tracking-[0.28em] uppercase mb-3"
              style={{
                color: '#B49A68',
                direction: 'ltr',
              }}
            >
              YOUR COLLECTION
            </p>

            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{
                color: '#292A28',
                fontFamily: 'Amiri, serif',
              }}
            >
              سلة المشتريات
            </h1>

            <p
              className="mt-2 text-sm"
              style={{
                color: '#91897E',
              }}
            >
              {items.length} منتج
            </p>
          </div>

          <button
            onClick={clearCart}
            className="self-start sm:self-auto text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
            style={{
              color: '#9A615B',
              border: '1px solid rgba(154,97,91,0.16)',
              background: 'rgba(154,97,91,0.04)',
            }}
          >
            تفريغ السلة
          </button>
        </div>

        {/* Decorative line */}

        <div
          className="w-full h-px mb-8"
          style={{
            background: 'rgba(41,42,40,0.08)',
          }}
        />

        {/* Content */}

        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7 lg:gap-10"
        >
          {/* Products */}

          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const correctPrice = getItemPrice(item)

              return (
                <div
                  key={`${item.id}-${item.selected_size}`}
                  className="group flex gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.48)',
                    border: '1px solid rgba(41,42,40,0.08)',
                    boxShadow: '0 8px 30px rgba(41,42,40,0.035)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  {/* Image */}

                  <Link
                    href={`/shop/${item.id}`}
                    className="flex-shrink-0"
                  >
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-[78px] h-[96px] sm:w-[92px] sm:h-[112px] rounded-xl object-cover"
                        style={{
                          background: '#EEE8DE',
                        }}
                      />
                    ) : (
                      <div
                        className="w-[78px] h-[96px] sm:w-[92px] sm:h-[112px] rounded-xl flex items-center justify-center"
                        style={{
                          background: '#EEE8DE',
                          color: '#B2AAA0',
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/shop/${item.id}`}
                        className="font-semibold text-sm sm:text-base block mb-1.5 truncate transition-colors duration-300 hover:text-[#B49A68]"
                        style={{
                          color: '#292A28',
                        }}
                      >
                        {item.title}
                      </Link>

                      {item.selected_size && (
                        <span
                          className="inline-block text-[11px] mb-2 px-2 py-1 rounded-md"
                          style={{
                            color: '#8B7654',
                            background: 'rgba(180,154,104,0.10)',
                            border:
                              '1px solid rgba(180,154,104,0.15)',
                          }}
                        >
                          {item.selected_size}
                        </span>
                      )}

                      <p
                        className="text-base sm:text-lg font-medium"
                        style={{
                          color: '#B49A68',
                          direction: 'ltr',
                          textAlign: 'right',
                        }}
                      >
                        {correctPrice.toFixed(2)} EGP
                      </p>
                    </div>

                    {/* Bottom Controls */}

                    <div className="flex items-center justify-between gap-3 mt-4">
                      {/* Quantity */}

                      <div
                        className="flex items-center rounded-lg overflow-hidden"
                        style={{
                          border:
                            '1px solid rgba(41,42,40,0.10)',
                          background: 'rgba(255,255,255,0.45)',
                        }}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1,
                              item.selected_size
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:bg-black/[0.04]"
                          style={{
                            color: '#7F786F',
                          }}
                          aria-label="تقليل الكمية"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M5 12h14" />
                          </svg>
                        </button>

                        <span
                          className="w-8 text-center text-sm font-semibold"
                          style={{
                            color: '#292A28',
                          }}
                        >
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1,
                              item.selected_size
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:bg-black/[0.04]"
                          style={{
                            color: '#7F786F',
                          }}
                          aria-label="زيادة الكمية"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </button>
                      </div>

                      {/* Total + Remove */}

                      <div className="flex items-center gap-3">
                        <span
                          className="text-sm sm:text-base font-semibold"
                          style={{
                            color: '#292A28',
                            direction: 'ltr',
                          }}
                        >
                          {(correctPrice * item.quantity).toFixed(2)} EGP
                        </span>

                        <button
                          onClick={() =>
                            removeFromCart(
                              item.id,
                              item.selected_size
                            )
                          }
                          className="p-2 rounded-lg transition-all duration-200 hover:bg-red-50"
                          style={{
                            color: '#9A9187',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#9A615B'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#9A9187'
                          }}
                          aria-label="حذف المنتج"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Checkout Card */}

          <div
            className="lg:sticky lg:top-20 self-start rounded-2xl p-5 sm:p-6"
            style={{
              background: 'rgba(255,255,255,0.56)',
              border: '1px solid rgba(41,42,40,0.08)',
              boxShadow: '0 14px 45px rgba(41,42,40,0.055)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div className="mb-6">
              <p
                className="text-[10px] tracking-[0.24em] mb-2"
                style={{
                  color: '#B49A68',
                  direction: 'ltr',
                }}
              >
                CHECKOUT
              </p>

              <h3
                className="font-bold text-xl"
                style={{
                  color: '#292A28',
                  fontFamily: 'Amiri, serif',
                }}
              >
                إتمام الطلب
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              {/* Name */}

              <div>
                <label
                  className="block mb-2 text-xs font-medium"
                  style={{
                    color: '#716A61',
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
                  className="w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B49A68]/15"
                  style={inputStyle}
                  placeholder="أدخل اسمك الكامل"
                  dir="rtl"
                />
              </div>

              {/* Phone */}

              <div>
                <label
                  className="block mb-2 text-xs font-medium"
                  style={{
                    color: '#716A61',
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
                  className="w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B49A68]/15"
                  style={inputStyle}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>

              {/* Address */}

              <div>
                <label
                  className="block mb-2 text-xs font-medium"
                  style={{
                    color: '#716A61',
                  }}
                >
                  عنوان الشحن
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  className="w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#B49A68]/15"
                  style={{
                    ...inputStyle,
                    minHeight: 90,
                    resize: 'none',
                  }}
                  placeholder="المدينة، الحي، الشارع، رقم المبنى"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Total */}

            <div
              className="flex justify-between items-center py-5 mb-5"
              style={{
                borderTop:
                  '1px solid rgba(41,42,40,0.08)',
              }}
            >
              <span
                className="text-sm"
                style={{
                  color: '#7F786F',
                }}
              >
                الإجمالي
              </span>

              <span
                className="text-xl font-bold"
                style={{
                  color: '#292A28',
                  direction: 'ltr',
                }}
              >
                {realTotal.toFixed(2)} EGP
              </span>
            </div>

            {/* Checkout Button */}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              style={primaryButtonStyle}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span
                    className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
                    style={{
                      borderColor:
                        'rgba(247,244,239,0.25)',
                      borderTopColor: '#F7F4EF',
                    }}
                  />
                  جاري تأكيد الطلب...
                </span>
              ) : (
                `تأكيد الطلب (${items.length} منتجات)`
              )}
            </button>

            <p
              className="text-[10px] text-center mt-4 leading-5"
              style={{
                color: '#A39B91',
              }}
            >
              سيتم التواصل معك لتأكيد تفاصيل الطلب والشحن.
            </p>
          </div>
        </div>

        {/* Bottom reassurance */}

        <div className="mt-10 flex justify-center">
          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px]"
            style={{
              color: '#9A9288',
            }}
          >
            <span className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#B49A68',
                }}
              />
              جودة مختارة بعناية
            </span>

            <span className="hidden sm:block">·</span>

            <span>تصميم يليق بمساحتك</span>

            <span className="hidden sm:block">·</span>

            <span>JIDAAR</span>
          </div>
        </div>
      </main>
    </div>
  )
}