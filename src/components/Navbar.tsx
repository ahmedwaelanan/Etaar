'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import NotificationBell from './NotificationBell'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

function CartBadge() {
  const { totalItems } = useCart()

  if (totalItems === 0) return null

  return (
    <span
      style={{
        position: 'absolute',
        top: -4,
        right: -4,
        width: 17,
        height: 17,
        borderRadius: '50%',
        background: '#B49A68',
        color: '#242424',
        fontSize: 9,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #F5F2ED',
      }}
    >
      {totalItems}
    </span>
  )
}

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,

          background: 'rgba(245,242,237,0.90)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',

          borderBottom: '1px solid rgba(214,206,195,0.75)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 68,
            }}
          >

            {/* ================= LOGO ================= */}

            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                textDecoration: 'none',
              }}
            >

              {/* Logo Mark */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  border: '1px solid #B49A68',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#292A28',
                  background: 'rgba(255,255,255,0.28)',
                }}
              >
               <Image
    src="/logo/logonav.png"
    alt="Jidaar"
    width={220}
    height={90}
    priority
    style={{
      width: 105,
      height: 'auto',
      display: 'block',
      objectFit: 'contain',
    }}
  />
              </div>

              {/* Brand */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                    color: '#292A28',
                  }}
                >
                  JIDAAR
                </span>

                <span
                  style={{
                    marginTop: 5,
                    fontSize: 7,
                    letterSpacing: '0.16em',
                    color: '#A89063',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  DESIGNED WALLS
                </span>
              </div>

            </Link>


            {/* ================= DESKTOP NAV ================= */}

            <div
              className="hidden sm:flex"
              style={{
                alignItems: 'center',
                gap: 4,
              }}
            >

              <Link
                href="/"
                style={{
                  padding: '8px 14px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#292A28',
                  textDecoration: 'none',
                  fontFamily: 'Tajawal, sans-serif',
                  transition: 'all .2s',
                  borderBottom: '1px solid transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#A89063'
                  e.currentTarget.style.borderBottomColor = '#B49A68'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#292A28'
                  e.currentTarget.style.borderBottomColor =
                    'transparent'
                }}
              >
                الرئيسية
              </Link>


              <Link
                href="/shop"
                style={{
                  padding: '8px 14px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#292A28',
                  textDecoration: 'none',
                  fontFamily: 'Tajawal, sans-serif',
                  transition: 'all .2s',
                  borderBottom: '1px solid transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#A89063'
                  e.currentTarget.style.borderBottomColor = '#B49A68'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#292A28'
                  e.currentTarget.style.borderBottomColor =
                    'transparent'
                }}
              >
                المعرض
              </Link>


              {user && profile?.is_admin && (
                <Link
                  href="/admin"
                  style={{
                    padding: '8px 14px',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#A89063',
                    textDecoration: 'none',
                    fontFamily: 'Tajawal, sans-serif',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#292A28'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#A89063'
                  }}
                >
                  لوحة التحكم
                </Link>
              )}

            </div>


            {/* ================= RIGHT SIDE ================= */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >

              {/* Cart */}
              <Link
                href="/cart"
                className="relative"
                style={{
                  width: 38,
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  border: '1px solid #D6CEC3',
                  background: 'rgba(255,255,255,0.28)',

                  color: '#292A28',
                  textDecoration: 'none',

                  transition: 'all .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#B49A68'
                  e.currentTarget.style.background = '#EAE5DE'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#D6CEC3'
                  e.currentTarget.style.background =
                    'rgba(255,255,255,0.28)'
                }}
              >
                <i
                  className="fas fa-shopping-bag"
                  style={{
                    fontSize: 13,
                    color: '#292A28',
                  }}
                />

                <CartBadge />
              </Link>


              {/* Notifications */}
              <NotificationBell />


              {/* ================= USER ================= */}

              {user ? (
                <div
                  className="hidden sm:flex"
                  style={{
                    alignItems: 'center',
                    gap: 4,
                  }}
                >

                  <Link
                    href="/profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      textDecoration: 'none',
                      transition: 'all .2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background =
                        '#EAE5DE'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background =
                        'transparent'
                    }}
                  >

                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        style={{
                          width: 27,
                          height: 27,
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 27,
                          height: 27,
                          borderRadius: '50%',
                          background: '#EAE5DE',
                          border: '1px solid #D6CEC3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            color: '#A89063',
                            fontSize: 10,
                            fontWeight: 700,
                            fontFamily: 'Tajawal, sans-serif',
                          }}
                        >
                          {profile?.full_name?.charAt(0) || 'م'}
                        </span>
                      </div>
                    )}

                    <span
                      style={{
                        color: '#6F6A64',
                        fontSize: 12,
                        fontFamily: 'Tajawal, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      {profile?.full_name || 'حسابي'}
                    </span>

                  </Link>


                  <button
                    onClick={signOut}
                    style={{
                      padding: '6px 10px',
                      fontSize: 12,
                      color: '#6F6A64',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Tajawal, sans-serif',
                      fontWeight: 500,
                      transition: 'color .2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#9B5D57'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#6F6A64'
                    }}
                  >
                    خروج
                  </button>

                </div>

              ) : (

                <div
                  className="hidden sm:flex"
                  style={{
                    alignItems: 'center',
                    gap: 8,
                  }}
                >

                  {/* Login */}
                  <Link
                    href="/auth/login"
                    style={{
                      background: 'transparent',
                      color: '#292A28',

                      border: '1px solid #D6CEC3',

                      padding: '8px 17px',
                      fontSize: 12,
                      fontWeight: 600,

                      fontFamily: 'Tajawal, sans-serif',

                      cursor: 'pointer',
                      textDecoration: 'none',

                      transition: 'all .2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor =
                        '#B49A68'
                      e.currentTarget.style.color =
                        '#A89063'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor =
                        '#D6CEC3'
                      e.currentTarget.style.color =
                        '#292A28'
                    }}
                  >
                    دخول
                  </Link>


                  {/* Signup */}
                  <Link
                    href="/auth/signup"
                    style={{
                      background: '#292A28',
                      color: '#F5F2ED',

                      border: '1px solid #292A28',

                      padding: '8px 18px',
                      fontSize: 12,
                      fontWeight: 600,

                      fontFamily: 'Tajawal, sans-serif',

                      cursor: 'pointer',
                      textDecoration: 'none',

                      transition: 'all .25s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background =
                        '#B49A68'
                      e.currentTarget.style.borderColor =
                        '#B49A68'
                      e.currentTarget.style.color =
                        '#242424'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background =
                        '#292A28'
                      e.currentTarget.style.borderColor =
                        '#292A28'
                      e.currentTarget.style.color =
                        '#F5F2ED'
                    }}
                  >
                    حساب جديد
                  </Link>

                </div>
              )}


              {/* ================= MOBILE ================= */}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="sm:hidden flex items-center justify-center"
                style={{
                  width: 38,
                  height: 38,

                  border: '1px solid #D6CEC3',
                  background: 'transparent',

                  color: '#292A28',
                  cursor: 'pointer',

                  transition: 'all .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background =
                    '#EAE5DE'
                  e.currentTarget.style.borderColor =
                    '#B49A68'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background =
                    'transparent'
                  e.currentTarget.style.borderColor =
                    '#D6CEC3'
                }}
              >
                <i
                  className="fas"
                  style={{ fontSize: 14 }}
                >
                  {mobileOpen ? '\uf00d' : '\uf0c9'}
                </i>
              </button>

            </div>

          </div>
        </div>


        {/* ================= MOBILE MENU ================= */}

        {mobileOpen && (
          <div
            className="sm:hidden"
            style={{
              borderTop: '1px solid #D6CEC3',
              background: 'rgba(245,242,237,0.97)',
              backdropFilter: 'blur(18px)',
            }}
          >

            <div
              style={{
                padding: '14px 20px 18px',
              }}
            >

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >

                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '12px 10px',
                    fontSize: 14,
                    color: '#292A28',
                    textDecoration: 'none',
                    fontFamily: 'Tajawal, sans-serif',
                    borderBottom: '1px solid #E3DED6',
                  }}
                >
                  الرئيسية
                </Link>

                <Link
                  href="/shop"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '12px 10px',
                    fontSize: 14,
                    color: '#292A28',
                    textDecoration: 'none',
                    fontFamily: 'Tajawal, sans-serif',
                    borderBottom: '1px solid #E3DED6',
                  }}
                >
                  المعرض
                </Link>

                {user && profile?.is_admin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      padding: '12px 10px',
                      fontSize: 14,
                      color: '#A89063',
                      textDecoration: 'none',
                      fontFamily: 'Tajawal, sans-serif',
                      borderBottom:
                        '1px solid #E3DED6',
                    }}
                  >
                    لوحة التحكم
                  </Link>
                )}

              </div>


              <div
                style={{
                  borderTop: '1px solid #D6CEC3',
                  paddingTop: 10,
                  marginTop: 10,
                }}
              >

                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'block',
                        padding: '11px 10px',
                        fontSize: 14,
                        color: '#6F6A64',
                        textDecoration: 'none',
                        fontFamily: 'Tajawal, sans-serif',
                      }}
                    >
                      حسابي
                    </Link>

                    <button
                      onClick={() => {
                        signOut()
                        setMobileOpen(false)
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'right',
                        padding: '11px 10px',
                        fontSize: 14,
                        color: '#9B5D57',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'Tajawal, sans-serif',
                      }}
                    >
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'block',
                        padding: '11px 10px',
                        fontSize: 14,
                        color: '#292A28',
                        textDecoration: 'none',
                        fontFamily: 'Tajawal, sans-serif',
                      }}
                    >
                      تسجيل الدخول
                    </Link>

                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'block',
                        padding: '11px 10px',
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#A89063',
                        textDecoration: 'none',
                        fontFamily: 'Tajawal, sans-serif',
                      }}
                    >
                      إنشاء حساب
                    </Link>
                  </>
                )}

              </div>

            </div>
          </div>
        )}

      </nav>
    </>
  )
}