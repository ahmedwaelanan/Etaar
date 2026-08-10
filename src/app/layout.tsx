import type { Metadata } from 'next'
// @ts-ignore: Allow side-effect CSS import without type declarations
import './globals.css'

import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BrandIntro from '@/components/BrandIntro'

export const metadata: Metadata = {
  title: 'JIDAAR | Designed Walls',
  description:
    'JIDAAR — إطارات وديكورات حائط بتصميم عصري وفاخر. Designed Walls.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />

        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
    <link
  href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:wght@400;700&display=swap"
  rel="stylesheet"
/>
      </head>

      <body
        style={{
          fontFamily: "'Tajawal', sans-serif",
        }}
      >
        <Providers>

          {/* ================================
              JIDAAR BRAND INTRO
          ================================= */}
          <BrandIntro />

          {/* ================================
              NAVBAR
          ================================= */}
          <Navbar />

          {/* ================================
              MAIN CONTENT
          ================================= */}
          <main className="min-h-screen pt-14">
            {children}
          </main>

          {/* ================================
              FOOTER
          ================================= */}
          <Footer />

        </Providers>
      </body>
    </html>
  )
}