'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate, formatDateShort, cn } from '@/lib/utils'
import { STATUS_CONFIG, DIKW_CONFIG } from '@/lib/brand.config'

type ContentItem = {
  id: string; date: string; dayOfWeek: string; weekNumber: number; weekTheme: string
  contentType: string; dikwLevel: string; title: string; subtitle?: string
  format: string; hashtags: string; status: string; funnelStage: string
}

type ViewMode = 'list' | 'kanban'

const STATUSES = ['planned','researching','drafted','designed','review','revision','approved','published','rejected']

export default function PlannerPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [view, setView] = useState<ViewMode>('list')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterTheme, setFilterTheme] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const themes = [...new Set(items.map(i => i.weekTheme).filter(Boolean))]

  const filtered = items.filter(i =>
    (!filterStatus || i.status === filterStatus) &&
    (!filterTheme || i.weekTheme === filterTheme)
  )

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/content/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  return (
    <div className="p-4 md:p-8 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="page-title">İçerik Planı</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {items.length} içerik — {filtered.length} gösteriliyor
          </p>
        </div>
        <Link
          href="/planner/import"
          className="btn-danger self-start sm:self-auto"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Excel İçe Aktar
        </Link>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-5">
        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
          {(['list','kanban'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                view === v ? 'bg-[#1b2a4a] text-white' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {v === 'list' ? 'Liste' : 'Kanban'}
            </button>
          ))}
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30"
        >
          <option value="">Tüm Durumlar</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
            </option>
          ))}
        </select>

        <select
          value={filterTheme}
          onChange={e => setFilterTheme(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30"
        >
          <option value="">Tüm Temalar</option>
          {themes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Yükleniyor...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : view === 'list' ? (
        <ListView items={filtered} onStatusChange={updateStatus} />
      ) : (
        <KanbanView items={filtered} onStatusChange={updateStatus} />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">Henüz içerik planı yok</h3>
      <p className="text-gray-500 text-sm mb-5">Excel dosyanızı içe aktararak başlayın</p>
      <Link href="/planner/import" className="btn-danger">
        Excel İçe Aktar
      </Link>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', cfg?.color || 'bg-gray-100 text-gray-600')}>
      {cfg?.label || status}
    </span>
  )
}

function DikwBadge({ level }: { level: string }) {
  const cfg = DIKW_CONFIG[level as keyof typeof DIKW_CONFIG]
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: cfg?.bg || '#f5f5f5', color: cfg?.color || '#666' }}
    >
      {level}
    </span>
  )
}

function ListView({ items, onStatusChange }: { items: ContentItem[]; onStatusChange: (id: string, s: string) => void }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Tarih</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Başlık</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Tema</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Format</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">DIKW</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Durum</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={cn(
                  'border-b border-gray-50 hover:bg-gray-50/60 transition-colors',
                  idx % 2 !== 0 ? 'bg-gray-50/20' : ''
                )}
              >
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  <div className="text-sm">{formatDateShort(item.date)}</div>
                  <div className="text-xs text-gray-400">{item.dayOfWeek}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.subtitle}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs max-w-32">
                  <span className="line-clamp-2">{item.weekTheme}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{item.format}</td>
                <td className="px-4 py-3"><DikwBadge level={item.dikwLevel} /></td>
                <td className="px-4 py-3">
                  <select
                    value={item.status}
                    onChange={e => onStatusChange(item.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/creator/${item.id}`}
                    className="text-xs text-[#c8102e] hover:text-[#a50d25] font-medium transition-colors"
                  >
                    Üret →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {items.map(item => (
          <div key={item.id} className="card p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm line-clamp-2">{item.title}</div>
                {item.subtitle && (
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.subtitle}</div>
                )}
              </div>
              <Link
                href={`/creator/${item.id}`}
                className="flex-shrink-0 text-xs text-[#c8102e] font-semibold"
              >
                Üret →
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">{formatDateShort(item.date)}</span>
              <DikwBadge level={item.dikwLevel} />
              <StatusBadge status={item.status} />
            </div>
            {item.weekTheme && (
              <div className="text-xs text-gray-500 mt-1.5 line-clamp-1">{item.weekTheme}</div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

function KanbanView({ items, onStatusChange }: { items: ContentItem[]; onStatusChange: (id: string, s: string) => void }) {
  const columns = ['planned', 'drafted', 'review', 'approved', 'published']
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
      {columns.map(col => {
        const colItems = items.filter(i => i.status === col)
        const cfg = STATUS_CONFIG[col as keyof typeof STATUS_CONFIG]
        return (
          <div key={col} className="flex-shrink-0 w-60">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', cfg?.color || 'bg-gray-100')}>
                {cfg?.label || col}
              </span>
              <span className="text-xs text-gray-400 font-medium">{colItems.length}</span>
            </div>
            <div className="space-y-2">
              {colItems.map(item => (
                <div
                  key={item.id}
                  className="card p-3 hover:shadow-md transition-shadow"
                  style={{ borderLeft: '3px solid #c8102e' }}
                >
                  <div className="text-xs text-gray-400 mb-1">{formatDateShort(item.date)}</div>
                  <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 leading-snug">
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between">
                    <DikwBadge level={item.dikwLevel} />
                    <Link href={`/creator/${item.id}`} className="text-xs text-[#c8102e] font-semibold">→</Link>
                  </div>
                </div>
              ))}
              {colItems.length === 0 && (
                <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                  Boş
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
