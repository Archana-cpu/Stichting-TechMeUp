# SEQUENCES - Technical Guide Skeleton

> Bu dosya, kılavuzun tam iskeletidir. Her chapter ayrı bir .md dosyası olarak yazılacak.
> Önce bu iskelet onaylanacak, sonra içerik üretilecek.

---

## GENEL YAPI

```
sequences-guide/
├── 00-overview.md              # Genel bakış ve navigasyon
├── 01-vision.md                # Proje vizyonu
├── 02-architecture.md          # Mimari
├── 03-data-model.md            # Veri modeli
├── 04-authentication.md        # Auth
├── 05-api-design.md            # API
├── 06-cbt-engine.md            # CBT sistemi
├── 07-storyboard.md            # Storyboard
├── 08-people-network.md        # People/Circle Tree
├── 09-social-features.md       # Sosyal özellikler
├── 10-i18n.md                  # Çoklu dil
├── 11-file-upload.md           # Dosya yükleme
├── 12-security.md              # Güvenlik
├── 13-testing.md               # Test stratejisi
├── 14-performance.md           # Performans
├── 15-deployment.md            # Deployment
├── 16-mobile.md                # Mobile app
├── 17-admin.md                 # Admin panel
├── 18-psychologist-portal.md   # Gelecek: B2B
├── 19-error-handling.md        # Hata yönetimi
├── 20-code-standards.md        # Kod standartları
└── appendix/
    ├── A-migration-guide.md    # Eski sistemden geçiş
    ├── B-api-reference.md      # API referans
    ├── C-database-scripts.md   # DB scriptleri
    └── D-glossary.md           # Terimler sözlüğü
```

---

# CHAPTER 00: OVERVIEW

## 00.1 Kılavuz Hakkında

- 00.1.1 Bu kılavuzun amacı
- 00.1.2 Hedef kitle (geliştiriciler, DevOps, yeni ekip üyeleri)
- 00.1.3 Nasıl kullanılmalı
- 00.1.4 Versiyon ve güncelleme politikası

## 00.2 Proje Özeti

- 00.2.1 Sequences nedir (tek paragraf)
- 00.2.2 Tech stack özeti
- 00.2.3 Repo yapısı özeti
- 00.2.4 Hızlı başlangıç komutları

## 00.3 Chapter Haritası

