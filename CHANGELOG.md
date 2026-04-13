# Changelog — Juris Content Engine

Tüm sürüm notları ve değişiklikler bu dosyada takip edilir.
Format: [Sürüm] · Tarih · Kategori

---

## [v1.1.0] · 2026-04-13 · Phase 1: Auth & SaaS Foundation

### Eklendi
- **Kimlik Doğrulama (NextAuth.js v5)** — e-posta/şifre ile güvenli giriş
- **Kullanıcı Modeli** — ADMIN, EDITOR, REVIEWER rolleri
- **Davet Sistemi** — Admin yeni kullanıcıları e-posta ile davet eder (7 günlük token)
- **Kullanıcı Yönetimi sayfası** (`/settings/users`) — davet oluştur, rol değiştir, pasifleştir
- **Middleware** — tüm rotaları korur, yetkisiz girişimi `/login` sayfasına yönlendirir
- **Login sayfası** — Juris markalı, Playfair Display tipografi
- **Davet Kabul sayfası** (`/accept-invite`) — şifre belirleme ve hesap aktifleştirme
- **Settings API** — API anahtarı artık `.env.local` yerine veritabanında saklanır
- **`getApiKey()` helper** — DB öncelikli, env fallback ile API anahtarı yönetimi
- **Health check endpoint** (`/api/health`) — Railway deploy için
- **Railway deploy config** (`railway.toml`) — build + start komutları
- **`.env.example`** — tüm gereken ortam değişkenleri dokümante edildi
- **Sidebar kullanıcı bölümü** — kullanıcı adı, rol, çıkış butonu
- **Admin-only nav itemları** — Kullanıcılar menüsü sadece ADMIN rolünde görünür
- **SessionProvider** — Next.js App Router ile NextAuth entegrasyonu

### Değiştirildi
- Settings API artık `.env.local` dosyasına yazmıyor (Railway uyumluluğu)
- AI API anahtarı okuma: önce DB, sonra env değişkeni (runtime güncellenebilir)
- `.gitignore` güncellendi: `*.db`, `storage/`, `.env.example` hariç `.env*` ignored

### Güvenlik
- Tüm API rotaları session kontrolü ile korunuyor
- Settings API değişikliği sadece ADMIN rolüne kısıtlandı

---

## [v1.0.0] · 2026-04-13 · İlk Sürüm (Single-Tenant)

### Özellikler
- **Vibe Content Planner** — Claude chat destekli içerik planlama
- **Planlama Modülü** — Excel import, haftalık içerik takvimi
- **İçerik Üretimi** — Claude ile araştır → yaz → tasarla pipeline'ı
- **Revizyon sistemi** — Araştır/Yaz/Tasarla adımlarında revizyon talebi
- **Denetim Modülü** — İçerik onay/red workflow'u
- **İçerik Formatları** — Format kütüphanesi (Blog, E-Bülten, Kılavuz, Post/Carousel)
- **Marka Rehberi** — PDF yükleme, Claude ile analiz, tasarım notları
- **Dashboard** — KPI metrikleri, durum grafikleri
- **Mevzuat Kütüphanesi** — Türk hukuku referans veritabanı
- **PNG/PDF Export** — Slayt dışa aktarma
- **Mobil uyumlu** — Hamburger menü, responsive grid, tab navigasyonu

---

## Yol Haritası

### [v1.2.0] — Phase 2: PostgreSQL + Railway Deploy
- SQLite → PostgreSQL geçişi (Prisma migrations)
- S3/R2 dosya depolaması (brand assets, export'lar)
- Railway ile production deploy
- Custom domain: `cms.juris.av.tr`

### [v2.0.0] — Phase 3: Multi-User Hardening
- Tüm içeriklere `createdBy` / `updatedBy` kullanıcı ataması
- ReviewNote modeli (düz metin yerine yapısal not sistemi)
- RBAC tam entegrasyon (route-level yetki kontrolleri)
- Kullanıcı aktivite logları

### [v2.1.0] — Phase 4: Operations
- AI kullanım logları (maliyet takibi)
- E-posta bildirimleri (Resend entegrasyonu)
- Config helpers — startup'ta eksik env var hatası
- Detaylı runbook dokumentasyonu
