import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'

function requireAdmin(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }
  return null
}

export async function GET() {
  const session = await auth()
  const err = requireAdmin(session)
  if (err) return err

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ users })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  const err = requireAdmin(session)
  if (err) return err

  const { id, role, isActive } = await req.json()
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  })
  return NextResponse.json({ user })
}
