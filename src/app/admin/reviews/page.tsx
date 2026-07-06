'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Review, Product } from '@/types'
import StarRating from '@/components/StarRating'
import toast from 'react-hot-toast'

type ReviewWithProduct = Review & { product?: Pick<Product, 'id' | 'title' | 'images'> }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchReviews = async () => {
    setLoading(true)

    // جلب التقييمات بدون join
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (!reviewsData || reviewsData.length === 0) {
      setReviews([])
      setLoading(false)
      return
    }

    // جلب المنتجات
    const productIds = [...new Set(reviewsData.map((r) => r.product_id))]
    const { data: products } = await supabase
      .from('products')
      .select('id, title, images')
      .in('id', productIds)

    const productMap = new Map((products ?? []).map((p) => [p.id, p]))

    // جلب الـ profiles
    const userIds = [...new Set(reviewsData.map((r) => r.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }])
    )

    // دمج كل شيء
    const merged: ReviewWithProduct[] = reviewsData.map((r) => ({
      ...r,
      product: productMap.get(r.product_id),
      profile: profileMap.get(r.user_id) || { full_name: null, avatar_url: null },
    }))

    setReviews(merged)
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) {
      toast.error('حدث خطأ أثناء الحذف')
    } else {
      toast.success('تم حذف التقييم')
      setReviews((prev) => prev.filter((r) => r.id !== id))
    }
    setDeletingId(null)
  }

  const filtered = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة التقييمات</h1>
          <p className="text-white/30 text-sm mt-1">{reviews.length} تقييم</p>
        </div>
        <button onClick={fetchReviews} disabled={loading} className="btn-ghost text-xs !py-2 inline-flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={loading ? 'animate-spin' : ''}
          >
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          تحديث
        </button>
      </div>

      {/* فلتر حسب النجوم */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterRating(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
            filterRating === null
              ? 'bg-gold text-base shadow-[0_0_16px_rgba(201,169,110,0.15)]'
              : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]'
          }`}
        >
          الكل
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => setFilterRating(star)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
              filterRating === star
                ? 'bg-gold text-base shadow-[0_0_16px_rgba(201,169,110,0.15)]'
                : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]'
            }`}
          >
            {star}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass p-16 text-center">
          <span className="inline-block w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div key={review.id} className="glass p-5">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {review.product?.images && review.product.images.length > 0 ? (
                    <img
                      src={review.product.images[0]}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/[0.08]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {review.product?.title || 'منتج محذوف'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <StarRating rating={review.rating} size={12} />
                      <span className="text-white/30 text-xs">
                        {review.profile?.full_name || 'مستخدم'}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-white/40 text-xs mt-2 leading-relaxed line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-white/15 text-[10px] mt-2">
                      {new Date(review.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={deletingId === review.id}
                  className="flex-shrink-0 p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/[0.06] transition-all duration-200 disabled:opacity-30"
                >
                  {deletingId === review.id ? (
                    <span className="inline-block w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-16 text-center">
          <p className="text-white/30 text-sm">
            لا توجد تقييمات{filterRating ? ` بهذا التقييم` : ' بعد'}
          </p>
        </div>
      )}
    </div>
  )
}