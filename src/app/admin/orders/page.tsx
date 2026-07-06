'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Order, OrderStatus, STATUS_LABELS, STATUS_COLORS } from '@/types'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('All')

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, product:products(*), profile:profiles(*)')
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatusChange = async (groupId: string, newStatus: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('group_id', groupId)
    if (error) {
      toast.error('حدث خطأ أثناء تحديث الحالة')
    } else {
      toast.success('تم تحديث حالة الطلب')
      setOrders((prev) => prev.map((o) => (o.group_id === groupId ? { ...o, status: newStatus } : o)))
    }
  }

  // تجميع الطلبات حسب الـ group_id
  const groupedOrders = orders.reduce((acc, order) => {
    const id = order.group_id || order.id
    if (!acc[id]) {
      acc[id] = { ...order, items: [order] }
    } else {
      acc[id].items.push(order)
      // لو لقينا بيانات الشحن فاضية في المجموعة، نعبئها
      if (!acc[id].full_name && order.full_name) acc[id].full_name = order.full_name
      if (!acc[id].phone_number && order.phone_number) acc[id].phone_number = order.phone_number
      if (!acc[id].shipping_address && order.shipping_address) acc[id].shipping_address = order.shipping_address
    }
    return acc
  }, {} as Record<string, Order & { items: Order[] }>)

  const filteredGroups = Object.values(groupedOrders).filter(
    (group) => filterStatus === 'All' || group.status === filterStatus
  )

  const statuses: (OrderStatus | 'All')[] = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">إدارة الطلبات</h1>
        <p className="text-white/30 text-sm mt-1">{filteredGroups.length} طلب</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
              filterStatus === s
                ? 'bg-gold text-base shadow-[0_0_16px_rgba(201,169,110,0.15)]'
                : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]'
            }`}
          >
            {s === 'All' ? 'الكل' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass p-16 text-center">
          <span className="inline-block w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <div key={group.group_id || group.id} className="glass p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/[0.04]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/20 text-[10px] font-mono bg-white/[0.04] px-2 py-0.5 rounded-md">
                      #{(group.group_id || group.id).slice(0, 8)}
                    </span>
                    <span className="text-white/15 text-[10px]">
                      {new Date(group.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm">{group.profile?.full_name || group.full_name || 'بدون اسم'} · {group.profile?.phone_number || group.phone_number || '-'}</p>
                  <p className="text-white/20 text-xs mt-0.5">{group.profile?.shipping_address || group.shipping_address || '-'}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <select
                    value={group.status}
                    onChange={(e) => handleStatusChange(group.group_id || group.id, e.target.value as OrderStatus)}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-gold/40 transition-all cursor-pointer appearance-none"
                  >
                    {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                      <option key={s} value={s} className="bg-[#111] text-white">{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <span className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border whitespace-nowrap ${STATUS_COLORS[group.status]}`}>
                    {STATUS_LABELS[group.status]}
                  </span>
                  <span className="text-gold font-bold text-sm whitespace-nowrap">{group.items.reduce((sum, i) => sum + i.total_price, 0)} LE</span>
                </div>
              </div>

              {/* عناصر الأوردر */}
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img src={item.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/[0.06]" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                        </div>
                      )}
                      <div>
                        <p className="text-white/70 text-sm">{item.product?.title || 'منتج محذوف'}</p>
                        <p className="text-white/30 text-[11px] mt-0.5">
                          الكمية: {item.quantity}
                          {item.size && <span className="mr-2 text-gold/60">· المقاس: {item.size}</span>}
                        </p>
                      </div>
                    </div>
                    <span className="text-gold/80 text-xs font-medium whitespace-nowrap">{item.total_price} LE</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-16 text-center">
          <p className="text-white/30 text-sm">لا توجد طلبات{filterStatus !== 'All' ? ` بهذه الحالة` : ''}</p>
        </div>
      )}
    </div>
  )
}