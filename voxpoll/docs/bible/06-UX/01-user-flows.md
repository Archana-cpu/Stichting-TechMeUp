# User Flows

> Source: bible-022.md (Sections 22.1-22.10)

This document defines all user flows, navigation patterns, and user journey specifications for VoxPoll.


# ═══════════════════════════════════════════════════════════════════════════════
# PLATFORM USER TYPES & ROLES MATRIX
# ═══════════════════════════════════════════════════════════════════════════════

## Complete User Type Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         VOXPOLL USER HIERARCHY                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  INDIVIDUAL USERS (B2C)                                                         │
│  ──────────────────────                                                         │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  FREE USER                                                               │   │
│  │  • Can participate in polls/tests                                        │   │
│  │  • Can create: 3 polls/day, 3 tests/week                                │   │
│  │  • PULSE/COMMENTS access: Only after participation                       │   │
│  │  • Can view results: Only for content they participated in              │   │
│  │  • Cannot create surveys                                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  PLUS USER ($4.99/mo)                                                    │   │
│  │  • All Free features +                                                   │   │
│  │  • Can create: 10 polls/day, 10 tests/week                              │   │
│  │  • PULSE/COMMENTS access: Without participation                          │   │
│  │  • Can view all public results                                          │   │
│  │  • Profile customization options                                        │   │
│  │  • Priority support                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  PREMIUM USER ($9.99/mo)                                                 │   │
│  │  • All Plus features +                                                   │   │
│  │  • Unlimited polls/tests                                                 │   │
│  │  • Pre-test support for polls                                           │   │
│  │  • Live Poll hosting (real-time events)                                 │   │
│  │  • Advanced analytics                                                    │   │
│  │  • Extended poll options (2-10)                                         │   │
│  │  • API access for personal use                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ORGANIZATION USERS (B2B)                                                       │
│  ─────────────────────────                                                      │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ORG OWNER                                                               │   │
│  │  • Full organization control                                             │   │
│  │  • Billing management                                                    │   │
│  │  • Can create/delete admins                                             │   │
│  │  • SSO configuration                                                     │   │
│  │  • API key management                                                    │   │
│  │  • White-label settings (Enterprise)                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ORG ADMIN                                                               │   │
│  │  • Member management                                                     │   │
│  │  • Survey creation and management                                        │   │
│  │  • View all org surveys/results                                         │   │
│  │  • Export data                                                           │   │
│  │  • Team/department management                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ORG ANALYST                                                             │   │
│  │  • View assigned surveys/results                                         │   │
│  │  • Export assigned data                                                  │   │
│  │  • Cannot create surveys                                                 │   │
│  │  • Read-only access to analytics                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ORG CREATOR                                                             │   │
│  │  • Create surveys (within limits)                                        │   │
│  │  • Manage own surveys                                                    │   │
│  │  • View results of own surveys                                           │   │
│  │  • Cannot access other members' surveys                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ORG MEMBER                                                              │   │
│  │  • Participate in org surveys                                            │   │
│  │  • View own responses                                                    │   │
│  │  • No creation rights                                                    │   │
│  │  • Part of target audience pool                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  PLATFORM ROLES                                                                 │
│  ───────────────                                                                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  PLATFORM ADMIN                                                          │   │
│  │  • Full system access                                                    │   │
│  │  • User moderation                                                       │   │
│  │  • Content moderation                                                    │   │
│  │  • System configuration                                                  │   │
│  │  • Analytics dashboard                                                   │   │
│  │  • Support tools                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  PLATFORM MODERATOR                                                      │   │
│  │  • Content review                                                        │   │
│  │  • Report handling                                                       │   │
│  │  • User warnings/bans                                                    │   │
│  │  • Comment moderation                                                    │   │
│  │  • Cannot access billing/system config                                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Permission Matrix by Role

```typescript
type Permission =
  | "CREATE_POLL"
  | "CREATE_EXTENDED_POLL"
  | "CREATE_LIVE_POLL"
  | "CREATE_TEST"
  | "CREATE_SURVEY"
  | "USE_PRETEST"
  | "PARTICIPATE_POLL"
  | "PARTICIPATE_SURVEY"
  | "PARTICIPATE_TEST"
  | "VIEW_RESULTS_OWN"
  | "VIEW_RESULTS_ALL"
  | "PULSE_COMMENTS_ACCESS_PARTICIPATED"
  | "PULSE_COMMENTS_ACCESS_ALL"
  | "ORG_MANAGE_MEMBERS"
  | "ORG_MANAGE_BILLING"
  | "ORG_MANAGE_SSO"
  | "ORG_MANAGE_SETTINGS"
  | "ORG_VIEW_ALL_SURVEYS"
  | "ORG_EXPORT_DATA"
  | "ORG_CREATE_SURVEYS"
  | "ADMIN_MODERATE_CONTENT"
  | "ADMIN_MODERATE_USERS"
  | "ADMIN_VIEW_ANALYTICS"
  | "ADMIN_SYSTEM_CONFIG"

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  FREE: [
    "CREATE_POLL",
    "CREATE_TEST",
    "PARTICIPATE_POLL",
    "PARTICIPATE_SURVEY",
    "PARTICIPATE_TEST",
    "VIEW_RESULTS_OWN",
    "PULSE_COMMENTS_ACCESS_PARTICIPATED"
  ],

  PLUS: [
    "CREATE_POLL",
    "CREATE_EXTENDED_POLL",
    "CREATE_TEST",
    "PARTICIPATE_POLL",
    "PARTICIPATE_SURVEY",
    "PARTICIPATE_TEST",
    "VIEW_RESULTS_OWN",
    "VIEW_RESULTS_ALL",
    "PULSE_COMMENTS_ACCESS_PARTICIPATED",
    "PULSE_COMMENTS_ACCESS_ALL"
  ],

  PREMIUM: [
    "CREATE_POLL",
    "CREATE_EXTENDED_POLL",
    "CREATE_LIVE_POLL",
    "CREATE_TEST",
    "USE_PRETEST",
    "PARTICIPATE_POLL",
    "PARTICIPATE_SURVEY",
    "PARTICIPATE_TEST",
    "VIEW_RESULTS_OWN",
    "VIEW_RESULTS_ALL",
    "PULSE_COMMENTS_ACCESS_PARTICIPATED",
    "PULSE_COMMENTS_ACCESS_ALL"
  ],

  ORG_OWNER: [
    "ORG_MANAGE_MEMBERS",
    "ORG_MANAGE_BILLING",
    "ORG_MANAGE_SSO",
    "ORG_MANAGE_SETTINGS",
    "ORG_VIEW_ALL_SURVEYS",
    "ORG_EXPORT_DATA",
    "ORG_CREATE_SURVEYS"
  ],

  ORG_ADMIN: [
    "ORG_MANAGE_MEMBERS",
    "ORG_VIEW_ALL_SURVEYS",
    "ORG_EXPORT_DATA",
    "ORG_CREATE_SURVEYS"
  ],

  ORG_ANALYST: [
    "ORG_EXPORT_DATA"
  ],

  ORG_CREATOR: [
    "ORG_CREATE_SURVEYS"
  ],

  ORG_MEMBER: [],

  PLATFORM_ADMIN: [
    "ADMIN_MODERATE_CONTENT",
    "ADMIN_MODERATE_USERS",
    "ADMIN_VIEW_ANALYTICS",
    "ADMIN_SYSTEM_CONFIG"
  ],

  PLATFORM_MODERATOR: [
    "ADMIN_MODERATE_CONTENT",
    "ADMIN_MODERATE_USERS"
  ]
}

export { ROLE_PERMISSIONS }
export type { Permission }
```


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE STRUCTURE & NAVIGATION
# ═══════════════════════════════════════════════════════════════════════════════

