'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Product } from '@/types'

export default function FeaturedSlider({ products }: { products: Product[] }) {
  const [current, setCurrent] = useState(0)

  const nextSlide = useCallback(() => {
    if (products.length <= 1) return
    setCurrent(prev => (prev + 1) % products.length)
  }, [products.length])

  const prevSlide = useCallback(() => {
    if (products.length <= 1) return
    setCurrent(prev => (prev - 1 + products.length) % products.length)
  }, [products.length])

  useEffect(() => {
    if (products.length <= 1) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide, products.length])

  if (!products || products.length === 0) return null

  const activeProduct = products[current]

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-12 min-h-[60vh] sm:min-h-[50vh] lg:min-h-0 lg:aspect-[21/9]" style={{ background: '#131310' }}>
      {products.map((product, index) => (
        <img 
          key={product.id}
          src={product.images && product.images.length > 0 ? product.images[0] : ''} 
          alt={product.title} 
          fetchPriority={index === current ? "high" : "low"}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: index === current ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 1,
            backgroundColor: '#1A1A16',
          }}
          onError={(e) => {
            e.currentTarget.style.background = '#1A1A16'
            e.currentTarget.style.display = 'none'
          }}
        />
      ))}

      <div className="absolute inset-0 z-[2]" style={{ background: 'linear-gradient(to left, rgba(10,10,8,0.95) 0%, rgba(10,10,8,0.5) 50%, transparent 100%)' }} />
      
      <div className="absolute inset-0 z-[3] flex items-center justify-end p-6 sm:p-12 lg:p-16">
        <div className="text-left max-w-lg w-full" style={{ fontFamily: 'Tajawal, sans-serif' }}>
          <span className="inline-block px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider mb-4" style={{background:'rgba(201,168,76,.15)',color:'#DFC06A',border:'1px solid rgba(201,168,76,.2)'}}>
            {activeProduct.category}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Amiri, serif' }}>
            {activeProduct.title}
          </h2>
          <p className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: '#C9A84C' }}>
            {activeProduct.price} LE
          </p>
          <Link 
            href={`/shop/${activeProduct.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A88A3A)', color: '#0A0A08', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(201,168,76,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}
          >
            View Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>

      {products.length > 1 && (
        <>
          <button 
            onClick={prevSlide} 
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 transition-all"
            style={{ background: 'rgba(10,10,8,0.6)', backdropFilter: 'blur(3px)', border: '1px solid rgba(42,42,37,0.5)', color: '#F2EDE4', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,0.3)'; e.currentTarget.style.color='#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(10,10,8,0.6)'; e.currentTarget.style.color='#F2EDE4' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          
          <button 
            onClick={nextSlide} 
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 transition-all"
            style={{ background: 'rgba(10,10,8,0.6)', backdropFilter: 'blur(3px)', border: '1px solid rgba(42,42,37,0.5)', color: '#F2EDE4', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,0.3)'; e.currentTarget.style.color='#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(10,10,8,0.6)'; e.currentTarget.style.color='#F2EDE4' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}

      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: current === i ? 24 : 8,
              height: 8,
              background: current === i ? '#C9A84C' : 'rgba(242,237,228,0.3)',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  )
}