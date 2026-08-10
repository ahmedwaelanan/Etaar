'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Review, Product } from '@/types'
import StarRating from '@/components/StarRating'
import toast from 'react-hot-toast'

type ReviewWithProduct = Review & {
  product?: Pick<Product, 'id' | 'title' | 'images'>
}

const GOLD = '#B49A68'
const DARK = '#292A28'
const CREAM = '#F5F2ED'
const MUTED = '#8B837A'
const SOFT = '#AAA198'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchReviews = async () => {
    setLoading(true)

    try {
      // Get reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (reviewsError) {
        toast.error('حدث خطأ أثناء جلب التقييمات')
        setReviews([])
        return
      }

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([])
        return
      }

      // Get products
      const productIds = [
        ...new Set(reviewsData.map((review) => review.product_id)),
      ]

      const { data: products } = await supabase
        .from('products')
        .select('id, title, images')
        .in('id', productIds)

      const productMap = new Map(
        (products ?? []).map((product) => [product.id, product])
      )

      // Get profiles
      const userIds = [
        ...new Set(reviewsData.map((review) => review.user_id)),
      ]

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds)

      const profileMap = new Map(
        (profiles ?? []).map((profile) => [
          profile.id,
          {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          },
        ])
      )

      // Merge data
      const merged: ReviewWithProduct[] = reviewsData.map((review) => ({
        ...review,
        product: productMap.get(review.product_id),
        profile:
          profileMap.get(review.user_id) || {
            full_name: null,
            avatar_url: null,
          },
      }))

      setReviews(merged)
    } catch {
      toast.error('فشل الاتصال بقاعدة البيانات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('حدث خطأ أثناء حذف التقييم')
        return
      }

      toast.success('تم حذف التقييم')

      setReviews((prev) =>
        prev.filter((review) => review.id !== id)
      )
    } catch {
      toast.error('فشل الاتصال بقاعدة البيانات')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered =
    filterRating !== null
      ? reviews.filter((review) => review.rating === filterRating)
      : reviews

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviews.length
      : 0

  return (
    <div
      className="space-y-5 sm:space-y-6"
      dir="rtl"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-7 h-px"
                style={{ background: GOLD }}
              />

              <h1
                className="text-base sm:text-lg font-semibold"
                style={{ color: DARK }}
              >
                إدارة التقييمات
              </h1>
            </div>

            <p
              className="text-[11px] sm:text-xs"
              style={{ color: MUTED }}
            >
              مراجعة وإدارة آراء العملاء حول منتجاتك
            </p>
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchReviews}
            disabled={loading}
            className="
              flex-shrink-0
              inline-flex
              items-center
              justify-center
              gap-2
              w-10
              h-10
              sm:w-auto
              sm:h-auto
              sm:px-4
              sm:py-2.5
              transition-all
              duration-300
              hover:-translate-y-0.5
              disabled:opacity-40
            "
            style={{
              background: 'rgba(255,255,255,.45)',
              border: '1px solid rgba(41,42,40,.10)',
              color: DARK,
            }}
            title="تحديث"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={loading ? 'animate-spin' : ''}
            >
              <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
            </svg>

            <span className="hidden sm:inline text-xs">
              تحديث
            </span>
          </button>
        </div>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            className="p-4 sm:p-5"
            style={{
              background: 'rgba(255,255,255,.42)',
              border: '1px solid rgba(41,42,40,.08)',
              boxShadow: '0 10px 30px rgba(41,42,40,.025)',
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.12em] mb-2"
              style={{ color: MUTED }}
            >
              إجمالي التقييمات
            </p>

            <p
              className="text-xl sm:text-2xl font-semibold"
              style={{ color: DARK }}
            >
              {reviews.length}
            </p>
          </div>

          <div
            className="p-4 sm:p-5"
            style={{
              background: 'rgba(255,255,255,.42)',
              border: '1px solid rgba(41,42,40,.08)',
              boxShadow: '0 10px 30px rgba(41,42,40,.025)',
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.12em] mb-2"
              style={{ color: MUTED }}
            >
              متوسط التقييم
            </p>

            <div className="flex items-center gap-2">
              <p
                className="text-xl sm:text-2xl font-semibold"
                style={{ color: DARK }}
              >
                {averageRating.toFixed(1)}
              </p>

              <StarRating
                rating={averageRating}
                size={14}
              />
            </div>
          </div>

          <div
            className="
              hidden
              sm:block
              p-4
              sm:p-5
            "
            style={{
              background: 'rgba(255,255,255,.42)',
              border: '1px solid rgba(41,42,40,.08)',
              boxShadow: '0 10px 30px rgba(41,42,40,.025)',
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.12em] mb-2"
              style={{ color: MUTED }}
            >
              التقييم الحالي
            </p>

            <p
              className="text-sm font-medium"
              style={{ color: GOLD }}
            >
              {filterRating
                ? `${filterRating} نجوم`
                : 'كل التقييمات'}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div
        className="
          flex
          gap-2
          overflow-x-auto
          pb-1
          -mx-1
          px-1
          scrollbar-none
        "
      >
        <button
          type="button"
          onClick={() => setFilterRating(null)}
          className={`
            flex-shrink-0
            px-4
            py-2.5
            text-xs
            font-medium
            transition-all
            duration-300
          `}
          style={{
            background:
              filterRating === null
                ? DARK
                : 'rgba(255,255,255,.45)',
            color:
              filterRating === null
                ? CREAM
                : MUTED,
            border:
              filterRating === null
                ? `1px solid ${DARK}`
                : '1px solid rgba(41,42,40,.08)',
          }}
        >
          الكل
        </button>

        {[5, 4, 3, 2, 1].map((star) => {
          const active = filterRating === star

          return (
            <button
              type="button"
              key={star}
              onClick={() => setFilterRating(star)}
              className="
                flex-shrink-0
                px-3.5
                sm:px-4
                py-2.5
                text-xs
                font-medium
                transition-all
                duration-300
                flex
                items-center
                gap-1.5
              "
              style={{
                background: active
                  ? DARK
                  : 'rgba(255,255,255,.45)',
                color: active
                  ? CREAM
                  : MUTED,
                border: active
                  ? `1px solid ${DARK}`
                  : '1px solid rgba(41,42,40,.08)',
              }}
            >
              <span>{star}</span>

              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ color: GOLD }}
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          )
        })}
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {loading ? (
        <div
          className="p-14 sm:p-16 text-center"
          style={{
            background: 'rgba(255,255,255,.38)',
            border: '1px solid rgba(41,42,40,.08)',
          }}
        >
          <span
            className="
              inline-block
              w-6
              h-6
              border-2
              rounded-full
              animate-spin
            "
            style={{
              borderColor: 'rgba(180,154,104,.25)',
              borderTopColor: GOLD,
            }}
          />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="
                p-4
                sm:p-5
                transition-all
                duration-300
                hover:-translate-y-0.5
              "
              style={{
                background: 'rgba(255,255,255,.42)',
                border: '1px solid rgba(41,42,40,.08)',
                boxShadow:
                  '0 10px 30px rgba(41,42,40,.025)',
              }}
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  lg:flex-row
                  lg:items-start
                  lg:justify-between
                "
              >
                {/* REVIEW INFO */}

                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* PRODUCT IMAGE */}

                  {review.product?.images &&
                  review.product.images.length > 0 ? (
                    <img
                      src={review.product.images[0]}
                      alt=""
                      className="
                        w-11
                        h-11
                        sm:w-12
                        sm:h-12
                        rounded-xl
                        object-cover
                        flex-shrink-0
                      "
                      style={{
                        border:
                          '1px solid rgba(41,42,40,.08)',
                      }}
                    />
                  ) : (
                    <div
                      className="
                        w-11
                        h-11
                        sm:w-12
                        sm:h-12
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                      "
                      style={{
                        background:
                          'rgba(41,42,40,.035)',
                        border:
                          '1px solid rgba(41,42,40,.07)',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        style={{ color: '#C2BBB2' }}
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

                  {/* DETAILS */}

                  <div className="flex-1 min-w-0">
                    <p
                      className="
                        text-sm
                        font-semibold
                        truncate
                      "
                      style={{ color: DARK }}
                    >
                      {review.product?.title ||
                        'منتج محذوف'}
                    </p>

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                        sm:gap-3
                        mt-1.5
                      "
                    >
                      <StarRating
                        rating={review.rating}
                        size={14}
                      />

                      <span
                        className="text-[11px] sm:text-xs"
                        style={{ color: MUTED }}
                      >
                        {review.profile?.full_name ||
                          'مستخدم'}
                      </span>

                      <span
                        className="text-[10px]"
                        style={{ color: SOFT }}
                      >
                        {review.rating}/5
                      </span>
                    </div>

                    {review.comment && (
                      <p
                        className="
                          text-xs
                          mt-2.5
                          leading-[1.8]
                          line-clamp-3
                        "
                        style={{ color: MUTED }}
                      >
                        {review.comment}
                      </p>
                    )}

                    <p
                      className="
                        text-[10px]
                        mt-2
                      "
                      style={{ color: '#B7B0A8' }}
                    >
                      {new Date(
                        review.created_at
                      ).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(review.id)
                  }
                  disabled={
                    deletingId === review.id
                  }
                  className="
                    self-end
                    lg:self-start
                    flex-shrink-0
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-3
                    py-2
                    sm:p-2
                    transition-all
                    duration-200
                    disabled:opacity-30
                  "
                  style={{
                    color: '#A79F96',
                    border:
                      '1px solid rgba(41,42,40,.07)',
                    background:
                      'rgba(41,42,40,.025)',
                  }}
                  title="حذف التقييم"
                >
                  {deletingId === review.id ? (
                    <span
                      className="
                        inline-block
                        w-4
                        h-4
                        border-2
                        rounded-full
                        animate-spin
                      "
                      style={{
                        borderColor:
                          'rgba(180,154,104,.2)',
                        borderTopColor: GOLD,
                      }}
                    />
                  ) : (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                        <path d="M10 11v6M14 11v6M5 7h14M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                      </svg>

                      <span className="text-[10px] lg:hidden">
                        حذف
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="p-14 sm:p-16 text-center"
          style={{
            background: 'rgba(255,255,255,.38)',
            border: '1px solid rgba(41,42,40,.08)',
          }}
        >
          <div
            className="
              w-12
              h-12
              mx-auto
              mb-4
              rounded-full
              flex
              items-center
              justify-center
            "
            style={{
              background:
                'rgba(180,154,104,.07)',
              border:
                '1px solid rgba(180,154,104,.14)',
              color: GOLD,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>

          <p
            className="text-sm"
            style={{ color: MUTED }}
          >
            لا توجد تقييمات
            {filterRating
              ? ' بهذا التقييم'
              : ' بعد'}
          </p>
        </div>
      )}
    </div>
  )
}
