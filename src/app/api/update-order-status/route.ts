import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { groupId, newStatus, userId, statusLabel } = await req.json()

    if (!groupId || !newStatus) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // 1. تحديث حالة الطلب
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ status: newStatus })
      .eq('group_id', groupId)

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // 2. إرسال الإشعار (بدون التسبب في أي خطأ يوقف العملية)
    const notifData = {
      title: 'تحديث حالة الطلب',
      message: `تم تحديث حالة طلبك رقم #${groupId.slice(0, 8)} إلى: ${statusLabel}`,
      type: 'Order_Update',
      group_id: groupId,
      user_id: userId || null
    }

    try {
      await supabaseAdmin.from('notifications').insert(notifData)
    } catch (err) {
      console.error("Notification error (ignored):", err)
    }

    // 3. إرجاع رسالة النجاح دائماً
    return NextResponse.json({ success: true })
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}