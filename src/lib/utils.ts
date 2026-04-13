import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function checkCompliance(text: string): Record<string, boolean> {
  const lower = text.toLowerCase()
  return {
    avk55: !/(reklam|ilan|en iyi|piyasanın|türkiye'nin en)/i.test(text),
    avk55_super: !/(en iyi|lider|uzman|öncü|en deneyimli|en başarılı)/i.test(text),
    client_name: !/müvekkil(imiz|in|e|i)\s+[A-ZÇĞİÖŞÜ][a-zçğışöüa-z]+/.test(text),
    competitor: !/(rakip|diğer büro|başka avukat|karşı taraf avukat)/i.test(text),
  }
}
