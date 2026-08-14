import { createServerSupabaseClient } from '@/lib/supabase-server'
import ShopContent from './ShopContent'

export default async function ShopPage() {
  const supabase = createServerSupabaseClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', {
      ascending: true,
      nullsFirst: false,
    })

  if (error) {
    console.error('Failed to load products:', error)
  }

  return <ShopContent products={products ?? []} />
}