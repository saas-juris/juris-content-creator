import Anthropic from '@anthropic-ai/sdk'
import type { ResearchResult } from './research'
import { WRITER_SYSTEM_PROMPT } from './prompts'
import { getApiKey } from './get-api-key'

export async function writeContent(
  item: { title: string; subtitle?: string | null; targetAudience: string; hashtags: string },
  research: ResearchResult,
  revisionNote?: string
): Promise<string> {
  const apiKey = await getApiKey()
  const client = new Anthropic({ apiKey })

  const revisionSection = revisionNote?.trim()
    ? `\n\nREVİZYON TALEBİ: ${revisionNote.trim()}\nLütfen bu revizyonu uygulayarak metni yeniden yaz.`
    : ''

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    system: WRITER_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Araştırma metni:\n${research.research_text}\n\nBaşlık: ${item.title}\nAlt Başlık: ${item.subtitle || ''}\nHedef Kitle: ${item.targetAudience}\nHashtag önerileri: ${item.hashtags}\n\nLinkedIn post metni yaz.${revisionSection}`,
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export interface SlideData {
  type: 'cover' | 'content' | 'sources'
  title?: string
  subtitle?: string
  pull_quote?: string
  section_number?: number
  section_title?: string
  bullet_points?: string[]
  sources?: string[]
}

export async function generateSlides(
  item: { title: string; subtitle?: string | null; format: string; hashtags: string },
  research: ResearchResult,
  guidelineNotes?: string,
  revisionNote?: string
): Promise<SlideData[]> {
  const apiKey = await getApiKey()
  const client = new Anthropic({ apiKey })

  const slideCount = item.format.includes('6') ? 6 : item.format.includes('4') ? 4 : 1
  const contentSlides = slideCount - 2 // minus cover and sources

  const guidelineSection = guidelineNotes?.trim()
    ? `\nMARKA REHBERİ TASARIM NOTLARI (bu notlara göre başlık, alt başlık ve alıntı metinlerini kurgula):\n${guidelineNotes}\n`
    : ''

  const revisionSection = revisionNote?.trim()
    ? `\nREVİZYON TALEBİ: ${revisionNote.trim()}\nLütfen bu revizyonu slayt içeriklerine uygula.\n`
    : ''

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 3000,
    system: `Sen LinkedIn carousel slayt içerikleri üretiyorsun. JSON formatında yanıt ver, başka hiçbir şey ekleme.`,
    messages: [{
      role: 'user',
      content: `Başlık: ${item.title}
Alt başlık: ${item.subtitle || ''}
Hashtag'ler: ${item.hashtags}
Toplam slayt: ${slideCount} (1 kapak + ${contentSlides} içerik + 1 kaynakça)
${guidelineSection}${revisionSection}
Araştırma:
${research.research_text.slice(0, 2000)}

Anahtar noktalar:
${research.key_points.join('\n')}

Mevzuat kaynakları:
${research.legal_sources.map(s => `${s.code} ${s.article}: ${s.description}`).join('\n')}

Şu JSON formatında ${slideCount} slayt üret:
{
  "slides": [
    {"type":"cover","title":"...","subtitle":"...","pull_quote":"..."},
    {"type":"content","section_number":1,"section_title":"...","bullet_points":["..."],"pull_quote":"..."},
    {"type":"sources","sources":["..."]}
  ]
}`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return parsed.slides as SlideData[]
    }
  } catch {
    // fall through
  }

  // Fallback minimal slides
  return [
    { type: 'cover', title: item.title, subtitle: item.subtitle || '', pull_quote: research.pull_quote },
    { type: 'sources', sources: research.legal_sources.map(s => `${s.code} ${s.article}: ${s.description}`) },
  ]
}
