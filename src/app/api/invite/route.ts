import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    }
    const tokens = await prisma.inviteToken.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ tokens })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    }

    const { email, role } = await req.json()
    if (!email?.trim()) return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 })

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 })

    // Create or refresh invite
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.inviteToken.deleteMany({ where: { email, usedAt: null } })
    const invite = await prisma.inviteToken.create({
      data: { token, email: email.trim(), role: role || 'EDITOR', expiresAt },
    })

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const inviteUrl = `${appUrl}/accept-invite?token=${invite.token}`

    return NextResponse.json({ invite, inviteUrl })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
