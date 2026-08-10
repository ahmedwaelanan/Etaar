'use client'

import { useState } from 'react'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: number
  interactive?: boolean
  onRate?: (rating: number) => void
  className?: string
}

const STAR_PATH =
  'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'

export default function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRate,
  className = '',
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const displayRating = hovered ?? rating

  return (
    <div
      dir="ltr"
      className={`flex flex-row items-center justify-start gap-1 ${className}`}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1

        const filled = displayRating >= starValue

        const halfFilled =
          !filled &&
          displayRating >= starValue - 0.5

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() =>
              interactive && onRate?.(starValue)
            }
            onMouseEnter={() =>
              interactive && setHovered(starValue)
            }
            onMouseLeave={() =>
              interactive && setHovered(null)
            }
            className={`relative flex-shrink-0 transition-all duration-150 ${
              interactive
                ? 'cursor-pointer hover:scale-110 active:scale-95'
                : 'cursor-default'
            }`}
            style={{
              width: size,
              height: size,
            }}
            aria-label={`${starValue} star${
              starValue > 1 ? 's' : ''
            }`}
          >
            {/* STAR */}
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              className="w-full h-full"
              fill={filled ? '#B49A68' : 'transparent'}
              stroke={
                filled || halfFilled
                  ? '#B49A68'
                  : '#B49A68'
              }
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={STAR_PATH} />
            </svg>

            {/* HALF STAR */}
            {halfFilled && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  width: '50%',
                }}
              >
                <svg
                  width={size}
                  height={size}
                  viewBox="0 0 24 24"
                  fill="#B49A68"
                  stroke="#B49A68"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={STAR_PATH} />
                </svg>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
