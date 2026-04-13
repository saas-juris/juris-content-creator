import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const item = await prisma.contentItem.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
    return NextResponse.json({ item })
  } catch {
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const item = await prisma.contentItem.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.bodyText !== undefined && { bodyText: body.bodyText }),
        ...(body.researchText !== undefined && { researchText: body.researchText }),
        ...(body.legalSources !== undefined && { legalSources: body.legalSources }),
        ...(body.slidesHtml !== undefined && { slidesHtml: body.slidesHtml }),
        ...(body.slidesPngPaths !== undefined && { slidesPngPaths: body.slidesPngPaths }),
        ...(body.reviewNotes !== undefined && { reviewNotes: body.reviewNotes }),
        ...(body.approvedBy !== undefined && { approvedBy: body.approvedBy }),
        ...(body.approvedAt !== undefined && { approvedAt: new Date(body.approvedAt) }),
        ...(body.publishedAt !== undefined && { publishedAt: new Date(body.publishedAt) }),
        ...(body.bufferSent !== undefined && { bufferSent: body.bufferSent }),
      },
    })
    return NextResponse.json({ item })
  } catch {
    return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.contentItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Silme hatası' }, { status: 500 })
  }
}
