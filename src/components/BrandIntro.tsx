'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function BrandIntro() {
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // منع الـ Intro من الظهور كل مرة أثناء التنقل داخل الموقع
    const hasSeenIntro = sessionStorage.getItem('jidaAR-intro-seen')

    if (hasSeenIntro) {
      setVisible(false)
      return
    }

    const exitTimer = setTimeout(() => {
      setExiting(true)
    }, 1800)

    const hideTimer = setTimeout(() => {
      sessionStorage.setItem('jidaAR-intro-seen', 'true')
      setVisible(false)
    }, 2350)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-[#f5f2ed]
        transition-all duration-500
        ${
          exiting
            ? 'opacity-0 -translate-y-6'
            : 'opacity-100 translate-y-0'
        }
      `}
    >
      {/* Background glow */}
      <div
        className="
          absolute
          w-[420px]
          h-[420px]
          rounded-full
          bg-[#b49a68]/[0.035]
          blur-3xl
          pointer-events-none
        "
      />

      {/* Main Logo */}
      <div className="relative flex flex-col items-center">

        {/* Logo */}
        <div className="relative w-[170px] h-[170px] sm:w-[210px] sm:h-[210px]">

          {/* Outer animated line */}
          <div
            className="
              absolute
              inset-[7px]
              opacity-0
              animate-frame-reveal
            "
          />

          <Image
            src="/logo/logonav.png"
            alt="JIDAAR"
            fill
            priority
            className="
              object-contain
              opacity-0
              animate-logo-reveal
            "
          />
        </div>

        {/* Brand Name */}
{/* Brand Name */}
<div className="mt-5 overflow-hidden">
  <h1
    className="
      text-[#292a28]
      text-[34px]
      sm:text-[42px]
      font-normal
      tracking-[0.02em]
      translate-y-full
      opacity-0
      animate-brand-reveal
    "
    style={{
      fontFamily: 'Arial, sans-serif',
    }}
  >
    JIDAAR
  </h1>
</div>

        {/* Tagline */}
        <div
          className="
            mt-3
            overflow-hidden
          "
        >
          <p
            className="
              text-[#a89063]
              text-[8px]
              sm:text-[9px]
              tracking-[0.42em]
              translate-y-full
              opacity-0
              animate-tagline-reveal
            "
          >
            DESIGNED WALLS
          </p>
        </div>

        {/* Bottom line */}
        <div
          className="
            mt-7
            w-0
            h-px
            bg-[#b49a68]
            animate-line-reveal
          "
        />

      </div>
    </div>
  )
}