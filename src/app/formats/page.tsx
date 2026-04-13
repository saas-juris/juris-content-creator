'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type ContentFormat = {
  id: string
  name: string
  icon: string
  category: string
  description: string
  designLanguage: string
  scope: string
  dimensions: string
  isActive: boolean
  sortOrder: number
}

const CATEGORIES = ['Dijital', 'Sosyal Medya', 'Basılı', 'Sunum', 'Diğer']

const CATEGORY_COLORS: Record<string, string> = {
  'Dijital':      'bg-blue-50 text-blue-700 border-blue-200',
  'Sosyal Medya': 'bg-rose-50 text-rose-700 border-rose-200',
  'Basılı':       'bg-amber-50 text-amber-700 border-amber-200',
  'Sunum':        'bg-purple-50 text-purple-700 border-purple-200',
  'Diğer':        'bg-gray-100 text-gray-600 border-gray-200',
}

const EMPTY_FORM: Omit<ContentFormat, 'id'> = {
  name: '', icon: '📄', category: 'Dijital',
  description: '', designLanguage: '', scope: '', dimensions: '',
  isActive: true, sortOrder: 0,
}

export default function FormatsPage() {
  const [formats, setFormats] = useState<ContentFormat[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ContentFormat | null>(null)
  const [form, setForm] = useState<Omit<ContentFormat, 'id'>>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => { loadFormats() }, [])

  async function loadFormats() {
    const res = await fetch('/api/formats')
    const data = await res.json()
    if (data.formats) setFormats(data.formats)
  }

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(fmt: ContentFormat) {
    setEditing(fmt)
    setForm({ name: fmt.name, icon: fmt.icon, category: fmt.category, description: fmt.description,
      designLanguage: fmt.designLanguage, scope: fmt.scope, dimensions: fmt.dimensions,
      isActive: fmt.isActive, sortOrder: fmt.sortOrder })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editing) {
      await fetch(`/api/formats/${editing.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/formats', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    await loadFormats()
    setSaving(false)
    setModalOpen(false)
  }

  async function handleToggleActive(fmt: ContentFormat) {
    await fetch(`/api/formats/${fmt.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !fmt.isActive }),
    })
    setFormats(prev => prev.map(f => f.id === fmt.id ? { ...f, isActive: !f.isActive } : f))
  }

  async function handleDelete(id: string) {
    await fetch(`/api/formats/${id}`, { method: 'DELETE' })
    setFormats(prev => prev.filter(f => f.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[#1b2a4a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            İçerik Formatları
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Her format için tasarım dili, kapsam ve ölçüleri tanımlayın
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1b2a4a] text-white rounded-lg text-sm font-medium hover:bg-[#142240] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni Format
        </button>
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <span key={cat} className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', CATEGORY_COLORS[cat])}>
            {cat}
          </span>
        ))}
      </div>

      {/* Grid */}
      {formats.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-sm">Henüz format tanımlanmamış</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {formats.map(fmt => (
            <FormatCard
              key={fmt.id}
              fmt={fmt}
              expanded={expandedId === fmt.id}
              onToggleExpand={() => setExpandedId(expandedId === fmt.id ? null : fmt.id)}
              onEdit={() => openEdit(fmt)}
              onDelete={() => setDeleteId(fmt.id)}
              onToggleActive={() => handleToggleActive(fmt)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-[#1b2a4a] text-base">
                {editing ? 'Formatı Düzenle' : 'Yeni Format'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Icon + Name row */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">İkon</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-14 h-10 text-2xl text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30"
                    maxLength={4}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Format Adı <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Blog Yazısı, E-Bülten..."
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30"
                  />
                </div>
              </div>

              {/* Category + Active */}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30 bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 mb-1 cursor-pointer pb-2">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-[#1b2a4a] rounded-full transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Aktif</span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
                <textarea rows={2} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Bu formatın kısa açıklaması..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30"
                />
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                    Tasarım Ölçüleri
                  </span>
                </label>
                <input type="text" value={form.dimensions}
                  onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))}
                  placeholder="1080×1080 px, A4 (210×297 mm)..."
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30"
                />
              </div>

              {/* Design Language */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 100 14A7 7 0 0012 2z" fill="none"/><circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1.5" fill="currentColor"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/></svg>
                    Tasarım Dili
                  </span>
                </label>
                <textarea rows={3} value={form.designLanguage}
                  onChange={e => setForm(f => ({ ...f, designLanguage: e.target.value }))}
                  placeholder="Renk paleti, tipografi, ton, atmosfer notları..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30"
                />
              </div>

              {/* Scope */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Kapsam
                  </span>
                </label>
                <textarea rows={3} value={form.scope}
                  onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}
                  placeholder="Bu formatta yer alacak içerik türleri, kelime sayısı, bölüm yapısı..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                İptal
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="px-5 py-2 bg-[#1b2a4a] text-white rounded-lg text-sm font-medium hover:bg-[#142240] disabled:opacity-50 transition-colors">
                {saving ? 'Kaydediliyor...' : editing ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 mb-2">Formatı Sil</h3>
            <p className="text-sm text-gray-500 mb-5">Bu formatı kalıcı olarak silmek istediğinize emin misiniz?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 font-medium hover:text-gray-900">İptal</button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FormatCard({
  fmt, expanded, onToggleExpand, onEdit, onDelete, onToggleActive,
}: {
  fmt: ContentFormat
  expanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  return (
    <div className={cn(
      'bg-white rounded-xl border transition-all duration-200',
      fmt.isActive ? 'border-gray-200 shadow-sm hover:shadow-md' : 'border-dashed border-gray-200 opacity-60',
    )}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1b2a4a]/5 flex items-center justify-center text-2xl">
            {fmt.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[#1b2a4a] text-base leading-tight">{fmt.name}</h3>
              {!fmt.isActive && (
                <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">Pasif</span>
              )}
            </div>
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', CATEGORY_COLORS[fmt.category] || CATEGORY_COLORS['Diğer'])}>
              {fmt.category}
            </span>
            {fmt.description && (
              <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{fmt.description}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onEdit} title="Düzenle"
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#1b2a4a] hover:bg-gray-100 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={onDelete} title="Sil"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Dimensions badge */}
        {fmt.dimensions && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            <span className="font-mono text-[11px] text-gray-600">{fmt.dimensions}</span>
          </div>
        )}
      </div>

      {/* Expand toggle */}
      {(fmt.designLanguage || fmt.scope) && (
        <button
          onClick={onToggleExpand}
          className="w-full px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400 hover:text-[#1b2a4a] hover:bg-gray-50/50 flex items-center justify-between transition-colors"
        >
          <span>{expanded ? 'Detayları Gizle' : 'Tasarım Detaylarını Gör'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            className={cn('transition-transform', expanded && 'rotate-180')}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
          {fmt.designLanguage && (
            <div className="pt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tasarım Dili</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{fmt.designLanguage}</p>
            </div>
          )}
          {fmt.scope && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#c8102e]" />
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Kapsam</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{fmt.scope}</p>
            </div>
          )}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Durum</span>
            <button onClick={onToggleActive}
              className={cn('text-[11px] font-medium px-3 py-1 rounded-full transition-colors',
                fmt.isActive
                  ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700'
              )}>
              {fmt.isActive ? '● Aktif' : '○ Pasif'} — Değiştir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
