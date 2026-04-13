export const JURIS_BRAND = {
  colors: {
    lacivert:  '#1b2a4a',
    kirmizi:   '#c8102e',
    beyaz:     '#ffffff',
    gri_acik:  '#f5f5f5',
    gri_koyu:  '#4a4a4a',
    altin:     '#c9a84c',
  },
  typography: {
    heading: '"Playfair Display", Georgia, serif',
    body:    '"DM Sans", "Segoe UI", sans-serif',
    mono:    '"JetBrains Mono", monospace',
  },
  logo: {
    full:      '/brand-assets/juris-full.png',
    icon:      '/brand-assets/juris-icon.jpg',
    icon_text: '/brand-assets/juris-icon-text.jpg',
    dark_bg:   '/brand-assets/juris-dark.jpg',
  },
  social: {
    linkedin_handle: 'juris-avukatlik-ortakligi',
    hashtag_always:  '#Juris',
  },
} as const

export const LINKEDIN_FORMATS = {
  'Post (1080×1080)': {
    width: 1080,
    height: 1080,
    slides: 1,
    exportAs: 'png' as const,
    description: 'Tek görsel post — kare format',
  },
  'Carousel (4 sayfa)': {
    width: 1920,
    height: 1080,
    slides: 4,
    exportAs: 'pdf' as const,
    description: 'Landscape carousel — document post olarak yüklenir',
  },
  'Carousel (6 sayfa)': {
    width: 1920,
    height: 1080,
    slides: 6,
    exportAs: 'pdf' as const,
    description: 'Genişletilmiş carousel — derinlemesine içerik',
  },
} as const

export type FormatKey = keyof typeof LINKEDIN_FORMATS
export type FormatSpec = (typeof LINKEDIN_FORMATS)[FormatKey]

export const CONTENT_TYPES = {
  'Veri Paylaşımı':  { funnel: 'TOFU', dikw: 'Veri',    color: '#3b82f6' },
  'Bilgi Paylaşımı': { funnel: 'MOFU', dikw: 'Bilgi',   color: '#8b5cf6' },
  'Carousel':        { funnel: 'MOFU', dikw: 'Bilgi',   color: '#f59e0b' },
  'Vaka Çalışması':  { funnel: 'BOFU', dikw: 'Bilgi',   color: '#10b981' },
  'Wisdom':          { funnel: 'BOFU', dikw: 'Bilgelik', color: '#c9a84c' },
} as const

export const STATUS_CONFIG = {
  planned:     { label: 'Planlı',       color: 'bg-gray-100 text-gray-700' },
  researching: { label: 'Araştırılıyor', color: 'bg-blue-100 text-blue-700' },
  drafted:     { label: 'Taslak',       color: 'bg-indigo-100 text-indigo-700' },
  designed:    { label: 'Tasarım',      color: 'bg-purple-100 text-purple-700' },
  review:      { label: 'Onay Bekliyor', color: 'bg-amber-100 text-amber-700' },
  revision:    { label: 'Revizyon',     color: 'bg-orange-100 text-orange-700' },
  approved:    { label: 'Onaylandı',    color: 'bg-emerald-100 text-emerald-700' },
  published:   { label: 'Yayında',      color: 'bg-green-100 text-green-700' },
  rejected:    { label: 'Reddedildi',   color: 'bg-red-100 text-red-700' },
} as const

export const DIKW_CONFIG = {
  'Veri':     { color: '#3b82f6', bg: '#eff6ff', label: 'Veri (Data)' },
  'Bilgi':    { color: '#8b5cf6', bg: '#f5f3ff', label: 'Bilgi (Information)' },
  'Bilgelik': { color: '#c9a84c', bg: '#fef9ee', label: 'Bilgelik (Wisdom)' },
} as const

export const COMPLIANCE_CHECKS = [
  { id: 'avk55',          label: 'Avukatlık Kanunu m.55 — Reklam yasağına uygunluk',          auto: true  },
  { id: 'avk55_super',    label: '"En iyi", "lider", "uzman" gibi süperlatif ifade yok',       auto: true  },
  { id: 'client_name',    label: 'Müvekkil adı/bilgisi paylaşılmamış',                         auto: true  },
  { id: 'competitor',     label: 'Rakip avukat/büro hakkında yorum yok',                       auto: true  },
  { id: 'source_cited',   label: 'Tüm hukuki iddialar kaynaklı',                               auto: false },
  { id: 'data_verified',  label: 'İstatistikler doğrulanmış ve tarihli',                       auto: false },
  { id: 'brand_ok',       label: 'Kurumsal kimlik uyumu kontrol edildi',                       auto: false },
  { id: 'hashtag_ok',     label: "Hashtag'ler uygun ve güncel",                                auto: false },
] as const
