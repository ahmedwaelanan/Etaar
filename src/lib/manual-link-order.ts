import { supabase } from '@/lib/supabase'

// دالة لتوليد ID عشوائي للزائر يعمل في أي بيئة (حتى غير الآمنة)
const generateGuestId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// دالة للحصول على الـ ID من المتصفح أو إنشاء واحد جديد
export const getGuestId = () => {
  if (typeof window === 'undefined') return null;
  
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem('guest_id', guestId);
  }
  return guestId;
}

// دالة ربط الطلبات بالحساب الجديد بناءً على guest_id
export const linkGuestOrderToNewUser = async (userId: string, guestId: string | null) => {
  if (!guestId) return false

  // 1. نجيب كل الطلبات اللي ليها نفس الـ guest_id ومش مربوطة بيوزر
  const { data: guestOrders, error } = await supabase
    .from('orders')
    .select('id')
    .is('user_id', null)
    .eq('guest_id', guestId)

  if (error || !guestOrders || guestOrders.length === 0) {
    return false
  }

  // 2. نحدد الـ IDs بتاعتهم
  const matchedIds = guestOrders.map(o => o.id)

  // 3. نربطهم بالأكاونت الجديد دفعة واحدة
  const { error: updateError } = await supabase
    .from('orders')
    .update({ user_id: userId, guest_id: null }) // نحذف الـ guest_id بعد ربطه
    .in('id', matchedIds)

  if (updateError) {
    console.error("Error linking orders:", updateError)
    return false
  }

  // 4. نمسح الـ guest_id من المتصفح لأنه أصبح حساب مسجل الآن
  if (typeof window !== 'undefined') {
    localStorage.removeItem('guest_id')
  }

  return true
}