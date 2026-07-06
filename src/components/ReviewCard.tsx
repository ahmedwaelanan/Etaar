'use client'

import { Review } from '@/types'
import StarRating from './StarRating'
import Image from 'next/image'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.profile?.full_name?.charAt(0) || 'م'

  return (
    <div className="glass p-5 glass-hover">
      <div className="flex items-start gap-3.5">
        <div className="flex-shrink-0">
          {review.profile?.avatar_url ? (
            <Image
              src={review.profile.avatar_url}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover border border-white/[0.08]"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <span className="text-gold font-bold text-sm">{initials}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <p className="text-white font-medium text-sm truncate">
              {review.profile?.full_name || 'مستخدم'}
            </p>
            <span className="text-white/20 text-[11px] flex-shrink-0">
              {new Date(review.created_at).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <StarRating rating={review.rating} size={13} className="mb-2" />

          {review.comment && (
            <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}