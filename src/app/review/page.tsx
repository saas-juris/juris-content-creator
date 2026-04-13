'use client'

import { useState, useEffect } from 'react'
import { formatDate, cn, checkCompliance } from '@/lib/utils'
import { COMPLIANCE_CHECKS, STATUS_CONFIG } from '@/lib/brand.config'

type ContentItem = {
  id: string; title: string; subtitle?: string; weekTheme: string; format: string
  contentType: string; dikwLevel: string; hashtags: string; status: string
  date: string; bodyText?: string; researchText?: string; legalSources?: string
  slidesHtml?: string; reviewNotes?: string; approvedBy?: string
}

export default function ReviewPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [reviewer, setReviewer] = useState('')
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({})
  const [currentSlide, setCurrentSlide] = useState(0)
  const [actionLoading, setActionLoading] = useState(false)
  const [mobilePane, setMobilePane] = useState<'queue' | 'preview' | 'checks'>('queue')

  useEffect(() => {
    fetch('/api/content?status=review')
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function selectItem(item: ContentItem) {
    setSelected(item)
    setNotes(item.reviewNotes || '')
    setManualChecks({})
    setCurrentSlide(0)
    setMobilePane('preview')
  }

  async function handleAction(action: 'approve' | 'revision' | 'reject') {
    if (!selected) return
    setActionLoading(true)
    const statusMap = { approve: 'approved', revision: 'revision', reject: 'rejected' }
    const payload: Record<string, unknown> = {
      status: statusMap[action],
      reviewNotes: notes,
    }
    if (action === 'approve') {
      payload.approvedBy = reviewer || 'İnceleyici'
      payload.approvedAt = new Date().toISOString()
    }
    await fetch(`/api/content/${selected.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setItems(prev => prev.filter(i => i.id !== selected.id))
    setSelected(null)
    setMobilePane('queue')
    setActionLoading(false)
  }

  const slides = selected?.slidesHtml
    ? (() => { try { return JSON.parse(selected.slidesHtml!) } catch { return [] } })()
    : []
  const autoResults = selected?.bodyText ? checkCompliance(selected.bodyText) : {}
  const manualCheckList = COMPLIANCE_CHECKS.filter(c => !c.auto)
  const autoCheckList = COMPLIANCE_CHECKS.filter(c => c.auto)
  const allPassed =
    autoCheckList.every(c => autoResults[c.id] !== false) &&
    manualCheckList.every(c => manualChecks[c.id])

  return (
    <div className="flex h-full overflow-hidden flex-col md:flex-row">

      {/* ─── Mobile pane tabs ─── */}
      {selected && (
        <div className="md:hidden flex border-b border-gray-200 bg-white flex-shrink-0">
          {[
            { key: 'queue', label: 'Kuyruk' },
            { key: 'preview', label: 'Önizleme' },
            { key: 'checks', label: 'Kontrol' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setMobilePane(tab.key as typeof mobilePane)}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors',
                mobilePane === tab.key
                  ? 'border-[#1b2a4a] text-[#1b2a4a]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ─── Left — queue ─── */}
      <div className={cn(
        'bg-white border-r border-gray-100 flex flex-col flex-shrink-0',
        'md:w-72 md:flex',
        selected
          ? mobilePane === 'queue' ? 'flex w-full' : 'hidden md:flex'
          : 'flex w-full md:w-72'
      )}>
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-[#1b2a4a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Onay Kuyruğu
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">{items.length} içerik bekliyor</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {loading ? (
            <div className="text-center text-gray-400 py-8 text-sm">Yükleniyor...</div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Tümü tamam</p>
              <p className="text-xs text-gray-400 mt-1">Onay bekleyen içerik yok</p>
            </div>
          ) : items.map(item => (
            <button
              key={item.id}
              onClick={() => selectItem(item)}
              className={cn(
                'w-full text-left p-3 rounded-lg mb-1 transition-colors',
                selected?.id === item.id
                  ? 'bg-[#1b2a4a]/8 border border-[#1b2a4a]/15'
                  : 'hover:bg-gray-50 border border-transparent'
              )}
            >
              <div className="text-xs text-gray-400 mb-1">{formatDate(item.date)}</div>
              <div className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{item.title}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-1">{item.weekTheme}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Right — review workspace ─── */}
      {selected ? (
        <div className={cn(
          'flex-1 flex overflow-hidden',
          'md:flex',
          mobilePane === 'queue' ? 'hidden md:flex' : 'flex flex-col md:flex-row'
        )}>
          {/* Center — slide preview */}
          <div className={cn(
            'flex-1 bg-gray-50 flex flex-col overflow-hidden',
            mobilePane === 'checks' ? 'hidden md:flex' : 'flex'
          )}>
            <div className="p-3 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-gray-800 text-sm truncate flex-1 mr-2">{selected.title}</h3>
              {slides.length > 0 && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs disabled:opacity-30 hover:bg-gray-200 transition-colors"
                  >←</button>
                  <span className="text-xs text-gray-500 tabular-nums min-w-12 text-center">
                    {currentSlide + 1} / {slides.length}
                  </span>
                  <button
                    onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === slides.length - 1}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs disabled:opacity-30 hover:bg-gray-200 transition-colors"
                  >→</button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto flex items-start justify-center p-4 md:p-6">
              {slides.length > 0 ? (
                <div
                  className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-xl"
                  style={{ aspectRatio: selected.format.includes('1080×1080') ? '1/1' : '16/9' }}
                >
                  <iframe
                    srcDoc={slides[currentSlide]}
                    className="w-full h-full border-0"
                    title="Slide"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400 mt-12">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className="text-sm">Slayt tasarlanmamış</p>
                </div>
              )}
            </div>

            {selected.bodyText && (
              <div className="mx-3 md:mx-4 mb-3 md:mb-4 card p-4 flex-shrink-0">
                <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-widest">
                  LinkedIn Post Metni
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-4 md:line-clamp-none">
                  {selected.bodyText}
                </p>
              </div>
            )}
          </div>

          {/* Right panel — compliance + actions */}
          <div className={cn(
            'bg-white border-l border-gray-100 flex flex-col overflow-hidden',
            'md:w-72',
            mobilePane === 'checks' ? 'flex w-full' : 'hidden md:flex'
          )}>
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm scrollbar-thin">
              {/* Compliance checks */}
              <div>
                <h4 className="font-semibold text-[#1b2a4a] mb-3 text-sm" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                  Uyum Kontrolü
                </h4>
                <div className="space-y-2">
                  {autoCheckList.map(check => (
                    <div key={check.id} className="flex items-start gap-2.5">
                      <span className={cn(
                        'flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold',
                        autoResults[check.id] !== false ? 'bg-emerald-500' : 'bg-red-500'
                      )}>
                        {autoResults[check.id] !== false ? '✓' : '✗'}
                      </span>
                      <span className={cn(
                        'text-xs leading-tight',
                        autoResults[check.id] !== false ? 'text-gray-600' : 'text-red-600'
                      )}>
                        {check.label}
                      </span>
                    </div>
                  ))}

                  {manualCheckList.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Manuel Kontrol</div>
                      {manualCheckList.map(check => (
                        <label key={check.id} className="flex items-start gap-2.5 cursor-pointer mb-2">
                          <input
                            type="checkbox"
                            checked={manualChecks[check.id] || false}
                            onChange={e => setManualChecks(prev => ({ ...prev, [check.id]: e.target.checked }))}
                            className="mt-0.5 flex-shrink-0 accent-[#1b2a4a]"
                          />
                          <span className="text-xs text-gray-600 leading-tight">{check.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reviewer */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  İnceleyici
                </label>
                <input
                  value={reviewer}
                  onChange={e => setReviewer(e.target.value)}
                  placeholder="İsim giriniz"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30 bg-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Notlar
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Revizyon notu veya onay yorumu..."
                  className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30 bg-white"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t border-gray-100 space-y-2 flex-shrink-0">
              <button
                onClick={() => handleAction('approve')}
                disabled={!allPassed || actionLoading}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 transition-colors"
              >
                Onayla
              </button>
              <button
                onClick={() => handleAction('revision')}
                disabled={actionLoading}
                className="w-full py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                Revizyon İste
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={actionLoading}
                className="w-full py-2.5 bg-[#c8102e] text-white rounded-lg text-sm font-medium hover:bg-[#a50d25] transition-colors"
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center text-gray-400">
          <div>
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Soldan bir içerik seçin</p>
          </div>
        </div>
      )}
    </div>
  )
}
