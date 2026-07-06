'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error(error)
    } else {
      toast.success('تم تسجيل الدخول بنجاح')
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass p-8 gold-glow animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-gold font-bold text-lg">إ</span>
          </div>
          <h1 className="text-2xl font-bold text-white">تسجيل الدخول</h1>
          <p className="text-white/40 text-sm mt-2">أهلاً بعودتك إلى إطار</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark" placeholder="email@example.com" required />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-dark" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full !py-3.5 disabled:opacity-40">
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-base/30 border-t-base rounded-full animate-spin" />
            ) : (
              'دخول'
            )}
          </button>
        </form>
        <p className="text-center text-white/30 text-sm mt-6">
          ليس لديك حساب؟{' '}
          <Link href="/auth/signup" className="text-gold hover:underline">إنشاء حساب</Link>
        </p>
      </div>
    </div>
  )
}