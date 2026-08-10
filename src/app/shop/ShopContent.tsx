'use client'

import { useState } from 'react'
import { Product, CATEGORIES, CATEGORY_LABELS } from '@/types'
import ProductCard from '@/components/ProductCard'

type ViewMode = 'grid' | 'horizontal'

export default function ShopContent({
  products,
}: {
  products: Product[]
}) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter(
          (product) => product.category === activeCategory
        )

  return (
    <section
      className="jidaar-shop"
      dir="rtl"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="jidaar-shop-header">

        <div className="jidaar-header-content">

          <div className="jidaar-header-mark">
            <span />
          </div>

          <p className="jidaar-eyebrow">
            JIDAAR COLLECTION
          </p>

          <h1>
            المتجر
          </h1>

          <p className="jidaar-description">
            اكتشف مجموعتنا المختارة من الأعمال واللوحات
          </p>

        </div>

        <div className="jidaar-count">
          {filtered.length} منتج
        </div>

      </div>


      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <div className="jidaar-categories-section">

        <div className="jidaar-category-line">

          <span className="jidaar-line" />

          <span className="jidaar-category-label">
            تصفح حسب الفئة
          </span>

          <span className="jidaar-line" />

        </div>


        <div className="jidaar-categories">

          {/* ALL */}

          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className={
              activeCategory === 'All'
                ? 'jidaar-category active'
                : 'jidaar-category'
            }
            aria-pressed={activeCategory === 'All'}
          >
            <span>
              الكل
            </span>
          </button>


          {/* CATEGORIES */}

          {CATEGORIES.map((category) => {

            const isActive =
              activeCategory === category

            return (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(category)
                }
                className={
                  isActive
                    ? 'jidaar-category active'
                    : 'jidaar-category'
                }
                aria-pressed={isActive}
              >
                <span>
                  {CATEGORY_LABELS[category]}
                </span>
              </button>
            )
          })}

        </div>

      </div>


      {/* =====================================================
          VIEW CONTROLS
      ===================================================== */}

      <div className="jidaar-view-controls">

        <div className="jidaar-view-title">

          <span className="jidaar-title-mark">
            ✦
          </span>

          <span>
            اختار طريقة العرض المفضلة
          </span>

        </div>


        <span className="jidaar-view-divider" />


        <div className="jidaar-view-switcher">

          {/* GRID */}

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={
              viewMode === 'grid'
                ? 'jidaar-view-button active'
                : 'jidaar-view-button'
            }
            aria-label="عرض شبكي"
            aria-pressed={viewMode === 'grid'}
          >

            <span className="jidaar-view-icon">

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  rx="1"
                />

                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="1"
                />

                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="1"
                />

                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                  rx="1"
                />
              </svg>

            </span>

            <span>
              شبكة
            </span>

          </button>


          {/* HORIZONTAL */}

          <button
            type="button"
            onClick={() =>
              setViewMode('horizontal')
            }
            className={
              viewMode === 'horizontal'
                ? 'jidaar-view-button active'
                : 'jidaar-view-button'
            }
            aria-label="عرض أفقي"
            aria-pressed={
              viewMode === 'horizontal'
            }
          >

            <span className="jidaar-view-icon">

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="6"
                  rx="1"
                />

                <rect
                  x="3"
                  y="14"
                  width="18"
                  height="6"
                  rx="1"
                />
              </svg>

            </span>

            <span>
              أفقي
            </span>

          </button>

        </div>

      </div>


      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      {filtered.length > 0 ? (

        viewMode === 'grid' ? (

          <div className="jidaar-products-grid">

            {filtered.map(
              (product, index) => (

                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />

              )
            )}

          </div>

        ) : (

          <div className="jidaar-products-horizontal">

            {filtered.map(
              (product, index) => (

                <div
                  key={product.id}
                  className="jidaar-horizontal-item"
                >

                  <ProductCard
                    product={product}
                    index={index}
                  />

                </div>

              )
            )}

          </div>

        )

      ) : (

        /* =====================================================
            EMPTY
        ===================================================== */

        <div className="jidaar-empty">

          <div className="jidaar-empty-icon">

            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
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

          <h3>
            لا توجد منتجات
          </h3>

          <p>
            لا توجد منتجات في هذا التصنيف حالياً
          </p>

        </div>

      )}


      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`

        /* =================================================
           MAIN
        ================================================= */

        .jidaar-shop {

          min-height: 100vh;

          width: 100%;

          background: #F5F2ED;

          color: #292A28;

          font-family:
            Tajawal,
            sans-serif;

          padding:
            42px 24px 70px;

        }


        /* =================================================
           HEADER
        ================================================= */

        .jidaar-shop-header {

          max-width: 860px; /* تم تعديل العرض ليتطابق مع عرض المنتجات */

          margin:
            0 auto 42px;

          display: flex;

          flex-direction: column; /* تم التعديل ليكون بعمود لتوسيط كل شيء */

          align-items: center;

          text-align: center; /* توسيط النص */

          gap: 12px;

        }


        .jidaar-header-content {

          text-align: center; /* توسيط النص */

        }


        .jidaar-header-mark {

          width: 48px;

          height: 1px;

          margin: 0 auto 17px; /* توسيط الخط */

          background:
            linear-gradient(
              90deg,
              transparent,
              #B49A68
            );

        }


        .jidaar-eyebrow {

          margin: 0 0 8px;

          color: #A28A61;

          font-size: 10px;

          letter-spacing: .28em;

          font-weight: 500;

        }


        .jidaar-header-content h1 {

          margin: 0;

          color: #292A28;

          font-family:
            Amiri,
            serif;

          font-size:
            clamp(
              2.7rem,
              6vw,
              4.2rem
            );

          font-weight: 700;

          line-height: 1.05;

        }


        .jidaar-description {

          margin:
            10px 0 0;

          color: #817A71;

          font-size: 13px;

          line-height: 1.8;

        }


        .jidaar-count {

          color: #9A9288;

          font-size: 11px;

          white-space: nowrap;

          padding-top: 5px;

        }


        /* =================================================
           CATEGORY SECTION
        ================================================= */

        .jidaar-categories-section {

          max-width: 1180px;

          margin:
            0 auto 38px;

          text-align: center;

        }


        .jidaar-category-line {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 12px;

          margin-bottom: 17px;

        }


        .jidaar-category-line .jidaar-line {

          width: 25px;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #C8B99F
            );

        }


        .jidaar-category-line
        .jidaar-line:last-child {

          background:
            linear-gradient(
              90deg,
              #C8B99F,
              transparent
            );

        }


        .jidaar-category-label {

          color: #9A9288;

          font-size: 10px;

          letter-spacing: .08em;

        }


        /* =================================================
           FLOATING CATEGORIES
        ================================================= */

        .jidaar-categories {

          display: flex;

          align-items: center;

          justify-content: center;

          flex-wrap: wrap;

          gap: 11px;

        }


        .jidaar-category {

          position: relative;

          border: 0;

          outline: none;

          background: transparent;

          color: #77716A;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 12px;

          font-weight: 500;

          padding:
            8px 14px;

          cursor: pointer;

          transition:
            color .3s ease,
            transform .3s ease;

        }


        /*
          Floating underline
        */

        .jidaar-category::after {

          content: '';

          position: absolute;

          left: 50%;

          bottom: 1px;

          width: 0;

          height: 1px;

          transform:
            translateX(-50%);

          background:
            linear-gradient(
              90deg,
              transparent,
              #B49A68,
              transparent
            );

          opacity: 0;

          transition:
            width .3s ease,
            opacity .3s ease;

        }


        .jidaar-category:hover {

          color: #292A28;

          transform:
            translateY(-2px);

        }


        .jidaar-category:hover::after {

          width: 25px;

          opacity: .65;

        }


        .jidaar-category.active {

          color: #292A28;

          font-weight: 600;

          transform:
            translateY(-1px);

        }


        .jidaar-category.active::after {

          width: 34px;

          opacity: 1;

        }


        /* =================================================
           VIEW CONTROLS
        ================================================= */

        .jidaar-view-controls {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 18px;

          margin:
            0 auto 34px;

          direction: rtl;

        }


        .jidaar-view-title {

          display: inline-flex;

          align-items: center;

          gap: 7px;

          color: #77716A;

          font-size: 11px;

          white-space: nowrap;

        }


        .jidaar-title-mark {

          color: #B49A68;

          font-size: 10px;

        }


        .jidaar-view-divider {

          width: 1px;

          height: 18px;

          background:
            linear-gradient(
              to bottom,
              transparent,
              #C9BDAE,
              transparent
            );

          opacity: .7;

        }


        .jidaar-view-switcher {

          display: flex;

          align-items: center;

          gap: 20px;

        }


        .jidaar-view-button {

          position: relative;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          min-width: 54px;

          height: 32px;

          padding: 0;

          border: 0;

          outline: none;

          background: transparent;

          color: #9A938A;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 11px;

          cursor: pointer;

          transition:
            color .3s ease,
            transform .3s ease;

        }


        .jidaar-view-button:hover {

          color: #4E4A45;

          transform:
            translateY(-2px);

        }


        .jidaar-view-icon {

          display: flex;

          align-items: center;

          justify-content: center;

          width: 19px;

          height: 19px;

          color: #A69E95;

          transition:
            color .3s ease,
            transform .3s ease;

        }


        .jidaar-view-button:hover
        .jidaar-view-icon {

          color: #8E7850;

        }


        .jidaar-view-button.active {

          color: #292A28;

          font-weight: 600;

        }


        .jidaar-view-button.active
        .jidaar-view-icon {

          color: #A88C58;

          transform:
            translateY(-1px);

          filter:
            drop-shadow(
              0 2px 5px
              rgba(180,154,104,.18)
            );

        }


        .jidaar-view-button::after {

          content: '';

          position: absolute;

          left: 50%;

          bottom: -3px;

          width: 0;

          height: 1px;

          transform:
            translateX(-50%);

          background:
            linear-gradient(
              90deg,
              transparent,
              #B49A68,
              transparent
            );

          opacity: 0;

          transition:
            width .3s ease,
            opacity .3s ease;

        }


        .jidaar-view-button.active::after {

          width: 28px;

          opacity: 1;

        }


        /* =================================================
           PRODUCTS GRID
        ================================================= */

        .jidaar-products-grid {

          max-width: 860px; /* عرض الشبكة لتسع منتجين بالضبط */

          margin:
            0 auto;

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap:
            24px;

        }


        /* =================================================
           HORIZONTAL
        ================================================= */

        .jidaar-products-horizontal {

          max-width: 1180px;

          margin:
            0 auto;

          display: flex;

          gap: 22px;

          overflow-x: auto;

          overflow-y: visible;

          padding:
            5px 4px 20px;

          scroll-snap-type:
            x mandatory;

          scrollbar-width: none;

        }


        .jidaar-products-horizontal::-webkit-scrollbar {

          display: none;

        }


        .jidaar-horizontal-item {

          flex:
            0 0 340px;

          scroll-snap-align:
            start;

        }


        /* =================================================
           EMPTY
        ================================================= */

        .jidaar-empty {

          max-width: 1180px;

          margin:
            0 auto;

          padding:
            70px 20px;

          text-align: center;

          border-top:
            1px solid
            rgba(41,42,40,.07);

          border-bottom:
            1px solid
            rgba(41,42,40,.07);

        }


        .jidaar-empty-icon {

          width: 58px;

          height: 58px;

          margin:
            0 auto 18px;

          display: flex;

          align-items: center;

          justify-content: center;

          color: #B49A68;

          border-radius: 50%;

          background:
            rgba(
              180,
              154,
              104,
              .07
            );

        }


        .jidaar-empty h3 {

          margin:
            0 0 5px;

          color: #292A28;

          font-family:
            Amiri,
            serif;

          font-size: 22px;

        }


        .jidaar-empty p {

          margin: 0;

          color: #8E877E;

          font-size: 13px;

        }


        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 900px) {

          .jidaar-products-grid {

            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 18px;

          }

        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 767px) {

          .jidaar-shop {

            padding:
              30px 16px 55px;

          }


          .jidaar-shop-header {

            margin-bottom: 34px;

          }


          .jidaar-description {

            font-size: 12px;

          }


          .jidaar-categories-section {

            margin-bottom: 32px;

          }


          .jidaar-categories {

            flex-wrap: nowrap;

            justify-content:
              flex-start;

            overflow-x: auto;

            padding:
              3px 2px 10px;

            margin:
              0 -2px;

            scrollbar-width: none;

            -webkit-overflow-scrolling:
              touch;

          }


          .jidaar-categories::-webkit-scrollbar {

            display: none;

          }


          .jidaar-category {

            flex:
              0 0 auto;

            padding:
              8px 12px;

          }


          .jidaar-view-controls {

            flex-direction:
              column;

            gap: 8px;

            margin-bottom: 27px;

          }


          .jidaar-view-divider {

            display: none;

          }


          .jidaar-view-switcher {

            gap: 22px;

          }


          .jidaar-products-grid {

            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap:
              10px;

          }


          .jidaar-products-horizontal {

            gap: 12px;

          }


          .jidaar-horizontal-item {

            flex:
              0 0 min(
                78vw,
                310px
              );

          }

        }


        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 390px) {

          .jidaar-shop {

            padding-left: 12px;

            padding-right: 12px;

          }


          .jidaar-header-content h1 {

            font-size: 2.5rem;

          }


          .jidaar-products-grid {

            gap: 8px;

          }


          .jidaar-view-switcher {

            gap: 17px;

          }

        }

      `}</style>

    </section>
  )
}