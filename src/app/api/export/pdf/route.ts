import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import fs from 'node:fs'
import prisma from '@/lib/db'
import { getStorageDir } from '@/lib/storage'
import { renderAllSlides, buildPdf } from '@/lib/export/renderer'
import { LINKEDIN_FORMATS } from '@/lib/brand.config'

export async function GET(req: NextRequest) {
  const itemId = req.nextUrl.searchParams.get('itemId')
  if (!itemId) return NextResponse.json({ error: 'itemId gerekli' }, { status: 400 })

  try {
    const item = await prisma.contentItem.findUnique({ where: { id: itemId } })
    if (!item?.slidesHtml) return NextResponse.json({ error: 'Slaytlar bulunamadı' }, { status: 404 })

    const slidesHtml: string[] = JSON.parse(item.slidesHtml)
    const formatKey = Object.keys(LINKEDIN_FORMATS).find(k => item.format.includes(k.split(' ')[0])) || 'Post (1080×1080)'
    const fmt = LINKEDIN_FORMATS[formatKey as keyof typeof LINKEDIN_FORMATS]

    const pngBuffers = await renderAllSlides(slidesHtml, fmt)
    const pdfBuffer = await buildPdf(pngBuffers, fmt)

    // Save PDF (also serves as cache; on Railway this goes to the Volume)
    const exportDir = getStorageDir('content', itemId, 'export')
    fs.writeFileSync(path.join(exportDir, 'carousel.pdf'), pdfBuffer)

    const safeName = item.title.slice(0, 30).replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '_')
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'PDF hatası: ' + String(error) }, { status: 500 })
  }
}
