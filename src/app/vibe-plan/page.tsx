'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ChatMessage, Proposal } from '@/app/api/ai/vibe-plan/route'

type ProposalWithState = Proposal & { id: string; saved: boolean; saving: boolean }

const STARTER_PROMPTS = [
  'Bu ay KVKK ve veri gizliliği üzerine 4 içerik planla',
  'Şirket birleşmeleri konusunda C-suite hedefli carousel serisi öner',
  'Mayıs ayı için karma konulu haftalık içerik takvimi oluştur',
  'İş hukuku alanında SME hedefli bilgilendirici postlar öner',
]

export default function VibePlanPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [proposals, setProposals] = useState<ProposalWithState[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mobileTab, setMobileTab] = useState<'chat' | 'proposals'>('chat')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: ChatMessage = { role: 'user', content }
    const nextMessages: ChatMessage[] = [...messages, userMsg]

    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/vibe-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const data = await res.json()

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Hata: ${data.error}` }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])

        if (data.proposals?.length) {
          const newProposals: ProposalWithState[] = data.proposals.map(
            (p: Proposal, i: number) => ({
              ...p,
              id: `${Date.now()}-${i}`,
              saved: false,
              saving: false,
            })
          )
          setProposals(prev => [...prev, ...newProposals])
          // Switch to proposals tab on mobile
          if (window.innerWidth < 768) setMobileTab('proposals')
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Bağlantı hatası. Lütfen tekrar deneyin.' },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  async function saveProposal(id: string) {
    const proposal = proposals.find(p => p.id === id)
    if (!proposal || proposal.saved || proposal.saving) return

    setProposals(prev => prev.map(p => p.id === id ? { ...p, saving: true } : p))

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal),
      })
      if (res.ok) {
        setProposals(prev => prev.map(p => p.id === id ? { ...p, saved: true, saving: false } : p))
      } else {
        setProposals(prev => prev.map(p => p.id === id ? { ...p, saving: false } : p))
      }
    } catch {
      setProposals(prev => prev.map(p => p.id === id ? { ...p, saving: false } : p))
    }
  }

  const savedCount = proposals.filter(p => p.saved).length

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <h1 className="page-title text-xl md:text-2xl">Vibe Content Planner</h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Claude ile sohbet ederek içerik planı oluştur</p>
        </div>
        <div className="flex items-center gap-3">
          {savedCount > 0 && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              {savedCount} içerik eklendi
            </span>
          )}
          <Link href="/planner" className="btn-primary text-xs py-1.5">
            Planlamaya Git →
          </Link>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex border-b border-gray-200 bg-white flex-shrink-0">
        {[
          { key: 'chat', label: 'Sohbet' },
          {
            key: 'proposals',
            label: `Öneriler${proposals.length ? ` (${proposals.length})` : ''}`,
          },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setMobileTab(tab.key as typeof mobileTab)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors',
              mobileTab === tab.key
                ? 'border-[#1b2a4a] text-[#1b2a4a]'
                : 'border-transparent text-gray-500'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Chat panel ── */}
        <div className={cn(
          'flex flex-col bg-[#f7f7f8] flex-1 min-w-0',
          mobileTab === 'proposals' ? 'hidden md:flex' : 'flex'
        )}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 scrollbar-thin">
            {/* Welcome */}
            {messages.length === 0 && (
              <div className="max-w-xl mx-auto text-center pt-8 md:pt-16">
                <div className="w-14 h-14 rounded-2xl bg-[#1b2a4a] flex items-center justify-center mx-auto mb-4">
                  <SparkleIcon white />
                </div>
                <h2 className="text-lg font-semibold text-[#1b2a4a] mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                  İçerik stratejinizi birlikte planlayalım
                </h2>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Hedef kitlenizi, konularınızı ve tarih aralığını paylaşın. Claude size özel içerik önerileri sunsun.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {STARTER_PROMPTS.map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => send(prompt)}
                      className="card p-3 text-sm text-gray-700 hover:border-[#1b2a4a]/30 hover:bg-gray-50 transition-all text-left leading-snug"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1b2a4a] flex items-center justify-center mt-0.5">
                    <SparkleIcon white small />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-[#1b2a4a] text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm'
                  )}
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mt-0.5 text-xs font-bold text-gray-600">
                    S
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1b2a4a] flex items-center justify-center">
                  <SparkleIcon white small />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-4 md:px-8 py-4 bg-white border-t border-gray-100">
            <div className="max-w-3xl mx-auto flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Mesajınızı yazın... (Enter ile gönder, Shift+Enter yeni satır)"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1b2a4a]/40 bg-white placeholder:text-gray-400 leading-relaxed max-h-32 overflow-y-auto"
                style={{ minHeight: '42px' }}
                onInput={e => {
                  const t = e.currentTarget
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px'
                }}
                disabled={loading}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1b2a4a] text-white flex items-center justify-center hover:bg-[#243660] disabled:opacity-40 transition-colors"
                aria-label="Gönder"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>

        {/* ── Proposals panel ── */}
        <div className={cn(
          'bg-white border-l border-gray-100 flex flex-col',
          'md:w-80 lg:w-96 md:flex flex-shrink-0',
          mobileTab === 'proposals' ? 'flex flex-1' : 'hidden md:flex'
        )}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-[#1b2a4a]">İçerik Önerileri</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {proposals.length === 0 ? 'Henüz öneri yok' : `${proposals.length} öneri — ${savedCount} eklendi`}
              </p>
            </div>
            {proposals.length > 0 && (
              <button
                onClick={() => {
                  const unsaved = proposals.filter(p => !p.saved)
                  unsaved.forEach(p => saveProposal(p.id))
                }}
                disabled={proposals.every(p => p.saved)}
                className="text-xs text-[#c8102e] font-medium hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Tümünü Ekle
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {proposals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <SparkleIcon />
                </div>
                <p className="text-sm">Claude ile sohbet edin,</p>
                <p className="text-sm">öneriler burada belirecek</p>
              </div>
            ) : (
              proposals.map(proposal => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onSave={() => saveProposal(proposal.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProposalCard({
  proposal,
  onSave,
}: {
  proposal: ProposalWithState
  onSave: () => void
}) {
  const dikwColors: Record<string, string> = {
    'Veri': '#3b82f6',
    'Bilgi': '#8b5cf6',
    'Bilgelik': '#c9a84c',
  }
  const color = dikwColors[proposal.dikwLevel] || '#9ca3af'

  return (
    <div
      className={cn(
        'card p-3 transition-all',
        proposal.saved ? 'opacity-60 bg-emerald-50/50 border-emerald-200' : ''
      )}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {proposal.title}
          </div>
          {proposal.subtitle && (
            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{proposal.subtitle}</div>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-1 mb-2">
        <Tag color={color}>{proposal.dikwLevel}</Tag>
        <Tag>{proposal.format.split(' ')[0]}</Tag>
        <Tag>{proposal.funnelStage}</Tag>
      </div>

      {/* Details */}
      <div className="text-xs text-gray-500 space-y-0.5 mb-3">
        {proposal.weekTheme && (
          <div className="truncate">
            <span className="text-gray-400">Tema:</span> {proposal.weekTheme}
          </div>
        )}
        {proposal.date && (
          <div>
            <span className="text-gray-400">Tarih:</span>{' '}
            {new Date(proposal.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {proposal.dayOfWeek ? ` — ${proposal.dayOfWeek}` : ''}
          </div>
        )}
        {proposal.targetAudience && (
          <div className="truncate">
            <span className="text-gray-400">Kitle:</span> {proposal.targetAudience}
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={proposal.saved || proposal.saving}
        className={cn(
          'w-full py-1.5 rounded-lg text-xs font-medium transition-colors',
          proposal.saved
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
            : proposal.saving
            ? 'bg-gray-100 text-gray-500 cursor-wait'
            : 'bg-[#1b2a4a] text-white hover:bg-[#243660]'
        )}
      >
        {proposal.saved ? '✓ Planlamaya Eklendi' : proposal.saving ? 'Ekleniyor...' : 'Planlamaya Ekle'}
      </button>
    </div>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={
        color
          ? { background: color + '15', color }
          : { background: '#f3f4f6', color: '#6b7280' }
      }
    >
      {children}
    </span>
  )
}

function SparkleIcon({ white, small }: { white?: boolean; small?: boolean }) {
  const size = small ? 12 : 16
  const stroke = white ? 'white' : '#c9a84c'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" fill={white ? 'rgba(255,255,255,0.3)' : 'rgba(201,168,76,0.15)'} />
      <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z" />
      <path d="M5 18l.5 1.5L7 20l-1.5.5L5 22l-.5-1.5L3 20l1.5-.5L5 18z" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
