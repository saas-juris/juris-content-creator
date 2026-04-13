import type { Metadata } from 'next'
import { LayoutWrapper } from '@/components/layout/LayoutWrapper'
import { SessionProvider } from '@/components/providers/SessionProvider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Juris Content Engine',
  description: 'Juris Avukatlık Ortaklığı — LinkedIn İçerik Yönetim Sistemi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[#f7f7f8] overflow-hidden">
        <SessionProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </SessionProvider>
      </body>
    </html>
  )
}
