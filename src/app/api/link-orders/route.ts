import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { userId, guestId } = await req.json()

    if (!userId || !guestId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // إنشاء عميل Supabase بمفتاح الأدمن لتخطي RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // تأكد أن هذا المتغير موجود في ملف .env.local
      { auth: { persistSession: false } }
    )

    // 1. البحث عن طلبات الزائر
    const { data: guestOrders } = await supabaseAdmin
      .from('orders')
      .select('id, group_id')
      .is('user_id', null)
      .eq('guest_id', guestId)

    if (!guestOrders || guestOrders.length === 0) {
      return NextResponse.json({ success: false, message: 'No guest orders found' })
    }

    const matchedIds = guestOrders.map(o => o.id)
    const matchedGroupIds = [...new Set(guestOrders.map(o => o.group_id).filter(Boolean))] as string[]

    // 2. ربط الطلبات بالحساب الجديد
    await supabaseAdmin
      .from('orders')
      .update({ user_id: userId, guest_id: null })
      .in('id', matchedIds)

    // 3. ربط الإشعارات بالحساب الجديد
    if (matchedGroupIds.length > 0) {
      await supabaseAdmin
        .from('notifications')
        .update({ user_id: userId })
        .in('group_id', matchedGroupIds)
        .is('user_id', null)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Linking API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}