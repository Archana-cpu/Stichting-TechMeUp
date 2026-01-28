# ═══════════════════════════════════════════════════════════════════════════════
# CLAUDE CODE - BIBLE KURALLARI
# ═══════════════════════════════════════════════════════════════════════════════
# Bu dosya Claude Code'un VoxPoll projesi uzerinde calisirken uyacagi kurallari tanimlar.
# Her oturum basinda bu dosya okunmali ve kurallara uyulmalidir.
# ═══════════════════════════════════════════════════════════════════════════════

## 1. Temel Prensipler

### 1.1 Bible Hierarchy (Oncelik Sirasi)
```
1. 08-AUTHORITATIVE/*     <- EN YUKSEK (diger tum kaynaklari override eder)
2. 00-MASTER/DECISIONS.md <- Tum P-xxx kararlari
3. Ilgili feature dosyasi <- Feature-specific kurallar
4. 99-TRACKING/GAPS.md    <- Bilinen sorunlar ve cozumler
5. _archive/*             <- Sadece referans (aktif kullanilmaz)
```

### 1.2 Kod Yazarken
- [ ] Kod yazmadan once ilgili bible section'ini oku
- [ ] 08-AUTHORITATIVE'da override var mi kontrol et
- [ ] GAPS.md'de bilinen sorun var mi bak
- [ ] Kod ile bible arasinda uyumsuzluk varsa GAPS.md'ye kaydet

---

## 2. Her Kod Degisikliginde Yapilacaklar

### 2.1 Degisiklik Oncesi
```markdown
1. Hangi bible section'i ilgilendiriyor? -> Oku
2. 08-AUTHORITATIVE'da ilgili override var mi? -> Kontrol et
3. GAPS.md'de ilgili known issue var mi? -> Bak
```

### 2.2 Degisiklik Sonrasi
```markdown
1. Kod bible ile uyumlu mu? -> Dogrula
2. Uyumsuzluk varsa:
   - GAPS.md'ye kaydet (asagidaki format)
   - Kullaniciya bildir
3. Uyumlu ve basarili ise:
   - AUDIT_CHANGELOG.md'ye kaydet (asagidaki format)
```

---

## 3. GAPS.md Kayit Formati

### Yeni Gap Ekleme
```markdown
## [GAP-XXX] Kisa Baslik
- **Tarih**: YYYY-MM-DD
- **Durum**: [ ] Acik / [x] Cozuldu
- **Bible Kaynagi**: XX-CATEGORY/dosya.md#section
- **Kod Konumu**: packages/xxx/src/file.ts:line
- **Aciklama**: Uyumsuzlugun detayli aciklamasi
- **Etki**: Bu uyumsuzluk neyi etkiler
- **Onerilen Cozum**: Nasil duzeltilmeli
- **Cozum** (cozulduyse): Ne yapildi, ne zaman
```

### Ornek
```markdown
## [GAP-001] Auth middleware role kontrolu eksik
- **Tarih**: 2026-01-23
- **Durum**: [ ] Acik
- **Bible Kaynagi**: 02-USERS/02-organization-roles.md#permissions
- **Kod Konumu**: packages/api/src/middleware/auth.ts:45
- **Aciklama**: Bible'da "ANALYST role sadece read-only erisim" yazıyor ama middleware bunu kontrol etmiyor
- **Etki**: Analyst kullanicilar write operasyonlari yapabiliyor
- **Onerilen Cozum**: checkPermission middleware'i ekle
```

---

## 4. AUDIT_CHANGELOG.md Kayit Formati

### Yeni Audit Kaydı Ekleme
```markdown
## [AUDIT-XXX] YYYY-MM-DD - Kisa Baslik

### Degisiklik
- **Tip**: Feature / Bugfix / Refactor / Documentation
- **Dosyalar**: Degisen dosyalarin listesi
- **Bible Uyumu**: Hangi section ile uyumlu

### Detay
Degisikligin detayli aciklamasi

### Dogrulama
- [x] Bible section okundu: XX-CATEGORY/dosya.md
- [x] Kod bible ile uyumlu
- [ ] Test yazildi (gerekiyorsa)
- [ ] GAPS.md guncellendi (gerekiyorsa)
```

---

## 5. Feature Implementasyonu Checklist

Yeni bir feature implement ederken:

