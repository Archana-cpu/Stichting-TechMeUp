# Changelog

> **Project**: VoxPoll
> **Changelog Format**: Keep a Changelog (keepachangelog.com)
> **Versioning**: Semantic Versioning (semver.org)

All notable changes to this project will be documented in this file.

---

## [Unreleased]

### Added
- Multi-agent role system (PM, Developer, DataArchitect, QA, Debugger, DevOps)
- NyoCLI automation tool for task/audit management
- 99-meta/ directory for NyoWorks compliance

### Changed
- Bible structure migrated to NyoWorks v4.0 Hybrid format

---

## [0.1.0] - 2026-01-29

### Added - Bible Documentation
- API Contract with 155 endpoints (05-api/01-api-contract.md)
- Unified app architecture specification (DECISION-PM-001)
- Free test mode infrastructure (Docker Compose + mock services)
- Backend completion plan (10-logs/BACKEND_COMPLETION_PLAN.md)
- Test master plan (99-TRACKING/TEST_MASTER_PLAN.md)
- NyoWorks standards manifesto (nyoworks-standards-manifesto.md)
- Multi-agent coordination system (99-TRACKING/AGENT_COORDINATION.md)

### Added - Infrastructure
- Docker Compose development environment (docker-compose.dev.yml)
- Environment variable template (.env.local.example)
- NyoCLI automation tool (_tools/nyoworksCLI.py)
- GitHub workflows for CI/CD

### Added - Backend (PHASE B)
- Drizzle schema for all entities (packages/database/)
- Authentication system (JWT + refresh tokens)
- Rate limiting middleware (Redis-backed)
- RBAC permission system
- User verification system (0-4 levels)
- Profile visits tracking
- 2FA authentication tests
- Rate limiting tests
- Live poll waiting room tests

### Changed
- Migrated from platform app to unified app architecture
- Updated all Bible sections to NyoWorks v3.0 compliance
- Consolidated task management to YAML format (10-logs/tasks-active.md)
- Restructured monorepo for better separation of concerns

### Deprecated
- Old platform app concept (merged into unified web app)
- Manual task tracking (replaced with CLI)

### Removed
- Orphan files (nul, tree.txt)
- .tsbuildinfo files from packages
- Redundant Bible sections

### Fixed
- TypeScript errors in user controller
- OpenAPI specification issues
- User validator type inconsistencies

### Security
- Implemented Argon2id for password hashing (T-006)
- Added device fingerprinting (P-057)
- Enhanced rate limiting (P-058)
- Implemented error sanitization (P-059)

---

## [0.0.1] - 2026-01-23

### Added - Project Initialization
- Initial Bible documentation structure
- Vision and product principles (01-VISION/)
- User types and organization roles (02-USERS/)
- Feature specifications (03-FEATURES/)
- Data quality framework (04-DATA/)
- Technical architecture (05-TECH/)
- UX flows and UI specs (06-UX/)
- Edge cases and business rules (07-EDGE/)
- Authoritative decisions (08-AUTHORITATIVE/)

### Added - Core Entities
- Users table with verification levels
- Organizations table with types
- Polls, Surveys, Tests schemas
- Reliability scoring algorithm
- PULSE comments system
- Feed discovery algorithm
- Payment integration (Stripe)

### Added - Development Setup
- Monorepo structure with Turborepo
- Next.js 16 App Router setup
- React Native + Expo setup
- Drizzle ORM configuration
- PostgreSQL database
- Redis caching
- Hono API framework

---

## Version History

| Version | Date | Phase | Description |
|---------|------|-------|-------------|
| 0.0.1 | 2026-01-23 | PHASE A | Project initialized |
| 0.1.0 | 2026-01-29 | PHASE B | Backend 74% complete |
| 1.0.0 | TBD | PHASE C | MVP launch (planned Q2 2026) |

---

## Change Categories

### Added
- New features, documentation, or infrastructure

### Changed
- Changes in existing functionality or structure

### Deprecated
- Features or approaches being phased out

### Removed
- Removed features, files, or deprecated code

### Fixed
- Bug fixes and corrections

### Security
- Security improvements and vulnerability patches

---

*This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.*
*VoxPoll uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).*

*Last updated: 2026-01-29 by Product Manager*
