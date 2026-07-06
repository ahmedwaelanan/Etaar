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
  const [rating, setRating] = useState(userReview?.rating || 0)
  const [comment, setComment] = useState(userReview?.comment || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user) return
    if (rating === 0) {
      toast.error('يرجى اختيار تقييم')
      return
    }

    setSubmitting(true)

    if (userReview) {
      // ===== تحديث تقييم موجود =====
      const { data, error } = await supabase
        .from('reviews')
        .update({ rating, comment: comment.trim() || null })
        .eq('id', userReview.id)
        .select()
        .single()

      if (error) {
        console.error('UPDATE REVIEW ERROR:', error)
        if (error.code === '42501') {
          toast.error('ليس لديك صلاحية تعديل هذا التقييم')
        } else {
          toast.error(error.message || 'حدث خطأ أثناء التحديث')
        }
      } else {
        const reviewWithProfile: Review = {
          ...data,
          profile: {
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
          },
        }
        toast.success('تم تحديث تقييمك')
        onUpdate(reviewWithProfile)
      }
    } else {
      // ===== إضافة تقييم جديد =====
      const { data, error } = await supabase
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
        console.error('INSERT REVIEW ERROR:', error)
        if (error.code === '23505') {
          toast.error('لقد قمت بتقييم هذا المنتج بالفعل')
        } else if (error.code === '42501') {
          toast.error('يجب تسجيل الدخول أولاً')
        } else {
          toast.error(error.message || 'حدث خطأ أثناء إرسال التقييم')
        }
      } else {
        const reviewWithProfile: Review = {
          ...data,
          profile: {
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
          },
        }
        toast.success('شكراً لتقييمك!')
        onSubmit(reviewWithProfile)
        setComment('')
        setRating(0)
      }
    }

    setSubmitting(false)
  }

  if (!user) {
    return (
      <div className="glass p-8 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <p className="text-white/50 text-sm mb-4">سجّل دخولك لتتمكن من كتابة تقييم</p>
        <Link href="/auth/login" className="btn-gold text-sm inline-block">
          تسجيل الدخول
        </Link>
      </div>
    )
  }

  return (
    <div className="glass p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">
          {userReview ? 'تعديل تقييمك' : 'اكتب تقييمك'}
        </h3>
        {userReview && (
          <span className="text-[10px] text-gold/60 px-2.5 py-1 rounded-full bg-gold/[0.06] border border-gold/10">
            لقد قمت بالتقييم بالفعل
          </span>
        )}
      </div>

      <div>
        <label className="text-white/40 text-xs mb-2.5 block">التقييم</label>
        <StarRating
          rating={rating}
          size={28}
          interactive
          onRate={setRating}
        />
      </div>

      <div>
        <label className="text-white/40 text-xs mb-1.5 block">
          التعليق{' '}
          <span className="text-white/20">(اختياري)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input-dark min-h-[100px] resize-none"
          placeholder="شاركنا رأيك في المنتج..."
          maxLength={500}
        />
        <p className="text-white/20 text-[10px] mt-1.5 text-left" dir="ltr">
          {comment.length}/500
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        className="btn-gold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="inline-block w-4 h-4 border-2 border-base/30 border-t-base rounded-full animate-spin" />
        ) : userReview ? (
          'حفظ التعديلات'
        ) : (
          'إرسال التقييم'
        )}
      </button>
    </div>
  )
}