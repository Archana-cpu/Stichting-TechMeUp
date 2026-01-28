# 07-EDGE
> Edge case'ler, hata modlari ve is kurallari

## Overview
Bu kategori kritik edge case'leri ve is kurallarini tanimlar:
- Edge case'ler nasil handle ediliyor?
- Hata modlari neler?
- Is kurallari neler?

## Files

| File | Content | Status |
|------|---------|--------|
| [01-edge-cases.md](01-edge-cases.md) | All edge cases | From bible-016 |
| [02-failure-modes.md](02-failure-modes.md) | Resilience patterns | From bible-027 |
| [03-business-rules.md](03-business-rules.md) | Business logic rules | From bible-015 |

## Source References
- **bible-015.md**: Business Logic Rules
- **bible-016.md**: Edge Cases & Error Handling
- **bible-027.md**: Failure Modes & Resilience

## Key Decisions
- P-029: Anonymous to user conversion
- P-030: Pre-test failure handling
- P-031: Live Poll disconnect resilience
- P-032: Comment media moderation

## Quick Summary

### Critical Edge Cases

#### Poll Edge Cases
- User votes, then poll closes
- User edits vote after seeing results
- Poll reaches 0 responses after deletion
- Concurrent vote submissions

#### Survey Edge Cases
- User starts survey, session expires
- Survey closed while user responding
- Network disconnect during submission
- Duplicate response detection

#### Auth Edge Cases
- Token expires during action
- Multiple sessions same user
- Device change detection
- Account lockout recovery

### Failure Modes & Recovery
| Failure | Recovery |
|---------|----------|
| DB connection lost | Retry 3x, circuit breaker |
| Redis unavailable | Fallback to DB cache |
| External API down | Queue and retry |
| Rate limit hit | Exponential backoff |

### Business Rules
- Poll cannot be edited after first vote
- Survey responses locked after submission
- Organization owner cannot be removed
- Deleted content soft-deleted for 30 days

---
*Last Updated: 2026-01-23*
