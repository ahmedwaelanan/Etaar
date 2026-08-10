'use client'

import Link from 'next/link'

export default function HeroSection() {
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

        @keyframes softReveal {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .h-anim {
          animation: fu .7s cubic-bezier(.22,.61,.36,1) both;
        }

        .h-d1 { animation-delay: .1s; }
        .h-d2 { animation-delay: .2s; }
        .h-d3 { animation-delay: .3s; }
        .h-d4 { animation-delay: .4s; }

        .hero-pattern {
          animation: softReveal 1.2s ease both;
        }
      `}</style>

      <section
        style={{
          minHeight: '80vh',
          position: 'relative',
          overflow: 'hidden',

          background: `
            radial-gradient(
              ellipse at 20% 15%,
              rgba(180,154,104,0.13) 0%,
              transparent 42%
            ),
            radial-gradient(
              ellipse at 85% 85%,
              rgba(214,206,195,0.35) 0%,
              transparent 45%
            ),
            #F5F2ED
          `,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          paddingTop: 56,
          paddingBottom: 72,
        }}
      >

        {/* Architectural background pattern */}
        <div
          className="hero-pattern"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.32,
            pointerEvents: 'none',

            backgroundImage: `
              linear-gradient(
                90deg,
                transparent 49.8%,
                rgba(41,42,40,0.045) 50%,
                transparent 50.2%
              ),
              linear-gradient(
                0deg,
                transparent 49.8%,
                rgba(41,42,40,0.045) 50%,
                transparent 50.2%
              )
            `,

            backgroundSize: '120px 120px',
            maskImage:
              'radial-gradient(circle at center, black, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(circle at center, black, transparent 75%)',
          }}
        />

        {/* Decorative architectural frame */}
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            right: '-170px',
            top: '-170px',
            border: '1px solid rgba(180,154,104,0.22)',
            transform: 'rotate(45deg)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: 280,
            height: 280,
            left: '-140px',
            bottom: '-140px',
            border: '1px solid rgba(41,42,40,0.08)',
            transform: 'rotate(45deg)',
            pointerEvents: 'none',
          }}
        />

        {/* Main content */}
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

          {/* Gold divider */}
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

          {/* Eyebrow */}
          <p
            className="h-anim h-d1"
            style={{
              color: '#A89063',
              fontSize: 13,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              marginBottom: 18,
              fontFamily: 'Tajawal, sans-serif',
              fontWeight: 500,
            }}
          >
            معرض JIDAAR
          </p>

          {/* Main heading */}
          <h1
            className="h-anim h-d2"
            style={{
              fontFamily: 'Amiri, serif',
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.12,
              marginBottom: 24,
              color: '#242424',
              letterSpacing: '-0.02em',
            }}
          >
            كل لحظة
            <br />

            تستحق{' '}
            <span
              style={{
                color: '#B49A68',
                position: 'relative',
                display: 'inline-block',
              }}
            >
              إطار
            </span>
          </h1>

          {/* Description */}
          <p
            className="h-anim h-d3"
            style={{
              color: '#6F6A64',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              maxWidth: 590,
              margin: '0 auto 40px',
              lineHeight: 1.9,
              fontFamily: 'Tajawal, sans-serif',
              fontWeight: 400,
            }}
          >
            تصفح أعمالنا واختر ما يعكس ذوقك،
            <br />
            أو صمّم بروازك بنفسك وشاهده قبل الطلب.
          </p>

          {/* Buttons */}
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

            {/* Primary Button */}
            <Link
              href="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,

                background: '#292A28',
                color: '#F5F2ED',

                border: '1px solid #292A28',
                borderRadius: 4,

                padding: '13px 34px',
                minWidth: 150,

                fontSize: 16,
                fontFamily: 'Tajawal, sans-serif',
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
                  '0 10px 28px rgba(180,154,104,0.22)'
              }}

              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'

                e.currentTarget.style.background =
                  '#292A28'

                e.currentTarget.style.borderColor =
                  '#292A28'

                e.currentTarget.style.color =
                  '#F5F2ED'

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


            {/* Secondary Button */}
            <Link
              href="#featured"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,

                background: 'transparent',
                color: '#292A28',

                border: '1px solid rgba(41,42,40,0.28)',
                borderRadius: 4,

                padding: '13px 34px',
                minWidth: 150,

                fontSize: 16,
                fontFamily: 'Tajawal, sans-serif',
                fontWeight: 500,

                cursor: 'pointer',
                textDecoration: 'none',

                transition:
                  'all .25s ease',
              }}

              onMouseEnter={e => {
                e.currentTarget.style.background =
                  '#EAE5DE'

                e.currentTarget.style.borderColor =
                  '#B49A68'

                e.currentTarget.style.color =
                  '#242424'

                e.currentTarget.style.transform =
                  'translateY(-2px)'
              }}

              onMouseLeave={e => {
                e.currentTarget.style.background =
                  'transparent'

                e.currentTarget.style.borderColor =
                  'rgba(41,42,40,0.28)'

                e.currentTarget.style.color =
                  '#292A28'

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

          {/* Small brand statement */}
          <div
            className="h-anim h-d4"
            style={{
              marginTop: 42,
              color: '#A39B91',
              fontSize: 11,
              letterSpacing: '0.22em',
              fontFamily: 'Tajawal, sans-serif',
            }}
          >
            DESIGNED WALLS · INSPIRED SPACES
          </div>

        </div>
      </section>
    </>
  )
}