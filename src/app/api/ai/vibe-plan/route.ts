import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { VIBE_PLAN_SYSTEM_PROMPT } from '@/lib/ai/prompts'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export type Proposal = {
  title: string
  subtitle?: string
  topic: string
  weekTheme: string
  contentType: string
  dikwLevel: string
  format: string
  targetAudience: string
  hashtags: string
  funnelStage: string
  date: string
  dayOfWeek: string
  weekNumber: number
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] }
    if (!messages?.length) {
      return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        reply: 'API anahtarı henüz tanımlanmamış. Lütfen `.env.local` dosyasına `ANTHROPIC_API_KEY` ekleyin.',
        proposals: [],
      })
    }

    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      system: VIBE_PLAN_SYSTEM_PROMPT,
      messages,
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extract <proposals>...</proposals> block
    const proposalMatch = raw.match(/<proposals>([\s\S]*?)<\/proposals>/)
    let proposals: Proposal[] = []
    let reply = raw

    if (proposalMatch) {
      try {
        proposals = JSON.parse(proposalMatch[1].trim())
      } catch {
        // ignore parse error — return raw reply without proposals
      }
      reply = raw.replace(/<proposals>[\s\S]*?<\/proposals>/, '').trim()
    }

    return NextResponse.json({ reply, proposals })
  } catch (error) {
    console.error('Vibe plan error:', error)
    return NextResponse.json(
      { error: 'AI hatası: ' + String(error) },
      { status: 500 }
    )
  }
}
