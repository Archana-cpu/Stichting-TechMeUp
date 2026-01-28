# 03-FEATURES
> Tum ozellikler ve is mantiklari

## Overview
Bu kategori VoxPoll'un "ne" sorularini yanitlar:
- Hangi ozellikler var?
- Her ozellik nasil calisiyor?
- Is mantigi nedir?

## Files

| File | Content | Status |
|------|---------|--------|
| [01-polls.md](01-polls.md) | Poll creation, voting, results | From bible-006 |
| [02-surveys.md](02-surveys.md) | B2B survey system | From bible-006, 019, 020 |
| [03-tests.md](03-tests.md) | Personality tests | From bible-006 |
| [04-live-polls.md](04-live-polls.md) | Real-time WebSocket | From bible-006 |
| [05-pulse-comments.md](05-pulse-comments.md) | Results + discussions | From bible-010 |
| [06-feed-discovery.md](06-feed-discovery.md) | Feed algorithm | From bible-011 |
| [07-notifications.md](07-notifications.md) | Notification system | From bible-012 |
| [08-social.md](08-social.md) | Follow, DM, Block | From bible-005 |
| [09-payments.md](09-payments.md) | Stripe, subscriptions | From bible-024 |

## Source References
- **bible-006.md**: Content Types (Poll/Survey/Test)
- **bible-010.md**: PULSE + Comments
- **bible-011.md**: Feed & Discovery
- **bible-012.md**: Notifications
- **bible-019.md**: Survey Methodologies
- **bible-020.md**: Enterprise Research
- **bible-024.md**: Payments

## Key Decisions
- P-001: Single question per poll
- P-007: Pre-test layer system (up to 3 layers)
- P-027: Tier-based option limits
- P-030: Pre-test failure handling
- P-031: Live Poll disconnect resilience
- P-108: Feed algorithm

## Quick Summary

### Content Types
| Type | Purpose | Single Q | Multi Q | Pre-test |
|------|---------|----------|---------|----------|
| Poll | Quick opinion | Yes | No | Optional |
| Survey | Deep research | No | Yes | Required |
| Test | Personality | No | Yes | Optional |

### Voting Systems
- Single Choice
- Multiple Choice (max selections)
- Ranking
- Rating Scale (1-5, 1-10)
- Slider

### Live Poll Features
- Real-time WebSocket updates
- Host controls (start/pause/end)
- QR code join
- 30s reconnect window

---
*Last Updated: 2026-01-23*