## Complete Page Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         VOXPOLL PAGE STRUCTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PUBLIC PAGES (No Auth Required)                                                │
│  ═══════════════════════════════                                                │
│                                                                                 │
│  /                           → Landing Page                                     │
│  /login                      → Login Page                                       │
│  /register                   → Registration Page                                │
│  /forgot-password            → Password Reset Request                           │
│  /reset-password/:token      → Password Reset Form                              │
│  /verify-email/:token        → Email Verification                               │
│  /verify-phone               → Phone Verification                               │
│                                                                                 │
│  /p/:contentId               → Public Poll/Test View                            │
│  /share/:code                → Private Link Access                              │
│  /live/:joinCode             → Live Poll Join                                   │
│  /embed/:contentId           → Embed View (iframe)                              │
│                                                                                 │
│  /explore                    → Public Content Discovery                         │
│  /explore/polls              → Browse Polls                                     │
│  /explore/tests              → Browse Tests                                     │
│  /explore/trending           → Trending Content                                 │
│                                                                                 │
│  /u/:username                → Public User Profile                              │
│  /u/:username/badges         → User's Badge Collection                          │
│  /u/:username/created        → User's Created Content                           │
│                                                                                 │
│  /pricing                    → Pricing Page (B2C)                               │
│  /business                   → B2B Landing Page                                 │
│  /about                      → About Page                                       │
│  /privacy                    → Privacy Policy                                   │
│  /terms                      → Terms of Service                                 │
│  /help                       → Help Center                                      │
│                                                                                 │
│  AUTHENTICATED PAGES (Auth Required)                                            │
│  ═══════════════════════════════════                                            │
│                                                                                 │
│  /feed                       → Personalized Feed (Home)                         │
│  /feed/following             → Content from Followed Users                      │
│  /feed/discover              → Algorithmic Recommendations                      │
│                                                                                 │
│  /create                     → Content Creation Hub                             │
│  /create/poll                → Quick Poll Creator                               │
│  /create/poll/extended       → Extended Poll Creator                            │
│  /create/poll/live           → Live Poll Creator (Premium)                      │
│  /create/test                → Personality Test Creator                         │
│                                                                                 │
│  /my                         → User Dashboard                                   │
│  /my/content                 → My Created Content                               │
│  /my/content/:id             → Content Management View                          │
│  /my/content/:id/analytics   → Content Analytics                                │
│  /my/content/:id/pulse       → Content PULSE + COMMENTS Management              │
│  /my/participated            → Participation History                            │
│  /my/badges                  → Badge Collection                                 │
│  /my/saved                   → Saved Content                                    │
│                                                                                 │
│  /settings                   → Account Settings Hub                             │
│  /settings/profile           → Profile Settings                                 │
│  /settings/account           → Account & Security                               │
│  /settings/privacy           → Privacy Settings                                 │
│  /settings/notifications     → Notification Preferences                         │
│  /settings/subscription      → Subscription Management                          │
│  /settings/data              → Data Export/Delete                               │
│                                                                                 │
│  /notifications              → Notification Center                              │
│                                                                                 │
│  PULSE + COMMENTS PAGES                                                         │
│  ═══════════════════                                                            │
│                                                                                 │
│  /pulse/:contentId           → PULSE View (Results + COMMENTS)                  │
│  /pulse/:contentId/results   → Results Only View                                │
│  /pulse/:contentId/discuss   → Discussion Only View                             │
│                                                                                 │
│  ORGANIZATION PAGES (Org Members)                                               │
│  ═══════════════════════════════                                                │
│                                                                                 │
│  /org                        → Organization Dashboard                           │
│  /org/surveys                → Organization Surveys List                        │
│  /org/surveys/new            → Create New Survey                                │
│  /org/surveys/:id            → Survey Detail View                               │
│  /org/surveys/:id/edit       → Survey Builder/Editor                            │
│  /org/surveys/:id/preview    → Survey Preview                                   │
│  /org/surveys/:id/analytics  → Survey Analytics                                 │
│  /org/surveys/:id/responses  → Response Viewer                                  │
│  /org/surveys/:id/export     → Export Options                                   │
│                                                                                 │
│  /org/members                → Member Management                                │
│  /org/members/invite         → Invite Members                                   │
│  /org/teams                  → Team/Department Management                       │
│                                                                                 │
│  /org/settings               → Organization Settings                            │
│  /org/settings/general       → General Settings                                 │
│  /org/settings/branding      → Branding/White-label                             │
│  /org/settings/sso           → SSO Configuration                                │
│  /org/settings/api           → API Keys                                         │
│  /org/settings/billing       → Billing & Subscription                           │
│                                                                                 │
│  /org/analytics              → Organization-wide Analytics                      │
│                                                                                 │
│  ADMIN PAGES (Platform Staff)                                                   │
│  ═══════════════════════════                                                    │
│                                                                                 │
│  /admin                      → Admin Dashboard                                  │
│  /admin/users                → User Management                                  │
│  /admin/users/:id            → User Detail View                                 │
│  /admin/content              → Content Moderation Queue                         │
│  /admin/reports              → User Reports                                     │
│  /admin/organizations        → Organization Management                          │
│  /admin/analytics            → Platform Analytics                               │
│  /admin/settings             → System Settings                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Navigation Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         NAVIGATION COMPONENTS                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  TOP NAVIGATION BAR (Desktop)                                                   │
│  ════════════════════════════                                                   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Logo]   [Feed ▼]  [Explore ▼]  [Create ▼]    🔍    🔔   [Avatar ▼]   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Dropdown Menus:                                                                │
│                                                                                 │
│  [Feed ▼]                    [Explore ▼]              [Create ▼]               │
│  ├─ For You                  ├─ Trending              ├─ Quick Poll             │
│  ├─ Following                ├─ Polls                 ├─ Extended Poll          │
│  └─ Discover                 ├─ Tests                 ├─ Personality Test       │
│                              └─ Categories            └─ Live Poll (Premium)    │
│                                                                                 │
│  [Avatar ▼]                                                                     │
│  ├─ My Profile                                                                  │
│  ├─ My Content                                                                  │
│  ├─ Badges                                                                      │
│  ├─ Settings                                                                    │
│  ├─ ─────────                                                                   │
│  ├─ [Organization] (if member)                                                  │
│  ├─ ─────────                                                                   │
│  ├─ Help                                                                        │
│  └─ Log Out                                                                     │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  BOTTOM NAVIGATION BAR (Mobile)                                                 │
│  ══════════════════════════════                                                 │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │   🏠         🔍         ➕         🔔         👤                        │   │
│  │  Feed     Explore    Create   Notifs    Profile                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  ORGANIZATION SIDEBAR (Desktop - Org Dashboard)                                 │
│  ═════════════════════════════════════════════                                  │
│                                                                                 │
│  ┌───────────────────────────┐                                                  │
│  │  [Org Logo]               │                                                  │
│  │  Acme Corporation         │                                                  │
│  │  ─────────────────────────│                                                  │
│  │  📊 Dashboard             │                                                  │
│  │  📋 Surveys               │                                                  │
│  │  👥 Members               │                                                  │
│  │  📈 Analytics             │                                                  │
│  │  ⚙️ Settings              │                                                  │
│  │  ─────────────────────────│                                                  │
│  │  🔙 Back to VoxPoll       │                                                  │
│  └───────────────────────────┘                                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION FLOWS
# ═══════════════════════════════════════════════════════════════════════════════

## Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         REGISTRATION FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │   STEP 1: ENTRY POINT                                                     │ │
│  │   ──────────────────                                                      │ │
│  │                                                                           │ │
│  │   User arrives at /register from:                                         │ │
│  │   • Direct navigation                                                     │ │
│  │   • "Sign up" CTA on landing page                                         │ │
│  │   • "Create account to continue" prompt after participating               │ │
│  │   • Social share invitation                                               │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                              │                                                  │
│                              ▼                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │   STEP 2: BASIC REGISTRATION                                              │ │
│  │   ──────────────────────────                                              │ │
│  │                                                                           │ │
│  │   ┌─────────────────────────────────────────────────────────────────────┐│ │
│  │   │                       Create Account                                 ││ │
│  │   │                                                                      ││ │
│  │   │   [Google Sign In]  [Apple Sign In]                                  ││ │
│  │   │                                                                      ││ │
│  │   │   ─────────── OR ───────────                                         ││ │
│  │   │                                                                      ││ │
│  │   │   Username:    [________________]                                    ││ │
│  │   │   Email:       [________________]                                    ││ │
│  │   │   Password:    [________________]                                    ││ │
│  │   │                                                                      ││ │
│  │   │   ☐ I agree to Terms of Service and Privacy Policy                  ││ │
│  │   │                                                                      ││ │
│  │   │   [Create Account]                                                   ││ │
│  │   │                                                                      ││ │
│  │   │   Already have an account? [Log in]                                  ││ │
│  │   └─────────────────────────────────────────────────────────────────────┘│ │
│  │                                                                           │ │
│  │   Validation:                                                             │ │
│  │   • Username: 3-30 chars, alphanumeric + underscore                      │ │
│  │   • Email: Valid format, not already registered                          │ │
│  │   • Password: Min 10 chars, 3 of 4 character classes                     │ │
│  │     (lowercase, uppercase, digit, special character)                     │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                              │                                                  │
│                              ▼                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │   STEP 3: PHONE VERIFICATION [REQUIRED]                                   │ │
│  │   ─────────────────────────────────────                                   │ │
│  │                                                                           │ │
│  │   ┌─────────────────────────────────────────────────────────────────────┐│ │
│  │   │                    Verify Your Phone                                 ││ │
│  │   │                                                                      ││ │
│  │   │   We need to verify your phone number to ensure                      ││ │
│  │   │   data quality and prevent fake accounts.                            ││ │
│  │   │                                                                      ││ │
│  │   │   Phone: [+90] [_______________]                                     ││ │
│  │   │                                                                      ││ │
│  │   │   [Send Verification Code]                                           ││ │
│  │   │                                                                      ││ │
│  │   │   ─────────────────────────────────────────────────────────────────  ││ │
│  │   │                                                                      ││ │
│  │   │   Enter the 6-digit code sent to your phone:                         ││ │
│  │   │                                                                      ││ │
│  │   │   [_] [_] [_] [_] [_] [_]                                            ││ │
│  │   │                                                                      ││ │
│  │   │   [Verify]                                                           ││ │
│  │   │                                                                      ││ │
│  │   │   Didn't receive code? [Resend] (59s)                                ││ │
│  │   └─────────────────────────────────────────────────────────────────────┘│ │
│  │                                                                           │ │
│  │   Phone verification is REQUIRED for all accounts                        │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                              │                                                  │
│                              ▼                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │   STEP 4: PROFILE SETUP (Required Demographics)                           │ │
│  │   ──────────────────────────────────────────────                          │ │
│  │                                                                           │ │
│  │   ┌─────────────────────────────────────────────────────────────────────┐│ │
│  │   │                    Complete Your Profile                             ││ │
│  │   │                                                                      ││ │
│  │   │   This information helps us match you with relevant                  ││ │
│  │   │   content and ensure data quality.                                   ││ │
│  │   │                                                                      ││ │
│  │   │   Birth Year: [____] (Required - locked after setup)                 ││ │
│  │   │                                                                      ││ │
│  │   │   Gender: ○ Male  ○ Female  ○ Other  ○ Prefer not to say           ││ │
│  │   │          (Required - locked after setup)                             ││ │
│  │   │                                                                      ││ │
│  │   │   Country: [Select Country ▼] (Required - locked after setup)        ││ │
│  │   │                                                                      ││ │
│  │   │   City: [________________] (Optional)                                ││ │
│  │   │                                                                      ││ │
│  │   │   [Continue]                                                         ││ │
│  │   │                                                                      ││ │
│  │   │   Birth year, gender, and country cannot be changed after setup      ││ │
│  │   └─────────────────────────────────────────────────────────────────────┘│ │
│  │                                                                           │ │
│  │   Demographics are LOCKED after registration                             │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                              │                                                  │
│                              ▼                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │   STEP 5: INTERESTS (Optional)                                            │ │
│  │   ─────────────────────────────                                           │ │
│  │                                                                           │ │
│  │   ┌─────────────────────────────────────────────────────────────────────┐│ │
│  │   │                    What interests you?                               ││ │
│  │   │                                                                      ││ │
│  │   │   Select topics to personalize your feed:                            ││ │
│  │   │                                                                      ││ │
│  │   │   [Technology] [Politics] [Sports] [Entertainment]                   ││ │
│  │   │   [Science] [Business] [Health] [Gaming]                             ││ │
│  │   │   [Music] [Movies] [Food] [Travel]                                   ││ │
│  │   │   [Fashion] [Art] [Books] [Fitness]                                  ││ │
│  │   │                                                                      ││ │
│  │   │   [Continue]    [Skip for now]                                       ││ │
│  │   └─────────────────────────────────────────────────────────────────────┘│ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                              │                                                  │
│                              ▼                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │   STEP 6: WELCOME & REDIRECT                                              │ │
│  │   ──────────────────────────                                              │ │
│  │                                                                           │ │
│  │   ┌─────────────────────────────────────────────────────────────────────┐│ │
│  │   │                                                                      ││ │
│  │   │               Welcome to VoxPoll!                                    ││ │
│  │   │                                                                      ││ │
│  │   │   Your account is ready. Here's what you can do:                     ││ │
│  │   │                                                                      ││ │
│  │   │   • Participate in polls and tests                                   ││ │
│  │   │   • Create your own polls                                            ││ │
│  │   │   • Collect badges and share results                                 ││ │
│  │   │   • Join discussions with other participants                         ││ │
│  │   │                                                                      ││ │
│  │   │   [Start Exploring]  [Create Your First Poll]                        ││ │
│  │   │                                                                      ││ │
│  │   └─────────────────────────────────────────────────────────────────────┘│ │
│  │                                                                           │ │
│  │   Redirect Logic:                                                         │ │
│  │   • If came from content -> return to that content                        │ │
│  │   • If came from invite -> go to invited content                          │ │
│  │   • Otherwise -> go to /feed                                              │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Login Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           Log In                                         │   │
│  │                                                                          │   │
│  │   [Google Sign In]  [Apple Sign In]                                      │   │
│  │                                                                          │   │
│  │   ─────────── OR ───────────                                             │   │
│  │                                                                          │   │
│  │   Email or Username: [________________]                                  │   │
│  │   Password:          [________________]                                  │   │
│  │                                                                          │   │
│  │   ☐ Remember me                     [Forgot password?]                   │   │
│  │                                                                          │   │
│  │   [Log In]                                                               │   │
│  │                                                                          │   │
│  │   Don't have an account? [Sign up]                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Error States:                                                                  │
│  • Invalid credentials -> "Email/username or password is incorrect"            │
│  • Account locked -> "Account locked. Please contact support."                 │
│  • Unverified email -> "Please verify your email first. [Resend]"              │
│                                                                                 │
│  Post-Login Redirect:                                                           │
│  • Stored return URL -> redirect there                                          │
│  • Organization member with pending survey -> org dashboard                     │
│  • Default -> /feed                                                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# CONTENT CREATION FLOWS
# ═══════════════════════════════════════════════════════════════════════════════

