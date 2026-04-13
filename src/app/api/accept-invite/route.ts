import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'

// GET — validate token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token gerekli' }, { status: 400 })

  const invite = await prisma.inviteToken.findUnique({ where: { token } })
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş davet' }, { status: 400 })
  }
  return NextResponse.json({ email: invite.email, role: invite.role })
}

// POST — accept invite and create user
export async function POST(req: NextRequest) {
  try {
    const { token, name, password } = await req.json()
    if (!token || !name?.trim() || !password) {
      return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Şifre en az 8 karakter olmalı' }, { status: 400 })
    }

    const invite = await prisma.inviteToken.findUnique({ where: { token } })
    if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş davet' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: invite.email } })
    if (existing) return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.create({
        data: {
          email: invite.email,
          name: name.trim(),
          passwordHash,
          role: invite.role,
        },
      }),
      prisma.inviteToken.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
