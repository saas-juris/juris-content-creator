import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import fs from 'node:fs'
import prisma from '@/lib/db'
import { getStorageDir } from '@/lib/storage'

const getGuidelinesDir = () => getStorageDir('brand-guidelines')

export async function GET() {
  try {
    const assets = await prisma.brandAsset.findMany({
      where: { category: 'guideline' },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ guidelines: assets })
  } catch {
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Yalnızca PDF dosyaları kabul edilir' }, { status: 400 })
    }

    const guidelinesDir = getGuidelinesDir()

    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._\-]/g, '_')}`
    const filePath = path.join(guidelinesDir, safeFilename)
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    const asset = await prisma.brandAsset.create({
      data: {
        name: file.name.replace(/\.pdf$/i, ''),
        filename: safeFilename,
        category: 'guideline',
        path: filePath,
      },
    })

    return NextResponse.json({ guideline: asset }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Yükleme hatası: ' + String(error) }, { status: 500 })
  }
}