## Quick Poll Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      QUICK POLL CREATION FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ENTRY: /create/poll                                                            │
│                                                                                 │
│  STEP 1: Question                                                               │
│  ─────────────────                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Create Quick Poll                                   │   │
│  │                                                                          │   │
│  │   Question:                                                              │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │                                                                 │   │   │
│  │   │  What's the best programming language for beginners?           │   │   │
│  │   │                                                                 │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │   0/280 characters                                                       │   │
│  │                                                                          │   │
│  │   Options:                                                               │   │
│  │   • Free/Plus: 2-4 options (Quick Poll)                                  │   │
│  │   • Premium/Org: 2-10 options (Extended Poll)                            │   │
│  │   [1] [Python________________] x                                         │   │
│  │   [2] [JavaScript____________] x                                         │   │
│  │   [3] [Scratch_______________] x                                         │   │
│  │   [4] [_____________________] x                                          │   │
│  │   [+ Add option] (max based on tier)                                     │   │
│  │                                                                          │   │
│  │   Duration: [24 hours ▼]  1h | 6h | 12h | 24h | 3d | 7d                  │   │
│  │                                                                          │   │
│  │   Visibility: ○ Public  ○ Private (link only)                           │   │
│  │                                                                          │   │
│  │   [Preview] [Publish Poll]                                               │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Validation:                                                                    │
│  • Question: 10-500 characters                                                  │
│  • Options: 2-4 (Free/Plus) or 2-10 (Premium/Org), 1-200 chars each, unique    │
│  • Duration: Required (min 1h, max 30 days)                                    │
│  • Visibility: Required                                                         │
│                                                                                 │
│  Free User Limit Check:                                                         │
│  • If 3 polls created today -> Show upgrade prompt                              │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  STEP 2: Preview & Confirm                                                      │
│  ──────────────────────────                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Preview                                           │   │
│  │                                                                          │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │  What's the best programming language for beginners?            │   │   │
│  │   │                                                                 │   │   │
│  │   │  ○ Python                                                       │   │   │
│  │   │  ○ JavaScript                                                   │   │   │
│  │   │  ○ Scratch                                                      │   │   │
│  │   │                                                                 │   │   │
│  │   │  24 hours  •  Public                                            │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │   Polls cannot be edited after publishing                                │   │
│  │                                                                          │   │
│  │   [<- Edit] [Publish Now]                                                │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  STEP 3: Published Confirmation                                                 │
│  ───────────────────────────────                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Poll Published!                                       │   │
│  │                                                                          │   │
│  │   Your poll is now live and accepting votes.                             │   │
│  │                                                                          │   │
│  │   Share it:                                                              │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │  voxpoll.com/p/clx7k9m2a000...                    [Copy]        │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │   [Twitter] [WhatsApp] [Telegram] [More...]                              │   │
│  │                                                                          │   │
│  │   [View Poll]  [Create Another]                                          │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Personality Test Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PERSONALITY TEST CREATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STEP 1: Test Basic Info                                                        │
│  ───────────────────────                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                  Create Personality Test                                 │   │
│  │                                                                          │   │
│  │   Title:                                                                 │   │
│  │   [What Type of Leader Are You?_____________________________]            │   │
│  │                                                                          │   │
│  │   Description:                                                           │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │ Discover your leadership style and learn how to leverage       │   │   │
│  │   │ your strengths in team environments.                           │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │   Cover Image: [Upload Image] or [Choose from Gallery]                   │   │
│  │                                                                          │   │
│  │   Category: [Personality ▼]                                              │   │
│  │                                                                          │   │
│  │   Result Type: ○ Categories (e.g., "You are a Visionary")               │   │
│  │                ○ Spectrum (e.g., "70% Introvert - 30% Extrovert")       │   │
│  │                ○ Score (e.g., "Leadership Score: 85/100")                │   │
│  │                                                                          │   │
│  │   [Continue ->]                                                          │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  STEP 2: Define Results (for Category type)                                     │
│  ───────────────────────────────────────────                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Define Result Categories                              │   │
│  │                                                                          │   │
│  │   Create the possible results users can get:                             │   │
│  │                                                                          │   │
│  │   Result 1:                                                              │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │  Name: [The Visionary_______________________________]           │   │   │
│  │   │  Description: [You see the big picture and inspire others...]   │   │   │
│  │   │  Image: [Upload]                                                │   │   │
│  │   │  Color: [Purple ▼]                                              │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │   Result 2:                                                              │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │  Name: [The Diplomat_______________________________]            │   │   │
│  │   │  Description: [You excel at building relationships...]         │   │   │
│  │   │  Image: [Upload]                                                │   │   │
│  │   │  Color: [Blue ▼]                                                │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │   [+ Add Result Category]                                                │   │
│  │                                                                          │   │
│  │   Min: 2 results  |  Max: 10 results                                     │   │
│  │                                                                          │   │
│  │   [<- Back] [Continue ->]                                                │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  STEP 3: Create Questions                                                       │
│  ────────────────────────                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Add Questions                                         │   │
│  │                                                                          │   │
│  │   Question 1 of 5:                                                       │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │  When facing a crisis, you typically:                           │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │   Options (map to results):                                              │   │
│  │   ┌──────────────────────────────────────────────┬──────────────────┐   │   │
│  │   │  Take charge and make quick decisions        │ -> Visionary     │   │   │
│  │   └──────────────────────────────────────────────┴──────────────────┘   │   │
│  │   ┌──────────────────────────────────────────────┬──────────────────┐   │   │
│  │   │  Consult with everyone before acting         │ -> Diplomat      │   │   │
│  │   └──────────────────────────────────────────────┴──────────────────┘   │   │
│  │   ┌──────────────────────────────────────────────┬──────────────────┐   │   │
│  │   │  Analyze the data carefully                  │ -> Analyst       │   │   │
│  │   └──────────────────────────────────────────────┴──────────────────┘   │   │
│  │   [+ Add option]                                                         │   │
│  │                                                                          │   │
│  │   [<- Previous] [Save & Next ->]                                         │   │
│  │                                                                          │   │
│  │   Progress: 1/5 questions                                                │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Minimum questions: 5  |  Maximum: 50                                           │
│                                                                                 │
│  STEP 4: Settings & Preview                                                     │
│  ───────────────────────────                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Test Settings                                         │   │
│  │                                                                          │   │
│  │   Visibility: ○ Public (appears in explore)                             │   │
│  │               ○ Unlisted (link only)                                    │   │
│  │                                                                          │   │
│  │   Badge Settings:                                                        │   │
│  │   [x] Award badge upon completion                                        │   │
│  │   [x] Show result on user's profile (if they choose)                     │   │
│  │                                                                          │   │
│  │   Result Display:                                                        │   │
│  │   [x] Show how user compares to others                                   │   │
│  │   [x] Show demographic breakdown                                         │   │
│  │                                                                          │   │
│  │   Discussion:                                                            │   │
│  │   [x] Enable COMMENTS discussion                                         │   │
│  │   [x] Only participants can comment                                      │   │
│  │                                                                          │   │
│  │   [Preview Test] [Publish]                                               │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# CONTENT PARTICIPATION FLOWS
# ═══════════════════════════════════════════════════════════════════════════════

