'use client'

import { useState, useEffect, useRef } from 'react'
import { Product, CATEGORY_LABELS, Review } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import InlineReviewList from '@/components/InlineReviewList'

export default function ProductDetailClient({
  product,
  reviews: initialReviews,
}: {
  product: Product
  reviews: Review[]
}) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const autoSlideRef = useRef<NodeJS.Timeout | null>(null)

  const images = product?.images && product.images.length > 0 ? product.images : []
  const sizes = product?.sizes && product.sizes.length > 0 ? product.sizes : []

  const startAutoSlide = () => {
    stopAutoSlide()
    if (images.length > 1) {
      autoSlideRef.current = setInterval(() => {
        setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }, 4500)
    }
  }

  const stopAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current)
      autoSlideRef.current = null
    }
  }

  const resetAutoSlide = () => {
    stopAutoSlide()
    startAutoSlide()
  }

  useEffect(() => {
    startAutoSlide()
    return () => stopAutoSlide()
  }, [images.length])

  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    resetAutoSlide()
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    resetAutoSlide()
  }

  const handleAction = (action: 'cart' | 'buy') => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size first')
      return
    }
    
    // أضفنا quantity هنا
    addToCart(product, selectedSize || undefined, quantity)
    
    if (action === 'buy') {
      router.push('/cart')
    }
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" dir="ltr">
      <Link href="/shop" className="inline-flex items-center gap-2 text-white/40 hover:text-gold text-sm transition-colors duration-200 mb-8">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* ===== ١. الصور ===== */}
        <div className="space-y-4">
          <div
            className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.02] glass"
            onMouseEnter={stopAutoSlide}
            onMouseLeave={startAutoSlide}
          >
            {images.length > 0 ? (
              <>
                {images.map((img, i) => (
                  <img key={i} src={img} alt={product.title} className={`absolute inset-0 w-full h-full object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${selectedImage === i ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.08]'}`} />
                ))}
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-white/70 hover:bg-black/60 hover:text-white transition-all duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-white/70 hover:bg-black/60 hover:text-white transition-all duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => { setSelectedImage(i); resetAutoSlide() }} className={`rounded-full transition-all duration-500 ease-out ${selectedImage === i ? 'w-6 h-1.5 bg-gold' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => { setSelectedImage(i); resetAutoSlide() }} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === i ? 'border-gold shadow-[0_0_16px_rgba(201,169,110,0.2)]' : 'border-white/[0.08] opacity-50 hover:opacity-80'}`}>
                  <img src={img} alt="" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>
        

        {/* ===== ٢. التفاصيل + ٣. الأزرار ===== */}
        <div className="space-y-2">
          <div>
            <span className="text-gold/50 text-xs tracking-wider uppercase">{CATEGORY_LABELS[product.category]}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">{product.title}</h1>
            <p className="text-3xl font-bold text-gold mt-4">{product.price} LE</p>
          </div>

                   {/* ===== اختيار المقاسات (تحت السعر وفوق الوصف) ===== */}
          {sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-white/50 text-xs font-medium">Size</label>
                {selectedSize && (
                  <button onClick={() => setSelectedSize(null)} className="text-white/20 hover:text-white/50 text-[11px] transition-colors">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                      selectedSize === size
                        ? 'bg-gold/10 border-gold/30 text-gold shadow-[0_0_12px_rgba(201,169,110,0.1)]'
                        : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/[0.15]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}



          {product.description && (
            <p className="text-white/50 leading-relaxed text-sm whitespace-pre-line">{product.description}</p>
          )}

          {/* الكمية + السعر + الأزرار */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="w-10 h-10 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-25">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
                </button>
                <span className="text-lg text-white font-semibold w-8 text-center tabular-nums">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} disabled={quantity >= (product.stock ?? 0) || product.is_sold_out} className="w-10 h-10 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-25">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
              <div className="flex-1" />
              <span className="text-gold font-bold text-xl tabular-nums">
                {(product.price * quantity).toFixed(2)} LE
              </span>
            </div>
                      {/* حالة عدم التوفر */}
          {(product.is_sold_out || (product.stock ?? 0) <= 0) && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 w-fit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
              </svg>
              <span className="text-red-400 text-sm font-semibold">Sold Out</span>
            </div>
          )}

            <div className="flex gap-3">
              <button
                onClick={() => handleAction('cart')}
                disabled={product.is_sold_out || (product.stock ?? 0) <= 0}
                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white/[0.04] border border-white/[0.1] text-white/80 hover:bg-white/[0.08] hover:border-white/[0.16] transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Add to Cart
              </button>

              <button
                onClick={() => handleAction('buy')}
                disabled={product.is_sold_out || (product.stock ?? 0) <= 0}
                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_24px_rgba(201,169,110,0.3)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A88A3A)', color: '#0A0A08' }}
              >
                Buy It Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ٤. التقييمات ===== */}
      <div className="mt-10 pt-10 border-t border-white/[0.06]">
        <InlineReviewList productId={product.id} reviews={initialReviews} />
      </div>
    </div>
  )
}