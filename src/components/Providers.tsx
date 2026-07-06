'use client'

import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'react-hot-toast'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgba(26,26,22,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(42,42,37,0.5)',
                color: '#F2EDE4',
                borderRadius: '12px',
              },
            }}
          />
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}