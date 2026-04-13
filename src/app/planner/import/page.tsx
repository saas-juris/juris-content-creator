'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

type PreviewItem = {
  date: string; dayOfWeek: string; weekTheme: string
  contentType: string; dikwLevel: string; title: string
  subtitle?: string; format: string; status?: string
}

export default function ImportPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<PreviewItem[] | null>(null)
  const [planTitle, setPlanTitle] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fileName, setFileName] = useState('')

  async function handleFile(file: File) {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrors(['Sadece .xlsx ve .xls dosyaları desteklenir'])
      return
    }
    setLoading(true)
    setFileName(file.name)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/import/excel', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) { setErrors([data.error]); return }
      setPreview(data.items)
      setPlanTitle(data.planTitle)
      setErrors(data.errors || [])
    } catch (e) {
      setErrors(['Dosya işlenirken hata oluştu'])
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!preview) return
    setSaving(true)
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: planTitle, items: preview, importedFrom: fileName }),
      })
      const data = await res.json()
      if (data.error) { setErrors([data.error]); return }
      router.push('/planner')
    } catch {
      setErrors(['Kayıt sırasında hata oluştu'])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1b2a4a]">Excel İçe Aktar</h1>
        <p className="text-gray-500 mt-1 text-sm">Juris LinkedIn İçerik Planı dosyasını yükleyin</p>
      </div>

      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-xl p-16 text-center transition-colors cursor-pointer ${
            dragging ? 'border-[#c8102e] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          {loading ? (
            <div className="text-gray-500">
              <div className="text-4xl mb-3">⏳</div>
              <p className="font-medium">Dosya işleniyor...</p>
            </div>
          ) : (
            <>
              <div className="text-5xl mb-4">📊</div>
              <p className="text-lg font-semibold text-gray-700 mb-2">Excel dosyasını sürükleyin veya tıklayın</p>
              <p className="text-sm text-gray-400">.xlsx ve .xls formatları desteklenir</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Plan title */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Başlığı</label>
            <input
              value={planTitle}
              onChange={e => setPlanTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b2a4a]/20"
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-semibold text-amber-800 mb-2">Uyarılar ({errors.length})</h3>
              {errors.map((e, i) => <p key={i} className="text-sm text-amber-700">{e}</p>)}
            </div>
          )}

          {/* Preview table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{preview.length} içerik bulundu</h3>
              <span className="text-sm text-gray-500">{fileName}</span>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    {['Tarih','Gün','Tema','Tür','DIKW','Başlık','Format'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((item, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{item.date ? formatDate(item.date) : '-'}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{item.dayOfWeek}</td>
                      <td className="px-3 py-2 text-xs text-gray-600 max-w-28 truncate">{item.weekTheme}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{item.contentType}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{item.dikwLevel}</td>
                      <td className="px-3 py-2 font-medium text-gray-900 max-w-48 truncate">{item.title}</td>
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{item.format}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#1b2a4a] text-white rounded-lg text-sm font-medium hover:bg-[#142240] transition-colors disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : `${preview.length} İçeriği Kaydet`}
            </button>
            <button
              onClick={() => { setPreview(null); setErrors([]); setFileName('') }}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
