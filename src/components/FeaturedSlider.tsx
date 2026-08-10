'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Product } from '@/types'

export default function FeaturedSlider({
  products,
}: {
  products: Product[]
}) {
  const [current, setCurrent] = useState(0)

  const nextSlide = useCallback(() => {
    if (products.length <= 1) return

    setCurrent((prev) => (prev + 1) % products.length)
  }, [products.length])

  const prevSlide = useCallback(() => {
    if (products.length <= 1) return

    setCurrent(
      (prev) =>
        (prev - 1 + products.length) % products.length
    )
  }, [products.length])

  useEffect(() => {
    if (products.length <= 1) return

    const interval = setInterval(nextSlide, 5000)

    return () => clearInterval(interval)
  }, [nextSlide, products.length])

  if (!products || products.length === 0) return null

  const activeProduct = products[current]

  return (
    <div
      className="
        relative
        w-full
        overflow-hidden
        mb-12
        min-h-[60vh]
        sm:min-h-[50vh]
        lg:min-h-0
        lg:aspect-[21/9]
      "
      style={{
        background: '#292A28',
        borderRadius: '14px',

        /*
          Shadow فقط لإعطاء إحساس
          أن الصورة Floating عن الصفحة
        */
        boxShadow: `
          0 24px 55px rgba(41,42,40,0.12),
          0 8px 20px rgba(41,42,40,0.06)
        `,
      }}
    >

      {/* =====================================================
          IMAGES
      ===================================================== */}

      {products.map((product, index) => (
        <img
          key={product.id}
          src={
            product.images &&
            product.images.length > 0
              ? product.images[0]
              : ''
          }
          alt={product.title}
          fetchPriority={
            index === current
              ? 'high'
              : 'low'
          }
          style={{
            position: 'absolute',
            inset: 0,

            width: '100%',
            height: '100%',

            objectFit: 'cover',

            opacity:
              index === current
                ? 1
                : 0,

            transform:
              index === current
                ? 'scale(1)'
                : 'scale(1.02)',

            transition:
              'opacity 1s ease-in-out, transform 5s ease-out',

            zIndex: 1,

            background:
              '#292A28',
          }}
          onError={(e) => {
            e.currentTarget.style.background =
              '#292A28'

            e.currentTarget.style.display =
              'none'
          }}
        />
      ))}


      {/* =====================================================
          IMAGE OVERLAY
          نفس روح ألوان المعرض
      ===================================================== */}

      <div
        className="absolute inset-0 z-[2]"
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(41,42,40,0.05) 0%,
              rgba(41,42,40,0.10) 25%,
              rgba(41,42,40,0.52) 58%,
              rgba(41,42,40,0.94) 100%
            )
          `,
        }}
      />


      {/* Bottom subtle vignette */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-36
          z-[2]
          pointer-events-none
        "
        style={{
          background:
            'linear-gradient(to top, rgba(41,42,40,0.30), transparent)',
        }}
      />


      {/* =====================================================
          PRODUCT INFORMATION
      ===================================================== */}

      <div
        className="
          absolute
          inset-0
          z-[3]
          flex
          items-center
          justify-end
          p-7
          sm:p-12
          lg:p-16
        "
      >
        <div
          className="
            text-left
            max-w-[480px]
            w-full
          "
          style={{
            fontFamily:
              'Tajawal, sans-serif',
          }}
        >

          {/* Category */}

          <div
            className="
              flex
              items-center
              gap-3
              mb-5
            "
          >
            <span
              style={{
                width: '30px',
                height: '1px',
                background:
                  '#B49A68',
                display: 'block',
              }}
            />

            <span
              style={{
                color:
                  '#D2BE98',

                fontSize:
                  '10px',

                letterSpacing:
                  '0.22em',

                textTransform:
                  'uppercase',

                fontWeight:
                  500,
              }}
            >
              {activeProduct.category}
            </span>
          </div>


          {/* Title */}

          <h2
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-bold
              text-white
              mb-4
              leading-[1.15]
            "
            style={{
              fontFamily:
                'Amiri, serif',

              textShadow:
                '0 3px 20px rgba(0,0,0,0.25)',
            }}
          >
            {activeProduct.title}
          </h2>


          {/* =================================================
              FLOATING VIEW DETAILS
              بدون Background
              بدون Border
              بدون Button Box
          ================================================= */}

          <Link
            href={`/shop/${activeProduct.id}`}
            className="
              group
              inline-flex
              items-center
              gap-3
              transition-all
              duration-300
            "
            style={{
              color:
                '#F5F2ED',

              textDecoration:
                'none',

              fontFamily:
                'Tajawal, sans-serif',

              fontSize:
                '13px',

              fontWeight:
                500,

              letterSpacing:
                '0.02em',

              paddingBottom:
                '7px',

              borderBottom:
                '1px solid rgba(180,154,104,0.65)',
            }}
          >

            <span>
              View Details
            </span>

            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
              style={{
                color:
                  '#B49A68',
              }}
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>

          </Link>

        </div>
      </div>


      {/* =====================================================
          FLOATING PREVIOUS ARROW
          لا دائرة
          لا Border
          لا Background
      ===================================================== */}

      {products.length > 1 && (
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="
            group
            absolute
            left-5
            sm:left-8
            top-1/2
            -translate-y-1/2
            z-[10]
            flex
            items-center
            justify-center
            transition-all
            duration-300
          "
          style={{
            width:
              '42px',

            height:
              '60px',

            background:
              'transparent',

            border:
              'none',

            color:
              'rgba(245,242,237,0.65)',

            cursor:
              'pointer',

            padding:
              0,

            filter:
              'drop-shadow(0 3px 8px rgba(0,0,0,0.18))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color =
              '#B49A68'

            e.currentTarget.style.transform =
              'translateY(-50%) translateX(-3px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              'rgba(245,242,237,0.65)'

            e.currentTarget.style.transform =
              'translateY(-50%) translateX(0)'
          }}
        >
          <svg
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}


      {/* =====================================================
          FLOATING NEXT ARROW
      ===================================================== */}

      {products.length > 1 && (
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="
            group
            absolute
            right-5
            sm:right-8
            top-1/2
            -translate-y-1/2
            z-[10]
            flex
            items-center
            justify-center
            transition-all
            duration-300
          "
          style={{
            width:
              '42px',

            height:
              '60px',

            background:
              'transparent',

            border:
              'none',

            color:
              'rgba(245,242,237,0.65)',

            cursor:
              'pointer',

            padding:
              0,

            filter:
              'drop-shadow(0 3px 8px rgba(0,0,0,0.18))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color =
              '#B49A68'

            e.currentTarget.style.transform =
              'translateY(-50%) translateX(3px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              'rgba(245,242,237,0.65)'

            e.currentTarget.style.transform =
              'translateY(-50%) translateX(0)'
          }}
        >
          <svg
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}


      {/* =====================================================
          SLIDE INDICATORS
      ===================================================== */}

      <div
        className="
          absolute
          bottom-6
          sm:bottom-7
          left-1/2
          -translate-x-1/2
          flex
          items-center
          gap-2.5
          z-[10]
        "
      >
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() =>
              setCurrent(i)
            }
            aria-label={`Go to slide ${i + 1}`}
            className="
              transition-all
              duration-300
            "
            style={{
              width:
                current === i
                  ? '30px'
                  : '7px',

              height:
                '2px',

              padding:
                0,

              background:
                current === i
                  ? '#B49A68'
                  : 'rgba(245,242,237,0.38)',

              border:
                'none',

              cursor:
                'pointer',
            }}
          />
        ))}
      </div>

    </div>
  )
}