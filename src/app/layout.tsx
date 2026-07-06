import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'إطار - Etaar | كل لحظة تستحق إطار',
  description: 'متجرك المفضل للإطارات الفنية الفاخرة. كل لحظة تستحق إطار.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body style={{ fontFamily: "'Tajawal', sans-serif" }}>
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-14">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}