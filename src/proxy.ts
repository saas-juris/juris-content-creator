import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/accept-invite', '/api/auth']

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p))
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  if (isPublic(pathname)) return NextResponse.next()
  if (!req.auth?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/serve-asset).*)'],
}
