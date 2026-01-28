# 02-USERS
> Kullanici tipleri, roller, izinler ve dogrulama seviyeleri

## Overview
Bu kategori VoxPoll'un "kim" sorularini yanitlar:
- Kimler sistemi kullaniyor?
- Hangi roller var?
- Izinler nasil calisiyor?
- Dogrulama seviyeleri neler?

## Files

| File | Content | Status |
|------|---------|--------|
| [01-user-types.md](01-user-types.md) | B2C tiers: Free/Plus/Premium | Migrated from bible-005 |
| [02-organization-roles.md](02-organization-roles.md) | B2B roles: Owner/Admin/Creator/Analyst/Member | Migrated from bible-005 |
| [03-platform-roles.md](03-platform-roles.md) | Admin, Moderator, Support | Migrated from bible-005 |
| [04-verification-levels.md](04-verification-levels.md) | Level 0-4, e-Devlet | Migrated from bible-005 |

## Source References
- **bible-005.md**: User & Organization Management (primary source)

## Key Decisions
- P-004: Verification levels 0-4
- P-010: Organization isolation
- P-101: B2C tiers (Free/Plus/Premium)
- P-102: B2B roles (Owner/Admin/Creator/Analyst/Member)

## Quick Summary

### B2C User Tiers
| Tier | Polls | Surveys | Analytics |
|------|-------|---------|-----------|
| Free | 5/month | - | Basic |
| Plus | 20/month | - | Standard |
| Premium | Unlimited | Limited | Advanced |

### B2B Organization Roles
| Role | Permissions |
|------|-------------|
| Owner | Full access, billing, delete org |
| Admin | Manage members, settings |
| Creator | Create surveys, view results |
| Analyst | View results only (read-only) |
| Member | Participate only |

### Verification Levels
| Level | Requirements | Trust |
|-------|--------------|-------|
| 0 | Email only | Low |
| 1 | Phone verified | Medium |
| 2 | Phone + Profile complete | Medium-High |
| 3 | Phone + e-Devlet | High |
| 4 | e-Devlet + Organization | Highest |

---
*Last Updated: 2026-01-23*
