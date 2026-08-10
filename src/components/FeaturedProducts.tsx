'use client'

import { useState } from 'react'
import ProductCard, {
  ProductViewMode,
} from '@/components/ProductCard'
import { Product } from '@/types'

export default function FeaturedProducts({
  products,
}: {
  products: Product[]
}) {
  const [viewMode, setViewMode] =
    useState<ProductViewMode>('grid')

  return (
    <div className="jidaar-products-wrapper">

      {/* =========================================
          VIEW CONTROLS
      ========================================= */}

      <div className="jidaar-view-controls">

        {/* -----------------------------------------
            TITLE
        ----------------------------------------- */}

        <div className="jidaar-view-title">

          <span className="jidaar-view-title-mark">
            ✦
          </span>

          <span>
            اختار طريقة العرض المفضلة
          </span>

        </div>


        {/* -----------------------------------------
            DIVIDER
        ----------------------------------------- */}

        <span className="jidaar-view-divider" />


        {/* -----------------------------------------
            VIEW OPTIONS
        ----------------------------------------- */}

        <div className="jidaar-view-switcher">

          {/* GRID */}

          <button
            type="button"
            onClick={() =>
              setViewMode('grid')
            }
            className={
              viewMode === 'grid'
                ? 'active'
                : ''
            }
            aria-label="Grid view"
            aria-pressed={
              viewMode === 'grid'
            }
          >

            <span className="jidaar-view-icon">
              <svg
                width="16"
                height="16"
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
                  rx="0.5"
                />

                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="0.5"
                />

                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="0.5"
                />

                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                  rx="0.5"
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
                ? 'active'
                : ''
            }
            aria-label="Horizontal view"
            aria-pressed={
              viewMode === 'horizontal'
            }
          >

            <span className="jidaar-view-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="1"
                />

                <path d="M7 9h10" />
                <path d="M7 12h7" />
              </svg>
            </span>

            <span>
              أفقي
            </span>

          </button>


          {/* LIST */}

          <button
            type="button"
            onClick={() =>
              setViewMode('list')
            }
            className={
              viewMode === 'list'
                ? 'active'
                : ''
            }
            aria-label="List view"
            aria-pressed={
              viewMode === 'list'
            }
          >

            <span className="jidaar-view-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M8 6h13" />
                <path d="M8 12h13" />
                <path d="M8 18h13" />

                <circle
                  cx="3.5"
                  cy="6"
                  r=".7"
                  fill="currentColor"
                  stroke="none"
                />

                <circle
                  cx="3.5"
                  cy="12"
                  r=".7"
                  fill="currentColor"
                  stroke="none"
                />

                <circle
                  cx="3.5"
                  cy="18"
                  r=".7"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </span>

            <span>
              قائمة
            </span>

          </button>

        </div>

      </div>


      {/* =========================================
          PRODUCTS
      ========================================= */}

      <div
        className={`
          jidaar-products-container
          jidaar-products-${viewMode}
        `}
      >

        {products.map(
          (product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              viewMode={viewMode}
            />
          )
        )}

      </div>


      {/* =========================================
          STYLES
      ========================================= */}

      <style jsx>{`

        /* =========================================
           WRAPPER
        ========================================= */

        .jidaar-products-wrapper {
          width: 100%;
        }


        /* =========================================
           VIEW CONTROLS

           Floating / Editorial
        ========================================= */

        .jidaar-view-controls {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 20px;

          margin:
            0 auto 38px;

          min-height: 38px;

          direction: rtl;
        }


        /* =========================================
           TITLE
        ========================================= */

        .jidaar-view-title {

          display: inline-flex;

          align-items: center;

          gap: 8px;

          color:
            #77716A;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 11px;

          font-weight: 500;

          white-space: nowrap;

          letter-spacing:
            .015em;

          opacity: .9;
        }


        .jidaar-view-title-mark {

          color:
            #B49A68;

          font-size: 10px;

          line-height: 1;

          transform:
            translateY(-1px);

          opacity: .85;
        }


        /* =========================================
           DIVIDER
        ========================================= */

        .jidaar-view-divider {

          width: 1px;

          height: 20px;

          background:
            linear-gradient(
              to bottom,
              transparent,
              #C9BDAE,
              transparent
            );

          opacity: .65;
        }


        /* =========================================
           SWITCHER

           Completely floating.
        ========================================= */

        .jidaar-view-switcher {

          display: flex;

          align-items: center;

          gap: 24px;

          direction: rtl;
        }


        /* =========================================
           BUTTON
        ========================================= */

        .jidaar-view-switcher button {

          position: relative;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          min-width: 54px;

          height: 34px;

          padding:
            0 2px;

          border: 0;

          outline: none;

          background:
            transparent;

          color:
            #9A938A;

          font-family:
            Tajawal,
            sans-serif;

          font-size: 11px;

          font-weight: 500;

          cursor: pointer;

          transition:
            color .3s ease,
            transform .3s ease;
        }


        /* =========================================
           ICON
        ========================================= */

        .jidaar-view-icon {

          display: flex;

          align-items: center;

          justify-content: center;

          width: 20px;

          height: 20px;

          color:
            #A69E95;

          transition:
            color .3s ease,
            transform .3s ease;
        }


        /* =========================================
           HOVER
        ========================================= */

        .jidaar-view-switcher button:hover {

          color:
            #4E4A45;

          transform:
            translateY(-1px);
        }


        .jidaar-view-switcher
        button:hover
        .jidaar-view-icon {

          color:
            #8E7850;

          transform:
            translateY(-1px);
        }


        /* =========================================
           ACTIVE
        ========================================= */

        .jidaar-view-switcher
        button.active {

          color:
            #292A28;
        }


        .jidaar-view-switcher
        button.active
        .jidaar-view-icon {

          color:
            #A88C58;

          transform:
            translateY(-1px);
        }


        /* =========================================
           ACTIVE FLOATING GOLD LINE
        ========================================= */

        .jidaar-view-switcher
        button::after {

          content: '';

          position: absolute;

          left: 50%;

          bottom: -5px;

          width: 0;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #B49A68,
              transparent
            );

          transform:
            translateX(-50%);

          opacity: 0;

          transition:
            width .35s ease,
            opacity .35s ease;
        }


        .jidaar-view-switcher
        button.active::after {

          width: 28px;

          opacity: 1;
        }


        /* =========================================
           SUBTLE GOLD GLOW ON ACTIVE ICON
        ========================================= */

        .jidaar-view-switcher
        button.active
        .jidaar-view-icon svg {

          filter:
            drop-shadow(
              0 2px 5px
              rgba(180,154,104,.18)
            );
        }


        /* =========================================
           PRODUCTS
        ========================================= */

        .jidaar-products-container {

          width: 100%;
        }


        .jidaar-products-grid {

          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 24px;
        }


        .jidaar-products-horizontal {

          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 24px;
        }


        .jidaar-products-list {

          display: grid;

          grid-template-columns:
            1fr;

          gap: 18px;
        }


        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 767px) {

          .jidaar-view-controls {

            flex-direction: column;

            gap: 10px;

            margin-bottom: 30px;
          }


          .jidaar-view-title {

            font-size: 10.5px;
          }


          .jidaar-view-divider {

            display: none;
          }


          .jidaar-view-switcher {

            gap: 25px;
          }


          .jidaar-view-switcher button {

            min-width: 55px;

            height: 32px;

            font-size: 10.5px;
          }


          .jidaar-view-icon {

            width: 19px;

            height: 19px;
          }


          /*
             GRID
          */

          .jidaar-products-grid {

            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 10px;
          }


          /*
             HORIZONTAL
          */

          .jidaar-products-horizontal {

            display: flex;

            overflow-x: auto;

            overflow-y: hidden;

            gap: 12px;

            padding:
              3px
              3px
              18px;

            margin:
              0 -3px;

            scroll-snap-type:
              x mandatory;

            -webkit-overflow-scrolling:
              touch;

            scrollbar-width: none;
          }


          .jidaar-products-horizontal::-webkit-scrollbar {

            display: none;
          }


          .jidaar-products-horizontal
          :global(.jidaar-horizontal) {

            width:
              min(78vw, 310px);

            flex:
              0 0 min(78vw, 310px);

            scroll-snap-align:
              start;
          }


          /*
             LIST
          */

          .jidaar-products-list {

            display: grid;

            grid-template-columns:
              1fr;

            gap: 14px;
          }


          .jidaar-products-list
          :global(.jidaar-list) {

            width: 100%;
          }

        }


        /* =========================================
           SMALL MOBILE
        ========================================= */

        @media (max-width: 390px) {

          .jidaar-view-controls {

            gap: 8px;

            margin-bottom: 27px;
          }


          .jidaar-view-title {

            font-size: 10px;
          }


          .jidaar-view-switcher {

            gap: 18px;
          }


          .jidaar-view-switcher button {

            min-width: 50px;

            font-size: 10px;

            gap: 5px;
          }


          .jidaar-view-icon {

            width: 17px;

            height: 17px;
          }


          .jidaar-view-switcher
          button::after {

            bottom: -4px;
          }


          .jidaar-products-grid {

            gap: 8px;
          }

        }

      `}</style>

    </div>
  )
}