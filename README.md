# Juris Content Engine

**Juris Avukatlık Ortaklığı** için geliştirilmiş, yapay zeka destekli LinkedIn içerik yönetim sistemi.

---

## Özellikler

| Modül | Açıklama |
|-------|----------|
| 🌟 **Vibe Content Planner** | Claude ile sohbet ederek içerik fikirleri geliştir |
| 📅 **Planlama** | Haftalık içerik takvimi, Excel import |
| 🎠 **İçerik Formatları** | Format kütüphanesi (Blog, Bülten, Kılavuz, Carousel) |
| ✍️ **Üretim** | Araştır → Yaz → Tasarla pipeline'ı (Claude destekli) |
| ✅ **Denetim** | İçerik onay/red workflow'u |
| 📊 **Rapor** | KPI metrikleri, durum grafikleri |
| 🎨 **Marka** | Guideline yükleme, Claude analizi |
| ⚖️ **Mevzuat** | Türk hukuku referans kütüphanesi |

---

## Kurulum

### Gereksinimler
- Node.js 20+
- pnpm 9+

### Adımlar

```bash
# Bağımlılıkları yükle
pnpm install

# Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını düzenle (NEXTAUTH_SECRET, ANTHROPIC_API_KEY vb.)

# Veritabanını oluştur
pnpm db:push

# Seed verisini yükle (admin kullanıcı, formatlar, mevzuat)
pnpm db:seed

# Geliştirme sunucusunu başlat
pnpm dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

### İlk Giriş
Seed sonrası varsayılan admin hesabı:
- **E-posta:** `admin@juris.av.tr`
- **Şifre:** `JurisAdmin2025!`

> ⚠️ İlk girişten sonra şifrenizi değiştirin!

---

## Railway Deploy (Production)

1. [Railway](https://railway.app) üzerinde yeni proje oluştur
2. GitHub reposunu bağla
3. **PostgreSQL** addon ekle (DATABASE_URL otomatik set edilir)
4. Ortam değişkenlerini ayarla:

| Değişken | Değer |
|----------|-------|
| `NEXTAUTH_SECRET` | `openssl rand -hex 32` ile üret |
| `NEXTAUTH_URL` | `https://your-domain.up.railway.app` |
| `ANTHROPIC_API_KEY` | Anthropic API anahtarı |
| `NODE_ENV` | `production` |

5. Deploy başlar, Railway otomatik:
   - `pnpm install` çalıştırır
   - `prisma migrate deploy` ile DB migrasyonlarını uygular
   - `pnpm build` ile Next.js build alır
   - `pnpm start` ile başlatır

### Custom Domain
Railway dashboard → Settings → Networking → Custom Domain ekle.
`NEXTAUTH_URL` değerini custom domain ile güncelle.

---

## Geliştirme

```bash
# Prisma Studio (DB görüntüleyici)
pnpm db:studio

# Yeni migration
pnpm prisma migrate dev --name açıklama

# Tip üretimi
pnpm prisma generate
```

---

## Kullanıcı Yönetimi

Yeni kullanıcı davet etmek için:
1. `/settings/users` sayfasına git (Admin rolü gerekir)
2. E-posta ve rol gir → **Davet Oluştur**
3. Oluşan linki kullanıcıya ilet (7 gün geçerli)

### Roller
| Rol | Yetkiler |
|-----|----------|
| **ADMIN** | Tam erişim, kullanıcı yönetimi, ayarlar |
| **EDITOR** | İçerik oluşturma, AI kullanımı, upload |
| **REVIEWER** | İnceleme ve onay |

---

## Sürüm Notları

Detaylı değişiklikler için [CHANGELOG.md](./CHANGELOG.md) dosyasına bakın.

**Mevcut sürüm:** v1.1.0 (Phase 1: Auth & SaaS Foundation)

---

*Juris Avukatlık Ortaklığı · Dahili Sistem · Tüm hakları saklıdır*
