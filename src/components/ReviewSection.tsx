'use client'

import { useState, useMemo, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Review, ReviewSummary } from '@/types'
import StarRating from './StarRating'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'

interface ReviewSectionProps {
  productId: string
  initialReviews: Review[]
}

export default function ReviewSection({ productId, initialReviews }: ReviewSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent')
  const formRef = useRef<HTMLDivElement>(null)

  const summary: ReviewSummary = useMemo(() => {
    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: [5, 4, 3, 2, 1].map((stars) => ({
          stars,
          count: 0,
          percentage: 0,
        })),
      }
    }

    const total = reviews.length
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    const average = sum / total

    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((r) => r.rating === stars).length
      return {
        stars,
        count,
        percentage: Math.round((count / total) * 100),
      }
    })

    return { average, total, distribution }
  }, [reviews])

  const userReview = user ? reviews.find((r) => r.user_id === user.id) || null : null

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews]
    switch (sortBy) {
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      default:
        return sorted
    }
  }, [reviews, sortBy])

  const handleNewReview = (review: Review) => {
    setReviews((prev) => [review, ...prev])
  }

  const handleUpdateReview = (updated: Review) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="space-y-8" id="reviews-section">
      {/* ملخص التقييمات */}
      <div className="glass p-6">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* المتوسط العام */}
          <div className="flex flex-col items-center justify-center sm:min-w-[140px]">
            <span className="text-5xl font-bold text-white tabular-nums">
              {summary.average > 0 ? summary.average.toFixed(1) : '—'}
            </span>
            <StarRating
              rating={Math.round(summary.average)}
              size={16}
              className="mt-2"
            />
            <span className="text-white/30 text-xs mt-2">
              {summary.total} {summary.total === 1 ? 'تقييم' : 'تقييم'}
            </span>
          </div>

          {/* توزيع النجوم */}
          <div className="flex-1 space-y-2">
            {summary.distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <button
                  onClick={() => setSortBy(item.stars >= 3 ? 'highest' : 'lowest')}
                  className="flex items-center gap-1.5 flex-shrink-0 w-16 hover:opacity-80 transition-opacity"
                  title={`عرض تقييمات ${item.stars} نجوم`}
                >
                  <span className="text-white/50 text-xs w-3 text-left">{item.stars}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gold/70">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold/70 transition-all duration-700 ease-out"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-white/25 text-[11px] w-8 text-left tabular-nums">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* زر كتابة تقييم + ترتيب */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={scrollToForm}
          className="btn-gold text-xs !py-2.5 inline-flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          كتابة تقييم
        </button>

        {reviews.length > 1 && (
          <div className="flex items-center gap-1">
            <span className="text-white/25 text-[11px] ml-2">ترتيب:</span>
            {([
              { key: 'recent' as const, label: 'الأحدث' },
              { key: 'highest' as const, label: 'الأعلى' },
              { key: 'lowest' as const, label: 'الأقل' },
            ]).map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                  sortBy === option.key
                    ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* استمارة التقييم */}
      <div ref={formRef}>
        <ReviewForm
          productId={productId}
          userReview={userReview}
          onSubmit={handleNewReview}
          onUpdate={handleUpdateReview}
        />
      </div>

      {/* قائمة التقييمات */}
      {sortedReviews.length > 0 ? (
        <div className="space-y-3">
          {sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="glass p-14 text-center animate-fade-in">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/8 mx-auto mb-4">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-white/25 text-sm">لا توجد تقييمات بعد</p>
          <p className="text-white/15 text-xs mt-1.5">كن أول من يقيّم هذا المنتج</p>
        </div>
      )}
    </div>
  )
}