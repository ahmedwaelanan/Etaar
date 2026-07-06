'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { STATUS_LABELS, STATUS_COLORS, Order, Product } from '@/types'
import GlassPanel from '@/components/GlassPanel'

export default function AdminDashboardClient() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [recentOrders, setRecentOrders] = useState<(Order & { product?: Product })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const [productsRes, ordersRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('orders').select('*, product:products(*)').order('created_at', { ascending: false }).limit(5),
    ])

    if (productsRes.data) setTotalProducts(productsRes.data.length)
    if (ordersRes.data) {
      setRecentOrders(ordersRes.data)
      setTotalOrders(ordersRes.data.length)
      setPendingCount(ordersRes.data.filter((o) => o.status === 'Pending').length)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
          <p className="text-white/30 text-sm mt-1">نظرة عامة على متجر إطار</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="btn-ghost text-xs !py-2 inline-flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${loading ? 'animate-spin' : ''}`}>
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          تحديث
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassPanel className="p-6">
          <p className="text-white/40 text-xs mb-2">إجمالي المنتجات</p>
          {loading ? (
            <span className="inline-block w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          ) : (
            <p className="text-3xl font-bold text-white">{totalProducts}</p>
          )}
        </GlassPanel>
        <GlassPanel className="p-6">
          <p className="text-white/40 text-xs mb-2">إجمالي الطلبات</p>
          {loading ? (
            <span className="inline-block w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          ) : (
            <p className="text-3xl font-bold text-white">{totalOrders}</p>
          )}
        </GlassPanel>
        <GlassPanel className="p-6">
          <p className="text-white/40 text-xs mb-2">طلبات قيد الانتظار</p>
          {loading ? (
            <span className="inline-block w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          ) : (
            <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
          )}
        </GlassPanel>
      </div>

      <GlassPanel className="p-6">
        <h2 className="text-white font-semibold text-sm mb-4">آخر الطلبات</h2>
        {loading ? (
          <div className="py-8 flex justify-center">
            <span className="inline-block w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-white text-sm">{order.product?.title || 'منتج محذوف'}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('ar-EG')}
                    {' · '}الكمية: {order.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                    {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                  </span>
                  <span className="text-gold text-sm font-semibold whitespace-nowrap">{order.total_price} LE</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/20 text-sm py-4 text-center">لا توجد طلبات بعد</p>
        )}
      </GlassPanel>
    </div>
  )
}