import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  try {
    const items = await prisma.contentItem.findMany({
      where: status ? { status } : undefined,
      orderBy: { date: 'asc' },
    })
    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    if (!data.title) return NextResponse.json({ error: 'Başlık gerekli' }, { status: 400 })

    // Find or create the "Vibe Plan" content plan
    let plan = await prisma.contentPlan.findFirst({ where: { title: 'Vibe Plan' } })
    if (!plan) {
      plan = await prisma.contentPlan.create({ data: { title: 'Vibe Plan' } })
    }

    const date = data.date ? new Date(data.date) : new Date()

    const item = await prisma.contentItem.create({
      data: {
        planId: plan.id,
        date,
        dayOfWeek:      data.dayOfWeek      || 'Pazartesi',
        weekNumber:     data.weekNumber      ?? getISOWeek(date),
        weekTheme:      data.weekTheme       || '',
        contentType:    data.contentType     || 'Bilgi Paylaşımı',
        dikwLevel:      data.dikwLevel       || 'Bilgi',
        title:          data.title,
        subtitle:       data.subtitle        || null,
        topic:          data.topic           || data.title,
        targetAudience: data.targetAudience  || 'Genel',
        format:         data.format          || 'Post (1080×1080)',
        hashtags:       data.hashtags        || '#Juris',
        funnelStage:    data.funnelStage     || 'MOFU',
        status:         'planned',
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Oluşturma hatası: ' + String(error) }, { status: 500 })
  }
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
