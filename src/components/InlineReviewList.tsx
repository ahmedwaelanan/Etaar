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

export default function InlineReviewList({
  productId,
  reviews: initialReviews,
}: InlineReviewListProps) {
  const { user } = useAuth()

  const [reviews, setReviews] =
    useState<Review[]>(initialReviews)

  const [current, setCurrent] = useState(0)

  const [fadeState, setFadeState] =
    useState<'in' | 'out'>('in')

  const [showForm, setShowForm] =
    useState(false)

  const [paused, setPaused] =
    useState(false)

  const timerRef =
    useRef<NodeJS.Timeout | null>(null)

  /* =========================================
     SYNC REVIEWS
  ========================================= */

  useEffect(() => {
    setReviews(initialReviews || [])
    setCurrent(0)
  }, [initialReviews])

  /* =========================================
     AVERAGE
  ========================================= */

  const avgRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / reviews.length
      : 0

  /* =========================================
     NEW REVIEW
  ========================================= */

  const handleNewReview = (review: Review) => {
    setReviews((prev) => [review, ...prev])
    setCurrent(0)
    setShowForm(false)
  }

  /* =========================================
     UPDATE REVIEW
  ========================================= */

  const handleUpdateReview = (
    updated: Review
  ) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === updated.id
          ? updated
          : review
      )
    )

    setShowForm(false)
  }

  /* =========================================
     NEXT REVIEW
  ========================================= */

  const goToNext = useCallback(() => {
    if (reviews.length <= 1) return

    setFadeState('out')

    setTimeout(() => {
      setCurrent(
        (prev) => (prev + 1) % reviews.length
      )

      setFadeState('in')
    }, 400)
  }, [reviews.length])

  /* =========================================
     AUTO SLIDER
  ========================================= */

  useEffect(() => {
    if (
      paused ||
      reviews.length <= 1 ||
      showForm
    ) {
      return
    }

    timerRef.current = setInterval(
      goToNext,
      3000
    )

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [
    paused,
    reviews.length,
    showForm,
    goToNext,
  ])

  /* =========================================
     USER REVIEW
  ========================================= */

  const userReview = user
    ? reviews.find(
        (review) =>
          review.user_id === user.id
      ) || null
    : null

  const activeReview =
    reviews[current]

  return (
    <div
      className="w-full"
      dir="ltr"
      style={{
        fontFamily: 'Tajawal, sans-serif',
      }}
    >

      {/* =====================================
          HEADER
      ===================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          mb-4
        "
      >

        {/* LEFT */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              items-center
              justify-center
              w-8
              h-8
              rounded-full
            "
            style={{
              background:
                'rgba(180,154,104,0.10)',
              border:
                '1px solid rgba(180,154,104,0.22)',
              color: '#A28A61',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>

          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <h3
                className="
                  text-sm
                  font-semibold
                "
                style={{
                  color: '#292A28',
                }}
              >
                Reviews
              </h3>

              {reviews.length > 0 && (
                <span
                  className="
                    text-[10px]
                    px-2
                    py-0.5
                    rounded-full
                  "
                  style={{
                    background:
                      'rgba(41,42,40,0.06)',
                    color: '#77716A',
                    border:
                      '1px solid rgba(41,42,40,0.08)',
                  }}
                >
                  {reviews.length}
                </span>
              )}

            </div>

            {reviews.length > 0 && (
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  mt-0.5
                "
              >
                <span
                  className="
                    text-[10px]
                  "
                  style={{
                    color: '#A28A61',
                  }}
                >
                  {avgRating.toFixed(1)}
                </span>

                <StarRating
                  rating={avgRating}
                  size={10}
                />
              </div>
            )}

          </div>

        </div>


        {/* ADD REVIEW */}

        <button
          type="button"
          onClick={() =>
            setShowForm(!showForm)
          }
          className="
            flex
            items-center
            gap-1.5
            text-xs
            font-medium
            transition-all
            duration-200
          "
          style={{
            color: '#A28A61',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color =
              '#806B48'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              '#A28A61'
          }}
        >

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          <span>
            {userReview
              ? 'Edit Review'
              : 'Add Review'}
          </span>

        </button>

      </div>


      {/* =====================================
          FORM
      ===================================== */}

      <div
        className={`
          overflow-hidden
          transition-all
          duration-400
          ease-out
          ${
            showForm
              ? 'max-h-[600px] opacity-100 mb-5'
              : 'max-h-0 opacity-0'
          }
        `}
      >

        <div
          className="
            rounded-2xl
            overflow-hidden
          "
          style={{
            background: '#EEEAE4',
            border:
              '1px solid rgba(41,42,40,0.08)',
          }}
        >

          <ReviewForm
            productId={productId}
            userReview={userReview}
            onSubmit={handleNewReview}
            onUpdate={handleUpdateReview}
          />

        </div>

      </div>


      {/* =====================================
          REVIEW SLIDER
      ===================================== */}

      {reviews.length > 0 ? (

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
          "
          style={{
            background:
              'rgba(255,255,255,0.42)',
            border:
              '1px solid rgba(41,42,40,0.08)',
            boxShadow:
              '0 8px 30px rgba(41,42,40,0.045)',
          }}
          onMouseEnter={() =>
            setPaused(true)
          }
          onMouseLeave={() =>
            setPaused(false)
          }
        >

          {/* GOLD TOP LINE */}

          <div
            className="
              absolute
              top-0
              left-0
              right-0
              h-px
            "
            style={{
              background:
                'linear-gradient(90deg, transparent, #B49A68, transparent)',
            }}
          />


          {/* REVIEW */}

          <div
            className={`
              transition-all
              duration-400
              ease-out
              ${
                fadeState === 'in'
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
              }
            `}
          >

            <div className="p-5">

              <div
                className="
                  flex
                  items-start
                  gap-3.5
                "
              >

                {/* AVATAR */}

                <div className="flex-shrink-0">

                  {activeReview.profile
                    ?.avatar_url ? (

                    <Image
                      src={
                        activeReview.profile
                          .avatar_url
                      }
                      alt=""
                      width={38}
                      height={38}
                      className="
                        w-[38px]
                        h-[38px]
                        rounded-xl
                        object-cover
                      "
                      style={{
                        border:
                          '1px solid rgba(41,42,40,0.10)',
                      }}
                    />

                  ) : (

                    <div
                      className="
                        w-[38px]
                        h-[38px]
                        rounded-xl
                        flex
                        items-center
                        justify-center
                      "
                      style={{
                        background:
                          'rgba(180,154,104,0.10)',
                        border:
                          '1px solid rgba(180,154,104,0.22)',
                      }}
                    >

                      <span
                        className="
                          font-semibold
                          text-xs
                        "
                        style={{
                          color: '#A28A61',
                        }}
                      >
                        {activeReview.profile
                          ?.full_name
                          ?.charAt(0) ||
                          'U'}
                      </span>

                    </div>

                  )}

                </div>


                {/* CONTENT */}

                <div
                  className="
                    flex-1
                    min-w-0
                  "
                >

                  {/* NAME / STARS / DATE */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2.5
                      mb-2
                      flex-wrap
                    "
                  >

                    <p
                      className="
                        text-sm
                        font-semibold
                        truncate
                      "
                      style={{
                        color: '#292A28',
                      }}
                    >
                      {activeReview.profile
                        ?.full_name ||
                        'User'}
                    </p>

                    <StarRating
                      rating={
                        activeReview.rating
                      }
                      size={11}
                    />

                    <span
                      className="
                        text-[10px]
                        flex-shrink-0
                      "
                      style={{
                        color: '#A29A91',
                      }}
                    >
                      {new Date(
                        activeReview.created_at
                      ).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
                    </span>

                  </div>


                  {/* COMMENT */}

                  {activeReview.comment ? (

                    <p
                      className="
                        text-sm
                        leading-relaxed
                        whitespace-pre-line
                      "
                      style={{
                        color: '#77716A',
                      }}
                    >
                      {activeReview.comment}
                    </p>

                  ) : (

                    <p
                      className="
                        text-sm
                        italic
                      "
                      style={{
                        color: '#B0A9A0',
                      }}
                    >
                      No comment
                    </p>

                  )}

                </div>

              </div>

            </div>

          </div>


          {/* =================================
              PROGRESS
          ================================= */}

          <div
            className="
              h-[2px]
            "
            style={{
              background:
                'rgba(41,42,40,0.055)',
            }}
          >

            <div
              className="
                h-full
                transition-all
              "
              style={{
                width:
                  fadeState === 'in'
                    ? '100%'
                    : '0%',
                background:
                  'linear-gradient(90deg, transparent, #B49A68, transparent)',
                transitionDuration:
                  fadeState === 'in'
                    ? '3000ms'
                    : '400ms',
                transitionTimingFunction:
                  fadeState === 'in'
                    ? 'linear'
                    : 'ease-out',
              }}
            />

          </div>


          {/* =================================
              DOTS
          ================================= */}

          {reviews.length > 1 && (

            <div
              className="
                flex
                items-center
                justify-center
                gap-1.5
                py-3
              "
            >

              {reviews.map((_, i) => (

                <button
                  key={i}
                  type="button"
                  aria-label={`Go to review ${i + 1}`}
                  onClick={() => {

                    if (i === current) {
                      return
                    }

                    setFadeState('out')

                    setTimeout(() => {
                      setCurrent(i)
                      setFadeState('in')
                    }, 400)

                  }}
                  className="
                    rounded-full
                    transition-all
                    duration-300
                  "
                  style={{
                    width:
                      i === current
                        ? 18
                        : 5,
                    height: 5,
                    background:
                      i === current
                        ? '#B49A68'
                        : 'rgba(41,42,40,0.15)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />

              ))}

            </div>

          )}

        </div>

      ) : (

        /* =====================================
           EMPTY STATE
        ===================================== */

        !showForm && (

          <div
            className="
              text-center
              py-9
              rounded-2xl
            "
            style={{
              background:
                'rgba(255,255,255,0.25)',
              border:
                '1px solid rgba(41,42,40,0.07)',
            }}
          >

            <div
              className="
                w-12
                h-12
                mx-auto
                mb-4
                flex
                items-center
                justify-center
                rounded-full
              "
              style={{
                background:
                  'rgba(180,154,104,0.08)',
                color: '#B49A68',
                border:
                  '1px solid rgba(180,154,104,0.15)',
              }}
            >

              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>

            </div>

            <p
              className="
                text-sm
                font-medium
              "
              style={{
                color: '#77716A',
              }}
            >
              No reviews yet
            </p>

            <p
              className="
                text-[11px]
                mt-1
              "
              style={{
                color: '#A29A91',
              }}
            >
              Be the first to review
            </p>

          </div>

        )

      )}

    </div>
  )
}