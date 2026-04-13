import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

const KEY = 'brand_guideline_notes'

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: KEY } })
    return NextResponse.json({ notes: setting?.value || '' })
  } catch {
    return NextResponse.json({ notes: '' })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json()
    await prisma.setting.upsert({
      where: { key: KEY },
      update: { value: notes ?? '' },
      create: { key: KEY, value: notes ?? '' },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt hatası: ' + String(error) }, { status: 500 })
  }
}
