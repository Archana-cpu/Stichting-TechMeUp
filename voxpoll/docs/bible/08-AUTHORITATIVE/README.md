# 08-AUTHORITATIVE
> Override eden son kararlar - BU DOSYALAR DIGER TUM KAYNAKLARI GECERSIZ KILAR

## IMPORTANT
Bu kategorideki dosyalar en yuksek onceliklidir.
Diger bible dosyalari ile celisirse, BU DOSYALAR GECERLIDIR.

## Files

| File | Content | Status |
|------|---------|--------|
| [types.md](types.md) | Unified type definitions | From bible-030 |
| [critical-fixes.md](critical-fixes.md) | Implementation critical fixes | From bible-028 |
| [final-decisions.md](final-decisions.md) | Final clarifications | From bible-031 |

## Source References
- **bible-028.md**: Implementation Critical Fixes
- **bible-029.md**: Pre-Launch Critical Specs
- **bible-030.md**: Unified Type Definitions
- **bible-031.md**: Critical Clarifications

## Usage

### When to Use These Files
1. Kod yazarken type tanimlari icin -> types.md
2. Belirsiz durumlarda karar icin -> final-decisions.md
3. Known bug/fix icin -> critical-fixes.md

### Override Order
```
1. 08-AUTHORITATIVE/* <- HIGHEST PRIORITY
2. 00-MASTER/DECISIONS.md
3. Feature-specific file
4. 99-TRACKING/GAPS.md
```

## Quick Summary

### Types (types.md)
- All enum definitions
- All interface definitions
- Database column types
- API response types

### Critical Fixes (critical-fixes.md)
- Known implementation issues
- Workarounds
- Migration notes

### Final Decisions (final-decisions.md)
- Ambiguous case resolutions
- Override decisions
- Last-minute clarifications

---
*Last Updated: 2026-01-23*
