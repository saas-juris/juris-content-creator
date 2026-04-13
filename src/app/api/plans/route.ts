import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const plans = await prisma.contentPlan.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ plans })
  } catch {
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, items, importedFrom } = await req.json()
    const plan = await prisma.contentPlan.create({
      data: {
        title: title || 'İçerik Planı',
        importedFrom,
        items: {
          create: items.map((item: Record<string, unknown>) => ({
            date: new Date(item.date as string),
            dayOfWeek: String(item.dayOfWeek || ''),
            weekNumber: Number(item.weekNumber || 0),
            weekTheme: String(item.weekTheme || ''),
            contentType: String(item.contentType || 'Bilgi Paylaşımı'),
            dikwLevel: String(item.dikwLevel || 'Bilgi'),
            title: String(item.title || ''),
            subtitle: item.subtitle ? String(item.subtitle) : null,
            topic: String(item.topic || ''),
            targetAudience: String(item.targetAudience || ''),
            format: String(item.format || 'Post (1080×1080)'),
            hashtags: String(item.hashtags || '#Juris'),
            funnelStage: String(item.funnelStage || 'MOFU'),
            status: 'planned',
          })),
        },
      },
      include: { _count: { select: { items: true } } },
    })
    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Plan create error:', error)
    return NextResponse.json({ error: 'Plan oluşturma hatası' }, { status: 500 })
  }
}
