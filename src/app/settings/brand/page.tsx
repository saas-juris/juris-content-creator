'use client'

import { useState, useEffect, useRef } from 'react'
import { JURIS_BRAND } from '@/lib/brand.config'
import { cn } from '@/lib/utils'

type BrandAsset = { id: string; name: string; filename: string; category: string; path: string }
type Guideline = { id: string; name: string; filename: string; createdAt?: string }

export default function BrandPage() {
  const [assets, setAssets] = useState<BrandAsset[]>([])
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [notes, setNotes] = useState('')
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/brand-assets').then(r => r.json()).then(d => setAssets(d.assets || []))
    fetch('/api/brand-guidelines').then(r => r.json()).then(d => setGuidelines(d.guidelines || []))
    fetch('/api/brand-guidelines/notes').then(r => r.json()).then(d => setNotes(d.notes || ''))
  }, [])

  async function handleImgUpload(files: FileList) {
    setUploading(true)
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'external-logo')
      const res = await fetch('/api/brand-assets', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.asset) setAssets(prev => [...prev, data.asset])
    }
    setUploading(false)
  }

  async function handlePdfUpload(files: FileList) {
    setUploadingPdf(true)
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) continue
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/brand-guidelines', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.guideline) setGuidelines(prev => [...prev, data.guideline])
    }
    setUploadingPdf(false)
  }

  async function analyzeGuideline(id: string) {
    setAnalyzingId(id)
    try {
      const res = await fetch('/api/brand-guidelines/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.notes) {
        const sep = notes.trim() ? '\n\n---\n\n' : ''
        const guideline = guidelines.find(g => g.id === id)
        const header = guideline ? `# ${guideline.name}\n` : ''
        setNotes(prev => prev.trim() + sep + header + data.notes)
        setNotesSaved(false)
      } else {
        alert(data.error || 'Analiz başarısız')
      }
    } catch {
      alert('Bağlantı hatası')
    }
    setAnalyzingId(null)
  }

  async function deleteGuideline(id: string) {
    setDeletingId(id)
    try {
      await fetch(`/api/brand-guidelines/${id}`, { method: 'DELETE' })
      setGuidelines(prev => prev.filter(g => g.id !== id))
    } catch { /* ignore */ }
    setDeletingId(null)
  }

  async function saveNotes() {
    setNotesLoading(true)
    await fetch('/api/brand-guidelines/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setNotesLoading(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2500)
  }

  const categories = { logo: 'Ana Logo', icon: 'İkon', 'external-logo': 'Harici Logo', pattern: 'Desen' }
  const visibleAssets = assets.filter(a => a.category !== 'guideline')
  const grouped = visibleAssets.reduce((acc, a) => {
    const cat = a.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(a)
    return acc
  }, {} as Record<string, BrandAsset[]>)

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6 md:mb-8">
        <h1 className="page-title">Marka Yönetimi</h1>
        <p className="text-gray-500 mt-1 text-sm">Logo, görsel varlıklar ve marka rehberi</p>
      </div>

      {/* ── Marka Rehberi Dokümanları ── */}
      <div className="card p-5 md:p-6 mb-6 border-l-4 border-l-[#c9a84c]">
        <div className="flex items-center gap-2 mb-1">
          <PdfIcon />
          <h3 className="font-semibold text-[#1b2a4a] text-base">Marka Rehberi Dokümanları</h3>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#c9a84c]/15 text-[#c9a84c] tracking-wider">
            AI
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          PDF yükleyin — Claude analiz etsin — tasarım notları slayt üretimine otomatik eklensin.
        </p>

        {/* PDF Upload zone */}
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-4',
            uploadingPdf
              ? 'border-[#c9a84c]/50 bg-[#c9a84c]/5'
              : 'border-gray-200 hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/3'
          )}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handlePdfUpload(e.dataTransfer.files) }}
          onClick={() => pdfInputRef.current?.click()}
        >
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files?.length) handlePdfUpload(e.target.files) }}
          />
          {uploadingPdf ? (
            <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <LoadingSpinner /> Yükleniyor...
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center mx-auto mb-2">
                <PdfIcon gold />
              </div>
              <p className="text-sm font-medium text-gray-700">Marka Rehberi PDF yükle</p>
              <p className="text-xs text-gray-400 mt-1">Sürükle bırak veya tıkla · Birden fazla dosya</p>
            </>
          )}
        </div>

        {/* Guidelines list */}
        {guidelines.length > 0 && (
          <div className="space-y-2 mb-5">
            {guidelines.map(g => (
              <div
                key={g.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#c8102e]/8 flex items-center justify-center">
                  <PdfIcon red />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{g.name}</div>
                  <div className="text-xs text-gray-400">.pdf</div>
                </div>
                <button
                  onClick={() => analyzeGuideline(g.id)}
                  disabled={analyzingId === g.id}
                  className={cn(
                    'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5',
                    analyzingId === g.id
                      ? 'bg-gray-100 text-gray-400 cursor-wait'
                      : 'bg-[#1b2a4a] text-white hover:bg-[#243660]'
                  )}
                >
                  {analyzingId === g.id ? (
                    <><LoadingSpinner small /> Analiz ediliyor...</>
                  ) : (
                    'Claude ile Analiz Et'
                  )}
                </button>
                <button
                  onClick={() => deleteGuideline(g.id)}
                  disabled={deletingId === g.id}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                  title="Sil"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Design notes textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Tasarım Notları
            </label>
            <span className="text-[10px] text-gray-400">
              Slayt üretiminde otomatik kullanılır
            </span>
          </div>
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setNotesSaved(false) }}
            placeholder="Marka rehberinden çıkarılan tasarım notları buraya gelir. Manuel de düzenleyebilirsiniz.&#10;&#10;Örnek:&#10;- Ana renk: #1b2a4a (Lacivert), vurgu: #c8102e (Kırmızı), altın: #c9a84c&#10;- Başlıklar Playfair Display, gövde DM Sans&#10;- Logo sol üst köşe, beyaz alan min. 20px&#10;- Sade, beyaz alan ağırlıklı tasarım tercih edilir"
            rows={8}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30 bg-white font-mono leading-relaxed text-gray-700 placeholder:text-gray-300 placeholder:font-sans"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{notes.length} karakter</span>
            <button
              onClick={saveNotes}
              disabled={notesLoading}
              className={cn(
                'text-sm font-medium px-4 py-1.5 rounded-lg transition-colors',
                notesSaved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#1b2a4a] text-white hover:bg-[#243660] disabled:opacity-50'
              )}
            >
              {notesLoading ? 'Kaydediliyor...' : notesSaved ? '✓ Kaydedildi' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Marka Renkleri ── */}
      <div className="card p-5 md:p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide text-gray-500">
          Marka Renkleri
        </h3>
        <div className="flex gap-4 flex-wrap">
          {Object.entries(JURIS_BRAND.colors).map(([name, color]) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl shadow-sm border border-gray-100"
                style={{ background: color }}
              />
              <div className="text-xs text-gray-600 font-medium">{name}</div>
              <div className="text-[10px] text-gray-400 font-mono">{color}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Logo Yükleme ── */}
      <div className="card p-5 md:p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm uppercase tracking-wide text-gray-500">
          Harici Logo Yükle
        </h3>
        <p className="text-xs text-gray-400 mb-4">SPK, BDDK, KVKK, Rekabet Kurumu logoları</p>
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#1b2a4a]/30 transition-colors"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleImgUpload(e.dataTransfer.files) }}
          onClick={() => imgInputRef.current?.click()}
        >
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files?.length) handleImgUpload(e.target.files) }}
          />
          {uploading ? (
            <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <LoadingSpinner /> Yükleniyor...
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sürükle bırak veya tıkla</p>
          )}
        </div>
      </div>

      {/* ── Asset Gallery ── */}
      {Object.entries(grouped).map(([cat, catAssets]) => (
        <div key={cat} className="card p-5 md:p-6 mb-4">
          <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-4">
            {categories[cat as keyof typeof categories] || cat}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {catAssets.map(asset => (
              <div key={asset.id} className="border border-gray-100 rounded-lg p-3 text-center">
                <div className="w-full aspect-square bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={`/brand-assets/${asset.filename}`}
                    alt={asset.name}
                    className="max-w-full max-h-full object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                <p className="text-xs text-gray-600 truncate">{asset.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PdfIcon({ gold, red }: { gold?: boolean; red?: boolean }) {
  const color = gold ? '#c9a84c' : red ? '#c8102e' : '#9ca3af'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

function LoadingSpinner({ small }: { small?: boolean }) {
  const size = small ? 12 : 14
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}
