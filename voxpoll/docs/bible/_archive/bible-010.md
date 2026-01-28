# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 10                                    █
# █      PULSE + COMMENTS: RESULTS VISUALIZATION & DISCUSSION SYSTEM          █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 10.0 PULSE + COMMENTS: THE RESULT + DISCUSSION EXPERIENCE
# ══════════════════════════════════════════════════════════════════════════════

## 10.0.1 What are PULSE and COMMENTS?

[DECISION P-013 UPDATED] VoxPoll uses two distinct but connected feature names:

- **PULSE**: The animated results visualization (Spotify Wrap-style)
- **COMMENTS**: The discussion forum area (Reddit/Instagram hybrid)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ██████╗ ██╗   ██╗██╗     ███████╗███████╗                                     │
│  ██╔══██╗██║   ██║██║     ██╔════╝██╔════╝                                     │
│  ██████╔╝██║   ██║██║     ███████╗█████╗                                       │
│  ██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝                                       │
│  ██║     ╚██████╔╝███████╗███████║███████╗                                     │
│  ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝                                     │
│                                                                                 │
│  Results Visualization - Spotify Wrap Style                                     │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PULSE = RESULTS VISUALIZATION (For Polls/Surveys = Aggregate Data)             │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     SPOTIFY WRAP-STYLE RESULTS                           │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                   │  │   │
│  │  │   [Animated data visualization]                                   │  │   │
│  │  │   • Charts, graphs, comparisons                                   │  │   │
│  │  │   • User's result vs aggregate                                    │  │   │
│  │  │   • Demographic breakdowns                                        │  │   │
│  │  │   • Shareable visual cards                                        │  │   │
│  │  │                                                                   │  │   │
│  │  └───────────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  For TESTS: Personal Result Screen (Not called PULSE)                           │
│  Test results are individual/personal, so naming is different:                  │
│  - "Your Result" or "Test Result" (not PULSE)                                   │
│  - User sees their personal outcome (which character, personality type, etc.)   │
│  - COMMENTS section still applies (users discuss: "I got X, what about you?")   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   ██████╗ ██████╗ ███╗   ███╗███╗   ███╗███████╗███╗   ██╗████████╗███████╗   │
│  ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔════╝   │
│  ██║     ██║   ██║██╔████╔██║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ███████╗   │
│  ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║   │
│  ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ███████║   │
│   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝   │
│                                                                                 │
│  Discussion Forum - Reddit/Instagram Hybrid                                     │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  COMMENTS = DISCUSSION FORUM (For All Content Types)                            │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │               REDDIT/INSTAGRAM/YOUTUBE HYBRID FORUM                      │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                   │  │   │
│  │  │   [Discussion threads with:]                                      │  │   │
│  │  │   • Text, Images, GIFs support                                    │  │   │
│  │  │   • Upvote/Downvote (Wilson Score ranking)                        │  │   │
│  │  │   • Nested replies (max 3 levels)                                 │  │   │
│  │  │   • Creator moderation tools                                      │  │   │
│  │  │   • Sort: Hot, New, Top, Controversial                            │  │   │
│  │  │                                                                   │  │   │
│  │  │   TEST COMMENTS: "I got INTJ!", "Same here!", "I got ENTP!"       │  │   │
│  │  │   POLL COMMENTS: "Interesting results", "I disagree because..."   │  │   │
│  │  │                                                                   │  │   │
│  │  └───────────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.0.2 PULSE + COMMENTS Access Rules

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PULSE + COMMENTS ACCESS MATRIX                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User Status         │ View PULSE │ View COMMENTS │ Write COMMENTS │ Share     │
│  ────────────────────┼────────────┼───────────────┼────────────────┼───────────│
│  Participated        │     ✓      │       ✓       │       ✓        │     ✓     │
│  Free (no part.)     │     ✗      │       ✗       │       ✗        │     ✗     │
│  Plus (no part.)     │     ✓      │       ✓       │       ✓        │     ✓     │
│  Premium (no part.)  │     ✓      │       ✓       │       ✓        │     ✓     │
│  Creator             │     ✓      │       ✓       │       ✓        │     ✓     │
│                                                                                 │
│  [DECISION P-016] Plus tier grants PULSE/COMMENTS access without participation  │
│  This is a key monetization lever for users who want to join discussions        │
│  without taking the poll/test themselves.                                       │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════════│
│  CLARIFICATION: "Without Participation" Exception                                │
│  ═══════════════════════════════════════════════════════════════════════════════│
│                                                                                 │
│  Q: Can users bypass participation requirement?                                 │
│                                                                                 │
│  A: Plus/Premium users can VIEW the content and its results (the shared        │
│     experience) without COMPLETING it themselves.                               │
│                                                                                 │
│     - They see the poll question and results → they share the content context  │
│     - They can comment on these results → this IS shared content communication │
│     - They just didn't vote themselves → but they're still in the content      │
│                                                                                 │
│  USE CASE: A journalist wants to discuss poll results without biasing them     │
│            by voting. Plus tier allows them to observe and comment.            │
│                                                                                 │
│  ACCESS FLOW:                                                                   │
│                                                                                 │
│    Free User:        Content ──▶ Must Vote ──▶ See PULSE ──▶ Can Comment       │
│    Plus/Premium:     Content ──▶ See PULSE (skip vote) ──▶ Can Comment         │
│    Creator (own):    Content ──▶ See PULSE ──▶ Can Comment                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.0.2.5 USER COMMUNICATION RULES

[DECISION P-022 UPDATED] VoxPoll now includes comprehensive social features with
direct messaging enabled. See BIBLE-005 Section 5.9 for full social features spec.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    USER COMMUNICATION CHANNELS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CONTENT-BASED COMMUNICATION:                                                   │
│  ────────────────────────────                                                   │
│  ✓ COMMENTS discussions (comment on polls/surveys/tests)                        │
│  ✓ Reply to comments within COMMENTS section                                    │
│  ✓ @mention users in COMMENTS                                                   │
│  ✓ Share content via private links with friends                                 │
│                                                                                 │
│  SOCIAL COMMUNICATION:                                                          │
│  ─────────────────────                                                          │
│  ✓ Direct messages (DMs) between users                                          │
│  ✓ Follow users (one-way, no approval for public profiles)                      │
│  ✓ Mutual follows = Friends (bidirectional relationship)                        │
│  ✓ Profile visits (viewable by Plus/Premium users)                              │
│                                                                                 │
│  DM LIMITS BY TIER (see BIBLE-005 Section 5.9.3):                               │
│  ────────────────────────────────────────────────                               │
│  • Free: 5 DMs/day to non-friends, unlimited to friends                         │
│  • Plus: 25 DMs/day to non-friends, unlimited to friends                        │
│  • Premium: Unlimited DMs                                                       │
│                                                                                 │
│  PRIVACY CONTROLS:                                                              │
│  ─────────────────                                                              │
│  • Users can disable DMs entirely                                               │
│  • Users can set "Friends only" for DMs                                         │
│  • Block users to prevent all interaction                                       │
│  • Report inappropriate messages                                                │
│                                                                                 │
│  [REFERENCE] Full social features specification in BIBLE-005 Section 5.9        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.0.3 PULSE + COMMENTS Activation Timeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PULSE + COMMENTS ACTIVATION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  POLL (PULSE + COMMENTS):                                                       │
│  ─────────────────────────                                                      │
│  Poll ends (time expires or creator closes) ───▶ PULSE + COMMENTS opens         │
│  • All participants notified                                                    │
│  • PULSE: Results visualization generated                                       │
│  • COMMENTS: Discussion forum opens                                             │
│                                                                                 │
│  SURVEY (PULSE + COMMENTS):                                                     │
│  ───────────────────────────                                                    │
│  Survey ends ───▶ PULSE + COMMENTS opens (if enabled by creator)                │
│  • Organization decides if discussion is enabled                                │
│  • PULSE: Results can be shared publicly or kept private                        │
│  • COMMENTS: Discussion can be limited to participants only                     │
│                                                                                 │
│  TEST (Result + COMMENTS):                                                      │
│  ─────────────────────────                                                      │
│  User completes test ───▶ Personal Result + COMMENTS immediately                │
│  • Shows personal result + how they compare                                     │
│  • Can see aggregate distribution (not called PULSE for tests)                  │
│  • COMMENTS: Join discussion with other test-takers                             │
│  • Typical comments: "I got INTJ!", "Me too!", "I'm ENFP"                       │
│                                                                                 │
│  LIVE POLL (PULSE + COMMENTS):                                                  │
│  ─────────────────────────────                                                  │
│  Live poll ends ───▶ Real-time transition to PULSE + COMMENTS                   │
│  • PULSE: Results animation plays                                               │
│  • COMMENTS: Live chat continues as discussion forum                            │
│  • Participants can share their experience                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.0.4 PULSE: Spotify Wrap-Style Results Visualization

[DECISION] PULSE presents results in an engaging, shareable format inspired by
Spotify Wrapped - animated, visual, and designed for social sharing.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SPOTIFY WRAP-STYLE RESULTS                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  VISUALIZATION COMPONENTS:                                                      │
│  ─────────────────────────                                                      │
│                                                                                 │
│  1. ANIMATED REVEAL                                                             │
│     • Results appear with smooth animations                                     │
│     • Key stats highlight sequentially                                          │
│     • Background color shifts based on result theme                             │
│                                                                                 │
│  2. PERSONAL CONTEXT (for polls/tests)                                          │
│     ┌─────────────────────────────────────────────────────────────┐            │
│     │  "You voted for Next.js"                                    │            │
│     │                                                              │            │
│     │  ████████████████████████████████████████░░░░  62%          │            │
│     │                                                              │            │
│     │  You're with the majority!                                  │            │
│     │  3,421 others voted the same way                            │            │
│     └─────────────────────────────────────────────────────────────┘            │
│                                                                                 │
│  3. DEMOGRAPHIC BREAKDOWN                                                       │
│     ┌─────────────────────────────────────────────────────────────┐            │
│     │  How different groups voted:                                │            │
│     │                                                              │            │
│     │  18-24:  React █████████████████  65%                       │            │
│     │  25-34:  Next  ████████████████████  72%                    │            │
│     │  35-44:  Vue   ████████████  48%                            │            │
│     │                                                              │            │
│     │  Female: Next.js leads with 68%                             │            │
│     │  Male: React leads with 54%                                 │            │
│     └─────────────────────────────────────────────────────────────┘            │
│                                                                                 │
│  4. SHAREABLE CARD                                                              │
│     ┌─────────────────────────────────────────────────────────────┐            │
│     │  ┌─────────────────────────────────────────────────────┐   │            │
│     │  │                                                     │   │            │
│     │  │     I voted in "Best Framework 2025"               │   │            │
│     │  │                                                     │   │            │
│     │  │     [Visual result card with brand styling]        │   │            │
│     │  │                                                     │   │            │
│     │  │     Join 5,421 others at voxpoll.com               │   │            │
│     │  │                                                     │   │            │
│     │  └─────────────────────────────────────────────────────┘   │            │
│     │                                                             │            │
│     │  [Share to: Twitter] [Instagram] [WhatsApp] [Copy Link]    │            │
│     └─────────────────────────────────────────────────────────────┘            │
│                                                                                 │
│  5. COMPARISON VIEW (for tests)                                                 │
│     ┌─────────────────────────────────────────────────────────────┐            │
│     │  Your Result: ENTP "The Debater"                            │            │
│     │                                                              │            │
│     │  Only 4.3% of test-takers got this result!                  │            │
│     │                                                              │            │
│     │  Similar to you:                                            │            │
│     │  [Avatar] @sara_dev - ENTP                                  │            │
│     │  [Avatar] @john_thinks - ENTP                               │            │
│     └─────────────────────────────────────────────────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PULSE RESULT VISUALIZATION TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface PulseVisualization {
  contentId: string
  contentType: "POLL" | "SURVEY" | "TEST"

  // Animation and styling
  theme: {
    primaryColor: string
    secondaryColor: string
    backgroundGradient: string[]
    animationStyle: "slide" | "fade" | "bounce" | "reveal"
  }

  // Result components
  components: PulseComponent[]

  // Shareable card
  shareCard: {
    imageUrl: string              // Pre-generated OG image
    title: string
    description: string
    shareText: string
  }
}

type PulseComponent =
  | { type: "PERSONAL_RESULT", data: PersonalResultData }
  | { type: "AGGREGATE_CHART", data: ChartData }
  | { type: "DEMOGRAPHIC_BREAKDOWN", data: DemographicData }
  | { type: "COMPARISON", data: ComparisonData }
  | { type: "HIGHLIGHTS", data: HighlightData[] }
  | { type: "BADGE_EARNED", data: BadgeData }

interface PersonalResultData {
  userChoice: string
  percentage: number
  rank: number
  totalVoters: number
  isWithMajority: boolean
  matchingUsers: number
}

interface DemographicData {
  breakdowns: {
    category: string              // "age", "gender", "country"
    segments: {
      label: string               // "18-24", "Female", "Turkey"
      leadingOption: string
      percentage: number
    }[]
  }[]
}

export type { PulseVisualization, PulseComponent }
```


## 10.0.5 COMMENTS: Discussion Forum (Reddit/Instagram/YouTube Hybrid)

The COMMENTS section combines the best features of major platforms:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    HYBRID DISCUSSION FORUM                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  REDDIT FEATURES:                                                               │
│  ─────────────────                                                              │
│  ✓ Threaded replies (up to 3 levels deep)                                       │
│  ✓ Upvote/Downvote system                                                       │
│  ✓ Wilson Score ranking for "Best" sort                                         │
│  ✓ Multiple sort options (Hot, New, Top, Controversial)                         │
│  ✓ Collapse/expand threads                                                      │
│                                                                                 │
│  INSTAGRAM FEATURES:                                                            │
│  ─────────────────────                                                          │
│  ✓ Image and GIF support in comments                                            │
│  ✓ Mention users with @username                                                 │
│  ✓ Like comments (single tap)                                                   │
│  ✓ Visual-first design                                                          │
│  ✓ Stories-style result sharing                                                 │
│                                                                                 │
│  YOUTUBE FEATURES:                                                              │
│  ─────────────────────                                                          │
│  ✓ "Pinned" comment by creator                                                  │
│  ✓ "Hearted" comments by creator                                                │
│  ✓ Creator highlighting their responses                                         │
│  ✓ Sort by newest/top                                                           │
│                                                                                 │
│  QUORA FEATURES:                                                                │
│  ────────────────                                                               │
│  ✓ Quality-focused ranking                                                      │
│  ✓ Experts can be highlighted                                                   │
│  ✓ Thoughtful discourse encouraged                                              │
│                                                                                 │
│  CREATOR CONTROLS:                                                              │
│  ──────────────────                                                             │
│  • Enable/disable discussion entirely                                           │
│  • Limit to participants only OR open to Plus users                             │
│  • Pin important comments                                                       │
│  • Heart/highlight comments                                                     │
│  • Lock discussion (no new comments)                                            │
│  • Archive discussion                                                           │
│  • Delete inappropriate comments                                                │
│  • Ban problematic users from their discussions                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// COMMENTS DISCUSSION SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

interface CommentsSettings {
  enabled: boolean

  access: {
    requireParticipation: boolean     // True = only participants can post
    plusCanAccess: boolean            // True = Plus tier can bypass participation
    premiumCanAccess: boolean         // True = Premium tier can bypass
  }

  media: {
    allowImages: boolean
    allowGifs: boolean
    maxImageSizeMB: number
    maxImagesPerComment: number
  }

  moderation: {
    autoModEnabled: boolean           // Auto-hide offensive content
    requireApproval: boolean          // All comments need approval
    bannedWords: string[]             // Custom word filter
  }

  display: {
    defaultSort: "hot" | "new" | "top" | "controversial"
    showVoteCount: boolean
    showUserBadges: boolean
    showUserResult: boolean           // Show what the commenter voted for
  }
}

export type { CommentsSettings }
```




# ══════════════════════════════════════════════════════════════════════════════
# 10.1 DISCUSSION SYSTEM ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 10.1.1 Discussion Model Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DISCUSSION SYSTEM ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CONTENT                                     │   │
│  │                  (Poll / Survey / Test)                             │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│                              │ 1:1                                          │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       DISCUSSION                                    │   │
│  │  • id, contentId, contentType                                       │   │
│  │  • status: CLOSED | OPEN | LOCKED | ARCHIVED                        │   │
│  │  • settings: sortOrder, allowMedia, requireParticipation            │   │
│  │  • stats: commentCount, participantCount, lastActivityAt            │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│                              │ 1:N                                          │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        COMMENT                                      │   │
│  │  • id, discussionId, authorId                                       │   │
│  │  • parentId (nullable for replies)                                  │   │
│  │  • content, mediaUrls                                               │   │
│  │  • upvotes, downvotes, wilsonScore                                  │   │
│  │  • status: VISIBLE | HIDDEN | DELETED | FLAGGED                     │   │
│  │  • depth: 0 (root) to MAX_DEPTH (3)                                 │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│                              │ 1:N                                          │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      COMMENT_VOTE                                   │   │
│  │  • commentId, userId                                                │   │
│  │  • voteType: UP | DOWN                                              │   │
│  │  • createdAt                                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 10.1.2 Discussion Access Rules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DISCUSSION ACCESS MATRIX (COMMENTS)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Type              │ Read │ Write │ Vote │ Report │ Moderate          │
│  ───────────────────────┼──────┼───────┼──────┼────────┼───────────────────│
│  Anonymous (not logged) │  ✗   │   ✗   │  ✗   │   ✗    │      ✗            │
│  Free (no part.)        │  ✗   │   ✗   │  ✗   │   ✗    │      ✗            │
│  Free (participated)    │  ✓   │   ✓   │  ✓   │   ✓    │      ✗            │
│  Plus (no part.)        │  ✓   │   ✓   │  ✓   │   ✓    │      ✗  [P-016]   │
│  Plus (participated)    │  ✓   │   ✓   │  ✓   │   ✓    │      ✗            │
│  Premium (any)          │  ✓   │   ✓   │  ✓   │   ✓    │      ✗            │
│  Content Creator        │  ✓   │   ✓   │  ✓   │   ✓    │      ✓            │
│  Org Admin              │  ✓   │   ✓   │  ✓   │   ✓    │      ✓            │
│  Platform Admin         │  ✓   │   ✓   │  ✓   │   ✓    │      ✓            │
│                                                                             │
│  [DECISION] P-003: Discussion write access requires PARTICIPATION           │
│  [DECISION] P-016: Plus/Premium tiers can access PULSE/COMMENTS without participation│
│  [DECISION] P-004: Free users can REQUEST access (min 100 chars)            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 10.1.3 Discussion Lifecycle

```typescript
const DiscussionStatusSchema = z.enum([
  "CLOSED",
  "OPEN",
  "LOCKED",
  "ARCHIVED"
])

type DiscussionStatus = z.infer<typeof DiscussionStatusSchema>
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DISCUSSION STATE TRANSITIONS                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                          Content Published                                   │
│                                │                                            │
│                                ▼                                            │
│                          ┌─────────┐                                        │
│                          │ CLOSED  │ ◄── Discussion not yet available       │
│                          └────┬────┘                                        │
│                               │                                             │
│            Content Ends / Min Participants Reached                          │
│                               │                                             │
│                               ▼                                             │
│                          ┌─────────┐                                        │
│              ┌──────────►│  OPEN   │◄──────────┐                            │
│              │           └────┬────┘           │                            │
│              │                │                │                            │
│         Unlock by         Lock by          Unlock by                        │
│          Creator          Creator           Admin                           │
│              │                │                │                            │
│              │                ▼                │                            │
│              │           ┌─────────┐           │                            │
│              └───────────│ LOCKED  │───────────┘                            │
│                          └────┬────┘                                        │
│                               │                                             │
│                    30 days of inactivity                                    │
│                    OR manual archive                                        │
│                               │                                             │
│                               ▼                                             │
│                          ┌──────────┐                                       │
│                          │ ARCHIVED │ ◄── Read-only, no new comments        │
│                          └──────────┘                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 10.2 COMMENT SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 10.2.1 Comment Structure

```typescript
const COMMENT_CONSTRAINTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 2000,
  MAX_DEPTH: 3,
  MAX_MEDIA_COUNT: 4,
  EDIT_WINDOW_MINUTES: 15,
  DELETE_SOFT_AFTER_REPLIES: true,

  // ══════════════════════════════════════════════════════════════════════════
  // MEDIA TYPE SUPPORT (Reddit/Quora-style)
  // [DECISION] Support images and GIFs in comments for richer discussions
  // ══════════════════════════════════════════════════════════════════════════
  ALLOWED_MEDIA_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  MAX_IMAGE_SIZE_MB: 5,
  MAX_GIF_SIZE_MB: 10,
  GIF_PROVIDER_INTEGRATION: "giphy",  // Giphy API for inline GIF picker
  ALLOW_EXTERNAL_IMAGES: false,       // Only uploaded images allowed
  AUTO_COMPRESS_IMAGES: true
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// [DECISION P-032] COMMENT MEDIA MODERATION POLICY
// Defines automated and manual moderation for images/GIFs in comments
// ═══════════════════════════════════════════════════════════════════════════════

