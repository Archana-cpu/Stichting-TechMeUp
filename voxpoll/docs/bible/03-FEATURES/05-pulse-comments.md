# ═══════════════════════════════════════════════════════════════════════════════
# FEATURES - PULSE + COMMENTS (Results & Discussion)
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-010.md
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# PULSE + COMMENTS OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

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
│  - Animated data visualization                                                  │
│  - Charts, graphs, comparisons                                                  │
│  - User's result vs aggregate                                                   │
│  - Demographic breakdowns                                                       │
│  - Shareable visual cards                                                       │
│                                                                                 │
│  For TESTS: Personal Result Screen (Not called PULSE)                           │
│  - User sees their personal outcome                                             │
│  - COMMENTS section still applies                                               │
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
│  - Text, Images, GIFs support                                                   │
│  - Upvote/Downvote (Wilson Score ranking)                                       │
│  - Nested replies (max 3 levels)                                                │
│  - Creator moderation tools                                                     │
│  - Sort: Hot, New, Top, Controversial                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# ACCESS RULES
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PULSE + COMMENTS ACCESS MATRIX                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User Status         │ View PULSE │ View COMMENTS │ Write COMMENTS │ Share     │
│  ────────────────────┼────────────┼───────────────┼────────────────┼───────────│
│  Participated        │     Y      │       Y       │       Y        │     Y     │
│  Free (no part.)     │     -      │       -       │       -        │     -     │
│  Plus (no part.)     │     Y      │       Y       │       Y        │     Y     │
│  Premium (no part.)  │     Y      │       Y       │       Y        │     Y     │
│  Creator             │     Y      │       Y       │       Y        │     Y     │
│                                                                                 │
│  [DECISION P-016] Plus tier grants PULSE/COMMENTS access without participation  │
│  This is a key monetization lever for users who want to join discussions        │
│  without taking the poll/test themselves.                                       │
│                                                                                 │
│  ACCESS FLOW:                                                                   │
│                                                                                 │
│    Free User:        Content --> Must Vote --> See PULSE --> Can Comment        │
│    Plus/Premium:     Content --> See PULSE (skip vote) --> Can Comment          │
│    Creator (own):    Content --> See PULSE --> Can Comment                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# ACTIVATION TIMELINE
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PULSE + COMMENTS ACTIVATION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  POLL (PULSE + COMMENTS):                                                       │
│  ─────────────────────────                                                      │
│  Poll ends (time expires or creator closes) ---> PULSE + COMMENTS opens         │
│  - All participants notified                                                    │
│  - PULSE: Results visualization generated                                       │
│  - COMMENTS: Discussion forum opens                                             │
│                                                                                 │
│  SURVEY (PULSE + COMMENTS):                                                     │
│  ───────────────────────────                                                    │
│  Survey ends ---> PULSE + COMMENTS opens (if enabled by creator)                │
│  - Organization decides if discussion is enabled                                │
│  - PULSE: Results can be shared publicly or kept private                        │
│  - COMMENTS: Discussion can be limited to participants only                     │
│                                                                                 │
│  TEST (Result + COMMENTS):                                                      │
│  ─────────────────────────                                                      │
│  User completes test ---> Personal Result + COMMENTS immediately                │
│  - Shows personal result + how they compare                                     │
│  - Can see aggregate distribution (not called PULSE for tests)                  │
│  - COMMENTS: Join discussion with other test-takers                             │
│  - Typical comments: "I got INTJ!", "Me too!", "I'm ENFP"                       │
│                                                                                 │
│  LIVE POLL (PULSE + COMMENTS):                                                  │
│  ─────────────────────────────                                                  │
│  Live poll ends ---> Real-time transition to PULSE + COMMENTS                   │
│  - PULSE: Results animation plays                                               │
│  - COMMENTS: Live chat continues as discussion forum                            │
│  - Participants can share their experience                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# PULSE: SPOTIFY WRAP-STYLE RESULTS
# ═══════════════════════════════════════════════════════════════════════════════

PULSE presents results in an engaging, shareable format inspired by Spotify Wrapped.

## Visualization Components

1. **ANIMATED REVEAL**
   - Results appear with smooth animations
   - Key stats highlight sequentially
   - Background color shifts based on result theme

2. **PERSONAL CONTEXT (for polls/tests)**
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  "You voted for Next.js"                                    │
   │                                                              │
   │  ████████████████████████████████████████░░░░  62%          │
   │                                                              │
   │  You're with the majority!                                  │
   │  3,421 others voted the same way                            │
   └─────────────────────────────────────────────────────────────┘
   ```

3. **DEMOGRAPHIC BREAKDOWN**
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  How different groups voted:                                │
   │                                                              │
   │  18-24:  React █████████████████  65%                       │
   │  25-34:  Next  ████████████████████  72%                    │
   │  35-44:  Vue   ████████████  48%                            │
   │                                                              │
   │  Female: Next.js leads with 68%                             │
   │  Male: React leads with 54%                                 │
   └─────────────────────────────────────────────────────────────┘
   ```

