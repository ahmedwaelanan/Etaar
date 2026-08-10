'use client'

import { Review } from '@/types'
import StarRating from './StarRating'
import Image from 'next/image'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const initials =
    review.profile?.full_name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div
      className="
        w-full
        p-5
        sm:p-6
        transition-all
        duration-300
        hover:-translate-y-[2px]
      "
      style={{
        background: 'rgba(255,255,255,.28)',
        border: '1px solid rgba(41,42,40,.08)',
        boxShadow: '0 12px 30px rgba(41,42,40,.035)',
      }}
    >
      <div className="flex items-start gap-4">

        {/* =================================================
            AVATAR
        ================================================= */}

        <div className="flex-shrink-0">
          {review.profile?.avatar_url ? (
            <Image
              src={review.profile.avatar_url}
              alt={review.profile?.full_name || 'User'}
              width={44}
              height={44}
              className="
                w-11
                h-11
                rounded-full
                object-cover
              "
              style={{
                border: '1px solid rgba(180,154,104,.20)',
              }}
            />
          ) : (
            <div
              className="
                w-11
                h-11
                rounded-full
                flex
                items-center
                justify-center
              "
              style={{
                background: 'rgba(180,154,104,.08)',
                border: '1px solid rgba(180,154,104,.18)',
              }}
            >
              <span
                className="
                  text-sm
                  font-semibold
                "
                style={{
                  color: '#A88C58',
                }}
              >
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* =================================================
            REVIEW CONTENT
        ================================================= */}

        <div className="flex-1 min-w-0">

          {/* NAME + DATE */}

          <div
            className="
              flex
              items-start
              justify-between
              gap-3
              mb-2
            "
          >
            <div className="min-w-0">

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
                {review.profile?.full_name || 'User'}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span
                  className="
                    w-4
                    h-px
                  "
                  style={{
                    background: '#B49A68',
                  }}
                />

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.12em]
                  "
                  style={{
                    color: '#A39B91',
                  }}
                >
                  Verified Review
                </span>
              </div>

            </div>

            {/* DATE */}

            <span
              className="
                text-[10px]
                flex-shrink-0
                pt-0.5
              "
              style={{
                color: '#AAA198',
              }}
            >
              {new Date(review.created_at).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }
              )}
            </span>
          </div>

          {/* =================================================
              RATING
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-2.5
              mb-2.5
            "
          >
            <StarRating
              rating={review.rating}
              size={14}
            />

            <span
              className="
                text-[10px]
                font-medium
              "
              style={{
                color: '#A88C58',
              }}
            >
              {review.rating}/5
            </span>
          </div>

          {/* =================================================
              COMMENT
          ================================================= */}

          {review.comment ? (
            <p
              className="
                text-sm
                leading-[1.75]
                whitespace-pre-line
              "
              style={{
                color: '#716B63',
              }}
            >
              {review.comment}
            </p>
          ) : (
            <p
              className="
                text-xs
                italic
              "
              style={{
                color: '#AAA198',
              }}
            >
              No comment provided.
            </p>
          )}

        </div>
      </div>

      {/* =================================================
          BOTTOM ACCENT
      ================================================= */}

      <div
        className="
          mt-5
          h-px
          w-full
        "
        style={{
          background:
            'linear-gradient(90deg, rgba(180,154,104,.22), rgba(41,42,40,.04), transparent)',
        }}
      />
    </div>
  )
}