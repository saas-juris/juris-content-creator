import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import fs from 'node:fs'
import prisma from '@/lib/db'
import { getStorageDir } from '@/lib/storage'
import { generateSlides } from '@/lib/ai/writer'
import { buildSlidesHtml, buildPostSquareHtml } from '@/lib/export/templates'
import { renderAllSlides } from '@/lib/export/renderer'
import { LINKEDIN_FORMATS } from '@/lib/brand.config'
import type { ResearchResult } from '@/lib/ai/research'

// POST — generate slides and render PNGs
export async function POST(req: NextRequest) {
  try {
    const { itemId, revisionNote } = await req.json()
    const item = await prisma.contentItem.findUnique({ where: { id: itemId } })
    if (!item) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

    let research: ResearchResult = { research_text: '', key_points: [], legal_sources: [], statistics: [], pull_quote: '' }
    if (item.researchText) {
      try { research = JSON.parse(item.researchText) } catch {}
    }

    // Load brand guideline notes (if any) to inform slide generation
    let guidelineNotes: string | undefined
    try {
      const noteSetting = await prisma.setting.findUnique({ where: { key: 'brand_guideline_notes' } })
      guidelineNotes = noteSetting?.value || undefined
    } catch { /* non-fatal */ }

    // Generate slide data via AI
    const slideData = await generateSlides(item, research, guidelineNotes, revisionNote || undefined)

    const formatKey = Object.keys(LINKEDIN_FORMATS).find(k => item.format.includes(k.split(' ')[0])) || 'Post (1080×1080)'
    const fmt = LINKEDIN_FORMATS[formatKey as keyof typeof LINKEDIN_FORMATS]

    // Build HTML strings
    let slidesHtml: string[]
    if (item.format.includes('Post')) {
      slidesHtml = [buildPostSquareHtml({
        title: item.title, subtitle: item.subtitle || undefined,
        pullQuote: research.pull_quote, weekTheme: item.weekTheme, hashtags: item.hashtags,
      })]
    } else {
      slidesHtml = buildSlidesHtml(slideData, { width: fmt.width, height: fmt.height, weekTheme: item.weekTheme, hashtags: item.hashtags })
    }

    // Render PNGs
    const pngBuffers = await renderAllSlides(slidesHtml, fmt)

    // Save to filesystem
    const contentDir = getStorageDir('content', itemId, 'slides')
    fs.mkdirSync(contentDir, { recursive: true })
    const pngPaths: string[] = []
    for (let i = 0; i < pngBuffers.length; i++) {
      const filePath = path.join(contentDir, `slide-${i + 1}.png`)
      fs.writeFileSync(filePath, pngBuffers[i])
      pngPaths.push(filePath)
    }

    await prisma.contentItem.update({
      where: { id: itemId },
      data: {
        slidesHtml: JSON.stringify(slidesHtml),
        slidesPngPaths: JSON.stringify(pngPaths),
        status: 'designed',
      },
    })

    return NextResponse.json({ slidesHtml, pngPaths })
  } catch (error) {
    console.error('Export PNG error:', error)
    return NextResponse.json({ error: 'Dışa aktarma hatası: ' + String(error) }, { status: 500 })
  }
}

// GET — download PNG zip
export async function GET(req: NextRequest) {
  const itemId = req.nextUrl.searchParams.get('itemId')
  if (!itemId) return NextResponse.json({ error: 'itemId gerekli' }, { status: 400 })

  const item = await prisma.contentItem.findUnique({ where: { id: itemId } })
  if (!item?.slidesPngPaths) return NextResponse.json({ error: 'PNG bulunamadı' }, { status: 404 })

  const paths: string[] = JSON.parse(item.slidesPngPaths)
  if (paths.length === 1) {
    const buf = fs.readFileSync(paths[0])
    return new NextResponse(buf, {
      headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="slide-1.png"` },
    })
  }

  // Return first PNG for now (ZIP requires additional package)
  const buf = fs.readFileSync(paths[0])
  return new NextResponse(buf, {
    headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="slide-1.png"` },
  })
}
