import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import fs from 'node:fs'
import prisma from '@/lib/db'
import { getStorageDir } from '@/lib/storage'

const getBrandDir = () => getStorageDir('brand-assets')

export async function GET() {
  try {
    const assets = await prisma.brandAsset.findMany({ orderBy: { createdAt: 'asc' } })
    return NextResponse.json({ assets })
  } catch {
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'external-logo'
    if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })

    const ext = file.name.split('.').pop() || 'png'
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const brandDir = getBrandDir()
    const subDir = category === 'external-logo' ? path.join(brandDir, 'external') : brandDir
    fs.mkdirSync(subDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(path.join(subDir, filename), buffer)

    const relativePath = category === 'external-logo' ? `/brand-assets/external/${filename}` : `/brand-assets/${filename}`

    const asset = await prisma.brandAsset.create({
      data: {
        name: file.name.replace(`.${ext}`, ''),
        filename,
        category,
        path: relativePath,
      },
    })

    return NextResponse.json({ asset })
  } catch (error) {
    return NextResponse.json({ error: 'Yükleme hatası: ' + String(error) }, { status: 500 })
  }
}
