'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart } = useCart()
  const router = useRouter()
  const [currentImg, setCurrentImg] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  
  // حالة السحب (Swipe)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startX = useRef(0)
  const currentX = useRef(0)
  const didSwipe = useRef(false)

  const images = product?.images && product.images.length > 0 ? product.images : []
  const sizes = product?.sizes && product.sizes.length > 0 ? product.sizes : []

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return
    if (e.touches.length === 1) {
      startX.current = e.touches[0].clientX
      currentX.current = e.touches[0].clientX
      setIsDragging(true)
      setDragOffset(0)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || images.length <= 1) return
    const diff = e.touches[0].clientX - startX.current
    setDragOffset(diff)
    currentX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!isDragging || images.length <= 1) return
    setIsDragging(false)

    const diff = currentX.current - startX.current

    if (Math.abs(diff) > 50) {
      didSwipe.current = true
      if (diff < 0) {
        // سحب لليسار = الصورة اللي بعدها
        setCurrentImg((prev) => Math.min(prev + 1, images.length - 1))
      } else {
        // سحب لليمين = الصورة اللي قبلها
        setCurrentImg((prev) => Math.max(prev - 1, 0))
      }
      // تصفير الحالة بعد فترة قصيرة عشان الـ click يشتغل طبيعي لو ضغط
      setTimeout(() => { didSwipe.current = false }, 50)
    }

    setDragOffset(0)
  }

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // منع الإضافة لو المنتج غير متوفر
    if (product.is_sold_out || (product.stock ?? 0) <= 0) {
      toast.error('هذا المنتج غير متوفر حالياً')
      return
    }

    if (sizes.length > 0) {
      setShowPopup(true)
    } else {
      addToCart(product, undefined, 1)
    }
  }

  const handlePopupAction = (action: 'cart' | 'buy') => {
    if (!selectedSize) {
      toast.error('Please select a size first')
      return
    }
    
    addToCart(product, selectedSize, quantity)
    setShowPopup(false)
    
    if (action === 'buy') {
      router.push('/cart')
    }
  }

  return (
    <>
      <Link
        href={`/shop/${product.id}`}
        className="group glass glass-hover overflow-hidden animate-slide-up block"
        dir="ltr"
        style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
        onClick={(e) => { if (didSwipe.current) e.preventDefault() }}
      >
        <div 
          className="relative aspect-[20/20.5] overflow-hidden bg-white/[0.02]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 0 ? (
            <div 
              className="flex h-full"
              style={{ 
                transform: `translateX(calc(-${currentImg * 100}% + ${dragOffset}px))`, 
                transition: isDragging ? 'none' : 'transform 0.35s ease-out' 
              }}
            >
              {images.map((img, i) => (
                <img 
                  key={i}
                  src={img} 
                  alt={product.title} 
                  loading="lazy"
                  className="w-full h-full object-cover flex-shrink-0"
                  draggable="false"
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          
          {product.is_featured && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider z-[2]" style={{background:'rgba(201,168,76,.15)',color:'#DFC06A',border:'1px solid rgba(201,168,76,.2)'}}>
              Featured
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-base/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[2] pointer-events-none" />
          
          {/* مؤشر الصور (Dots) */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-[3] pointer-events-none">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: currentImg === i ? 12 : 4,
                    height: 4,
                    background: currentImg === i ? 'rgba(201,169,110,0.8)' : 'rgba(255,255,255,0.2)'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-2.5 sm:p-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-[20px] sm:text-lg truncate group-hover:text-gold transition-colors duration-300 leading-tight">
                {product.title}
              </h3>
              <p className="text-white/60 tracking-[0.06em] text-[20px] sm:text-lg mt-0">
                {product.price} LE
              </p>
            </div>
            <button
              onClick={handleCartClick}
              className="flex-shrink-0 w-10 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #A88A3A)', color: '#0A0A08' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      </Link>

      {/* ===== Pop up اختيار المقاس ===== */}
      {showPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
          onClick={() => setShowPopup(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          <div
            className="relative w-full max-w-sm bg-[#111114] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
              {images.length > 0 ? (
                <img src={images[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-white/[0.06]" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{product.title}</p>
                <p className="text-gold font-bold text-sm mt-0.5">{product.price} LE</p>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-white/40 text-xs mb-2 block">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                        selectedSize === size
                          ? 'bg-gold/10 border-gold/30 text-gold'
                          : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* الكمية */}
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Quantity</span>
                <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-20"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
                  </button>
                  <span className="text-sm text-white font-semibold w-7 text-center tabular-nums">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    disabled={quantity >= (product.stock ?? 0)}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-20"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-white/50 text-sm">Total</span>
                <span className="text-gold font-bold text-lg tabular-nums">{(product.price * quantity).toFixed(2)} LE</span>
              </div>

              {/* الأزرار */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => handlePopupAction('cart')}
                  disabled={product.is_sold_out || (product.stock ?? 0) <= 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-white/70 hover:bg-white/[0.07] hover:text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Add to Cart
                </button>

                <button
                  onClick={() => handlePopupAction('buy')}
                  disabled={product.is_sold_out || (product.stock ?? 0) <= 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,169,110,0.25)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #A88A3A)', color: '#0A0A08' }}
                >
                  Buy It Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}