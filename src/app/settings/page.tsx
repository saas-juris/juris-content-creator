'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.ANTHROPIC_API_KEY) setApiKey(d.ANTHROPIC_API_KEY)
    })
  }, [])

  async function handleSave() {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ANTHROPIC_API_KEY: apiKey }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    const res = await fetch('/api/settings/test-ai')
    const data = await res.json()
    setTestResult(data.ok ? '✓ API bağlantısı başarılı' : `✗ Hata: ${data.error}`)
    setTesting(false)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1b2a4a]">Ayarlar</h1>
        <p className="text-gray-500 mt-1 text-sm">Uygulama yapılandırması</p>
      </div>

      <div className="space-y-6">
        {/* API Key */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Anthropic API Anahtarı</h3>
          <p className="text-sm text-gray-500 mb-4">Claude Opus 4.6 ile AI araştırma ve içerik üretimi için gereklidir.</p>
          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1b2a4a]/20"
            />
            <button onClick={handleSave}
              className="px-4 py-2 bg-[#1b2a4a] text-white rounded-lg text-sm font-medium hover:bg-[#142240] transition-colors">
              {saved ? 'Kaydedildi ✓' : 'Kaydet'}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={handleTest} disabled={!apiKey || testing}
              className="text-sm text-[#c8102e] hover:underline disabled:opacity-40">
              {testing ? 'Test ediliyor...' : 'API bağlantısını test et'}
            </button>
            {testResult && (
              <span className={`text-sm ${testResult.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                {testResult}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            API anahtarı .env.local dosyasında saklanır, veritabanına yazılmaz.
          </p>
        </div>

        {/* App info */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Uygulama Bilgisi</h3>
          <div className="space-y-2 text-sm">
            {[
              ['Uygulama', 'Juris Content Engine v1.0'],
              ['Müşteri', 'Juris Avukatlık Ortaklığı'],
              ['Kanal', 'LinkedIn'],
              ['AI Modeli', 'claude-opus-4-6'],
              ['Veritabanı', 'SQLite (yerel)'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{k}</span>
                <span className="text-gray-800 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
