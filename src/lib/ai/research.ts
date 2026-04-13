import Anthropic from '@anthropic-ai/sdk'
import { RESEARCH_SYSTEM_PROMPT } from './prompts'
import { getApiKey } from './get-api-key'

export interface ResearchResult {
  research_text: string
  key_points: string[]
  legal_sources: Array<{ code: string; article: string; description: string }>
  statistics: Array<{ value: string; context: string; source: string; date: string }>
  pull_quote: string
}

export async function researchContent(item: {
  title: string
  subtitle?: string | null
  topic: string
  dikwLevel: string
  targetAudience: string
  format: string
  contentType: string
}, revisionNote?: string): Promise<ResearchResult> {
  const apiKey = await getApiKey()
  const client = new Anthropic({ apiKey })

  const revisionSection = revisionNote?.trim()
    ? `\n\nREVİZYON TALEBİ: ${revisionNote.trim()}\nLütfen yukarıdaki revizyon talebini dikkate alarak araştırmayı yeniden yap.`
    : ''

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    system: RESEARCH_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Araştırma konusu: "${item.title}"
Alt başlık: "${item.subtitle || ''}"
Konu/Tema: ${item.topic}
DIKW Seviyesi: ${item.dikwLevel}
Hedef Kitle: ${item.targetAudience}
Format: ${item.format}
İçerik Türü: ${item.contentType}

Bu konu hakkında kapsamlı bir araştırma metni üret. Türk mevzuatı referanslarını ve güncel verileri dahil et.${revisionSection}`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ResearchResult
    }
  } catch {
    // fall through to default
  }

  return {
    research_text: text,
    key_points: [],
    legal_sources: [],
    statistics: [],
    pull_quote: '',
  }
}