4. **SHAREABLE CARD**
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  ┌─────────────────────────────────────────────────────┐   │
   │  │                                                     │   │
   │  │     I voted in "Best Framework 2025"               │   │
   │  │                                                     │   │
   │  │     [Visual result card with brand styling]        │   │
   │  │                                                     │   │
   │  │     Join 5,421 others at voxpoll.com               │   │
   │  │                                                     │   │
   │  └─────────────────────────────────────────────────────┘   │
   │                                                             │
   │  [Share to: Twitter] [Instagram] [WhatsApp] [Copy Link]    │
   └─────────────────────────────────────────────────────────────┘
   ```


## Pulse Visualization Types

```typescript
interface PulseVisualization {
  contentId: string
  contentType: "POLL" | "SURVEY" | "TEST"

  theme: {
    primaryColor: string
    secondaryColor: string
    backgroundGradient: string[]
    animationStyle: "slide" | "fade" | "bounce" | "reveal"
  }

  components: PulseComponent[]

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
```



# ═══════════════════════════════════════════════════════════════════════════════
# COMMENTS: HYBRID DISCUSSION FORUM
# ═══════════════════════════════════════════════════════════════════════════════

The COMMENTS section combines the best features of major platforms:

## Platform Feature Inspirations

**REDDIT FEATURES:**
- Threaded replies (up to 3 levels deep)
- Upvote/Downvote system
- Wilson Score ranking for "Best" sort
- Multiple sort options (Hot, New, Top, Controversial)
- Collapse/expand threads

**INSTAGRAM FEATURES:**
- Image and GIF support in comments
- Mention users with @username
- Like comments (single tap)
- Visual-first design
- Stories-style result sharing

**YOUTUBE FEATURES:**
- "Pinned" comment by creator
- "Hearted" comments by creator
- Creator highlighting their responses
- Sort by newest/top

**CREATOR CONTROLS:**
- Enable/disable discussion entirely
- Limit to participants only OR open to Plus users
- Pin important comments
- Heart/highlight comments
- Delete inappropriate comments
- Ban users from discussion


## Comment Data Model

```typescript
interface Comment {
  id: string
  contentId: string
  contentType: "POLL" | "SURVEY" | "TEST"

  authorId: string
  authorUsername: string
  authorAvatarUrl: string | null
  authorBadge: string | null           // "Creator", "Verified", etc.

  text: string
  mediaUrl: string | null
  mediaType: "IMAGE" | "GIF" | null

  parentId: string | null              // For replies
  depth: number                        // 0, 1, 2, 3 (max)

  upvotes: number
  downvotes: number
  wilsonScore: number                  // For ranking

  isPinned: boolean                    // By creator
  isHearted: boolean                   // By creator
  isCreatorReply: boolean

  status: "VISIBLE" | "HIDDEN" | "DELETED"
  createdAt: Date
  editedAt: Date | null
}
```


## Comment Sorting Algorithms

```typescript
type CommentSortOption = "HOT" | "NEW" | "TOP" | "CONTROVERSIAL"

const COMMENT_SORT_CONFIGS = {
  HOT: {
    description: "Best comments + recency balance",
    algorithm: "wilson_score * recency_decay"
  },
  NEW: {
    description: "Most recent first",
    algorithm: "created_at DESC"
  },
  TOP: {
    description: "Highest scored (all time)",
    algorithm: "upvotes - downvotes DESC"
  },
  CONTROVERSIAL: {
    description: "Most debated (high engagement)",
    algorithm: "(upvotes + downvotes) * (1 - ABS(upvotes - downvotes) / (upvotes + downvotes))"
  }
}

// Wilson Score calculation for comment ranking
function calculateWilsonScore(upvotes: number, downvotes: number): number {
  const n = upvotes + downvotes
  if (n === 0) return 0

  const z = 1.96 // 95% confidence
  const phat = upvotes / n
  const score = (phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n)) / (1+z*z/n)

  return score
}
```


## Comment Constraints

| Constraint | Value |
|------------|-------|
| Max text length | 2000 characters |
| Max reply depth | 3 levels |
| Max image size | 5MB |
| Supported formats | JPG, PNG, GIF, WebP |
| Edit window | 15 minutes |
| Rate limit | 5 comments/minute |
| Min account age | 1 hour (to comment) |



# ═══════════════════════════════════════════════════════════════════════════════
# CREATOR MODERATION TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CREATOR MODERATION PANEL                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  DISCUSSION SETTINGS:                                                          │
│  ─────────────────────                                                          │
│  [Toggle] Enable comments                        [ON]                           │
│  [Toggle] Allow images/GIFs                      [ON]                           │
│  [Toggle] Require participation to comment       [ON]                           │
│  [Toggle] Allow Plus users to comment            [ON]                           │
│  [Toggle] Pre-approve comments                   [OFF]                          │
│                                                                                 │
│  WORD FILTER:                                                                   │
│  ─────────────                                                                  │
│  [Add blocked words...]                                                         │
│  Currently blocked: spam, scam, inappropriate                                   │
│                                                                                 │
│  COMMENT ACTIONS (on each comment):                                            │
│  ───────────────────────────────────                                            │
│  [Pin] - Pin to top of discussion                                              │
│  [Heart] - Show creator appreciation                                           │
│  [Reply] - Reply as creator (highlighted)                                      │
│  [Hide] - Hide from public (creator can still see)                             │
│  [Delete] - Permanently remove                                                 │
│  [Ban User] - Ban from this discussion                                         │
│  [Report] - Escalate to platform moderators                                    │
│                                                                                 │
│  BANNED USERS:                                                                 │
│  ─────────────                                                                  │
│  @toxic_user - Banned 2 days ago [Unban]                                       │
│  @spammer123 - Banned 1 week ago [Unban]                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```
