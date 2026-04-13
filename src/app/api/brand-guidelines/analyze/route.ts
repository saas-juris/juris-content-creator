import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import Anthropic, { toFile } from '@anthropic-ai/sdk'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY tanımlı değil' }, { status: 400 })
    }

    const asset = await prisma.brandAsset.findUnique({ where: { id } })
    if (!asset) return NextResponse.json({ error: 'Doküman bulunamadı' }, { status: 404 })
    if (!fs.existsSync(asset.path)) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 })
    }

    const client = new Anthropic({ apiKey })

    // Upload via Files API to avoid 413 errors with large PDFs
    const pdfBuffer = fs.readFileSync(asset.path)
    const uploadedFile = await client.beta.files.upload({
      file: await toFile(pdfBuffer, asset.filename, { type: 'application/pdf' }),
    }, {
      headers: { 'anthropic-beta': 'files-api-2025-04-14' },
    })

    let notes = ''
    try {
      const response = await client.beta.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'file', file_id: uploadedFile.id },
            } as never,
            {
              type: 'text',
              text: `Bu marka rehberi dokümanını analiz et ve tasarımcılar için özlü tasarım notları çıkar.

Şunları kapsa:
- Renk paleti (hex kodları varsa)
- Tipografi kuralları (font aileleri, boyutlar, ağırlıklar)
- Logo kullanım kuralları (beyaz alan, min boyut, yasaklı kullanımlar)
- Kompozisyon & düzen prensipleri
- Görsel ton ve atmosfer
- Kaçınılması gereken unsurlar

Tasarım notlarını Türkçe, madde madde yaz. Her madde kısa ve aksiyon odaklı olsun. Başka hiçbir açıklama ekleme.`,
            },
          ],
        }],
        betas: ['files-api-2025-04-14'],
      } as never)

      notes = (response as { content: Array<{ type: string; text?: string }> }).content[0].type === 'text'
        ? ((response as { content: Array<{ type: string; text?: string }> }).content[0].text ?? '')
        : ''
    } finally {
      // Clean up uploaded file
      try {
        await client.beta.files.delete(uploadedFile.id, {
          headers: { 'anthropic-beta': 'files-api-2025-04-14' },
        } as never)
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Guideline analyze error:', error)
    return NextResponse.json({ error: 'Analiz hatası: ' + String(error) }, { status: 500 })
  }
}
