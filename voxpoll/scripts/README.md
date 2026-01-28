# VoxPoll Scripts

Herhangi bir PC'de Docker varsa projeyi kolayca çalıştırabilirsin.

## 🚀 İlk Kurulum (Sadece Bir Kez)

### Windows (PowerShell)
```powershell
.\scripts\setup.ps1
```

### Mac/Linux
```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

## 📋 Günlük Kullanım

| Script | Açıklama |
|--------|----------|
| `dev` | Tüm servisleri başlat (API + Web) |
| `dev-api` | Sadece API |
| `dev-web` | Sadece Web |
| `dev-mobile` | Sadece Mobile (Expo) |
| `start` | Docker servislerini başlat |
| `stop` | Docker servislerini durdur |
| `db push` | Schema'yı veritabanına uygula |
| `db studio` | Drizzle Studio aç |
| `reset` | Her şeyi sil, sıfırdan başla |

### Windows (PowerShell)
```powershell
.\scripts\dev.ps1        # Hepsini başlat
.\scripts\dev-api.ps1    # Sadece API
.\scripts\dev-web.ps1    # Sadece Web
.\scripts\dev-mobile.ps1 # Sadece Mobile
.\scripts\stop.ps1       # Durdur
.\scripts\db.ps1 push    # DB güncelle
.\scripts\db.ps1 studio  # DB UI aç
```

### Mac/Linux
```bash
./scripts/dev.sh         # Hepsini başlat
./scripts/dev-api.sh     # Sadece API
./scripts/dev-web.sh     # Sadece Web
./scripts/dev-mobile.sh  # Sadece Mobile
./scripts/stop.sh        # Durdur
```

## 🔗 Servis URL'leri

| Servis | URL |
|--------|-----|
| **API** | http://localhost:3001 |
| **API Docs** | http://localhost:3001/api/docs |
| **Web** | http://localhost:3000 |
| **Drizzle Studio** | https://local.drizzle.studio |
| **PostgreSQL** | localhost:5432 |
| **Redis** | localhost:6379 |
| **Meilisearch** | http://localhost:7700 |
| **MinIO Console** | http://localhost:9001 |
| **Mailpit (Email)** | http://localhost:8025 |

## 🔐 Varsayılan Credentials

| Servis | User | Password |
|--------|------|----------|
| PostgreSQL | voxpoll | voxpoll123 |
| Redis | - | voxpoll123 |
| MinIO | voxpoll | voxpoll123 |
| Meilisearch | - | voxpoll_search_key |

## 💡 Sorun Giderme

### Docker başlamıyor
```powershell
# Docker Desktop'ı yeniden başlat
# Veya:
docker compose down
docker compose up -d
```

### Port kullanımda
```powershell
# Hangi process kullanıyor?
netstat -ano | findstr :5432
# Process'i kapat veya .env'de portu değiştir
```

### Veritabanı bozuldu
```powershell
.\scripts\db.ps1 reset   # Tüm tabloları sil
.\scripts\db.ps1 push    # Schema'yı yeniden oluştur
```

### Her şeyi sıfırla
```powershell
.\scripts\reset.ps1      # ⚠️ TÜM VERİLER SİLİNİR
.\scripts\setup.ps1      # Yeniden kur
```
