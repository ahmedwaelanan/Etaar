'use client'

import Link from 'next/link'

export default function HeroSection() {
  return (
    <>
      <style>{`
        @keyframes fu{from{opacity:0;transform:translateY(25px)}to{opacity:1;transform:translateY(0)}}
        .h-anim{animation:fu .6s ease both}
        .h-d1{animation-delay:.1s}.h-d2{animation-delay:.2s}.h-d3{animation-delay:.3s}.h-d4{animation-delay:.4s}
      `}</style>

      <section style={{
        minHeight: '80vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 25% 15%, rgba(201,168,76,0.07) 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, rgba(201,168,76,0.04) 0%, transparent 45%), #0A0A08',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 56,
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width=40 height=40 xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0M-10 10L10 -10M30 50L50 30' stroke='%23C9A84C' fill='none'/%3E%3C/svg%3E\")",
        }} />

        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: 896, width: '100%',
          padding: '0 24px',
          textAlign: 'center',
        }}>
          <div className="h-anim" style={{
            width: 50, height: 2, margin: '0 auto 32px',
            background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
          }} />

          <p className="h-anim h-d1" style={{
            color: '#C9A84C', fontSize: 14,
            letterSpacing: '0.3em', textTransform: 'uppercase',
            marginBottom: 16, fontFamily: 'Tajawal, sans-serif',
          }}>
            معرض الأعمال
          </p>

          <h1 className="h-anim h-d2" style={{
            fontFamily: 'Amiri, serif',
            fontSize: 'clamp(3rem, 8vw, 4.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 24,
            color: '#F2EDE4',
          }}>
            كل لحظة
            <br />
            تستحق <span style={{ color: '#C9A84C' }}>إطار</span>
          </h1>

          <p className="h-anim h-d3" style={{
            color: '#7A7468',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            maxWidth: 576, margin: '0 auto 40px',
            lineHeight: 1.75, fontFamily: 'Tajawal, sans-serif',
          }}>
            تصفح أعمالي واختر ما يعجبك، أو صمّم بروازك بنفسك وشوفه ثلاثي الأبعاد قبل الطلب
          </p>

          <div className="h-anim h-d4" style={{
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <Link href="/shop" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #C9A84C, #A88A3A)',
              color: '#0A0A08', fontWeight: 700, border: 'none',
              borderRadius: 8, padding: '12px 32px', fontSize: 16,
              fontFamily: 'Tajawal, sans-serif', cursor: 'pointer',
              textDecoration: 'none', transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <i className="fas fa-images" style={{ marginLeft: 8 }} />
              المعرض
            </Link>

            <Link href="#featured" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent',
              color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 8, padding: '12px 32px', fontSize: 16,
              fontFamily: 'Tajawal, sans-serif', fontWeight: 500,
              cursor: 'pointer', textDecoration: 'none',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor = '#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)' }}
            >
              <i className="fas fa-cube" style={{ marginLeft: 8 }} />
              صمم بروازك
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}