'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('E-posta veya şifre hatalı.')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          E-posta
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="isim@juris.av.tr"
          required
          autoComplete="email"
          className="w-full h-11 px-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b2a4a]/20 focus:border-[#1b2a4a] transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Şifre
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="w-full h-11 px-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b2a4a]/20 focus:border-[#1b2a4a] transition-colors"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-[#1b2a4a] text-white rounded-lg font-medium text-sm hover:bg-[#142240] disabled:opacity-60 transition-colors mt-2"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Giriş yapılıyor...
          </span>
        ) : 'Giriş Yap'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b2a4a] via-[#1b2a4a] to-[#0f1d35] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, white 40px, white 41px)`,
      }} />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/api/serve-asset/Juris%20Brand%20Assets/juris-beyaz-01.png"
                alt="Juris"
                className="h-10 w-auto object-contain invert"
                onError={e => {
                  const t = e.currentTarget
                  t.style.display = 'none'
                  const fb = t.nextElementSibling as HTMLElement
                  if (fb) fb.style.display = 'block'
                }}
              />
              <span
                className="text-[#1b2a4a] text-3xl font-bold italic hidden"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                juris
              </span>
            </div>
            <p className="text-xs text-gray-400 tracking-widest uppercase">Content Engine</p>
          </div>

          {/* Gold divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent mb-7" />

          <h1 className="text-lg font-bold text-[#1b2a4a] mb-6 text-center"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Hesabınıza Giriş Yapın
          </h1>

          <Suspense>
            <LoginForm />
          </Suspense>

          <p className="text-xs text-center text-gray-400 mt-6">
            Hesabınız yok mu?{' '}
            <span className="text-[#1b2a4a] font-medium">
              Yöneticinizden davet isteyin
            </span>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Juris Avukatlık Ortaklığı · Dahili Sistem
        </p>
      </div>
    </div>
  )
}
