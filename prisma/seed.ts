import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter } as never)

const SEED_SOURCES = [
  { code: '6493', title: '6493 Sayılı Kanun', shortDesc: 'Ödeme Hizmetleri ve Elektronik Para Kuruluşları', type: 'kanun' },
  { code: '6698', title: '6698 Sayılı Kanun (KVKK)', shortDesc: 'Kişisel Verilerin Korunması', type: 'kanun' },
  { code: '4054', title: '4054 Sayılı Kanun', shortDesc: 'Rekabetin Korunması', type: 'kanun' },
  { code: '6102', title: '6102 Sayılı TTK', shortDesc: 'Türk Ticaret Kanunu', type: 'kanun' },
  { code: '4857', title: '4857 Sayılı İş Kanunu', shortDesc: 'İş ilişkileri ve çalışma koşulları', type: 'kanun' },
  { code: '1136', title: '1136 Sayılı Avukatlık Kanunu', shortDesc: 'Avukatlık mesleği düzenlemesi', type: 'kanun' },
  { code: '6100', title: '6100 Sayılı HMK', shortDesc: 'Hukuk Muhakemeleri Kanunu', type: 'kanun' },
  { code: '4686', title: '4686 Sayılı MTK', shortDesc: 'Milletlerarası Tahkim Kanunu', type: 'kanun' },
  { code: '5411', title: '5411 Sayılı Bankacılık Kanunu', shortDesc: 'Bankacılık düzenleme ve denetimi', type: 'kanun' },
  { code: '6362', title: '6362 Sayılı SPK Kanunu', shortDesc: 'Sermaye Piyasası Kanunu', type: 'kanun' },
  { code: '2872', title: '2872 Sayılı Çevre Kanunu', shortDesc: 'Çevre koruma düzenlemesi', type: 'kanun' },
  { code: '3194', title: '3194 Sayılı İmar Kanunu', shortDesc: 'İmar ve yapılaşma düzenlemesi', type: 'kanun' },
  { code: '6306', title: '6306 Sayılı Kanun', shortDesc: 'Afet Riski Altındaki Alanların Dönüştürülmesi', type: 'kanun' },
  { code: 'OHSS-YON', title: 'Ödeme Hizmetleri Yönetmeliği', shortDesc: 'TCMB ödeme hizmeti sağlayıcıları düzenlemesi (01.12.2021)', type: 'yonetmelik' },
  { code: 'KVKK-YON', title: 'Veri Sorumluları Sicili Yönetmeliği', shortDesc: 'VERBİS kayıt ve bildirim yükümlülükleri', type: 'yonetmelik' },
  { code: 'BS-TEB', title: 'Bilgi Sistemleri Tebliği', shortDesc: 'Ödeme kuruluşları BT altyapı gereksinimleri', type: 'teblig' },
  { code: 'CISG', title: 'CISG (Viyana Satım Sözleşmesi)', shortDesc: 'Uluslararası mal satım sözleşmeleri', type: 'uluslararasi' },
  { code: 'NYC', title: 'New York Konvansiyonu', shortDesc: 'Yabancı hakem kararlarının tanınması ve tenfizi', type: 'uluslararasi' },
]

const SEED_FORMATS = [
  {
    id: 'fmt-blog',
    name: 'Blog Yazısı',
    icon: '✍️',
    category: 'Dijital',
    description: 'Uzun formatlı, SEO odaklı hukuki içerik yazısı.',
    designLanguage: 'Profesyonel ve güven verici ton. Lacivert başlıklar, serif font, beyaz zemin. Juris tipografi hiyerarşisi.',
    scope: 'Hukuki analiz, içtihat yorumu, sektörel rehber. 800–2000 kelime. Başlık + giriş + bölümler + sonuç yapısı.',
    dimensions: 'Kapak görseli: 1200×630 px (OG). Metin sütunu: max 720 px. Mobil: tam genişlik.',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'fmt-bulten',
    name: 'E-Bülten',
    icon: '📧',
    category: 'Dijital',
    description: 'Haftalık / aylık e-posta bülteni.',
    designLanguage: 'Temiz, taranabilir düzen. Juris lacivert (#1b2a4a) header, minimal ikonlar, gold (#c9a84c) vurgu rengi.',
    scope: 'Mevzuat özeti, gündem haberleri, etkinlik duyurusu. Maksimum 5 madde. Kısa & öz paragraflar.',
    dimensions: '600 px genişlik (email standardı). Sınırsız yükseklik. Retina için @2x görseller.',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'fmt-kilavuz',
    name: 'Hukuki Kılavuz',
    icon: '📘',
    category: 'Basılı',
    description: 'Yazdırılabilir, markalı rehber doküman.',
    designLanguage: 'Resmi ve otoriter. Juris logolu kapak, sayfa numaraları, dipnot alanı. Lacivert-beyaz renk şeması.',
    scope: 'Uyum rehberi, prosedür kılavuzu, hak ve yükümlülükler. 4–20 sayfa. Bölüm başlıkları + madde listesi.',
    dimensions: 'A4 (210×297 mm). 3 mm taşma payı. Kenar boşlukları: üst/alt 20 mm, sol/sağ 25 mm.',
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'fmt-carousel',
    name: 'Post / Carousel',
    icon: '🎠',
    category: 'Sosyal Medya',
    description: 'LinkedIn & Instagram için slayt serisi.',
    designLanguage: 'Dikkat çekici, özlü. Juris marka renkleri, büyük punto, minimal metin. Her slayt tek mesaj.',
    scope: 'Tek kavram veya liste. Kapak + 4–8 içerik slaydı + CTA slaydı. Görsel ağırlıklı.',
    dimensions: 'Kare: 1080×1080 px. Portre: 1080×1350 px (4:5). Yatay: 1080×608 px (16:9). LinkedIn önerisi: kare.',
    isActive: true,
    sortOrder: 4,
  },
]

async function main() {
  console.log('Seeding legal sources...')
  for (const source of SEED_SOURCES) {
    await prisma.legalSource.upsert({
      where: { id: source.code },
      update: source,
      create: { id: source.code, ...source },
    })
  }
  console.log(`✓ Seeded ${SEED_SOURCES.length} legal sources.`)

  console.log('Seeding content formats...')
  for (const fmt of SEED_FORMATS) {
    await prisma.contentFormat.upsert({
      where: { id: fmt.id },
      update: fmt,
      create: fmt,
    })
  }
  console.log(`✓ Seeded ${SEED_FORMATS.length} content formats.`)

  // Seed admin user if no users exist
  const userCount = await prisma.user.count()
  if (userCount === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@juris.av.tr'
    const adminPassword = process.env.ADMIN_PASSWORD || `JurisAdmin${new Date().getFullYear()}!`
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        passwordHash,
        role: 'ADMIN',
      },
    })
    console.log(`✓ Admin kullanıcı oluşturuldu: ${adminEmail}`)
    console.log(`  Şifre: ${adminPassword}`)
    console.log(`  ⚠️  Giriş yaptıktan sonra şifrenizi değiştirin!`)
  } else {
    console.log(`✓ ${userCount} kullanıcı zaten mevcut, admin seed atlandı.`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