## Poll Participation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      POLL PARTICIPATION FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ENTRY: /p/:pollId                                                              │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │  STATE: User views active poll                                            │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                                                                     │ │ │
│  │  │  What's the best programming language for beginners?               │ │ │
│  │  │                                                                     │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────────┐   │ │ │
│  │  │  │  ○ Python                                                   │   │ │ │
│  │  │  └─────────────────────────────────────────────────────────────┘   │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────────┐   │ │ │
│  │  │  │  ○ JavaScript                                               │   │ │ │
│  │  │  └─────────────────────────────────────────────────────────────┘   │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────────┐   │ │ │
│  │  │  │  ○ Scratch                                                  │   │ │ │
│  │  │  └─────────────────────────────────────────────────────────────┘   │ │ │
│  │  │                                                                     │ │ │
│  │  │  [Vote]                                                             │ │ │
│  │  │                                                                     │ │ │
│  │  │  ─────────────────────────────────────────────────────────────────  │ │ │
│  │  │  @creator_name  •  18h remaining  •  Public                        │ │ │
│  │  │                                                                     │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                              │                                                  │
│                    User clicks option                                           │
│                              │                                                  │
│                              ▼                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │  STATE: Vote submitted - Results revealed                                 │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                                                                     │ │ │
│  │  │  You voted for Python                                               │ │ │
│  │  │                                                                     │ │ │
│  │  │  Python      ████████████████████████████████        58%  (2,341)   │ │ │
│  │  │  JavaScript  ████████████████                        29%  (1,172)   │ │ │
│  │  │  Scratch     █████                                   13%  (526)     │ │ │
│  │  │                                                                     │ │ │
│  │  │  ─────────────────────────────────────────────────────────────────  │ │ │
│  │  │                                                                     │ │ │
│  │  │  4,039 total votes  •  Reliability: 72/100                          │ │ │
│  │  │                                                                     │ │ │
│  │  │  [Share My Vote] [View Discussion ->]                               │ │ │
│  │  │                                                                     │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  STATES SUMMARY:                                                                │
│  • Not logged in -> Prompt to login/register OR allow anonymous vote            │
│  • Already voted -> Show results directly                                       │
│  • Poll ended -> Show PULSE + COMMENTS                                          │
│  • Poll has pre-test -> Show pre-test first (Premium creator feature)           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Survey Participation Flow (Organization)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SURVEY PARTICIPATION FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ENTRY: User receives survey invitation via:                                    │
│  • Email link (org internal survey)                                             │
│  • SSO dashboard notification                                                   │
│  • Direct link from organization                                                │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  STEP 1: Authentication (if not already logged in via SSO)                      │
│  ────────────────────────────────────────────────────────                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │   [Acme Corp Logo]                                                       │   │
│  │                                                                          │   │
│  │   Employee Satisfaction Survey 2026                                      │   │
│  │                                                                          │   │
│  │   Please log in with your company credentials                            │   │
│  │   to participate in this survey.                                         │   │
│  │                                                                          │   │
│  │   [Sign in with Acme SSO]                                                │   │
│  │                                                                          │   │
│  │   Your responses are completely anonymous                                │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  STEP 2: Pre-test (if configured)                                               │
│  ─────────────────────────────────                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │   Before you begin...                                                    │   │
│  │                                                                          │   │
│  │   Please confirm the following to ensure you're in the                   │   │
│  │   target audience for this survey:                                       │   │
│  │                                                                          │   │
│  │   1. What department are you in?                                         │   │
│  │      ○ Engineering  ○ Marketing  ○ Sales  ○ Operations  ○ Other         │   │
│  │                                                                          │   │
│  │   2. How long have you worked at Acme?                                   │   │
│  │      ○ < 1 year  ○ 1-3 years  ○ 3-5 years  ○ 5+ years                   │   │
│  │                                                                          │   │
│  │   [Continue ->]                                                          │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  STEP 3: Survey Introduction                                                    │
│  ───────────────────────────                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │   Employee Satisfaction Survey 2026                                      │   │
│  │                                                                          │   │
│  │   Thank you for participating in our annual survey. Your                 │   │
│  │   feedback helps us improve the workplace for everyone.                  │   │
│  │                                                                          │   │
│  │   20 questions  •  ~10 minutes                                           │   │
│  │                                                                          │   │
│  │   Anonymity Guarantee                                                    │   │
│  │   Your responses cannot be linked to your identity. We use               │   │
│  │   cryptographic separation to ensure complete anonymity.                 │   │
│  │   [Learn how we protect your privacy]                                    │   │
│  │                                                                          │   │
│  │   [Begin Survey ->]                                                      │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  STEP 4: Survey Questions (Progressive)                                         │
│  ───────────────────────────────────────                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Progress: 8/20                                                          │   │
│  │                                                                          │   │
│  │  SECTION: Work Environment                                               │   │
│  │                                                                          │   │
│  │  Q8. I feel valued for my contributions at work.                         │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │ Strongly    Disagree    Neutral    Agree    Strongly           │    │   │
│  │  │ Disagree                                     Agree              │    │   │
│  │  │    ○           ○          ○         ●          ○               │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  [<- Previous]                                      [Next ->]            │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────   │   │
│  │  [Save & Continue Later]                                                 │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  STEP 5: Attention Check (random insertion)                                     │
│  ──────────────────────────────────────────                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │  Q12. Please select "Agree" to continue.                                 │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │ Strongly    Disagree    Neutral    Agree    Strongly           │    │   │
│  │  │ Disagree                                     Agree              │    │   │
│  │  │    ○           ○          ○         ○          ○               │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  [<- Previous]                                      [Next ->]            │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  STEP 6: Survey Completion                                                      │
│  ─────────────────────────                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │   Survey Completed                                                       │   │
│  │                                                                          │   │
│  │   Thank you for your feedback!                                           │   │
│  │                                                                          │   │
│  │   Your anonymous response has been recorded. Results will                │   │
│  │   be shared with all employees once the survey closes.                   │   │
│  │                                                                          │   │
│  │   Survey closes: January 31, 2026                                        │   │
│  │   Current participation: 847 / 1,200 employees (71%)                     │   │
│  │                                                                          │   │
│  │   [Return to Dashboard]                                                  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# PULSE + COMMENTS (RESULTS + DISCUSSION)
# ═══════════════════════════════════════════════════════════════════════════════

