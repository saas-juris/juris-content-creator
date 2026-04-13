import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const sources = await prisma.legalSource.findMany({ orderBy: { type: 'asc' } })
    return NextResponse.json({ sources })
  } catch {
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const source = await prisma.legalSource.create({
      data: {
        code: body.code,
        title: body.title,
        shortDesc: body.shortDesc,
        type: body.type,
        url: body.url || null,
      },
    })
    return NextResponse.json({ source })
  } catch {
    return NextResponse.json({ error: 'Kayıt hatası' }, { status: 500 })
  }
}
