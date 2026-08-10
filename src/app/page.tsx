import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

import HeroSection from '@/components/HeroSection'
import FeaturedSlider from '@/components/FeaturedSlider'
import FeaturedProducts from '@/components/FeaturedProducts'

export default async function Home() {
  const supabase = createServerSupabaseClient()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', {
      ascending: false,
    })

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F5F2ED',
        color: '#292A28',
      }}
    >
      {/* =====================================
          HERO
      ===================================== */}

      <HeroSection />

      {/* =====================================
          FEATURED SECTION
      ===================================== */}

      <section
        id="featured"
        className="jidaar-featured-section"
      >
        {/* =====================================
            SECTION HEADER
        ===================================== */}

        <div className="jidaar-section-header">
          <div className="jidaar-eyebrow">
            <span />

            <p>
              Featured Collection
            </p>

            <span />
          </div>

          <h2>
            مجموعة مختارة
          </h2>

          <p className="jidaar-section-description">
            أعمال مختارة بعناية لتضيف لمسة فنية
            هادئة وتكمل تفاصيل مساحتك.
          </p>

          <div className="jidaar-divider" />
        </div>

        {/* =====================================
            FEATURED SLIDER
        ===================================== */}

        {featuredProducts &&
        featuredProducts.length > 0 ? (
          <div className="jidaar-featured-slider-wrapper">
            <FeaturedSlider
              products={featuredProducts}
            />
          </div>
        ) : null}

        {/* =====================================
            FEATURED PRODUCTS
        ===================================== */}

        {featuredProducts &&
        featuredProducts.length > 0 ? (
          <FeaturedProducts
            products={featuredProducts}
          />
        ) : (
          <div className="jidaar-empty">
            لا توجد منتجات مميزة حالياً
          </div>
        )}

        {/* =====================================
            VIEW ALL
        ===================================== */}

        <div className="jidaar-view-all-wrapper">
          <Link
            href="/shop"
            className="jidaar-view-all"
          >
            <span>
              عرض جميع الأعمال
            </span>

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M19 12H5" />

              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* =====================================
          PAGE STYLES
      ===================================== */}

      <style>{`
        .jidaar-featured-section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 100px 24px 110px;
        }

        /* =====================================
           SECTION HEADER
        ===================================== */

        .jidaar-section-header {
          text-align: center;
          margin-bottom: 55px;
        }

        .jidaar-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          margin-bottom: 16px;
        }

        .jidaar-eyebrow span {
          width: 32px;
          height: 1px;
          background: #B49A68;
        }

        .jidaar-eyebrow p {
          margin: 0;
          color: #A28A61;
          font-family: Tajawal, sans-serif;
          font-size: 11px;
          letter-spacing: .25em;
          text-transform: uppercase;
        }

        .jidaar-section-header h2 {
          margin: 0;
          color: #292A28;
          font-family: Amiri, serif;
          font-size: clamp(
            2.2rem,
            5vw,
            3.5rem
          );
          line-height: 1.2;
        }

        .jidaar-section-description {
          max-width: 520px;
          margin: 15px auto 0;
          color: #77716A;
          font-family: Tajawal, sans-serif;
          font-size: 14px;
          line-height: 1.9;
        }

        .jidaar-divider {
          width: 45px;
          height: 1px;
          margin: 25px auto 0;
          background: #B49A68;
        }

        /* =====================================
           FEATURED SLIDER
        ===================================== */

        .jidaar-featured-slider-wrapper {
          width: 100%;
          margin-bottom: 65px;
        }

        /* =====================================
           EMPTY STATE
        ===================================== */

        .jidaar-empty {
          padding: 60px;
          text-align: center;
          background: #EEEAE4;
          border: 1px solid #D6CEC3;
          color: #888078;
          font-family: Tajawal, sans-serif;
        }

        /* =====================================
           VIEW ALL
        ===================================== */

        .jidaar-view-all-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 55px;
        }

        .jidaar-view-all {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          padding: 12px 26px;
          border: 1px solid #CFC7BC;
          background: transparent;
          color: #292A28;
          font-family: Tajawal, sans-serif;
          font-size: 13px;
          text-decoration: none;
          transition: all .25s ease;
        }

        .jidaar-view-all:hover {
          background: #292A28;
          color: #F7F5F1;
          border-color: #292A28;
          transform: translateY(-2px);
        }

        /* =====================================
           MOBILE
        ===================================== */

        @media (max-width: 767px) {
          .jidaar-featured-section {
            padding: 72px 16px 80px;
          }

          .jidaar-section-header {
            margin-bottom: 35px;
          }

          .jidaar-section-description {
            font-size: 13px;
          }

          .jidaar-featured-slider-wrapper {
            margin-bottom: 45px;
          }
        }
      `}</style>
    </main>
  )
}