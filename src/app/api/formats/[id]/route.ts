import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, icon, category, description, designLanguage, scope, dimensions, isActive, sortOrder } = body

    const format = await prisma.contentFormat.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(icon !== undefined && { icon: icon.trim() }),
        ...(category !== undefined && { category: category.trim() }),
        ...(description !== undefined && { description }),
        ...(designLanguage !== undefined && { designLanguage }),
        ...(scope !== undefined && { scope }),
        ...(dimensions !== undefined && { dimensions }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })
    return NextResponse.json({ format })
  } catch (error) {
    return NextResponse.json({ error: 'Güncelleme hatası: ' + String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.contentFormat.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Silme hatası: ' + String(error) }, { status: 500 })
  }
}
