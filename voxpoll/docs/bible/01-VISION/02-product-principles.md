# ═══════════════════════════════════════════════════════════════════════════════
# VISION - Product Principles & Decisions
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-001.md (section 1.5)
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════

All decisions in this section are FINAL. Changes require formal review process.


# ═══════════════════════════════════════════════════════════════════════════════
# PRODUCT BEHAVIOR DECISIONS (P-101 to P-110)
# ═══════════════════════════════════════════════════════════════════════════════

NOTE: These decisions complement the core P-001 to P-026 decisions in bible-000.md.
P-1xx series covers product behavior and user experience rules.

┌──────────────────────────────────────────────────────────────────────────────────┐
│ ID     │ Decision                              │ Rationale                       │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-101  │ Tests have UNLIMITED duration         │ Evergreen content enables       │
│        │                                       │ long-term viral growth          │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-102  │ Profile badges are OPTIONAL           │ User choice; includes fun/      │
│        │ and can be non-serious                │ non-serious badges for          │
│        │                                       │ engagement                      │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-103  │ Discussion write access requires      │ Ensures quality, prevents       │
│        │ PARTICIPATION in the poll/test        │ drive-by trolling               │
│        │ [ALIAS: Same rule as P-003]           │                                 │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-104  │ Non-participants can REQUEST          │ Flexibility with quality        │
│        │ discussion access (min 100 chars)     │ control; creator approves       │
│        │ [ALIAS: Same rule as P-004]           │                                 │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-105  │ NO ADVERTISEMENTS ever                │ User experience and trust       │
│        │                                       │ are paramount                   │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-106  │ Polls/Surveys/Tests CANNOT be         │ Absolute data integrity;        │
│        │ edited after publishing               │ prevents manipulation           │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-107  │ Minimum participant count is          │ Creator accountability with     │
│        │ set by creator with consequences      │ transparent consequences        │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-108  │ Pre-test failure messages are         │ UX priority; no harsh           │
│        │ POLITE and non-judgmental             │ rejections that hurt users      │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-109  │ Premium users CANNOT bypass           │ No pay-to-win on quality        │
│        │ participation requirement             │ discussions                     │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-110  │ Result visibility: Participants       │ Incentivize participation;      │
│        │ see all; Premium sees all;            │ monetization lever              │
│        │ Free non-participants see title only  │                                 │
└──────────────────────────────────────────────────────────────────────────────────┘


# ═══════════════════════════════════════════════════════════════════════════════
# CORE PRODUCT DECISIONS (P-011 to P-017)
# ═══════════════════════════════════════════════════════════════════════════════

These decisions are also registered in bible-000.md Decision Index.

┌──────────────────────────────────────────────────────────────────────────────────┐
│ ID     │ Decision                              │ Rationale                       │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-011  │ LIVE POLL feature for real-time       │ Streamers, speakers, live       │
│        │ participation with link-join          │ audiences need instant feedback │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-012  │ Demographics are LOCKED after         │ Data integrity; prevents gaming │
│        │ registration (except marital status,  │ surveys by changing demographics│
│        │ profession)                           │                                 │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-013  │ PULSE + COMMENTS = Result + Discussion│ PULSE: Spotify-wrap style       │
│        │ (Reddit/Insta/YouTube hybrid)         │ COMMENTS: Forum discussion      │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-014  │ Pre-test support for Polls requires   │ Quality filtering for polls;    │
│        │ PREMIUM tier                          │ monetization lever              │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-015  │ Surveys are EXCLUSIVELY B2B SaaS      │ Clear product positioning;      │
│        │ (organizations only)                  │ prevents confusion              │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-016  │ Plus tier grants PULSE/COMMENTS access│ Monetization for non-           │
│        │ without participation                 │ participants wanting to discuss │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ P-017  │ Test results create profile BADGES    │ Viral shareability and          │
│        │ displayed on user profile             │ identity expression             │
└──────────────────────────────────────────────────────────────────────────────────┘



