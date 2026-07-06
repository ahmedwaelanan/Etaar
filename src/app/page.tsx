import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import HeroSection from '@/components/HeroSection'
import FeaturedSlider from '@/components/FeaturedSlider'

export default async function Home() {
  const supabase = createServerSupabaseClient()
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <HeroSection />

      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-gold/50 text-md tracking-[0.3em] uppercase">Featured Collection</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">محـتـــــــــــــــــوى مميـــــــز</h2>
          <div className="w-16 h-px bg-gradient-to-l from-transparent via-gold/40 to-transparent mx-auto mt-6" />
        </div>
        
        <FeaturedSlider products={featuredProducts ?? []} />

        {featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass p-16 text-center">
            <p className="text-white/30 text-sm">لا توجد منتجات مميزة حالياً</p>
          </div>
        )}
        <div className="text-center mt-14">
          <Link href="/shop" className="btn-ghost inline-flex items-center gap-2 text-sm">
            <span>عرض جميع المنتجات</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}