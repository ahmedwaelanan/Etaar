'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Product,
  CATEGORY_LABELS,
  Review,
} from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import { getGuestId } from '@/lib/manual-link-order'
import InlineReviewList from '@/components/InlineReviewList'
import ProductCard from '@/components/ProductCard'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProductDetailClient({
  product,
}: {
  product: Product
}) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const router = useRouter()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] =
    useState(false)

  const [isBuyNowModalOpen, setIsBuyNowModalOpen] =
    useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [selectedSize, setSelectedSize] =
    useState<string | null>(null)

  const [reviews, setReviews] = useState<Review[]>([])

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [relatedLoading, setRelatedLoading] = useState(true)
  const [visibleRelatedCount, setVisibleRelatedCount] = useState(4)

  const autoSlideRef =
    useRef<NodeJS.Timeout | null>(null)

  // Touch/swipe state for the main gallery and lightbox.
  const galleryTouchStart = useRef({ x: 0, y: 0 })
  const galleryTouchMoved = useRef(false)
  const lightboxTouchStart = useRef({ x: 0, y: 0 })
  const lightboxTouchMoved = useRef(false)

  const [isLightboxOpen, setIsLightboxOpen] =
    useState(false)

  const [lightboxIndex, setLightboxIndex] =
    useState(0)

  const [zoom, setZoom] = useState(1)

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })

  const [isDragging, setIsDragging] =
    useState(false)

  const dragStart = useRef({
    x: 0,
    y: 0,
  })

  /* =====================================================
     IMAGES
  ===================================================== */

  const images =
    product?.images &&
    product.images.length > 0
      ? product.images
      : []

  /* =====================================================
     PRICE
  ===================================================== */

  const basePrice =
    parseFloat(String(product?.price)) || 0

  /* =====================================================
     SIZES
  ===================================================== */

  const parsedSizes = (() => {
    try {
      if (Array.isArray(product?.sizes)) {
        return product.sizes.map((s) =>
          typeof s === 'string'
            ? JSON.parse(s)
            : s
        )
      }

      if (
        typeof product?.sizes ===
        'string'
      ) {
        return JSON.parse(
          product.sizes || '[]'
        )
      }

      return []
    } catch {
      return []
    }
  })()

  const hasSizes =
    parsedSizes.length > 0

  const getSizePrice = (
    size: any
  ) => {
    return (
      typeof size === 'object' &&
      size !== null &&
      typeof size.price === 'number'
    )
      ? size.price
      : basePrice
  }

  const getSizeName = (
    size: any
  ) => {
    return typeof size === 'object' &&
      size !== null
      ? String(size.name ?? '')
      : String(size)
  }

  const minPrice = hasSizes
    ? Math.min(
        ...parsedSizes.map(
          (size: any) =>
            getSizePrice(size)
        )
      )
    : basePrice

  let currentPrice = basePrice

  if (
    hasSizes &&
    selectedSize
  ) {
    for (
      let i = 0;
      i < parsedSizes.length;
      i++
    ) {
      if (
        getSizeName(
          parsedSizes[i]
        ) === selectedSize
      ) {
        currentPrice =
          getSizePrice(
            parsedSizes[i]
          )
        break
      }
    }
  }

  /* =====================================================
     REVIEWS
  ===================================================== */

  useEffect(() => {
    const fetchReviews =
      async () => {
        const { data } =
          await supabase
            .from('reviews')
            .select(
              '*, profile:profiles(full_name, avatar_url)'
            )
            .eq(
              'product_id',
              product.id
            )
            .order(
              'created_at',
              {
                ascending:
                  false,
              }
            )

        if (data) {
          setReviews(
            data as Review[]
          )
        }
      }

    fetchReviews()
  }, [product.id])

  /* =====================================================
     SMART RELATED PRODUCTS
  ===================================================== */

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setRelatedLoading(true)

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('id', product.id)

        if (error) {
          console.error('Related products error:', error)
          setRelatedProducts([])
          return
        }

        if (!data || data.length === 0) {
          setRelatedProducts([])
          return
        }

        const currentProductPrice =
          parseFloat(String(product.price)) || 0

        const currentCategory =
          String(product.category || '').trim().toLowerCase()

        const currentText =
          `${String(product.title || '')} ${String(product.description || '')}`.toLowerCase()

        const stopWords = new Set([
          'the', 'and', 'for', 'with', 'from', 'this', 'that',
          'wall', 'art', 'painting', 'canvas', 'frame',
          'تابلو', 'لوحة', 'لوحات', 'على', 'من', 'في', 'و', 'مع',
        ])

        const getKeywords = (text: string) =>
          text
            .replace(/[^\p{L}\p{N}\s]/gu, ' ')
            .split(/\s+/)
            .map(word => word.trim())
            .filter(word => word.length >= 3 && !stopWords.has(word))

        const currentKeywords = Array.from(
          new Set(getKeywords(currentText))
        )

        const scoredProducts = (data as Product[])
          .map((item) => {
            let score = 0

            const itemCategory =
              String(item.category || '').trim().toLowerCase()

            const itemTitle =
              String(item.title || '').toLowerCase()

            const itemDescription =
              String(item.description || '').toLowerCase()

            const itemText = `${itemTitle} ${itemDescription}`
            const itemPrice = parseFloat(String(item.price)) || 0

            // Same category is the strongest signal.
            if (currentCategory && itemCategory === currentCategory) {
              score += 50
            }

            // Similar price range.
            if (currentProductPrice > 0 && itemPrice > 0) {
              const priceRatio =
                Math.abs(currentProductPrice - itemPrice) / currentProductPrice

              if (priceRatio <= 0.10) score += 25
              else if (priceRatio <= 0.20) score += 18
              else if (priceRatio <= 0.35) score += 10
            }

            // Shared title/description keywords.
            let matchedKeywords = 0
            currentKeywords.forEach((keyword) => {
              if (itemText.includes(keyword)) {
                matchedKeywords += 1
              }
            })
            score += Math.min(matchedKeywords * 6, 30)

            // Featured / available products get a small boost.
            if ((item as any).featured === true) score += 8

            const status = String((item as any).status || '').toLowerCase()
            if (status !== 'sold' && status !== 'unavailable') {
              score += 5
            }

            return { product: item, score }
          })
          .sort((a, b) => b.score - a.score)

        setRelatedProducts(
          scoredProducts.slice(0, 8).map(item => item.product)
        )
        setVisibleRelatedCount(4)
      } catch (error) {
        console.error('Failed to load related products:', error)
        setRelatedProducts([])
      } finally {
        setRelatedLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [product.id, product.category, product.title, product.description, product.price])

  /* =====================================================
     DEFAULT SIZE
  ===================================================== */

  useEffect(() => {
    if (
      hasSizes &&
      parsedSizes.length > 0 &&
      !selectedSize
    ) {
      setSelectedSize(
        getSizeName(
          parsedSizes[0]
        )
      )
    }
  }, [
    hasSizes,
    selectedSize,
  ])

  /* =====================================================
     AUTO SLIDER
  ===================================================== */

  const stopAutoSlide =
    () => {
      if (
        autoSlideRef.current
      ) {
        clearInterval(
          autoSlideRef.current
        )

        autoSlideRef.current =
          null
      }
    }

  const startAutoSlide =
    () => {
      stopAutoSlide()

      if (images.length > 1) {
        autoSlideRef.current =
          setInterval(() => {
            setSelectedImage(
              (prev) =>
                prev ===
                images.length - 1
                  ? 0
                  : prev + 1
            )
          }, 4500)
      }
    }

  const resetAutoSlide =
    () => {
      stopAutoSlide()
      startAutoSlide()
    }

  useEffect(() => {
    startAutoSlide()

    return () => {
      stopAutoSlide()
    }
  }, [images.length])

  /* =====================================================
     IMAGE NAVIGATION
  ===================================================== */

  const prevImage = () => {
    setSelectedImage(
      (prev) =>
        prev === 0
          ? images.length - 1
          : prev - 1
    )

    resetAutoSlide()
  }

  const nextImage = () => {
    setSelectedImage(
      (prev) =>
        prev ===
        images.length - 1
          ? 0
          : prev + 1
    )

    resetAutoSlide()
  }

  /* =====================================================
     TOUCH / SWIPE NAVIGATION
  ===================================================== */

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return

    stopAutoSlide()
    galleryTouchMoved.current = false

    const touch = e.touches[0]
    galleryTouchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }

  const handleGalleryTouchMove = (e: React.TouchEvent) => {
    if (images.length <= 1) return

    const touch = e.touches[0]
    const dx = touch.clientX - galleryTouchStart.current.x
    const dy = touch.clientY - galleryTouchStart.current.y

    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      galleryTouchMoved.current = true
      e.preventDefault()
    }
  }

  const handleGalleryTouchEnd = (e: React.TouchEvent) => {
    if (images.length <= 1) {
      startAutoSlide()
      return
    }

    const touch = e.changedTouches[0]
    const dx = touch.clientX - galleryTouchStart.current.x
    const dy = touch.clientY - galleryTouchStart.current.y

    if (
      Math.abs(dx) >= 45 &&
      Math.abs(dx) > Math.abs(dy) * 1.15
    ) {
      if (dx < 0) {
        nextImage()
      } else {
        prevImage()
      }
      galleryTouchMoved.current = true
    } else {
      startAutoSlide()
    }
  }

  /* =====================================================
     LIGHTBOX
  ===================================================== */

  const openLightbox = (
    index: number
  ) => {
    setLightboxIndex(index)
    setZoom(1)
    setPosition({
      x: 0,
      y: 0,
    })

    setIsLightboxOpen(true)

    document.body.style.overflow =
      'hidden'
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)

    document.body.style.overflow =
      'unset'
  }

  const lightboxPrev = () => {
    setLightboxIndex(
      (prev) =>
        prev === 0
          ? images.length - 1
          : prev - 1
    )

    setZoom(1)

    setPosition({
      x: 0,
      y: 0,
    })
  }

  const lightboxNext = () => {
    setLightboxIndex(
      (prev) =>
        prev ===
        images.length - 1
          ? 0
          : prev + 1
    )

    setZoom(1)

    setPosition({
      x: 0,
      y: 0,
    })
  }

  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return

    lightboxTouchMoved.current = false
    const touch = e.touches[0]

    lightboxTouchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }

  const handleLightboxTouchMove = (e: React.TouchEvent) => {
    if (images.length <= 1 || zoom > 1) return

    const touch = e.touches[0]
    const dx = touch.clientX - lightboxTouchStart.current.x
    const dy = touch.clientY - lightboxTouchStart.current.y

    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      lightboxTouchMoved.current = true
      e.preventDefault()
    }
  }

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    if (images.length <= 1 || zoom > 1) return

    const touch = e.changedTouches[0]
    const dx = touch.clientX - lightboxTouchStart.current.x
    const dy = touch.clientY - lightboxTouchStart.current.y

    if (
      Math.abs(dx) >= 45 &&
      Math.abs(dx) > Math.abs(dy) * 1.15
    ) {
      if (dx < 0) {
        lightboxNext()
      } else {
        lightboxPrev()
      }

      lightboxTouchMoved.current = true
      e.stopPropagation()
    }
  }

  const handleWheel = (
    e: React.WheelEvent
  ) => {
    e.preventDefault()

    const zoomFactor =
      e.deltaY < 0
        ? 0.15
        : -0.15

    setZoom((prev) =>
      Math.max(
        1,
        Math.min(
          4,
          prev + zoomFactor
        )
      )
    )
  }

  const handleMouseDown = (
    e: React.MouseEvent
  ) => {
    if (zoom > 1) {
      e.preventDefault()

      setIsDragging(true)

      dragStart.current = {
        x:
          e.clientX -
          position.x,
        y:
          e.clientY -
          position.y,
      }
    }
  }

  const handleMouseMove = (
    e: React.MouseEvent
  ) => {
    if (!isDragging) return

    setPosition({
      x:
        e.clientX -
        dragStart.current.x,

      y:
        e.clientY -
        dragStart.current.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  /* =====================================================
     BUY NOW
  ===================================================== */

  const openBuyNowModal = () => {
    if (hasSizes && !selectedSize) {
      toast.error('Please select a size')
      return
    }

    setIsBuyNowModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeBuyNowModal = () => {
    setIsBuyNowModalOpen(false)
    document.body.style.overflow = 'unset'
  }

  const generateUUID = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
      const r = Math.random() * 16 | 0
      const v =
        c === 'x'
          ? r
          : (r & 0x3) | 0x8

      return v.toString(16)
    }
  )
}

  /* =====================================================
     ORDER
  ===================================================== */

  const handleOrder =
    async () => {
      if (
        hasSizes &&
        !selectedSize
      ) {
        toast.error(
          'Please select a size'
        )
        return
      }

      if (
        !fullName.trim() ||
        !phone.trim() ||
        !address.trim()
      ) {
        toast.error(
          'Please fill in all shipping details'
        )
        return
      }

      setLoading(true)

      const {
        data,
        error,
      } = await supabase
        .from('orders')
        .insert({
          user_id:
            user?.id || null,

          guest_id: user
            ? null
            : getGuestId(),

          product_id:
            product.id,

          quantity,

          total_price:
            currentPrice *
            quantity,

          status: 'Pending',

          size: selectedSize,

          group_id:
            generateUUID(),

          full_name:
            fullName.trim(),

          phone_number:
            phone.trim(),

          shipping_address:
            address.trim(),
        })

      if (error) {
        console.error(
          'FULL ERROR DETAILS:',
          error
        )

        toast.error(
          `DB Error: ${error.message}`
        )
      } else {
        setIsBuyNowModalOpen(false)
        document.body.style.overflow = 'unset'

        setIsSuccessModalOpen(
          true
        )

        setFullName('')
        setPhone('')
        setAddress('')
        setQuantity(1)
      }

      setLoading(false)
    }

  return (
    <>
      <main
        className="min-h-screen"
        style={{
          background:
            '#F5F2ED',
          color: '#292A28',
          fontFamily:
            'Tajawal, sans-serif',
        }}
      >
        {/* =================================================
            PAGE CONTAINER
        ================================================= */}

        <div
          className="
            max-w-[1180px]
            mx-auto
            px-5
            sm:px-6
            py-10
            sm:py-14
            lg:py-16
          "
        >
          {/* =================================================
              BACK
          ================================================= */}

          <div className="mb-8">
            <Link
              href="/shop"
              className="
                inline-flex
                items-center
                gap-2
                text-xs
                transition-all
                duration-300
                hover:-translate-x-1
              "
              style={{
                color:
                  '#817A71',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>

              <span>
                العودة إلى المتجر
              </span>
            </Link>
          </div>

          {/* =================================================
              PRODUCT LAYOUT

              IMPORTANT:
              LTR layout
              IMAGE = LEFT
              INFO = RIGHT
          ================================================= */}

          <div
            dir="ltr"
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-10
              lg:gap-16
              items-start
            "
          >
            {/* =================================================
                GALLERY — LEFT
            ================================================= */}

            <div
              className="
                space-y-4
                min-w-0
              "
            >
              <div
                className="
                  relative
                  aspect-square
                  overflow-hidden
                  cursor-zoom-in
                "
                style={{
                  background: '#EEEAE4',
                  border: '1px solid rgba(41,42,40,.08)',
                  boxShadow: '0 20px 55px rgba(41,42,40,.07)',
                  touchAction: 'pan-y',
                }}
                onMouseEnter={
                  stopAutoSlide
                }
                onMouseLeave={
                  startAutoSlide
                }
                onTouchStart={handleGalleryTouchStart}
                onTouchMove={handleGalleryTouchMove}
                onTouchEnd={handleGalleryTouchEnd}
                onClick={() => {
                  if (!galleryTouchMoved.current) {
                    openLightbox(selectedImage)
                  }
                  galleryTouchMoved.current = false
                }}
              >
                {images.length >
                0 ? (
                  <>
                    {images.map(
                      (
                        img,
                        i
                      ) => (
                        <img
                          key={i}
                          src={img}
                          alt={
                            product.title
                          }
                          className={`
                            absolute
                            inset-0
                            w-full
                            h-full
                            object-cover
                            transition-all
                            duration-[800ms]
                            ease-[cubic-bezier(0.4,0,0.2,1)]
                            ${
                              selectedImage ===
                              i
                                ? 'opacity-100 scale-100'
                                : 'opacity-0 scale-[1.04]'
                            }
                          `}
                        />
                      )
                    )}

                    <div
                      className="
                        absolute
                        inset-0
                        pointer-events-none
                      "
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(41,42,40,.02), rgba(41,42,40,.08))',
                      }}
                    />
                  </>
                ) : (
                  <div
                    className="
                      w-full
                      h-full
                      flex
                      items-center
                      justify-center
                    "
                    style={{
                      color:
                        'rgba(41,42,40,.15)',
                    }}
                  >
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                      />

                      <circle
                        cx="8.5"
                        cy="8.5"
                        r="1.5"
                      />

                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}

                {/* IMAGE ARROWS */}

                {images.length >
                  1 && (
                  <>
                    <button
                      type="button"
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation()
                        prevImage()
                      }}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        w-10
                        h-10
                        rounded-full
                        flex
                        items-center
                        justify-center
                        transition-all
                        duration-300
                      "
                      style={{
                        background:
                          'rgba(245,242,237,.82)',

                        border:
                          '1px solid rgba(41,42,40,.10)',

                        color:
                          '#5F5A54',

                        boxShadow:
                          '0 8px 22px rgba(41,42,40,.10)',

                        backdropFilter:
                          'blur(10px)',
                      }}
                      aria-label="Previous image"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation()
                        nextImage()
                      }}
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        w-10
                        h-10
                        rounded-full
                        flex
                        items-center
                        justify-center
                        transition-all
                        duration-300
                      "
                      style={{
                        background:
                          'rgba(245,242,237,.82)',

                        border:
                          '1px solid rgba(41,42,40,.10)',

                        color:
                          '#5F5A54',

                        boxShadow:
                          '0 8px 22px rgba(41,42,40,.10)',

                        backdropFilter:
                          'blur(10px)',
                      }}
                      aria-label="Next image"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* DOTS */}

                    <div
                      className="
                        absolute
                        bottom-4
                        left-1/2
                        -translate-x-1/2
                        flex
                        items-center
                        gap-1.5
                      "
                    >
                      {images.map(
                        (
                          _,
                          i
                        ) => (
                          <button
                            type="button"
                            key={
                              i
                            }
                            onClick={(
                              e
                            ) => {
                              e.stopPropagation()

                              setSelectedImage(
                                i
                              )

                              resetAutoSlide()
                            }}
                            className={`
                              rounded-full
                              transition-all
                              duration-500
                              ${
                                selectedImage ===
                                i
                                  ? 'w-7 h-1.5'
                                  : 'w-1.5 h-1.5'
                              }
                            `}
                            style={{
                              background:
                                selectedImage ===
                                i
                                  ? '#B49A68'
                                  : 'rgba(245,242,237,.65)',
                            }}
                            aria-label={`Image ${
                              i + 1
                            }`}
                          />
                        )
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* THUMBNAILS */}

              {images.length >
                1 && (
                <div
                  className="
                    flex
                    gap-3
                    overflow-x-auto
                    pb-2
                  "
                  style={{
                    scrollbarWidth:
                      'none',
                  }}
                >
                  {images.map(
                    (
                      img,
                      i
                    ) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          setSelectedImage(
                            i
                          )

                          resetAutoSlide()
                        }}
                        className="
                          flex-shrink-0
                          w-[76px]
                          h-[76px]
                          overflow-hidden
                          transition-all
                          duration-300
                        "
                        style={{
                          border:
                            selectedImage ===
                            i
                              ? '1px solid #B49A68'
                              : '1px solid rgba(41,42,40,.10)',

                          opacity:
                            selectedImage ===
                            i
                              ? 1
                              : 0.58,

                          boxShadow:
                            selectedImage ===
                            i
                              ? '0 8px 20px rgba(180,154,104,.16)'
                              : 'none',

                          background:
                            '#EEEAE4',
                        }}
                      >
                        <img
                          src={img}
                          alt=""
                          className="
                            object-cover
                            w-full
                            h-full
                          "
                        />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                PRODUCT INFO — RIGHT
            ================================================= */}

            <div
              dir="ltr"
              className="
                space-y-7
                min-w-0
              "
            >
              {/* CATEGORY */}

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-4
                  "
                >
                  <span
                    className="w-8 h-px"
                    style={{
                      background:
                        '#B49A68',
                    }}
                  />

                  <span
                    className="
                      text-[10px]
                      tracking-[0.22em]
                      uppercase
                    "
                    style={{
                      color:
                        '#A28A61',
                    }}
                  >
                    {
                      CATEGORY_LABELS[
                        product.category
                      ]
                    }
                  </span>
                </div>

                <div className="flex items-start gap-5">
                  <div className="min-w-0 flex-1">
                    <h1
                      className="
                        text-3xl
                        sm:text-4xl
                        lg:text-[42px]
                        font-bold
                      "
                      style={{
                        color: '#292A28',
                        fontFamily: 'Amiri, serif',
                        lineHeight: 1.25,
                      }}
                    >
                      {product.title}
                    </h1>

                    {/* PRICE */}
                    <div
                      className="
                        flex
                        items-baseline
                        gap-3
                        mt-5
                      "
                    >
                      <p
                        className="
                          text-3xl
                          font-bold
                        "
                        style={{
                          color: '#A88C58',
                        }}
                      >
                        {Math.round(currentPrice)} EGP
                      </p>
                    </div>
                    
                  </div>

                  {/* ACTIONS — RIGHT OF PRODUCT NAME / PRICE */}
                  <div
                    className="
                      flex
                      flex-col
                      gap-2
                      shrink-0
                      w-[94px]
                    "
                    dir="ltr"
                  >
                    {/* ADD TO CART */}
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product)
                        toast.success('Added to cart!')
                      }}
                      className="
                        min-w-[86px]
                        h-11
                        sm:min-w-[94px]
                        sm:h-12
                        px-3
                        flex
                        items-center
                        justify-center
                        gap-2
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:scale-[1.03]
                      "
                      style={{
                        background: '#292A28',
                        color: '#F5F2ED',
                        border: '1px solid #292A28',
                        boxShadow: '0 10px 25px rgba(41,42,40,.12)',
                      }}
                      aria-label="Add to Cart"
                      title="Add to Cart"
                    >
                
                      <span className="text-[14px] font-semibold tracking-wide">
                        Cart
                      </span>
                            <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />
                        <circle cx="10" cy="20" r="1" />
                        <circle cx="18" cy="20" r="1" />
                        <path d="M12 5v6M9 8h6" />
                      </svg>
                    </button>

                    {/* BUY NOW */}
                    <button
                      type="button"
                      onClick={openBuyNowModal}
                      className="
                        min-w-[86px]
                        h-11
                        sm:min-w-[94px]
                        sm:h-12
                        px-3
                        flex
                        items-center
                        justify-center
                        gap-2
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:scale-[1.03]
                      "
                      style={{
                        background: '#B49A68',
                        color: '#F5F2ED',
                        border: '1px solid #B49A68',
                        boxShadow: '0 10px 25px rgba(180,154,104,.18)',
                      }}
                      aria-label="Buy Now"
                      title="Buy Now"
                    >
                  
                      <span className="text-[14px] font-semibold tracking-wide">
                        Buy
                      </span>
                          <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 7h12l-1 13H7L6 7Z" />
                        <path d="M9 7a3 3 0 0 1 6 0" />
                        <path d="M9 11h.01M15 11h.01" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {/* SIZES — DIRECTLY UNDER PRICE */}