const COMMENT_MEDIA_MODERATION = {
  // ─────────────────────────────────────────────────────────────────────────────
  // AUTOMATED MODERATION (Pre-publish)
  // ─────────────────────────────────────────────────────────────────────────────
  autoModeration: {
    enabled: true,
    provider: "aws-rekognition",    // AWS Rekognition for image analysis
    fallbackProvider: "google-vision",

    // Categories to block automatically
    blockCategories: [
      "EXPLICIT_NUDITY",            // Adult content
      "NUDITY",                     // Any nudity
      "GRAPHIC_VIOLENCE",           // Gore, graphic violence
      "VIOLENCE",                   // Violence
      "HATE_SYMBOLS",               // Hate speech symbols
      "DRUGS",                      // Drug use
      "TOBACCO",                    // Tobacco use
      "GAMBLING"                    // Gambling content
    ],

    // Categories to flag for review (not auto-block)
    flagCategories: [
      "SUGGESTIVE",                 // Suggestive but not explicit
      "VISUALLY_DISTURBING",        // May be disturbing to some
      "RUDE_GESTURES"               // Offensive gestures
    ],

    // Confidence thresholds
    confidenceThreshold: {
      block: 80,                    // Block if confidence >= 80%
      flag: 60                      // Flag for review if 60-79%
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // USER REPORTING
  // ─────────────────────────────────────────────────────────────────────────────
  userReporting: {
    enabled: true,
    reportThreshold: 3,             // Auto-hide after 3 reports
    uniqueReportersRequired: true,  // Same user can't report twice

    // Report categories
    reportReasons: [
      "INAPPROPRIATE_CONTENT",
      "HARASSMENT",
      "SPAM",
      "MISINFORMATION",
      "COPYRIGHT_VIOLATION",
      "OTHER"
    ],

    // Actions
    actionOnThreshold: "HIDE_PENDING_REVIEW",
    notifyAuthor: false,            // Don't notify until reviewed
    notifyModerators: true
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // MANUAL REVIEW QUEUE
  // ─────────────────────────────────────────────────────────────────────────────
  manualReview: {
    queueEnabled: true,
    priorityFactors: [
      { factor: "REPORT_COUNT", weight: 3 },
      { factor: "AUTO_FLAG_SEVERITY", weight: 2 },
      { factor: "AUTHOR_TRUST_SCORE", weight: -1 },  // Higher trust = lower priority
      { factor: "CONTENT_VISIBILITY", weight: 1 }    // Popular content = higher priority
    ],

    // Moderator actions
    actions: [
      "APPROVE",                    // Content is acceptable
      "REMOVE",                     // Remove content
      "WARN_USER",                  // Approve but warn user
      "BAN_USER",                   // Remove and ban user
      "ESCALATE"                    // Escalate to senior moderator
    ],

    // SLA targets
    slaTargets: {
      critical: 1,                  // 1 hour for critical content
      high: 4,                      // 4 hours for high priority
      normal: 24,                   // 24 hours for normal
      low: 72                       // 72 hours for low priority
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // APPEAL PROCESS
  // ─────────────────────────────────────────────────────────────────────────────
  appeals: {
    enabled: true,
    appealWindowDays: 7,            // Can appeal within 7 days
    maxAppealsPerContent: 1,        // One appeal per removed content
    reviewerMustBeDifferent: true,  // Different moderator reviews appeal

    // Appeal outcomes
    outcomes: [
      "UPHELD",                     // Original decision stands
      "OVERTURNED",                 // Content restored
      "PARTIAL"                     // Modified action (e.g., warning only)
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // REPEAT OFFENDER POLICY
  // ─────────────────────────────────────────────────────────────────────────────
  repeatOffender: {
    strikeSystem: true,
    strikes: [
      { count: 1, action: "WARNING" },
      { count: 2, action: "24H_MEDIA_BAN" },       // Can't post media for 24h
      { count: 3, action: "7D_MEDIA_BAN" },        // Can't post media for 7 days
      { count: 4, action: "30D_COMMENT_BAN" },     // Can't comment for 30 days
      { count: 5, action: "PERMANENT_BAN" }        // Account suspension
    ],
    strikeDecayDays: 90             // Strikes expire after 90 days
  }
}

export { COMMENT_MEDIA_MODERATION }


const CommentStatusSchema = z.enum([
  "VISIBLE",
  "HIDDEN",
  "DELETED",
  "FLAGGED",
  "PENDING_REVIEW"
])

const CommentSchema = z.object({
  id: z.string().cuid(),
  discussionId: z.string().cuid(),
  authorId: z.string().cuid(),

  parentId: z.string().cuid().nullable(),
  depth: z.number().int().min(0).max(COMMENT_CONSTRAINTS.MAX_DEPTH),

  content: z.string().min(COMMENT_CONSTRAINTS.MIN_LENGTH).max(COMMENT_CONSTRAINTS.MAX_LENGTH),
  contentHtml: z.string().max(COMMENT_CONSTRAINTS.MAX_LENGTH * 2),

  mediaUrls: z.array(z.string().url()).max(COMMENT_CONSTRAINTS.MAX_MEDIA_COUNT),

  upvotes: z.number().int().min(0).default(0),
  downvotes: z.number().int().min(0).default(0),
  wilsonScore: z.number().min(0).max(1).default(0),

  replyCount: z.number().int().min(0).default(0),

  status: CommentStatusSchema.default("VISIBLE"),

  isEdited: z.boolean().default(false),
  editedAt: z.date().nullable(),

  isPinned: z.boolean().default(false),
  isCreatorComment: z.boolean().default(false),

  createdAt: z.date(),
  updatedAt: z.date()
})

type CommentStatus = z.infer<typeof CommentStatusSchema>
type Comment = z.infer<typeof CommentSchema>

export {
  COMMENT_CONSTRAINTS,
  CommentStatusSchema,
  CommentSchema
}
export type {
  CommentStatus,
  Comment
}
```


## 10.2.2 Comment Creation

```typescript
const CreateCommentInputSchema = z.object({
  discussionId: z.string().cuid(),
  parentId: z.string().cuid().nullable(),
  content: z.string().min(COMMENT_CONSTRAINTS.MIN_LENGTH).max(COMMENT_CONSTRAINTS.MAX_LENGTH),
  mediaUrls: z.array(z.string().url()).max(COMMENT_CONSTRAINTS.MAX_MEDIA_COUNT).default([])
})

const CreateCommentResultSchema = z.object({
  success: z.boolean(),
  comment: CommentSchema.nullable(),
  error: z.enum([
    "DISCUSSION_NOT_FOUND",
    "DISCUSSION_CLOSED",
    "DISCUSSION_LOCKED",
    "PARENT_NOT_FOUND",
    "MAX_DEPTH_EXCEEDED",
    "NO_WRITE_ACCESS",
    "RATE_LIMITED",
    "CONTENT_FILTERED",
    "USER_BANNED"
  ]).nullable()
})

type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>
type CreateCommentResult = z.infer<typeof CreateCommentResultSchema>


async function createComment(
  userId: string,
  input: CreateCommentInput
): Promise<CreateCommentResult> {
  const [discussion] = await db.select()
    .from(discussions)
    .where(eq(discussions.id, input.discussionId))

  if (!discussion) {
    return { success: false, comment: null, error: "DISCUSSION_NOT_FOUND" }
  }

  if (discussion.status === "CLOSED") {
    return { success: false, comment: null, error: "DISCUSSION_CLOSED" }
  }

  if (discussion.status === "LOCKED" || discussion.status === "ARCHIVED") {
    return { success: false, comment: null, error: "DISCUSSION_LOCKED" }
  }

  const hasAccess = await checkDiscussionWriteAccess(userId, discussion)
  if (!hasAccess) {
    return { success: false, comment: null, error: "NO_WRITE_ACCESS" }
  }

  const isRateLimited = await checkCommentRateLimit(userId)
  if (isRateLimited) {
    return { success: false, comment: null, error: "RATE_LIMITED" }
  }

  let depth = 0
  if (input.parentId) {
    const [parentComment] = await db.select()
      .from(comments)
      .where(eq(comments.id, input.parentId))

    if (!parentComment || parentComment.discussionId !== input.discussionId) {
      return { success: false, comment: null, error: "PARENT_NOT_FOUND" }
    }

    depth = parentComment.depth + 1
    if (depth > COMMENT_CONSTRAINTS.MAX_DEPTH) {
      return { success: false, comment: null, error: "MAX_DEPTH_EXCEEDED" }
    }
  }

  const contentCheck = await checkContentForViolations(input.content)
  if (contentCheck.hasViolations) {
    return { success: false, comment: null, error: "CONTENT_FILTERED" }
  }

  const contentHtml = sanitizeAndRenderMarkdown(input.content)

  const isCreator = discussion.content.creatorId === userId

  const comment = await db.transaction(async (tx) => {
    const [newComment] = await tx.insert(comments)
      .values({
        discussionId: input.discussionId,
        authorId: userId,
        parentId: input.parentId,
        depth,
        content: input.content,
        contentHtml,
        mediaUrls: input.mediaUrls,
        isCreatorComment: isCreator
      })
      .returning()

    await tx.update(discussions)
      .set({
        commentCount: sql`${discussions.commentCount} + 1`,
        lastActivityAt: new Date()
      })
      .where(eq(discussions.id, input.discussionId))

    if (input.parentId) {
      await tx.update(comments)
        .set({
          replyCount: sql`${comments.replyCount} + 1`
        })
        .where(eq(comments.id, input.parentId))
    }

    return newComment
  })

  await triggerCommentNotifications(comment, discussion)

  return { success: true, comment, error: null }
}


async function checkDiscussionWriteAccess(
  userId: string,
  discussion: { id: string; contentId: string; settings: unknown }
): Promise<boolean> {
  const [participation] = await db.select()
    .from(participations)
    .where(and(
      eq(participations.contentId, discussion.contentId),
      eq(participations.participantHash, await generateParticipantHash(userId, discussion.contentId))
    ))

  if (participation) {
    return true
  }

  const [accessRequest] = await db.select()
    .from(discussionAccessRequests)
    .where(and(
      eq(discussionAccessRequests.discussionId, discussion.id),
      eq(discussionAccessRequests.userId, userId),
      eq(discussionAccessRequests.status, "APPROVED")
    ))

  if (accessRequest) {
    return true
  }

  return false
}


async function checkCommentRateLimit(userId: string): Promise<boolean> {
  const [{ count: recentComments }] = await db.select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(and(
      eq(comments.authorId, userId),
      gte(comments.createdAt, new Date(Date.now() - 60 * 1000))
    ))

  return recentComments >= 5
}


// [IMPLEMENTATION] Content moderation - integrate with moderation service
// Checks for: profanity, hate speech, spam, PII, links (if disallowed)
// [REFERENCE] See BIBLE-015 Section 15.4 for business logic rules
async function checkContentForViolations(
  content: string
): Promise<{ hasViolations: boolean; violations: string[] }> {
  const violations: string[] = []

  // 1. Profanity filter (using word list + AI fallback)
  const profanityResult = await checkProfanity(content)
  if (profanityResult.hasProfanity) {
    violations.push("PROFANITY_DETECTED")
  }

  // 2. Spam detection (repeated characters, excessive caps, link spam)
  const spamScore = calculateSpamScore(content)
  if (spamScore > 0.7) {
    violations.push("SPAM_DETECTED")
  }

  // 3. PII detection (email, phone, address patterns)
  const piiPatterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,  // Email
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,                         // Phone
    /\b\d{11}\b/                                              // TC Kimlik
  ]
  for (const pattern of piiPatterns) {
    if (pattern.test(content)) {
      violations.push("PII_DETECTED")
      break
    }
  }

  // 4. Hate speech detection (AI-powered)
  const hateSpeechResult = await detectHateSpeech(content)
  if (hateSpeechResult.isHateSpeech) {
    violations.push("HATE_SPEECH_DETECTED")
  }

  return {
    hasViolations: violations.length > 0,
    violations
  }
}

// Helper: Profanity check using word list
async function checkProfanity(content: string): Promise<{ hasProfanity: boolean }> {
  // Integration with profanity filter service (e.g., PurgoMalum, WebPurify)
  // or local word list with Turkish + English profanity
  const lowerContent = content.toLowerCase()
  const profanityList = await loadProfanityList()  // Cached word list
  const hasProfanity = profanityList.some(word => lowerContent.includes(word))
  return { hasProfanity }
}

// Helper: Calculate spam score
function calculateSpamScore(content: string): number {
  let score = 0

  // Excessive caps (>50% uppercase)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.5) score += 0.3

  // Repeated characters (aaaaa, !!!!!!)
  if (/(.)\1{4,}/.test(content)) score += 0.3

  // Too many links
  const linkCount = (content.match(/https?:\/\//g) || []).length
  if (linkCount > 2) score += 0.4

  return Math.min(score, 1)
}

// Helper: AI-powered hate speech detection
async function detectHateSpeech(content: string): Promise<{ isHateSpeech: boolean }> {
  // Integration with Perspective API or similar service
  // For MVP: return false, implement later with AI service
  return { isHateSpeech: false }
}

// Placeholder for profanity list loader
async function loadProfanityList(): Promise<string[]> {
  // Load from database or static file
  return []
}


// [IMPLEMENTATION] Markdown rendering with XSS sanitization
// Uses: DOMPurify + marked.js
function sanitizeAndRenderMarkdown(content: string): string {
  // Step 1: Parse markdown to HTML using marked
  const rawHtml = marked.parse(content, {
    breaks: true,           // Convert \n to <br>
    gfm: true,              // GitHub Flavored Markdown
    headerIds: false,       // Don't add IDs to headers
    mangle: false           // Don't mangle email addresses
  })

  // Step 2: Sanitize HTML with DOMPurify
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "b", "em", "i", "u",
      "code", "pre", "blockquote",
      "ul", "ol", "li",
      "a", "img"
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class"
    ],
    FORBID_TAGS: ["script", "style", "iframe", "form", "input"],
    FORBID_ATTR: ["onclick", "onerror", "onload", "style"],
    ALLOW_DATA_ATTR: false,
    // Only allow safe URL protocols
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
  })

  return cleanHtml
}

// Markdown configuration for marked.js
const marked = {
  parse: (content: string, options: Record<string, unknown>): string => {
    // Actual implementation uses marked library
    // npm install marked @types/marked
    // import { marked } from 'marked'
    return content  // Placeholder - actual implementation uses library
  }
}

// DOMPurify configuration
const DOMPurify = {
  sanitize: (html: string, config: Record<string, unknown>): string => {
    // Actual implementation uses DOMPurify library
    // npm install dompurify @types/dompurify
    // import DOMPurify from 'dompurify'
    return html  // Placeholder - actual implementation uses library
  }
}


// [IMPLEMENTATION] Generate deterministic hash for participation tracking
// [REFERENCE] See BIBLE-007 Section 7.3.2 for full implementation
// Purpose: Create anonymous but consistent identifier for participation without exposing userId
import { createHmac, randomBytes } from "crypto"

async function generateParticipantHash(userId: string, contentId: string): Promise<string> {
  // Get or create content-specific salt (stored with content, never changes)
  const contentSalt = await getOrCreateContentSalt(contentId)

  // Generate HMAC-SHA256 hash
  // This produces a consistent hash for same user+content but is not reversible
  const hash = createHmac("sha256", contentSalt)
    .update(userId)
    .digest("hex")

  // Return truncated hash (first 16 chars is sufficient for uniqueness)
  return hash.substring(0, 16)
}

// Get or create a unique salt for each content item
async function getOrCreateContentSalt(contentId: string): Promise<string> {
  // Check if salt exists in database
  const content = await db.content.findUnique({
    where: { id: contentId },
    select: { participantSalt: true }
  })

  if (content?.participantSalt) {
    return content.participantSalt
  }

  // Generate new salt (32 bytes = 64 hex chars)
  const newSalt = randomBytes(32).toString("hex")

  // Store salt with content
  await db.content.update({
    where: { id: contentId },
    data: { participantSalt: newSalt }
  })

  return newSalt
}


// [IMPLEMENTATION] Notification triggers for comment events
// [REFERENCE] See BIBLE-012 Section 12.2 for notification event processing
async function triggerCommentNotifications(
  comment: Comment,
  discussion: Discussion
): Promise<void> {
  const notificationsToCreate: NotificationPayload[] = []

  // 1. Notify parent comment author (if this is a reply)
  if (comment.parentId) {
    const parentComment = await db.comment.findUnique({
      where: { id: comment.parentId },
      select: { authorId: true }
    })

    if (parentComment && parentComment.authorId !== comment.authorId) {
      notificationsToCreate.push({
        userId: parentComment.authorId,
        type: "COMMENT_REPLY",
        title: "Yorumunuza yanıt geldi",
        body: truncate(comment.content, 100),
        data: {
          commentId: comment.id,
          discussionId: discussion.id,
          contentId: discussion.contentId
        }
      })
    }
  }

  // 2. Notify content creator (if not the commenter)
  const content = await db.content.findUnique({
    where: { id: discussion.contentId },
    select: { creatorId: true }
  })

  if (content && content.creatorId !== comment.authorId) {
    notificationsToCreate.push({
      userId: content.creatorId,
      type: "COMMENT_ON_CONTENT",
      title: "İçeriğinize yorum yapıldı",
      body: truncate(comment.content, 100),
      data: {
        commentId: comment.id,
        discussionId: discussion.id,
        contentId: discussion.contentId
      }
    })
  }

  // 3. Notify mentioned users (@username)
  const mentionPattern = /@([a-zA-Z0-9_]+)/g
  const mentions = comment.content.match(mentionPattern) || []

  for (const mention of mentions) {
    const username = mention.substring(1)  // Remove @ prefix
    const mentionedUser = await db.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (mentionedUser && mentionedUser.id !== comment.authorId) {
      notificationsToCreate.push({
        userId: mentionedUser.id,
        type: "MENTION_IN_COMMENT",
        title: "Bir yorumda bahsedildiniz",
        body: truncate(comment.content, 100),
        data: {
          commentId: comment.id,
          discussionId: discussion.id,
          contentId: discussion.contentId
        }
      })
    }
  }

  // 4. Send all notifications via notification service
  // [REFERENCE] BIBLE-012 Section 12.2 for NotificationService
  await NotificationService.sendBatch(notificationsToCreate)
}

// Helper: Truncate text with ellipsis
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + "..."
}

interface NotificationPayload {
  userId: string
  type: "COMMENT_REPLY" | "COMMENT_ON_CONTENT" | "MENTION_IN_COMMENT"
  title: string
  body: string
  data: Record<string, string>
}

interface Discussion {
  id: string
  contentId: string
}

// Placeholder for notification service
const NotificationService = {
  sendBatch: async (notifications: NotificationPayload[]): Promise<void> => {
    // Implementation in BIBLE-012
  }
}

export {
  CreateCommentInputSchema,
  CreateCommentResultSchema,
  createComment
}
export type {
  CreateCommentInput,
  CreateCommentResult
}
```


## 10.2.3 Comment Editing & Deletion

```typescript
const EditCommentInputSchema = z.object({
  commentId: z.string().cuid(),
  content: z.string().min(COMMENT_CONSTRAINTS.MIN_LENGTH).max(COMMENT_CONSTRAINTS.MAX_LENGTH)
})

const EditCommentResultSchema = z.object({
  success: z.boolean(),
  comment: CommentSchema.nullable(),
  error: z.enum([
    "COMMENT_NOT_FOUND",
    "NOT_AUTHOR",
    "EDIT_WINDOW_EXPIRED",
    "DISCUSSION_LOCKED",
    "CONTENT_FILTERED"
  ]).nullable()
})

type EditCommentInput = z.infer<typeof EditCommentInputSchema>
type EditCommentResult = z.infer<typeof EditCommentResultSchema>


async function editComment(
  userId: string,
  input: EditCommentInput
): Promise<EditCommentResult> {
  const [comment] = await db.select()
    .from(comments)
    .where(eq(comments.id, input.commentId))

  const [commentDiscussion] = comment ? await db.select()
    .from(discussions)
    .where(eq(discussions.id, comment.discussionId)) : []

  if (!comment) {
    return { success: false, comment: null, error: "COMMENT_NOT_FOUND" }
  }

  if (comment.authorId !== userId) {
    return { success: false, comment: null, error: "NOT_AUTHOR" }
  }

  const editWindowMs = COMMENT_CONSTRAINTS.EDIT_WINDOW_MINUTES * 60 * 1000
  const timeSinceCreation = Date.now() - comment.createdAt.getTime()
  if (timeSinceCreation > editWindowMs) {
    return { success: false, comment: null, error: "EDIT_WINDOW_EXPIRED" }
  }

  if (commentDiscussion.status === "LOCKED" || commentDiscussion.status === "ARCHIVED") {
    return { success: false, comment: null, error: "DISCUSSION_LOCKED" }
  }

  const contentCheck = await checkContentForViolations(input.content)
  if (contentCheck.hasViolations) {
    return { success: false, comment: null, error: "CONTENT_FILTERED" }
  }

  const contentHtml = sanitizeAndRenderMarkdown(input.content)

  const [updatedComment] = await db.update(comments)
    .set({
      content: input.content,
      contentHtml,
      isEdited: true,
      editedAt: new Date()
    })
    .where(eq(comments.id, input.commentId))
    .returning()

  return { success: true, comment: updatedComment, error: null }
}


const DeleteCommentResultSchema = z.object({
  success: z.boolean(),
  error: z.enum([
    "COMMENT_NOT_FOUND",
    "NOT_AUTHOR",
    "ALREADY_DELETED"
  ]).nullable()
})

type DeleteCommentResult = z.infer<typeof DeleteCommentResultSchema>


async function deleteComment(
  userId: string,
  commentId: string
): Promise<DeleteCommentResult> {
  const [comment] = await db.select()
    .from(comments)
    .where(eq(comments.id, commentId))

  if (!comment) {
    return { success: false, error: "COMMENT_NOT_FOUND" }
  }

  if (comment.authorId !== userId) {
    return { success: false, error: "NOT_AUTHOR" }
  }

  if (comment.status === "DELETED") {
    return { success: false, error: "ALREADY_DELETED" }
  }

  if (comment.replyCount > 0 && COMMENT_CONSTRAINTS.DELETE_SOFT_AFTER_REPLIES) {
    await db.update(comments)
      .set({
        status: "DELETED",
        content: "[deleted]",
        contentHtml: "<p>[deleted]</p>"
      })
      .where(eq(comments.id, commentId))
  } else {
    await db.transaction(async (tx) => {
      await tx.delete(comments)
        .where(eq(comments.id, commentId))

      await tx.update(discussions)
        .set({
          commentCount: sql`${discussions.commentCount} - 1`
        })
        .where(eq(discussions.id, comment.discussionId))

      if (comment.parentId) {
        await tx.update(comments)
          .set({
            replyCount: sql`${comments.replyCount} - 1`
          })
          .where(eq(comments.id, comment.parentId))
      }
    })
  }

  return { success: true, error: null }
}

export {
  EditCommentInputSchema,
  EditCommentResultSchema,
  DeleteCommentResultSchema,
  editComment,
  deleteComment
}
export type {
  EditCommentInput,
  EditCommentResult,
  DeleteCommentResult
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 10.3 VOTING SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 10.3.1 Vote Types & Rules

```typescript
const VoteTypeSchema = z.enum(["UP", "DOWN"])

const CommentVoteSchema = z.object({
  id: z.string().cuid(),
  commentId: z.string().cuid(),
  userId: z.string().cuid(),
  voteType: VoteTypeSchema,
  createdAt: z.date()
})

type VoteType = z.infer<typeof VoteTypeSchema>
type CommentVote = z.infer<typeof CommentVoteSchema>


const VOTE_RULES = {
  ALLOW_SELF_VOTE: false,
  ALLOW_VOTE_CHANGE: true,
  ALLOW_VOTE_REMOVAL: true,
  VOTE_COOLDOWN_MS: 1000
} as const
```


## 10.3.2 Wilson Score Implementation

```typescript
const WILSON_SCORE_CONFIG = {
  Z_SCORE: 1.96,
  MIN_VOTES_FOR_RANKING: 1,
  DECAY_ENABLED: false,
  DECAY_HALF_LIFE_HOURS: 72
} as const


function calculateWilsonScore(upvotes: number, downvotes: number): number {
  const n = upvotes + downvotes

  if (n === 0) {
    return 0
  }

  const z = WILSON_SCORE_CONFIG.Z_SCORE
  const phat = upvotes / n

  const numerator = phat + (z * z) / (2 * n) - z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n)
  const denominator = 1 + (z * z) / n

  return numerator / denominator
}


function calculateWilsonScoreWithDecay(
  upvotes: number,
  downvotes: number,
  createdAt: Date
): number {
  const baseScore = calculateWilsonScore(upvotes, downvotes)

  if (!WILSON_SCORE_CONFIG.DECAY_ENABLED) {
    return baseScore
  }

  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  const decayFactor = Math.pow(0.5, ageHours / WILSON_SCORE_CONFIG.DECAY_HALF_LIFE_HOURS)

  return baseScore * decayFactor
}

export {
  WILSON_SCORE_CONFIG,
  calculateWilsonScore,
  calculateWilsonScoreWithDecay
}
```


## 10.3.3 Vote Processing

```typescript
const VoteCommentInputSchema = z.object({
  commentId: z.string().cuid(),
  voteType: VoteTypeSchema
})

const VoteCommentResultSchema = z.object({
  success: z.boolean(),
  newUpvotes: z.number().int().min(0),
  newDownvotes: z.number().int().min(0),
  newWilsonScore: z.number().min(0).max(1),
  userVote: VoteTypeSchema.nullable(),
  error: z.enum([
    "COMMENT_NOT_FOUND",
    "CANNOT_VOTE_OWN_COMMENT",
    "NO_VOTE_ACCESS",
    "RATE_LIMITED"
  ]).nullable()
})

type VoteCommentInput = z.infer<typeof VoteCommentInputSchema>
type VoteCommentResult = z.infer<typeof VoteCommentResultSchema>


async function voteComment(
  userId: string,
  input: VoteCommentInput
): Promise<VoteCommentResult> {
  const [comment] = await db.select()
    .from(comments)
    .where(eq(comments.id, input.commentId))

  if (!comment) {
    return {
      success: false,
      newUpvotes: 0,
      newDownvotes: 0,
      newWilsonScore: 0,
      userVote: null,
      error: "COMMENT_NOT_FOUND"
    }
  }

  if (!VOTE_RULES.ALLOW_SELF_VOTE && comment.authorId === userId) {
    return {
      success: false,
      newUpvotes: comment.upvotes,
      newDownvotes: comment.downvotes,
      newWilsonScore: comment.wilsonScore,
      userVote: null,
      error: "CANNOT_VOTE_OWN_COMMENT"
    }
  }

  const hasAccess = await checkDiscussionWriteAccess(userId, comment.discussion)
  if (!hasAccess) {
    return {
      success: false,
      newUpvotes: comment.upvotes,
      newDownvotes: comment.downvotes,
      newWilsonScore: comment.wilsonScore,
      userVote: null,
      error: "NO_VOTE_ACCESS"
    }
  }

  const [existingVote] = await db.select()
    .from(commentVotes)
    .where(and(
      eq(commentVotes.commentId, input.commentId),
      eq(commentVotes.userId, userId)
    ))

  let upvoteDelta = 0
  let downvoteDelta = 0
  let newUserVote: VoteType | null = input.voteType

  if (existingVote) {
    if (existingVote.voteType === input.voteType) {
      if (VOTE_RULES.ALLOW_VOTE_REMOVAL) {
        await db.delete(commentVotes)
          .where(eq(commentVotes.id, existingVote.id))
        if (input.voteType === "UP") {
          upvoteDelta = -1
        } else {
          downvoteDelta = -1
        }
        newUserVote = null
      }
    } else if (VOTE_RULES.ALLOW_VOTE_CHANGE) {
      await db.update(commentVotes)
        .set({ voteType: input.voteType })
        .where(eq(commentVotes.id, existingVote.id))
      if (input.voteType === "UP") {
        upvoteDelta = 1
        downvoteDelta = -1
      } else {
        upvoteDelta = -1
        downvoteDelta = 1
      }
    }
  } else {
    await db.insert(commentVotes)
      .values({
        commentId: input.commentId,
        userId,
        voteType: input.voteType
      })
    if (input.voteType === "UP") {
      upvoteDelta = 1
    } else {
      downvoteDelta = 1
    }
  }

  const newUpvotes = comment.upvotes + upvoteDelta
  const newDownvotes = comment.downvotes + downvoteDelta
  const newWilsonScore = calculateWilsonScore(newUpvotes, newDownvotes)

  await db.update(comments)
    .set({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      wilsonScore: newWilsonScore
    })
    .where(eq(comments.id, input.commentId))

  return {
    success: true,
    newUpvotes,
    newDownvotes,
    newWilsonScore,
    userVote: newUserVote,
    error: null
  }
}

export {
  VoteTypeSchema,
  CommentVoteSchema,
  VOTE_RULES,
  VoteCommentInputSchema,
  VoteCommentResultSchema,
  voteComment
}
export type {
  VoteType,
  CommentVote,
  VoteCommentInput,
  VoteCommentResult
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 10.4 DISCUSSION ACCESS REQUESTS
# ══════════════════════════════════════════════════════════════════════════════

## 10.4.1 Access Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ACCESS REQUEST FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Non-Participant User                                                       │
│         │                                                                   │
│         │ Wants to comment                                                  │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SUBMIT REQUEST                                   │   │
│  │  • Reason text (min 100 characters)                                 │   │
│  │  • One request per user per discussion                              │   │
│  │  • Cannot request if previously rejected                            │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│                        ┌──────────┐                                         │
│                        │ PENDING  │                                         │
│                        └────┬─────┘                                         │
│                             │                                               │
│              ┌──────────────┼──────────────┐                                │
│              │              │              │                                │
│              ▼              ▼              ▼                                │
│         ┌────────┐    ┌──────────┐   ┌───────────┐                         │
│         │APPROVED│    │ REJECTED │   │  EXPIRED  │                         │
│         └───┬────┘    └──────────┘   └───────────┘                         │
│             │                                                               │
│             ▼                                                               │
│      User can now                                                           │
│      read & write                                                           │
│                                                                             │
│  Expiration: 7 days if no response from creator                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 10.4.2 Access Request Schema

```typescript
const ACCESS_REQUEST_CONSTRAINTS = {
  MIN_REASON_LENGTH: 100,
  MAX_REASON_LENGTH: 1000,
  EXPIRATION_DAYS: 7,
  MAX_PENDING_PER_USER: 5
} as const


const AccessRequestStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
  "WITHDRAWN"
])

const DiscussionAccessRequestSchema = z.object({
  id: z.string().cuid(),
  discussionId: z.string().cuid(),
  userId: z.string().cuid(),

  reason: z.string()
    .min(ACCESS_REQUEST_CONSTRAINTS.MIN_REASON_LENGTH)
    .max(ACCESS_REQUEST_CONSTRAINTS.MAX_REASON_LENGTH),

  status: AccessRequestStatusSchema.default("PENDING"),

  reviewedBy: z.string().cuid().nullable(),
  reviewedAt: z.date().nullable(),
  reviewNote: z.string().max(500).nullable(),

  expiresAt: z.date(),

  createdAt: z.date(),
  updatedAt: z.date()
})

type AccessRequestStatus = z.infer<typeof AccessRequestStatusSchema>
type DiscussionAccessRequest = z.infer<typeof DiscussionAccessRequestSchema>


const CreateAccessRequestInputSchema = z.object({
  discussionId: z.string().cuid(),
  reason: z.string()
    .min(ACCESS_REQUEST_CONSTRAINTS.MIN_REASON_LENGTH)
    .max(ACCESS_REQUEST_CONSTRAINTS.MAX_REASON_LENGTH)
})

const CreateAccessRequestResultSchema = z.object({
  success: z.boolean(),
  request: DiscussionAccessRequestSchema.nullable(),
  error: z.enum([
    "DISCUSSION_NOT_FOUND",
    "ALREADY_HAS_ACCESS",
    "ALREADY_REQUESTED",
    "PREVIOUSLY_REJECTED",
    "TOO_MANY_PENDING",
    "REASON_TOO_SHORT"
  ]).nullable()
})

type CreateAccessRequestInput = z.infer<typeof CreateAccessRequestInputSchema>
type CreateAccessRequestResult = z.infer<typeof CreateAccessRequestResultSchema>


async function createAccessRequest(
  userId: string,
  input: CreateAccessRequestInput
): Promise<CreateAccessRequestResult> {
  const [discussion] = await db.select()
    .from(discussions)
    .where(eq(discussions.id, input.discussionId))

  if (!discussion) {
    return { success: false, request: null, error: "DISCUSSION_NOT_FOUND" }
  }

  const hasAccess = await checkDiscussionWriteAccess(userId, discussion)
  if (hasAccess) {
    return { success: false, request: null, error: "ALREADY_HAS_ACCESS" }
  }

  const [existingRequest] = await db.select()
    .from(discussionAccessRequests)
    .where(and(
      eq(discussionAccessRequests.discussionId, input.discussionId),
      eq(discussionAccessRequests.userId, userId)
    ))

  if (existingRequest) {
    if (existingRequest.status === "PENDING") {
      return { success: false, request: null, error: "ALREADY_REQUESTED" }
    }
    if (existingRequest.status === "REJECTED") {
      return { success: false, request: null, error: "PREVIOUSLY_REJECTED" }
    }
  }

  const [{ count: pendingCount }] = await db.select({ count: sql<number>`count(*)` })
    .from(discussionAccessRequests)
    .where(and(
      eq(discussionAccessRequests.userId, userId),
      eq(discussionAccessRequests.status, "PENDING")
    ))

  if (pendingCount >= ACCESS_REQUEST_CONSTRAINTS.MAX_PENDING_PER_USER) {
    return { success: false, request: null, error: "TOO_MANY_PENDING" }
  }

  const expiresAt = new Date(Date.now() + ACCESS_REQUEST_CONSTRAINTS.EXPIRATION_DAYS * 24 * 60 * 60 * 1000)

  const [request] = await db.insert(discussionAccessRequests)
    .values({
      discussionId: input.discussionId,
      userId,
      reason: input.reason,
      expiresAt
    })
    .returning()

  await notifyCreatorOfAccessRequest(discussion, request)

  return { success: true, request, error: null }
}


const ReviewAccessRequestInputSchema = z.object({
  requestId: z.string().cuid(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().max(500).optional()
})

const ReviewAccessRequestResultSchema = z.object({
  success: z.boolean(),
  error: z.enum([
    "REQUEST_NOT_FOUND",
    "NOT_AUTHORIZED",
    "ALREADY_REVIEWED",
    "REQUEST_EXPIRED"
  ]).nullable()
})

type ReviewAccessRequestInput = z.infer<typeof ReviewAccessRequestInputSchema>
type ReviewAccessRequestResult = z.infer<typeof ReviewAccessRequestResultSchema>


async function reviewAccessRequest(
  reviewerId: string,
  input: ReviewAccessRequestInput
): Promise<ReviewAccessRequestResult> {
  const [request] = await db.select()
    .from(discussionAccessRequests)
    .where(eq(discussionAccessRequests.id, input.requestId))

  if (!request) {
    return { success: false, error: "REQUEST_NOT_FOUND" }
  }

  const isCreator = request.discussion.content.creatorId === reviewerId
  const isAdmin = await checkUserIsAdmin(reviewerId)

  if (!isCreator && !isAdmin) {
    return { success: false, error: "NOT_AUTHORIZED" }
  }

  if (request.status !== "PENDING") {
    return { success: false, error: "ALREADY_REVIEWED" }
  }

  if (request.expiresAt < new Date()) {
    await db.update(discussionAccessRequests)
      .set({ status: "EXPIRED" })
      .where(eq(discussionAccessRequests.id, input.requestId))
    return { success: false, error: "REQUEST_EXPIRED" }
  }

  await db.update(discussionAccessRequests)
    .set({
      status: input.decision,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: input.note ?? null
    })
    .where(eq(discussionAccessRequests.id, input.requestId))

  await notifyUserOfAccessRequestDecision(request, input.decision)

  return { success: true, error: null }
}


async function notifyCreatorOfAccessRequest(
  discussion: unknown,
  request: DiscussionAccessRequest
): Promise<void> {
}

async function notifyUserOfAccessRequestDecision(
  request: DiscussionAccessRequest,
  decision: "APPROVED" | "REJECTED"
): Promise<void> {
}

async function checkUserIsAdmin(userId: string): Promise<boolean> {
  return false
}

export {
  ACCESS_REQUEST_CONSTRAINTS,
  AccessRequestStatusSchema,
  DiscussionAccessRequestSchema,
  CreateAccessRequestInputSchema,
  CreateAccessRequestResultSchema,
  ReviewAccessRequestInputSchema,
  ReviewAccessRequestResultSchema,
  createAccessRequest,
  reviewAccessRequest
}
export type {
  AccessRequestStatus,
  DiscussionAccessRequest,
  CreateAccessRequestInput,
  CreateAccessRequestResult,
  ReviewAccessRequestInput,
  ReviewAccessRequestResult
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 10.5 COMMENT SORTING & PAGINATION
# ══════════════════════════════════════════════════════════════════════════════

## 10.5.1 Sort Algorithms

```typescript
const CommentSortOrderSchema = z.enum([
  "BEST",
  "TOP",
  "NEW",
  "OLD",
  "CONTROVERSIAL"
])

type CommentSortOrder = z.infer<typeof CommentSortOrderSchema>


const SORT_CONFIGS: Record<CommentSortOrder, {
  orderBy: Record<string, "asc" | "desc">
  description: string
}> = {
  BEST: {
    orderBy: { wilsonScore: "desc" },
    description: "Highest confidence positive comments first"
  },
  TOP: {
    orderBy: { upvotes: "desc" },
    description: "Most upvoted comments first"
  },
  NEW: {
    orderBy: { createdAt: "desc" },
    description: "Most recent comments first"
  },
  OLD: {
    orderBy: { createdAt: "asc" },
    description: "Oldest comments first"
  },
  CONTROVERSIAL: {
    orderBy: { downvotes: "desc" },
    description: "Most debated comments first"
  }
}


function calculateControversyScore(upvotes: number, downvotes: number): number {
  const total = upvotes + downvotes
  if (total === 0) return 0

  const balance = 1 - Math.abs(upvotes - downvotes) / total

  return total * balance
}

export {
  CommentSortOrderSchema,
  SORT_CONFIGS,
  calculateControversyScore
}
export type {
  CommentSortOrder
}
```


## 10.5.2 Pagination Strategy

```typescript
const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_REPLY_DEPTH: 2,
  MAX_REPLY_DEPTH: 3,
  REPLIES_PER_PARENT: 3,
  COLLAPSE_THRESHOLD: 5
} as const


const GetCommentsInputSchema = z.object({
  discussionId: z.string().cuid(),
  sortOrder: CommentSortOrderSchema.default("BEST"),
  parentId: z.string().cuid().nullable().default(null),

  cursor: z.string().cuid().nullable().default(null),
  limit: z.number().int().min(1).max(PAGINATION_CONFIG.MAX_PAGE_SIZE).default(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE),

  includeReplies: z.boolean().default(true),
  replyDepth: z.number().int().min(0).max(PAGINATION_CONFIG.MAX_REPLY_DEPTH).default(PAGINATION_CONFIG.DEFAULT_REPLY_DEPTH),
  repliesPerParent: z.number().int().min(1).max(20).default(PAGINATION_CONFIG.REPLIES_PER_PARENT)
})

const CommentWithRepliesSchema: z.ZodType<CommentWithReplies> = z.lazy(() =>
  CommentSchema.extend({
    replies: z.array(CommentWithRepliesSchema),
    hasMoreReplies: z.boolean(),
    totalReplyCount: z.number().int().min(0)
  })
)

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[]
  hasMoreReplies: boolean
  totalReplyCount: number
}

const GetCommentsResultSchema = z.object({
  comments: z.array(CommentWithRepliesSchema),
  nextCursor: z.string().cuid().nullable(),
  hasMore: z.boolean(),
  totalCount: z.number().int().min(0)
})

type GetCommentsInput = z.infer<typeof GetCommentsInputSchema>
type GetCommentsResult = z.infer<typeof GetCommentsResultSchema>


async function getComments(
  userId: string | null,
  input: GetCommentsInput
): Promise<GetCommentsResult> {
  const [discussion] = await db.select()
    .from(discussions)
    .where(eq(discussions.id, input.discussionId))

  if (!discussion) {
    return { comments: [], nextCursor: null, hasMore: false, totalCount: 0 }
  }

  const sortConfig = SORT_CONFIGS[input.sortOrder]

  const whereClause = {
    discussionId: input.discussionId,
    parentId: input.parentId,
    status: { in: ["VISIBLE", "FLAGGED"] as CommentStatus[] }
  }

  const [{ count: totalCount }] = await db.select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(and(...Object.entries(whereClause).map(([k, v]) => eq(comments[k], v))))

  let cursorClause = {}
  if (input.cursor) {
    cursorClause = {
      cursor: { id: input.cursor },
      skip: 1
    }
  }

  const rootComments = await db.select()
    .from(comments)
    .where(and(...Object.entries(whereClause).map(([k, v]) => eq(comments[k], v))))
    .orderBy(desc(comments.isPinned), desc(comments.wilsonScore))
    .limit(input.limit + 1)

  const hasMore = rootComments.length > input.limit
  const comments = hasMore ? rootComments.slice(0, -1) : rootComments
  const nextCursor = hasMore ? comments[comments.length - 1].id : null

  let commentsWithReplies: CommentWithReplies[]

  if (input.includeReplies && input.replyDepth > 0) {
    commentsWithReplies = await Promise.all(
      comments.map(comment => loadRepliesRecursive(
        comment,
        input.replyDepth,
        input.repliesPerParent,
        input.sortOrder
      ))
    )
  } else {
    commentsWithReplies = comments.map(comment => ({
      ...comment,
      replies: [],
      hasMoreReplies: comment.replyCount > 0,
      totalReplyCount: comment.replyCount
    }))
  }

  if (userId) {
    const commentIds = collectAllCommentIds(commentsWithReplies)
    const userVotes = await db.select()
      .from(commentVotes)
      .where(and(
        inArray(commentVotes.commentId, commentIds),
        eq(commentVotes.userId, userId)
      ))
    const voteMap = new Map(userVotes.map(v => [v.commentId, v.voteType]))
    attachUserVotes(commentsWithReplies, voteMap)
  }

  return {
    comments: commentsWithReplies,
    nextCursor,
    hasMore,
    totalCount
  }
}


async function loadRepliesRecursive(
  comment: Comment,
  remainingDepth: number,
  repliesPerParent: number,
  sortOrder: CommentSortOrder
): Promise<CommentWithReplies> {
  if (remainingDepth <= 0 || comment.replyCount === 0) {
    return {
      ...comment,
      replies: [],
      hasMoreReplies: comment.replyCount > 0,
      totalReplyCount: comment.replyCount
    }
  }

  const sortConfig = SORT_CONFIGS[sortOrder]

  const replies = await db.select()
    .from(comments)
    .where(and(
      eq(comments.parentId, comment.id),
      inArray(comments.status, ["VISIBLE", "FLAGGED"])
    ))
    .orderBy(desc(comments.wilsonScore))
    .limit(repliesPerParent + 1)

  const hasMoreReplies = replies.length > repliesPerParent
  const limitedReplies = hasMoreReplies ? replies.slice(0, -1) : replies

  const repliesWithNested = await Promise.all(
    limitedReplies.map(reply => loadRepliesRecursive(
      reply,
      remainingDepth - 1,
      repliesPerParent,
      sortOrder
    ))
  )

  return {
    ...comment,
    replies: repliesWithNested,
    hasMoreReplies,
    totalReplyCount: comment.replyCount
  }
}


function collectAllCommentIds(comments: CommentWithReplies[]): string[] {
  const ids: string[] = []

  function collect(items: CommentWithReplies[]) {
    for (const item of items) {
      ids.push(item.id)
      if (item.replies.length > 0) {
        collect(item.replies)
      }
    }
  }

  collect(comments)
  return ids
}


function attachUserVotes(
  comments: CommentWithReplies[],
  voteMap: Map<string, VoteType>
): void {
  for (const comment of comments) {
    (comment as any).userVote = voteMap.get(comment.id) ?? null
    if (comment.replies.length > 0) {
      attachUserVotes(comment.replies, voteMap)
    }
  }
}

export {
  PAGINATION_CONFIG,
  GetCommentsInputSchema,
  CommentWithRepliesSchema,
  GetCommentsResultSchema,
  getComments
}
export type {
  CommentWithReplies,
  GetCommentsInput,
  GetCommentsResult
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 10.6 MODERATION SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 10.6.1 Report System

```typescript
const ReportReasonSchema = z.enum([
  "SPAM",
  "HARASSMENT",
  "HATE_SPEECH",
  "MISINFORMATION",
  "INAPPROPRIATE_CONTENT",
  "OFF_TOPIC",
  "PERSONAL_ATTACK",
  "DOXXING",
  "OTHER"
])

const ReportStatusSchema = z.enum([
  "PENDING",
  "REVIEWING",
  "RESOLVED_VALID",
  "RESOLVED_INVALID",
  "DISMISSED"
])

const CommentReportSchema = z.object({
  id: z.string().cuid(),
  commentId: z.string().cuid(),
  reporterId: z.string().cuid(),

  reason: ReportReasonSchema,
  details: z.string().max(1000).nullable(),

  status: ReportStatusSchema.default("PENDING"),

  reviewedBy: z.string().cuid().nullable(),
  reviewedAt: z.date().nullable(),
  reviewNote: z.string().max(500).nullable(),
  actionTaken: z.enum([
    "NO_ACTION",
    "WARNING_ISSUED",
    "COMMENT_HIDDEN",
    "COMMENT_DELETED",
    "USER_WARNED",
    "USER_SUSPENDED"
  ]).nullable(),

  createdAt: z.date()
})

type ReportReason = z.infer<typeof ReportReasonSchema>
type ReportStatus = z.infer<typeof ReportStatusSchema>
type CommentReport = z.infer<typeof CommentReportSchema>


const REPORT_CONFIG = {
  MAX_REPORTS_PER_USER_PER_DAY: 10,
  AUTO_HIDE_THRESHOLD: 5,
  DUPLICATE_WINDOW_HOURS: 24
} as const


const CreateReportInputSchema = z.object({
  commentId: z.string().cuid(),
  reason: ReportReasonSchema,
  details: z.string().max(1000).optional()
})

const CreateReportResultSchema = z.object({
  success: z.boolean(),
  report: CommentReportSchema.nullable(),
  error: z.enum([
    "COMMENT_NOT_FOUND",
    "CANNOT_REPORT_OWN",
    "ALREADY_REPORTED",
    "RATE_LIMITED"
  ]).nullable()
})

type CreateReportInput = z.infer<typeof CreateReportInputSchema>
type CreateReportResult = z.infer<typeof CreateReportResultSchema>


async function createReport(
  userId: string,
  input: CreateReportInput
): Promise<CreateReportResult> {
  const [comment] = await db.select()
    .from(comments)
    .where(eq(comments.id, input.commentId))

  if (!comment) {
    return { success: false, report: null, error: "COMMENT_NOT_FOUND" }
  }

  if (comment.authorId === userId) {
    return { success: false, report: null, error: "CANNOT_REPORT_OWN" }
  }

  const [existingReport] = await db.select()
    .from(commentReports)
    .where(and(
      eq(commentReports.commentId, input.commentId),
      eq(commentReports.reporterId, userId),
      gte(commentReports.createdAt, new Date(Date.now() - REPORT_CONFIG.DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000))
    ))

  if (existingReport) {
    return { success: false, report: null, error: "ALREADY_REPORTED" }
  }

  const [{ count: todayReportCount }] = await db.select({ count: sql<number>`count(*)` })
    .from(commentReports)
    .where(and(
      eq(commentReports.reporterId, userId),
      gte(commentReports.createdAt, new Date(new Date().setHours(0, 0, 0, 0)))
    ))

  if (todayReportCount >= REPORT_CONFIG.MAX_REPORTS_PER_USER_PER_DAY) {
    return { success: false, report: null, error: "RATE_LIMITED" }
  }

  const [report] = await db.insert(commentReports)
    .values({
      commentId: input.commentId,
      reporterId: userId,
      reason: input.reason,
      details: input.details ?? null
    })
    .returning()

  const [{ count: totalReports }] = await db.select({ count: sql<number>`count(*)` })
    .from(commentReports)
    .where(and(
      eq(commentReports.commentId, input.commentId),
      eq(commentReports.status, "PENDING")
    ))

  if (totalReports >= REPORT_CONFIG.AUTO_HIDE_THRESHOLD) {
    await db.update(comments)
      .set({ status: "FLAGGED" })
      .where(eq(comments.id, input.commentId))
  }

  return { success: true, report, error: null }
}

export {
  ReportReasonSchema,
  ReportStatusSchema,
  CommentReportSchema,
  REPORT_CONFIG,
  CreateReportInputSchema,
  CreateReportResultSchema,
  createReport
}
export type {
  ReportReason,
  ReportStatus,
  CommentReport,
  CreateReportInput,
  CreateReportResult
}
```


## 10.6.2 Moderation Actions

```typescript
const ModerationActionSchema = z.enum([
  "HIDE_COMMENT",
  "UNHIDE_COMMENT",
  "DELETE_COMMENT",
  "PIN_COMMENT",
  "UNPIN_COMMENT",
  "LOCK_DISCUSSION",
  "UNLOCK_DISCUSSION",
  "BAN_USER_FROM_DISCUSSION",
  "UNBAN_USER_FROM_DISCUSSION"
])

const ModerationLogSchema = z.object({
  id: z.string().cuid(),
  discussionId: z.string().cuid(),
  commentId: z.string().cuid().nullable(),
  targetUserId: z.string().cuid().nullable(),

  action: ModerationActionSchema,
  reason: z.string().max(500).nullable(),

  performedBy: z.string().cuid(),
  performedAt: z.date()
})

type ModerationAction = z.infer<typeof ModerationActionSchema>
type ModerationLog = z.infer<typeof ModerationLogSchema>


const ExecuteModerationInputSchema = z.object({
  discussionId: z.string().cuid(),
  action: ModerationActionSchema,
  commentId: z.string().cuid().optional(),
  targetUserId: z.string().cuid().optional(),
  reason: z.string().max(500).optional()
})

const ExecuteModerationResultSchema = z.object({
  success: z.boolean(),
  error: z.enum([
    "DISCUSSION_NOT_FOUND",
    "COMMENT_NOT_FOUND",
    "NOT_AUTHORIZED",
    "INVALID_ACTION",
    "ALREADY_IN_STATE"
  ]).nullable()
})

type ExecuteModerationInput = z.infer<typeof ExecuteModerationInputSchema>
type ExecuteModerationResult = z.infer<typeof ExecuteModerationResultSchema>


async function executeModeration(
  moderatorId: string,
  input: ExecuteModerationInput
): Promise<ExecuteModerationResult> {
  const [discussion] = await db.select()
    .from(discussions)
    .where(eq(discussions.id, input.discussionId))

  if (!discussion) {
    return { success: false, error: "DISCUSSION_NOT_FOUND" }
  }

  const isCreator = discussion.content.creatorId === moderatorId
  const isAdmin = await checkUserIsAdmin(moderatorId)
  const isOrgAdmin = await checkUserIsOrgAdmin(moderatorId, discussion.content.organizationId)

  if (!isCreator && !isAdmin && !isOrgAdmin) {
    return { success: false, error: "NOT_AUTHORIZED" }
  }

  switch (input.action) {
    case "HIDE_COMMENT":
    case "UNHIDE_COMMENT":
    case "DELETE_COMMENT":
    case "PIN_COMMENT":
    case "UNPIN_COMMENT":
      if (!input.commentId) {
        return { success: false, error: "INVALID_ACTION" }
      }
      return await executeCommentModeration(moderatorId, input as ExecuteModerationInput & { commentId: string })

    case "LOCK_DISCUSSION":
    case "UNLOCK_DISCUSSION":
      return await executeDiscussionModeration(moderatorId, input)

    case "BAN_USER_FROM_DISCUSSION":
    case "UNBAN_USER_FROM_DISCUSSION":
      if (!input.targetUserId) {
        return { success: false, error: "INVALID_ACTION" }
      }
      return await executeUserModeration(moderatorId, input as ExecuteModerationInput & { targetUserId: string })

    default:
      return { success: false, error: "INVALID_ACTION" }
  }
}


async function executeCommentModeration(
  moderatorId: string,
  input: ExecuteModerationInput & { commentId: string }
): Promise<ExecuteModerationResult> {
  const [comment] = await db.select()
    .from(comments)
    .where(eq(comments.id, input.commentId))

  if (!comment || comment.discussionId !== input.discussionId) {
    return { success: false, error: "COMMENT_NOT_FOUND" }
  }

  let updateData: Record<string, unknown> = {}

  switch (input.action) {
    case "HIDE_COMMENT":
      if (comment.status === "HIDDEN") {
        return { success: false, error: "ALREADY_IN_STATE" }
      }
      updateData = { status: "HIDDEN" }
      break

    case "UNHIDE_COMMENT":
      if (comment.status !== "HIDDEN" && comment.status !== "FLAGGED") {
        return { success: false, error: "ALREADY_IN_STATE" }
      }
      updateData = { status: "VISIBLE" }
      break

    case "DELETE_COMMENT":
      if (comment.status === "DELETED") {
        return { success: false, error: "ALREADY_IN_STATE" }
      }
      updateData = {
        status: "DELETED",
        content: "[removed by moderator]",
        contentHtml: "<p>[removed by moderator]</p>"
      }
      break

    case "PIN_COMMENT":
      if (comment.isPinned) {
        return { success: false, error: "ALREADY_IN_STATE" }
      }
      updateData = { isPinned: true }
      break

    case "UNPIN_COMMENT":
      if (!comment.isPinned) {
        return { success: false, error: "ALREADY_IN_STATE" }
      }
      updateData = { isPinned: false }
      break
  }

  await db.transaction(async (tx) => {
    await tx.update(comments)
      .set(updateData)
      .where(eq(comments.id, input.commentId))

    await tx.insert(moderationLogs)
      .values({
        discussionId: input.discussionId,
        commentId: input.commentId,
        action: input.action,
        reason: input.reason ?? null,
        performedBy: moderatorId
      })
  })

  return { success: true, error: null }
}


async function executeDiscussionModeration(
  moderatorId: string,
  input: ExecuteModerationInput
): Promise<ExecuteModerationResult> {
  const [discussion] = await db.select()
    .from(discussions)
    .where(eq(discussions.id, input.discussionId))

  if (!discussion) {
    return { success: false, error: "DISCUSSION_NOT_FOUND" }
  }

  let updateData: Record<string, unknown> = {}

  switch (input.action) {
    case "LOCK_DISCUSSION":
      if (discussion.status === "LOCKED") {
        return { success: false, error: "ALREADY_IN_STATE" }
      }
      updateData = { status: "LOCKED" }
      break

    case "UNLOCK_DISCUSSION":
      if (discussion.status !== "LOCKED") {
        return { success: false, error: "ALREADY_IN_STATE" }
      }
      updateData = { status: "OPEN" }
      break
  }

  await db.transaction(async (tx) => {
    await tx.update(discussions)
      .set(updateData)
      .where(eq(discussions.id, input.discussionId))

    await tx.insert(moderationLogs)
      .values({
        discussionId: input.discussionId,
        action: input.action,
        reason: input.reason ?? null,
        performedBy: moderatorId
      })
  })

  return { success: true, error: null }
}


async function executeUserModeration(
  moderatorId: string,
  input: ExecuteModerationInput & { targetUserId: string }
): Promise<ExecuteModerationResult> {
  const [existingBan] = await db.select()
    .from(discussionBans)
    .where(and(
      eq(discussionBans.discussionId, input.discussionId),
      eq(discussionBans.userId, input.targetUserId)
    ))

  switch (input.action) {
    case "BAN_USER_FROM_DISCUSSION":
      if (existingBan && existingBan.isActive) {
        return { success: false, error: "ALREADY_IN_STATE" }
      }

      await db.transaction(async (tx) => {
        await tx.insert(discussionBans)
          .values({
            discussionId: input.discussionId,
            userId: input.targetUserId,
            reason: input.reason ?? null,
            bannedBy: moderatorId
          })
          .onConflictDoUpdate({
            target: [discussionBans.discussionId, discussionBans.userId],
            set: { isActive: true, bannedAt: new Date(), reason: input.reason ?? null }
          })

        await tx.insert(moderationLogs)
          .values({
            discussionId: input.discussionId,
            targetUserId: input.targetUserId,
            action: input.action,
            reason: input.reason ?? null,
            performedBy: moderatorId
          })
      })
      break

    case "UNBAN_USER_FROM_DISCUSSION":
      if (!existingBan || !existingBan.isActive) {
        return { success: false, error: "ALREADY_IN_STATE" }
      }

      await db.transaction(async (tx) => {
        await tx.update(discussionBans)
          .set({ isActive: false })
          .where(eq(discussionBans.id, existingBan.id))

        await tx.insert(moderationLogs)
          .values({
            discussionId: input.discussionId,
            targetUserId: input.targetUserId,
            action: input.action,
            reason: input.reason ?? null,
            performedBy: moderatorId
          })
      })
      break
  }

  return { success: true, error: null }
}


async function checkUserIsOrgAdmin(userId: string, organizationId: string | null): Promise<boolean> {
  if (!organizationId) return false
  return false
}

export {
  ModerationActionSchema,
  ModerationLogSchema,
  ExecuteModerationInputSchema,
  ExecuteModerationResultSchema,
  executeModeration
}
export type {
  ModerationAction,
  ModerationLog,
  ExecuteModerationInput,
  ExecuteModerationResult
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 10.7 SOCIAL FEATURES
# ══════════════════════════════════════════════════════════════════════════════

## 10.7.1 User Following System

```typescript
const FollowSchema = z.object({
  id: z.string().cuid(),
  followerId: z.string().cuid(),
  followingId: z.string().cuid(),
  createdAt: z.date()
})

type Follow = z.infer<typeof FollowSchema>


const FOLLOW_CONFIG = {
  MAX_FOLLOWING: 5000,
  RATE_LIMIT_PER_HOUR: 100
} as const


const FollowUserResultSchema = z.object({
  success: z.boolean(),
  isFollowing: z.boolean(),
  error: z.enum([
    "USER_NOT_FOUND",
    "CANNOT_FOLLOW_SELF",
    "ALREADY_FOLLOWING",
    "MAX_FOLLOWING_REACHED",
    "RATE_LIMITED",
    "USER_BLOCKED_YOU"
  ]).nullable()
})

type FollowUserResult = z.infer<typeof FollowUserResultSchema>


async function followUser(
  followerId: string,
  followingId: string
): Promise<FollowUserResult> {
  if (followerId === followingId) {
    return { success: false, isFollowing: false, error: "CANNOT_FOLLOW_SELF" }
  }

  const [targetUser] = await db.select()
    .from(users)
    .where(eq(users.id, followingId))

  if (!targetUser) {
    return { success: false, isFollowing: false, error: "USER_NOT_FOUND" }
  }

  const [existingFollow] = await db.select()
    .from(follows)
    .where(and(
      eq(follows.followerId, followerId),
      eq(follows.followingId, followingId)
    ))

  if (existingFollow) {
    return { success: false, isFollowing: true, error: "ALREADY_FOLLOWING" }
  }

  const [{ count: followingCount }] = await db.select({ count: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.followerId, followerId))

  if (followingCount >= FOLLOW_CONFIG.MAX_FOLLOWING) {
    return { success: false, isFollowing: false, error: "MAX_FOLLOWING_REACHED" }
  }

  const [isBlocked] = await db.select()
    .from(userBlocks)
    .where(and(
      eq(userBlocks.blockerId, followingId),
      eq(userBlocks.blockedId, followerId)
    ))

  if (isBlocked) {
    return { success: false, isFollowing: false, error: "USER_BLOCKED_YOU" }
  }

  await db.transaction(async (tx) => {
    await tx.insert(follows)
      .values({ followerId, followingId })

    await tx.update(users)
      .set({ followingCount: sql`${users.followingCount} + 1` })
      .where(eq(users.id, followerId))

    await tx.update(users)
      .set({ followerCount: sql`${users.followerCount} + 1` })
      .where(eq(users.id, followingId))
  })

  await createFollowNotification(followerId, followingId)

  return { success: true, isFollowing: true, error: null }
}


async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; isFollowing: boolean }> {
  const [existingFollow] = await db.select()
    .from(follows)
    .where(and(
      eq(follows.followerId, followerId),
      eq(follows.followingId, followingId)
    ))

  if (!existingFollow) {
    return { success: true, isFollowing: false }
  }

  await db.transaction(async (tx) => {
    await tx.delete(follows)
      .where(eq(follows.id, existingFollow.id))

    await tx.update(users)
      .set({ followingCount: sql`${users.followingCount} - 1` })
      .where(eq(users.id, followerId))

    await tx.update(users)
      .set({ followerCount: sql`${users.followerCount} - 1` })
      .where(eq(users.id, followingId))
  })

  return { success: true, isFollowing: false }
}


async function createFollowNotification(followerId: string, followingId: string): Promise<void> {
}

export {
  FollowSchema,
  FOLLOW_CONFIG,
  FollowUserResultSchema,
  followUser,
  unfollowUser
}
export type {
  Follow,
  FollowUserResult
}
```


## 10.7.2 User Blocking

```typescript
const UserBlockSchema = z.object({
  id: z.string().cuid(),
  blockerId: z.string().cuid(),
  blockedId: z.string().cuid(),
  reason: z.string().max(500).nullable(),
  createdAt: z.date()
})

type UserBlock = z.infer<typeof UserBlockSchema>


async function blockUser(
  blockerId: string,
  blockedId: string,
  reason?: string
): Promise<{ success: boolean; error: string | null }> {
  if (blockerId === blockedId) {
    return { success: false, error: "CANNOT_BLOCK_SELF" }
  }

  const [existingBlock] = await db.select()
    .from(userBlocks)
    .where(and(
      eq(userBlocks.blockerId, blockerId),
      eq(userBlocks.blockedId, blockedId)
    ))

  if (existingBlock) {
    return { success: false, error: "ALREADY_BLOCKED" }
  }

  await db.transaction(async (tx) => {
    await tx.insert(userBlocks)
      .values({
        blockerId,
        blockedId,
        reason: reason ?? null
      })

    await tx.delete(follows)
      .where(or(
        and(eq(follows.followerId, blockerId), eq(follows.followingId, blockedId)),
        and(eq(follows.followerId, blockedId), eq(follows.followingId, blockerId))
      ))
  })

  return { success: true, error: null }
}


async function unblockUser(
  blockerId: string,
  blockedId: string
): Promise<{ success: boolean }> {
  await db.delete(userBlocks)
    .where(and(
      eq(userBlocks.blockerId, blockerId),
      eq(userBlocks.blockedId, blockedId)
    ))

  return { success: true }
}

export {
  UserBlockSchema,
  blockUser,
  unblockUser
}
export type {
  UserBlock
}
```


## 10.7.3 Content Sharing

```typescript
const ShareTargetSchema = z.enum([
  "TWITTER",
  "FACEBOOK",
  "LINKEDIN",
  "WHATSAPP",
  "TELEGRAM",
  "COPY_LINK",
  "NATIVE_SHARE"
])

const ShareEventSchema = z.object({
  id: z.string().cuid(),
  contentId: z.string().cuid(),
  contentType: z.enum(["POLL", "SURVEY", "TEST"]),
  userId: z.string().cuid().nullable(),
  target: ShareTargetSchema,
  referralCode: z.string().length(8).nullable(),
  createdAt: z.date()
})

type ShareTarget = z.infer<typeof ShareTargetSchema>
type ShareEvent = z.infer<typeof ShareEventSchema>


const SHARE_URL_TEMPLATES: Record<ShareTarget, string | null> = {
  TWITTER: "https://twitter.com/intent/tweet?text={text}&url={url}",
  FACEBOOK: "https://www.facebook.com/sharer/sharer.php?u={url}",
  LINKEDIN: "https://www.linkedin.com/sharing/share-offsite/?url={url}",
  WHATSAPP: "https://wa.me/?text={text}%20{url}",
  TELEGRAM: "https://t.me/share/url?url={url}&text={text}",
  COPY_LINK: null,
  NATIVE_SHARE: null
}


function generateShareUrl(
  contentUrl: string,
  target: ShareTarget,
  shareText: string
): string | null {
  const template = SHARE_URL_TEMPLATES[target]
  if (!template) return null

  return template
    .replace("{url}", encodeURIComponent(contentUrl))
    .replace("{text}", encodeURIComponent(shareText))
}


async function trackShare(
  contentId: string,
  contentType: "POLL" | "SURVEY" | "TEST",
  target: ShareTarget,
  userId: string | null,
  referralCode: string | null
): Promise<void> {
  await db.insert(shareEvents)
    .values({
      contentId,
      contentType,
      userId,
      target,
      referralCode
    })

  await db.insert(contentStats)
    .values({
      contentId,
      contentType,
      shareCount: 1
    })
    .onConflictDoUpdate({
      target: contentStats.contentId,
      set: {
        shareCount: sql`${contentStats.shareCount} + 1`
      }
    })
}

export {
  ShareTargetSchema,
  ShareEventSchema,
  SHARE_URL_TEMPLATES,
  generateShareUrl,
  trackShare
}
export type {
  ShareTarget,
  ShareEvent
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 10.8 DISCUSSION DATA MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 10.8.1 Drizzle Discussion Models

```typescript
// Drizzle schema
model Discussion {
  id                    String              @id @default(cuid())
  contentId             String              @unique
  contentType           ContentType

  status                DiscussionStatus    @default(CLOSED)

  settings              Json                @default("{}")

  commentCount          Int                 @default(0)
  participantCount      Int                 @default(0)

  lastActivityAt        DateTime?

  openedAt              DateTime?
  lockedAt              DateTime?
  archivedAt            DateTime?

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  comments              Comment[]
  accessRequests        DiscussionAccessRequest[]
  bans                  DiscussionBan[]
  moderationLogs        ModerationLog[]

  @@index([contentId])
  @@index([status])
  @@index([lastActivityAt])
}


model Comment {
  id                    String              @id @default(cuid())
  discussionId          String
  authorId              String

  parentId              String?
  depth                 Int                 @default(0) @db.SmallInt

  content               String              @db.Text
  contentHtml           String              @db.Text

  mediaUrls             String[]

  upvotes               Int                 @default(0)
  downvotes             Int                 @default(0)
  wilsonScore           Float               @default(0)

  replyCount            Int                 @default(0)

  status                CommentStatus       @default(VISIBLE)

  isEdited              Boolean             @default(false)
  editedAt              DateTime?

  isPinned              Boolean             @default(false)
  isCreatorComment      Boolean             @default(false)

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  discussion            Discussion          @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  author                User                @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent                Comment?            @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies               Comment[]           @relation("CommentReplies")
  votes                 CommentVote[]
  reports               CommentReport[]

  @@index([discussionId, parentId])
  @@index([discussionId, wilsonScore])
  @@index([discussionId, createdAt])
  @@index([authorId])
  @@index([status])
}


model CommentVote {
  id                    String              @id @default(cuid())
  commentId             String
  userId                String
  voteType              VoteType
  createdAt             DateTime            @default(now())

  comment               Comment             @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([commentId, userId])
  @@index([commentId])
  @@index([userId])
}


model CommentReport {
  id                    String              @id @default(cuid())
  commentId             String
  reporterId            String

  reason                ReportReason
  details               String?             @db.Text

  status                ReportStatus        @default(PENDING)

  reviewedBy            String?
  reviewedAt            DateTime?
  reviewNote            String?             @db.VarChar(500)
  actionTaken           String?             @db.VarChar(50)

  createdAt             DateTime            @default(now())

  comment               Comment             @relation(fields: [commentId], references: [id], onDelete: Cascade)
  reporter              User                @relation("ReportsMade", fields: [reporterId], references: [id], onDelete: Cascade)
  reviewer              User?               @relation("ReportsReviewed", fields: [reviewedBy], references: [id], onDelete: SetNull)

  @@index([commentId])
  @@index([reporterId])
  @@index([status])
}


model DiscussionAccessRequest {
  id                    String              @id @default(cuid())
  discussionId          String
  userId                String

  reason                String              @db.Text

  status                AccessRequestStatus @default(PENDING)

  reviewedBy            String?
  reviewedAt            DateTime?
  reviewNote            String?             @db.VarChar(500)

  expiresAt             DateTime

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  discussion            Discussion          @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  user                  User                @relation("AccessRequestsMade", fields: [userId], references: [id], onDelete: Cascade)
  reviewer              User?               @relation("AccessRequestsReviewed", fields: [reviewedBy], references: [id], onDelete: SetNull)

  @@unique([discussionId, userId])
  @@index([discussionId])
  @@index([userId])
  @@index([status])
  @@index([expiresAt])
}


model DiscussionBan {
  id                    String              @id @default(cuid())
  discussionId          String
  userId                String

  reason                String?             @db.Text
  bannedBy              String

  isActive              Boolean             @default(true)
  bannedAt              DateTime            @default(now())
  unbannedAt            DateTime?

  discussion            Discussion          @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  user                  User                @relation("DiscussionBansReceived", fields: [userId], references: [id], onDelete: Cascade)
  banner                User                @relation("DiscussionBansGiven", fields: [bannedBy], references: [id], onDelete: Cascade)

  @@unique([discussionId, userId])
  @@index([discussionId])
  @@index([userId])
  @@index([isActive])
}


model ModerationLog {
  id                    String              @id @default(cuid())
  discussionId          String
  commentId             String?
  targetUserId          String?

  action                String              @db.VarChar(50)
  reason                String?             @db.VarChar(500)

  performedBy           String
  performedAt           DateTime            @default(now())

  discussion            Discussion          @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  moderator             User                @relation(fields: [performedBy], references: [id], onDelete: Cascade)

  @@index([discussionId])
  @@index([performedBy])
  @@index([performedAt])
}


model Follow {
  id                    String              @id @default(cuid())
  followerId            String
  followingId           String
  createdAt             DateTime            @default(now())

  follower              User                @relation("Following", fields: [followerId], references: [id], onDelete: Cascade)
  following             User                @relation("Followers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}


model UserBlock {
  id                    String              @id @default(cuid())
  blockerId             String
  blockedId             String
  reason                String?             @db.VarChar(500)
  createdAt             DateTime            @default(now())

  blocker               User                @relation("BlocksGiven", fields: [blockerId], references: [id], onDelete: Cascade)
  blocked               User                @relation("BlocksReceived", fields: [blockedId], references: [id], onDelete: Cascade)

  @@unique([blockerId, blockedId])
  @@index([blockerId])
  @@index([blockedId])
}


model ShareEvent {
  id                    String              @id @default(cuid())
  contentId             String
  contentType           ContentType
  userId                String?
  target                String              @db.VarChar(20)
  referralCode          String?             @db.VarChar(8)
  createdAt             DateTime            @default(now())

  @@index([contentId])
  @@index([userId])
  @@index([createdAt])
}


enum DiscussionStatus {
  CLOSED
  OPEN
  LOCKED
  ARCHIVED
}

enum CommentStatus {
  VISIBLE
  HIDDEN
  DELETED
  FLAGGED
  PENDING_REVIEW
}

enum VoteType {
  UP
  DOWN
}

enum ReportReason {
  SPAM
  HARASSMENT
  HATE_SPEECH
  MISINFORMATION
  INAPPROPRIATE_CONTENT
  OFF_TOPIC
  PERSONAL_ATTACK
  DOXXING
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWING
  RESOLVED_VALID
  RESOLVED_INVALID
  DISMISSED
}

enum AccessRequestStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
  WITHDRAWN
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 10.9 PERFORMANCE OPTIMIZATION
# ══════════════════════════════════════════════════════════════════════════════

## 10.9.1 Comment Tree Optimization

```typescript
const COMMENT_CACHE_CONFIG = {
  ROOT_COMMENTS_TTL_SECONDS: 60,
  COMMENT_TREE_TTL_SECONDS: 30,
  VOTE_COUNT_TTL_SECONDS: 10,
  USER_VOTE_TTL_SECONDS: 300,
  MAX_CACHED_DISCUSSIONS: 1000
} as const


const COMMENT_INDEX_DEFINITIONS = {
  DISCUSSION_PARENT_SCORE: {
    table: "Comment",
    columns: ["discussionId", "parentId", "wilsonScore"],
    type: "BTREE"
  },

  DISCUSSION_PARENT_CREATED: {
    table: "Comment",
    columns: ["discussionId", "parentId", "createdAt"],
    type: "BTREE"
  },

  DISCUSSION_STATUS: {
    table: "Comment",
    columns: ["discussionId", "status"],
    type: "BTREE"
  },

  AUTHOR_CREATED: {
    table: "Comment",
    columns: ["authorId", "createdAt"],
    type: "BTREE"
  },

  VOTE_COMPOSITE: {
    table: "CommentVote",
    columns: ["commentId", "userId"],
    type: "BTREE",
    unique: true
  }
} as const


async function preloadCommentTree(
  discussionId: string,
  maxDepth: number = 2
): Promise<void> {
  const cacheKey = `discussion:${discussionId}:tree:${maxDepth}`

  const rootComments = await db.select()
    .from(comments)
    .where(and(
      eq(comments.discussionId, discussionId),
      isNull(comments.parentId),
      inArray(comments.status, ["VISIBLE", "FLAGGED"])
    ))
    .orderBy(desc(comments.isPinned), desc(comments.wilsonScore))
    .limit(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)

  const commentIds = rootComments.map(c => c.id)

  if (maxDepth > 0) {
    const level1Replies = await db.select()
      .from(comments)
      .where(and(
        inArray(comments.parentId, commentIds),
        inArray(comments.status, ["VISIBLE", "FLAGGED"])
      ))
      .orderBy(desc(comments.wilsonScore))

    if (maxDepth > 1) {
      const level1Ids = level1Replies.map(c => c.id)
      await db.select()
        .from(comments)
        .where(and(
          inArray(comments.parentId, level1Ids),
          inArray(comments.status, ["VISIBLE", "FLAGGED"])
        ))
        .orderBy(desc(comments.wilsonScore))
    }
  }
}

export {
  COMMENT_CACHE_CONFIG,
  COMMENT_INDEX_DEFINITIONS,
  preloadCommentTree
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 10.9 COMMENTS REAL-TIME ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 10.9.1 Real-time Update Strategy

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// COMMENTS REAL-TIME ARCHITECTURE
// Uses Server-Sent Events (SSE) for uni-directional updates
// WebSocket reserved for Live Poll bidirectional communication
// ═══════════════════════════════════════════════════════════════════════════════

const COMMENTS_REALTIME_CONFIG = {
  // Strategy selection based on use case
  STRATEGIES: {
    COMMENTS_UPDATES: 'SSE',     // Comments - one-way server→client
    PULSE_UPDATES: 'SSE',        // Results updates - one-way
    LIVE_POLL: 'WebSocket',      // Voting - bidirectional real-time
    NOTIFICATIONS: 'SSE'         // Push notifications - one-way
  },

  SSE: {
    RECONNECT_DELAY_MS: 3000,
    MAX_RECONNECT_ATTEMPTS: 10,
    HEARTBEAT_INTERVAL_MS: 30000,
    CONNECTION_TIMEOUT_MS: 60000
  },

  WEBSOCKET: {
    PING_INTERVAL_MS: 25000,
    PONG_TIMEOUT_MS: 10000,
    MAX_MESSAGE_SIZE_BYTES: 65536,
    MAX_CONNECTIONS_PER_USER: 5
  },

  CHANNELS: {
    COMMENTS: 'comments:{contentId}',
    PULSE_RESULTS: 'pulse:{contentId}:results',
    LIVE_POLL_VOTES: 'live:{pollId}:votes',
    USER_NOTIFICATIONS: 'user:{userId}:notifications'
  }
} as const

// SSE Event Types for COMMENTS
interface CommentsSSEEvent {
  type: 'NEW_COMMENT' | 'COMMENT_UPDATED' | 'COMMENT_DELETED' |
        'VOTE_CHANGED' | 'RESULTS_UPDATED' | 'MILESTONE_REACHED'
  contentId: string
  payload: unknown
  timestamp: number
}

// Server-side SSE handler
function createCommentsSSEHandler(contentId: string) {
  return async function* generateEvents(): AsyncGenerator<CommentsSSEEvent> {
    const subscriber = await redis.subscribe(`comments:${contentId}:*`)

    try {
      for await (const message of subscriber) {
        yield JSON.parse(message) as CommentsSSEEvent
      }
    } finally {
      await subscriber.unsubscribe()
    }
  }
}

// Client-side connection manager
class CommentsRealtimeClient {
  private eventSource: EventSource | null = null
  private reconnectAttempts = 0

  connect(contentId: string, onEvent: (event: CommentsSSEEvent) => void) {
    const url = `/api/comments/${contentId}/stream`
    this.eventSource = new EventSource(url)

    this.eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data) as CommentsSSEEvent
      onEvent(event)
    }

    this.eventSource.onerror = () => {
      if (this.reconnectAttempts < COMMENTS_REALTIME_CONFIG.SSE.MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts++
        setTimeout(() => this.connect(contentId, onEvent),
          COMMENTS_REALTIME_CONFIG.SSE.RECONNECT_DELAY_MS)
      }
    }
  }

  disconnect() {
    this.eventSource?.close()
    this.eventSource = null
  }
}

export { COMMENTS_REALTIME_CONFIG, CommentsRealtimeClient, createCommentsSSEHandler }
export type { CommentsSSEEvent }
```

## 10.9.2 Comment Threading Data Model

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// COMMENT THREADING MODEL
// Materialized path pattern for efficient tree operations
// ═══════════════════════════════════════════════════════════════════════════════

interface CommentThread {
  id: string
  contentId: string
  contentType: 'POLL' | 'SURVEY' | 'TEST'

  // Author info
  authorId: string | null           // null for anonymous
  authorHash: string                // Consistent per-content identifier
  authorDisplayName: string
  authorAvatarUrl: string | null
  authorVerificationLevel: 0 | 1 | 2 | 3 | 4
  isCreator: boolean                // Content creator flag

  // Threading
  parentId: string | null           // null for root comments
  rootId: string                    // Always points to top-level comment
  path: string                      // Materialized path: "rootId/parentId/id"
  depth: number                     // 0, 1, 2 (max 3 levels)
  replyCount: number                // Direct replies only
  totalDescendants: number          // All nested replies

  // Content
  body: string                      // Markdown content
  bodyHtml: string                  // Sanitized HTML
  mediaUrls: string[]               // Images/GIFs (max 4)
  mentions: string[]                // @username mentions

  // Engagement
  upvotes: number
  downvotes: number
  score: number                     // upvotes - downvotes
  wilsonScore: number               // For ranking
  hotScore: number                  // For "Hot" sort

  // Status
  status: 'VISIBLE' | 'HIDDEN' | 'DELETED' | 'FLAGGED'
  editedAt: Date | null
  deletedAt: Date | null

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// Efficient tree retrieval using materialized path
const THREAD_QUERIES = {
  // Get all comments in a thread (single query)
  getThread: (rootId: string) => `
    SELECT * FROM comments
    WHERE path LIKE '${rootId}%'
    ORDER BY path ASC
  `,

  // Get direct replies only
  getDirectReplies: (parentId: string) => `
    SELECT * FROM comments
    WHERE parentId = '${parentId}'
    ORDER BY wilsonScore DESC
  `,

  // Count descendants efficiently
  countDescendants: (commentId: string) => `
    SELECT COUNT(*) FROM comments
    WHERE path LIKE '%${commentId}%' AND id != '${commentId}'
  `
}

// Build thread tree from flat array
function buildCommentTree(comments: CommentThread[]): CommentTreeNode[] {
  const map = new Map<string, CommentTreeNode>()
  const roots: CommentTreeNode[] = []

  // First pass: create nodes
  for (const comment of comments) {
    map.set(comment.id, { ...comment, children: [] })
  }

  // Second pass: link children to parents
  for (const comment of comments) {
    const node = map.get(comment.id)!
    if (comment.parentId) {
      const parent = map.get(comment.parentId)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  return roots
}

interface CommentTreeNode extends CommentThread {
  children: CommentTreeNode[]
}

export type { CommentThread, CommentTreeNode }
export { THREAD_QUERIES, buildCommentTree }
```


# ══════════════════════════════════════════════════════════════════════════════
# 10.10 COMMENTS MODERATION SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 10.10.1 Moderation Queue Workflow

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// MODERATION QUEUE SYSTEM
// Combines automated detection with creator/admin review
// ═══════════════════════════════════════════════════════════════════════════════

interface ModerationQueueItem {
  id: string
  commentId: string
  contentId: string

  // Detection
  detectionSource: 'AUTO' | 'USER_REPORT' | 'CREATOR_FLAG'
  detectionReason: ModerationReason
  confidenceScore: number         // 0-100 for auto-detection

  // Reporter info (for user reports)
  reporterId: string | null
  reportReason: string | null

  // Review
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'
  reviewerId: string | null
  reviewedAt: Date | null
  reviewNote: string | null

  // Action taken
  action: 'NONE' | 'HIDE' | 'DELETE' | 'WARN_USER' | 'BAN_USER' | null

  createdAt: Date
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

type ModerationReason =
  | 'SPAM'
  | 'PROFANITY'
  | 'HATE_SPEECH'
  | 'HARASSMENT'
  | 'PII_DETECTED'
  | 'MISINFORMATION'
  | 'OFF_TOPIC'
  | 'REPEATED_CONTENT'
  | 'SUSPICIOUS_PATTERN'

const MODERATION_CONFIG = {
  // Auto-moderation thresholds
  AUTO_HIDE_CONFIDENCE: 90,      // Auto-hide if confidence >= 90%
  AUTO_QUEUE_CONFIDENCE: 60,     // Add to queue if confidence >= 60%
  AUTO_PASS_CONFIDENCE: 30,      // Auto-approve if confidence < 30%

  // Priority assignment
  PRIORITY_RULES: {
    CRITICAL: ['HATE_SPEECH', 'PII_DETECTED'],
    HIGH: ['HARASSMENT', 'MISINFORMATION'],
    MEDIUM: ['PROFANITY', 'SPAM'],
    LOW: ['OFF_TOPIC', 'REPEATED_CONTENT']
  },

  // Review SLAs
  SLA_HOURS: {
    CRITICAL: 1,
    HIGH: 4,
    MEDIUM: 24,
    LOW: 72
  },

  // Creator moderation powers
  CREATOR_CAN: {
    HIDE_COMMENT: true,
    DELETE_COMMENT: true,
    PIN_COMMENT: true,
    LOCK_THREAD: true,
    BAN_FROM_CONTENT: true,
    BAN_FROM_ALL: false          // Requires admin
  }
} as const

// Moderation workflow state machine
const MODERATION_WORKFLOW = {
  COMMENT_CREATED: async (comment: CommentThread) => {
    // Step 1: Auto-detection
    const detection = await checkContentForViolations(comment.body)

    if (detection.score >= MODERATION_CONFIG.AUTO_HIDE_CONFIDENCE) {
      // Auto-hide and queue for review
      await hideComment(comment.id, 'AUTO_MODERATION')
      await createQueueItem(comment.id, detection, 'HIGH')
    } else if (detection.score >= MODERATION_CONFIG.AUTO_QUEUE_CONFIDENCE) {
      // Keep visible but queue for review
      await createQueueItem(comment.id, detection, 'MEDIUM')
    }
    // Below threshold: auto-approved, no queue entry
  },

  USER_REPORTED: async (commentId: string, reporterId: string, reason: string) => {
    const existing = await getModerationItem(commentId)
    if (existing) {
      await escalateItem(existing.id, reporterId, reason)
    } else {
      await createQueueItem(commentId, { reason, source: 'USER_REPORT' }, 'MEDIUM')
    }
  },

  CREATOR_FLAGGED: async (commentId: string, creatorId: string) => {
    // Creator flags bypass queue, immediate action
    await hideComment(commentId, 'CREATOR_FLAG')
    await createQueueItem(commentId, { source: 'CREATOR_FLAG' }, 'LOW')
  }
}

export { MODERATION_CONFIG, MODERATION_WORKFLOW }
export type { ModerationQueueItem, ModerationReason }
```


## 10.10.2 User Ban Notification Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     USER BAN NOTIFICATION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  BAN TYPES                                                                      │
│  ─────────                                                                      │
│                                                                                 │
│  1. CONTENT BAN (İçerik Yasakı)                                                 │
│     - Banned from specific content's COMMENTS                                   │
│     - Issued by content creator                                                 │
│     - Duration: Permanent for that content                                      │
│                                                                                 │
│  2. TEMPORARY BAN (Geçici Yasak)                                                │
│     - Banned from all COMMENTS for X days                                       │
│     - Issued by Platform Moderator                                              │
│     - Duration: 1, 3, 7, 14, or 30 days                                         │
│                                                                                 │
│  3. PERMANENT BAN (Kalıcı Yasak)                                                │
│     - Banned from all COMMENTS indefinitely                                     │
│     - Issued by Platform Admin                                                  │
│     - Can appeal after 90 days                                                  │
│                                                                                 │
│  4. ACCOUNT SUSPENSION (Hesap Askıya Alma)                                      │
│     - Full account suspended                                                    │
│     - Cannot login, all activity stopped                                        │
│     - Issued by Platform Admin for severe violations                            │
│                                                                                 │
│  BAN NOTIFICATION EMAIL                                                         │
│  ──────────────────────                                                         │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  From: noreply@voxpoll.com                                                │ │
│  │  Subject: VoxPoll Hesabınız Hakkında Önemli Bilgi                         │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Merhaba @ahmet_yilmaz,                                                   │ │
│  │                                                                           │ │
│  │  Hesabınızda topluluk kurallarımızı ihlal eden bir aktivite tespit        │ │
│  │  edildi ve aşağıdaki işlem uygulandı:                                     │ │
│  │                                                                           │ │
│  │  İŞLEM: Geçici COMMENTS Yasağı (7 gün)                                    │ │
│  │  BAŞLANGIÇ: 22 Ocak 2026, 14:30                                           │ │
│  │  BİTİŞ: 29 Ocak 2026, 14:30                                               │ │
│  │                                                                           │ │
│  │  İHLAL TÜRÜ: Taciz içerikli yorum                                         │ │
│  │                                                                           │ │
│  │  İhlal eden içerik:                                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  "Sen gerçekten aptal mısın? Bu kadar basit bir şeyi..."           │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  Bu süre içinde:                                                          │ │
│  │  ✗ Yorum yazamazsınız                                                     │ │
│  │  ✗ Yorumlara yanıt veremezsiniz                                           │ │
│  │  ✗ Oylama yapamazsınız                                                    │ │
│  │  ✓ İçeriklere katılabilirsiniz                                            │ │
│  │  ✓ Mesaj okuyabilirsiniz                                                  │ │
│  │                                                                           │ │
│  │  Bu kararın hatalı olduğunu düşünüyorsanız itiraz edebilirsiniz.          │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    İtiraz Et                                       │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  Topluluk kurallarımız: voxpoll.com/community-guidelines                  │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  IN-APP BAN NOTIFICATION                                                        │
│  ───────────────────────                                                        │
│                                                                                 │
│  When banned user tries to comment:                                             │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ⚠️ Yorum Yazamazsınız                                                    │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Topluluk kuralları ihlali nedeniyle COMMENTS erişiminiz                  │ │
│  │  geçici olarak kısıtlandı.                                                │ │
│  │                                                                           │ │
│  │  Yasak bitiş tarihi: 29 Ocak 2026, 14:30                                  │ │
│  │  Kalan süre: 5 gün 12 saat                                                │ │
│  │                                                                           │ │
│  │  [Detayları Gör]  [İtiraz Et]                                             │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.10.3 Appeal Flow (User Side)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     APPEAL FLOW (USER SIDE)                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STEP 1: Start Appeal                                                           │
│  ────────────────────                                                           │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  İtiraz Formu                                                             │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  İşlem: Geçici COMMENTS Yasağı (7 gün)                                    │ │
│  │  Neden: Taciz içerikli yorum                                              │ │
│  │                                                                           │ │
│  │  İhlal eden içerik:                                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  "Sen gerçekten aptal mısın? Bu kadar basit bir şeyi..."           │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  İtiraz nedeniniz:                                                        │ │
│  │  ○ İçerik yanlış değerlendirildi                                          │ │
│  │  ○ Bağlam dikkate alınmadı                                                │ │
│  │  ○ Teknik bir hata oldu                                                   │ │
│  │  ○ Diğer                                                                  │ │
│  │                                                                           │ │
│  │  Açıklama (zorunlu):                                                      │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ Bu yorum, arkadaşımla aramızdaki şakalaşmanın bir parçasıydı.      │   │ │
│  │  │ Bağlam dikkate alınmadan değerlendirilmiş. @user123 ile            │   │ │
│  │  │ uzun süredir arkadaşız ve birbirimize bu şekilde takılırız.        │   │ │
│  │  │                                                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │  50/1000 karakter                                                         │ │
│  │                                                                           │ │
│  │  Destekleyici kanıt (opsiyonel):                                          │ │
│  │  [📎 Ekran görüntüsü ekle]                                                │ │
│  │                                                                           │ │
│  │  ⚠️ İtirazlar genellikle 24-72 saat içinde değerlendirilir.               │ │
│  │  ⚠️ Asılsız itirazlar yasak süresini uzatabilir.                          │ │
│  │                                                                           │ │
│  │  ☑️ İtiraz sürecini ve kuralları anladığımı onaylıyorum                   │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    İtirazı Gönder                                  │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  STEP 2: Appeal Submitted                                                       │
│  ────────────────────────                                                       │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ✅ İtirazınız Alındı                                                     │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  İtiraz numarası: #APL-2026-001234                                        │ │
│  │                                                                           │ │
│  │  İtirazınız inceleme kuyruğuna alındı.                                    │ │
│  │  Sonuç 24-72 saat içinde e-posta ile bildirilecek.                        │ │
│  │                                                                           │ │
│  │  Bu süre içinde:                                                          │ │
│  │  • Yasağınız aktif kalmaya devam eder                                     │ │
│  │  • İtiraz durumunu Ayarlar > Hesap > İtirazlar'dan takip edebilirsiniz    │ │
│  │                                                                           │ │
│  │  [İtirazları Görüntüle]  [Ana Sayfaya Dön]                                │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  APPEAL STATUS PAGE (/settings/appeals)                                         │
│  ──────────────────────────────────────                                         │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  İtirazlarım                                                              │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  #APL-2026-001234                                    ⏳ İnceleniyor │  │ │
│  │  │  Geçici COMMENTS Yasağı · 7 gün                                     │  │ │
│  │  │  İtiraz tarihi: 22 Ocak 2026                                        │  │ │
│  │  │  Tahmini sonuç: 25 Ocak 2026                                        │  │ │
│  │  │                                                                     │  │ │
│  │  │  [Detayları Gör]                                                    │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  #APL-2025-009876                                    ✅ Kabul Edildi│  │ │
│  │  │  İçerik Yasağı · @user_poll_123                                     │  │ │
│  │  │  İtiraz tarihi: 15 Aralık 2025                                      │  │ │
│  │  │  Sonuç tarihi: 17 Aralık 2025                                       │  │ │
│  │  │                                                                     │  │ │
│  │  │  [Detayları Gör]                                                    │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  APPEAL OUTCOMES                                                                │
│  ───────────────                                                                │
│                                                                                 │
│  1. APPROVED (İtiraz Kabul Edildi):                                             │
│     • Ban lifted immediately                                                    │
│     • Email: "İtirazınız kabul edildi, yasağınız kaldırıldı"                    │
│     • Strike removed from record                                                │
│                                                                                 │
│  2. PARTIALLY_APPROVED (Kısmen Kabul):                                          │
│     • Ban duration reduced                                                      │
│     • Email: "İtirazınız kısmen kabul edildi, yasak süresi 3 güne indirildi"    │
│     • Strike remains but noted as "appealed"                                    │
│                                                                                 │
│  3. REJECTED (İtiraz Reddedildi):                                               │
│     • Ban continues as-is                                                       │
│     • Email: "İtirazınız değerlendirildi, karar onaylandı"                      │
│     • No further appeals for this incident                                      │
│                                                                                 │
│  4. REJECTED_WITH_EXTENSION (Reddedildi + Uzatma):                              │
│     • Ban extended for frivolous appeal                                         │
│     • Email: "Asılsız itiraz nedeniyle yasak süresi uzatıldı"                   │
│     • Only for repeat offenders with clearly false appeals                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.10.4 Moderator Dashboard UI

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     MODERATOR DASHBOARD (/admin/moderation)                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Moderasyon Paneli                                                        │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  [Kuyruk (47)] [İtirazlar (12)] [Aksiyonlar] [İstatistikler]              │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  KUYRUK ÖNCELİKLERİ                                                       │ │
│  │  ┌───────────────────────────────────────────────────────────────────┐    │ │
│  │  │ 🔴 KRİTİK (3)  │ 🟠 YÜKSEK (8)  │ 🟡 ORTA (21)  │ 🟢 DÜŞÜK (15) │    │ │
│  │  └───────────────────────────────────────────────────────────────────┘    │ │
│  │                                                                           │ │
│  │  Filtreler: [Tüm Kaynaklar ▼] [Tüm Nedenler ▼] [Tarih ▼]                  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ 🔴 HATE_SPEECH · Auto-detected (95%)                      3 dk önce│  │ │
│  │  │ @toxic_user123 · "Türkiye'de en popüler kahvaltılık" yorumu        │  │ │
│  │  │                                                                     │  │ │
│  │  │ "Bu ülkedeki [sansürlü] insanlar gerçekten [sansürlü]..."          │  │ │
│  │  │                                                                     │  │ │
│  │  │ [Onayla] [Sil] [Kullanıcıyı Uyar] [Yasakla] [Eskalasyon]           │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ 🟠 HARASSMENT · User Report (3 reports)                   15 dk önce│  │ │
│  │  │ @angry_user · "Favori çay markanız" yorumu                         │  │ │
│  │  │ Raporlayanlar: @user1, @user2, @user3                              │  │ │
│  │  │                                                                     │  │ │
│  │  │ "Sen gerçekten aptal mısın? Bu kadar basit..."                     │  │ │
│  │  │                                                                     │  │ │
│  │  │ [Onayla] [Sil] [Kullanıcıyı Uyar] [Yasakla] [Eskalasyon]           │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ 🟡 SPAM · Auto-detected (72%)                              1 s önce│  │ │
│  │  │ @new_account · "Kripto yatırımı anketi" yorumu                     │  │ │
│  │  │                                                                     │  │ │
│  │  │ "BTC kazanmak için www.scam.com 🚀🚀🚀 %500 kar!!!"               │  │ │
│  │  │                                                                     │  │ │
│  │  │ [Onayla] [Sil] [Kullanıcıyı Uyar] [Yasakla] [Eskalasyon]           │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  QUICK ACTION MODAL (Yasakla)                                                   │
│  ────────────────────────────                                                   │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  Kullanıcı Yasağı                          │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  Kullanıcı: @toxic_user123                 │                                 │
│  │  Önceki yasak sayısı: 2                    │                                 │
│  │  Strike sayısı: 4/5                        │                                 │
│  │                                            │                                 │
│  │  Yasak türü:                               │                                 │
│  │  ○ Uyarı (yasak yok, strike eklenir)       │                                 │
│  │  ● Geçici yasak                            │                                 │
│  │  ○ Kalıcı yasak                            │                                 │
│  │  ○ Hesap askıya alma                       │                                 │
│  │                                            │                                 │
│  │  Süre: ┌────────────────────────┐          │                                 │
│  │        │ 7 gün               ▼  │          │                                 │
│  │        └────────────────────────┘          │                                 │
│  │                                            │                                 │
│  │  İç not (kullanıcı görmez):                │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │ 3. ihlal, nefret söylemi pattern   │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  ☑️ Kullanıcıya e-posta gönder             │                                 │
│  │  ☑️ İhlal eden yorumu sil                  │                                 │
│  │  ☐ Kullanıcının tüm yorumlarını gizle      │                                 │
│  │                                            │                                 │
│  │  ┌──────────────┐  ┌──────────────────┐    │                                 │
│  │  │    İptal     │  │    Yasağı Uygula │    │                                 │
│  │  └──────────────┘  └──────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.10.5 Escalation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     ESCALATION FLOW                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ESCALATION TRIGGERS                                                            │
│  ───────────────────                                                            │
│                                                                                 │
│  Auto-escalation to senior moderator when:                                      │
│  • User has > 3 active strikes                                                  │
│  • Content involves potential legal issues (threats, doxxing)                   │
│  • Multiple conflicting moderator decisions                                     │
│  • User is verified or high-profile (> 10K followers)                           │
│  • Content has > 100 reports                                                    │
│                                                                                 │
│  Auto-escalation to Platform Admin when:                                        │
│  • Permanent ban decision required                                              │
│  • Account suspension decision required                                         │
│  • Potential PR risk (influencer, journalist)                                   │
│  • Legal department consultation needed                                         │
│  • Appeal of senior moderator decision                                          │
│                                                                                 │
│  ESCALATION MODAL                                                               │
│  ────────────────                                                               │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Eskalasyon                                                               │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Bu vakayı üst makama ilet:                                               │ │
│  │                                                                           │ │
│  │  ○ Kıdemli Moderatör                                                      │ │
│  │    Karmaşık kararlar, yüksek strike kullanıcılar                          │ │
│  │                                                                           │ │
│  │  ○ Platform Admin                                                         │ │
│  │    Kalıcı yasak, hesap askıya alma, yasal konular                         │ │
│  │                                                                           │ │
│  │  ○ Hukuk Departmanı                                                       │ │
│  │    Tehdit, doxxing, telif hakkı ihlali                                    │ │
│  │                                                                           │ │
│  │  Eskalasyon nedeni:                                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ Kullanıcı yüksek profilli (50K+ takipçi) ve içerik potansiyel      │   │ │
│  │  │ nefret söylemi içeriyor. PR riski nedeniyle admin onayı gerekli.   │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  Önerilen aksiyon:                                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ 7 günlük geçici yasak + uyarı                                  ▼   │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    Eskalasyon Gönder                               │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ESCALATED ITEM VIEW (Admin/Senior Moderator)                                   │ │
│  ────────────────────────────────────────────                                   │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  🔺 ESKALASİYON - Bekleyen                                                │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Orijinal vaka: HATE_SPEECH · Auto-detected                               │ │
│  │  Eskalasyon tarihi: 22 Ocak 2026, 15:30                                   │ │
│  │  Eskalasyon yapan: @moderator_zeynep                                      │ │
│  │                                                                           │ │
│  │  KULLANICI PROFİLİ                                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ @influencer_user · 52,340 takipçi · ✓ Doğrulanmış                  │   │ │
│  │  │ Hesap yaşı: 2 yıl                                                  │   │ │
│  │  │ Önceki yasak: 0                                                    │   │ │
│  │  │ Strike: 0                                                          │   │ │
│  │  │ Toplam yorum: 847                                                  │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  İHLAL İÇERİĞİ                                                            │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ "Bu ülkedeki [sansürlü] insanlar gerçekten [sansürlü]..."          │   │ │
│  │  │ Tarih: 22 Ocak 2026, 14:15                                         │   │ │
│  │  │ Bağlam: Siyasi anket tartışması                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  MODERATÖR ÖNERİSİ                                                        │ │
│  │  "7 günlük geçici yasak + uyarı"                                          │ │
│  │  Gerekçe: "PR riski nedeniyle admin onayı gerekli"                        │ │
│  │                                                                           │ │
│  │  KARARINIZ                                                                │ │
│  │  ○ Öneriyi onayla (7 gün yasak)                                           │ │
│  │  ○ Daha hafif ceza (uyarı)                                                │ │
│  │  ○ Daha ağır ceza (kalıcı yasak)                                          │ │
│  │  ○ İşlem yapma (false positive)                                           │ │
│  │                                                                           │ │
│  │  Admin notu:                                                              │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                                                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  [Karar Ver]                                                              │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.10.6 Strike System & Progressive Discipline

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// STRIKE SYSTEM & PROGRESSIVE DISCIPLINE
// ══════════════════════════════════════════════════════════════════════════════

const STRIKE_SYSTEM = {
  maxStrikes: 5,

  strikeDecay: {
    enabled: true,
    decayAfterDays: 90,
    decayAmount: 1
  },

  progressiveDiscipline: {
    1: { action: "WARNING", duration: null, description: "Uyarı" },
    2: { action: "TEMP_BAN", duration: 1, description: "1 gün yasak" },
    3: { action: "TEMP_BAN", duration: 3, description: "3 gün yasak" },
    4: { action: "TEMP_BAN", duration: 7, description: "7 gün yasak" },
    5: { action: "PERM_BAN", duration: null, description: "Kalıcı yasak" }
  },

  severityMultipliers: {
    SPAM: 1,
    PROFANITY: 1,
    OFF_TOPIC: 0.5,
    HARASSMENT: 2,
    HATE_SPEECH: 3,
    PII_DETECTED: 2,
    THREATS: 5
  },

  instantBanOffenses: [
    "CREDIBLE_THREAT",
    "DOXXING",
    "CSAM",
    "ILLEGAL_CONTENT"
  ]
}

interface UserModerationRecord {
  id: string
  userId: string
  currentStrikes: number
  lifetimeStrikes: number
  lastStrikeAt: Date | null
  activeBan: {
    type: "TEMP" | "PERM" | null
    startedAt: Date | null
    endsAt: Date | null
    reason: string | null
  }
  history: ModerationHistoryItem[]
}

interface ModerationHistoryItem {
  id: string
  date: Date
  action: "WARNING" | "STRIKE" | "TEMP_BAN" | "PERM_BAN" | "APPEAL_APPROVED" | "APPEAL_REJECTED"
  reason: string
  moderatorId: string
  contentId: string | null
  strikesAdded: number
  banDuration: number | null
  appealId: string | null
  notes: string | null
}

async function applyDisciplinaryAction(
  userId: string,
  violation: ModerationReason,
  moderatorId: string,
  contentId: string
): Promise<DisciplinaryActionResult> {
  const record = await getUserModerationRecord(userId)

  if (STRIKE_SYSTEM.instantBanOffenses.includes(violation)) {
    return applyInstantBan(userId, violation, moderatorId, contentId)
  }

  const multiplier = STRIKE_SYSTEM.severityMultipliers[violation] || 1
  const strikesToAdd = Math.ceil(multiplier)
  const newStrikeCount = Math.min(record.currentStrikes + strikesToAdd, STRIKE_SYSTEM.maxStrikes)

  const discipline = STRIKE_SYSTEM.progressiveDiscipline[newStrikeCount]

  await db.$transaction([
    db.userModerationRecord.update({
      where: { userId },
      data: {
        currentStrikes: newStrikeCount,
        lifetimeStrikes: { increment: strikesToAdd },
        lastStrikeAt: new Date()
      }
    }),
    db.moderationHistory.create({
      data: {
        userId,
        action: discipline.action === "WARNING" ? "WARNING" : "STRIKE",
        reason: violation,
        moderatorId,
        contentId,
        strikesAdded: strikesToAdd,
        banDuration: discipline.duration
      }
    })
  ])

  if (discipline.action === "TEMP_BAN" || discipline.action === "PERM_BAN") {
    await applyBan(userId, discipline.action, discipline.duration, violation)
  }

  await sendDisciplinaryNotification(userId, {
    action: discipline.action,
    duration: discipline.duration,
    reason: violation,
    currentStrikes: newStrikeCount,
    maxStrikes: STRIKE_SYSTEM.maxStrikes
  })

  return {
    action: discipline.action,
    duration: discipline.duration,
    newStrikeCount,
    description: discipline.description
  }
}

interface DisciplinaryActionResult {
  action: string
  duration: number | null
  newStrikeCount: number
  description: string
}

export { STRIKE_SYSTEM, applyDisciplinaryAction }
export type { UserModerationRecord, ModerationHistoryItem, DisciplinaryActionResult }
```


# ══════════════════════════════════════════════════════════════════════════════
# 10.11 PULSE ANIMATIONS (Spotify Wrap-Style)
# ══════════════════════════════════════════════════════════════════════════════

## 10.11.1 Animation System Architecture

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// RESULT ANIMATION SYSTEM
// Spotify Wrap-style animated result presentation
// Uses Framer Motion / React Spring compatible definitions
// ═══════════════════════════════════════════════════════════════════════════════

interface AnimationSequence {
  id: string
  contentType: 'POLL' | 'TEST' | 'SURVEY'
  slides: AnimationSlide[]
  totalDuration: number
  autoPlay: boolean
  allowSkip: boolean
}

interface AnimationSlide {
  id: string
  type: SlideType
  duration: number              // milliseconds
  data: SlideData
  transitions: {
    enter: TransitionConfig
    exit: TransitionConfig
  }
}

type SlideType =
  | 'TITLE_INTRO'               // "Here are your results..."
  | 'YOUR_ANSWER'               // What user selected
  | 'AGGREGATE_REVEAL'          // Animated percentage bars
  | 'COMPARISON'                // "You vs Everyone"
  | 'DEMOGRAPHIC_BREAKDOWN'     // Age/gender splits
  | 'INTERESTING_STAT'          // "Only 12% agreed with you!"
  | 'BADGE_EARNED'              // Test badge reveal
  | 'SHARE_CARD'                // Final shareable card
  | 'COMMENTS_CTA'                 // "Join the discussion"

interface TransitionConfig {
  type: 'spring' | 'tween' | 'inertia'
  duration?: number
  delay?: number
  stiffness?: number
  damping?: number
}

// Slide data by type
interface SlideData {
  // TITLE_INTRO
  title?: string
  subtitle?: string

  // YOUR_ANSWER
  questionText?: string
  selectedOption?: string
  isCorrect?: boolean          // For tests

  // AGGREGATE_REVEAL
  options?: Array<{
    text: string
    percentage: number
    voteCount: number
    isUserChoice: boolean
    color: string
  }>

  // COMPARISON
  userPercentile?: number      // "You're in the top 15%"
  comparisonText?: string

  // DEMOGRAPHIC_BREAKDOWN
  demographic?: 'age' | 'gender' | 'country'
  segments?: Array<{
    label: string
    userChoice: number
    avgChoice: number
  }>

  // BADGE_EARNED
  badge?: {
    id: string
    name: string
    description: string
    imageUrl: string
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  }

  // SHARE_CARD
  shareCard?: ShareCardData
}

// Generate animation sequence based on content type and results
function generateAnimationSequence(
  content: ContentWithResults,
  userResponse: UserResponse | null
): AnimationSequence {
  const slides: AnimationSlide[] = []

  // Always start with title
  slides.push({
    id: 'intro',
    type: 'TITLE_INTRO',
    duration: 2000,
    data: { title: content.title, subtitle: 'Your results are in...' },
    transitions: { enter: { type: 'spring', stiffness: 100 }, exit: { type: 'tween', duration: 300 } }
  })

  if (content.type === 'POLL') {
    // Poll-specific sequence
    if (userResponse) {
      slides.push(createYourAnswerSlide(content, userResponse))
    }
    slides.push(createAggregateRevealSlide(content))
    slides.push(createComparisonSlide(content, userResponse))
  }

  if (content.type === 'TEST') {
    // Test-specific: show score and badge
    slides.push(createScoreRevealSlide(content, userResponse))
    if (userResponse?.earnedBadge) {
      slides.push(createBadgeEarnedSlide(userResponse.earnedBadge))
    }
  }

  // Always end with share card and COMMENTS CTA
  slides.push(createShareCardSlide(content, userResponse))
  slides.push(createVoiceCTASlide(content))

  return {
    id: `anim_${content.id}`,
    contentType: content.type,
    slides,
    totalDuration: slides.reduce((sum, s) => sum + s.duration, 0),
    autoPlay: true,
    allowSkip: true
  }
}

export type { AnimationSequence, AnimationSlide, SlideType, SlideData }
export { generateAnimationSequence }
```


# ══════════════════════════════════════════════════════════════════════════════
# 10.12 PULSE SHARE CARD GENERATION
# ══════════════════════════════════════════════════════════════════════════════

## 10.12.1 Share Card System

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// SHARE CARD GENERATION SYSTEM
// Creates visually appealing, branded share images
// ═══════════════════════════════════════════════════════════════════════════════

interface ShareCardData {
  id: string
  contentId: string
  contentType: 'POLL' | 'TEST' | 'SURVEY'

  // Layout
  template: ShareCardTemplate
  dimensions: { width: number, height: number }

  // Content
  title: string
  subtitle: string | null
  userResult: string | null       // "You voted: Option A"
  aggregateResult: string | null  // "65% agree with you"
  badge: BadgeData | null         // For tests

  // Branding
  brandColor: string
  backgroundStyle: 'gradient' | 'solid' | 'pattern'
  logoUrl: string

  // Social
  watermark: string               // "voxpoll.com"
  qrCodeUrl: string | null        // Link to take same content

  // Generated
  imageUrl: string | null         // Generated image URL
  generatedAt: Date | null
}

type ShareCardTemplate =
  | 'POLL_RESULT'       // Bar chart style
  | 'TEST_BADGE'        // Badge centered
  | 'TEST_SCORE'        // Score with badge
  | 'COMPARISON'        // User vs Everyone
  | 'MINIMAL'           // Just title and result

const SHARE_CARD_CONFIG = {
  DIMENSIONS: {
    INSTAGRAM_STORY: { width: 1080, height: 1920 },
    INSTAGRAM_POST: { width: 1080, height: 1080 },
    TWITTER: { width: 1200, height: 675 },
    FACEBOOK: { width: 1200, height: 630 },
    DEFAULT: { width: 800, height: 600 }
  },

  TEMPLATES: {
    POLL_RESULT: {
      showBars: true,
      showPercentages: true,
      highlightUserChoice: true,
      showParticipantCount: true
    },
    TEST_BADGE: {
      badgeCentered: true,
      showDescription: true,
      showRarity: true,
      particleEffects: true
    }
  },

  GENERATION: {
    ENGINE: 'sharp',              // or 'canvas', 'puppeteer'
    CACHE_DURATION_HOURS: 24,
    MAX_QUEUE_SIZE: 1000,
    TIMEOUT_MS: 10000
  }
} as const

// Server-side card generation
async function generateShareCard(
  data: ShareCardData,
  format: keyof typeof SHARE_CARD_CONFIG.DIMENSIONS = 'DEFAULT'
): Promise<string> {
  const dimensions = SHARE_CARD_CONFIG.DIMENSIONS[format]
  const cacheKey = `sharecard:${data.contentId}:${data.id}:${format}`

  // Check cache
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  // Generate image
  const imageBuffer = await renderShareCard(data, dimensions)

  // Upload to CDN
  const imageUrl = await uploadToCDN(imageBuffer, {
    contentType: 'image/png',
    path: `share-cards/${data.contentId}/${data.id}_${format}.png`
  })

  // Cache URL
  await redis.setex(cacheKey, SHARE_CARD_CONFIG.GENERATION.CACHE_DURATION_HOURS * 3600, imageUrl)

  return imageUrl
}

// Share card API response
interface ShareCardResponse {
  cards: Record<string, string>   // format → url mapping
  ogMetaTags: {
    'og:image': string
    'og:title': string
    'og:description': string
    'twitter:card': string
    'twitter:image': string
  }
  shareUrls: {
    twitter: string
    facebook: string
    linkedin: string
    whatsapp: string
    copy: string
  }
}

export { SHARE_CARD_CONFIG, generateShareCard }
export type { ShareCardData, ShareCardTemplate, ShareCardResponse }
```


# ══════════════════════════════════════════════════════════════════════════════
# 10.13 DIRECT MESSAGING (DM) SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 10.13.1 DM System Overview

[DECISION P-022] Direct messaging is ENABLED for VoxPoll users to facilitate
discussions about content and build community connections.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DM SYSTEM OVERVIEW                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  WHO CAN SEND DMs                                                               │
│  ────────────────                                                               │
│                                                                                 │
│  ┌───────────────┬────────────────┬────────────────┬─────────────────────┐     │
│  │ Sender Tier   │ Daily Limit    │ Can DM Anyone  │ Can Receive From    │     │
│  ├───────────────┼────────────────┼────────────────┼─────────────────────┤     │
│  │ Free          │ 5 DMs/day      │ Followers only │ Anyone (if enabled) │     │
│  │ Plus          │ 25 DMs/day     │ Yes            │ Anyone (if enabled) │     │
│  │ Premium       │ Unlimited      │ Yes            │ Anyone (if enabled) │     │
│  │ Org Member    │ 25 DMs/day     │ Yes            │ Anyone (if enabled) │     │
│  │ Platform Admin│ Unlimited      │ Yes            │ Anyone              │     │
│  └───────────────┴────────────────┴────────────────┴─────────────────────┘     │
│                                                                                 │
│  DM PRIVACY SETTINGS (User controls)                                            │
│  ───────────────────────────────────                                            │
│                                                                                 │
│  • "Herkes" - Anyone can DM                                                     │
│  • "Takipçiler" - Only followers can DM                                         │
│  • "Arkadaşlar" - Only mutual follows (friends) can DM                          │
│  • "Kapalı" - No DMs allowed (except Platform Admin)                            │
│                                                                                 │
│  RESTRICTIONS                                                                   │
│  ────────────                                                                   │
│  • Anonymous users CANNOT send DMs (account required)                           │
│  • Blocked users CANNOT send DMs to the blocker                                 │
│  • Muted users' DMs go to "Message Requests" (not inbox)                        │
│  • Newly created accounts: 24h wait before DM (spam prevention)                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.13.2 DM Data Models

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DM DATA MODELS
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const conversationSchema = z.object({
  id: z.string().cuid(),

  participantIds: z.array(z.string().cuid()).length(2),

  lastMessageAt: z.date(),
  lastMessagePreview: z.string().max(100).nullable(),

  participant1: z.object({
    id: z.string().cuid(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
    unreadCount: z.number().int().min(0),
    lastReadAt: z.date().nullable(),
    isArchived: z.boolean().default(false),
    isMuted: z.boolean().default(false),
    mutedUntil: z.date().nullable()
  }),

  participant2: z.object({
    id: z.string().cuid(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
    unreadCount: z.number().int().min(0),
    lastReadAt: z.date().nullable(),
    isArchived: z.boolean().default(false),
    isMuted: z.boolean().default(false),
    mutedUntil: z.date().nullable()
  }),

  isMessageRequest: z.boolean().default(false),

  createdAt: z.date(),
  updatedAt: z.date()
})

const messageSchema = z.object({
  id: z.string().cuid(),
  conversationId: z.string().cuid(),
  senderId: z.string().cuid(),

  content: z.string().min(1).max(2000),

  attachments: z.array(z.object({
    type: z.enum(["IMAGE", "GIF"]),
    url: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    width: z.number().int().optional(),
    height: z.number().int().optional()
  })).max(4).default([]),

  replyToId: z.string().cuid().nullable(),

  sharedContent: z.object({
    type: z.enum(["POLL", "TEST", "SURVEY", "COMMENT", "PROFILE"]),
    id: z.string().cuid(),
    title: z.string(),
    preview: z.string().optional()
  }).nullable(),

  status: z.enum(["SENT", "DELIVERED", "READ", "FAILED"]).default("SENT"),
  deliveredAt: z.date().nullable(),
  readAt: z.date().nullable(),

  isEdited: z.boolean().default(false),
  editedAt: z.date().nullable(),

  deletedAt: z.date().nullable(),
  deletedBy: z.enum(["SENDER", "RECIPIENT", "SYSTEM", "ADMIN"]).nullable(),

  createdAt: z.date()
})

const messageRequestSchema = z.object({
  id: z.string().cuid(),
  conversationId: z.string().cuid(),

  senderId: z.string().cuid(),
  recipientId: z.string().cuid(),

  status: z.enum(["PENDING", "ACCEPTED", "DECLINED", "BLOCKED"]),

  firstMessage: z.string().max(2000),

  declinedReason: z.enum([
    "NOT_INTERESTED",
    "SPAM",
    "INAPPROPRIATE",
    "HARASSMENT"
  ]).nullable(),

  createdAt: z.date(),
  respondedAt: z.date().nullable()
})

type Conversation = z.infer<typeof conversationSchema>
type Message = z.infer<typeof messageSchema>
type MessageRequest = z.infer<typeof messageRequestSchema>

export { conversationSchema, messageSchema, messageRequestSchema }
export type { Conversation, Message, MessageRequest }
```


## 10.13.3 DM Inbox UI Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DM INBOX UI (/messages)                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Mesajlar                                            [+] Yeni Mesaj        │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  [Gelen Kutusu (3)] [İstekler (2)] [Arşiv]                                │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  🟢 @ahmet_yilmaz                                          5dk önce │  │ │
│  │  │     Ahmet Yılmaz                                                    │  │ │
│  │  │     Evet, anket sonuçları çok ilginç geldi bana da...              │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  ⚫ @zeynep_kaya                                            2s önce │  │ │
│  │  │     Zeynep Kaya                                                     │  │ │
│  │  │     Testi paylaştığın için teşekkürler!                            │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  🔵 @can_demir (3)                                         1g önce  │  │ │
│  │  │     Can Demir                                                       │  │ │
│  │  │     Haha evet kesinlikle katılıyorum 😄                            │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  🟢 = Çevrimiçi   ⚫ = Çevrimdışı   🔵 = (3) okunmamış mesaj            │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  EMPTY STATE (No messages)                                                      │
│  ─────────────────────────                                                      │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │                                            │                                 │
│  │           💬                               │                                 │
│  │                                            │                                 │
│  │     Henüz mesajınız yok                    │                                 │
│  │                                            │                                 │
│  │     Takip ettiğiniz kişilere mesaj         │                                 │
│  │     göndererek sohbete başlayın.           │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │       Yeni Mesaj Gönder            │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.13.4 Message Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     MESSAGE REQUEST FLOW                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  WHEN MESSAGE REQUEST IS CREATED                                                │
│  ───────────────────────────────                                                │
│                                                                                 │
│  Message goes to "İstekler" tab when:                                           │
│  • Sender is NOT followed by recipient                                          │
│  • Sender is muted by recipient                                                 │
│  • First-time message to this user                                              │
│                                                                                 │
│  REQUEST NOTIFICATION                                                           │
│  ─────────────────────                                                          │
│                                                                                 │
│  Push notification: "@ahmet_yilmaz size mesaj isteği gönderdi"                  │
│  In-app badge: "İstekler (2)" tab shows count                                   │
│                                                                                 │
│  MESSAGE REQUEST UI                                                             │
│  ──────────────────                                                             │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  İstekler (2)                                                              │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  ⚠️ Bu kişiler sizi takip etmiyor. Kabul etmedikçe mesajları             │ │
│  │     göremeyeceksiniz.                                                     │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  @mystery_user                                           12s önce   │  │ │
│  │  │  Mesaj isteği                                                       │  │ │
│  │  │                                                                     │  │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │  │ │
│  │  │  │   Kabul Et   │  │   Reddet     │  │   Engelle ve Raporla    │   │  │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ACCEPT FLOW                                                                    │
│  ───────────                                                                    │
│                                                                                 │
│  1. User clicks "Kabul Et"                                                      │
│  2. Message request → Conversation (moves to Gelen Kutusu)                      │
│  3. All messages become visible                                                 │
│  4. Can now reply normally                                                      │
│                                                                                 │
│  DECLINE FLOW                                                                   │
│  ────────────                                                                   │
│                                                                                 │
│  1. User clicks "Reddet"                                                        │
│  2. Show reason selection (optional):                                           │
│     ┌────────────────────────────────────┐                                      │
│     │   Neden reddediyorsunuz?           │                                      │
│     ├────────────────────────────────────┤                                      │
│     │   ○ İlgilenmiyorum                 │                                      │
│     │   ○ Spam                           │                                      │
│     │   ○ Uygunsuz içerik                │                                      │
│     │   ○ Taciz                          │                                      │
│     │                                    │                                      │
│     │   [Reddet]   [İptal]               │                                      │
│     └────────────────────────────────────┘                                      │
│  3. Request removed, sender NOT notified                                        │
│  4. Sender can still send new request (unless blocked)                          │
│                                                                                 │
│  BLOCK AND REPORT FLOW                                                          │
│  ─────────────────────                                                          │
│                                                                                 │
│  1. User clicks "Engelle ve Raporla"                                            │
│  2. Block user immediately                                                      │
│  3. Show report form with pre-filled context                                    │
│  4. Sender CANNOT send any more requests                                        │
│  5. Reported to moderation queue                                                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.13.5 Conversation UI Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     CONVERSATION VIEW (/messages/:conversationId)                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ← @ahmet_yilmaz                                              🟢 Çevrimiçi │ │
│  │     Ahmet Yılmaz                                              [···]        │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │                                          ┌──────────────────────────────┐ │ │
│  │                                          │ Merhaba! Anketi gördüm,      │ │ │
│  │                                          │ çok ilginç sonuçlar 👀        │ │ │
│  │                                          │                   14:32  ✓✓ │ │ │
│  │                                          └──────────────────────────────┘ │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────┐                                   │ │
│  │  │ Teşekkürler! Evet bence de çok     │                                   │ │
│  │  │ şaşırtıcı oldu sonuçlar.           │                                   │ │
│  │  │ 14:35                              │                                   │ │
│  │  └────────────────────────────────────┘                                   │ │
│  │                                                                           │ │
│  │                                          ┌──────────────────────────────┐ │ │
│  │                                          │ 📊 [Shared Poll]             │ │ │
│  │                                          │ "Türkiye'de en popüler..."   │ │ │
│  │                                          │                   14:40  ✓✓ │ │ │
│  │                                          └──────────────────────────────┘ │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────┐                                   │ │
│  │  │ Evet, anket sonuçları çok ilginç   │                                   │ │
│  │  │ geldi bana da...                   │                                   │ │
│  │  │ 15:02                              │                                   │ │
│  │  └────────────────────────────────────┘                                   │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ [📎] [GIF] Mesajınızı yazın...                              [Gönder]│   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  MESSAGE STATUS INDICATORS                                                      │
│  ─────────────────────────                                                      │
│                                                                                 │
│  ✓   = Gönderildi (sent to server)                                              │
│  ✓✓  = Teslim edildi (delivered to recipient device)                            │
│  ✓✓ (blue) = Okundu (read by recipient)                                         │
│                                                                                 │
│  CONVERSATION OPTIONS MENU ([···])                                              │
│  ─────────────────────────────────                                              │
│                                                                                 │
│  ┌────────────────────────────────────┐                                         │
│  │ Profili Görüntüle                  │                                         │
│  │ Bildirimleri Sessize Al            │                                         │
│  │ Konuşmayı Arşivle                  │                                         │
│  │ ─────────────────────────          │                                         │
│  │ Konuşmayı Sil                      │                                         │
│  │ Kullanıcıyı Engelle                │                                         │
│  │ Raporla                            │                                         │
│  └────────────────────────────────────┘                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.13.6 New Message Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     NEW MESSAGE FLOW                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STEP 1: RECIPIENT SELECTION                                                    │
│  ───────────────────────────                                                    │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  Yeni Mesaj                     [İptal]    │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  Kime: ┌──────────────────────────────┐    │                                 │
│  │        │ 🔍 Kullanıcı ara...          │    │                                 │
│  │        └──────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  ÖNERİLEN                                  │                                 │
│  │  ─────────                                 │                                 │
│  │  👤 @ahmet_yilmaz  ✓ Takip ediyorsun       │                                 │
│  │  👤 @zeynep_kaya   ✓ Arkadaş               │                                 │
│  │  👤 @can_demir     ✓ Seni takip ediyor     │                                 │
│  │                                            │                                 │
│  │  SON KONUŞMALAR                            │                                 │
│  │  ────────────────                          │                                 │
│  │  👤 @elif_ozturk   Son mesaj: 2 gün önce   │                                 │
│  │  👤 @murat_koc     Son mesaj: 1 hafta önce │                                 │
│  │                                            │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│  STEP 2: COMPOSE MESSAGE                                                        │
│  ───────────────────────                                                        │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  Yeni Mesaj                     [Gönder]   │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  Kime: @ahmet_yilmaz  ✕                    │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │                                    │    │                                 │
│  │  │ Merhaba! Anketi gördüm, çok       │    │                                 │
│  │  │ ilginç sonuçlar 👀                 │    │                                 │
│  │  │                                    │    │                                 │
│  │  │                                    │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  [📎 Dosya] [GIF] [📊 İçerik Paylaş]       │                                 │
│  │                                            │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│  DM RESTRICTION STATES                                                          │
│  ─────────────────────                                                          │
│                                                                                 │
│  1. User has DMs disabled:                                                      │
│     "Bu kullanıcı mesaj almayı kapatmış."                                       │
│     [Profili Görüntüle]                                                         │
│                                                                                 │
│  2. Free user trying to DM non-follower:                                        │
│     "Sadece takipçilerinize mesaj gönderebilirsiniz."                           │
│     [Plus'a Yükselt] [Kullanıcıyı Takip Et]                                     │
│                                                                                 │
│  3. Daily limit reached:                                                        │
│     "Günlük mesaj limitinize ulaştınız (5/5)."                                  │
│     "Yarın tekrar deneyin veya Plus'a yükseltin."                               │
│     [Plus'a Yükselt]                                                            │
│                                                                                 │
│  4. User is blocked:                                                            │
│     "Bu kullanıcıyı engellediniz. Mesaj gönderemezsiniz."                       │
│     [Engeli Kaldır]                                                             │
│                                                                                 │
│  5. You are blocked:                                                            │
│     "Bu kullanıcıya mesaj gönderemezsiniz."                                     │
│     (No action available)                                                       │
│                                                                                 │
│  6. New account restriction:                                                    │
│     "Yeni hesaplar 24 saat sonra mesaj gönderebilir."                           │
│     "Kalan süre: 18 saat 42 dakika"                                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.13.7 DM Rate Limiting

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DM RATE LIMITING
// ══════════════════════════════════════════════════════════════════════════════

import { redis } from "@/lib/redis"

const DM_RATE_LIMITS = {
  FREE: {
    dailyLimit: 5,
    perHourLimit: 3,
    perConversationPerHour: 10,
    newAccountWaitHours: 24
  },
  PLUS: {
    dailyLimit: 25,
    perHourLimit: 15,
    perConversationPerHour: 30,
    newAccountWaitHours: 0
  },
  PREMIUM: {
    dailyLimit: Infinity,
    perHourLimit: 60,
    perConversationPerHour: 60,
    newAccountWaitHours: 0
  },
  ORG_MEMBER: {
    dailyLimit: 25,
    perHourLimit: 15,
    perConversationPerHour: 30,
    newAccountWaitHours: 0
  },
  PLATFORM_ADMIN: {
    dailyLimit: Infinity,
    perHourLimit: Infinity,
    perConversationPerHour: Infinity,
    newAccountWaitHours: 0
  }
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  limitType: "DAILY" | "HOURLY" | "CONVERSATION" | "NEW_ACCOUNT"
  message?: string
}

async function checkDMRateLimit(
  userId: string,
  conversationId: string | null,
  tier: keyof typeof DM_RATE_LIMITS
): Promise<RateLimitResult> {
  const limits = DM_RATE_LIMITS[tier]
  const now = new Date()

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { createdAt: true }
  })

  const accountAgeHours = (now.getTime() - user!.createdAt.getTime()) / (1000 * 60 * 60)
  if (accountAgeHours < limits.newAccountWaitHours) {
    const resetAt = new Date(user!.createdAt.getTime() + limits.newAccountWaitHours * 60 * 60 * 1000)
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      limitType: "NEW_ACCOUNT",
      message: `Yeni hesaplar ${limits.newAccountWaitHours} saat sonra mesaj gönderebilir.`
    }
  }

  const dailyKey = `dm:daily:${userId}:${now.toISOString().split('T')[0]}`
  const dailyCount = parseInt(await redis.get(dailyKey) || "0")

  if (dailyCount >= limits.dailyLimit) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return {
      allowed: false,
      remaining: 0,
      resetAt: tomorrow,
      limitType: "DAILY",
      message: `Günlük mesaj limitinize ulaştınız (${limits.dailyLimit}/${limits.dailyLimit}).`
    }
  }

  const hourlyKey = `dm:hourly:${userId}:${Math.floor(now.getTime() / 3600000)}`
  const hourlyCount = parseInt(await redis.get(hourlyKey) || "0")

  if (hourlyCount >= limits.perHourLimit) {
    const nextHour = new Date(now)
    nextHour.setMinutes(0, 0, 0)
    nextHour.setHours(nextHour.getHours() + 1)

    return {
      allowed: false,
      remaining: 0,
      resetAt: nextHour,
      limitType: "HOURLY",
      message: "Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyin."
    }
  }

  if (conversationId) {
    const convKey = `dm:conv:${userId}:${conversationId}:${Math.floor(now.getTime() / 3600000)}`
    const convCount = parseInt(await redis.get(convKey) || "0")

    if (convCount >= limits.perConversationPerHour) {
      const nextHour = new Date(now)
      nextHour.setMinutes(0, 0, 0)
      nextHour.setHours(nextHour.getHours() + 1)

      return {
        allowed: false,
        remaining: 0,
        resetAt: nextHour,
        limitType: "CONVERSATION",
        message: "Bu konuşmaya çok fazla mesaj gönderdiniz. Lütfen biraz bekleyin."
      }
    }
  }

  return {
    allowed: true,
    remaining: limits.dailyLimit - dailyCount - 1,
    resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    limitType: "DAILY"
  }
}

async function recordDMSent(
  userId: string,
  conversationId: string
): Promise<void> {
  const now = new Date()

  const dailyKey = `dm:daily:${userId}:${now.toISOString().split('T')[0]}`
  await redis.incr(dailyKey)
  await redis.expire(dailyKey, 86400)

  const hourlyKey = `dm:hourly:${userId}:${Math.floor(now.getTime() / 3600000)}`
  await redis.incr(hourlyKey)
  await redis.expire(hourlyKey, 3600)

  const convKey = `dm:conv:${userId}:${conversationId}:${Math.floor(now.getTime() / 3600000)}`
  await redis.incr(convKey)
  await redis.expire(convKey, 3600)
}

export { DM_RATE_LIMITS, checkDMRateLimit, recordDMSent }
export type { RateLimitResult }
```


## 10.13.8 DM Content Sharing

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     SHARE CONTENT VIA DM                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FROM CONTENT PAGE (Poll, Test, Survey)                                         │
│  ────────────────────────────────────────                                       │
│                                                                                 │
│  1. User clicks "Paylaş" on content                                             │
│  2. Share menu appears:                                                         │
│     ┌────────────────────────────────────┐                                      │
│     │  Paylaş                            │                                      │
│     ├────────────────────────────────────┤                                      │
│     │  📱 Bağlantıyı Kopyala             │                                      │
│     │  💬 DM ile Gönder                  │                                      │
│     │  📲 WhatsApp                       │                                      │
│     │  📘 Twitter/X                      │                                      │
│     │  📷 Instagram                      │                                      │
│     └────────────────────────────────────┘                                      │
│                                                                                 │
│  3. User selects "DM ile Gönder"                                                │
│  4. Recipient selector opens:                                                   │
│     ┌────────────────────────────────────────────────────────────────────────┐  │
│     │  İçeriği Paylaş                                           [Gönder]    │  │
│     ├────────────────────────────────────────────────────────────────────────┤  │
│     │                                                                        │  │
│     │  📊 "Türkiye'de en popüler kahvaltılık..."                            │  │
│     │     Anket · 1,234 katılımcı                                            │  │
│     │                                                                        │  │
│     │  ─────────────────────────────────────────────────────────────────    │  │
│     │                                                                        │  │
│     │  Kime: 🔍 Kullanıcı ara...                                             │  │
│     │                                                                        │  │
│     │  SON KONUŞMALAR                                                        │  │
│     │  ☐ @ahmet_yilmaz                                                       │  │
│     │  ☐ @zeynep_kaya                                                        │  │
│     │  ☐ @can_demir                                                          │  │
│     │                                                                        │  │
│     │  ─────────────────────────────────────────────────────────────────    │  │
│     │                                                                        │  │
│     │  Mesaj ekle (opsiyonel):                                               │  │
│     │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│     │  │ Buna bak, çok ilginç!                                           │  │  │
│     │  └──────────────────────────────────────────────────────────────────┘  │  │
│     │                                                                        │  │
│     └────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  5. User selects recipients and clicks "Gönder"                                 │
│  6. Message sent to selected conversations                                      │
│  7. Success toast: "1 kişiye gönderildi"                                        │
│                                                                                 │
│  SHARED CONTENT PREVIEW IN DM                                                   │
│  ────────────────────────────                                                   │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Buna bak, çok ilginç!                                          14:32  ✓✓│ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  📊 ANKET                                                          │   │ │
│  │  │  ─────────────────────────────────────────────────────────────    │   │ │
│  │  │  Türkiye'de en popüler kahvaltılık hangisi?                       │   │ │
│  │  │                                                                    │   │ │
│  │  │  🥇 Simit - 34%                                                    │   │ │
│  │  │  🥈 Poğaça - 28%                                                   │   │ │
│  │  │                                                                    │   │ │
│  │  │  1,234 katılımcı · 2 gün önce                                      │   │ │
│  │  │                                                                    │   │ │
│  │  │  [Katıl]                                                           │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 10.13.9 DM Functions

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DM CORE FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

import { db } from "@/lib/db"
import { pusher } from "@/lib/pusher"

interface SendMessageInput {
  senderId: string
  recipientId: string
  content: string
  attachments?: Attachment[]
  sharedContent?: SharedContent
  replyToId?: string
}

interface SendMessageResult {
  success: boolean
  message?: Message
  conversation?: Conversation
  error?: string
  isMessageRequest?: boolean
}

async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  const { senderId, recipientId, content, attachments, sharedContent, replyToId } = input

  const sender = await db.user.findUnique({
    where: { id: senderId },
    include: { subscription: true }
  })

  if (!sender) {
    return { success: false, error: "SENDER_NOT_FOUND" }
  }

  const tier = getTierFromUser(sender)
  const rateLimitCheck = await checkDMRateLimit(senderId, null, tier)

  if (!rateLimitCheck.allowed) {
    return { success: false, error: rateLimitCheck.message }
  }

  const permissionCheck = await checkDMPermission(senderId, recipientId, tier)
  if (!permissionCheck.allowed) {
    return { success: false, error: permissionCheck.message }
  }

  let conversation = await db.conversation.findFirst({
    where: {
      participantIds: { hasEvery: [senderId, recipientId] }
    }
  })

  const isNewConversation = !conversation
  const isMessageRequest = isNewConversation && !permissionCheck.isFollower

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        participantIds: [senderId, recipientId],
        isMessageRequest,
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100)
      }
    })

    if (isMessageRequest) {
      await db.messageRequest.create({
        data: {
          conversationId: conversation.id,
          senderId,
          recipientId,
          firstMessage: content,
          status: "PENDING"
        }
      })
    }
  }

  const message = await db.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      content,
      attachments: attachments || [],
      sharedContent,
      replyToId,
      status: "SENT"
    }
  })

  await db.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: content.substring(0, 100),
      [`participant${senderId === conversation.participantIds[0] ? "2" : "1"}`]: {
        update: {
          unreadCount: { increment: 1 }
        }
      }
    }
  })

  await recordDMSent(senderId, conversation.id)

  if (!isMessageRequest) {
    await pusher.trigger(
      `private-dm-${recipientId}`,
      "new-message",
      {
        conversationId: conversation.id,
        message: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt
        }
      }
    )

    await sendDMNotification(recipientId, {
      type: "NEW_MESSAGE",
      senderId,
      senderUsername: sender.username,
      preview: content.substring(0, 50),
      conversationId: conversation.id
    })
  } else {
    await sendDMNotification(recipientId, {
      type: "MESSAGE_REQUEST",
      senderId,
      senderUsername: sender.username,
      conversationId: conversation.id
    })
  }

  return {
    success: true,
    message,
    conversation,
    isMessageRequest
  }
}

async function checkDMPermission(
  senderId: string,
  recipientId: string,
  senderTier: string
): Promise<{ allowed: boolean; message?: string; isFollower: boolean }> {
  const [recipient, block, follow] = await Promise.all([
    db.user.findUnique({
      where: { id: recipientId },
      select: {
        dmSettings: true,
        createdAt: true
      }
    }),
    db.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: senderId, blockedId: recipientId },
          { blockerId: recipientId, blockedId: senderId }
        ]
      }
    }),
    db.follow.findFirst({
      where: { followerId: recipientId, followingId: senderId }
    })
  ])

  if (!recipient) {
    return { allowed: false, message: "Kullanıcı bulunamadı.", isFollower: false }
  }

  if (block) {
    if (block.blockerId === senderId) {
      return { allowed: false, message: "Bu kullanıcıyı engellediniz.", isFollower: false }
    }
    return { allowed: false, message: "Bu kullanıcıya mesaj gönderemezsiniz.", isFollower: false }
  }

  const isFollower = !!follow
  const dmSettings = recipient.dmSettings || "EVERYONE"

  if (dmSettings === "DISABLED") {
    return { allowed: false, message: "Bu kullanıcı mesaj almayı kapatmış.", isFollower }
  }

  if (dmSettings === "FOLLOWERS" && !isFollower) {
    if (senderTier === "FREE") {
      return {
        allowed: false,
        message: "Bu kullanıcı sadece takipçilerinden mesaj alıyor.",
        isFollower
      }
    }
  }

  if (dmSettings === "FRIENDS") {
    const mutualFollow = await db.follow.findFirst({
      where: { followerId: senderId, followingId: recipientId }
    })
    if (!mutualFollow || !isFollower) {
      return {
        allowed: false,
        message: "Bu kullanıcı sadece arkadaşlarından mesaj alıyor.",
        isFollower
      }
    }
  }

  if (senderTier === "FREE" && !isFollower) {
    return {
      allowed: false,
      message: "Sadece sizi takip eden kullanıcılara mesaj gönderebilirsiniz.",
      isFollower
    }
  }

  return { allowed: true, isFollower }
}

async function markConversationRead(
  userId: string,
  conversationId: string
): Promise<void> {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId }
  })

  if (!conversation || !conversation.participantIds.includes(userId)) {
    return
  }

  const participantIndex = conversation.participantIds[0] === userId ? 1 : 2
  const participantField = `participant${participantIndex}`

  await db.conversation.update({
    where: { id: conversationId },
    data: {
      [participantField]: {
        update: {
          unreadCount: 0,
          lastReadAt: new Date()
        }
      }
    }
  })

  await db.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null
    },
    data: {
      status: "READ",
      readAt: new Date()
    }
  })

  const otherUserId = conversation.participantIds.find(id => id !== userId)
  if (otherUserId) {
    await pusher.trigger(
      `private-dm-${otherUserId}`,
      "messages-read",
      { conversationId, readBy: userId, readAt: new Date() }
    )
  }
}

async function handleMessageRequest(
  userId: string,
  conversationId: string,
  action: "ACCEPT" | "DECLINE" | "BLOCK",
  declineReason?: string
): Promise<{ success: boolean }> {
  const request = await db.messageRequest.findFirst({
    where: {
      conversationId,
      recipientId: userId,
      status: "PENDING"
    }
  })

  if (!request) {
    return { success: false }
  }

  if (action === "ACCEPT") {
    await db.$transaction([
      db.messageRequest.update({
        where: { id: request.id },
        data: { status: "ACCEPTED", respondedAt: new Date() }
      }),
      db.conversation.update({
        where: { id: conversationId },
        data: { isMessageRequest: false }
      })
    ])
  } else if (action === "DECLINE") {
    await db.messageRequest.update({
      where: { id: request.id },
      data: {
        status: "DECLINED",
        declinedReason: declineReason as any,
        respondedAt: new Date()
      }
    })
  } else if (action === "BLOCK") {
    await db.$transaction([
      db.messageRequest.update({
        where: { id: request.id },
        data: { status: "BLOCKED", respondedAt: new Date() }
      }),
      db.userBlock.create({
        data: { blockerId: userId, blockedId: request.senderId }
      })
    ])
  }

  return { success: true }
}

export {
  sendMessage,
  checkDMPermission,
  markConversationRead,
  handleMessageRequest
}
export type { SendMessageInput, SendMessageResult }
```


## 10.13.10 DM Notifications

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DM NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════

interface DMNotificationPayload {
  type: "NEW_MESSAGE" | "MESSAGE_REQUEST" | "REQUEST_ACCEPTED"
  senderId: string
  senderUsername: string
  conversationId: string
  preview?: string
}

async function sendDMNotification(
  recipientId: string,
  payload: DMNotificationPayload
): Promise<void> {
  const recipient = await db.user.findUnique({
    where: { id: recipientId },
    select: {
      notificationSettings: true,
      pushTokens: true
    }
  })

  if (!recipient) return

  const settings = recipient.notificationSettings || {}
  if (settings.dmNotifications === false) return

  const notifications: NotificationInput[] = []

  if (payload.type === "NEW_MESSAGE") {
    notifications.push({
      userId: recipientId,
      type: "DM_NEW_MESSAGE",
      title: `@${payload.senderUsername}`,
      body: payload.preview || "Yeni mesaj",
      data: {
        conversationId: payload.conversationId,
        senderId: payload.senderId
      },
      channels: ["IN_APP", "PUSH"]
    })
  } else if (payload.type === "MESSAGE_REQUEST") {
    notifications.push({
      userId: recipientId,
      type: "DM_MESSAGE_REQUEST",
      title: "Mesaj İsteği",
      body: `@${payload.senderUsername} size mesaj göndermek istiyor`,
      data: {
        conversationId: payload.conversationId,
        senderId: payload.senderId
      },
      channels: ["IN_APP", "PUSH"]
    })
  } else if (payload.type === "REQUEST_ACCEPTED") {
    notifications.push({
      userId: recipientId,
      type: "DM_REQUEST_ACCEPTED",
      title: "Mesaj İsteği Kabul Edildi",
      body: `@${payload.senderUsername} mesaj isteğinizi kabul etti`,
      data: {
        conversationId: payload.conversationId,
        senderId: payload.senderId
      },
      channels: ["IN_APP", "PUSH"]
    })
  }

  for (const notification of notifications) {
    await createNotification(notification)
  }
}

export { sendDMNotification }
export type { DMNotificationPayload }
```


# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 10
# ══════════════════════════════════════════════════════════════════════════════
# Status: UPDATED
# Last Updated: January 2026
# Changes: VOICE renamed to PULSE + COMMENTS
#          - PULSE: Results visualization (Spotify Wrap-style)
#          - COMMENTS: Discussion forum (Reddit/Instagram hybrid)
#          - P-022 updated: DMs now enabled, social features added
#          - Section 10.13: Complete DM System flows added
# Next Section: SECTION 11 - FEED & DISCOVERY ALGORITHM
# ══════════════════════════════════════════════════════════════════════════════
