import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', db: 'connected', ts: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ status: 'error', db: 'disconnected', error: String(error) }, { status: 503 })
  }
}
