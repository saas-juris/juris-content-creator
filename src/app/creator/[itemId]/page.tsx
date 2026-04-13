'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { JURIS_BRAND, COMPLIANCE_CHECKS } from '@/lib/brand.config'

type ContentItem = {
  id: string; title: string; subtitle?: string; weekTheme: string; format: string
  contentType: string; dikwLevel: string; targetAudience: string; hashtags: string
  status: string; researchText?: string; bodyText?: string; legalSources?: string
  slidesHtml?: string; slidesPngPaths?: string
}

type ResearchData = {
  research_text: string; key_points: string[]
  legal_sources: Array<{ code: string; article: string; description: string }>
  statistics: Array<{ value: string; context: string; source: string; date: string }>
  pull_quote: string
}

export default function CreatorWorkspace({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = use(params)
  const router = useRouter()
  const [item, setItem] = useState<ContentItem | null>(null)
  const [research, setResearch] = useState<ResearchData | null>(null)
  const [bodyText, setBodyText] = useState('')
  const [slides, setSlides] = useState<string[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [step, setStep] = useState<'research' | 'write' | 'design'>('research')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [mobilePane, setMobilePane] = useState<'left' | 'center' | 'right'>('left')
  const [researchRevision, setResearchRevision] = useState('')
  const [writeRevision, setWriteRevision] = useState('')
  const [designRevision, setDesignRevision] = useState('')

  useEffect(() => {
    fetch(`/api/content/${itemId}`)
      .then(r => r.json())
      .then(d => {
        setItem(d.item)
        if (d.item?.researchText) {
          try { setResearch(JSON.parse(d.item.researchText)) } catch { setResearch({ research_text: d.item.researchText, key_points: [], legal_sources: [], statistics: [], pull_quote: '' }) }
          setStep('write')
        }
        if (d.item?.bodyText) { setBodyText(d.item.bodyText); setStep('design') }
        if (d.item?.slidesHtml) { try { setSlides(JSON.parse(d.item.slidesHtml)) } catch {} }
      })
  }, [itemId])

  async function handleResearch(revision?: string) {
    setLoading(true); setLoadingMsg('Claude araştırıyor...')
    const res = await fetch('/api/ai/research', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, revisionNote: revision || undefined }),
    })
    const data = await res.json()
    if (data.research) {
      setResearch(data.research)
      setResearchRevision('')
      setStep('write')
      // Reload item
      const r2 = await fetch(`/api/content/${itemId}`); const d2 = await r2.json(); setItem(d2.item)
    }
    setLoading(false)
  }

  async function handleWrite(revision?: string) {
    setLoading(true); setLoadingMsg('Claude yazıyor...')
    const res = await fetch('/api/ai/write', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, revisionNote: revision || undefined }),
    })
    const data = await res.json()
    if (data.bodyText) { setBodyText(data.bodyText); setWriteRevision(''); setStep('design') }
    setLoading(false)
  }

  async function handleDesign(revision?: string) {
    setLoading(true); setLoadingMsg('Slaytlar oluşturuluyor...')
    const res = await fetch('/api/export/png', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, revisionNote: revision || undefined }),
    })
    const data = await res.json()
    if (data.slidesHtml) { setSlides(data.slidesHtml); setDesignRevision('') }
    setLoading(false)
  }

  async function saveBodyText() {
    await fetch(`/api/content/${itemId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bodyText }),
    })
  }

  async function sendToReview() {
    await fetch(`/api/content/${itemId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'review' }),
    })
    router.push('/review')
  }

  if (!item) return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Yükleniyor...</div>

  return (
    <div className="flex h-full overflow-hidden flex-col md:flex-row">
      {/* Mobile pane tabs */}
      <div className="md:hidden flex border-b border-gray-200 bg-white flex-shrink-0">
        {[
          { key: 'left', label: 'Üret' },
          { key: 'center', label: 'Önizleme' },
          { key: 'right', label: 'Bilgi' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setMobilePane(tab.key as typeof mobilePane)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors',
              mobilePane === tab.key
                ? 'border-[#1b2a4a] text-[#1b2a4a]'
                : 'border-transparent text-gray-500'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Left panel — research */}
      <div className={cn(
        'bg-white border-r border-gray-100 flex flex-col overflow-hidden flex-shrink-0',
        'md:w-80 md:flex',
        mobilePane === 'left' ? 'flex flex-1 md:flex-none' : 'hidden md:flex'
      )}>
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="text-xs text-gray-500 mb-1">{item.weekTheme}</div>
          <h2 className="font-bold text-gray-900 text-sm leading-snug line-clamp-3">{item.title}</h2>
          {item.subtitle && <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* Steps */}
          <div className="flex gap-1">
            {(['research','write','design'] as const).map((s, i) => (
              <button key={s} onClick={() => setStep(s)}
                className={cn('flex-1 py-1.5 text-xs font-medium rounded-md transition-colors',
                  step === s ? 'bg-[#1b2a4a] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                {i + 1}. {s === 'research' ? 'Araştır' : s === 'write' ? 'Yaz' : 'Tasarla'}
              </button>
            ))}
          </div>

          {/* Research section */}
          {step === 'research' && (
            <div>
              {research ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Anahtar Noktalar</h4>
                    <ul className="space-y-1">
                      {research.key_points.map((kp, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                          <span className="text-[#c8102e] flex-shrink-0">▪</span>{kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {research.statistics.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">İstatistikler</h4>
                      {research.statistics.map((s, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-2 mb-1.5">
                          <span className="font-bold text-[#1b2a4a] text-sm">{s.value}</span>
                          <span className="text-xs text-gray-600 ml-1">{s.context}</span>
                          <div className="text-xs text-gray-400">{s.source}, {s.date}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {research.legal_sources.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Mevzuat Kaynakları</h4>
                      {research.legal_sources.map((src, i) => (
                        <div key={i} className="text-xs text-gray-600 flex gap-1.5 mb-1">
                          <span className="text-[#1b2a4a] font-medium flex-shrink-0">{src.code} {src.article}</span>
                          <span>{src.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-xs">Araştırma başlatmak için butona tıklayın</p>
                </div>
              )}
              {research && (
                <div className="mt-3 space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Revizyon talebi</label>
                  <textarea
                    value={researchRevision}
                    onChange={e => setResearchRevision(e.target.value)}
                    rows={2}
                    placeholder="Örn: İş hukukuna daha çok odaklan, güncel 2024 kararlarını ekle..."
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/50 placeholder-gray-400"
                  />
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleResearch()} disabled={loading}
                  className="flex-1 py-2.5 bg-[#1b2a4a] text-white rounded-lg text-sm font-medium hover:bg-[#142240] disabled:opacity-50 transition-colors">
                  {loading ? loadingMsg : research ? 'Yeniden Araştır' : 'Araştır (Claude)'}
                </button>
                {research && researchRevision.trim() && (
                  <button onClick={() => handleResearch(researchRevision)} disabled={loading}
                    className="px-3 py-2.5 bg-[#c9a84c] text-white rounded-lg text-sm font-medium hover:bg-[#b8953d] disabled:opacity-50 transition-colors whitespace-nowrap">
                    Revize Et
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Write section */}
          {step === 'write' && (
            <div>
              {bodyText ? (
                <div>
                  <textarea value={bodyText} onChange={e => setBodyText(e.target.value)}
                    className="w-full h-48 text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30"
                    placeholder="LinkedIn post metni..." />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">{bodyText.length} karakter</span>
                    <button onClick={saveBodyText} className="text-xs text-[#1b2a4a] font-medium hover:underline">Kaydet</button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">✏️</div>
                  <p className="text-xs">Post metni oluşturmak için araştırmanın tamamlanması gerekiyor</p>
                </div>
              )}
              {bodyText && (
                <div className="mt-3 space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Revizyon talebi</label>
                  <textarea
                    value={writeRevision}
                    onChange={e => setWriteRevision(e.target.value)}
                    rows={2}
                    placeholder="Örn: Daha kısa yaz, hook'u güçlendir, emoji ekle..."
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/50 placeholder-gray-400"
                  />
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleWrite()} disabled={loading || !research}
                  className="flex-1 py-2.5 bg-[#1b2a4a] text-white rounded-lg text-sm font-medium hover:bg-[#142240] disabled:opacity-50 transition-colors">
                  {loading ? loadingMsg : bodyText ? 'Yeniden Yaz' : 'Yaz (Claude)'}
                </button>
                {bodyText && writeRevision.trim() && (
                  <button onClick={() => handleWrite(writeRevision)} disabled={loading || !research}
                    className="px-3 py-2.5 bg-[#c9a84c] text-white rounded-lg text-sm font-medium hover:bg-[#b8953d] disabled:opacity-50 transition-colors whitespace-nowrap">
                    Revize Et
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Design section */}
          {step === 'design' && (
            <div>
              {slides.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Revizyon talebi</label>
                  <textarea
                    value={designRevision}
                    onChange={e => setDesignRevision(e.target.value)}
                    rows={2}
                    placeholder="Örn: Başlığı daha çarpıcı yap, renkleri daha koyu kullan, 4. slayttaki noktaları sadeleştir..."
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/50 placeholder-gray-400"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleDesign()} disabled={loading || !bodyText}
                  className="flex-1 py-2.5 bg-[#1b2a4a] text-white rounded-lg text-sm font-medium hover:bg-[#142240] disabled:opacity-50 transition-colors">
                  {loading ? loadingMsg : slides.length > 0 ? 'Yeniden Tasarla' : 'Slaytları Oluştur'}
                </button>
                {slides.length > 0 && designRevision.trim() && (
                  <button onClick={() => handleDesign(designRevision)} disabled={loading || !bodyText}
                    className="px-3 py-2.5 bg-[#c9a84c] text-white rounded-lg text-sm font-medium hover:bg-[#b8953d] disabled:opacity-50 transition-colors whitespace-nowrap">
                    Revize Et
                  </button>
                )}
              </div>
              {slides.length > 0 && (
                <button onClick={sendToReview}
                  className="w-full mt-2 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                  Onaya Gönder
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center panel — slide preview */}
      <div className={cn(
        'flex-1 bg-gray-50 flex flex-col overflow-hidden',
        mobilePane === 'center' ? 'flex' : 'hidden md:flex'
      )}>
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Önizleme</h3>
          {slides.length > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 text-xs">←</button>
              <span className="text-xs text-gray-500">{currentSlide + 1} / {slides.length}</span>
              <button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                disabled={currentSlide === slides.length - 1}
                className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 text-xs">→</button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto flex items-start justify-center p-8">
          {slides.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden"
              style={{ width: '100%', maxWidth: '640px', aspectRatio: item.format.includes('1080×1080') ? '1/1' : '16/9' }}>
              <iframe
                srcDoc={slides[currentSlide]}
                className="w-full h-full border-0"
                title={`Slide ${currentSlide + 1}`}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-16">
              <div className="text-5xl mb-3">🖼️</div>
              <p className="text-sm">Slaytlar burada görüntülenecek</p>
            </div>
          )}
        </div>

        {/* Slide thumbnails */}
        {slides.length > 1 && (
          <div className="flex gap-2 p-4 bg-white border-t border-gray-100 overflow-x-auto">
            {slides.map((html, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={cn('flex-shrink-0 w-24 aspect-video rounded border-2 overflow-hidden transition-all',
                  currentSlide === i ? 'border-[#1b2a4a]' : 'border-transparent hover:border-gray-300')}>
                <iframe srcDoc={html} className="w-full h-full border-0 scale-50 origin-top-left pointer-events-none"
                  style={{ width: '200%', height: '200%' }} title={`Slide thumb ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right panel — controls */}
      <div className={cn(
        'bg-white border-l border-gray-100 flex flex-col overflow-hidden flex-shrink-0',
        'md:w-64',
        mobilePane === 'right' ? 'flex flex-1 md:flex-none' : 'hidden md:flex'
      )}>
        <div className="px-4 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">İçerik Bilgisi</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
          <div>
            <span className="text-gray-500">Format:</span>
            <div className="font-medium text-gray-800 mt-0.5">{item.format}</div>
          </div>
          <div>
            <span className="text-gray-500">DIKW Seviyesi:</span>
            <div className="font-medium text-gray-800 mt-0.5">{item.dikwLevel}</div>
          </div>
          <div>
            <span className="text-gray-500">Hedef Kitle:</span>
            <div className="font-medium text-gray-800 mt-0.5">{item.targetAudience}</div>
          </div>
          <div>
            <span className="text-gray-500">İçerik Türü:</span>
            <div className="font-medium text-gray-800 mt-0.5">{item.contentType}</div>
          </div>
          <div>
            <span className="text-gray-500">Hashtag&apos;ler:</span>
            <div className="text-[#1b2a4a] mt-0.5 break-words">{item.hashtags}</div>
          </div>

          {/* Compliance quick check */}
          {bodyText && (
            <div className="border-t border-gray-100 pt-3">
              <h4 className="font-semibold text-gray-700 mb-2">Hukuki Uyum</h4>
              <ComplianceQuick text={bodyText} />
            </div>
          )}
        </div>

        {/* Export buttons */}
        {slides.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-2">
            <a href={`/api/export/png?itemId=${item.id}`}
              className="block w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium text-center hover:bg-gray-200">
              PNG İndir (ZIP)
            </a>
            <a href={`/api/export/pdf?itemId=${item.id}`}
              className="block w-full py-2 bg-[#1b2a4a] text-white rounded-lg text-xs font-medium text-center hover:bg-[#142240]">
              PDF İndir
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function ComplianceQuick({ text }: { text: string }) {
  const autoChecks = COMPLIANCE_CHECKS.filter(c => c.auto)
  const results: Record<string, boolean> = {
    avk55: !/(en iyi|lider|türkiye'nin|piyasanın)/i.test(text),
    avk55_super: !/(en iyi|lider|uzman|öncü|en deneyimli)/i.test(text),
    client_name: !/müvekkil.*[A-ZÇĞİÖŞÜ][a-z]/.test(text),
    competitor: !/(rakip|diğer büro|başka avukat)/i.test(text),
  }
  return (
    <div className="space-y-1.5">
      {autoChecks.map(check => (
        <div key={check.id} className="flex items-start gap-1.5">
          <span className={results[check.id] ? 'text-green-500' : 'text-red-500'}>
            {results[check.id] ? '✓' : '✗'}
          </span>
          <span className={cn('leading-tight', results[check.id] ? 'text-gray-600' : 'text-red-600')}>
            {check.label.split('—')[0].trim()}
          </span>
        </div>
      ))}
    </div>
  )
}
