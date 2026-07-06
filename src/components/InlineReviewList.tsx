'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Review } from '@/types'
import { useAuth } from '@/context/AuthContext'
import StarRating from './StarRating'
import ReviewForm from './ReviewForm'
import Image from 'next/image'

interface InlineReviewListProps {
  productId: string
  reviews: Review[]
}

export default function InlineReviewList({ productId, reviews: initialReviews }: InlineReviewListProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [current, setCurrent] = useState(0)
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in')
  const [showForm, setShowForm] = useState(false)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const handleNewReview = (review: Review) => {
    setReviews((prev) => [review, ...prev])
    setCurrent(0)
    setShowForm(false)
  }

  const handleUpdateReview = (updated: Review) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    setShowForm(false)
  }

  const goToNext = useCallback(() => {
    if (reviews.length <= 1) return
    setFadeState('out')
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % reviews.length)
      setFadeState('in')
    }, 400)
  }, [reviews.length])

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (paused || reviews.length <= 1 || showForm) return

    timerRef.current = setInterval(goToNext, 3000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [paused, reviews.length, showForm, goToNext, current])

  const userReview = user ? reviews.find((r) => r.user_id === user.id) || null : null
  const activeReview = reviews[current]

  return (
    <div className="space-y-3" dir="ltr">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-sm">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating rating={Math.round(avgRating)} size={12} />
              <span className="text-white/30 text-[11px]">({reviews.length})</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-gold text-xs font-medium hover:text-gold/80 transition-colors duration-200"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {userReview ? 'Edit' : 'Add Review'}
        </button>
      </div>

      {/* Form */}
      <div
        className={`overflow-hidden transition-all duration-400 ease-out ${
          showForm ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ReviewForm
          productId={productId}
          userReview={userReview}
          onSubmit={handleNewReview}
          onUpdate={handleUpdateReview}
        />
      </div>

      {/* Review slideshow */}
      {reviews.length > 0 ? (
        <div
          className="relative bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className={`transition-all duration-400 ease-out ${
              fadeState === 'in'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {activeReview.profile?.avatar_url ? (
                    <Image
                      src={activeReview.profile.avatar_url}
                      alt=""
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-lg object-cover border border-white/[0.08]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center">
                      <span className="text-gold font-bold text-xs">
                        {activeReview.profile?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + stars + date */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <p className="text-white/80 text-sm font-medium truncate">
                      {activeReview.profile?.full_name || 'User'}
                    </p>
                    <StarRating rating={activeReview.rating} size={11} />
                    <span className="text-white/15 text-[10px] flex-shrink-0">
                      {new Date(activeReview.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Comment */}
                  {activeReview.comment ? (
                    <p className="text-white/45 text-sm leading-relaxed whitespace-pre-line">
                      {activeReview.comment}
                    </p>
                  ) : (
                    <p className="text-white/15 text-sm italic">No comment</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-[2px] bg-white/[0.04]">
            <div
              className="h-full bg-gold/40 transition-all"
              style={{
                width: fadeState === 'in' ? '100%' : '0%',
                transitionDuration: fadeState === 'in' ? '3000ms' : '400ms',
                transitionTimingFunction: fadeState === 'in' ? 'linear' : 'ease-out',
              }}
            />
          </div>

          {/* Dots */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-2.5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i === current) return
                    setFadeState('out')
                    setTimeout(() => {
                      setCurrent(i)
                      setFadeState('in')
                    }, 400)
                  }}
                  className="relative rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 18 : 5,
                    height: 5,
                    background: i === current ? '#C9A84C' : 'rgba(255,255,255,0.12)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-8">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/[0.06] mx-auto mb-3"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-white/20 text-xs">No reviews yet</p>
            <p className="text-white/10 text-[10px] mt-1">Be the first to review this product</p>
          </div>
        )
      )}
    </div>
  )
}