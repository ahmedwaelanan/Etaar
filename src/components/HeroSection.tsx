'use client'

import Link from 'next/link'

export default function HeroSection() {
  // ==========================================
  // تحكم في شفافية السواد من هنا
  // ==========================================
  // 0.00 = بدون سواد
  // 0.30 = خفيف
  // 0.50 = متوسط
  // 0.65 = غامق
  // 0.80 = غامق جدًا
  // ==========================================
  const overlayOpacity = 0.55

  return (
    <>
      <style>{`
        @keyframes fu {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes videoReveal {
          from {
            opacity: 0;
            transform: scale(1.04);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .h-anim {
          animation: fu .7s cubic-bezier(.22,.61,.36,1) both;
        }

        .h-d1 {
          animation-delay: .1s;
        }

        .h-d2 {
          animation-delay: .2s;
        }

        .h-d3 {
          animation-delay: .3s;
        }

        .h-d4 {
          animation-delay: .4s;
        }

        .hero-video {
          animation: videoReveal 1.4s ease both;
        }

        /* ==========================================
           MOBILE VIDEO
        =========================================== */

        .hero-video-mobile {
          display: block;
        }

        .hero-video-desktop {
          display: none;
        }

        @media (min-width: 769px) {
          .hero-video-mobile {
            display: none;
          }

          .hero-video-desktop {
            display: block;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            min-height: 82vh !important;
          }
        }
      `}</style>

      <section
        className="hero-section"
        style={{
          minHeight: '80vh',

          position: 'relative',

          overflow: 'hidden',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          paddingTop: 56,

          paddingBottom: 72,

          background: '#11110F',
        }}
      >

        {/* ==========================================
            BACKGROUND VIDEO — MOBILE
            فيديو الموبايل
        =========================================== */}

        <video
          className="hero-video hero-video-mobile"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          style={{
            position: 'absolute',

            inset: 0,

            width: '100%',

            height: '100%',

            objectFit: 'cover',

            objectPosition: 'center',

            zIndex: 0,

            pointerEvents: 'none',
          }}
        >
          <source
            src="/videos/jidaar-hero.mp4"
            type="video/mp4"
          />
        </video>


        {/* ==========================================
            BACKGROUND VIDEO — DESKTOP
            فيديو اللابتوب
        =========================================== */}

        <video
          className="hero-video hero-video-desktop"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          style={{
            position: 'absolute',

            inset: 0,

            width: '100%',

            height: '130%',

            objectFit: 'cover',

            objectPosition: 'center',

            zIndex: 0,

            pointerEvents: 'none',
          }}
        >
          <source
            src="/videos/jidaar-hero-desktop.mp4"
            type="video/mp4"
          />
        </video>


        {/* ==========================================
            BLACK OVERLAY
        =========================================== */}

        <div
          style={{
            position: 'absolute',

            inset: 0,

            background: `rgba(0, 0, 0, ${overlayOpacity})`,

            zIndex: 1,

            pointerEvents: 'none',
          }}
        />


        {/* ==========================================
            EXTRA CENTER DARKNESS
            يخلي الكلام أوضح بدون ما يغمق الفيديو كله
        =========================================== */}

        <div
          style={{
            position: 'absolute',

            inset: 0,

            background: `
              radial-gradient(
                ellipse at center,
                rgba(0,0,0,0.05) 0%,
                rgba(0,0,0,0.12) 45%,
                rgba(0,0,0,0.32) 100%
              )
            `,

            zIndex: 2,

            pointerEvents: 'none',
          }}
        />


        {/* ==========================================
            SUBTLE GOLD LIGHT
        =========================================== */}

        <div
          style={{
            position: 'absolute',

            width: 650,

            height: 650,

            left: '50%',

            top: '50%',

            transform: 'translate(-50%, -50%)',

            background:
              'radial-gradient(circle, rgba(180,154,104,0.09), transparent 68%)',

            filter: 'blur(30px)',

            pointerEvents: 'none',

            zIndex: 3,
          }}
        />


        {/* ==========================================
            DECORATIVE FRAME — TOP RIGHT
        =========================================== */}

        <div
          style={{
            position: 'absolute',

            width: 420,

            height: 420,

            right: '-170px',

            top: '-170px',

            border:
              '1px solid rgba(180,154,104,0.22)',

            transform: 'rotate(45deg)',

            pointerEvents: 'none',

            zIndex: 4,
          }}
        />


        {/* ==========================================
            DECORATIVE FRAME — BOTTOM LEFT
        =========================================== */}

        <div
          style={{
            position: 'absolute',

            width: 280,

            height: 280,

            left: '-140px',

            bottom: '-140px',

            border:
              '1px solid rgba(180,154,104,0.13)',

            transform: 'rotate(45deg)',

            pointerEvents: 'none',

            zIndex: 4,
          }}
        />


        {/* ==========================================
            MAIN CONTENT
        =========================================== */}

        <div
          style={{
            position: 'relative',

            zIndex: 10,

            maxWidth: 896,

            width: '100%',

            padding: '0 24px',

            textAlign: 'center',
          }}
        >

          {/* ==========================================
              GOLD DIVIDER
          =========================================== */}

          <div
            className="h-anim"
            style={{
              width: 64,

              height: 1,

              margin: '0 auto 30px',

              background:
                'linear-gradient(90deg, transparent, #B49A68, transparent)',
            }}
          />


          {/* ==========================================
              EYEBROW
          =========================================== */}

          <p
            className="h-anim h-d1"
            style={{
              color: '#C2A96F',

              fontSize: 13,

              letterSpacing: '0.28em',

              textTransform: 'uppercase',

              marginBottom: 18,

              fontFamily:
                'Tajawal, sans-serif',

              fontWeight: 500,

              textShadow:
                '0 2px 15px rgba(0,0,0,0.6)',
            }}
          >
            معرض JIDAAR
          </p>


          {/* ==========================================
              MAIN HEADING
          =========================================== */}

          <h1
            className="h-anim h-d2"
            style={{
              fontFamily: 'Amiri, serif',

              fontSize:
                'clamp(3rem, 8vw, 5rem)',

              fontWeight: 700,

              lineHeight: 1.12,

              marginBottom: 24,

              color: '#F7F4EE',

              letterSpacing: '-0.02em',

              textShadow:
                '0 4px 30px rgba(0,0,0,0.65)',
            }}
          >
            كل لحظة

            <br />

            تستحق{' '}

            <span
              style={{
                color: '#C1A66D',

                position: 'relative',

                display: 'inline-block',

                textShadow:
                  '0 3px 20px rgba(0,0,0,0.6)',
              }}
            >
              إطار
            </span>
          </h1>


          {/* ==========================================
              DESCRIPTION
          =========================================== */}

          <p
            className="h-anim h-d3"
            style={{
              color:
                'rgba(247,244,238,0.78)',

              fontSize:
                'clamp(1rem, 2.5vw, 1.2rem)',

              maxWidth: 590,

              margin: '0 auto 40px',

              lineHeight: 1.9,

              fontFamily:
                'Tajawal, sans-serif',

              fontWeight: 400,

              textShadow:
                '0 2px 15px rgba(0,0,0,0.6)',
            }}
          >
            اختر ما يعكس ذوقك
          </p>


          {/* ==========================================
              BUTTONS
          =========================================== */}

          <div
            className="h-anim h-d4"
            style={{
              display: 'flex',

              flexWrap: 'wrap',

              alignItems: 'center',

              justifyContent: 'center',

              gap: 14,
            }}
          >

            {/* ========================================
                PRIMARY BUTTON
            ========================================= */}

            <Link
              href="/shop"
              style={{
                display: 'inline-flex',

                alignItems: 'center',

                justifyContent: 'center',

                gap: 9,

                background: '#F5F2ED',

                color: '#292A28',

                border:
                  '1px solid #F5F2ED',

                borderRadius: 4,

                padding: '13px 34px',

                minWidth: 150,

                fontSize: 16,

                fontFamily:
                  'Tajawal, sans-serif',

                fontWeight: 600,

                cursor: 'pointer',

                textDecoration: 'none',

                transition:
                  'transform .25s ease, background .25s ease, box-shadow .25s ease',
              }}

              onMouseEnter={e => {
                e.currentTarget.style.transform =
                  'translateY(-2px)'

                e.currentTarget.style.background =
                  '#B49A68'

                e.currentTarget.style.borderColor =
                  '#B49A68'

                e.currentTarget.style.color =
                  '#242424'

                e.currentTarget.style.boxShadow =
                  '0 10px 28px rgba(180,154,104,0.25)'
              }}

              onMouseLeave={e => {
                e.currentTarget.style.transform =
                  'none'

                e.currentTarget.style.background =
                  '#F5F2ED'

                e.currentTarget.style.borderColor =
                  '#F5F2ED'

                e.currentTarget.style.color =
                  '#292A28'

                e.currentTarget.style.boxShadow =
                  'none'
              }}
            >
              <i
                className="fas fa-images"
                style={{
                  fontSize: 14,
                }}
              />

              المعرض
            </Link>


            {/* ========================================
                SECONDARY BUTTON
            ========================================= */}

            <Link
              href="#featured"
              style={{
                display: 'inline-flex',

                alignItems: 'center',

                justifyContent: 'center',

                gap: 9,

                background:
                  'rgba(255,255,255,0.05)',

                color: '#F5F2ED',

                border:
                  '1px solid rgba(245,242,237,0.38)',

                borderRadius: 4,

                padding: '13px 34px',

                minWidth: 150,

                fontSize: 16,

                fontFamily:
                  'Tajawal, sans-serif',

                fontWeight: 500,

                cursor: 'pointer',

                textDecoration: 'none',

                backdropFilter:
                  'blur(6px)',

                transition:
                  'all .25s ease',
              }}

              onMouseEnter={e => {
                e.currentTarget.style.background =
                  'rgba(180,154,104,0.16)'

                e.currentTarget.style.borderColor =
                  '#B49A68'

                e.currentTarget.style.color =
                  '#C9AF76'

                e.currentTarget.style.transform =
                  'translateY(-2px)'
              }}

              onMouseLeave={e => {
                e.currentTarget.style.background =
                  'rgba(255,255,255,0.05)'

                e.currentTarget.style.borderColor =
                  'rgba(245,242,237,0.38)'

                e.currentTarget.style.color =
                  '#F5F2ED'

                e.currentTarget.style.transform =
                  'none'
              }}
            >
              <i
                className="fas fa-cube"
                style={{
                  fontSize: 14,
                }}
              />

              صمّم بروازك
            </Link>

          </div>


          {/* ==========================================
              BRAND STATEMENT
          =========================================== */}

          <div
            className="h-anim h-d4"
            style={{
              marginTop: 42,

              color:
                'rgba(245,242,237,0.42)',

              fontSize: 11,

              letterSpacing: '0.22em',

              fontFamily:
                'Tajawal, sans-serif',
            }}
          >
            DESIGNED WALLS · INSPIRED SPACES
          </div>

        </div>

      </section>
    </>
  )
}