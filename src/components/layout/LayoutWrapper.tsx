'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

const PUBLIC_PATHS = ['/login', '/accept-invite']

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Public pages render without sidebar
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return <>{children}</>
  }

  return (
    <div className="flex h-full">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static on desktop */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex-shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#1b2a4a] border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Menüyü aç"
            className="text-white/80 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            <HamburgerIcon />
          </button>
          <span
            className="text-white font-semibold text-sm tracking-wide"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            juris
          </span>
          <span className="text-white/40 text-xs">Content Engine</span>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
