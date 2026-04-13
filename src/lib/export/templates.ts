import type { SlideData } from '../ai/writer'
import { JURIS_BRAND } from '../brand.config'

const { lacivert, kirmizi, beyaz, gri_acik, gri_koyu, altin } = JURIS_BRAND.colors

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', 'Segoe UI', sans-serif; overflow: hidden; }
  h1,h2,h3 { font-family: 'Playfair Display', Georgia, serif; }
`

export function buildCarouselCoverHtml(slide: SlideData, opts: {
  width: number; height: number; pageNum: number; totalPages: number
  weekTheme?: string; hashtags?: string
}): string {
  const { width, height, pageNum, totalPages, weekTheme, hashtags } = opts
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
${BASE_CSS}
body {
  width: ${width}px; height: ${height}px;
  background: ${lacivert};
  display: flex; flex-direction: column;
  padding: ${height * 0.06}px ${width * 0.06}px;
  position: relative;
}
.logo-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${height * 0.04}px;
}
.logo-text {
  font-family: 'Playfair Display', serif;
  color: ${beyaz}; font-size: ${height * 0.032}px; font-weight: 700;
  letter-spacing: 2px;
}
.logo-sub {
  color: rgba(255,255,255,0.5); font-size: ${height * 0.018}px; letter-spacing: 1px;
}
.theme-badge {
  background: rgba(200,16,46,0.2); border: 1px solid ${kirmizi};
  color: ${beyaz}; font-size: ${height * 0.018}px; padding: 6px 14px;
  border-radius: 20px; letter-spacing: 0.5px;
}
.main-content {
  flex: 1; display: flex; flex-direction: column; justify-content: center;
}
.accent-line {
  width: ${width * 0.06}px; height: 4px; background: ${kirmizi};
  margin-bottom: ${height * 0.025}px;
}
.title {
  color: ${beyaz};
  font-size: ${height * 0.07}px;
  font-weight: 700; line-height: 1.15;
  margin-bottom: ${height * 0.025}px;
  max-width: 85%;
}
.subtitle {
  color: rgba(255,255,255,0.7);
  font-size: ${height * 0.028}px;
  line-height: 1.5; max-width: 70%;
  margin-bottom: ${height * 0.035}px;
}
.pull-quote {
  border-left: 3px solid ${altin};
  padding-left: ${width * 0.02}px;
  color: ${altin};
  font-size: ${height * 0.024}px;
  font-style: italic; max-width: 65%;
}
.footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: ${height * 0.025}px;
  border-top: 1px solid rgba(255,255,255,0.15);
}
.hashtags { color: rgba(255,255,255,0.5); font-size: ${height * 0.018}px; }
.page-num { color: rgba(255,255,255,0.4); font-size: ${height * 0.018}px; }
</style>
</head><body>
<div class="logo-bar">
  <div>
    <div class="logo-text">JURIS</div>
    <div class="logo-sub">Avukatlık Ortaklığı</div>
  </div>
  ${weekTheme ? `<div class="theme-badge">${weekTheme}</div>` : ''}
</div>
<div class="main-content">
  <div class="accent-line"></div>
  <div class="title">${slide.title || ''}</div>
  ${slide.subtitle ? `<div class="subtitle">${slide.subtitle}</div>` : ''}
  ${slide.pull_quote ? `<div class="pull-quote">${slide.pull_quote}</div>` : ''}
</div>
<div class="footer">
  <div class="hashtags">${hashtags || ''}</div>
  <div class="page-num">${pageNum} / ${totalPages}</div>
</div>
</body></html>`
}

