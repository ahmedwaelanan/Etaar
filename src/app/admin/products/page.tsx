'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, CATEGORIES, CATEGORY_LABELS } from '@/types'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<Product['category']>('Modern')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isSoldOut, setIsSoldOut] = useState(false)
  const [stock, setStock] = useState('0')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [sizeInput, setSizeInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  const resetForm = () => {
    setTitle(''); setDescription(''); setPrice(''); setCategory('Modern')
    setIsFeatured(false); setIsSoldOut(false); setStock('0')
    setExistingImages([]); setSizes([]); setSizeInput('')
    setEditingId(null); setShowForm(false)
  }

  const openEdit = (product: Product) => {
    setTitle(product.title)
    setDescription(product.description || '')
    setPrice(String(product.price))
    setCategory(product.category)
    setIsFeatured(product.is_featured)
    setIsSoldOut(product.is_sold_out)
    setStock(String(product.stock || 0))
    setExistingImages(product.images || [])
    setSizes(product.sizes || [])
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleAddSize = () => {
    const val = sizeInput.trim()
    if (val && !sizes.includes(val)) {
      setSizes([...sizes, val])
      setSizeInput('')
    }
  }

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes(sizes.filter(s => s !== sizeToRemove))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const urls: string[] = [...existingImages]
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('products').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setExistingImages(urls)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!title.trim() || !price.trim()) {
      toast.error('يرجى ملء الحقول المطلوبة')
      return
    }
    setSaving(true)
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      category,
      is_featured: isFeatured,
      is_sold_out: isSoldOut,
      stock: parseInt(stock) || 0,
      images: existingImages,
      sizes,
    }
    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId)
      if (error) toast.error('حدث خطأ أثناء التحديث')
      else toast.success('تم تحديث المنتج')
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) toast.error('حدث خطأ أثناء الإضافة')
      else toast.success('تم إضافة المنتج')
    }
    setSaving(false)
    resetForm()
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error('حدث خطأ أثناء الحذف')
    else toast.success('تم حذف المنتج')
    setDeletingId(null)
    fetchProducts()
  }

  const toggleFeatured = async (product: Product) => {
    const { error } = await supabase.from('products').update({ is_featured: !product.is_featured }).eq('id', product.id)
    if (!error) fetchProducts()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة المنتجات</h1>
          <p className="text-white/30 text-sm mt-1">{products.length} منتج</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-gold text-sm !py-2.5">
          <span className="inline-flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            إضافة منتج
          </span>
        </button>
      </div>

      {showForm && (
        <div className="glass p-6 space-y-5 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">{editingId ? 'تعديل المنتج' : 'منتج جديد'}</h2>
            <button onClick={resetForm} className="text-white/30 hover:text-white/60 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="text-white/40 text-xs mb-1.5 block">عنوان المنتج *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-dark" placeholder="اسم المنتج" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-white/40 text-xs mb-1.5 block">الوصف</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-dark min-h-[100px] resize-none" placeholder="وصف المنتج..." />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">السعر (LE) *</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input-dark" placeholder="0.00" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">التصنيف</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Product['category'])} className="input-dark appearance-none cursor-pointer">
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#111] text-white">{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-white/40 text-xs mb-1.5 block">المقاسات المتاحة</label>
              <div className="flex gap-2">
                <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())} className="input-dark flex-1" placeholder="مثال: 30x40 أو Large" />
                <button type="button" onClick={handleAddSize} className="btn-ghost text-xs !py-3 px-4">إضافة</button>
              </div>
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {sizes.map((size) => (
                    <span key={size} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-gold text-xs">
                      {size}
                      <button type="button" onClick={() => handleRemoveSize(size)} className="hover:text-red-400 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ===== الستوك و حالة البيع ===== */}
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">الكمية المتاحة (الستوك)</label>
              <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="input-dark" placeholder="0" />
            </div>
            <div className="flex flex-col justify-end gap-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isFeatured ? 'bg-gold' : 'bg-white/10'}`} onClick={() => setIsFeatured(!isFeatured)}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${isFeatured ? 'left-0.5' : 'left-[22px]'}`} />
                </div>
                <span className="text-white/60 text-sm">منتج مميز</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isSoldOut ? 'bg-red-500' : 'bg-white/10'}`} onClick={() => setIsSoldOut(!isSoldOut)}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${isSoldOut ? 'left-0.5' : 'left-[22px]'}`} />
                </div>
                <span className="text-white/60 text-sm">Sold Out (غير متوفر)</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="text-white/40 text-xs mb-1.5 block">صور المنتج</label>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="btn-ghost text-xs !py-2.5 inline-flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14" /></svg>
                رفع صور
              </button>
              {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {existingImages.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/[0.08] group">
                      <Image src={url} alt="" fill className="object-cover" />
                      <button onClick={() => removeImage(i)} className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-gold text-sm disabled:opacity-40">
              {saving ? <span className="inline-block w-4 h-4 border-2 border-base/30 border-t-base rounded-full animate-spin" /> : editingId ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </button>
            <button onClick={resetForm} className="btn-ghost text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="glass p-16 text-center">
          <span className="inline-block w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="glass p-4 glass-hover">
              <div className="flex items-center gap-4">
                {product.images && product.images.length > 0 ? (
                  <Image src={product.images[0]} alt="" width={56} height={56} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">{product.title}</p>
                    {product.is_featured && (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-md bg-gold/20 text-gold text-[10px] font-bold">مميز</span>
                    )}
                    {(product.is_sold_out || (product.stock ?? 0) <= 0) && (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 text-[10px] font-bold border border-red-500/20">Sold Out</span>
                    )}
                  </div>
                  <p className="text-white/30 text-xs mt-0.5">
                    {CATEGORY_LABELS[product.category]} · {product.images?.length || 0} صور
                    {product.sizes && product.sizes.length > 0 ? ` · ${product.sizes.length} مقاسات` : ''}
                  </p>
                  <p className="text-white/20 text-[11px] mt-0.5">الستوك: {product.stock ?? 0}</p>
                </div>
                <span className="text-gold font-bold text-sm whitespace-nowrap">{product.price} LE</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleFeatured(product)} className={`p-2 rounded-lg transition-all duration-200 ${product.is_featured ? 'text-gold bg-gold/10' : 'text-white/20 hover:text-white/50'}`} title="تبديل التمييز">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={product.is_featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  </button>
                  <button onClick={() => openEdit(product)} className="p-2 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id} className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/[0.06] transition-all duration-200 disabled:opacity-30">
                    {deletingId === product.id ? (
                      <span className="inline-block w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-16 text-center"><p className="text-white/30 text-sm">لا توجد منتجات بعد</p></div>
      )}
    </div>
  )
}