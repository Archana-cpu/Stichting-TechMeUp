# 04-DATA
> Veri kalitesi, guvenilirlik ve metodoloji

## Overview
Bu kategori VoxPoll'un veri kalitesi sistemini tanimlar:
- Response kalitesi nasil olculuyor?
- Reliability score nasil hesaplaniyor?
- Fraud nasil onleniyor?
- Akademik metodoloji nasil uygulanıyor?

## Files

| File | Content | Status |
|------|---------|--------|
| [01-response-collection.md](01-response-collection.md) | Data collection rules | From bible-007 |
| [02-quality-scoring.md](02-quality-scoring.md) | Response quality metrics | From bible-003 |
| [03-reliability-scoring.md](03-reliability-scoring.md) | Content reliability (0-100) | From bible-004 |
| [04-fraud-detection.md](04-fraud-detection.md) | Bot & fraud prevention | From bible-009 |
| [05-survey-methodology.md](05-survey-methodology.md) | Academic methodology, AAPOR | From bible-003, 019 |

## Source References
- **bible-003.md**: Survey Methodology & Data Quality
- **bible-004.md**: Reliability & Trust Scoring
- **bible-007.md**: Response & Data Collection
- **bible-009.md**: Bot & Fraud Detection
- **bible-019.md**: Survey Methodologies (Advanced)

## Key Decisions
- P-003: Reliability score 0-100
- P-006: Minimum sample sizes
- P-009: User Trust Score invisible
- P-033: Multi-vote prevention
- T-009: Reliability calculation weights

## Quick Summary

### Reliability Score (0-100)
| Category | Weight |
|----------|--------|
| Sample Quality | 35% |
| Response Quality | 30% |
| Methodology | 20% |
| Participant Verification | 15% |

### Score Labels
| Range | Label | Meaning |
|-------|-------|---------|
| 90-100 | Excellent | Research-grade |
| 75-89 | Good | Trustworthy |
| 60-74 | Moderate | Use with care |
| 40-59 | Limited | Significant limitations |
| 0-39 | Low | Entertainment only |

### Quality Checks
- Attention checks (IMC, Bogus items)
- Response time analysis
- Straight-lining detection
- Consistency validation

### Fraud Prevention
- Device fingerprinting
- IP + User + Device combination
- CAPTCHA for suspicious activity
- Bot detection algorithms

---
*Last Updated: 2026-01-23*