## PULSE + COMMENTS Entry and Navigation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PULSE + COMMENTS FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ENTRY POINTS:                                                                  │
│  • After poll/test completion -> Auto-redirect                                  │
│  • "View Discussion" button on results                                          │
│  • Direct link: /pulse/:contentId                                               │
│  • Notification about new activity                                              │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  PULSE + COMMENTS LAYOUT (Desktop):                                             │
│  ─────────────────────────                                                      │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────┬─────────────────────────────────┐  │   │
│  │  │                                 │                                 │  │   │
│  │  │     RESULTS VISUALIZATION       │        DISCUSSION FORUM         │  │   │
│  │  │                                 │                                 │  │   │
│  │  │  ┌───────────────────────────┐ │  ┌───────────────────────────┐  │  │   │
│  │  │  │                           │ │  │ Sort: [Hot ▼]             │  │  │   │
│  │  │  │   Spotify-Wrap Style      │ │  │                           │  │  │   │
│  │  │  │   Animated Results        │ │  │ ┌─────────────────────┐   │  │  │   │
│  │  │  │                           │ │  │ │ @creator: Thanks    │   │  │  │   │
│  │  │  │   [Charts & Graphs]       │ │  │ │ for participating!  │   │  │  │   │
│  │  │  │   [Your Result]           │ │  │ └─────────────────────┘   │  │  │   │
│  │  │  │   [Demographic Stats]     │ │  │                           │  │  │   │
│  │  │  │                           │ │  │ ┌─────────────────────┐   │  │  │   │
│  │  │  └───────────────────────────┘ │  │ │ @user1: I voted for │   │  │  │   │
│  │  │                                 │  │ │ Python because...    │   │  │  │   │
│  │  │  [Share Result Card]            │  │ │ 45  3  12            │   │  │  │   │
│  │  │                                 │  │ └─────────────────────┘   │  │  │   │
│  │  │  ─────────────────────────────  │  │                           │  │  │   │
│  │  │                                 │  │ ┌─────────────────────┐   │  │  │   │
│  │  │  Reliability: 78/100            │  │ │ @user2: JavaScript  │   │  │  │   │
│  │  │  [View Methodology]             │  │ │ is more versatile   │   │  │  │   │
│  │  │                                 │  │ │ 32  8  8             │   │  │  │   │
│  │  │                                 │  │ └─────────────────────┘   │  │  │   │
│  │  │                                 │  │                           │  │  │   │
│  │  │                                 │  │ ┌─────────────────────┐   │  │  │   │
│  │  │                                 │  │ │ Write a comment...  │   │  │  │   │
│  │  │                                 │  │ └─────────────────────┘   │  │  │   │
│  │  │                                 │  │                           │  │  │   │
│  │  └─────────────────────────────────┴─────────────────────────────────┘  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  ACCESS CONTROL CHECK:                                                          │
│  ────────────────────                                                           │
│                                                                                 │
│  If user has NOT participated:                                                  │
│  • Free tier -> Show "Participate to unlock" overlay                            │
│  • Plus/Premium tier -> Full access                                             │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │          Participate to Unlock                                           │   │
│  │                                                                          │   │
│  │   Join the discussion after sharing your opinion!                        │   │
│  │                                                                          │   │
│  │   [Vote Now]    or    [Upgrade to Plus]                                  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# MOBILE-SPECIFIC FLOWS
# ═══════════════════════════════════════════════════════════════════════════════

