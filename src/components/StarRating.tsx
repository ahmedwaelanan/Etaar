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
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1
        const filled = displayRating >= starValue
        const halfFilled = !filled && displayRating >= starValue - 0.5

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(starValue)}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onMouseLeave={() => interactive && setHovered(null)}
            className={`relative transition-transform duration-150 ${
              interactive
                ? 'cursor-pointer hover:scale-125 active:scale-95'
                : 'cursor-default'
            }`}
            style={{ width: size, height: size }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-colors duration-150 ${
                filled || halfFilled
                  ? 'text-gold'
                  : interactive && hovered !== null
                  ? 'text-gold/40'
                  : 'text-white/15'
              }`}
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {halfFilled && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: '50%' }}
              >
                <svg
                  width={size}
                  height={size}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gold"
                >
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}