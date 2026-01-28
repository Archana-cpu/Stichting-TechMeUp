# VoxPoll Audit Changelog

> Bu dosya her denetimde yapılan kod ve bible değişikliklerini takip eder.

---

## Audit #1 - 2026-01-23

### Denetim Özeti
- **Denetim Tipi:** Kapsamlı kod-bible tutarlılık kontrolü
- **Denetçi:** Claude Opus 4.5
- **Kapsam:** Tüm backend API routes, controllers, services, repositories

### Bible Değişiklikleri

#### bible-api-flows.md

| Satır | Eski Değer | Yeni Değer | Sebep |
|-------|-----------|-----------|-------|
| 4 | Last Updated: 2026-01-22 | Last Updated: 2026-01-23 | Tarih güncelleme |
| 248 | POST /auth/verify-email | POST /auth/verify/confirm | Kod ile uyum |
| 252 | POST /auth/resend-verification | POST /auth/verify/send-code | Kod ile uyum |
| 289 | POST /auth/forgot-password | POST /auth/password/forgot | Kod ile uyum |
| 294 | POST /auth/reset-password | POST /auth/password/reset | Kod ile uyum |
| 387 | POST /auth/change-password | POST /auth/password/change | Kod ile uyum |
| 391-398 | Email change endpoints | Password set/status endpoints | Kod ile uyum |
| 445 | PUT /polls/:id | PATCH /polls/:id | HTTP method uyumu |
| 166 | GET /live/join/:code | POST /live/sessions/:code/join | Kod ile uyum |

### Kod Değişiklikleri

#### Yeni Dosyalar

| Dosya | Açıklama |
|-------|----------|
| packages/api/src/routes/search.ts | Global arama route'ları |
| packages/api/src/routes/feed.ts | Feed route'ları |
| packages/api/src/services/search.service.ts | Arama servisi |
| packages/api/src/services/feed.service.ts | Feed servisi |

#### Güncellenen Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| packages/api/src/routes/index.ts | searchRoutes, feedRoutes export eklendi |
| packages/api/src/routes/users.ts | 6 yeni route eklendi (votes, activity, demographics, badges/:id) |
| packages/api/src/controllers/user.controller.ts | 5 yeni method eklendi |
| packages/api/src/services/user.service.ts | 5 yeni method eklendi (getVoteHistory, getActivityFeed, getDemographics, updateDemographics, updateBadgeVisibility) |
| packages/api/src/index.ts | searchRoutes, feedRoutes import ve route eklendi |

#### Yeni API Endpointleri

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| /api/v1/users/me/votes | GET | Kullanıcının oy geçmişi |
| /api/v1/users/me/activity | GET | Kullanıcının aktivite akışı |
| /api/v1/users/me/demographics | GET | Kullanıcının demografik bilgileri |
| /api/v1/users/me/demographics | PATCH | Demografik bilgi güncelleme |
| /api/v1/users/me/badges/:id | PATCH | Badge görünürlük güncelleme |
| /api/v1/search | GET | Global arama |
| /api/v1/search/tags | GET | Tag araması |
| /api/v1/search/suggestions | GET | Arama önerileri |
| /api/v1/feed | GET | Kişiselleştirilmiş feed |
| /api/v1/feed/trending | GET | Trending içerik |
| /api/v1/feed/following | GET | Takip edilen kullanıcıların içerikleri |

### Tespit Edilen Tutarsızlıklar (Çözüldü)

| # | Tutarsızlık | Çözüm |
|---|------------|-------|
| 1 | Auth path uyumsuzlukları | Bible güncellendi |
| 2 | PUT vs PATCH method farkı | Bible güncellendi |
| 3 | Live poll path farklılıkları | Bible güncellendi |
| 4 | Eksik user routes | Kod eklendi |
| 5 | Eksik search routes | Kod eklendi |
| 6 | Eksik feed routes | Kod eklendi |

### TypeScript Düzeltmeleri

| Dosya | Hata | Düzeltme |
|-------|------|----------|
| packages/api/src/services/search.service.ts | `users.reputation` mevcut değil | `users.trustScoreValue` olarak değiştirildi |
| packages/api/src/services/search.service.ts | avatarUrl tip uyumsuzluğu (null vs undefined) | `avatarUrl?: string \| null` olarak güncellendi |
| packages/api/src/routes/users.ts | Route sırası hatalı - `/me/*` rotaları `/:username`'den sonra | Tüm `/me/*` rotaları `/:username`'den önce konumlandırıldı |
| packages/api/src/services/user.service.ts | `isPinned` userBadges şemasında mevcut değil | `displayOrder` kullanılacak şekilde refaktör edildi |
| packages/api/src/services/user.service.ts | `educationLevel` enum tip uyumsuzluğu | updateDemographics'ten educationLevel çıkarıldı (immutable alan) |
| packages/api/src/controllers/user.controller.ts | updateBadge body tipi güncellendi | `pinned` → `displayOrder` |

### Unit Test Dosyaları

| Dosya | Açıklama |
|-------|----------|
| packages/api/src/services/user.service.test.ts | Tamamen yeniden yazıldı (eski methodlar kaldırıldı) |
| packages/api/src/services/search.service.test.ts | Yeni - Arama servisi testleri |
| packages/api/src/services/feed.service.test.ts | Yeni - Feed servisi testleri |

### OpenAPI Güncellemeleri

| Değişiklik | Açıklama |
|------------|----------|
| Tags | Search, Feed tag'leri eklendi |
| Schemas | SearchResult, SearchSuggestions, FeedItem, UserSummary, CategorySummary, Tag şemaları eklendi |

### Sonraki Adımlar

- [x] TypeScript build kontrolü
- [x] Unit test yazımı (yeni endpointler için)
- [x] API dokümantasyonu güncelleme (OpenAPI)
- [x] user.service.test.ts güncelleme (eski methodlar silinmiş)

---

## Audit Log Format

Her audit için aşağıdaki bilgiler kaydedilmelidir:

```
## Audit #N - YYYY-MM-DD

### Denetim Özeti
- Denetim Tipi: (Rutin/Kapsamlı/Güvenlik/Performans)
- Denetçi:
- Kapsam:

### Bible Değişiklikleri
[Tablo formatında değişiklikler]

### Kod Değişiklikleri
[Yeni dosyalar ve güncellenen dosyalar listesi]

### Tespit Edilen Tutarsızlıklar
[Bulunan ve çözülen tutarsızlıklar]

### Sonraki Adımlar
[Takip edilmesi gereken işlemler]
```
