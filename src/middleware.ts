import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/accept-invite',
  '/api/auth',
]

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p))
}

export default auth(async function middleware(req: NextRequest & { auth?: { user?: unknown } }) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (isPublic(pathname)) return NextResponse.next()

  // Check auth
  const session = (req as unknown as { auth?: { user?: unknown } }).auth
  if (!session?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/serve-asset).*)',
  ],
}
