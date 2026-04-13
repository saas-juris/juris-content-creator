import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const formats = await prisma.contentFormat.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json({ formats })
  } catch (error) {
    return NextResponse.json({ error: 'Listeleme hatası: ' + String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, icon, category, description, designLanguage, scope, dimensions, isActive, sortOrder } = body
    if (!name?.trim()) return NextResponse.json({ error: 'İsim gerekli' }, { status: 400 })

    const format = await prisma.contentFormat.create({
      data: {
        name: name.trim(),
        icon: icon?.trim() || '📄',
        category: category?.trim() || 'Dijital',
        description: description?.trim() || '',
        designLanguage: designLanguage?.trim() || '',
        scope: scope?.trim() || '',
        dimensions: dimensions?.trim() || '',
        isActive: isActive !== false,
        sortOrder: sortOrder ?? 0,
      },
    })
    return NextResponse.json({ format })
  } catch (error) {
    return NextResponse.json({ error: 'Oluşturma hatası: ' + String(error) }, { status: 500 })
  }
}
