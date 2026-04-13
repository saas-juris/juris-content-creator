import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'

const API_KEY_SETTING = 'ANTHROPIC_API_KEY'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const setting = await prisma.setting.findUnique({ where: { key: API_KEY_SETTING } })
    const raw = setting?.value || ''
    const masked = raw ? raw.slice(0, 12) + '...' + raw.slice(-4) : ''
    return NextResponse.json({ ANTHROPIC_API_KEY: masked, hasKey: !!raw })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz — sadece Admin değiştirebilir' }, { status: 403 })
    }

    const body = await req.json()
    if (body.ANTHROPIC_API_KEY) {
      await prisma.setting.upsert({
        where: { key: API_KEY_SETTING },
        update: { value: body.ANTHROPIC_API_KEY },
        create: { key: API_KEY_SETTING, value: body.ANTHROPIC_API_KEY },
      })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
