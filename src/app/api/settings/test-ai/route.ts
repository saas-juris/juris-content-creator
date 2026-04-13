import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getApiKey } from '@/lib/ai/get-api-key'

export async function GET() {
  try {
    const apiKey = await getApiKey()
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'ping' }],
    })
    return NextResponse.json({ ok: true, model: response.model })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) })
  }
}
