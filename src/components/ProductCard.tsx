'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export type ProductViewMode =
  | 'grid'
  | 'horizontal'
  | 'list'

export default function ProductCard({
  product,
  index = 0,
  viewMode = 'grid',
}: {
  product: Product
  index?: number
  viewMode?: ProductViewMode
}) {
  const { addToCart } = useCart()
  const router = useRouter()

  const [currentImg, setCurrentImg] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const startX = useRef(0)
  const currentX = useRef(0)
  const didSwipe = useRef(false)

  const images =
    product?.images && product.images.length > 0
      ? product.images
      : []

  const basePrice =
    parseFloat(String(product?.price)) || 0

  const parsedSizes = Array.isArray(product?.sizes)
    ? product.sizes.map((s) =>
        typeof s === 'string'
          ? JSON.parse(s)
          : s
      )
    : typeof product?.sizes === 'string'
      ? JSON.parse(product?.sizes || '[]')
      : []

  const hasSizes = parsedSizes.length > 0

  const minPrice = hasSizes
    ? Math.min(
        ...parsedSizes.map((s: any) =>
          typeof s === 'object' &&
          s !== null &&
          typeof s.price === 'number'
            ? s.price
            : basePrice
        )
      )
    : basePrice

  const getSizeName = (size: any) =>
    typeof size === 'object' &&
    size !== null
      ? size.name
      : String(size)

  const getSizePrice = (size: any) =>
    typeof size === 'object' &&
    size !== null &&
    typeof size.price === 'number'
      ? size.price
      : basePrice

  let currentPopupPrice = minPrice

  if (hasSizes && selectedSize) {
    for (let i = 0; i < parsedSizes.length; i++) {
      if (
        getSizeName(parsedSizes[i]) ===
        selectedSize
      ) {
        currentPopupPrice =
          getSizePrice(parsedSizes[i])
        break
      }
    }
  }

  const isAvailable =
    !product.is_sold_out &&
    (product.stock ?? 0) > 0


  /* =====================================================
     IMAGE SWIPE
  ===================================================== */

  const handleTouchStart = (
    e: React.TouchEvent
  ) => {
    if (images.length <= 1) return

    if (e.touches.length === 1) {
      startX.current =
        e.touches[0].clientX

      currentX.current =
        e.touches[0].clientX

      setIsDragging(true)
      setDragOffset(0)
    }
  }

  const handleTouchMove = (
    e: React.TouchEvent
  ) => {
    if (
      !isDragging ||
      images.length <= 1
    ) {
      return
    }

    const diff =
      e.touches[0].clientX -
      startX.current

    setDragOffset(diff)
    currentX.current =
      e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (
      !isDragging ||
      images.length <= 1
    ) {
      return
    }

    setIsDragging(false)

    const diff =
      currentX.current -
      startX.current

    if (Math.abs(diff) > 50) {
      didSwipe.current = true

      if (diff < 0) {
        setCurrentImg((prev) =>
          Math.min(
            prev + 1,
            images.length - 1
          )
        )
      } else {
        setCurrentImg((prev) =>
          Math.max(prev - 1, 0)
        )
      }

      setTimeout(() => {
        didSwipe.current = false
      }, 50)
    }

    setDragOffset(0)
  }


  /* =====================================================
     CART
  ===================================================== */

  const handleCartClick = (
    e: React.MouseEvent
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAvailable) {
      toast.error(
        'هذا المنتج غير متوفر حالياً'
      )
      return
    }

    if (hasSizes) {
      setSelectedSize(null)
      setQuantity(1)
      setShowPopup(true)
    } else {
      addToCart(
        product,
        undefined,
        1
      )

      toast.success(
        'تمت إضافة المنتج إلى السلة'
      )
    }
  }


  /* =====================================================
     POPUP
  ===================================================== */

  const handlePopupAction = (
    action: 'cart' | 'buy'
  ) => {
    if (!selectedSize) {
      toast.error(
        'من فضلك اختر المقاس أولاً'
      )
      return
    }

    addToCart(
      product,
      selectedSize,
      quantity
    )

    setShowPopup(false)

    toast.success(
      'تمت إضافة المنتج إلى السلة'
    )

    if (action === 'buy') {
      router.push('/cart')
    }
  }


  return (
    <>
      {/* =================================================
          PRODUCT CARD
      ================================================= */}

      <Link
        href={`/shop/${product.id}`}
        dir="ltr"
        className={`jidaar-product-card jidaar-${viewMode}`}
        style={{
          animationDelay:
            `${index * 70}ms`,
        }}
        onClick={(e) => {
          if (didSwipe.current) {
            e.preventDefault()
          }
        }}
      >

        {/* IMAGE */}

        <div
          className="jidaar-product-media"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >

          {images.length > 0 ? (

            <div
              className="jidaar-image-track"
              style={{
                transform: `
                  translateX(
                    calc(
                      -${currentImg * 100}%
                      + ${dragOffset}px
                    )
                  )
                `,
                transition:
                  isDragging
                    ? 'none'
                    : 'transform .4s cubic-bezier(.22,.61,.36,1)',
              }}
            >

              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={product.title}
                  loading="lazy"
                  draggable="false"
                  className="jidaar-product-image"
                />
              ))}

            </div>

          ) : (

            <div className="jidaar-empty-image">

              <svg
                width="34"
                height="34"
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


          {/* FEATURED */}

          {product.is_featured && (
            <span className="jidaar-featured">
              Featured
            </span>
          )}


          {/* IMAGE DOTS */}

          {images.length > 1 && (
            <div className="jidaar-image-dots">

              {images.map((_, i) => (
                <span
                  key={i}
                  className={
                    currentImg === i
                      ? 'active'
                      : ''
                  }
                />
              ))}

            </div>
          )}

        </div>


        {/* INFO */}

        <div className="jidaar-product-info">

          <div className="jidaar-title-line">

            <h3>
              {product.title}
            </h3>

            <span
              className={
                isAvailable
                  ? 'jidaar-status available'
                  : 'jidaar-status sold'
              }
            >
              {isAvailable
                ? 'Available'
                : 'Sold Out'}
            </span>

          </div>


          <div className="jidaar-product-bottom">

            <div>

              {hasSizes && (
                <span className="jidaar-from">
                  يبدأ من
                </span>
              )}

              <div className="jidaar-price">
                {Math.round(minPrice)} EGP
              </div>

            </div>


            <button
              onClick={handleCartClick}
              disabled={!isAvailable}
              className={
                isAvailable
                  ? 'jidaar-add-button'
                  : 'jidaar-add-button disabled'
              }
              aria-label="إضافة إلى السلة"
            >

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>

            </button>

          </div>

        </div>

      </Link>


      {/* =================================================
          SIZE POPUP
      ================================================= */}

      {showPopup && (

        <div
          className="jidaar-modal"
          onClick={() =>
            setShowPopup(false)
          }
        >

          <div className="jidaar-modal-backdrop" />

          <div
            className="jidaar-modal-box"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="jidaar-modal-header">

              {images.length > 0 ? (

                <img
                  src={images[0]}
                  alt=""
                  className="jidaar-modal-image"
                />

              ) : (

                <div className="jidaar-modal-image-empty">
                  <svg
                    width="20"
                    height="20"
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
                  </svg>
                </div>

              )}


              <div className="jidaar-modal-product">

                <p>
                  {product.title}
                </p>

                <strong>
                  {Math.round(
                    currentPopupPrice
                  )}{' '}
                  EGP
                </strong>

              </div>


              <button
                onClick={() =>
                  setShowPopup(false)
                }
                className="jidaar-close"
              >
                ×
              </button>

            </div>


            {/* BODY */}

            <div className="jidaar-modal-body">

              <label className="jidaar-modal-label">
                اختر المقاس
              </label>

              <div className="jidaar-sizes">

                {parsedSizes.map(
                  (size: any, i: number) => {

                    const sizeName =
                      getSizeName(size)

                    const sizePrice =
                      getSizePrice(size)

                    const selected =
                      selectedSize ===
                      sizeName

                    return (

                      <button
                        key={i}
                        onClick={() =>
                          setSelectedSize(
                            sizeName
                          )
                        }
                        className={
                          selected
                            ? 'jidaar-size selected'
                            : 'jidaar-size'
                        }
                      >

                        <span>
                          {sizeName}
                        </span>

                        <small>
                          {Math.round(
                            sizePrice
                          )}{' '}
                          EGP
                        </small>

                      </button>

                    )
                  }
                )}

              </div>


              {/* QUANTITY */}

              <div className="jidaar-quantity-row">

                <span>
                  الكمية
                </span>

                <div className="jidaar-quantity">

                  <button
                    onClick={() =>
                      setQuantity(
                        Math.max(
                          1,
                          quantity - 1
                        )
                      )
                    }
                    disabled={
                      quantity <= 1
                    }
                  >
                    −
                  </button>

                  <strong>
                    {quantity}
                  </strong>

                  <button
                    onClick={() =>
                      setQuantity(
                        quantity + 1
                      )
                    }
                    disabled={
                      quantity >=
                      (product.stock ?? 0)
                    }
                  >
                    +
                  </button>

                </div>

              </div>


              {/* TOTAL */}

              <div className="jidaar-total">

                <span>
                  الإجمالي
                </span>

                <strong>
                  {Math.round(
                    currentPopupPrice *
                    quantity
                  )}{' '}
                  EGP
                </strong>

              </div>


              {/* ACTIONS */}

              <div className="jidaar-modal-actions">

                <button
                  onClick={() =>
                    handlePopupAction(
                      'cart'
                    )
                  }
                  disabled={!isAvailable}
                  className="jidaar-cart-action"
                >
                  أضف للسلة
                </button>

                <button
                  onClick={() =>
                    handlePopupAction(
                      'buy'
                    )
                  }
                  disabled={!isAvailable}
                  className="jidaar-buy-action"
                >
                  شراء الآن
                </button>

              </div>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          STYLES
      ================================================= */}

      <style jsx>{`

        /* =========================
           BASE
        ========================= */

        .jidaar-product-card {
          position: relative;

          display: block;

          width: 100%;

          overflow: hidden;

          background: #FAF8F4;

          border: 1px solid #D8D0C5;

          color: #292A28;

          text-decoration: none;

          transition:
            transform .35s ease,
            box-shadow .35s ease,
            border-color .35s ease;

          animation:
            jidaarCardIn .55s ease both;
        }

        .jidaar-product-card:hover {
          transform: translateY(-4px);

          border-color: #C5B79F;

          box-shadow:
            0 18px 42px
            rgba(41,42,40,.09);
        }


        /* =========================
           IMAGE
        ========================= */

        .jidaar-product-media {
          position: relative;

          width: 100%;

          aspect-ratio: 20 / 20.5;

          overflow: hidden;

          background: #ECE8E1;

          touch-action: pan-y;
        }

        .jidaar-image-track {
          display: flex;

          width: 100%;
          height: 100%;
        }

        .jidaar-product-image {
          width: 100%;
          height: 100%;

          flex-shrink: 0;

          object-fit: cover;

          user-select: none;

          transition:
            transform .65s ease;
        }

        .jidaar-product-card:hover
        .jidaar-product-image {
          transform: scale(1.025);
        }


        /* =========================
           FEATURED
        ========================= */

.jidaar-featured {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 3;

  color: rgba(250, 248, 244, 0.82);

  font-family: Tajawal, sans-serif;
  font-size: 8px;
  font-weight: 400;

  letter-spacing: 0.18em;
  text-transform: uppercase;

  line-height: 1;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.12);

  pointer-events: none;
}


        /* =========================
           DOTS
        ========================= */

        .jidaar-image-dots {
          position: absolute;

          left: 50%;
          bottom: 12px;

          transform:
            translateX(-50%);

          display: flex;

          align-items: center;

          gap: 4px;

          z-index: 4;
        }

        .jidaar-image-dots span {
          display: block;

          width: 4px;
          height: 4px;

          border-radius: 50%;

          background:
            rgba(250,248,244,.7);

          transition:
            all .25s ease;
        }

        .jidaar-image-dots span.active {
          width: 13px;

          border-radius: 8px;

          background: #B49A68;
        }


        /* =========================
           INFO
        ========================= */

        .jidaar-product-info {
          padding:
            16px 17px 17px;
        }

        .jidaar-title-line {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;
        }

        .jidaar-title-line h3 {
          min-width: 0;

          margin: 0;

          overflow: hidden;

          color: #292A28;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 15px;

          font-weight: 600;

          line-height: 1.4;

          white-space: nowrap;

          text-overflow: ellipsis;

          transition:
            color .25s ease;
        }

        .jidaar-product-card:hover
        .jidaar-title-line h3 {
          color: #9A8255;
        }


        /* =========================
           STATUS
        ========================= */

        .jidaar-status {
          flex-shrink: 0;

          padding: 4px 7px;

          border: 1px solid;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 8px;

          line-height: 1;

          text-transform: uppercase;

          letter-spacing: .04em;
        }

        .jidaar-status.available {
          color: #6D785F;

          background:
            rgba(109,120,95,.07);

          border-color:
            rgba(109,120,95,.2);
        }

        .jidaar-status.sold {
          color: #9A6B64;

          background:
            rgba(154,107,100,.07);

          border-color:
            rgba(154,107,100,.18);
        }


        /* =========================
           PRICE
        ========================= */

        .jidaar-product-bottom {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          margin-top: 15px;
        }

        .jidaar-from {
          display: block;

          margin-bottom: 4px;

          color: #99928A;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 9px;
        }

        .jidaar-price {
          color: #9A8255;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 17px;

          font-weight: 700;

          line-height: 1;
        }


        /* =========================
           ADD BUTTON
        ========================= */

        .jidaar-add-button {
          width: 39px;
          height: 39px;

          display: flex;

          align-items: center;
          justify-content: center;

          border: 1px solid #292A28;

          background: #292A28;

          color: #F7F5F1;

          cursor: pointer;

          transition:
            all .25s ease;
        }

        .jidaar-add-button:hover {
          background: #B49A68;

          border-color: #B49A68;

          color: #292A28;

          transform: translateY(-2px);
        }

        .jidaar-add-button.disabled {
          opacity: .3;

          cursor:
            not-allowed;
        }


        /* =========================
           MODAL
        ========================= */

        .jidaar-modal {
          position: fixed;

          inset: 0;

          z-index: 100;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 20px;
        }

        .jidaar-modal-backdrop {
          position: absolute;

          inset: 0;

          background:
            rgba(41,42,40,.48);

          backdrop-filter:
            blur(10px);
        }

        .jidaar-modal-box {
          position: relative;

          width: 100%;

          max-width: 430px;

          overflow: hidden;

          background: #FAF8F4;

          border:
            1px solid #D6CEC3;

          box-shadow:
            0 30px 80px
            rgba(41,42,40,.22);

          animation:
            jidaarModalIn .25s ease;
        }

        .jidaar-modal-header {
          display: flex;

          align-items: center;

          gap: 12px;

          padding: 15px;

          border-bottom:
            1px solid #DDD6CD;
        }

        .jidaar-modal-image,
        .jidaar-modal-image-empty {
          width: 58px;
          height: 58px;

          flex-shrink: 0;

          object-fit: cover;

          background: #EEEAE4;

          border:
            1px solid #D6CEC3;
        }

        .jidaar-modal-image-empty {
          display: flex;

          align-items: center;
          justify-content: center;

          color: #9A938A;
        }

        .jidaar-modal-product {
          flex: 1;

          min-width: 0;
        }

        .jidaar-modal-product p {
          margin: 0;

          color: #292A28;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 14px;

          font-weight: 600;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        .jidaar-modal-product strong {
          display: block;

          margin-top: 4px;

          color: #9A8255;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 14px;
        }

        .jidaar-close {
          width: 32px;
          height: 32px;

          border:
            1px solid #D6CEC3;

          background:
            transparent;

          color: #77716A;

          font-size: 21px;

          line-height: 1;

          cursor: pointer;
        }

        .jidaar-close:hover {
          background: #EEEAE4;

          border-color:
            #B49A68;

          color: #292A28;
        }

        .jidaar-modal-body {
          padding: 20px;
        }

        .jidaar-modal-label {
          display: block;

          margin-bottom: 9px;

          color: #77716A;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 11px;
        }

        .jidaar-sizes {
          display: flex;

          flex-wrap: wrap;

          gap: 8px;
        }

        .jidaar-size {
          min-width: 78px;

          padding: 9px 12px;

          background: #F5F2ED;

          border:
            1px solid #D6CEC3;

          color: #77716A;

          font-family:
            Tajawal,
            sans-serif;

          cursor: pointer;

          transition:
            all .2s ease;
        }

        .jidaar-size:hover {
          border-color:
            #B49A68;

          color: #292A28;
        }

        .jidaar-size.selected {
          background:
            rgba(180,154,104,.10);

          border-color:
            #B49A68;

          color: #8F7950;
        }

        .jidaar-size small {
          display: block;

          margin-top: 3px;

          font-size: 9px;

          opacity: .7;
        }

        .jidaar-quantity-row {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-top: 22px;

          color: #77716A;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 12px;
        }

        .jidaar-quantity {
          display: flex;

          align-items: center;

          border:
            1px solid #D6CEC3;

          background: #F5F2ED;
        }

        .jidaar-quantity button {
          width: 32px;
          height: 32px;

          border: 0;

          background:
            transparent;

          color: #77716A;

          font-size: 18px;

          cursor: pointer;
        }

        .jidaar-quantity button:hover:not(:disabled) {
          background: #EAE5DE;

          color: #292A28;
        }

        .jidaar-quantity button:disabled {
          opacity: .25;
        }

        .jidaar-quantity strong {
          width: 32px;

          text-align: center;

          color: #292A28;

          font-size: 13px;
        }

        .jidaar-total {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-top: 20px;

          padding-top: 16px;

          border-top:
            1px solid #DDD6CD;

          font-family:
            Tajawal,
            sans-serif;
        }

        .jidaar-total span {
          color: #77716A;

          font-size: 13px;
        }

        .jidaar-total strong {
          color: #9A8255;

          font-size: 19px;
        }

        .jidaar-modal-actions {
          display: flex;

          gap: 9px;

          margin-top: 20px;
        }

        .jidaar-cart-action,
        .jidaar-buy-action {
          flex: 1;

          height: 45px;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 12px;

          font-weight: 600;

          cursor: pointer;

          transition:
            all .2s ease;
        }

        .jidaar-cart-action {
          background:
            transparent;

          color: #292A28;

          border:
            1px solid #CFC7BC;
        }

        .jidaar-cart-action:hover {
          background: #EEEAE4;

          border-color:
            #B49A68;
        }

        .jidaar-buy-action {
          background: #292A28;

          color: #F7F5F1;

          border:
            1px solid #292A28;
        }

        .jidaar-buy-action:hover {
          background: #B49A68;

          color: #292A28;

          border-color:
            #B49A68;
        }


        /* =================================================
           MOBILE HORIZONTAL
        ================================================= */

        @media (max-width: 767px) {

          .jidaar-horizontal {
            width: 76vw;

            max-width: 300px;

            flex-shrink: 0;
          }

          .jidaar-horizontal
          .jidaar-product-media {
            aspect-ratio:
              20 / 20.5;
          }

        }


        /* =================================================
           MOBILE LIST
        ================================================= */

        @media (max-width: 767px) {

          .jidaar-list {
            display: grid;

            grid-template-columns:
              1fr;

            width: 100%;
          }

          .jidaar-list
          .jidaar-product-media {
            aspect-ratio:
              1 / .72;
          }

          .jidaar-list
          .jidaar-product-info {
            padding:
              15px 16px 17px;
          }

        }


        /* =================================================
           MOBILE GRID
        ================================================= */

        @media (max-width: 767px) {

          .jidaar-grid {
            width: 100%;
          }

        }


        /* =================================================
           ANIMATION
        ================================================= */

        @keyframes jidaarCardIn {

          from {
            opacity: 0;

            transform:
              translateY(12px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }

        }

        @keyframes jidaarModalIn {

          from {
            opacity: 0;

            transform:
              translateY(10px)
              scale(.98);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 390px) {

          .jidaar-product-info {
            padding:
              13px;
          }

          .jidaar-title-line h3 {
            font-size: 14px;
          }

          .jidaar-price {
            font-size: 16px;
          }

          .jidaar-add-button {
            width: 37px;
            height: 37px;
          }

        }

      `}</style>
    </>
  )
}