# ═══════════════════════════════════════════════════════════════════════════════
# TECHNICAL DECISIONS
# ═══════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────────┐
│ ID     │ Decision                              │ Rationale                       │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ T-001  │ Anonymity via SEPARATED TABLES        │ Cryptographic impossibility     │
│        │ with no foreign key relationship      │ of linking user to response     │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ T-002  │ Wilson Score Interval for             │ Statistically proven;           │
│        │ comment ranking                       │ Reddit-validated                │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ T-003  │ Hot algorithm with ~12h half-life     │ Balance freshness and           │
│        │ for feed ranking                      │ popularity                      │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ T-004  │ SMS verification REQUIRED             │ Bot prevention baseline;        │
│        │ for all accounts                      │ one phone per account           │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ T-005  │ Device fingerprinting ENABLED         │ Fraud farm detection;           │
│        │                                       │ multi-account prevention        │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ T-006  │ Response timing TRACKED               │ Speeder detection baseline;     │
│        │ for all questions                     │ quality scoring input           │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ T-007  │ Participation hash uses               │ Prevents rainbow table          │
│        │ SHA-256(user_id + content_id + salt)  │ attacks; content-specific       │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ T-008  │ Anonymous response ID is              │ No correlation possible;        │
│        │ UUID v4 (random)                      │ completely detached             │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ T-009  │ Reliability score range: 0-100        │ Intuitive percentage-like       │
│        │                                       │ scale for users                 │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ T-010  │ Next.js 16+ with Server Actions       │ Modern stack; reduced           │
│        │ (no separate API layer)               │ complexity; type safety         │
└──────────────────────────────────────────────────────────────────────────────────┘



# ═══════════════════════════════════════════════════════════════════════════════
# BUSINESS MODEL DECISIONS
# ═══════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────────┐
│ ID     │ Decision                              │ Rationale                       │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ B-001  │ Revenue split target:                 │ B2B is sustainable revenue;     │
│        │ 70% B2B, 20% B2C, 10% transactions    │ B2C builds user base            │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ B-002  │ B2C tiers: Free / Plus ($4.99) /      │ Standard SaaS tiering;          │
│        │ Premium ($9.99)                       │ competitive pricing             │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ B-003  │ B2B tiers: Starter ($99) /            │ Value-based pricing;            │
│        │ Professional ($299) / Enterprise      │ room for negotiation            │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ B-004  │ No free trial for B2B;                │ Demo-based sales;               │
│        │ Demo upon request                     │ qualify leads properly          │
├────────┼───────────────────────────────────────┼─────────────────────────────────┤
│ B-005  │ Add-on pricing for special features   │ Flexibility without             │
│        │ (e-Government, extra responses)       │ overwhelming base price         │
└──────────────────────────────────────────────────────────────────────────────────┘



# ═══════════════════════════════════════════════════════════════════════════════
# DESIGN PHILOSOPHY
# ═══════════════════════════════════════════════════════════════════════════════

## Core Values

1. **Data Quality First**: Every response's quality is measured and visible
2. **Transparency**: Methodology and results are transparent to all stakeholders
3. **Accessibility**: Easy to use for everyone, regardless of technical skill
4. **Privacy**: User data protection is paramount, with mathematical guarantees

## Guiding Principles

### For Product Decisions
- User trust is the most valuable asset
- Never sacrifice data integrity for convenience
- Make the right thing the easy thing

### For Technical Decisions
- Security by design, not afterthought
- Scalability built in from day one
- Type safety and compile-time guarantees

### For Business Decisions
- Sustainable revenue over rapid growth
- B2B contracts provide stability
- B2C engagement drives organic growth

## Anti-Patterns (What We Avoid)

| Anti-Pattern | Why We Avoid It |
|--------------|-----------------|
| Dark patterns | Destroys user trust |
| Data selling | Privacy violation |
| Ad-supported model | Quality compromise |
| Gamification exploitation | Undermines data quality |
| Fake urgency | Unethical manipulation |
| Hidden fees | Transparency violation |