export function buildCarouselContentHtml(slide: SlideData, opts: {
  width: number; height: number; pageNum: number; totalPages: number
}): string {
  const { width, height, pageNum, totalPages } = opts
  const bullets = slide.bullet_points || []
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
${BASE_CSS}
body {
  width: ${width}px; height: ${height}px;
  background: ${gri_acik};
  display: flex;
  overflow: hidden;
}
.left-stripe {
  width: ${width * 0.012}px; background: ${kirmizi};
  flex-shrink: 0;
}
.content {
  flex: 1; padding: ${height * 0.07}px ${width * 0.06}px;
  display: flex; flex-direction: column;
}
.section-num {
  font-size: ${height * 0.085}px; font-weight: 700;
  color: rgba(27,42,74,0.1);
  font-family: 'Playfair Display', serif;
  line-height: 1; margin-bottom: -${height * 0.02}px;
}
.section-title {
  color: ${lacivert};
  font-size: ${height * 0.042}px; font-weight: 700;
  margin-bottom: ${height * 0.02}px;
}
.red-line {
  width: ${width * 0.05}px; height: 3px;
  background: ${kirmizi}; margin-bottom: ${height * 0.035}px;
}
.bullets { flex: 1; }
.bullet {
  display: flex; align-items: flex-start;
  gap: ${width * 0.015}px;
  margin-bottom: ${height * 0.022}px;
}
.bullet-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: ${kirmizi}; flex-shrink: 0;
  margin-top: ${height * 0.009}px;
}
.bullet-text {
  color: ${gri_koyu};
  font-size: ${height * 0.026}px;
  line-height: 1.55;
}
.pull-quote {
  border-left: 3px solid ${altin};
  padding: ${height * 0.015}px ${width * 0.02}px;
  color: ${lacivert}; font-style: italic;
  font-size: ${height * 0.024}px;
  background: white; margin-top: ${height * 0.02}px;
}
.footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: auto; padding-top: ${height * 0.02}px;
  border-top: 1px solid rgba(27,42,74,0.1);
}
.brand-mini { color: ${lacivert}; font-weight: 600; font-size: ${height * 0.02}px; letter-spacing: 1px; }
.page-num { color: rgba(27,42,74,0.4); font-size: ${height * 0.02}px; }
</style>
</head><body>
<div class="left-stripe"></div>
<div class="content">
  <div class="section-num">${String(slide.section_number || '').padStart(2, '0')}</div>
  <div class="section-title">${slide.section_title || ''}</div>
  <div class="red-line"></div>
  <div class="bullets">
    ${bullets.map(b => `
      <div class="bullet">
        <div class="bullet-dot"></div>
        <div class="bullet-text">${b}</div>
      </div>`).join('')}
    ${slide.pull_quote ? `<div class="pull-quote">${slide.pull_quote}</div>` : ''}
  </div>
  <div class="footer">
    <div class="brand-mini">JURIS</div>
    <div class="page-num">${pageNum} / ${totalPages}</div>
  </div>
</div>
</body></html>`
}

export function buildCarouselSourcesHtml(slide: SlideData, opts: {
  width: number; height: number; pageNum: number; totalPages: number
}): string {
  const { width, height, pageNum, totalPages } = opts
  const sources = slide.sources || []
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
${BASE_CSS}
body {
  width: ${width}px; height: ${height}px;
  background: ${lacivert};
  display: flex; flex-direction: column;
  padding: ${height * 0.07}px ${width * 0.06}px;
}
.header-label {
  color: rgba(255,255,255,0.5); font-size: ${height * 0.022}px;
  letter-spacing: 3px; text-transform: uppercase;
  margin-bottom: ${height * 0.015}px;
}
.title {
  color: ${beyaz};
  font-size: ${height * 0.05}px; font-weight: 700;
  margin-bottom: ${height * 0.02}px;
}
.red-line {
  width: ${width * 0.06}px; height: 3px;
  background: ${kirmizi}; margin-bottom: ${height * 0.04}px;
}
.sources { flex: 1; }
.source-item {
  display: flex; align-items: center; gap: ${width * 0.015}px;
  padding: ${height * 0.018}px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
  font-size: ${height * 0.026}px;
}
.source-icon { color: ${kirmizi}; font-size: ${height * 0.03}px; }
.divider {
  border: none; border-top: 1px solid rgba(255,255,255,0.15);
  margin: ${height * 0.035}px 0;
}
.brand-footer { text-align: center; }
.brand-name {
  color: ${beyaz}; font-size: ${height * 0.045}px; font-weight: 700;
  font-family: 'Playfair Display', serif; letter-spacing: 2px;
}
.brand-cities { color: rgba(255,255,255,0.5); font-size: ${height * 0.02}px; margin-top: 6px; }
.page-num {
  position: absolute; bottom: ${height * 0.04}px; right: ${width * 0.06}px;
  color: rgba(255,255,255,0.3); font-size: ${height * 0.018}px;
}
</style>
</head><body>
<div class="header-label">Mevzuat</div>
<div class="title">Kaynakça</div>
<div class="red-line"></div>
<div class="sources">
  ${sources.map(s => `
    <div class="source-item">
      <span class="source-icon">▪</span>
      <span>${s}</span>
    </div>`).join('')}
</div>
<hr class="divider">
<div class="brand-footer">
  <div class="brand-name">JURIS</div>
  <div class="brand-cities">Ankara | İstanbul</div>
</div>
<div class="page-num">${pageNum} / ${totalPages}</div>
</body></html>`
}

