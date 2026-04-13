'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AcceptInviteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) { setStatus('invalid'); return }
    fetch(`/api/accept-invite?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.email) { setEmail(d.email); setStatus('valid') }
        else setStatus('invalid')
      })
      .catch(() => setStatus('invalid'))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== password2) { setError('Şifreler eşleşmiyor.'); return }
    if (password.length < 8) { setError('Şifre en az 8 karakter olmalı.'); return }
    setSaving(true)
    const res = await fetch('/api/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name, password }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.ok) {
      setStatus('success')
      setTimeout(() => router.push('/login'), 2000)
    } else {
      setError(data.error || 'Bir hata oluştu.')
    }
  }

  if (status === 'loading') return (
    <div className="text-center py-8 text-gray-400">
      <span className="w-6 h-6 border-2 border-gray-200 border-t-[#1b2a4a] rounded-full animate-spin inline-block" />
    </div>
  )

  if (status === 'invalid') return (
    <div className="text-center py-6">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="text-sm text-gray-600 font-medium">Davet geçersiz veya süresi dolmuş.</p>
      <p className="text-xs text-gray-400 mt-1">Yöneticinizden yeni bir davet isteyin.</p>
    </div>
  )

  if (status === 'success') return (
    <div className="text-center py-6">
      <div className="text-4xl mb-3">✅</div>
      <p className="text-sm text-gray-600 font-medium">Hesabınız oluşturuldu!</p>
      <p className="text-xs text-gray-400 mt-1">Giriş sayfasına yönlendiriliyorsunuz...</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">E-posta</label>
        <input value={email} disabled
          className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Ad Soyad</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required
          placeholder="Adınız ve soyadınız"
          className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Şifre</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
          placeholder="En az 8 karakter"
          className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Şifre Tekrar</label>
        <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} required
          placeholder="Şifreyi tekrar girin"
          className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30" />
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      <button type="submit" disabled={saving}
        className="w-full h-10 bg-[#1b2a4a] text-white rounded-lg text-sm font-medium hover:bg-[#142240] disabled:opacity-60 transition-colors">
        {saving ? 'Kaydediliyor...' : 'Hesabı Oluştur'}
      </button>
    </form>
  )
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b2a4a] to-[#0f1d35] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10 w-full max-w-sm">
        <div className="text-center mb-7">
          <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Content Engine</p>
          <h1 className="text-lg font-bold text-[#1b2a4a]"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Daveti Kabul Et
          </h1>
          <p className="text-xs text-gray-500 mt-1">Hesabınızı oluşturmak için bilgilerinizi girin</p>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent mb-6" />
        <Suspense>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  )
}
