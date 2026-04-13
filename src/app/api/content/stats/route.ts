import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const items = await prisma.contentItem.findMany({ select: { status: true, dikwLevel: true, weekNumber: true } })

    const byStatus: Record<string, number> = {}
    const byDikw: Record<string, number> = {}
    const byWeekMap: Record<number, { total: number; completed: number }> = {}

    for (const item of items) {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1
      byDikw[item.dikwLevel] = (byDikw[item.dikwLevel] || 0) + 1
      if (!byWeekMap[item.weekNumber]) byWeekMap[item.weekNumber] = { total: 0, completed: 0 }
      byWeekMap[item.weekNumber].total++
      if (['approved','published'].includes(item.status)) byWeekMap[item.weekNumber].completed++
    }

    const byWeek = Object.entries(byWeekMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([week, data]) => ({ week, ...data }))

    return NextResponse.json({ total: items.length, byStatus, byDikw, byWeek })
  } catch {
    return NextResponse.json({ error: 'İstatistik hatası' }, { status: 500 })
  }
}
