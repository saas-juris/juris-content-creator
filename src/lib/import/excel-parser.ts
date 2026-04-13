import * as XLSX from 'xlsx'

export interface ParsedContentItem {
  date: Date
  dayOfWeek: string
  weekNumber: number
  weekTheme: string
  contentType: string
  dikwLevel: string
  title: string
  subtitle: string
  topic: string
  targetAudience: string
  format: string
  hashtags: string
  funnelStage: string
  status: string
}

function parseTurkishDate(dateVal: unknown): Date | null {
  if (!dateVal) return null
  if (dateVal instanceof Date) return dateVal

  if (typeof dateVal === 'number') {
    // Excel serial date
    const epoch = new Date(1900, 0, 1)
    epoch.setDate(epoch.getDate() + dateVal - 2)
    return epoch
  }

  if (typeof dateVal === 'string') {
    // Try DD.MM.YYYY or DD/MM/YYYY
    const match = dateVal.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/)
    if (match) {
      return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]))
    }
  }

  return null
}

function detectFunnelStage(contentType: string, dikwLevel: string): string {
  const ct = contentType?.toLowerCase() || ''
  if (ct.includes('veri')) return 'TOFU'
  if (ct.includes('vaka') || ct.includes('wisdom')) return 'BOFU'
  return 'MOFU'
}

function isWeekHeader(row: unknown[]): boolean {
  const firstCell = String(row[0] || row[1] || '')
  return /🔵|🟢|Hafta|HAFTA/.test(firstCell)
}

function extractWeekTheme(row: unknown[]): string {
  for (const cell of row) {
    const s = String(cell || '')
    if (s.length > 5 && !/^[0-9]+$/.test(s)) {
      return s.replace(/🔵|🟢/g, '').trim()
    }
  }
  return ''
}

export function parseExcelFile(buffer: ArrayBuffer): {
  planTitle: string
  items: ParsedContentItem[]
  errors: string[]
} {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const errors: string[] = []
  const items: ParsedContentItem[] = []

  // Extract plan title from sheet names
  const sheetNames = workbook.SheetNames
  const planTitle = sheetNames
    .filter(n => !n.includes('Özet') && !n.includes('ozet'))
    .join(' – ')

  let weekNumber = 0
  let weekTheme = ''

  for (const sheetName of sheetNames) {
    if (sheetName.toLowerCase().includes('özet') || sheetName.toLowerCase().includes('ozet')) {
      continue
    }

    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      raw: false,
    })

    // Find header row to map column indices
    let headerRowIdx = -1
    const colMap: Record<string, number> = {}

    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const row = rows[i] as string[]
      const rowStr = row.join('|').toLowerCase()
      if (rowStr.includes('tarih') || rowStr.includes('başlık') || rowStr.includes('baslik')) {
        headerRowIdx = i
        row.forEach((cell, idx) => {
          const c = String(cell).toLowerCase()
          if (c.includes('tarih')) colMap.date = idx
          else if (c.includes('gün') || c.includes('gun')) colMap.day = idx
          else if (c.includes('tür') && c.includes('içerik')) colMap.contentType = idx
          else if (c.includes('dikw')) colMap.dikw = idx
          else if (c.includes('başlık') && !c.includes('alt')) colMap.title = idx
          else if (c.includes('alt başlık') || c.includes('alt baslik')) colMap.subtitle = idx
          else if (c.includes('konu') || c.includes('tema')) colMap.topic = idx
          else if (c.includes('hedef')) colMap.audience = idx
          else if (c.includes('format')) colMap.format = idx
          else if (c.includes('hashtag')) colMap.hashtags = idx
          else if (c.includes('durum')) colMap.status = idx
        })
        break
      }
    }

    // If no header found, use positional defaults
    if (headerRowIdx === -1) {
      colMap.date = 0; colMap.day = 1; colMap.contentType = 2; colMap.dikw = 3
      colMap.title = 4; colMap.subtitle = 5; colMap.topic = 6; colMap.audience = 7
      colMap.format = 8; colMap.hashtags = 9; colMap.status = 10
      headerRowIdx = 0
    }

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i] as unknown[]
      if (!row || row.every(c => !c)) continue

      // Detect week header rows
      if (isWeekHeader(row)) {
        weekNumber++
        weekTheme = extractWeekTheme(row)
        continue
      }

      const dateVal = row[colMap.date ?? 0]
      const parsedDate = parseTurkishDate(dateVal)
      if (!parsedDate) continue

      const contentType = String(row[colMap.contentType ?? 2] || '').trim()
      const dikwLevel = String(row[colMap.dikw ?? 3] || '').trim()
      const title = String(row[colMap.title ?? 4] || '').trim()
      if (!title) continue

      items.push({
        date: parsedDate,
        dayOfWeek: String(row[colMap.day ?? 1] || '').trim(),
        weekNumber,
        weekTheme,
        contentType: contentType || 'Bilgi Paylaşımı',
        dikwLevel: dikwLevel || 'Bilgi',
        title,
        subtitle: String(row[colMap.subtitle ?? 5] || '').trim(),
        topic: String(row[colMap.topic ?? 6] || '').trim(),
        targetAudience: String(row[colMap.audience ?? 7] || '').trim(),
        format: String(row[colMap.format ?? 8] || 'Post (1080×1080)').trim(),
        hashtags: String(row[colMap.hashtags ?? 9] || '').trim(),
        funnelStage: detectFunnelStage(contentType, dikwLevel),
        status: String(row[colMap.status ?? 10] || 'planned').trim(),
      })
    }
  }

  return { planTitle, items, errors }
}
