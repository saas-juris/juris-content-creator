import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { researchContent } from '@/lib/ai/research'

export async function POST(req: NextRequest) {
  try {
    const { itemId, revisionNote } = await req.json()
    if (!itemId) return NextResponse.json({ error: 'itemId gerekli' }, { status: 400 })

    const item = await prisma.contentItem.findUnique({ where: { id: itemId } })
    if (!item) return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 })

    await prisma.contentItem.update({ where: { id: itemId }, data: { status: 'researching' } })

    const research = await researchContent(item, revisionNote || undefined)

    await prisma.contentItem.update({
      where: { id: itemId },
      data: {
        researchText: JSON.stringify(research),
        legalSources: JSON.stringify(research.legal_sources),
        status: 'drafted',
      },
    })

    return NextResponse.json({ research })
  } catch (error) {
    console.error('Research error:', error)
    return NextResponse.json({ error: 'Araştırma hatası: ' + String(error) }, { status: 500 })
  }
}
