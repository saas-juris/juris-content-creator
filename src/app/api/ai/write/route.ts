import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { writeContent } from '@/lib/ai/writer'
import type { ResearchResult } from '@/lib/ai/research'

export async function POST(req: NextRequest) {
  try {
    const { itemId, revisionNote } = await req.json()
    const item = await prisma.contentItem.findUnique({ where: { id: itemId } })
    if (!item) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
    if (!item.researchText) return NextResponse.json({ error: 'Önce araştırma yapın' }, { status: 400 })

    let research: ResearchResult
    try {
      research = JSON.parse(item.researchText)
    } catch {
      research = { research_text: item.researchText, key_points: [], legal_sources: [], statistics: [], pull_quote: '' }
    }

    const bodyText = await writeContent(item, research, revisionNote || undefined)

    await prisma.contentItem.update({ where: { id: itemId }, data: { bodyText, status: 'drafted' } })

    return NextResponse.json({ bodyText })
  } catch (error) {
    return NextResponse.json({ error: 'Yazım hatası: ' + String(error) }, { status: 500 })
  }
}
