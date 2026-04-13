import { NextRequest, NextResponse } from 'next/server'
import { parseExcelFile } from '@/lib/import/excel-parser'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const { planTitle, items, errors } = parseExcelFile(buffer)

    return NextResponse.json({ planTitle, items, errors })
  } catch (error) {
    console.error('Excel parse error:', error)
    return NextResponse.json({ error: 'Dosya işlenirken hata oluştu' }, { status: 500 })
  }
}