## Mobile Navigation & Gestures

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      MOBILE NAVIGATION                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  BOTTOM TAB BAR (Always visible):                                               │
│  ═══════════════════════════════                                                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │   Home      Explore     Create     Notifs      Profile                   │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Tab Behaviors:                                                                 │
│  • Single tap: Navigate to tab                                                  │
│  • Double tap: Scroll to top / Refresh                                          │
│  • Long press on Create: Show quick actions menu                               │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  GESTURE NAVIGATION:                                                            │
│  ════════════════════                                                           │
│                                                                                 │
│  • Swipe left/right on feed items: Quick actions (save, share)                 │
│  • Swipe down on feed: Pull to refresh                                          │
│  • Swipe up on poll options: Submit vote                                       │
│  • Swipe right from edge: Go back                                              │
│  • Long press on content: Share menu                                           │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  CREATE QUICK ACTION SHEET (Long press on Create):                              │
│  ═════════════════════════════════════════════════                              │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                           Create                                         │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Quick Poll                                                       │   │   │
│  │  │  Simple yes/no or multiple choice                                │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Extended Poll                   [Premium]                        │   │   │
│  │  │  More options, images, pre-test                                  │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Personality Test                                                 │   │   │
│  │  │  Multi-question with results                                     │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Live Poll                        [Premium]                       │   │   │
│  │  │  Real-time voting for events                                     │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  [Cancel]                                                                │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Mobile Poll Experience

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      MOBILE POLL VIEW                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────────────────┐                                           │
│  │ <-                    ...   Share │  Status Bar                              │
│  ├──────────────────────────────────┤                                           │
│  │                                  │                                           │
│  │  @creator_username               │                                           │
│  │                                  │                                           │
│  │  What's the best                 │                                           │
│  │  programming language            │                                           │
│  │  for beginners?                  │                                           │
│  │                                  │                                           │
│  │  ┌────────────────────────────┐  │                                           │
│  │  │                            │  │                                           │
│  │  │   ○  Python               │  │  Touch target: 48px min                   │
│  │  │                            │  │                                           │
│  │  └────────────────────────────┘  │                                           │
│  │                                  │                                           │
│  │  ┌────────────────────────────┐  │                                           │
│  │  │                            │  │                                           │
│  │  │   ○  JavaScript           │  │                                           │
│  │  │                            │  │                                           │
│  │  └────────────────────────────┘  │                                           │
│  │                                  │                                           │
│  │  ┌────────────────────────────┐  │                                           │
│  │  │                            │  │                                           │
│  │  │   ○  Scratch              │  │                                           │
│  │  │                            │  │                                           │
│  │  └────────────────────────────┘  │                                           │
│  │                                  │                                           │
│  │          [  Vote  ]              │  CTA Button                               │
│  │                                  │                                           │
│  │  ─────────────────────────────   │                                           │
│  │                                  │                                           │
│  │  18h remaining  •  4,039 votes   │                                           │
│  │                                  │                                           │
│  ├──────────────────────────────────┤                                           │
│  │  Home  Explore  +  Notifs  Me    │  Bottom Nav                               │
│  └──────────────────────────────────┘                                           │
│                                                                                 │
│  After voting (results screen):                                                 │
│  ┌──────────────────────────────────┐                                           │
│  │ <-  Results             Share    │                                           │
│  ├──────────────────────────────────┤                                           │
│  │                                  │                                           │
│  │  You voted: Python               │                                           │
│  │                                  │                                           │
│  │  Python                          │                                           │
│  │  ████████████████████      58%   │                                           │
│  │  2,341 votes                     │                                           │
│  │                                  │                                           │
│  │  JavaScript                      │                                           │
│  │  ██████████              29%     │                                           │
│  │  1,172 votes                     │                                           │
│  │                                  │                                           │
│  │  Scratch                         │                                           │
│  │  █████                   13%     │                                           │
│  │  526 votes                       │                                           │
│  │                                  │                                           │
│  │  ─────────────────────────────   │                                           │
│  │                                  │                                           │
│  │  Reliability: 72/100             │                                           │
│  │                                  │                                           │
│  │  [Share Result]  [Discussion ->] │                                           │
│  │                                  │                                           │
│  └──────────────────────────────────┘                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# ORGANIZATION SURVEY CREATION
# ═══════════════════════════════════════════════════════════════════════════════

