'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type User = {
  id: string; email: string; name: string; role: string; isActive: boolean; createdAt: string
}
type InviteToken = {
  id: string; email: string; role: string; expiresAt: string; usedAt: string | null; createdAt: string
}

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', EDITOR: 'Editör', REVIEWER: 'Denetçi' }
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-[#1b2a4a] text-white',
  EDITOR: 'bg-blue-100 text-blue-700',
  REVIEWER: 'bg-amber-100 text-amber-700',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<InviteToken[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('EDITOR')
  const [inviteUrl, setInviteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [uRes, iRes] = await Promise.all([
      fetch('/api/users'),
      fetch('/api/invite'),
    ])
    const uData = await uRes.json()
    const iData = await iRes.json()
    if (uData.users) setUsers(uData.users)
    if (iData.tokens) setInvites(iData.tokens)
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setInviteUrl('')
    setLoading(true)
    const res = await fetch('/api/invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.inviteUrl) {
      setInviteUrl(data.inviteUrl)
      setInviteEmail('')
      loadData()
    } else {
      setError(data.error || 'Hata')
    }
  }

  async function toggleUserActive(user: User) {
    await fetch('/api/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
    })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
  }

  async function changeRole(user: User, role: string) {
    await fetch('/api/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, role }),
    })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role } : u))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1b2a4a]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          Kullanıcı Yönetimi
        </h1>
        <p className="text-sm text-gray-500 mt-1">Ekip üyelerini davet edin ve yetki seviyelerini yönetin</p>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 rounded-full bg-[#c9a84c]" />
          <h2 className="font-semibold text-gray-800">Yeni Kullanıcı Davet Et</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 ml-3">Davet linki 7 gün geçerlidir. Tek kullanımlıktır.</p>

        <form onSubmit={sendInvite} className="flex gap-3 flex-wrap">
          <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            placeholder="isim@juris.av.tr" required
            className="flex-1 min-w-48 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30" />
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
            className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/30">
            <option value="EDITOR">Editör</option>
            <option value="REVIEWER">Denetçi</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" disabled={loading}
            className="h-10 px-5 bg-[#1b2a4a] text-white rounded-lg text-sm font-medium hover:bg-[#142240] disabled:opacity-60 transition-colors">
            {loading ? 'Oluşturuluyor...' : 'Davet Oluştur'}
          </button>
        </form>

        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

        {inviteUrl && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-medium text-green-700 mb-1.5">✓ Davet oluşturuldu! Bu linki kopyalayın:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-white border border-green-200 rounded px-2 py-1.5 text-gray-700 break-all">{inviteUrl}</code>
              <button onClick={() => navigator.clipboard.writeText(inviteUrl)}
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded font-medium hover:bg-green-700 whitespace-nowrap">
                Kopyala
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Aktif Kullanıcılar ({users.length})</h2>
        </div>
        {users.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Henüz kullanıcı yok</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map(user => (
              <div key={user.id} className="px-6 py-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#1b2a4a]/10 flex items-center justify-center text-sm font-bold text-[#1b2a4a] flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                {/* Role selector */}
                <select value={user.role} onChange={e => changeRole(user, e.target.value)}
                  className={cn('text-xs px-2.5 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none', ROLE_COLORS[user.role])}>
                  <option value="ADMIN">Admin</option>
                  <option value="EDITOR">Editör</option>
                  <option value="REVIEWER">Denetçi</option>
                </select>
                {/* Active toggle */}
                <button onClick={() => toggleUserActive(user)}
                  className={cn('text-xs px-3 py-1 rounded-full font-medium transition-colors',
                    user.isActive ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600' : 'bg-red-50 text-red-500 hover:bg-green-50 hover:text-green-600'
                  )}>
                  {user.isActive ? 'Aktif' : 'Pasif'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending invites */}
      {invites.filter(i => !i.usedAt && new Date(i.expiresAt) > new Date()).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Bekleyen Davetler</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {invites.filter(i => !i.usedAt && new Date(i.expiresAt) > new Date()).map(invite => (
              <div key={invite.id} className="px-6 py-3 flex items-center gap-4 text-sm">
                <div className="flex-1">
                  <span className="text-gray-700">{invite.email}</span>
                  <span className={cn('ml-2 text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[invite.role])}>
                    {ROLE_LABELS[invite.role]}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(invite.expiresAt).toLocaleDateString('tr-TR')} son gün
                </span>
                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Bekliyor</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
