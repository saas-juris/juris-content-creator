'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/vibe-plan',
    label: 'Vibe Plan',
    badge: 'AI',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z" />
        <path d="M5 18l.5 1.5L7 20l-1.5.5L5 22l-.5-1.5L3 20l1.5-.5L5 18z" />
      </svg>
    ),
  },
  {
    href: '/planner',
    label: 'Planlama',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/formats',
    label: 'İçerik Formatları',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/creator',
    label: 'Üretim',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    href: '/review',
    label: 'Denetim',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Rapor',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

const bottomItems = [
  {
    href: '/settings',
    label: 'Ayarlar',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    href: '/planner/mevzuat',
    label: 'Mevzuat',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
  {
    href: '/settings/users',
    label: 'Kullanıcılar',
    adminOnly: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    href: '/settings/brand',
    label: 'Marka',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role
  const isAdmin = userRole === 'ADMIN'

  return (
    <aside className="flex flex-col w-60 h-full bg-[#1b2a4a] text-white">
      {/* Brand header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10 flex items-center justify-between">
        <div>
          {/* Logo: try to load image, fall back to styled text */}
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/api/serve-asset/Juris%20Brand%20Assets/juris-beyaz-01.png"
              alt="Juris"
              className="h-7 w-auto object-contain"
              onError={e => {
                const target = e.currentTarget
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'block'
              }}
            />
            <span
              className="text-white text-xl font-semibold hidden italic"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              juris
            </span>
          </div>
          <div className="text-[10px] text-white/40 mt-1 tracking-widest uppercase">
            Content Engine
          </div>
        </div>

        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-white/50 hover:text-white p-1 rounded transition-colors"
            aria-label="Menüyü kapat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-[10px] text-white/25 uppercase tracking-widest px-3 pb-2 pt-1">
          Modüller
        </div>
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-white/12 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              )}
            >
              <span className={cn('flex-shrink-0 transition-colors', active ? 'text-white' : 'text-white/50')}>
                {item.icon}
              </span>
              <span className="tracking-wide flex-1">{item.label}</span>
              {'badge' in item && item.badge && !active && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#c9a84c]/20 text-[#c9a84c] tracking-wider">
                  {item.badge}
                </span>
              )}
              {active && (
                <span className="w-1 h-1 rounded-full bg-[#c9a84c]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/8" />

      {/* Bottom nav */}
      <div className="px-3 py-3 space-y-0.5">
        <div className="text-[10px] text-white/25 uppercase tracking-widest px-3 pb-2 pt-1">
          Sistem
        </div>
        {bottomItems.map(item => {
          if ('adminOnly' in item && item.adminOnly && !isAdmin) return null
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                active
                  ? 'bg-white/12 text-white'
                  : 'text-white/45 hover:bg-white/8 hover:text-white/80'
              )}
            >
              <span className={cn('flex-shrink-0', active ? 'text-white/80' : 'text-white/35')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* User info + Signout */}
      {session?.user && (
        <div className="px-3 py-3 border-t border-white/8">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-xs font-bold text-[#c9a84c] flex-shrink-0">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/80 truncate">{session.user.name}</div>
              <div className="text-[10px] text-white/30 truncate">{userRole}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Çıkış Yap"
              className="text-white/25 hover:text-white/70 p-1 rounded transition-colors flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