- 00.3.1 Tablo: chapter → konu → önkoşul chapter'lar
- 00.3.2 Okuma sırası önerileri (role'e göre)

---

# CHAPTER 01: PROJE VİZYONU VE ANALİZ

## 01.1 Ürün Tanımı

- 01.1.1 Sequences nedir
- 01.1.2 CBT (Bilişsel Davranışçı Terapi) temelleri
- 01.1.3 Sequence kavramı: Trigger → Emotion → Thought → Behavior
- 01.1.4 Polarity ve Intensity kavramları
- 01.1.5 Memory (anı) kavramı ve Sequence ilişkisi

## 01.2 8 Temel Duygu (Plutchik Wheel)

- 01.2.1 Joy - tanım, renk, ikon, psikolojik temel
- 01.2.2 Trust - tanım, renk, ikon, psikolojik temel
- 01.2.3 Fear - tanım, renk, ikon, psikolojik temel
- 01.2.4 Surprise - tanım, renk, ikon, psikolojik temel
- 01.2.5 Sadness - tanım, renk, ikon, psikolojik temel
- 01.2.6 Disgust - tanım, renk, ikon, psikolojik temel
- 01.2.7 Anger - tanım, renk, ikon, psikolojik temel
- 01.2.8 Anticipation - tanım, renk, ikon, psikolojik temel
- 01.2.9 Duygu renk paleti ve HSL değerleri tablosu

## 01.3 10 Trigger Kategorisi

- 01.3.1 Life Event
- 01.3.2 Social Interaction
- 01.3.3 Achievement
- 01.3.4 Setback
- 01.3.5 Financial Status
- 01.3.6 New Experience
- 01.3.7 Rumor / News
- 01.3.8 Chance / Coincidence
- 01.3.9 Responsibility
- 01.3.10 Health
- 01.3.11 Trigger ikonları ve kategorilendirme mantığı

## 01.4 Kullanıcı Segmentleri

- 01.4.1 B2C Segment A: Kişisel gelişim odaklı
- 01.4.2 B2C Segment B: Anı biriktirme odaklı
- 01.4.3 B2C Segment C: Sosyal paylaşım odaklı
- 01.4.4 B2B Segment: Psikolog/Terapist portalı (gelecek)
- 01.4.5 Segment bazlı özellik matrisi

## 01.5 Temel Özellikler

- 01.5.1 Storyboard (ana arayüz)
  - Timeline görünümü
  - Person-filtered görünüm
  - Emotion-filtered görünüm
  - Freeform canvas görünümü
- 01.5.2 Sequence CRUD
- 01.5.3 People Network (Circle Tree)
- 01.5.4 CBT Analiz ve Raporlama
- 01.5.5 Sosyal özellikler (follow, react, comment)
- 01.5.6 Daily Quote sistemi
- 01.5.7 Multi-language desteği
- 01.5.8 Tema desteği

## 01.6 User Journey

- 01.6.1 Kayıt akışı (Google OAuth)
- 01.6.2 Kayıt akışı (Email/Password)
- 01.6.3 Email doğrulama
- 01.6.4 Username seçimi ve validasyonu
- 01.6.5 Onboarding wizard adımları
- 01.6.6 İlk Core Memory oluşturma
- 01.6.7 Günlük kullanım akışı
- 01.6.8 Sequence oluşturma akışı (detaylı)

## 01.7 Fonksiyonel Gereksinimler

- 01.7.1 FR tablosu: ID, açıklama, öncelik, durum
- 01.7.2 P0 gereksinimleri (kritik)
- 01.7.3 P1 gereksinimleri (önemli)
- 01.7.4 P2 gereksinimleri (olsa iyi)

## 01.8 Non-Fonksiyonel Gereksinimler

- 01.8.1 Performans gereksinimleri
- 01.8.2 Güvenlik gereksinimleri
- 01.8.3 Ölçeklenebilirlik gereksinimleri
- 01.8.4 Erişilebilirlik gereksinimleri
- 01.8.5 Browser/cihaz desteği

## 01.9 Veri Gizliliği ve Mevzuat Uyumluluğu

- 01.9.1 KVKK (Kişisel Verilerin Korunması Kanunu) gereksinimleri
  - Açık rıza mekanizması
  - Veri sorumlusu/veri işleyen sorumlulukları
  - Silme/düzeltme/erişim hakları (ARCO hakları)
- 01.9.2 GDPR (General Data Protection Regulation) uyumluluğu
  - Lawful basis for processing
  - Data subject rights implementation
  - Cross-border data transfer (SCCs, adequacy decisions)
- 01.9.3 Özel nitelikli kişisel veri işleme prensipleri
  - Psikolojik veri kategorisi tanımı
  - Emotion, thought, behavior verilerinin hassas veri statüsü
  - İşleme için ek güvenlik önlemleri
  - Açık rıza ve aydınlatma metni gereksinimleri
- 01.9.4 Anonimleştirme ve takma ad kullanımı (Pseudonymization)
  - k-anonymity ve l-diversity prensipleri
  - Analitik veriler için anonimleştirme stratejisi
  - B2B (Psikolog portalı) için aggregate data hazırlama
- 01.9.5 Veri minimizasyonu ilkesi
  - Sadece gerekli verilerin toplanması
  - Retention policy ve otomatik silme
- 01.9.6 Privacy by Design implementasyonu
  - Default privacy ayarları
  - Data flow mapping
  - Privacy Impact Assessment (PIA) şablonu

---

# CHAPTER 02: MİMARİ KARŞILAŞTIRMA

## 02.1 Eski Mimari Analizi (MERN Stack)

- 02.1.1 Eski yapı şeması (React SPA + JSON Server)
- 02.1.2 Eski dosya yapısı (EX_PROJECT)
- 02.1.3 db.json veri yapısı analizi
- 02.1.4 server.js analizi (Cloudinary upload)
- 02.1.5 Eski frontend yapısı (Vite + React)

## 02.2 Eski Yapının Sorunları

- 02.2.1 Güvenlik sorunları
  - Authentication eksikliği
  - Authorization eksikliği
  - Input validation eksikliği
  - Rate limiting eksikliği
  - CORS zafiyetleri
- 02.2.2 Veri tutarlılığı sorunları
  - Type inconsistency (string vs number)
  - Foreign key constraint eksikliği
  - Unique constraint eksikliği
  - Transaction desteği eksikliği
- 02.2.3 Ölçeklenebilirlik sorunları
  - File-based database limitleri
  - Single process kısıtlaması
  - Connection pooling eksikliği
  - Caching eksikliği
- 02.2.4 Geliştirici deneyimi sorunları
  - Type safety eksikliği
  - Migration sistemi eksikliği
  - Test altyapısı eksikliği

## 02.3 Yeni Mimari (Turborepo + Next.js + Prisma)

- 02.3.1 Yeni yapı şeması (high-level)
- 02.3.2 Monorepo yapısı ve avantajları
- 02.3.3 Package dependency graph
- 02.3.4 Request/response flow
- 02.3.5 Build pipeline (Turborepo)
- 02.3.6 Build Order ve Dahili Bağımlılık Yönetimi
  - Paket build sırası: @seq/config → @seq/database → @seq/auth → @seq/i18n → @seq/ui → apps/*
  - Turbo topological sort ve task dependencies
  - dependsOn configuration (turbo.json)
  - Circular dependency önleme stratejileri
  - Workspace protokolü (workspace:*) vs sabit versiyon

## 02.4 Tech Stack Detayı

- 02.4.1 Core: Next.js 15 (App Router, RSC)
- 02.4.2 Database: PostgreSQL 16
- 02.4.3 ORM: Prisma
- 02.4.4 Auth: Auth.js (NextAuth v5)
- 02.4.5 Validation: Zod
- 02.4.6 State: TanStack Query
- 02.4.7 Styling: Tailwind + shadcn/ui
- 02.4.8 i18n: next-intl
- 02.4.9 Mobile: React Native + Expo
- 02.4.10 Testing: Vitest + Playwright
- 02.4.11 Build: Turborepo + pnpm

## 02.5 Karşılaştırma Matrisi

- 02.5.1 Özellik bazlı karşılaştırma tablosu
- 02.5.2 İyileşme alanları özeti
- 02.5.3 Kalan eksiklikler ve TODO'lar

## 02.6 Monorepo Yapısı Detayı

- 02.6.1 Root yapı ve dosyalar
- 02.6.2 apps/web yapısı
- 02.6.3 apps/mobile yapısı
- 02.6.4 packages/auth yapısı
- 02.6.5 packages/config yapısı
- 02.6.6 packages/database yapısı
- 02.6.7 packages/i18n yapısı
- 02.6.8 packages/ui yapısı
- 02.6.9 scripts/ yapısı

## 02.7 Package İsimlendirme ve Export Konvansiyonları

- 02.7.1 @seq/ scope kullanımı
- 02.7.2 Barrel exports (index.ts)
- 02.7.3 Type exports
- 02.7.4 Cross-package imports

---

# CHAPTER 03: VERİ MODELİ VE İLİŞKİLER

## 03.1 Entity Overview

- 03.1.1 Tüm entity'lerin listesi ve kısa açıklaması
- 03.1.2 Domain grupları: Auth, CBT Core, People, Social, Content, Admin
- 03.1.3 Entity sayıları ve karmaşıklık analizi

## 03.2 Auth Domain Modelleri

- 03.2.1 User model (tüm alanlar, indexler, ilişkiler)
- 03.2.2 Account model (OAuth için)
- 03.2.3 Session model
- 03.2.4 VerificationToken model
- 03.2.5 UserSettings model

## 03.3 CBT Core Domain Modelleri

- 03.3.1 Emotion model
- 03.3.2 Trigger model
- 03.3.3 Sequence model (detaylı alan analizi)
- 03.3.4 Note model

## 03.4 People Domain Modelleri

- 03.4.1 Person model
- 03.4.2 SequencePerson junction model
- 03.4.3 appUserId ile User bağlantısı

## 03.5 Social Domain Modelleri

- 03.5.1 Follow model (self-referential many-to-many)
- 03.5.2 Message model (self-referential)
- 03.5.3 Comment model (nested replies)
- 03.5.4 Reaction model
- 03.5.5 Notification model

## 03.6 Content Domain Modelleri

- 03.6.1 Quote model (multi-language)
- 03.6.2 SystemSettings model (singleton)

## 03.7 İlişki Detayları

- 03.7.1 One-to-Many ilişkiler tablosu
- 03.7.2 Many-to-Many ilişkiler tablosu
- 03.7.3 Self-referential ilişkiler
- 03.7.4 Optional vs Required ilişkiler
- 03.7.5 Cascade delete stratejileri

## 03.8 Entity Relationship Diagram

- 03.8.1 Full ERD (ASCII art)
- 03.8.2 Auth domain ERD
- 03.8.3 CBT Core domain ERD
- 03.8.4 Social domain ERD

## 03.9 Index Stratejisi

- 03.9.1 Primary indexes (implicit)
- 03.9.2 Unique indexes
- 03.9.3 Query optimization indexes
- 03.9.4 Composite indexes
- 03.9.5 Index performance analizi

## 03.10 Zod Validation Schemas

- 03.10.1 Constants (min/max değerler)
- 03.10.2 Base schemas (Polarity, Intensity, Impact)
- 03.10.3 CreateSequenceSchema
- 03.10.4 UpdateSequenceSchema
- 03.10.5 CreatePersonSchema
- 03.10.6 UpdatePersonSchema
- 03.10.7 UsernameSchema (reserved words dahil)
- 03.10.8 UserProfileSchema

## 03.11 Database Constraints

- 03.11.1 Prisma implicit constraints
- 03.11.2 Explicit CHECK constraints (SQL)
- 03.11.3 Business rule constraints

## 03.12 Edge Cases ve Data Integrity

- 03.12.1 Cascade delete senaryoları
- 03.12.2 Orphan data önleme
- 03.12.3 Duplicate data önleme
- 03.12.4 Invalid reference önleme
- 03.12.5 Race condition senaryoları
- 03.12.6 Edge case test matrisi

---

# CHAPTER 04: AUTHENTICATION & AUTHORIZATION

## 04.1 Auth.js (NextAuth v5) Genel Bakış

- 04.1.1 Neden Auth.js seçildi
- 04.1.2 Auth.js v5 özellikleri
- 04.1.3 packages/auth yapısı

## 04.2 OAuth Providers

- 04.2.1 Google OAuth konfigürasyonu
- 04.2.2 Google Cloud Console setup
- 04.2.3 Gelecek: Apple, GitHub, Discord
- 04.2.4 Provider callback URL'leri

## 04.3 Credentials Provider (Email/Password)

- 04.3.1 Email/password flow
- 04.3.2 Password hashing (bcrypt)
- 04.3.3 Email verification flow
- 04.3.4 Password reset flow
- 04.3.5 Rate limiting login attempts

## 04.4 Prisma Adapter

- 04.4.1 @auth/prisma-adapter kullanımı
- 04.4.2 Schema gereksinimleri
- 04.4.3 Custom adapter extensions

## 04.5 Session Yönetimi

- 04.5.1 JWT vs Database sessions
- 04.5.2 Session yapısı ve içeriği
- 04.5.3 Session token yenileme
- 04.5.4 Session invalidation

## 04.6 Middleware

- 04.6.1 apps/web/src/middleware.ts analizi
- 04.6.2 Protected routes
- 04.6.3 Public routes
- 04.6.4 API route protection
- 04.6.5 Locale + Auth middleware chain

## 04.7 Authorization Patterns

- 04.7.1 Role-based access (isAdmin)
- 04.7.2 Resource ownership (userId check)
- 04.7.3 Visibility rules (isPublic)
- 04.7.4 API route authorization

## 04.8 Username Sistemi

- 04.8.1 Username format kuralları
- 04.8.2 Reserved usernames listesi
- 04.8.3 Uniqueness kontrolü
- 04.8.4 Username değiştirme politikası

## 04.9 Security Considerations

- 04.9.1 CSRF protection
- 04.9.2 Session fixation önleme
- 04.9.3 Token güvenliği
- 04.9.4 OAuth state parameter
- 04.9.5 Secure cookies

## 04.10 Auth Flow Diagrams

- 04.10.1 Google OAuth flow diagram
- 04.10.2 Email/password flow diagram
- 04.10.3 Session check flow diagram

## 04.11 Test Senaryoları

- 04.11.1 Unit tests (auth functions)
- 04.11.2 Integration tests (login flow)
- 04.11.3 E2E tests (full auth journey)
- 04.11.4 Edge cases (expired tokens, invalid credentials)

---

# CHAPTER 05: API TASARIMI VE ENDPOINT'LER

## 05.1 API Genel Yapı

- 05.1.1 Next.js App Router API routes
- 05.1.2 Route handler yapısı
- 05.1.3 Request/Response types
- 05.1.4 Error response formatı

## 05.2 Auth Endpoints

- 05.2.1 [...nextauth] route
- 05.2.2 Session endpoint
- 05.2.3 CSRF token endpoint

## 05.3 Sequence Endpoints

- 05.3.1 GET /api/sequences - Liste
- 05.3.2 POST /api/sequences - Oluştur
- 05.3.3 GET /api/sequences/[id] - Detay
- 05.3.4 PUT /api/sequences/[id] - Güncelle
- 05.3.5 DELETE /api/sequences/[id] - Sil
- 05.3.6 POST /api/sequences/reorder - Sıralama

## 05.4 People Endpoints

- 05.4.1 GET /api/people - Liste
- 05.4.2 POST /api/people - Oluştur
- 05.4.3 GET /api/people/[id] - Detay
- 05.4.4 PUT /api/people/[id] - Güncelle
- 05.4.5 DELETE /api/people/[id] - Sil

## 05.5 Reference Data Endpoints

- 05.5.1 GET /api/emotions
- 05.5.2 GET /api/triggers

## 05.6 Quote Endpoints

- 05.6.1 GET /api/quotes - Liste
- 05.6.2 GET /api/quotes/daily - Günün sözü

## 05.7 User Endpoints

- 05.7.1 GET /api/user/settings
- 05.7.2 PUT /api/user/settings

## 05.8 Admin Endpoints

- 05.8.1 GET /api/admin/settings
- 05.8.2 PUT /api/admin/settings
- 05.8.3 Admin authorization kontrolü

## 05.9 Health Check

- 05.9.1 GET /api/health
- 05.9.2 Database connection check
- 05.9.3 Response format

## 05.10 Request Validation

- 05.10.1 Zod schema integration
- 05.10.2 Validation error handling
- 05.10.3 Type-safe request parsing

## 05.11 Response Patterns

- 05.11.1 Success response format
- 05.11.2 Error response format
- 05.11.3 Pagination pattern
- 05.11.4 Include/exclude pattern

## 05.12 API Security

- 05.12.1 Authentication check
- 05.12.2 Authorization check
- 05.12.3 Rate limiting (TODO)
- 05.12.4 Input sanitization

## 05.13 API Test Senaryoları

- 05.13.1 Her endpoint için unit test listesi
- 05.13.2 Integration test senaryoları
- 05.13.3 Error case testleri
- 05.13.4 Authorization testleri

---

# CHAPTER 06: CBT ENGINE VE POLARITY SİSTEMİ

## 06.1 CBT Teorik Altyapı

- 06.1.1 CBT döngüsü açıklaması
- 06.1.2 Trigger → Emotion → Thought → Behavior akışı
- 06.1.3 Terapötik değer

## 06.2 Polarity Sistemi

- 06.2.1 Polarity tanımı (-5 to +5)
- 06.2.2 Negatif polarity anlamı
- 06.2.3 Nötr (0) anlamı
- 06.2.4 Pozitif polarity anlamı
- 06.2.5 Her CBT bileşeni için polarity yorumu

## 06.3 Intensity Sistemi

- 06.3.1 Intensity tanımı (1 to 10)
- 06.3.2 Düşük intensity (1-3)
- 06.3.3 Orta intensity (4-7)
- 06.3.4 Yüksek intensity (8-10)
- 06.3.5 Emotion vs Thought vs Behavior intensity farkları

## 06.4 Impact Sistemi (Behavior)

- 06.4.1 Impact tanımı
- 06.4.2 Impact vs Intensity farkı
- 06.4.3 Impact skorlama kriterleri

## 06.5 Polarity Hesaplama Algoritması

- 06.5.1 Eski calculatePolarity.js analizi
- 06.5.2 Yeni hesaplama fonksiyonu
- 06.5.3 Weighted average yaklaşımı
- 06.5.4 Overall sequence polarity

## 06.6 Görsel Temsil

- 06.6.1 Polarity → Renk mapping
- 06.6.2 Intensity → Opacity/Glow mapping
- 06.6.3 Storyboard'da görsel feedback
- 06.6.4 Timeline renklendirmesi

## 06.7 CBT Analiz Raporları (Planlanan)

- 06.7.1 Zaman bazlı polarity trend
- 06.7.2 Trigger bazlı analiz
- 06.7.3 Emotion dağılımı
- 06.7.4 Person bazlı pattern'ler
- 06.7.5 Behavior impact korelasyonu

## 06.8 cbt-analysis.tsx Component

- 06.8.1 Component yapısı
- 06.8.2 Props ve state
- 06.8.3 Hesaplama logic'i
- 06.8.4 Görselleştirme

## 06.9 Test Senaryoları

- 06.9.1 polarity.test.ts mevcut testler
- 06.9.2 Edge case testleri
- 06.9.3 Boundary value testleri

---

# CHAPTER 07: STORYBOARD SİSTEMİ

## 07.1 Storyboard Konsepti

- 07.1.1 Storyboard nedir
- 07.1.2 Ana sayfa olarak storyboard
- 07.1.3 Figma/Excalidraw/Prisma Studio ilhamı
- 07.1.4 Kullanıcı beklentileri

## 07.2 Görünüm Modları

- 07.2.1 Timeline (kronolojik)
- 07.2.2 Person-filtered
- 07.2.3 Emotion-filtered
- 07.2.4 Freeform canvas
- 07.2.5 Mod değiştirme UX'i

## 07.3 Timeline Görünümü

- 07.3.1 Horizontal vs Vertical layout
- 07.3.2 Tarih bazlı sıralama
- 07.3.3 Bugün odaklı görünüm
- 07.3.4 Scroll ve navigation
- 07.3.5 Zoom levels

## 07.4 Sequence Kartları

- 07.4.1 Kart tasarımı
- 07.4.2 Polarity renklendirmesi
- 07.4.3 Emotion ikonu
- 07.4.4 Thumbnail image
- 07.4.5 Hover/focus states
- 07.4.6 Click action

## 07.5 Drag & Drop (dnd-kit)

- 07.5.1 @dnd-kit/core kullanımı
- 07.5.2 @dnd-kit/sortable kullanımı
- 07.5.3 storyboardOrder güncelleme
- 07.5.4 Optimistic updates
- 07.5.5 Conflict resolution

## 07.6 Filtering ve Sorting

- 07.6.1 Date range filter
- 07.6.2 Person filter
- 07.6.3 Emotion filter
- 07.6.4 Polarity filter
- 07.6.5 Search functionality

## 07.7 Storyboard State Management

- 07.7.1 React Query integration
- 07.7.2 Local state for drag
- 07.7.3 URL state for filters
- 07.7.4 Persist preferences

## 07.8 storyboard/ Component Yapısı

- 07.8.1 storyboard.tsx ana component
- 07.8.2 storyboard/index.ts exports
- 07.8.3 storyboard/types.ts type definitions
- 07.8.4 Alt componentler (planlanan)

## 07.9 Responsive Design

- 07.9.1 Desktop layout
- 07.9.2 Tablet layout
- 07.9.3 Mobile layout
- 07.9.4 Touch interactions

## 07.10 Performance Optimizasyonları

- 07.10.1 Virtualization (büyük listeler)
- 07.10.2 Image lazy loading
- 07.10.3 Skeleton loading states
- 07.10.4 Memoization strategies

## 07.11 E2E Test Senaryoları

- 07.11.1 storyboard.spec.ts mevcut testler
- 07.11.2 Ek test senaryoları
- 07.11.3 Drag-drop testleri
- 07.11.4 Filter testleri

---

# CHAPTER 08: PEOPLE NETWORK (CIRCLE TREE)

## 08.1 People Network Konsepti

- 08.1.1 Neden "People Network"
- 08.1.2 Circle Tree metaforu
- 08.1.3 Aile ağacı + arkadaş çevresi
- 08.1.4 Kullanım senaryoları

## 08.2 Person Model Detayı

- 08.2.1 Person entity alanları
- 08.2.2 relationship field kullanımı
- 08.2.3 notes field kullanımı
- 08.2.4 image field

## 08.3 App User Bağlantısı

- 08.3.1 appUserId field
- 08.3.2 Gerçek kullanıcı ile eşleştirme
- 08.3.3 Davet sistemi (planlanan)
- 08.3.4 Privacy considerations

## 08.4 Sequence-Person İlişkisi

- 08.4.1 SequencePerson junction table
- 08.4.2 role field kullanımı
- 08.4.3 Bir sequence'ta birden fazla kişi
- 08.4.4 Bir kişinin birden fazla sequence'ı

## 08.5 Relationship Types (Önerilen)

- 08.5.1 Aile ilişkileri (parent, sibling, child, etc.)
- 08.5.2 Romantik ilişkiler (partner, spouse, ex)
- 08.5.3 Arkadaşlık (friend, best friend, acquaintance)
- 08.5.4 Profesyonel (colleague, boss, mentor)
- 08.5.5 Diğer (neighbor, therapist, etc.)

## 08.6 Tree Visualization (Planlanan)

- 08.6.1 D3.js veya React Flow kullanımı
- 08.6.2 Hierarchy yapısı
- 08.6.3 Node styling
- 08.6.4 Edge/connection styling
- 08.6.5 Interactive features

## 08.7 people-list.tsx Component

- 08.7.1 Component yapısı
- 08.7.2 CRUD operations
- 08.7.3 Search ve filter
- 08.7.4 Person card design

## 08.8 People API Endpoints

- 08.8.1 Liste ve filtreleme
- 08.8.2 Detay sayfası
- 08.8.3 Create/Update/Delete
- 08.8.4 Sequence association

## 08.9 Edge Cases

- 08.9.1 Aynı isimde birden fazla kişi
- 08.9.2 Person silindi, sequence ne olur
- 08.9.3 appUserId olan kişi hesabını silerse
- 08.9.4 Circular relationships

## 08.10 Test Senaryoları

- 08.10.1 People CRUD testleri
- 08.10.2 Sequence association testleri
- 08.10.3 Tree visualization testleri (planlanan)

---

# CHAPTER 09: SOSYAL ÖZELLİKLER

## 09.1 Sosyal Özellikler Genel Bakış

- 09.1.1 Opsiyonel sosyal layer
- 09.1.2 Privacy-first yaklaşım
- 09.1.3 Sosyal vs Kişisel kullanım

## 09.2 Public/Private Sistemi

- 09.2.1 Sequence.isPublic field
- 09.2.2 UserSettings.publicProfile field
- 09.2.3 Default privacy değerleri
- 09.2.4 Bulk privacy değişikliği

## 09.3 Follow Sistemi

- 09.3.1 Follow model yapısı
- 09.3.2 Self-referential many-to-many
- 09.3.3 Follower vs Following
- 09.3.4 Follow request (planlanan)
- 09.3.5 Block functionality (planlanan)

## 09.4 Reaction Sistemi

- 09.4.1 Reaction model yapısı
- 09.4.2 Reaction types (like, love, etc.)
- 09.4.3 One reaction per user per sequence per type
- 09.4.4 Reaction counts

## 09.5 Comment Sistemi

- 09.5.1 Comment model yapısı
- 09.5.2 Nested replies (parentId)
- 09.5.3 Reply depth limit
- 09.5.4 Comment moderation (planlanan)

## 09.6 Message Sistemi

- 09.6.1 Message model yapısı
- 09.6.2 Direct messages
- 09.6.3 Read/unread status
- 09.6.4 Real-time updates (planlanan)

## 09.7 Notification Sistemi

- 09.7.1 Notification model yapısı
- 09.7.2 Notification types
- 09.7.3 referenceId/referenceType kullanımı
- 09.7.4 Push notifications (planlanan)
- 09.7.5 Email notifications (planlanan)

## 09.8 Feed Algoritması (Planlanan)

- 09.8.1 Following feed
- 09.8.2 Explore/Discover feed
- 09.8.3 Chronological vs Algorithmic

## 09.9 Public Profile

- 09.9.1 Profile page yapısı
- 09.9.2 Public sequences
- 09.9.3 Follower/following counts
- 09.9.4 Bio ve avatar

## 09.10 Social API Endpoints (Planlanan)

- 09.10.1 Follow endpoints
- 09.10.2 Reaction endpoints
- 09.10.3 Comment endpoints
- 09.10.4 Notification endpoints
- 09.10.5 Feed endpoints

## 09.11 Privacy & Safety

- 09.11.1 Block functionality
- 09.11.2 Report functionality
- 09.11.3 Content moderation
- 09.11.4 GDPR considerations

## 09.12 Test Senaryoları

- 09.12.1 Follow/unfollow tests
- 09.12.2 Reaction tests
- 09.12.3 Comment tests
- 09.12.4 Privacy tests

---

# CHAPTER 10: i18n VE LOCALIZATION

## 10.1 i18n Stratejisi

- 10.1.1 Neden next-intl
- 10.1.2 Desteklenen diller (en, tr, nl)
- 10.1.3 Default language
- 10.1.4 Language detection

## 10.2 packages/i18n Yapısı

- 10.2.1 config.ts
- 10.2.2 types.ts
- 10.2.3 index.ts exports
- 10.2.4 messages/ klasörü

## 10.3 Message Dosyaları

- 10.3.1 en.ts yapısı
- 10.3.2 tr.ts yapısı
- 10.3.3 nl.ts yapısı
- 10.3.4 Message key conventions
- 10.3.5 Nested messages

## 10.4 URL-based Locale

- 10.4.1 /[locale]/ route yapısı
- 10.4.2 Middleware locale detection
- 10.4.3 Locale switching
- 10.4.4 Locale persistence

## 10.5 Component Integration

- 10.5.1 useTranslations hook
- 10.5.2 getTranslations (server)
- 10.5.3 locale-switcher.tsx component
- 10.5.4 Interpolation ve pluralization

## 10.6 Database Multilingual Content

- 10.6.1 Quote model (textEn, textTr, textNl)
- 10.6.2 Emotion/Trigger key → translation
- 10.6.3 Dynamic content translation

## 10.7 Date/Time Formatting

- 10.7.1 Locale-aware date formatting
- 10.7.2 Relative time (5 minutes ago)
- 10.7.3 Timezone handling

## 10.8 Number Formatting

- 10.8.1 Number formatting
- 10.8.2 Currency (gelecek)
- 10.8.3 Percentages

## 10.9 RTL Support (Gelecek)

- 10.9.1 RTL languages (Arabic, Hebrew)
- 10.9.2 CSS considerations
- 10.9.3 Component adaptations

## 10.10 Translation Workflow

- 10.10.1 Yeni key ekleme
- 10.10.2 Missing translation handling
- 10.10.3 Translation review process

## 10.11 Test Senaryoları

- 10.11.1 Language switching tests
- 10.11.2 Translation key coverage
- 10.11.3 Interpolation tests

---

# CHAPTER 11: FILE UPLOAD VE MEDIA

## 11.1 Mevcut Durum

- 11.1.1 Eski Cloudinary entegrasyonu
- 11.1.2 Mevcut image URL'leri
- 11.1.3 Güvenlik sorunları

## 11.2 Yeni Upload Stratejisi (Planlanan)

- 11.2.1 Storage seçenekleri (S3, Cloudflare R2, Vercel Blob)
- 11.2.2 Güvenlik gereksinimleri
- 11.2.3 Cost analizi

## 11.3 Image Upload Flow

- 11.3.1 Client-side validation
- 11.3.2 File size limits
- 11.3.3 Allowed formats
- 11.3.4 Compression/resize

## 11.4 Signed URLs

- 11.4.1 Upload signed URL
- 11.4.2 Download signed URL
- 11.4.3 URL expiration

## 11.5 Image Processing

- 11.5.1 Thumbnail generation
- 11.5.2 Multiple sizes
- 11.5.3 Format conversion (WebP)
- 11.5.4 EXIF data handling

## 11.6 Storage Structure

- 11.6.1 Folder/key naming
- 11.6.2 User isolation
- 11.6.3 Cleanup policy

## 11.7 CDN Integration

- 11.7.1 CDN caching
- 11.7.2 Cache invalidation
- 11.7.3 Geographic distribution

## 11.8 Profile Images

- 11.8.1 Avatar upload
- 11.8.2 Default avatars
- 11.8.3 Gravatar fallback

## 11.9 Sequence Images

- 11.9.1 Sequence cover image
- 11.9.2 Image in notes (gelecek)
- 11.9.3 Multiple images (gelecek)

## 11.10 Person Images

- 11.10.1 Person avatar
- 11.10.2 Privacy considerations

## 11.11 Security Considerations

- 11.11.1 File type validation (magic bytes)
- 11.11.2 Malware scanning
- 11.11.3 Size limits
- 11.11.4 Rate limiting

## 11.12 Migration Plan

- 11.12.1 Eski Cloudinary URL'leri koruma
- 11.12.2 Yeni upload sistemi
- 11.12.3 Gradual migration

## 11.13 Test Senaryoları

- 11.13.1 Upload tests
- 11.13.2 Validation tests
- 11.13.3 Security tests

---

# CHAPTER 12: SECURITY DEEP DIVE

## 12.1 Security Overview

- 12.1.1 Security principles
- 12.1.2 Threat model
- 12.1.3 OWASP Top 10 checklist

## 12.2 Authentication Security

- 12.2.1 Password hashing (bcrypt)
- 12.2.2 Session security
- 12.2.3 Token security
- 12.2.4 OAuth security
- 12.2.5 Brute force protection

## 12.3 Authorization Security

- 12.3.1 Resource ownership checks
- 12.3.2 Admin privilege checks
- 12.3.3 API route protection
- 12.3.4 IDOR prevention

## 12.4 Input Validation

- 12.4.1 Zod validation
- 12.4.2 SQL injection prevention (Prisma)
- 12.4.3 XSS prevention
- 12.4.4 NoSQL injection (N/A but noted)

## 12.5 Output Encoding

- 12.5.1 React auto-escaping
- 12.5.2 HTML sanitization
- 12.5.3 JSON encoding

## 12.6 CSRF Protection

- 12.6.1 Auth.js CSRF tokens
- 12.6.2 SameSite cookies
- 12.6.3 Origin validation

## 12.7 CORS Configuration

- 12.7.1 Allowed origins
- 12.7.2 Allowed methods
- 12.7.3 Credentials handling

## 12.8 Rate Limiting

- 12.8.1 API rate limiting (TODO)
- 12.8.2 Login rate limiting
- 12.8.3 Upload rate limiting
- 12.8.4 Sosyal Spam ve İstismar Önleme
  - Bot saldırı tespiti ve engelleme
    - Headless browser detection (Puppeteer, Playwright signatures)
    - Behavioral analysis (mouse movement, typing patterns)
    - CAPTCHA/hCaptcha entegrasyonu (suspicious activity threshold)
  - Sahte etkileşim (reaction/comment spam) önleme
    - Honeypot fields for forms
    - Velocity checks (X reaction per minute limit)
    - Duplicate content detection (fuzzy matching)
    - Suspicious pattern detection (burst activity)
  - Coordinated inauthentic behavior tespiti
    - Account age + activity correlation
    - IP/device fingerprint clustering
    - Graph-based spam ring detection
  - Automated moderation pipeline
    - Keyword/regex based filtering
    - ML-based toxicity scoring (future)
    - User reputation scoring sistemi
  - Abuse reporting ve escalation workflow
    - User report queue
    - Admin review interface
    - Appeal process

## 12.9 Secure Headers

- 12.9.1 Content-Security-Policy
- 12.9.2 X-Frame-Options
- 12.9.3 X-Content-Type-Options
- 12.9.4 Strict-Transport-Security
- 12.9.5 next.config.ts headers

## 12.10 Data Protection

- 12.10.1 Data encryption at rest
- 12.10.2 Data encryption in transit (TLS)
- 12.10.3 PII handling
- 12.10.4 Data retention policy

## 12.11 Logging & Monitoring

- 12.11.1 Security event logging
- 12.11.2 Audit trail
- 12.11.3 Anomaly detection
- 12.11.4 Incident response

## 12.12 Dependency Security

- 12.12.1 npm audit
- 12.12.2 Dependabot
- 12.12.3 Supply chain security

## 12.13 Infrastructure Security

- 12.13.1 Environment variables
- 12.13.2 Secrets management
- 12.13.3 Database security
- 12.13.4 Docker security

## 12.14 Security Checklist

- 12.14.1 Development checklist
- 12.14.2 Deployment checklist
- 12.14.3 Regular audit checklist

## 12.15 Security Test Senaryoları

- 12.15.1 Authentication bypass tests
- 12.15.2 Authorization bypass tests
- 12.15.3 Injection tests
- 12.15.4 XSS tests

---

# CHAPTER 13: TEST STRATEJİSİ

## 13.1 Test Pyramid

- 13.1.1 Unit tests (base)
- 13.1.2 Integration tests (middle)
- 13.1.3 E2E tests (top)
- 13.1.4 Test coverage goals

## 13.2 Test Tools

- 13.2.1 Vitest (unit/integration)
- 13.2.2 Playwright (E2E)
- 13.2.3 Testing Library
- 13.2.4 MSW (API mocking)

## 13.3 Vitest Setup

- 13.3.1 vitest.config.ts
- 13.3.2 Test environment (jsdom)
- 13.3.3 Coverage configuration
- 13.3.4 setup.ts file

## 13.4 Unit Test Patterns

- 13.4.1 Component unit tests
- 13.4.2 Utility function tests
- 13.4.3 Hook tests
- 13.4.4 Schema validation tests

## 13.5 Integration Test Patterns

- 13.5.1 API route tests
- 13.5.2 Database integration tests
- 13.5.3 Auth flow tests
- 13.5.4 Test database setup

## 13.6 Playwright Setup

- 13.6.1 playwright.config.ts
- 13.6.2 Test fixtures
- 13.6.3 Page objects
- 13.6.4 Test data seeding

## 13.7 E2E Test Senaryoları

- 13.7.1 create-sequence.spec.ts analizi
- 13.7.2 storyboard.spec.ts analizi
- 13.7.3 Auth E2E tests
- 13.7.4 Full user journey tests

## 13.8 Mevcut Testler Analizi

- 13.8.1 quote-splash.test.tsx
- 13.8.2 polarity.test.ts
- 13.8.3 Coverage gaps

## 13.9 Test Data Management

- 13.9.1 Fixtures
- 13.9.2 Factories
- 13.9.3 Seed data
- 13.9.4 Test isolation

## 13.10 CI/CD Integration

- 13.10.1 GitHub Actions tests
- 13.10.2 Test parallelization
- 13.10.3 Coverage reporting
- 13.10.4 Failure notifications

## 13.11 Test Categories by Feature

- 13.11.1 Auth tests
- 13.11.2 Sequence tests
- 13.11.3 People tests
- 13.11.4 Storyboard tests
- 13.11.5 i18n tests
- 13.11.6 Admin tests

## 13.12 Performance Testing

- 13.12.1 Load testing (k6)
- 13.12.2 Lighthouse CI
- 13.12.3 Bundle size monitoring

## 13.13 Visual Regression Testing

- 13.13.1 Playwright screenshots
- 13.13.2 Component snapshots
- 13.13.3 Visual diff tools

---

# CHAPTER 14: PERFORMANCE VE OPTİMİZASYON

## 14.1 Performance Goals

- 14.1.1 Core Web Vitals targets
- 14.1.2 API response time targets
- 14.1.3 Bundle size targets
- 14.1.4 Database query targets

## 14.2 Next.js Optimizations

- 14.2.1 Server Components
- 14.2.2 Streaming SSR
- 14.2.3 Static generation
- 14.2.4 ISR (Incremental Static Regeneration)
- 14.2.5 Image optimization

## 14.3 React Optimizations

- 14.3.1 React.memo
- 14.3.2 useMemo / useCallback
- 14.3.3 Code splitting
- 14.3.4 Lazy loading
- 14.3.5 Suspense boundaries

## 14.4 Database Optimizations

- 14.4.1 Query optimization
- 14.4.2 Index usage
- 14.4.3 N+1 query prevention
- 14.4.4 Connection pooling
- 14.4.5 Read replicas (gelecek)

## 14.5 Caching Strategies

- 14.5.1 React Query caching
- 14.5.2 HTTP caching headers
- 14.5.3 CDN caching
- 14.5.4 Database query caching
- 14.5.5 Redis caching (gelecek)

## 14.6 Bundle Optimization

- 14.6.1 Tree shaking
- 14.6.2 Code splitting
- 14.6.3 Dynamic imports
- 14.6.4 Package analysis
- 14.6.5 Dependency optimization

## 14.7 Image Optimization

- 14.7.1 next/image usage
- 14.7.2 Responsive images
- 14.7.3 Format selection (WebP, AVIF)
- 14.7.4 Lazy loading
- 14.7.5 Placeholder blur

## 14.8 Font Optimization

- 14.8.1 Font subsetting
- 14.8.2 Font display strategy
- 14.8.3 Local fonts (Geist)
- 14.8.4 Preloading

## 14.9 API Performance

- 14.9.1 Response compression
- 14.9.2 Pagination
- 14.9.3 Field selection
- 14.9.4 Batching requests

## 14.10 Mobile Performance

- 14.10.1 React Native optimizations
- 14.10.2 Image caching
- 14.10.3 Offline support
- 14.10.4 Memory management

## 14.11 Monitoring & Profiling

- 14.11.1 Vercel Analytics
- 14.11.2 React DevTools Profiler
- 14.11.3 Lighthouse
- 14.11.4 Database query logging

## 14.12 Performance Testing

- 14.12.1 Lighthouse CI
- 14.12.2 Bundle analysis
- 14.12.3 Load testing
- 14.12.4 Real user monitoring

---

# CHAPTER 15: DEPLOYMENT VE INFRASTRUCTURE

## 15.1 Deployment Overview

- 15.1.1 Production environment
- 15.1.2 Staging environment
- 15.1.3 Development environment
- 15.1.4 Environment parity

## 15.2 Vercel Deployment

- 15.2.1 vercel.json konfigürasyonu
- 15.2.2 Build command
- 15.2.3 Output directory
- 15.2.4 Environment variables
- 15.2.5 Domain configuration

## 15.3 Docker Setup

- 15.3.1 Dockerfile analizi
- 15.3.2 Multi-stage builds
- 15.3.3 Base image
- 15.3.4 Builder stage
- 15.3.5 Runner stage
- 15.3.6 Development stage

## 15.4 Docker Compose

- 15.4.1 docker-compose.yml analizi
- 15.4.2 db service
- 15.4.3 web service
- 15.4.4 migrate service
- 15.4.5 Healthchecks
- 15.4.6 Volumes

## 15.5 Database Deployment

- 15.5.1 PostgreSQL setup
- 15.5.2 Connection string
- 15.5.3 SSL configuration
- 15.5.4 Backup strategy
- 15.5.5 Migration strategy

## 15.6 Environment Variables

- 15.6.1 Required variables listesi
- 15.6.2 Database URLs
- 15.6.3 Auth secrets
- 15.6.4 OAuth credentials
- 15.6.5 Public vs private vars

## 15.7 CI/CD Pipeline

- 15.7.1 GitHub Actions workflow
- 15.7.2 Build step
- 15.7.3 Test step
- 15.7.4 Deploy step
- 15.7.5 Notifications

## 15.8 Scripts

- 15.8.1 runner.js (cross-platform start)
- 15.8.2 start.sh (Unix)
- 15.8.3 start.ps1 (Windows)
- 15.8.4 Database scripts

## 15.9 Monitoring & Logging

- 15.9.1 Application logs
- 15.9.2 Error tracking (Sentry)
- 15.9.3 Uptime monitoring
- 15.9.4 Performance monitoring
- 15.9.5 Gelişmiş İzleme (Observability)
  - Hata anında yakalanacak context verileri
    - Request metadata (URL, method, headers, body snapshot)
    - User context (userId, sessionId, locale, theme)
    - Device/browser fingerprint
    - Navigation history (son 5 sayfa)
    - Feature flags ve A/B test variant'ları
  - Kullanıcı metadata enrichment
    - Account age, subscription tier
    - Sequence count, last activity timestamp
    - Geographic region (IP-based, GDPR compliant)
  - Sentry konfigürasyonu
    - DSN ve environment ayarları
    - beforeSend hook ile PII scrubbing
    - Custom tags ve contexts
    - Release tracking ve source maps
    - Issue grouping kuralları
  - Structured logging stratejisi
    - JSON log formatı
    - Log levels (debug, info, warn, error, fatal)
    - Correlation ID ile request tracing
    - Sensitive data maskeleme
  - Log aggregation ve retention
    - Vercel Logs / Datadog / Logtail entegrasyonu
    - Log rotation ve retention policy
    - Alert rules ve thresholds
  - Distributed tracing (gelecek)
    - OpenTelemetry entegrasyonu
    - Span propagation across services

## 15.10 Scaling Strategies

- 15.10.1 Horizontal scaling
- 15.10.2 Database scaling
- 15.10.3 CDN utilization
- 15.10.4 Edge functions

## 15.11 Backup & Recovery

- 15.11.1 Database backups
- 15.11.2 Point-in-time recovery
- 15.11.3 Disaster recovery plan
- 15.11.4 Backup testing

## 15.12 Security in Production

- 15.12.1 SSL/TLS
- 15.12.2 WAF
- 15.12.3 DDoS protection
- 15.12.4 Secret rotation

---

# CHAPTER 16: MOBILE APPLICATION

## 16.1 Mobile Stack Overview

- 16.1.1 React Native + Expo
- 16.1.2 Neden Expo seçildi
- 16.1.3 Expo SDK version
- 16.1.4 Target platforms (iOS, Android)

## 16.2 apps/mobile Yapısı

- 16.2.1 Klasör yapısı
- 16.2.2 app/ (Expo Router)
- 16.2.3 package.json dependencies
- 16.2.4 Configuration files

## 16.3 Expo Router

- 16.3.1 File-based routing
- 16.3.2 \_layout.tsx
- 16.3.3 index.tsx (home)
- 16.3.4 create.tsx
- 16.3.5 storyboard.tsx
- 16.3.6 people.tsx

## 16.4 Styling (NativeWind)

- 16.4.1 NativeWind kurulumu
- 16.4.2 Tailwind config
- 16.4.3 Platform-specific styles
- 16.4.4 Theme support

## 16.5 API Integration

- 16.5.1 API client setup
- 16.5.2 Authentication (SecureStore)
- 16.5.3 TanStack Query usage
- 16.5.4 Offline support plans
- 16.5.5 Çevrimdışı Veri Senkronizasyonu (Sync Conflict)
  - Offline-first mimari yaklaşımı
    - Local-first data storage (SQLite / WatermelonDB)
    - Optimistic UI updates
    - Background sync queue
  - Conflict detection stratejileri
    - Version vector / Lamport timestamp kullanımı
    - updatedAt field comparison
    - Entity-level vs field-level conflict detection
  - Conflict resolution politikaları
    - Last-Write-Wins (LWW) - default strateji
    - Server-Wins (kritik veriler için)
    - Client-Wins (draft/local-only content)
    - Manual merge (karmaşık conflict'ler için UI)
  - Merge algoritmaları
    - Three-way merge for text fields
    - CRDT (Conflict-free Replicated Data Types) değerlendirmesi
    - Operational Transformation (OT) alternatifleri
  - Sync queue yönetimi
    - Pending operations persistence
    - Retry logic with exponential backoff
    - Conflict queue ve user notification
  - Edge case'ler
    - Aynı sequence'ın farklı cihazlarda düzenlenmesi
    - Uzun süre offline kalan cihaz senaryosu
    - Delete vs update conflict
    - Account merge (aynı kullanıcı farklı cihaz)
  - UX considerations
    - Sync status indicator
    - Conflict resolution UI/modal
    - "Sync failed" notification ve retry action

## 16.6 Authentication Flow

- 16.6.1 OAuth on mobile
- 16.6.2 Token storage (SecureStore)
- 16.6.3 Token refresh
- 16.6.4 Biometric auth (gelecek)

## 16.7 Navigation

- 16.7.1 Tab navigation
- 16.7.2 Stack navigation
- 16.7.3 Deep linking
- 16.7.4 Navigation state

## 16.8 Shared Packages

- 16.8.1 @seq/config (mobile)
- 16.8.2 @seq/i18n (mobile)
- 16.8.3 Type sharing with web

## 16.9 Platform-Specific Code

- 16.9.1 Platform detection
- 16.9.2 Platform extensions (.ios.tsx, .android.tsx)
- 16.9.3 Platform-specific UI

## 16.10 Push Notifications (Planlanan)

- 16.10.1 Expo Notifications
- 16.10.2 Push token management
- 16.10.3 Notification types
- 16.10.4 Background handling

## 16.11 Build & Deploy

- 16.11.1 EAS Build
- 16.11.2 App Store submission
- 16.11.3 Play Store submission
- 16.11.4 OTA updates

## 16.12 Mobile-Specific Testing

- 16.12.1 Jest for RN
- 16.12.2 Detox E2E
- 16.12.3 Device testing
- 16.12.4 Simulator testing

---

# CHAPTER 17: ADMIN PANEL

## 17.1 Admin Panel Overview

- 17.1.1 Admin panel amacı
- 17.1.2 Erişim kontrolü (isAdmin)
- 17.1.3 Admin route'ları

## 17.2 Admin Routes

- 17.2.1 /[locale]/admin/page.tsx
- 17.2.2 Admin layout (planlanan)
- 17.2.3 Admin navigation

## 17.3 Admin Dashboard

- 17.3.1 dashboard.tsx component
- 17.3.2 Overview metrics
- 17.3.3 Quick actions
- 17.3.4 Recent activity

## 17.4 System Settings

- 17.4.1 SystemSettings model
- 17.4.2 /api/admin/settings endpoint
- 17.4.3 Settings form
- 17.4.4 Editable fields

## 17.5 User Management (Planlanan)

- 17.5.1 User listesi
- 17.5.2 User detayı
- 17.5.3 User ban/unban
- 17.5.4 Admin role assignment

## 17.6 Content Management (Planlanan)

- 17.6.1 Quote management
- 17.6.2 Emotion/Trigger editing
- 17.6.3 Reported content review

## 17.7 Analytics Dashboard (Planlanan)

- 17.7.1 User statistics
- 17.7.2 Sequence statistics
- 17.7.3 Engagement metrics
- 17.7.4 Growth charts

## 17.8 Maintenance Mode

- 17.8.1 maintenanceMode flag
- 17.8.2 Maintenance page
- 17.8.3 Admin bypass

## 17.9 Audit Logs (Planlanan)

- 17.9.1 Log model
- 17.9.2 Logged actions
- 17.9.3 Log viewer
- 17.9.4 Log retention

## 17.10 Admin Security

- 17.10.1 Admin auth checks
- 17.10.2 IP restrictions (planlanan)
- 17.10.3 2FA for admin (planlanan)
- 17.10.4 Admin activity logging

---

# CHAPTER 18: PSYCHOLOGIST PORTAL (GELECEK)

## 18.1 B2B Vision

- 18.1.1 Hedef kullanıcılar
- 18.1.2 Use case'ler
- 18.1.3 Competitive landscape
- 18.1.4 Revenue model

## 18.2 Multi-Tenant Architecture

- 18.2.1 Tenant model (Clinic)
- 18.2.2 Practitioner model
- 18.2.3 Client-Practitioner ilişkisi
- 18.2.4 Data isolation

## 18.3 Practitioner Features

- 18.3.1 Client management
- 18.3.2 Session notes
- 18.3.3 Progress tracking
- 18.3.4 CBT analysis reports

## 18.4 Client Features

- 18.4.1 Shared sequences
- 18.4.2 Homework assignments
- 18.4.3 Progress visibility
- 18.4.4 Messaging with practitioner

## 18.5 Clinic Features

- 18.5.1 Practitioner management
- 18.5.2 Billing
- 18.5.3 Clinic settings
- 18.5.4 Branding customization

## 18.6 Privacy & Compliance

- 18.6.1 KVKK compliance
- 18.6.2 HIPAA compliance
- 18.6.3 Data encryption
- 18.6.4 Consent management
- 18.6.5 Audit trails

## 18.7 Integration Points

- 18.7.1 Calendar integration
- 18.7.2 Video call integration
- 18.7.3 Payment integration
- 18.7.4 EHR integration

## 18.8 Technical Considerations

- 18.8.1 Database changes
- 18.8.2 Auth changes
- 18.8.3 API changes
- 18.8.4 UI/UX changes

## 18.9 Rollout Plan

- 18.9.1 Phase 1: Beta
- 18.9.2 Phase 2: Limited release
- 18.9.3 Phase 3: General availability

---

# CHAPTER 19: ERROR HANDLING VE EDGE CASES

## 19.1 Error Handling Strategy

- 19.1.1 Error boundaries
- 19.1.2 Try-catch patterns
- 19.1.3 Graceful degradation
- 19.1.4 User-friendly messages

## 19.2 Client-Side Errors

- 19.2.1 React error boundaries
- 19.2.2 Form validation errors
- 19.2.3 Network errors
- 19.2.4 Timeout handling

## 19.3 Server-Side Errors

- 19.3.1 API error responses
- 19.3.2 Database errors
- 19.3.3 Auth errors
- 19.3.4 Validation errors

## 19.4 Error Response Format

- 19.4.1 Standard error schema
- 19.4.2 Error codes
- 19.4.3 Error messages
- 19.4.4 Stack traces (dev only)

## 19.5 Edge Cases - Auth

- 19.5.1 Expired session
- 19.5.2 Invalid token
- 19.5.3 OAuth callback errors
- 19.5.4 Account linking conflicts

## 19.6 Edge Cases - Sequences

- 19.6.1 Concurrent edits
- 19.6.2 Large payload
- 19.6.3 Invalid emotionId/triggerId
- 19.6.4 Missing required fields

## 19.7 Edge Cases - People

- 19.7.1 Duplicate names
- 19.7.2 Self-reference
- 19.7.3 Circular relationships
- 19.7.4 Orphaned SequencePerson

## 19.8 Edge Cases - Social

- 19.8.1 Self-follow
- 19.8.2 Self-message
- 19.8.3 Infinite reply nesting
- 19.8.4 Deleted content references

## 19.9 Edge Cases - Data

- 19.9.1 Unicode handling
- 19.9.2 Very long text
- 19.9.3 Special characters
- 19.9.4 Date edge cases (timezone, DST)

## 19.10 Logging & Monitoring

- 19.10.1 Error logging format
- 19.10.2 Log levels
- 19.10.3 Error aggregation
- 19.10.4 Alerting thresholds

## 19.11 Recovery Procedures

- 19.11.1 Auto-retry logic
- 19.11.2 Manual recovery
- 19.11.3 Data repair scripts
- 19.11.4 Rollback procedures

## 19.12 Edge Case Test Matrix

- 19.12.1 Test senaryoları tablosu
- 19.12.2 Priority sıralaması
- 19.12.3 Coverage status

---

# CHAPTER 20: CODE STANDARDS VE CONVENTIONS

## 20.1 General Principles

- 20.1.1 RFCE pattern
- 20.1.2 Readability first
- 20.1.3 Zero redundancy
- 20.1.4 Explicit over implicit

## 20.2 TypeScript Standards

- 20.2.1 Strict mode
- 20.2.2 Type vs Interface
- 20.2.3 Explicit return types
- 20.2.4 No any usage
- 20.2.5 Type exports

## 20.3 Naming Conventions

- 20.3.1 Files: kebab-case
- 20.3.2 Components: PascalCase
- 20.3.3 Functions: camelCase
- 20.3.4 Constants: SCREAMING_SNAKE_CASE
- 20.3.5 Types: PascalCase with suffix

## 20.4 File Structure

- 20.4.1 One component per file
- 20.4.2 Co-located tests
- 20.4.3 Barrel exports
- 20.4.4 Component file structure

## 20.5 Import Order

- 20.5.1 React/Next imports
- 20.5.2 External libraries
- 20.5.3 Internal packages (@seq/\*)
- 20.5.4 Relative imports
- 20.5.5 Type imports

## 20.6 Component Structure

- 20.6.1 Type definitions first
- 20.6.2 Props type
- 20.6.3 Hook calls
- 20.6.4 Handler functions
- 20.6.5 Render logic
- 20.6.6 Named export

## 20.7 Styling Standards

- 20.7.1 Tailwind only
- 20.7.2 cn() utility usage
- 20.7.3 No inline styles
- 20.7.4 Mobile-first
- 20.7.5 CSS variables for theming

## 20.8 State Management

- 20.8.1 Server state (React Query)
- 20.8.2 Client state (useState)
- 20.8.3 URL state
- 20.8.4 No prop drilling
- 20.8.5 Context usage

## 20.9 API Standards

- 20.9.1 Route handler structure
- 20.9.2 Response format
- 20.9.3 Error handling
- 20.9.4 Validation pattern

## 20.10 Database Standards

- 20.10.1 Prisma query patterns
- 20.10.2 Transaction usage
- 20.10.3 Include vs Select
- 20.10.4 Soft delete vs Hard delete

## 20.11 Testing Standards

- 20.11.1 Test file naming
- 20.11.2 Test structure (AAA)
- 20.11.3 Mock patterns
- 20.11.4 Assertion patterns

## 20.12 Comment Standards

- 20.12.1 No inline comments
- 20.12.2 Section dividers only
- 20.12.3 JSDoc for public APIs
- 20.12.4 TODO format

## 20.13 Git Conventions

- 20.13.1 Branch naming
- 20.13.2 Commit message format
- 20.13.3 PR template
- 20.13.4 Code review checklist

## 20.14 .cursorrules Summary

- 20.14.1 Mevcut kurallar özeti
- 20.14.2 Güncellenecek kurallar

---

# APPENDIX A: MIGRATION GUIDE

## A.1 Eski Sistemden Veri Aktarımı

- A.1.1 db.json analizi
- A.1.2 Type conversion
- A.1.3 Data transformation
- A.1.4 Validation

## A.2 Migration Script

- A.2.1 Script yapısı
- A.2.2 Error handling
- A.2.3 Rollback plan
- A.2.4 Verification

## A.3 Cloudinary URL Handling

- A.3.1 Mevcut URL'leri koruma
- A.3.2 URL mapping

## A.4 Kullanıcı Yeniden Doğrulama ve Geçiş Deneyimi

- A.4.1 Eski sistemden gelen kullanıcıların şifre uyumluluğu
  - Eski hash algoritması analizi (varsa)
  - Hash migration stratejisi (login sırasında re-hash)
  - Fallback authentication for legacy passwords
- A.4.2 İlk giriş (re-auth) akışı
  - Magic link ile yeniden doğrulama
  - Email verification requirement
  - Password reset zorunluluğu (güvenlik için)
  - OAuth linking prompt (Google hesabı bağlama)
- A.4.3 Account claim süreci
  - Eski email ile eşleştirme
  - Identity verification steps
  - Duplicate account merge handling
- A.4.4 Veri eşleştirme UX'i
  - Migration progress indicator
  - "Your data is being imported" splash screen
  - Sequence import preview ve onay
  - Import error handling ve retry
- A.4.5 Onboarding for migrated users
  - Welcome back messaging
  - New features tour (skip option)
  - Profile completion prompt (username, avatar)
- A.4.6 Rollback ve destek
  - Migration failure recovery
  - Support ticket integration
  - Manual data recovery procedures

---

# APPENDIX B: API REFERENCE

## B.1 Endpoint Listesi

- B.1.1 Tüm endpoint'ler tablosu
- B.1.2 Method, path, auth, description

## B.2 Request/Response Örnekleri

- B.2.1 Her endpoint için örnek

## B.3 Error Codes

- B.3.1 Error code listesi

---

# APPENDIX C: DATABASE SCRIPTS

## C.1 Schema Creation

## C.2 Seed Data

## C.3 Index Scripts

## C.4 Migration Scripts

## C.5 Backup Scripts

---

# APPENDIX D: GLOSSARY

## D.1 Terimler Sözlüğü

- D.1.1 CBT terimleri
- D.1.2 Teknik terimler
- D.1.3 Domain terimleri

---

# SONRAKI ADIMLAR

Bu iskelet onaylandıktan sonra:

1. Her chapter ayrı bir .md dosyası olarak yazılacak
2. Her chapter için ~1000-2000 satır hedeflenecek
3. Code örnekleri, diagramlar, tablolar dahil edilecek
4. Test senaryoları detaylandırılacak
5. Edge case'ler örneklenecek

**Onay bekleniyor...**
