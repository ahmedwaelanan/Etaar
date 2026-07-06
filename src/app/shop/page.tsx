import { createServerSupabaseClient } from '@/lib/supabase-server'
import ShopContent from './ShopContent'

export default async function ShopPage() {
  const supabase = createServerSupabaseClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return <ShopContent products={products ?? []} />
}