{hasSizes && (
  <div className="mt-5">
    <div
      className="
        flex
        items-center
        justify-between
        mb-2.5
      "
    >
      <div className="flex items-center gap-2">
        <span
          className="
            text-[10px]
            uppercase
            tracking-[0.14em]
            font-medium
          "
          style={{
            color: '#8A837A',
          }}
        >
          Size
        </span>

        <span
          className="text-[10px]"
          style={{
            color: '#B0A79D',
          }}
        >
          — المقاس
        </span>
      </div>

      {selectedSize && (
        <span
          className="
            text-[10px]
            font-medium
          "
          style={{
            color: '#A28A61',
          }}
        >
          {selectedSize}
        </span>
      )}
    </div>

    <div
      className="
        flex
        flex-wrap
        gap-2
      "
    >
      {parsedSizes.map(
        (
          size: any,
          i: number
        ) => {
          const sizeName =
            getSizeName(size)

          const sizePrice =
            getSizePrice(size)

          const isSelected =
            selectedSize === sizeName

          return (
            <button
              type="button"
              key={
                sizeName || i
              }
              onClick={() =>
                setSelectedSize(
                  sizeName
                )
              }
              className="
                group
                relative
                min-w-[92px]
                sm:min-w-[100px]
                px-3
                py-2.5
                transition-all
                duration-300
                text-left
              "
              style={{
                borderRadius: 8,

                border: isSelected
                  ? '1px solid #B49A68'
                  : '1px solid rgba(41,42,40,.10)',

                background: isSelected
                  ? 'rgba(180,154,104,.09)'
                  : 'rgba(255,255,255,.32)',

                boxShadow: isSelected
                  ? '0 6px 18px rgba(180,154,104,.10)'
                  : '0 3px 12px rgba(41,42,40,.025)',

                transform: isSelected
                  ? 'translateY(-1px)'
                  : 'none',
              }}
            >
              {/* SELECTED INDICATOR */}

              {isSelected && (
                <span
                  className="
                    absolute
                    top-2
                    right-2
                    w-1.5
                    h-1.5
                    rounded-full
                  "
                  style={{
                    background:
                      '#B49A68',
                  }}
                />
              )}

              <span
                className="
                  block
                  text-[13px]
                  font-medium
                  leading-tight
                  pr-3
                "
                style={{
                  color: isSelected
                    ? '#8E7650'
                    : '#5F5A54',
                }}
              >
                {sizeName}
              </span>

              <span
                className="
                  block
                  text-[10px]
                  mt-1
                  leading-none
                "
                style={{
                  color: isSelected
                    ? '#A28A61'
                    : '#9A9288',
                }}
              >
                {Math.round(
                  sizePrice
                )}{' '}
                EGP
              </span>
            </button>
          )
        }
      )}
    </div>
  </div>
)}

              {/* DESCRIPTION */}

              {product.description && (
                <p
                  className="
                    leading-[1.9]
                    text-sm
                    whitespace-pre-line
                  "
                  style={{
                    color:
                      '#77716A',
                  }}
                >
                  {
                    product.description
                  }
                </p>
              )}

              {/* REVIEWS */}

              <div className="pt-1">
                <InlineReviewList
                  productId={
                    product.id
                  }
                  reviews={
                    reviews
                  }
                />
              </div>
            </div>
          </div>

          {/* =================================================
              SMART RELATED PRODUCTS
          ================================================= */}

          {!relatedLoading && relatedProducts.length > 0 && (
            <section className="mt-20 sm:mt-24" dir="ltr">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-8 h-px"
                    style={{ background: '#B49A68' }}
                  />
                  <span
                    className="text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: '#A28A61' }}
                  >
                    You May Also Like
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <h2
                      className="text-2xl sm:text-3xl font-bold"
                      style={{
                        color: '#292A28',
                        fontFamily: 'Amiri, serif',
                      }}
                    >
                      Curated For You
                    </h2>
                    <p
                      className="text-xs sm:text-sm mt-2"
                      style={{ color: '#817A71' }}
                    >
                      Pieces selected to complement the artwork you are viewing.
                    </p>
                  </div>

                  <Link
                    href="/shop"
                    className="text-xs transition-all duration-300 hover:translate-x-1"
                    style={{ color: '#A28A61' }}
                  >
                    View All →
                  </Link>
                </div>
              </div>

              <div
                className="
                  grid
                  grid-cols-2
                  md:grid-cols-3
                  lg:grid-cols-4
                  gap-4
                  sm:gap-6
                "
              >
                {relatedProducts
                  .slice(0, visibleRelatedCount)
                  .map(
                    (relatedProduct, index) => (
                      <ProductCard
                        key={relatedProduct.id}
                        product={relatedProduct}
                        index={index}
                        viewMode="grid"
                      />
                    )
                  )}
              </div>

              {visibleRelatedCount < relatedProducts.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleRelatedCount((prev) =>
                        Math.min(prev + 4, relatedProducts.length)
                      )
                    }
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      px-7
                      py-3
                      text-xs
                      font-medium
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                    "
                    style={{
                      color: '#6F675E',
                      background: 'rgba(255,255,255,.34)',
                      border: '1px solid rgba(41,42,40,.12)',
                      boxShadow: '0 8px 24px rgba(41,42,40,.05)',
                    }}
                  >
                    <span>More</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="transition-transform duration-300 group-hover:translate-y-0.5"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      {isLightboxOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
          "
          style={{
            background:
              'rgba(35,33,30,.96)',
          }}
          onClick={(e) => {
            if (
              e.target === e.currentTarget &&
              !lightboxTouchMoved.current
            ) {
              closeLightbox()
            }
            lightboxTouchMoved.current = false
          }}
        >
          {/* CLOSE */}

          <button
            type="button"
            onClick={
              closeLightbox
            }
            className="
              absolute
              top-5
              right-5
              z-[110]
              w-10
              h-10
              rounded-full
              flex
              items-center
              justify-center
              transition-all
            "
            style={{
              background:
                'rgba(245,242,237,.10)',

              border:
                '1px solid rgba(245,242,237,.14)',

              color:
                'rgba(245,242,237,.85)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* COUNTER */}

          <div
            className="
              absolute
              top-6
              left-1/2
              -translate-x-1/2
              text-xs
              z-[110]
            "
            style={{
              color:
                'rgba(245,242,237,.55)',
            }}
          >
            {lightboxIndex +
              1}{' '}
            / {images.length}
          </div>

          {/* PREVIOUS */}

          {images.length >
            1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                lightboxPrev()
              }}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                z-[110]
                w-12
                h-12
                rounded-full
                flex
                items-center
                justify-center
              "
              style={{
                background:
                  'rgba(245,242,237,.08)',

                border:
                  '1px solid rgba(245,242,237,.12)',

                color:
                  '#F5F2ED',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* NEXT */}

          {images.length >
            1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                lightboxNext()
              }}
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                z-[110]
                w-12
                h-12
                rounded-full
                flex
                items-center
                justify-center
              "
              style={{
                background:
                  'rgba(245,242,237,.08)',

                border:
                  '1px solid rgba(245,242,237,.12)',

                color:
                  '#F5F2ED',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* IMAGE */}

          <div
            className="
              w-full
              h-full
              flex
              items-center
              justify-center
              overflow-hidden
              p-8
              sm:p-12
            "
            onWheel={
              handleWheel
            }
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
            onMouseDown={
              handleMouseDown
            }
            onMouseMove={
              handleMouseMove
            }
            onMouseUp={
              handleMouseUp
            }
            onMouseLeave={
              handleMouseUp
            }
            style={{
              cursor:
                zoom > 1
                  ? isDragging
                    ? 'grabbing'
                    : 'grab'
                  : 'zoom-in',
            }}
          >
            {images[
              lightboxIndex
            ] && (
              <img
                src={
                  images[
                    lightboxIndex
                  ]
                }
                alt={
                  product.title
                }
                draggable={
                  false
                }
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="
                  max-w-full
                  max-h-full
                  object-contain
                  select-none
                  pointer-events-none
                "
                style={{
                  transform: `scale(${zoom}) translate(${
                    position.x /
                    zoom
                  }px, ${
                    position.y /
                    zoom
                  }px)`,

                  transition:
                    isDragging
                      ? 'transform 0s linear'
                      : 'transform .2s ease-out',
                }}
              />
            )}
          </div>

          {/* LIGHTBOX THUMBNAILS */}

          {images.length >
            1 && (
            <div
              className="
                absolute
                bottom-5
                left-1/2
                -translate-x-1/2
                flex
                gap-2
                z-[110]
                max-w-[90vw]
                overflow-x-auto
                pb-1
              "
            >
              {images.map(
                (
                  img,
                  i
                ) => (
                  <button
                    type="button"
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()

                      setLightboxIndex(
                        i
                      )

                      setZoom(
                        1
                      )

                      setPosition(
                        {
                          x: 0,
                          y: 0,
                        }
                      )
                    }}
                    className="
                      w-12
                      h-12
                      flex-shrink-0
                      overflow-hidden
                      transition-all
                    "
                    style={{
                      border:
                        lightboxIndex ===
                        i
                          ? '1px solid #B49A68'
                          : '1px solid rgba(245,242,237,.18)',

                      opacity:
                        lightboxIndex ===
                        i
                          ? 1
                          : 0.5,
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          BUY NOW MODAL
      ===================================================== */}

      {isBuyNowModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-[115]
            flex
            items-center
            justify-center
            p-4
          "
        >
          {/* BACKDROP */}
          <div
            className="
              absolute
              inset-0
              backdrop-blur-md
            "
            style={{
              background: 'rgba(41,42,40,.58)',
            }}
            onClick={closeBuyNowModal}
          />

          {/* MODAL */}
          <div
            className="
              relative
              w-full
              max-w-2xl
              max-h-[92vh]
              overflow-y-auto
              p-6
              sm:p-8
              animate-fade-in
            "
            style={{
              background: '#F5F2ED',
              border: '1px solid rgba(41,42,40,.10)',
              boxShadow: '0 30px 90px rgba(41,42,40,.25)',
            }}
            dir="ltr"
          >
            {/* CLOSE */}
            <button
              type="button"
              onClick={closeBuyNowModal}
              className="
                absolute
                top-4
                right-4
                w-9
                h-9
                flex
                items-center
                justify-center
                transition-all
                duration-300
                hover:scale-105
              "
              style={{
                background: 'rgba(41,42,40,.06)',
                border: '1px solid rgba(41,42,40,.10)',
                color: '#686158',
              }}
              aria-label="Close"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* HEADER */}
            <div className="pr-12 mb-7">
              <div
                className="text-[10px] uppercase tracking-[0.18em] mb-2"
                style={{ color: '#A28A61' }}
              >
                Quick Checkout
              </div>

              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{
                  color: '#292A28',
                  fontFamily: 'Amiri, serif',
                }}
              >
                {product.title}
              </h2>

              <div className="flex items-center gap-3 mt-2">
                <span
                  className="text-xl font-bold"
                  style={{ color: '#A88C58' }}
                >
                  {Math.round(currentPrice)} EGP
                </span>

                {selectedSize && (
                  <span
                    className="text-xs px-3 py-1"
                    style={{
                      color: '#756E65',
                      background: '#EEEAE4',
                      border: '1px solid rgba(41,42,40,.08)',
                    }}
                  >
                    {selectedSize}
                  </span>
                )}
              </div>
            </div>

            {/* SHIPPING */}
            <div
              className="space-y-6"
              style={{
                background: 'rgba(255,255,255,.30)',
                border: '1px solid rgba(41,42,40,.08)',
                boxShadow: '0 18px 45px rgba(41,42,40,.045)',
                backdropFilter: 'blur(12px)',
                padding: '24px',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-9
                    h-9
                    flex
                    items-center
                    justify-center
                    rounded-full
                  "
                  style={{
                    background: 'rgba(180,154,104,.10)',
                    color: '#A88C58',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  >
                    <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                    <circle cx="7" cy="19" r="1.5" />
                    <circle cx="18" cy="19" r="1.5" />
                  </svg>
                </div>

                <div>
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: '#292A28' }}
                  >
                    Shipping Details
                  </h3>
                  <span
                    className="text-[11px]"
                    style={{ color: '#9A9288' }}
                  >
                    بيانات الشحن
                  </span>
                </div>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-4
                "
              >
                {/* FULL NAME */}
                <div>
                  <label
                    className="
                      text-[10px]
                      mb-1.5
                      block
                      uppercase
                      tracking-[0.12em]
                    "
                    style={{ color: '#8B837A' }}
                  >
                    Full Name
                    <span
                      className="normal-case tracking-normal"
                      style={{ color: '#AAA198' }}
                    >
                      {' '}— الاسم بالكامل
                    </span>
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="
                      w-full
                      h-11
                      px-4
                      outline-none
                      transition-all
                      duration-300
                    "
                    style={{
                      background: 'rgba(245,242,237,.72)',
                      border: '1px solid rgba(41,42,40,.10)',
                      color: '#292A28',
                    }}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label
                    className="
                      text-[10px]
                      mb-1.5
                      block
                      uppercase
                      tracking-[0.12em]
                    "
                    style={{ color: '#8B837A' }}
                  >
                    Phone Number
                    <span
                      className="normal-case tracking-normal"
                      style={{ color: '#AAA198' }}
                    >
                      {' '}— رقم الهاتف
                    </span>
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="
                      w-full
                      h-11
                      px-4
                      outline-none
                      transition-all
                      duration-300
                    "
                    style={{
                      background: 'rgba(245,242,237,.72)',
                      border: '1px solid rgba(41,42,40,.10)',
                      color: '#292A28',
                    }}
                    placeholder="01xxxxxxxxx"
                  />
                </div>

                {/* ADDRESS */}
                <div className="sm:col-span-2">
                  <label
                    className="
                      text-[10px]
                      mb-1.5
                      block
                      uppercase
                      tracking-[0.12em]
                    "
                    style={{ color: '#8B837A' }}
                  >
                    Shipping Address
                    <span
                      className="normal-case tracking-normal"
                      style={{ color: '#AAA198' }}
                    >
                      {' '}— عنوان الشحن
                    </span>
                  </label>

                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="
                      w-full
                      min-h-[84px]
                      px-4
                      py-3
                      outline-none
                      resize-none
                      transition-all
                      duration-300
                    "
                    style={{
                      background: 'rgba(245,242,237,.72)',
                      border: '1px solid rgba(41,42,40,.10)',
                      color: '#292A28',
                    }}
                    placeholder="City, District, Street, Building No."
                  />
                </div>
              </div>

              <div
                className="h-px"
                style={{ background: 'rgba(41,42,40,.08)' }}
              />

              {/* QUANTITY / TOTAL */}
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  items-start
                  sm:items-center
                  justify-between
                  gap-5
                "
              >
                <div>
                  <label
                    className="
                      text-[10px]
                      mb-2
                      block
                      uppercase
                      tracking-[0.12em]
                    "
                    style={{ color: '#8B837A' }}
                  >
                    Quantity
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="
                        w-10
                        h-10
                        flex
                        items-center
                        justify-center
                        transition-all
                        duration-300
                      "
                      style={{
                        background: 'rgba(255,255,255,.34)',
                        border: '1px solid rgba(41,42,40,.10)',
                        color: '#686158',
                        opacity: quantity <= 1 ? 0.4 : 1,
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M5 12h14" />
                      </svg>
                    </button>

                    <span
                      className="text-base font-semibold w-10 text-center"
                      style={{ color: '#292A28' }}
                    >
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="
                        w-10
                        h-10
                        flex
                        items-center
                        justify-center
                        transition-all
                        duration-300
                      "
                      style={{
                        background: 'rgba(255,255,255,.34)',
                        border: '1px solid rgba(41,42,40,.10)',
                        color: '#686158',
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  className="
                    w-full
                    sm:w-auto
                    text-left
                    sm:text-right
                  "
                >
                  <label
                    className="
                      text-[10px]
                      mb-1.5
                      block
                      uppercase
                      tracking-[0.12em]
                    "
                    style={{ color: '#8B837A' }}
                  >
                    Total
                  </label>

                  <span
                    className="font-bold text-2xl"
                    style={{ color: '#A88C58' }}
                  >
                    {Math.round(currentPrice * quantity)} EGP
                  </span>
                </div>
              </div>

              {/* CONFIRM */}
              <button
                type="button"
                onClick={handleOrder}
                disabled={loading}
                className="
                  w-full
                  py-4
                  text-sm
                  font-semibold
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
                style={{
                  background: '#292A28',
                  color: '#F5F2ED',
                  boxShadow: '0 12px 28px rgba(41,42,40,.12)',
                }}
              >
                {loading ? (
                  <span
                    className="
                      inline-block
                      w-5
                      h-5
                      border-2
                      rounded-full
                      animate-spin
                    "
                    style={{
                      borderColor: 'rgba(245,242,237,.25)',
                      borderTopColor: '#B49A68',
                    }}
                  />
                ) : (
                  'Confirm Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS MODAL
      ===================================================== */}

      {isSuccessModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-[120]
            flex
            items-center
            justify-center
            p-4
          "
        >
          {/* BACKDROP */}

          <div
            className="
              absolute
              inset-0
              backdrop-blur-sm
            "
            style={{
              background:
                'rgba(41,42,40,.48)',
            }}
            onClick={() => {
              setIsSuccessModalOpen(false)
              document.body.style.overflow = 'unset'
            }}
          />

          {/* MODAL */}

          <div
            className="
              relative
              p-8
              text-center
              max-w-sm
              w-full
              animate-fade-in
            "
            style={{
              background:
                '#F5F2ED',

              border:
                '1px solid rgba(41,42,40,.10)',

              boxShadow:
                '0 30px 80px rgba(41,42,40,.20)',
            }}
          >
            {/* SUCCESS ICON */}

            <div
              className="
                w-16
                h-16
                rounded-full
                flex
                items-center
                justify-center
                mx-auto
                mb-5
              "
              style={{
                background:
                  'rgba(180,154,104,.10)',

                border:
                  '1px solid rgba(180,154,104,.25)',

                color:
                  '#A88C58',
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <h2
              className="
                text-2xl
                font-bold
                mb-2
              "
              style={{
                color:
                  '#292A28',

                fontFamily:
                  'Amiri, serif',
              }}
            >
              Order Submitted!
            </h2>

            {user ? (
              <>
                <p
                  className="
                    text-sm
                    mb-8
                    leading-relaxed
                  "
                  style={{
                    color:
                      '#77716A',
                  }}
                >
                  تم تقديم طلبك
                  بنجاح وسيتم
                  التواصل معك
                  للتأكيد. يمكنك
                  متابعة حالة
                  طلبك من حسابك.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccessModalOpen(false)
                      document.body.style.overflow = 'unset'

                      router.push(
                        '/profile'
                      )
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      justify-center
                      gap-2
                      py-3.5
                      text-sm
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
                    }}
                  >
                    View My Orders

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccessModalOpen(false)
                      document.body.style.overflow = 'unset'

                      router.push(
                        '/shop'
                      )
                    }}
                    className="
                      w-full
                      py-3.5
                      text-sm
                      font-medium
                      transition-all
                    "
                    style={{
                      background:
                        'transparent',

                      border:
                        '1px solid rgba(41,42,40,.12)',

                      color:
                        '#686158',
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            ) : (
              <>
                <p
                  className="
                    text-sm
                    mb-8
                    leading-relaxed
                  "
                  style={{
                    color:
                      '#77716A',
                  }}
                >
                  أنشئ حساب وسجل
                  دخول لمتابعة
                  طلبك وحفظ بياناتك
                  لتسهيل عملية
                  الشراء في المرات
                  القادمة.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccessModalOpen(false)
                      document.body.style.overflow = 'unset'

                      router.push(
                        '/auth/login'
                      )
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      justify-center
                      gap-2
                      py-3.5
                      text-sm
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
                    }}
                  >
                    Create Account / Login

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccessModalOpen(
                        false
                      )

                      router.push(
                        '/shop'
                      )
                    }}
                    className="
                      w-full
                      py-3.5
                      text-sm
                      font-medium
                      transition-all
                    "
                    style={{
                      background:
                        'transparent',

                      border:
                        '1px solid rgba(41,42,40,.12)',

                      color:
                        '#686158',
                    }}
                  >
                    متابعة التسوق
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}