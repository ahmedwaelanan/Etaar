'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Review } from '@/types'
import StarRating from './StarRating'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ReviewFormProps {
  productId: string
  userReview: Review | null
  onSubmit: (review: Review) => void
  onUpdate: (review: Review) => void
}

export default function ReviewForm({
  productId,
  userReview,
  onSubmit,
  onUpdate,
}: ReviewFormProps) {
  const { user, profile } = useAuth()

  const [rating, setRating] = useState(
    userReview?.rating || 0
  )

  const [comment, setComment] = useState(
    userReview?.comment || ''
  )

  const [submitting, setSubmitting] = useState(false)

  /*
  =====================================================
  SUBMIT REVIEW
  =====================================================
  */

  const handleSubmit = async () => {
    if (!user) return

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)

    /*
    =====================================================
    UPDATE EXISTING REVIEW
    =====================================================
    */

    if (userReview) {
      const {
        data,
        error,
      } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment.trim() || null,
        })
        .eq('id', userReview.id)
        .select()
        .single()

      if (error) {
        if (error.code === '42501') {
          toast.error(
            'You do not have permission to edit this review'
          )
        } else {
          toast.error(
            error.message ||
              'Something went wrong while updating your review'
          )
        }
      } else {
        const reviewWithProfile: Review = {
          ...data,
          profile: {
            full_name:
              profile?.full_name || null,
            avatar_url:
              profile?.avatar_url || null,
          },
        }

        toast.success(
          'Your review has been updated'
        )

        onUpdate(reviewWithProfile)
      }
    }

    /*
    =====================================================
    CREATE NEW REVIEW
    =====================================================
    */

    else {
      const {
        data,
        error,
      } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error(
            'You have already reviewed this product'
          )
        } else if (error.code === '42501') {
          toast.error(
            'Please sign in to leave a review'
          )
        } else {
          toast.error(
            error.message ||
              'Something went wrong while submitting your review'
          )
        }
      } else {
        const reviewWithProfile: Review = {
          ...data,
          profile: {
            full_name:
              profile?.full_name || null,
            avatar_url:
              profile?.avatar_url || null,
          },
        }

        toast.success(
          'Thank you for your review!'
        )

        onSubmit(reviewWithProfile)

        setComment('')
        setRating(0)
      }
    }

    setSubmitting(false)
  }

  /*
  =====================================================
  NOT LOGGED IN
  =====================================================
  */

  if (!user) {
    return (
      <div
        className="p-7 text-center"
        dir="ltr"
        style={{
          background:
            'rgba(255,255,255,0.42)',
          border:
            '1px solid rgba(41,42,40,0.08)',
          boxShadow:
            '0 12px 35px rgba(41,42,40,0.035)',
        }}
      >
        {/* ICON */}

        <div
          className="
            w-12
            h-12
            rounded-full
            mx-auto
            mb-4
            flex
            items-center
            justify-center
          "
          style={{
            background:
              'rgba(180,154,104,0.09)',
            border:
              '1px solid rgba(180,154,104,0.18)',
            color:
              '#A88C58',
          }}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle
              cx="12"
              cy="7"
              r="4"
            />
          </svg>
        </div>

        {/* MESSAGE */}

        <p
          className="
            text-sm
            font-medium
            mb-1.5
          "
          style={{
            color:
              '#292A28',
          }}
        >
          Sign in to write a review
        </p>

        <p
          className="
            text-[11px]
            mb-5
          "
          style={{
            color:
              '#8C847A',
          }}
        >
          Share your experience with this artwork
        </p>

        {/* LOGIN */}

        <Link
          href="/auth/login"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            px-6
            py-2.5
            text-xs
            font-semibold
            transition-all
            duration-300
            hover:-translate-y-0.5
          "
          style={{
            background:
              '#292A28',
            color:
              '#F5F2ED',
            border:
              '1px solid #292A28',
            boxShadow:
              '0 8px 22px rgba(41,42,40,0.10)',
          }}
        >
          Sign In

          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    )
  }

  /*
  =====================================================
  FORM
  =====================================================
  */

  return (
    <div
      className="
        p-5
        sm:p-7
        space-y-7
      "
      dir="ltr"
      style={{
        background:
          'rgba(255,255,255,0.44)',
        border:
          '1px solid rgba(41,42,40,0.08)',
        boxShadow:
          '0 16px 40px rgba(41,42,40,0.04)',
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>

          <div
            className="
              flex
              items-center
              gap-3
              mb-2
            "
          >
            <span
              className="
                w-8
                h-px
              "
              style={{
                background:
                  '#B49A68',
              }}
            />

            <h3
              className="
                text-sm
                font-semibold
              "
              style={{
                color:
                  '#292A28',
                fontFamily:
                  'Tajawal, sans-serif',
              }}
            >
              {userReview
                ? 'Edit Your Review'
                : 'Write a Review'}
            </h3>
          </div>

          <p
            className="
              text-[11px]
              leading-relaxed
            "
            style={{
              color:
                '#8C847A',
            }}
          >
            {userReview
              ? 'Update your rating and feedback'
              : 'Share your experience with this artwork'}
          </p>
        </div>

        {/* STATUS */}

        {userReview && (
          <span
            className="
              flex-shrink-0
              inline-flex
              items-center
              gap-1.5
              px-2.5
              py-1.5
              text-[9px]
              uppercase
              tracking-[0.08em]
            "
            style={{
              background:
                'rgba(180,154,104,0.08)',
              border:
                '1px solid rgba(180,154,104,0.18)',
              color:
                '#A88C58',
            }}
          >
            <span
              className="
                w-1.5
                h-1.5
                rounded-full
              "
              style={{
                background:
                  '#B49A68',
              }}
            />

            Already Reviewed
          </span>
        )}
      </div>

      {/* =================================================
          RATING
      ================================================= */}

      <div>

        <label
          className="
            text-[10px]
            mb-3
            block
            uppercase
            tracking-[0.12em]
          "
          style={{
            color:
              '#817A71',
          }}
        >
          Rating
        </label>

        <div
          className="
            flex
            items-center
            gap-4
            px-4
            py-3
          "
          style={{
            background:
              'rgba(245,242,237,0.95)',
            border:
              '1px solid rgba(41,42,40,0.07)',
          }}
        >
          <StarRating
            rating={rating}
            size={28}
            interactive
            onRate={setRating}
          />

          {rating > 0 && (
            <span
              className="
                text-xs
                font-semibold
              "
              style={{
                color:
                  '#A88C58',
              }}
            >
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* =================================================
          COMMENT
      ================================================= */}

      <div>

        <label
          className="
            text-[10px]
            mb-2
            block
            uppercase
            tracking-[0.12em]
          "
          style={{
            color:
              '#817A71',
          }}
        >
          Comment

          <span
            className="
              normal-case
              tracking-normal
              ml-1
            "
            style={{
              color:
                '#AAA198',
            }}
          >
            (Optional)
          </span>
        </label>

        <textarea
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          className="
            w-full
            min-h-[115px]
            px-4
            py-3
            outline-none
            resize-none
            text-sm
            leading-[1.8]
            transition-all
            duration-300
          "
          style={{
            background:
              'rgba(245,242,237,0.72)',
            border:
              '1px solid rgba(41,42,40,0.10)',
            color:
              '#292A28',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor =
              'rgba(180,154,104,0.55)'

            e.currentTarget.style.boxShadow =
              '0 0 0 3px rgba(180,154,104,0.07)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor =
              'rgba(41,42,40,0.10)'

            e.currentTarget.style.boxShadow =
              'none'
          }}
          placeholder="Share your thoughts about this artwork..."
          maxLength={500}
        />

        {/* CHARACTER COUNT */}

        <div
          className="
            flex
            justify-end
            mt-1.5
          "
          dir="ltr"
        >
          <span
            className="
              text-[10px]
            "
            style={{
              color:
                comment.length >= 450
                  ? '#A88C58'
                  : '#AAA198',
            }}
          >
            {comment.length}/500
          </span>
        </div>
      </div>

      {/* =================================================
          DIVIDER
      ================================================= */}

      <div
        className="
          h-px
          w-full
        "
        style={{
          background:
            'rgba(41,42,40,0.07)',
        }}
      />

      {/* =================================================
          SUBMIT
      ================================================= */}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          submitting ||
          rating === 0
        }
        className="
          w-full
          inline-flex
          items-center
          justify-center
          gap-2
          py-3.5
          text-sm
          font-semibold
          transition-all
          duration-300
          hover:-translate-y-0.5
          disabled:opacity-40
          disabled:cursor-not-allowed
          disabled:hover:translate-y-0
        "
        style={{
          background:
            '#292A28',
          color:
            '#F5F2ED',
          border:
            '1px solid #292A28',
          boxShadow:
            '0 10px 25px rgba(41,42,40,0.10)',
        }}
      >

        {submitting ? (
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
                'rgba(245,242,237,0.25)',
              borderTopColor:
                '#B49A68',
            }}
          />
        ) : (
          <>
            {userReview
              ? 'Save Changes'
              : 'Submit Review'}

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </>
        )}
      </button>

      {/* =================================================
          HELPER TEXT
      ================================================= */}

      <p
        className="
          text-[10px]
          text-center
          leading-relaxed
        "
        style={{
          color:
            '#AAA198',
        }}
      >
        Your review helps us improve and helps
        others discover the right artwork for
        their space.
      </p>

    </div>
  )
}