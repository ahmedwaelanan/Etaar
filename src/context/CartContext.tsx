'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/types'
import toast from 'react-hot-toast'

export interface CartItem extends Product {
  quantity: number
  selected_size?: string
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addToCart: (product: Product, size?: string, qty?: number) => void // <-- أضفنا qty?
  removeFromCart: (id: string, size?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('etaar-cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        localStorage.removeItem('etaar-cart')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('etaar-cart', JSON.stringify(items))
  }, [items])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const addToCart = (product: Product, size?: string, qty: number = 1) => {
    setItems(prev => {
      // نبحث عن منتج بنفس الـ ID ونفس المقاس
      const existing = prev.find(item => item.id === product.id && item.selected_size === size)
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.selected_size === size 
            ? { ...item, quantity: item.quantity + qty } // <-- نزود بالكمية المختارة
            : item
        )
      }
      return [...prev, { ...product, quantity: qty, selected_size: size }] // <-- نحط الكمية المختارة
    })
    toast.success('تمت الإضافة للسلة')
  }

  const removeFromCart = (id: string, size?: string) => {
    setItems(prev => prev.filter(item => !(item.id === id && item.selected_size === size)))
  }

  const updateQuantity = (id: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, size)
      return
    }
    setItems(prev => prev.map(item => 
      item.id === id && item.selected_size === size 
        ? { ...item, quantity } 
        : item
    ))
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}