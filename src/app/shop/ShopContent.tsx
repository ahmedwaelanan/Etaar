'use client'

import { useState } from 'react'
import { Product, CATEGORIES, CATEGORY_LABELS } from '@/types'
import ProductCard from '@/components/ProductCard'

export default function ShopContent({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const filtered = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">المتجر</h1>
        <div className="w-16 h-px bg-gradient-to-l from-transparent via-gold/40 to-transparent mx-auto mt-5" />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
        <button
          onClick={() => setActiveCategory('All')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
            activeCategory === 'All'
              ? 'bg-gold text-base shadow-[0_0_20px_rgba(201,169,110,0.2)]'
              : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/80'
          }`}
        >
          الكل
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-gold text-base shadow-[0_0_20px_rgba(201,169,110,0.2)]'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/80'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="glass p-20 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10 mx-auto mb-4">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="text-white/30 text-sm">لا توجد منتجات في هذا التصنيف</p>
        </div>
      )}
    </div>
  )
}