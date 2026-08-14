'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { signUp } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }

    if (!password) {
      toast.error('يرجى إدخال كلمة المرور')
      return
    }

    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين')
      return
    }

    if (password.length < 6) {
      toast.error(
        'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      )
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(
        email.trim(),
        password
      )

      if (error) {
        toast.error(error)
        return
      }

      toast.success(
        'تم إنشاء الحساب! أهلا بك في Jidaar'
      )

      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Signup error:', error)

      toast.error(
        'حدث خطأ أثناء إنشاء الحساب'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-4
        py-12
        relative
        overflow-hidden
      "
      dir="rtl"
      style={{
        background:
          'linear-gradient(135deg, #F5F2ED 0%, #EEE9E1 50%, #F7F4EF 100%)',
      }}
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div
        className="
          absolute
          w-[420px]
          h-[420px]
          rounded-full
          blur-[100px]
          pointer-events-none
          -top-48
          -right-48
        "
        style={{
          background:
            'rgba(180,154,104,.12)',
        }}
      />

      <div
        className="
          absolute
          w-[350px]
          h-[350px]
          rounded-full
          blur-[100px]
          pointer-events-none
          -bottom-48
          -left-48
        "
        style={{
          background:
            'rgba(41,42,40,.05)',
        }}
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          w-full
          max-w-[430px]
        "
      >
        {/* =================================================
            BRAND
        ================================================= */}

        <div className="text-center mb-8">

          <Link
            href="/"
            className="
              inline-flex
              items-center
              justify-center
              group
            "
          >
            <span
              className="
                text-2xl
                sm:text-3xl
                tracking-[0.22em]
                font-semibold
                transition-opacity
                duration-200
                group-hover:opacity-70
              "
              style={{
                color: '#A88C58',
              }}
            >
              JIDAAR
            </span>
          </Link>

          <div className="flex items-center justify-center gap-3 mt-6 mb-2">

            <span
              className="w-8 h-px"
              style={{
                background: '#B49A68',
              }}
            />

            <h1
              className="
                text-xl
                sm:text-2xl
                font-semibold
              "
              style={{
                color: '#292A28',
              }}
            >
              حساب جديد
            </h1>

            <span
              className="w-8 h-px"
              style={{
                background: '#B49A68',
              }}
            />

          </div>

          <p
            className="text-sm mt-2"
            style={{
              color: '#9A9288',
            }}
          >
            انضم إلى جدار
          </p>

        </div>

        {/* =================================================
            SIGNUP CARD
        ================================================= */}

        <div
          className="
            rounded-2xl
            sm:rounded-3xl
            p-5
            sm:p-7
          "
          style={{
            background: 'rgba(255,255,255,.68)',
            border:
              '1px solid rgba(41,42,40,.08)',
            boxShadow:
              '0 25px 70px rgba(41,42,40,.08)',
            backdropFilter: 'blur(18px)',
          }}
        >

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            dir="ltr"
          >

            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

              <label
                htmlFor="email"
                className="
                  text-xs
                  mb-2
                  block
                "
                style={{
                  color: '#6F6961',
                }}
              >
                البريد الإلكتروني
              </label>

              <div className="relative">

                <span
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    pointer-events-none
                  "
                  style={{
                    color: '#A88C58',
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />

                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="
                    w-full
                    h-12
                    rounded-xl
                    px-4
                    pl-11
                    outline-none
                    text-sm
                    transition-all
                    duration-300
                  "
                  style={{
                    background:
                      'rgba(245,242,237,.75)',
                    border:
                      '1px solid rgba(41,42,40,.10)',
                    color: '#292A28',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(180,154,104,.55)'

                    e.currentTarget.style.boxShadow =
                      '0 0 0 3px rgba(180,154,104,.07)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(41,42,40,.10)'

                    e.currentTarget.style.boxShadow =
                      'none'
                  }}
                  placeholder="email@example.com"
                  autoComplete="email"
                  dir="ltr"
                  required
                />

              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

              <label
                htmlFor="password"
                className="
                  text-xs
                  mb-2
                  block
                "
                style={{
                  color: '#6F6961',
                }}
              >
                كلمة المرور
              </label>

              <div className="relative">

                <span
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    pointer-events-none
                  "
                  style={{
                    color: '#A88C58',
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                    />

                    <path d="M8 10V7a4 4 0 018 0v3" />
                  </svg>
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="
                    w-full
                    h-12
                    rounded-xl
                    px-4
                    pl-11
                    pr-11
                    outline-none
                    text-sm
                    transition-all
                    duration-300
                  "
                  style={{
                    background:
                      'rgba(245,242,237,.75)',
                    border:
                      '1px solid rgba(41,42,40,.10)',
                    color: '#292A28',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(180,154,104,.55)'

                    e.currentTarget.style.boxShadow =
                      '0 0 0 3px rgba(180,154,104,.07)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(41,42,40,.10)'

                    e.currentTarget.style.boxShadow =
                      'none'
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  dir="ltr"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    p-1.5
                    transition-colors
                  "
                  style={{
                    color: '#9A9288',
                  }}
                  aria-label={
                    showPassword
                      ? 'إخفاء كلمة المرور'
                      : 'إظهار كلمة المرور'
                  }
                >
                  {showPassword ? (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                      />

                      <path d="M4 4l16 16" />
                    </svg>
                  ) : (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                      />
                    </svg>
                  )}
                </button>

              </div>

              <p
                className="
                  text-[10px]
                  mt-1.5
                "
                style={{
                  color: '#AAA198',
                }}
              >
                يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل
              </p>

            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div>

              <label
                htmlFor="confirmPassword"
                className="
                  text-xs
                  mb-2
                  block
                "
                style={{
                  color: '#6F6961',
                }}
              >
                تأكيد كلمة المرور
              </label>

              <div className="relative">

                <span
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    pointer-events-none
                  "
                  style={{
                    color: '#A88C58',
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12l2 2 4-4" />

                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                  </svg>
                </span>

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    h-12
                    rounded-xl
                    px-4
                    pl-11
                    pr-11
                    outline-none
                    text-sm
                    transition-all
                    duration-300
                  "
                  style={{
                    background:
                      'rgba(245,242,237,.75)',
                    border:
                      '1px solid rgba(41,42,40,.10)',
                    color: '#292A28',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(180,154,104,.55)'

                    e.currentTarget.style.boxShadow =
                      '0 0 0 3px rgba(180,154,104,.07)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      'rgba(41,42,40,.10)'

                    e.currentTarget.style.boxShadow =
                      'none'
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  dir="ltr"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    p-1.5
                    transition-colors
                  "
                  style={{
                    color: '#9A9288',
                  }}
                  aria-label={
                    showConfirmPassword
                      ? 'إخفاء كلمة المرور'
                      : 'إظهار كلمة المرور'
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                      />

                      <path d="M4 4l16 16" />
                    </svg>
                  ) : (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                      />
                    </svg>
                  )}
                </button>

              </div>
            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                h-12
                rounded-xl
                inline-flex
                items-center
                justify-center
                gap-2
                text-sm
                font-semibold
                transition-all
                duration-300
                hover:-translate-y-0.5
                disabled:opacity-40
                disabled:cursor-not-allowed
                disabled:hover:translate-y-0
              "
              style={{
                background: '#292A28',
                color: '#F5F2ED',
                border:
                  '1px solid #292A28',
                boxShadow:
                  '0 12px 28px rgba(41,42,40,.12)',
              }}
            >
              {loading ? (
                <span
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
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

                  جاري إنشاء الحساب...
                </span>
              ) : (
                <span
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  إنشاء حساب

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />

                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                    />

                    <path d="M19 8v6" />
                    <path d="M22 11h-6" />
                  </svg>
                </span>
              )}
            </button>

          </form>

          {/* =================================================
              LOGIN
          ================================================= */}

          <div
            className="
              mt-6
              pt-5
              text-center
            "
            style={{
              borderTop:
                '1px solid rgba(41,42,40,.07)',
            }}
          >
            <p
              className="
                text-xs
                sm:text-sm
              "
              style={{
                color: '#9A9288',
              }}
            >
              لديك حساب بالفعل؟{' '}

              <Link
                href="/auth/login"
                className="
                  font-medium
                  transition-colors
                "
                style={{
                  color: '#A88C58',
                }}
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>

        </div>

        {/* =================================================
            BACK TO STORE
        ================================================= */}

        <div className="text-center mt-6">

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2
              text-xs
              transition-colors
            "
            style={{
              color: '#9A9288',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>

            العودة إلى المتجر
          </Link>

        </div>

      </div>
    </main>
  )
}