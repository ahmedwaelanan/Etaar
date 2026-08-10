'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Product,
  CATEGORIES,
  CATEGORY_LABELS,
} from '@/types'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ProductSize {
  name: string
  price: number
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  const [category, setCategory] =
    useState<Product['category']>('Modern')

  const [isFeatured, setIsFeatured] = useState(false)
  const [isSoldOut, setIsSoldOut] = useState(false)
  const [stock, setStock] = useState('0')

  const [existingImages, setExistingImages] =
    useState<string[]>([])

  const [sizes, setSizes] =
    useState<ProductSize[]>([])

  const [sizeName, setSizeName] = useState('')
  const [sizePrice, setSizePrice] = useState('')

  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  /*
  ======================================================
  HELPERS
  ======================================================
  */

  const normalizeSize = (size: unknown): ProductSize | null => {
    if (!size || typeof size !== 'object') {
      return null
    }

    const raw = size as {
      name?: unknown
      price?: unknown
    }

    const name = String(raw.name ?? '').trim()

    const numericPrice =
      typeof raw.price === 'number'
        ? raw.price
        : parseFloat(String(raw.price ?? ''))

    if (!name || !Number.isFinite(numericPrice)) {
      return null
    }

    return {
      name,
      price: numericPrice,
    }
  }

  const normalizeSizes = (rawSizes: unknown): ProductSize[] => {
    if (!Array.isArray(rawSizes)) {
      return []
    }

    return rawSizes
      .map(normalizeSize)
      .filter(
        (size): size is ProductSize =>
          size !== null
      )
  }

  const getSafePrice = (value: unknown): number => {
    const numeric =
      typeof value === 'number'
        ? value
        : parseFloat(String(value ?? ''))

    return Number.isFinite(numeric)
      ? numeric
      : 0
  }

  /*
  ======================================================
  FETCH PRODUCTS
  ======================================================
  */

  const fetchProducts = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      toast.error('حدث خطأ أثناء تحميل المنتجات')
      setProducts([])
    } else if (data) {
      setProducts(data as Product[])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  /*
  ======================================================
  RESET FORM
  ======================================================
  */

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPrice('')
    setCategory('Modern')

    setIsFeatured(false)
    setIsSoldOut(false)
    setStock('0')

    setExistingImages([])
    setSizes([])

    setSizeName('')
    setSizePrice('')

    setEditingId(null)
    setShowForm(false)

    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  /*
  ======================================================
  OPEN EDIT
  ======================================================
  */

  const openEdit = (product: Product) => {
    setTitle(product.title || '')
    setDescription(product.description || '')

    setPrice(
      product.price !== undefined &&
        product.price !== null
        ? String(product.price)
        : ''
    )

    setCategory(product.category)

    setIsFeatured(
      Boolean(product.is_featured)
    )

    setIsSoldOut(
      Boolean(product.is_sold_out)
    )

    setStock(
      String(product.stock ?? 0)
    )

    setExistingImages(
      Array.isArray(product.images)
        ? product.images
        : []
    )

    /*
     * مهم جداً:
     * تنظيف المقاسات القديمة التي قد تحتوي
     * على price = undefined
     */
    setSizes(
      normalizeSizes(product.sizes)
    )

    setSizeName('')
    setSizePrice('')

    setEditingId(product.id)
    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  /*
  ======================================================
  ADD SIZE
  ======================================================
  */

  const handleAddSize = () => {
    const name = sizeName.trim()
    const parsedPrice = parseFloat(
      sizePrice
    )

    if (!name) {
      toast.error('يرجى إدخال اسم المقاس')
      return
    }

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0
    ) {
      toast.error('يرجى إدخال سعر صحيح للمقاس')
      return
    }

    const duplicate = sizes.some(
      (size) =>
        size.name.toLowerCase() ===
        name.toLowerCase()
    )

    if (duplicate) {
      toast.error('هذا المقاس موجود بالفعل')
      return
    }

    setSizes((prev) => [
      ...prev,
      {
        name,
        price: parsedPrice,
      },
    ])

    setSizeName('')
    setSizePrice('')
  }

  /*
  ======================================================
  REMOVE SIZE
  ======================================================
  */

  const handleRemoveSize = (
    nameToRemove: string
  ) => {
    setSizes((prev) =>
      prev.filter(
        (size) =>
          size.name !== nameToRemove
      )
    )
  }

  /*
  ======================================================
  IMAGE UPLOAD
  ======================================================
  */

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files

    if (
      !files ||
      files.length === 0
    ) {
      return
    }

    const urls: string[] = [
      ...existingImages,
    ]

    for (const file of Array.from(files)) {
      try {
        const extension =
          file.name
            .split('.')
            .pop()
            ?.toLowerCase() || 'jpg'

        const path = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${extension}`

        const {
          error,
        } = await supabase.storage
          .from('products')
          .upload(path, file)

        if (error) {
          toast.error(
            `فشل رفع الصورة: ${file.name}`
          )
          continue
        }

        const {
          data,
        } = supabase.storage
          .from('products')
          .getPublicUrl(path)

        if (data?.publicUrl) {
          urls.push(data.publicUrl)
        }
      } catch {
        toast.error(
          `حدث خطأ أثناء رفع الصورة: ${file.name}`
        )
      }
    }

    setExistingImages(urls)

    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  /*
  ======================================================
  REMOVE IMAGE
  ======================================================
  */

  const removeImage = (
    index: number
  ) => {
    setExistingImages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    )
  }

  /*
  ======================================================
  SAVE PRODUCT
  ======================================================
  */

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error(
        'يرجى ملء عنوان المنتج'
      )
      return
    }

    /*
     * تنظيف المقاسات قبل الحفظ
     */
    const cleanSizes =
      normalizeSizes(sizes)

    /*
     * لو مفيش مقاسات:
     * السعر الأساسي لازم يكون موجود
     */
    if (
      cleanSizes.length === 0 &&
      !price.trim()
    ) {
      toast.error(
        'يرجى إدخال السعر الأساسي أو إضافة مقاس واحد على الأقل'
      )
      return
    }

    /*
     * التأكد من أن السعر الأساسي صحيح
     */
    let finalPrice = 0

    if (price.trim()) {
      finalPrice = parseFloat(price)

      if (
        !Number.isFinite(finalPrice) ||
        finalPrice <= 0
      ) {
        toast.error(
          'يرجى إدخال سعر أساسي صحيح'
        )
        return
      }
    } else if (
      cleanSizes.length > 0
    ) {
      finalPrice = Math.min(
        ...cleanSizes.map(
          (size) => size.price
        )
      )
    }

    if (
      !Number.isFinite(finalPrice) ||
      finalPrice <= 0
    ) {
      toast.error(
        'تعذر تحديد سعر المنتج'
      )
      return
    }

    setSaving(true)

    const payload = {
      title: title.trim(),

      description:
        description.trim() || null,

      price: finalPrice,

      category,

      is_featured:
        isFeatured,

      is_sold_out:
        isSoldOut,

      stock:
        Math.max(
          0,
          parseInt(stock) || 0
        ),

      images:
        existingImages,

      sizes:
        cleanSizes,
    }

    try {
      if (editingId) {
        const {
          error,
        } = await supabase
          .from('products')
          .update(payload)
          .eq(
            'id',
            editingId
          )

        if (error) {
          console.error(
            'Update product error:',
            error
          )

          toast.error(
            error.message ||
              'حدث خطأ أثناء تحديث المنتج'
          )

          return
        }

        toast.success(
          'تم تحديث المنتج بنجاح'
        )
      } else {
        const {
          error,
        } = await supabase
          .from('products')
          .insert(payload)

        if (error) {
          console.error(
            'Insert product error:',
            error
          )

          toast.error(
            error.message ||
              'حدث خطأ أثناء إضافة المنتج'
          )

          return
        }

        toast.success(
          'تم إضافة المنتج بنجاح'
        )
      }

      resetForm()
      await fetchProducts()
    } catch (error) {
      console.error(
        'Save product error:',
        error
      )

      toast.error(
        'حدث خطأ غير متوقع'
      )
    } finally {
      setSaving(false)
    }
  }

  /*
  ======================================================
  DELETE PRODUCT
  ======================================================
  */

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        'هل أنت متأكد من حذف هذا المنتج؟'
      )

    if (!confirmed) {
      return
    }

    setDeletingId(id)

    try {
      const {
        error,
      } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error(
          error.message ||
            'حدث خطأ أثناء حذف المنتج'
        )
        return
      }

      toast.success(
        'تم حذف المنتج'
      )

      await fetchProducts()
    } catch {
      toast.error(
        'حدث خطأ غير متوقع'
      )
    } finally {
      setDeletingId(null)
    }
  }

  /*
  ======================================================
  TOGGLE FEATURED
  ======================================================
  */

  const toggleFeatured = async (
    product: Product
  ) => {
    const {
      error,
    } = await supabase
      .from('products')
      .update({
        is_featured:
          !product.is_featured,
      })
      .eq(
        'id',
        product.id
      )

    if (error) {
      toast.error(
        'حدث خطأ أثناء تحديث المنتج'
      )
      return
    }

    await fetchProducts()
  }

  /*
  ======================================================
  RENDER
  ======================================================
  */

  return (
    <div
      dir="rtl"
      className="space-y-6"
      style={{
        color: '#292A28',
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-3
              mb-2
            "
          >
            <span
              className="
                w-8
                h-px
                bg-[#B49A68]
              "
            />

            <h1
              className="
                text-xl
                sm:text-2xl
                font-semibold
              "
            >
              إدارة المنتجات
            </h1>
          </div>

          <p
            className="
              text-xs
              sm:text-sm
            "
            style={{
              color: '#9A9288',
            }}
          >
            {products.length} منتج
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm()
            setShowForm(true)

            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            })
          }}
          className="
            w-full
            sm:w-auto
            inline-flex
            items-center
            justify-center
            gap-2
            px-5
            py-3
            text-sm
            font-semibold
            transition-all
            duration-300
            hover:-translate-y-0.5
          "
          style={{
            background: '#292A28',
            color: '#F5F2ED',
            border:
              '1px solid #292A28',
            boxShadow:
              '0 10px 25px rgba(41,42,40,.08)',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          إضافة منتج
        </button>
      </div>

      {/* =================================================
          PRODUCT FORM
      ================================================= */}

      {showForm && (
        <div
          className="
            p-4
            sm:p-6
            space-y-6
            animate-slide-up
          "
          style={{
            background:
              'rgba(255,255,255,.55)',
            border:
              '1px solid rgba(41,42,40,.08)',
            boxShadow:
              '0 18px 45px rgba(41,42,40,.045)',
          }}
        >
          {/* FORM HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              pb-4
              border-b
            "
            style={{
              borderColor:
                'rgba(41,42,40,.07)',
            }}
          >
            <div>
              <h2
                className="
                  text-sm
                  sm:text-base
                  font-semibold
                "
              >
                {editingId
                  ? 'تعديل المنتج'
                  : 'منتج جديد'}
              </h2>

              <p
                className="
                  text-[10px]
                  sm:text-xs
                  mt-1
                "
                style={{
                  color: '#AAA198',
                }}
              >
                أضف تفاصيل المنتج والصور
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="
                w-9
                h-9
                flex
                items-center
                justify-center
                transition-all
              "
              style={{
                color: '#9A9288',
                background:
                  'rgba(41,42,40,.04)',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 18L18 6" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* FORM GRID */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-5
            "
          >
            {/* TITLE */}

            <div className="sm:col-span-2">
              <label
                className="
                  text-[10px]
                  mb-2
                  block
                  uppercase
                  tracking-[0.1em]
                "
                style={{
                  color: '#8B837A',
                }}
              >
                عنوان المنتج *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                className="
                  w-full
                  px-4
                  py-3
                  outline-none
                  text-sm
                  transition-all
                "
                style={{
                  background:
                    'rgba(245,242,237,.72)',
                  border:
                    '1px solid rgba(41,42,40,.10)',
                  color: '#292A28',
                }}
                placeholder="اسم المنتج"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="sm:col-span-2">
              <label
                className="
                  text-[10px]
                  mb-2
                  block
                  uppercase
                  tracking-[0.1em]
                "
                style={{
                  color: '#8B837A',
                }}
              >
                الوصف
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                className="
                  w-full
                  min-h-[110px]
                  px-4
                  py-3
                  outline-none
                  resize-none
                  text-sm
                  leading-[1.7]
                "
                style={{
                  background:
                    'rgba(245,242,237,.72)',
                  border:
                    '1px solid rgba(41,42,40,.10)',
                  color: '#292A28',
                }}
                placeholder="وصف المنتج..."
              />
            </div>

            {/* PRICE */}

            <div>
              <label
                className="
                  text-[10px]
                  mb-2
                  block
                  uppercase
                  tracking-[0.1em]
                "
                style={{
                  color: '#8B837A',
                }}
              >
                السعر الأساسي
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                className="
                  w-full
                  px-4
                  py-3
                  outline-none
                  text-sm
                "
                style={{
                  background:
                    'rgba(245,242,237,.72)',
                  border:
                    '1px solid rgba(41,42,40,.10)',
                  color: '#292A28',
                }}
                placeholder="0.00"
              />

              <p
                className="
                  text-[9px]
                  mt-1.5
                "
                style={{
                  color: '#AAA198',
                }}
              >
                يستخدم إذا لم توجد مقاسات
              </p>
            </div>

            {/* CATEGORY */}

            <div>
              <label
                className="
                  text-[10px]
                  mb-2
                  block
                  uppercase
                  tracking-[0.1em]
                "
                style={{
                  color: '#8B837A',
                }}
              >
                التصنيف
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value as Product['category']
                  )
                }
                className="
                  w-full
                  px-4
                  py-3
                  outline-none
                  text-sm
                  cursor-pointer
                "
                style={{
                  background:
                    '#F5F2ED',
                  border:
                    '1px solid rgba(41,42,40,.10)',
                  color: '#292A28',
                }}
              >
                {CATEGORIES.map(
                  (cat) => (
                    <option
                      key={cat}
                      value={cat}
                    >
                      {
                        CATEGORY_LABELS[
                          cat
                        ]
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* SIZES */}

            <div className="sm:col-span-2">
              <label
                className="
                  text-[10px]
                  mb-2
                  block
                  uppercase
                  tracking-[0.1em]
                "
                style={{
                  color: '#8B837A',
                }}
              >
                المقاسات والأسعار
                <span
                  className="mr-2"
                  style={{
                    color: '#B49A68',
                  }}
                >
                  * مقاس واحد على الأقل
                </span>
              </label>

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  gap-2
                "
              >
                <input
                  type="text"
                  value={sizeName}
                  onChange={(e) =>
                    setSizeName(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter'
                    ) {
                      e.preventDefault()
                      handleAddSize()
                    }
                  }}
                  className="
                    flex-1
                    px-4
                    py-3
                    outline-none
                    text-sm
                  "
                  style={{
                    background:
                      'rgba(245,242,237,.72)',
                    border:
                      '1px solid rgba(41,42,40,.10)',
                    color: '#292A28',
                  }}
                  placeholder="اسم المقاس — مثال 30×40"
                />

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sizePrice}
                  onChange={(e) =>
                    setSizePrice(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter'
                    ) {
                      e.preventDefault()
                      handleAddSize()
                    }
                  }}
                  className="
                    w-full
                    sm:w-32
                    px-4
                    py-3
                    outline-none
                    text-sm
                  "
                  style={{
                    background:
                      'rgba(245,242,237,.72)',
                    border:
                      '1px solid rgba(41,42,40,.10)',
                    color: '#292A28',
                  }}
                  placeholder="السعر"
                />

                <button
                  type="button"
                  onClick={
                    handleAddSize
                  }
                  className="
                    w-full
                    sm:w-auto
                    px-5
                    py-3
                    text-xs
                    font-semibold
                  "
                  style={{
                    background:
                      'rgba(180,154,104,.10)',
                    border:
                      '1px solid rgba(180,154,104,.22)',
                    color: '#A88C58',
                  }}
                >
                  إضافة
                </button>
              </div>

              {/* SIZES LIST */}

              {sizes.length > 0 && (
                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                    mt-4
                  "
                >
                  {sizes.map(
                    (size) => (
                      <span
                        key={size.name}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          px-3
                          py-2
                          text-xs
                        "
                        style={{
                          background:
                            'rgba(180,154,104,.09)',
                          border:
                            '1px solid rgba(180,154,104,.20)',
                          color: '#8F7547',
                        }}
                      >
                        <span>
                          {size.name}
                        </span>

                        <span
                          style={{
                            color:
                              '#A88C58',
                          }}
                        >
                          {getSafePrice(
                            size.price
                          ).toFixed(2)}{' '}
                          SAR
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveSize(
                              size.name
                            )
                          }
                          className="
                            transition-colors
                            hover:text-red-500
                          "
                          style={{
                            color:
                              '#AAA198',
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M6 18L18 6" />
                            <path d="M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )
                  )}
                </div>
              )}
            </div>

            {/* STOCK */}

            <div>
              <label
                className="
                  text-[10px]
                  mb-2
                  block
                  uppercase
                  tracking-[0.1em]
                "
                style={{
                  color: '#8B837A',
                }}
              >
                الكمية المتاحة
              </label>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) =>
                  setStock(
                    e.target.value
                  )
                }
                className="
                  w-full
                  px-4
                  py-3
                  outline-none
                  text-sm
                "
                style={{
                  background:
                    'rgba(245,242,237,.72)',
                  border:
                    '1px solid rgba(41,42,40,.10)',
                  color: '#292A28',
                }}
                placeholder="0"
              />
            </div>

            {/* TOGGLES */}

            <div
              className="
                flex
                flex-col
                justify-end
                gap-4
              "
            >
              {/* FEATURED */}

              <button
                type="button"
                onClick={() =>
                  setIsFeatured(
                    !isFeatured
                  )
                }
                className="
                  flex
                  items-center
                  gap-3
                  text-right
                "
              >
                <div
                  className="
                    relative
                    w-11
                    h-6
                    rounded-full
                    transition-colors
                  "
                  style={{
                    background:
                      isFeatured
                        ? '#B49A68'
                        : 'rgba(41,42,40,.10)',
                  }}
                >
                  <div
                    className="
                      absolute
                      top-0.5
                      w-5
                      h-5
                      rounded-full
                      bg-white
                      shadow
                      transition-transform
                    "
                    style={{
                      left:
                        isFeatured
                          ? '22px'
                          : '2px',
                    }}
                  />
                </div>

                <span
                  className="
                    text-xs
                  "
                  style={{
                    color:
                      '#6F6962',
                  }}
                >
                  منتج مميز
                </span>
              </button>

              {/* SOLD OUT */}

              <button
                type="button"
                onClick={() =>
                  setIsSoldOut(
                    !isSoldOut
                  )
                }
                className="
                  flex
                  items-center
                  gap-3
                  text-right
                "
              >
                <div
                  className="
                    relative
                    w-11
                    h-6
                    rounded-full
                    transition-colors
                  "
                  style={{
                    background:
                      isSoldOut
                        ? '#B45C5C'
                        : 'rgba(41,42,40,.10)',
                  }}
                >
                  <div
                    className="
                      absolute
                      top-0.5
                      w-5
                      h-5
                      rounded-full
                      bg-white
                      shadow
                      transition-transform
                    "
                    style={{
                      left:
                        isSoldOut
                          ? '22px'
                          : '2px',
                    }}
                  />
                </div>

                <span
                  className="
                    text-xs
                  "
                  style={{
                    color:
                      '#6F6962',
                  }}
                >
                  Sold Out
                </span>
              </button>
            </div>

            {/* IMAGES */}

            <div className="sm:col-span-2">
              <label
                className="
                  text-[10px]
                  mb-2
                  block
                  uppercase
                  tracking-[0.1em]
                "
                style={{
                  color: '#8B837A',
                }}
              >
                صور المنتج
              </label>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImageUpload
                }
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileRef.current?.click()
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  text-xs
                  font-medium
                "
                style={{
                  background:
                    'rgba(41,42,40,.04)',
                  border:
                    '1px solid rgba(41,42,40,.09)',
                  color: '#6F6962',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>

                رفع صور
              </button>

              {existingImages.length >
                0 && (
                <div
                  className="
                    grid
                    grid-cols-3
                    sm:grid-cols-5
                    md:grid-cols-6
                    gap-3
                    mt-4
                  "
                >
                  {existingImages.map(
                    (url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="
                          relative
                          aspect-square
                          overflow-hidden
                          group
                        "
                        style={{
                          border:
                            '1px solid rgba(41,42,40,.09)',
                        }}
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          sizes="120px"
                          className="object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              index
                            )
                          }
                          className="
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                            opacity-0
                            group-hover:opacity-100
                            transition-opacity
                          "
                          style={{
                            background:
                              'rgba(160,65,65,.72)',
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <path d="M6 18L18 6" />
                            <path d="M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* FORM ACTIONS */}

          <div
            className="
              flex
              flex-col-reverse
              sm:flex-row
              gap-3
              pt-2
              border-t
            "
            style={{
              borderColor:
                'rgba(41,42,40,.07)',
            }}
          >
            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={saving}
              className="
                w-full
                sm:w-auto
                min-w-[150px]
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                text-sm
                font-semibold
                disabled:opacity-40
              "
              style={{
                background:
                  '#292A28',
                color: '#F5F2ED',
              }}
            >
              {saving ? (
                <span
                  className="
                    inline-block
                    w-4
                    h-4
                    border-2
                    rounded-full
                    animate-spin
                  "
                  style={{
                    borderColor:
                      'rgba(245,242,237,.25)',
                    borderTopColor:
                      '#B49A68',
                  }}
                />
              ) : (
                <>
                  {editingId
                    ? 'حفظ التعديلات'
                    : 'إضافة المنتج'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={
                resetForm
              }
              className="
                w-full
                sm:w-auto
                px-5
                py-3
                text-sm
              "
              style={{
                background:
                  'rgba(41,42,40,.04)',
                border:
                  '1px solid rgba(41,42,40,.08)',
                color: '#6F6962',
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div
          className="
            p-16
            text-center
          "
          style={{
            background:
              'rgba(255,255,255,.45)',
            border:
              '1px solid rgba(41,42,40,.07)',
          }}
        >
          <span
            className="
              inline-block
              w-7
              h-7
              border-2
              rounded-full
              animate-spin
            "
            style={{
              borderColor:
                'rgba(180,154,104,.25)',
              borderTopColor:
                '#B49A68',
            }}
          />
        </div>
      ) : products.length > 0 ? (
        /*
        ==================================================
        PRODUCTS LIST
        ==================================================
        */

        <div className="space-y-3">
          {products.map(
            (product) => {
              const cleanSizes =
                normalizeSizes(
                  product.sizes
                )

              const hasSizes =
                cleanSizes.length >
                0

              const productPrice =
                getSafePrice(
                  product.price
                )

              const minPrice =
                hasSizes
                  ? Math.min(
                      ...cleanSizes.map(
                        (size) =>
                          getSafePrice(
                            size.price
                          )
                      )
                    )
                  : productPrice

              return (
                <div
                  key={product.id}
                  className="
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                  "
                  style={{
                    background:
                      'rgba(255,255,255,.48)',
                    border:
                      '1px solid rgba(41,42,40,.07)',
                    boxShadow:
                      '0 8px 25px rgba(41,42,40,.025)',
                  }}
                >
                  <div
                    className="
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      gap-4
                    "
                  >
                    {/* IMAGE */}

                    {product.images &&
                    product.images.length >
                      0 ? (
                      <Image
                        src={
                          product.images[0]
                        }
                        alt={
                          product.title
                        }
                        width={64}
                        height={64}
                        className="
                          w-16
                          h-16
                          object-cover
                          flex-shrink-0
                        "
                      />
                    ) : (
                      <div
                        className="
                          w-16
                          h-16
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                        "
                        style={{
                          background:
                            'rgba(41,42,40,.035)',
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          style={{
                            color:
                              'rgba(41,42,40,.18)',
                          }}
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                          />
                          <circle
                            cx="8.5"
                            cy="8.5"
                            r="1.5"
                          />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}

                    {/* INFO */}

                    <div
                      className="
                        flex-1
                        min-w-0
                      "
                    >
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >
                        <p
                          className="
                            text-sm
                            font-semibold
                            truncate
                            max-w-full
                          "
                          style={{
                            color:
                              '#292A28',
                          }}
                        >
                          {product.title}
                        </p>

                        {product.is_featured && (
                          <span
                            className="
                              flex-shrink-0
                              px-2
                              py-1
                              text-[9px]
                              font-semibold
                            "
                            style={{
                              background:
                                'rgba(180,154,104,.10)',
                              border:
                                '1px solid rgba(180,154,104,.18)',
                              color:
                                '#A88C58',
                            }}
                          >
                            مميز
                          </span>
                        )}

                        {(product.is_sold_out ||
                          (product.stock ??
                            0) <= 0) && (
                          <span
                            className="
                              flex-shrink-0
                              px-2
                              py-1
                              text-[9px]
                              font-semibold
                            "
                            style={{
                              background:
                                'rgba(180,80,80,.08)',
                              border:
                                '1px solid rgba(180,80,80,.15)',
                              color:
                                '#A85C5C',
                            }}
                          >
                            Sold Out
                          </span>
                        )}
                      </div>

                      <p
                        className="
                          text-[10px]
                          sm:text-xs
                          mt-1
                        "
                        style={{
                          color:
                            '#9A9288',
                        }}
                      >
                        {
                          CATEGORY_LABELS[
                            product.category
                          ]
                        }

                        {' · '}

                        {product.images
                          ?.length ||
                          0}{' '}
                        صور

                        {hasSizes &&
                          ` · ${cleanSizes.length} مقاس`}
                      </p>

                      <p
                        className="
                          text-[10px]
                          mt-1
                        "
                        style={{
                          color:
                            '#AAA198',
                        }}
                      >
                        الستوك:{' '}
                        {product.stock ??
                          0}
                      </p>
                    </div>

                    {/* PRICE */}

                    <div
                      className="
                        sm:text-left
                        text-right
                        whitespace-nowrap
                      "
                    >
                      <span
                        className="
                          text-sm
                          font-bold
                        "
                        style={{
                          color:
                            '#A88C58',
                        }}
                      >
                        {minPrice.toFixed(
                          2
                        )}{' '}
                        SAR
                      </span>

                      {hasSizes && (
                        <p
                          className="
                            text-[9px]
                            mt-0.5
                          "
                          style={{
                            color:
                              '#AAA198',
                          }}
                        >
                          Start from
                        </p>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div
                      className="
                        flex
                        items-center
                        gap-1
                        border-t
                        sm:border-t-0
                        pt-3
                        sm:pt-0
                      "
                      style={{
                        borderColor:
                          'rgba(41,42,40,.06)',
                      }}
                    >
                      {/* FEATURED */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleFeatured(
                            product
                          )
                        }
                        className="
                          p-2.5
                          transition-all
                        "
                        style={{
                          color:
                            product.is_featured
                              ? '#B49A68'
                              : '#AAA198',

                          background:
                            product.is_featured
                              ? 'rgba(180,154,104,.08)'
                              : 'transparent',
                        }}
                        title="تبديل التمييز"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={
                            product.is_featured
                              ? 'currentColor'
                              : 'none'
                          }
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            product
                          )
                        }
                        className="
                          p-2.5
                          transition-all
                        "
                        style={{
                          color:
                            '#AAA198',
                        }}
                        title="تعديل"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-3 1 1-3 9.5-10.5z" />
                        </svg>
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            product.id
                          )
                        }
                        disabled={
                          deletingId ===
                          product.id
                        }
                        className="
                          p-2.5
                          transition-all
                          disabled:opacity-30
                        "
                        style={{
                          color:
                            '#AAA198',
                        }}
                        title="حذف"
                      >
                        {deletingId ===
                        product.id ? (
                          <span
                            className="
                              inline-block
                              w-4
                              h-4
                              border-2
                              rounded-full
                              animate-spin
                            "
                            style={{
                              borderColor:
                                'rgba(168,92,92,.20)',
                              borderTopColor:
                                '#A85C5C',
                            }}
                          />
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                            <path d="M5 7h14" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
          )}
        </div>
      ) : (
        /*
        ==================================================
        EMPTY
        ==================================================
        */

        <div
          className="
            p-16
            text-center
          "
          style={{
            background:
              'rgba(255,255,255,.45)',
            border:
              '1px solid rgba(41,42,40,.07)',
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="mx-auto mb-3"
            style={{
              color:
                'rgba(41,42,40,.16)',
            }}
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
            />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>

          <p
            className="text-sm"
            style={{
              color: '#AAA198',
            }}
          >
            لا توجد منتجات بعد
          </p>
        </div>
      )}
    </div>
  )
}