## Survey Builder Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION SURVEY BUILDER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SIDEBAR NAV                    MAIN CONTENT                                    │
│  ┌─────────────┐   ┌───────────────────────────────────────────────────────┐   │
│  │             │   │                                                       │   │
│  │ Survey Nav  │   │  Employee Satisfaction Survey 2026                    │   │
│  │ ────────── │   │  ─────────────────────────────────────                │   │
│  │             │   │                                                       │   │
│  │ 1. Setup    │   │  TABS: [Settings] [Questions] [Logic] [Preview]      │   │
│  │ 2. Questions│   │                                                       │   │
│  │ 3. Logic    │   │  ┌─────────────────────────────────────────────────┐ │   │
│  │ 4. Targeting│   │  │                                                 │ │   │
│  │ 5. Preview  │   │  │  QUESTIONS BUILDER                              │ │   │
│  │ 6. Launch   │   │  │                                                 │ │   │
│  │             │   │  │  + Add Section                                  │ │   │
│  │ ────────── │   │  │                                                 │ │   │
│  │             │   │  │  Section 1: Work Environment                   │ │   │
│  │ Questions   │   │  │  ─────────────────────────────────────────     │ │   │
│  │ ────────── │   │  │                                                 │ │   │
│  │ Sec 1 (5)  │   │  │  Q1. I feel valued at work                     │ │   │
│  │  ├ Q1      │   │  │      [Likert 5-point ▼]  [Required]  [...]     │ │   │
│  │  ├ Q2      │   │  │                                                 │ │   │
│  │  ├ Q3      │   │  │  Q2. My manager supports my growth             │ │   │
│  │  ├ Q4      │   │  │      [Likert 5-point ▼]  [Required]  [...]     │ │   │
│  │  └ Q5      │   │  │                                                 │ │   │
│  │ Sec 2 (4)  │   │  │  [+ Add Question]                              │ │   │
│  │  ├ Q6      │   │  │                                                 │ │   │
│  │  └ ...     │   │  │  ─────────────────────────────────────────     │ │   │
│  │             │   │  │                                                 │ │   │
│  │ ────────── │   │  │  Section 2: Compensation & Benefits            │ │   │
│  │             │   │  │  ...                                           │ │   │
│  │ [Preview]  │   │  │                                                 │ │   │
│  │ [Save]     │   │  └─────────────────────────────────────────────────┘ │   │
│  │             │   │                                                       │   │
│  └─────────────┘   └───────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  QUESTION TYPES AVAILABLE:                                                      │
│  ─────────────────────────                                                      │
│                                                                                 │
│  Multiple Choice:           Scales:                Text:                        │
│  • Single select            • Likert 5-point       • Short text (280 chars)    │
│  • Multi-select             • Likert 7-point       • Long text (2000 chars)    │
│  • Dropdown                 • NPS (0-10)                                        │
│  • Image choice             • Rating (1-5 stars)   Advanced:                   │
│                             • Slider (0-100)       • Matrix/Grid               │
│                                                    • Ranking                   │
│                                                    • Date picker               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# ORGANIZATION ANALYTICS
# ═══════════════════════════════════════════════════════════════════════════════

## Survey Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SURVEY ANALYTICS DASHBOARD                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │  Employee Satisfaction Survey 2026 - Analytics                           │   │
│  │  ─────────────────────────────────────────────────                       │   │
│  │                                                                          │   │
│  │  OVERVIEW CARDS:                                                         │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │   │
│  │  │ Responses    │ │ Completion   │ │ Reliability  │ │ Quality      │    │   │
│  │  │   847        │ │   71%        │ │   82/100     │ │   94%        │    │   │
│  │  │ of 1,200     │ │              │ │   Good       │ │   Valid      │    │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘    │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────   │   │
│  │                                                                          │   │
│  │  QUESTION RESULTS:                                                       │   │
│  │                                                                          │   │
│  │  Q1. I feel valued for my contributions at work.                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │ Strongly Disagree  █                             5%  (42)       │    │   │
│  │  │ Disagree           ███                           12% (102)      │    │   │
│  │  │ Neutral            █████                         18% (153)      │    │   │
│  │  │ Agree              ██████████████                42% (356)      │    │   │
│  │  │ Strongly Agree     ███████                       23% (194)      │    │   │
│  │  │                                                                 │    │   │
│  │  │ Mean: 3.66  •  Std Dev: 1.12  •  n=847                          │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  [View by Department ▼]  [Compare to Last Year]  [Export]               │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────   │   │
│  │                                                                          │   │
│  │  DEMOGRAPHIC BREAKDOWN:                                                  │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │  Department    │ Responses │ Avg Score │ vs. Company Avg        │    │   │
│  │  │  ─────────────────────────────────────────────────────────────  │    │   │
│  │  │  Engineering   │   234     │   3.82    │  +0.16                 │    │   │
│  │  │  Marketing     │   156     │   3.71    │  +0.05                 │    │   │
│  │  │  Sales         │   198     │   3.45    │  -0.21                 │    │   │
│  │  │  Operations    │   147     │   3.58    │  -0.08                 │    │   │
│  │  │  HR            │    52     │   3.92    │  +0.26                 │    │   │
│  │  │  Finance       │    60     │   3.67    │  +0.01                 │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────   │   │
│  │                                                                          │   │
│  │  EXPORT OPTIONS:                                                         │   │
│  │  [CSV Raw Data]  [PDF Report]  [Excel Summary]  [API Access]            │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```
