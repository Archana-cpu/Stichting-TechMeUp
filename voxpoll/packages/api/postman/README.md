# VoxPoll API - Postman Collection

Bu klasörde VoxPoll API için Postman test koleksiyonu ve environment dosyaları bulunmaktadır.

## Dosyalar

- `VoxPoll-API.postman_collection.json` - Ana API koleksiyonu
- `VoxPoll-Local.postman_environment.json` - Local development ortamı
- `VoxPoll-Production.postman_environment.json` - Production ortamı (URL'i güncelleyin)

## Kurulum

1. Postman'i açın
2. **Import** butonuna tıklayın
3. Tüm JSON dosyalarını sürükleyip bırakın veya seçin
4. Koleksiyon ve environment'lar import edilecek

## Kullanım

### 1. Environment Seçimi
Sağ üst köşeden uygun environment'ı seçin:
- **VoxPoll - Local**: `http://localhost:3001` için
- **VoxPoll - Production**: Production API için

### 2. Authentication Flow

1. **Register** veya **Login** endpoint'ini çalıştırın
2. Token'lar otomatik olarak environment variable'lara kaydedilir
3. Diğer authenticated endpoint'ler otomatik olarak token'ı kullanır

### 3. Test Çalıştırma

#### Tek Request
- İstediğiniz request'i seçin
- **Send** butonuna tıklayın
- Response ve test sonuçlarını görün

#### Tüm Koleksiyon
1. Koleksiyona sağ tıklayın
2. **Run collection** seçin
3. Testleri sırayla veya paralel çalıştırın

## API Modülleri

### Health Check
- `GET /health` - Sistem sağlık durumu
- `GET /health/live` - Kubernetes liveness probe
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/deep` - Detaylı sistem kontrolü

### Auth
- `POST /auth/register` - Yeni kullanıcı kaydı
- `POST /auth/login` - Giriş ve token alma
- `POST /auth/logout` - Çıkış
- `POST /auth/refresh` - Token yenileme
- `GET /auth/me` - Mevcut kullanıcı bilgisi
- `GET /auth/sessions` - Aktif oturumlar
- `POST /auth/verify/email` - Email doğrulama
- `POST /auth/password/forgot` - Şifre sıfırlama isteği
- `POST /auth/password/reset` - Şifre sıfırlama
- `POST /auth/password/change` - Şifre değiştirme

### Users
- `GET /users/:username` - Kullanıcı profili
- `PATCH /users/me` - Profil güncelleme
- `GET /users/me/settings` - Ayarlar
- `POST /users/:username/follow` - Takip et
- `DELETE /users/:username/follow` - Takibi bırak
- `POST /users/:username/block` - Engelle
- `GET /users/search` - Kullanıcı arama

### Polls
- `GET /polls` - Poll listesi
- `POST /polls` - Yeni poll oluştur
- `GET /polls/:id` - Poll detayı
- `PATCH /polls/:id` - Poll güncelle
- `DELETE /polls/:id` - Poll sil
- `POST /polls/:id/vote` - Oy ver
- `GET /polls/:id/results` - Sonuçlar
- `GET /polls/:id/analytics` - Analitikler
- `POST /polls/:id/live/start` - Canlı poll başlat
- `POST /polls/:id/live/end` - Canlı poll bitir

### Surveys
- `GET /surveys` - Survey listesi
- `POST /surveys` - Yeni survey
- `GET /surveys/:id` - Survey detayı
- `POST /surveys/:id/sections` - Bölüm ekle
- `POST /surveys/:id/questions` - Soru ekle
- `POST /surveys/:id/publish` - Yayınla
- `POST /surveys/:id/respond` - Yanıtla
- `GET /surveys/:id/responses` - Yanıtlar
- `GET /surveys/:id/analytics` - Analitikler

### Tests
- `GET /tests` - Test listesi
- `POST /tests/personality` - Kişilik testi oluştur
- `POST /tests/quiz` - Quiz oluştur
- `GET /tests/:id` - Test detayı
- `POST /tests/:id/attempt` - Teste başla
- `POST /tests/:id/submit` - Testi bitir
- `GET /tests/:id/results` - Sonuçlar
- `GET /tests/:id/leaderboard` - Sıralama

### Comments
- `GET /discussions/:id/comments` - Yorumlar
- `POST /discussions/:id/comments` - Yorum ekle
- `PATCH /comments/:id` - Yorum düzenle
- `DELETE /comments/:id` - Yorum sil
- `POST /comments/:id/vote` - Yorum oyla

### Notifications
- `GET /notifications` - Bildirimler
- `GET /notifications/unread-count` - Okunmamış sayısı
- `POST /notifications/:id/read` - Okundu işaretle
- `POST /notifications/read-all` - Tümünü okundu işaretle
- `GET /notifications/preferences` - Tercihler
- `PATCH /notifications/preferences` - Tercih güncelle

### Organizations
- `GET /organizations` - Organizasyonlar
- `POST /organizations` - Yeni organizasyon
- `GET /organizations/:id` - Detay
- `PATCH /organizations/:id` - Güncelle
- `DELETE /organizations/:id` - Sil
- `GET /organizations/:id/members` - Üyeler
- `POST /organizations/:id/invitations` - Davet gönder
- `PATCH /organizations/:id/members/:userId/role` - Rol değiştir
- `DELETE /organizations/:id/members/:userId` - Üye çıkar

### Gamification
- `GET /gamification/profile` - Oyunlaştırma profili
- `GET /gamification/badges` - Tüm rozetler
- `GET /gamification/badges/earned` - Kazanılan rozetler
- `GET /gamification/leaderboard` - Lider tablosu
- `GET /gamification/xp-history` - XP geçmişi

### Payments
- `GET /payments/subscription` - Abonelik bilgisi
- `POST /payments/checkout` - Ödeme oturumu
- `POST /payments/cancel` - İptal
- `POST /payments/refund` - İade talebi
- `GET /payments/history` - Ödeme geçmişi

### Moderation (Admin)
- `POST /reports` - Rapor oluştur
- `GET /moderation/queue` - Moderasyon kuyruğu
- `POST /moderation/queue/:id/assign` - Ata
- `POST /moderation/queue/:id/resolve` - Çöz
- `POST /moderation/users/:id/suspend` - Askıya al
- `POST /moderation/users/:id/ban` - Yasakla

## Test Scripts

Her request'te otomatik testler bulunur:
- Status code kontrolü
- Response format kontrolü
- Token otomatik kaydetme
- Response time kontrolü (< 2000ms)

## Variables

Koleksiyonda kullanılan değişkenler:

| Variable | Açıklama |
|----------|----------|
| `baseUrl` | API base URL |
| `accessToken` | JWT access token |
| `refreshToken` | JWT refresh token |
| `userId` | Giriş yapan kullanıcı ID |
| `pollId` | Test edilen poll ID |
| `surveyId` | Test edilen survey ID |
| `testId` | Test edilen test ID |
| `organizationId` | Test edilen organizasyon ID |

## Newman ile CLI'dan Çalıştırma

```bash
# Newman kurulumu
npm install -g newman

# Koleksiyonu çalıştır
newman run VoxPoll-API.postman_collection.json \
  -e VoxPoll-Local.postman_environment.json \
  --reporters cli,json

# HTML rapor ile
newman run VoxPoll-API.postman_collection.json \
  -e VoxPoll-Local.postman_environment.json \
  --reporters cli,htmlextra
```

## CI/CD Integration

GitHub Actions örneği:

```yaml
- name: Run API Tests
  uses: matt-ball/newman-action@master
  with:
    collection: packages/api/postman/VoxPoll-API.postman_collection.json
    environment: packages/api/postman/VoxPoll-Local.postman_environment.json
```
