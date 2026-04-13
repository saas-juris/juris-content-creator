import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import fs from 'node:fs'
import { getStorageDir } from '@/lib/storage'

const MIME: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params
  const filePath = path.join(getStorageDir('brand-assets'), ...segments)
  if (!fs.existsSync(filePath)) return new NextResponse('Not found', { status: 404 })
  const ext = filePath.split('.').pop()?.toLowerCase() || 'png'
  const contentType = MIME[ext] || 'application/octet-stream'
  const buf = fs.readFileSync(filePath)
  return new NextResponse(buf, { headers: { 'Content-Type': contentType } })
}
