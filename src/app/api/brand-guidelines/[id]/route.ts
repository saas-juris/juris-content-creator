import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import prisma from '@/lib/db'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const asset = await prisma.brandAsset.findUnique({ where: { id } })
    if (!asset) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

    // Delete file from disk
    if (fs.existsSync(asset.path)) {
      fs.unlinkSync(asset.path)
    }

    await prisma.brandAsset.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Silme hatası: ' + String(error) }, { status: 500 })
  }
}