```markdown
### Pre-Implementation
- [ ] 00-MASTER/INDEX.md'den ilgili section'lari bul
- [ ] Ilgili tum bible dosyalarini oku
- [ ] 08-AUTHORITATIVE'da override var mi kontrol et
- [ ] GAPS.md'de related issue var mi bak
- [ ] 00-MASTER/DECISIONS.md'de ilgili karar var mi kontrol et

### Implementation
- [ ] Bible'daki tum kurallara uy
- [ ] Type'lari 08-AUTHORITATIVE/types.md ile esle
- [ ] Edge case'leri 07-EDGE dosyalarindan kontrol et

### Post-Implementation
- [ ] Kod ile bible uyumu dogrula
- [ ] GAPS.md guncelle (uyumsuzluk varsa)
- [ ] AUDIT_CHANGELOG.md'ye kaydet
- [ ] IMPLEMENTATION_STATUS.md guncelle
```

---

## 6. Kod Review Checklist

PR/kod review yaparken:

```markdown
- [ ] Degisiklik ilgili bible section ile uyumlu mu?
- [ ] 08-AUTHORITATIVE kurallarina uyuyor mu?
- [ ] Type definitions dogru mu?
- [ ] Edge case'ler handle edilmis mi?
- [ ] GAPS.md'ye eklenmesi gereken bir sey var mi?
```

---

## 7. Oturum Sonu Gorevleri

Her calisma oturumu sonunda:

```markdown
1. Yapilan tum degisiklikleri listele
2. Her degisiklik icin:
   - Bible uyumu kontrol edildi mi?
   - GAPS.md guncellendi mi?
   - AUDIT_CHANGELOG.md'ye kaydedildi mi?
3. IMPLEMENTATION_STATUS.md'yi guncelle
4. Kullaniciya ozet sun
```

---

## 8. Hizli Referans Tablolari

### Bible Section -> Feature Mapping
| Feature | Bible Section | Key Files |
|---------|---------------|-----------|
| Auth | 02-USERS, 05-TECH/security | user-types, verification-levels |
| Polls | 03-FEATURES | 01-polls, 04-live-polls |
| Surveys | 03-FEATURES, 04-DATA | 02-surveys, survey-methodology |
| API | 05-TECH | api-routes, api-flows |
| Database | 05-TECH | database-schema |
| UI/UX | 06-UX | user-flows, ui-specifications |

### Common Decisions (Quick Ref)
| Decision ID | Topic | Location |
|-------------|-------|----------|
| P-001 | Single question per poll | 03-FEATURES/01-polls |
| P-003 | Reliability score 0-100 | 04-DATA/03-reliability |
| T-009 | Trust score calculation | 04-DATA/03-reliability |

---

## 9. Yasak Islemler

Claude asagidaki islemleri **YAPMAMALIDIR**:

1. Bible'i okumadan kod yazmak
2. Uyumsuzlugu GAPS.md'ye kaydetmeden birakmak
3. 08-AUTHORITATIVE'i gormezden gelmek
4. Type'lari bible'dan farkli tanimlamak
5. Edge case'leri handle etmemek
6. AUDIT_CHANGELOG'u atlmak

---

## 10. Trouble Shooting

### Bible ile Kod Arasinda Celeski Varsa:
1. 08-AUTHORITATIVE'a bak (override olabilir)
2. GAPS.md'de bilinen issue var mi kontrol et
3. Kullaniciya sor: "Bible mi guncellensin, kod mu?"
4. Karara gore GAPS.md veya kodu guncelle

### Bible'da Bilgi Eksikse:
1. GAPS.md'ye "MISSING_SPEC" olarak kaydet
2. Kullaniciya bildir ve karar iste
3. Karar alinininca ilgili bible section'i guncelle
4. AUDIT_CHANGELOG'a kaydet

### Birden Fazla Bible Section Celisiyorsa:
1. 08-AUTHORITATIVE kontrol et (override)
2. 00-MASTER/DECISIONS.md kontrol et
3. Daha spesifik olan section'i uygula
4. GAPS.md'ye celiskiyi kaydet
5. Kullaniciya bildir

---

# ═══════════════════════════════════════════════════════════════════════════════
# END OF CLAUDE RULES
# ═══════════════════════════════════════════════════════════════════════════════
