'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type LegalSource = { id: string; code: string; title: string; shortDesc: string; type: string; url?: string }

const TYPE_LABELS: Record<string, string> = {
  kanun: 'Kanun', yonetmelik: 'Yönetmelik', teblig: 'Tebliğ',
  rehber: 'Rehber', uluslararasi: 'Uluslararası'
}
const TYPE_COLORS: Record<string, string> = {
  kanun: 'bg-blue-100 text-blue-700', yonetmelik: 'bg-purple-100 text-purple-700',
  teblig: 'bg-amber-100 text-amber-700', rehber: 'bg-green-100 text-green-700',
  uluslararasi: 'bg-gray-100 text-gray-700'
}

export default function MevzuatPage() {
  const [sources, setSources] = useState<LegalSource[]>([])
  const [filterType, setFilterType] = useState('')
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ code: '', title: '', shortDesc: '', type: 'kanun', url: '' })

  useEffect(() => {
    fetch('/api/legal-sources').then(r => r.json()).then(d => setSources(d.sources || []))
  }, [])

  const filtered = sources.filter(s =>
    (!filterType || s.type === filterType) &&
    (!search || s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.shortDesc.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleAdd() {
    const res = await fetch('/api/legal-sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.source) {
      setSources(prev => [...prev, data.source])
      setForm({ code: '', title: '', shortDesc: '', type: 'kanun', url: '' })
      setAdding(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1b2a4a]">Mevzuat Kütüphanesi</h1>
        <p className="text-gray-500 mt-1 text-sm">{sources.length} kaynak — Türk hukuku referans veritabanı</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Kanun ara..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1b2a4a]/20" />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="">Tüm Türler</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={() => setAdding(true)}
          className="px-4 py-2 bg-[#c8102e] text-white rounded-lg text-sm font-medium hover:bg-[#a50d25]">
          Yeni Kaynak
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Yeni Mevzuat Kaynağı</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kanun Kodu</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="6493" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tür</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Başlık</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="6493 Sayılı Kanun" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Kısa Açıklama</label>
              <input value={form.shortDesc} onChange={e => setForm(f => ({ ...f, shortDesc: e.target.value }))}
                placeholder="Kanunun kısa açıklaması" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">URL (opsiyonel)</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="px-4 py-2 bg-[#1b2a4a] text-white rounded-lg text-sm font-medium">Kaydet</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Vazgeç</button>
          </div>
        </div>
      )}

      {/* Source list */}
      <div className="space-y-2">
        {filtered.map(source => (
          <div key={source.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 rounded-lg bg-[#1b2a4a] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs text-center leading-tight px-1">{source.code}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">{source.title}</h3>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[source.type] || 'bg-gray-100 text-gray-600')}>
                  {TYPE_LABELS[source.type] || source.type}
                </span>
              </div>
              <p className="text-sm text-gray-500">{source.shortDesc}</p>
            </div>
            {source.url && (
              <a href={source.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#c8102e] hover:underline whitespace-nowrap flex-shrink-0">
                Görüntüle →
              </a>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12">Kaynak bulunamadı</div>
        )}
      </div>
    </div>
  )
}
