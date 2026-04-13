'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { STATUS_CONFIG, DIKW_CONFIG } from '@/lib/brand.config'

type Stats = {
  total: number
  byStatus: Record<string, number>
  byDikw: Record<string, number>
  byWeek: Array<{ week: string; total: number; completed: number }>
  recentlyApproved: Array<{ id: string; title: string; date: string; format: string }>
}

const STATUS_COLORS: Record<string, string> = {
  planned: '#9ca3af', researching: '#3b82f6', drafted: '#6366f1',
  designed: '#8b5cf6', review: '#f59e0b', approved: '#10b981',
  published: '#059669', rejected: '#ef4444', revision: '#f97316',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/content/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Yükleniyor...
      </div>
    )
  }
  if (!stats) return null

  const completed = (stats.byStatus.approved || 0) + (stats.byStatus.published || 0)
  const pct = stats.total > 0 ? Math.round((completed / stats.total) * 100) : 0

  const statusData = Object.entries(stats.byStatus)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: STATUS_CONFIG[k as keyof typeof STATUS_CONFIG]?.label || k,
      value: v,
      color: STATUS_COLORS[k] || '#9ca3af',
    }))

  const dikwData = Object.entries(stats.byDikw).map(([k, v]) => ({
    name: k,
    count: v,
    fill: DIKW_CONFIG[k as keyof typeof DIKW_CONFIG]?.color || '#9ca3af',
  }))

  const kpis = [
    { label: 'Toplam İçerik', value: stats.total, color: '#1b2a4a', bg: '#f0f3f9' },
    { label: 'Tamamlanan', value: completed, color: '#10b981', bg: '#f0fdf4' },
    { label: 'Onay Bekleyen', value: stats.byStatus.review || 0, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Yayında', value: stats.byStatus.published || 0, color: '#059669', bg: '#ecfdf5' },
  ]

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="page-title">Rapor Paneli</h1>
        <p className="text-gray-500 mt-1 text-sm">İçerik planı yürütme takibi</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {kpis.map(kpi => (
          <div
            key={kpi.label}
            className="card p-4 md:p-5"
            style={{ background: kpi.bg, borderColor: 'transparent' }}
          >
            <div className="text-2xl md:text-3xl font-bold" style={{ color: kpi.color, fontFamily: '"DM Sans", sans-serif' }}>
              {kpi.value}
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1 font-medium">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Progress ring */}
        <div className="card p-5 md:p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 self-start">Plan İlerlemesi</h3>
          <ProgressRing pct={pct} />
          <div className="text-center mt-4">
            <div className="text-xl font-bold text-[#1b2a4a]">{completed} / {stats.total}</div>
            <div className="text-xs text-gray-500 mt-0.5">içerik tamamlandı</div>
          </div>
        </div>

        {/* Status pie */}
        <div className="card p-5 md:p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Durum Dağılımı</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={65}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={9}
              >
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* DIKW bar */}
        <div className="card p-5 md:p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">DIKW Dağılımı</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dikwData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="count" name="İçerik" radius={[3, 3, 0, 0]}>
                {dikwData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly progress */}
      {stats.byWeek.length > 0 && (
        <div className="card p-5 md:p-6 mb-4 md:mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Haftalık İlerleme</h3>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(stats.byWeek.length, 8)}, minmax(0, 1fr))` }}
          >
            {stats.byWeek.map(w => {
              const prog = w.total > 0 ? w.completed / w.total : 0
              const bg = prog > 0.7 ? '#10b981' : prog > 0.3 ? '#f59e0b' : '#e5e7eb'
              const textColor = prog > 0.3 ? 'white' : '#9ca3af'
              return (
                <div key={w.week} className="text-center">
                  <div
                    className="w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold mb-1"
                    style={{ background: bg, color: textColor }}
                  >
                    {w.completed}/{w.total}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">H{w.week}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* LinkedIn metrics placeholder */}
      <div className="card p-5 md:p-6 border-dashed border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">LinkedIn Performans Metrikleri</h3>
        <p className="text-xs text-gray-400 mb-4">API entegrasyonu gelecek sürümde aktif edilecek</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Gösterim', 'Beğeni', 'Yorum', 'Tıklama'].map(m => (
            <div key={m} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-gray-300">—</div>
              <div className="text-xs text-gray-400 mt-1">{m}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 54
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke="#1b2a4a"
        strokeWidth="10"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* Gold accent arc for last 10% */}
      <text x="70" y="66" textAnchor="middle" fill="#1b2a4a" fontSize="26" fontWeight="700"
        style={{ fontFamily: '"DM Sans", sans-serif' }}>
        {pct}%
      </text>
      <text x="70" y="84" textAnchor="middle" fill="#9ca3af" fontSize="11">
        tamamlandı
      </text>
    </svg>
  )
}
