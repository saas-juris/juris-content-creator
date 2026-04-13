import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import type { FormatSpec } from '../brand.config'

export async function renderSlide(html: string, format: { width: number; height: number }): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: format.width, height: format.height, deviceScaleFactor: 2 })
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 })
    const screenshot = await page.screenshot({ type: 'png', fullPage: false })
    return Buffer.from(screenshot)
  } finally {
    await browser.close()
  }
}

export async function renderAllSlides(
  slides: string[],
  format: { width: number; height: number }
): Promise<Buffer[]> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })
  try {
    const buffers: Buffer[] = []
    for (const html of slides) {
      const page = await browser.newPage()
      await page.setViewport({ width: format.width, height: format.height, deviceScaleFactor: 2 })
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 })
      const screenshot = await page.screenshot({ type: 'png', fullPage: false })
      buffers.push(Buffer.from(screenshot))
      await page.close()
    }
    return buffers
  } finally {
    await browser.close()
  }
}

export async function buildPdf(pngBuffers: Buffer[], format: { width: number; height: number }): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  for (const pngBuf of pngBuffers) {
    const img = await pdfDoc.embedPng(pngBuf)
    // PDF points: 1pt = 1/72 inch, use 96 DPI conversion
    const ptW = format.width * 0.75
    const ptH = format.height * 0.75
    const page = pdfDoc.addPage([ptW, ptH])
    page.drawImage(img, { x: 0, y: 0, width: ptW, height: ptH })
  }
  const bytes = await pdfDoc.save()
  return Buffer.from(bytes)
}
