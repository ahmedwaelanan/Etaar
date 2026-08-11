import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'
import { Review } from '@/types'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  const [productRes, reviewsRes] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  if (!productRes.data) notFound()

  // جلب بيانات المستخدمين بشكل منفصل
  let reviewsWithProfiles: Review[] = []

  if (reviewsRes.data && reviewsRes.data.length > 0) {
    const userIds = [...new Set(reviewsRes.data.map((r) => r.user_id))]

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }])
    )

    reviewsWithProfiles = reviewsRes.data.map((r) => ({
      ...r,
      profile: profileMap.get(r.user_id) || { full_name: null, avatar_url: null },
    }))
  }

  return (
    <ProductDetailClient
      product={productRes.data}
    />
  )
}