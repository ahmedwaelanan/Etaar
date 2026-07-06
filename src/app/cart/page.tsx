'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login')
      toast.error('سجل دخولك أولاً لإتمام الطلب')
      return
    }
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast.error('يرجى ملء جميع بيانات الشحن')
      return
    }

    setLoading(true)
    
    // ١. التحقق من الستوك وإنشاء قائمة المنتجات المعنية
    const productIds = [...new Set(items.map(i => i.id))]
    const { data: products } = await supabase
      .from('products')
      .select('id, stock, is_sold_out')
      .in('id', productIds)

    const stockMap = new Map((products ?? []).map(p => [p.id, p]))

    // ٢. التحقق من كل عنصر في السلة
    for (const item of items) {
      const prod = stockMap.get(item.id)
      if (!prod || prod.is_sold_out || (prod.stock ?? 0) <= 0) {
        toast.error(`المنتج "${item.title}" غير متوفر حالياً`)
        setLoading(false)
        return
      }
      if (item.quantity > (prod.stock ?? 0)) {
        toast.error(`الكمية المطلوبة من "${item.title}" أكبر من المتاح (${prod.stock})`)
        setLoading(false)
        return
      }
    }

    // ٣. رقم واحد للأوردر
    const generateId = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }
    const groupId = generateId()

    const ordersToInsert = items.map(item => ({
      user_id: user.id,
      product_id: item.id,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      status: 'Pending',
      size: item.selected_size || null,
      group_id: groupId,
      full_name: fullName.trim(),
      phone_number: phone.trim(),
      shipping_address: address.trim(),
    }))

    const { error } = await supabase.from('orders').insert(ordersToInsert)

    if (error) {
      toast.error('حدث خطأ أثناء تقديم الطلبات')
    } else {
      // ٤. تنزيل الستوك وتفعيل Sold Out لو لزم
      const stockUpdates = items.reduce((acc, item) => {
        if (!acc[item.id]) acc[item.id] = 0
        acc[item.id] += item.quantity
        return acc
      }, {} as Record<string, number>)

      for (const [productId, qty] of Object.entries(stockUpdates)) {
        const prod = stockMap.get(productId)
        if (prod) {
          const newStock = Math.max(0, (prod.stock || 0) - qty)
          await supabase.from('products').update({
            stock: newStock,
            is_sold_out: newStock <= 0
          }).eq('id', productId)
        }
      }

      toast.success('تم تقديم الطلب بنجاح!')
      clearCart()
      setFullName('')
      setPhone('')
      setAddress('')
      router.push('/profile')
    }
    setLoading(false)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
        <i className="fas fa-shopping-cart text-5xl mb-6" style={{ color: '#2A2A25' }}></i>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#F2EDE4', fontFamily: 'Amiri, serif' }}>السلة فارغة</h1>
        <p className="mb-8" style={{ color: '#7A7468', fontSize: 14 }}>لم تقم بإضافة أي منتجات بعد</p>
        <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #C9A84C, #A88A3A)', color: '#0A0A08' }}>
          <i className="fas fa-arrow-left ml-2"></i>
          تصفح المعرض
        </Link>
      </div>
    )
  }

  const btnStyle = {
    background: 'linear-gradient(135deg, #C9A84C, #A88A3A)',
    color: '#0A0A08',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    borderRadius: 8,
    padding: '12px 22px',
    fontSize: 14,
    fontFamily: 'Tajawal, sans-serif',
    transition: 'all .2s',
  } as React.CSSProperties

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#F2EDE4', fontFamily: 'Amiri, serif' }}>سلة المشتريات</h1>
          <p style={{ color: '#7A7468', fontSize: 14, marginTop: 4 }}>{items.length} منتج</p>
        </div>
        <button onClick={clearCart} className="text-sm font-medium px-4 py-2 rounded-lg transition-all" style={{ color: '#D94F4F', border: '1px solid rgba(217,79,79,0.2)', background: 'rgba(217,79,79,0.05)' }}>
          تفريغ السلة
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => (
            <div key={`${item.id}-${item.selected_size}`} className="flex gap-4 p-4 rounded-xl transition-all" style={{ background: 'rgba(26,26,22,0.8)', border: '1px solid rgba(42,42,37,0.5)', backdropFilter: 'blur(20px)' }}>
              <Link href={'/shop/' + item.id} className="flex-shrink-0">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.title} className="w-20 h-24 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-24 rounded-lg flex items-center justify-center" style={{ background: '#131310' }}>
                    <i className="fas fa-image" style={{ color: '#2A2A25' }}></i>
                  </div>
                )}
              </Link>
              
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <Link href={'/shop/' + item.id} className="font-medium text-sm truncate block mb-1 hover:underline" style={{ color: '#F2EDE4' }}>
                    {item.title}
                    {item.selected_size && (
                      <span style={{ color: '#C9A84C', fontSize: 12, fontWeight: 'normal', marginLeft: 8 }}>({item.selected_size})</span>
                    )}
                  </Link>
                  <p className="text-lg" style={{ color: '#C9A84C' }}>{item.price} LE</p>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2" style={{ border: '1px solid #2A2A25', borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selected_size)} className="w-8 h-8 flex items-center justify-center transition-colors" style={{ color: '#7A7468', background: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background='#1A1A16'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                    </button>
                    <span className="w-8 text-center text-sm font-semibold" style={{ color: '#F2EDE4' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selected_size)} className="w-8 h-8 flex items-center justify-center transition-colors" style={{ color: '#7A7468', background: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background='#1A1A16'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button onClick={() => removeFromCart(item.id, item.selected_size)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#7A7468' }}
                      onMouseEnter={e => { e.currentTarget.style.color='#D94F4F'; e.currentTarget.style.background='rgba(217,79,79,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color='#7A7468'; e.currentTarget.style.background='transparent' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl sticky top-20" style={{ background: 'rgba(26,26,22,0.8)', border: '1px solid rgba(42,42,37,0.5)', backdropFilter: 'blur(20px)' }}>
          <h3 className="font-bold mb-5" style={{ color: '#F2EDE4', fontSize: 16 }}>إتمام الطلب</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-1.5" style={{ color: '#7A7468', fontSize: 12 }}>الاسم الكامل</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-dark" placeholder="أدخل اسمك الكامل" disabled={!user} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ color: '#7A7468', fontSize: 12 }}>رقم الجوال</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-dark" placeholder="05xxxxxxxx" disabled={!user} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ color: '#7A7468', fontSize: 12 }}>عنوان الشحن</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} className="input-dark" style={{ minHeight: 80, resize: 'none' }} placeholder="المدينة، الحي، الشارع، رقم المبنى" disabled={!user} />
            </div>
          </div>

          {!user && (
            <div className="p-3 rounded-lg text-center text-xs mb-4" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
              <Link href="/auth/login" className="underline font-semibold">سجل دخولك</Link> أولاً لإتمام الطلب
            </div>
          )}

          <div className="flex justify-between items-center pt-4 mb-4" style={{ borderTop: '1px solid #2A2A25' }}>
            <span style={{ color: '#7A7468', fontSize: 14 }}>الإجمالي</span>
            <span className="text-xl font-bold" style={{ color: '#C9A84C' }}>{totalPrice.toFixed(2)} LE</span>
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={loading || !user} 
            style={btnStyle}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(201,168,76,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}
            className="w-full disabled:opacity-40"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <span>تأكيد طلب ({items.length} منتجات)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}