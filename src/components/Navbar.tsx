'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import NotificationBell from './NotificationBell'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

function CartBadge() {
  const { totalItems } = useCart()
  if (totalItems === 0) return null
  return (
    <span style={{
      position: 'absolute', top: -4, right: -4,
      width: 18, height: 18, borderRadius: '50%',
      background: '#D94F4F', color: 'white',
      fontSize: 10, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {totalItems}
    </span>
  )
}

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      backdropFilter: 'blur(20px)',
      background: 'rgba(10,10,8,.85)',
      borderBottom: '1px solid rgba(42,42,37,.5)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #C9A84C, #A88A3A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fas fa-vector-square" style={{ fontSize: 13, color: '#0A0A08' }}></i>
            </div>
            <span style={{ fontFamily: 'Amiri, serif', fontSize: 20, fontWeight: 700, color: '#C9A84C' }}>
              إطار
            </span>
          </Link>

          <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 2 }}>
            <Link href="/" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#7A7468', textDecoration: 'none', fontFamily: 'Tajawal, sans-serif', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F2EDE4'; e.currentTarget.style.background = '#1A1A16' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7A7468'; e.currentTarget.style.background = 'transparent' }}
            >
              الرئيسية
            </Link>
            <Link href="/shop" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#7A7468', textDecoration: 'none', fontFamily: 'Tajawal, sans-serif', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F2EDE4'; e.currentTarget.style.background = '#1A1A16' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7A7468'; e.currentTarget.style.background = 'transparent' }}
            >
              المعرض
            </Link>
            {user && profile?.is_admin && (
              <Link href="/admin" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'rgba(201,168,76,0.7)', textDecoration: 'none', fontFamily: 'Tajawal, sans-serif', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.background = 'rgba(201,168,76,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(201,168,76,0.7)'; e.currentTarget.style.background = 'transparent' }}
              >
                لوحة التحكم
              </Link>
            )}
          </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-white/[0.04] transition-all duration-300" style={{ border: '1px solid rgba(42,42,37,0.5)', background: 'rgba(26,26,22,0.5)' }}>
              <i className="fas fa-shopping-cart" style={{ fontSize: 14, color: '#7A7468' }}></i>
              <CartBadge />
            </Link>
            <NotificationBell />
            {user ? (
              <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 8 }}>
                <Link
                  href="/profile"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, textDecoration: 'none', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1A1A16' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(201,168,76,0.08)', border: '1px solid #2A2A25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#C9A84C', fontSize: 10, fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}>
                        {profile?.full_name?.charAt(0) || 'م'}
                      </span>
                    </div>
                  )}
                  <span style={{ color: '#7A7468', fontSize: 12, fontFamily: 'Tajawal, sans-serif', fontWeight: 500 }}>{profile?.full_name || 'حسابي'}</span>
                </Link>
                <button
                  onClick={signOut}
                  style={{ padding: '6px 12px', fontSize: 12, color: '#7A7468', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontWeight: 500, transition: 'color .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#D94F4F' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#7A7468' }}
                >
                  خروج
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 8 }}>
                <Link href="/auth/login" style={{
                  background: 'transparent', color: '#C9A84C',
                  border: '1px solid rgba(201,168,76,0.25)', borderRadius: 8,
                  padding: '6px 16px', fontSize: 12, fontWeight: 600,
                  fontFamily: 'Tajawal, sans-serif', cursor: 'pointer', textDecoration: 'none', transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor = '#C9A84C' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)' }}
                >
                  دخول
                </Link>
                <Link href="/auth/signup" style={{
                  background: 'linear-gradient(135deg, #C9A84C, #A88A3A)',
                  color: '#0A0A08', fontWeight: 700, border: 'none',
                  borderRadius: 8, padding: '6px 16px', fontSize: 12,
                  fontFamily: 'Tajawal, sans-serif', cursor: 'pointer', textDecoration: 'none', transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  حساب جديد
                </Link>
              </div>
            )}
                       <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden flex items-center justify-center"
              style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #2A2A25', background: 'transparent', color: '#7A7468', cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F2EDE4'; e.currentTarget.style.background = '#1A1A16' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7A7468'; e.currentTarget.style.background = 'transparent' }}
            >
              <i className="fas" style={{ fontSize: 14 }}>
                {mobileOpen ? '\uf00d' : '\uf0c9'}
              </i>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="sm:hidden" style={{ borderTop: '1px solid #2A2A25', background: 'rgba(10,10,8,.95)', backdropFilter: 'blur(20px)' }}>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#7A7468', textDecoration: 'none', fontFamily: 'Tajawal, sans-serif', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F2EDE4'; e.currentTarget.style.background = '#1A1A16' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#7A7468'; e.currentTarget.style.background = 'transparent' }}
              >الرئيسية</Link>
              <Link href="/shop" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#7A7468', textDecoration: 'none', fontFamily: 'Tajawal, sans-serif', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F2EDE4'; e.currentTarget.style.background = '#1A1A16' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#7A7468'; e.currentTarget.style.background = 'transparent' }}
              >المعرض</Link>
              {user && profile?.is_admin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'rgba(201,168,76,0.7)', textDecoration: 'none', fontFamily: 'Tajawal, sans-serif', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.background = 'rgba(201,168,76,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(201,168,76,0.7)'; e.currentTarget.style.background = 'transparent' }}
                >لوحة التحكم</Link>
              )}
            </div>
            <div style={{ borderTop: '1px solid #2A2A25', paddingTop: 8, marginTop: 8 }}>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#7A7468', textDecoration: 'none', fontFamily: 'Tajawal, sans-serif' }}>حسابي</Link>
                  <button onClick={() => { signOut(); setMobileOpen(false) }} style={{ width: '100%', textAlign: 'right', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#D94F4F', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>تسجيل الخروج</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#7A7468', textDecoration: 'none', fontFamily: 'Tajawal, sans-serif' }}>تسجيل الدخول</Link>
                  <Link href="/auth/signup" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#C9A84C', textDecoration: 'none', fontFamily: 'Tajawal, sans-serif' }}>إنشاء حساب</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}