export function buildPostSquareHtml(data: {
  title: string; subtitle?: string; pullQuote?: string
  weekTheme?: string; hashtags?: string
}): string {
  const size = 1080
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
${BASE_CSS}
body {
  width: ${size}px; height: ${size}px;
  background: ${lacivert};
  display: flex; flex-direction: column;
  padding: ${size * 0.08}px;
  position: relative;
}
.logo-text {
  font-family: 'Playfair Display', serif;
  color: ${beyaz}; font-size: ${size * 0.035}px; font-weight: 700;
  letter-spacing: 2px; margin-bottom: ${size * 0.06}px;
}
.main { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.accent-line {
  width: ${size * 0.08}px; height: 4px; background: ${kirmizi};
  margin-bottom: ${size * 0.03}px;
}
.title {
  color: ${beyaz};
  font-size: ${size * 0.07}px; font-weight: 700; line-height: 1.2;
  margin-bottom: ${size * 0.025}px;
}
.subtitle {
  color: rgba(255,255,255,0.65);
  font-size: ${size * 0.028}px; line-height: 1.5;
  margin-bottom: ${size * 0.035}px;
}
.pull-quote {
  border-left: 3px solid ${altin};
  padding-left: ${size * 0.025}px;
  color: ${altin}; font-style: italic;
  font-size: ${size * 0.026}px;
}
.footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: ${size * 0.03}px;
  border-top: 1px solid rgba(255,255,255,0.15);
}
.hashtags { color: rgba(255,255,255,0.4); font-size: ${size * 0.02}px; }
.cities { color: rgba(255,255,255,0.3); font-size: ${size * 0.018}px; }
</style>
</head><body>
<div class="logo-text">JURIS</div>
<div class="main">
  <div class="accent-line"></div>
  <div class="title">${data.title}</div>
  ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
  ${data.pullQuote ? `<div class="pull-quote">${data.pullQuote}</div>` : ''}
</div>
<div class="footer">
  <div class="hashtags">${data.hashtags || ''}</div>
  <div class="cities">Ankara | İstanbul</div>
</div>
</body></html>`
}

export function buildSlidesHtml(slides: SlideData[], opts: {
  width: number; height: number; weekTheme?: string; hashtags?: string
}): string[] {
  const { width, height, weekTheme, hashtags } = opts
  const total = slides.length
  return slides.map((slide, i) => {
    const pageNum = i + 1
    if (slide.type === 'cover') {
      return buildCarouselCoverHtml(slide, { width, height, pageNum, totalPages: total, weekTheme, hashtags })
    } else if (slide.type === 'sources') {
      return buildCarouselSourcesHtml(slide, { width, height, pageNum, totalPages: total })
    } else {
      return buildCarouselContentHtml(slide, { width, height, pageNum, totalPages: total })
    }
  })
}
