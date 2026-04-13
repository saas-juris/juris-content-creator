'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate, cn } from '@/lib/utils'
import { STATUS_CONFIG, DIKW_CONFIG } from '@/lib/brand.config'

type ContentItem = {
  id: string; date: string; dayOfWeek: string; weekTheme: string
  contentType: string; dikwLevel: string; title: string; format: string
  status: string; researchText?: string; bodyText?: string
}

export default function CreatorPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const statuses = ['planned','researching','drafted','designed','review','approved']
  const filtered = items.filter(i => !filterStatus || i.status === filterStatus)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1b2a4a]">İçerik Üretimi</h1>
          <p className="text-gray-500 mt-1 text-sm">AI araştırma, metin yazımı ve görsel tasarım</p>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="">Tüm Durumlar</option>
          {statuses.map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-5xl mb-4">✏️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">İçerik bulunamadı</h3>
          <p className="text-gray-500 text-sm">Önce planlama modülünden içerik ekleyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const statusCfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]
            const dikwCfg = DIKW_CONFIG[item.dikwLevel as keyof typeof DIKW_CONFIG]
            const progress = item.bodyText ? 3 : item.researchText ? 2 : 1
            return (
              <Link key={item.id} href={`/creator/${item.id}`}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                style={{ borderLeft: '3px solid #c8102e' }}>
                <div className="flex items-start justify-between mb-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusCfg?.color)}>
                    {statusCfg?.label}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#1b2a4a] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{item.weekTheme}</p>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: dikwCfg?.bg, color: dikwCfg?.color }}>
                    {item.dikwLevel}
                  </span>
                  <span className="text-xs text-gray-400">{item.format}</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 flex gap-1">
                  {[1,2,3].map(step => (
                    <div key={step} className={cn('h-1 flex-1 rounded-full',
                      step <= progress ? 'bg-[#1b2a4a]' : 'bg-gray-200')} />
                  ))}
                </div>
                <div className="flex gap-2 mt-1">
                  {['Araştır','Yaz','Tasarla'].map((label, i) => (
                    <span key={label} className={cn('text-xs flex-1 text-center',
                      i < progress ? 'text-[#1b2a4a] font-medium' : 'text-gray-300')}>
                      {label}
                    </span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
