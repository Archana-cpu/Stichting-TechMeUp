# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 22                                    █
# █            USER FLOWS, UI/UX SPECIFICATIONS & NAVIGATION                   █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 22.1 PLATFORM USER TYPES & ROLES MATRIX
# ══════════════════════════════════════════════════════════════════════════════

## 22.1.1 Complete User Type Hierarchy

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


## 22.1.2 Permission Matrix by Role

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PERMISSION MATRIX
// ══════════════════════════════════════════════════════════════════════════════

type Permission =
  // Content Creation
  | "CREATE_POLL"
  | "CREATE_EXTENDED_POLL"
  | "CREATE_LIVE_POLL"
  | "CREATE_TEST"
  | "CREATE_SURVEY"
  | "USE_PRETEST"

  // Content Interaction
  | "PARTICIPATE_POLL"
  | "PARTICIPATE_SURVEY"
  | "PARTICIPATE_TEST"
  | "VIEW_RESULTS_OWN"
  | "VIEW_RESULTS_ALL"
  | "PULSE_COMMENTS_ACCESS_PARTICIPATED"
  | "PULSE_COMMENTS_ACCESS_ALL"

  // Organization
  | "ORG_MANAGE_MEMBERS"
  | "ORG_MANAGE_BILLING"
  | "ORG_MANAGE_SSO"
  | "ORG_MANAGE_SETTINGS"
  | "ORG_VIEW_ALL_SURVEYS"
  | "ORG_EXPORT_DATA"
  | "ORG_CREATE_SURVEYS"

  // Platform Admin
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




# ══════════════════════════════════════════════════════════════════════════════
# 22.2 PAGE STRUCTURE & NAVIGATION
# ══════════════════════════════════════════════════════════════════════════════

## 22.2.1 Complete Page Hierarchy

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
│  /my/content/:id/pulse       → Content PULSE + COMMENTS Management                         │
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
│  PULSE + COMMENTS PAGES                                                                    │
│  ═══════════                                                                    │
│                                                                                 │
│  /pulse/:contentId           → PULSE View (Results + COMMENTS)                │
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


## 22.2.2 Navigation Structure

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




# ══════════════════════════════════════════════════════════════════════════════
# 22.3 USER FLOWS - AUTHENTICATION
# ══════════════════════════════════════════════════════════════════════════════

## 22.3.1 Registration Flow

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
│  │   Validation: [REFERENCE: BIBLE-023 Section 23.3.1 auth.password]        │ │
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
│  │   [DECISION T-004] Phone verification is REQUIRED for all accounts       │ │
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
│  │   │   ⚠️ Birth year, gender, and country cannot be changed after setup   ││ │
│  │   └─────────────────────────────────────────────────────────────────────┘│ │
│  │                                                                           │ │
│  │   [DECISION P-012] Demographics are LOCKED after registration            │ │
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
│  │   │               🎉 Welcome to VoxPoll!                                 ││ │
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
│  │   • If came from content → return to that content                        │ │
│  │   • If came from invite → go to invited content                          │ │
│  │   • Otherwise → go to /feed                                              │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.3.2 Login Flow

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
│  • Invalid credentials → "Email/username or password is incorrect"             │
│  • Account locked → "Account locked. Please contact support."                   │
│  • Unverified email → "Please verify your email first. [Resend]"               │
│                                                                                 │
│  Post-Login Redirect:                                                           │
│  • Stored return URL → redirect there                                          │
│  • Organization member with pending survey → org dashboard                     │
│  • Default → /feed                                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 22.4 USER FLOWS - CONTENT CREATION
# ══════════════════════════════════════════════════════════════════════════════

## 22.4.1 Quick Poll Creation Flow

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
│  │   Options: [REFERENCE: BIBLE-023 poll.optionsMin/Max, BIBLE-006 §6.2.1] │   │
│  │   • Free/Plus: 2-4 options (Quick Poll)                                  │   │
│  │   • Premium/Org: 2-10 options (Extended Poll)                            │   │
│  │   [1] [Python________________] ✕                                         │   │
│  │   [2] [JavaScript____________] ✕                                         │   │
│  │   [3] [Scratch_______________] ✕                                         │   │
│  │   [4] [_____________________] ✕                                          │   │
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
│  Validation: [REFERENCE: BIBLE-023 Section 23.3.1 limits.poll]                 │
│  • Question: 10-500 characters                                                  │
│  • Options: 2-4 (Free/Plus) or 2-10 (Premium/Org), 1-200 chars each, unique    │
│  • Duration: Required (min 1h, max 30 days)                                    │
│  • Visibility: Required                                                         │
│                                                                                 │
│  Free User Limit Check:                                                         │
│  • If 3 polls created today → Show upgrade prompt                              │
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
│  │   │  🕐 24 hours  •  🌐 Public                                       │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │   ⚠️ Polls cannot be edited after publishing                            │   │
│  │                                                                          │   │
│  │   [← Edit] [Publish Now]                                                 │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  STEP 3: Published Confirmation                                                 │
│  ───────────────────────────────                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    🎉 Poll Published!                                    │   │
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


## 22.4.2 Personality Test Creation Flow

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
│  │   [Continue →]                                                           │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
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
│  │   │  Color: [🟣 Purple ▼]                                           │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │   Result 2:                                                              │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │  Name: [The Diplomat_______________________________]            │   │   │
│  │   │  Description: [You excel at building relationships...]         │   │   │
│  │   │  Image: [Upload]                                                │   │   │
│  │   │  Color: [🔵 Blue ▼]                                             │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │   [+ Add Result Category]                                                │   │
│  │                                                                          │   │
│  │   Min: 2 results  |  Max: 10 results                                     │   │
│  │                                                                          │   │
│  │   [← Back] [Continue →]                                                  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
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
│  │   │  Take charge and make quick decisions        │ → Visionary      │   │   │
│  │   └──────────────────────────────────────────────┴──────────────────┘   │   │
│  │   ┌──────────────────────────────────────────────┬──────────────────┐   │   │
│  │   │  Consult with everyone before acting         │ → Diplomat       │   │   │
│  │   └──────────────────────────────────────────────┴──────────────────┘   │   │
│  │   ┌──────────────────────────────────────────────┬──────────────────┐   │   │
│  │   │  Analyze the data carefully                  │ → Analyst        │   │   │
│  │   └──────────────────────────────────────────────┴──────────────────┘   │   │
│  │   [+ Add option]                                                         │   │
│  │                                                                          │   │
│  │   [← Previous] [Save & Next →]                                           │   │
│  │                                                                          │   │
│  │   Progress: ███░░░░░░░ 1/5 questions                                     │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Minimum questions: 5  |  Maximum: 50                                           │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
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
│  │   ☑ Award badge upon completion                                         │   │
│  │   ☑ Show result on user's profile (if they choose)                      │   │
│  │                                                                          │   │
│  │   Result Display:                                                        │   │
│  │   ☑ Show how user compares to others                                    │   │
│  │   ☑ Show demographic breakdown                                          │   │
│  │                                                                          │   │
│  │   Discussion:                                                            │   │
│  │   ☑ Enable COMMENTS discussion                                             │   │
│  │   ☑ Only participants can comment                                       │   │
│  │                                                                          │   │
│  │   [Preview Test] [Publish]                                               │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 22.5 USER FLOWS - CONTENT PARTICIPATION
# ══════════════════════════════════════════════════════════════════════════════

## 22.5.1 Poll Participation Flow

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
│  │  │  @creator_name  •  🕐 18h remaining  •  🔓 Public                   │ │ │
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
│  │  │  ✓ You voted for Python                                            │ │ │
│  │  │                                                                     │ │ │
│  │  │  Python      ████████████████████████████████░░░░░░  58%  (2,341)  │ │ │
│  │  │  JavaScript  ████████████████░░░░░░░░░░░░░░░░░░░░░░  29%  (1,172)  │ │ │
│  │  │  Scratch     █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  13%  (526)    │ │ │
│  │  │                                                                     │ │ │
│  │  │  ─────────────────────────────────────────────────────────────────  │ │ │
│  │  │                                                                     │ │ │
│  │  │  4,039 total votes  •  Reliability: 72/100 🟢🟢🟢🟢⚪               │ │ │
│  │  │                                                                     │ │ │
│  │  │  [Share My Vote] [View Discussion →]                                │ │ │
│  │  │                                                                     │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  STATES SUMMARY:                                                                │
│  • Not logged in → Prompt to login/register OR allow anonymous vote             │
│  • Already voted → Show results directly                                        │
│  • Poll ended → Show PULSE + COMMENTS                                      │
│  • Poll has pre-test → Show pre-test first (Premium creator feature)            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.5.2 Survey Participation Flow (Organization)

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
│  │   🔒 Your responses are completely anonymous                             │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
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
│  │   [Continue →]                                                           │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
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
│  │   📊 20 questions  •  ⏱️ ~10 minutes                                     │   │
│  │                                                                          │   │
│  │   🔒 Anonymity Guarantee                                                 │   │
│  │   Your responses cannot be linked to your identity. We use               │   │
│  │   cryptographic separation to ensure complete anonymity.                 │   │
│  │   [Learn how we protect your privacy]                                    │   │
│  │                                                                          │   │
│  │   [Begin Survey →]                                                       │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  STEP 4: Survey Questions (Progressive)                                         │
│  ───────────────────────────────────────                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Progress: ████████░░░░░░░░░░░░  8/20                                   │   │
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
│  │  [← Previous]                                      [Next →]              │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────   │   │
│  │  [Save & Continue Later]                                                 │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
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
│  │  [← Previous]                                      [Next →]              │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  STEP 6: Survey Completion                                                      │
│  ─────────────────────────                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │   ✓ Survey Completed                                                     │   │
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




# ══════════════════════════════════════════════════════════════════════════════
# 22.6 USER FLOWS - PULSE + COMMENTS (RESULTS + DISCUSSION)
# ══════════════════════════════════════════════════════════════════════════════

## 22.6.1 PULSE + COMMENTS Entry and Navigation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PULSE + COMMENTS FLOW                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ENTRY POINTS:                                                                  │
│  • After poll/test completion → Auto-redirect                                   │
│  • "View Discussion" button on results                                          │
│  • Direct link: /pulse/:contentId                                               │
│  • Notification about new activity                                              │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  PULSE + COMMENTS LAYOUT (Desktop):                                                        │
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
│  │  │  │                           │ │  │ │ 📌 @creator: Thanks │   │  │  │   │
│  │  │  │   [Charts & Graphs]       │ │  │ │ for participating!  │   │  │  │   │
│  │  │  │   [Your Result]           │ │  │ └─────────────────────┘   │  │  │   │
│  │  │  │   [Demographic Stats]     │ │  │                           │  │  │   │
│  │  │  │                           │ │  │ ┌─────────────────────┐   │  │  │   │
│  │  │  └───────────────────────────┘ │  │ │ @user1: I voted for │   │  │  │   │
│  │  │                                 │  │ │ Python because...    │   │  │  │   │
│  │  │  [Share Result Card]            │  │ │ 👍 45  👎 3  💬 12   │   │  │  │   │
│  │  │                                 │  │ └─────────────────────┘   │  │  │   │
│  │  │  ─────────────────────────────  │  │                           │  │  │   │
│  │  │                                 │  │ ┌─────────────────────┐   │  │  │   │
│  │  │  Reliability: 78/100 🟢🟢🟢🟢⚪ │  │ │ @user2: JavaScript  │   │  │  │   │
│  │  │  [View Methodology]             │  │ │ is more versatile   │   │  │  │   │
│  │  │                                 │  │ │ 👍 32  👎 8  💬 8    │   │  │  │   │
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
│  • Free tier → Show "Participate to unlock" overlay                            │
│  • Plus/Premium tier → Full access (P-016 decision)                            │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │          🔒 Participate to Unlock                                        │   │
│  │                                                                          │   │
│  │   Join the discussion after sharing your opinion!                        │   │
│  │                                                                          │   │
│  │   [Vote Now]    or    [Upgrade to Plus]                                  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 22.7 USER FLOWS - ORGANIZATION SURVEY CREATION
# ══════════════════════════════════════════════════════════════════════════════

## 22.7.1 Survey Builder Flow

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
│  │  ├ Q1      │   │  │      [Likert 5-point ▼]  [Required ☑]  [⋮]     │ │   │
│  │  ├ Q2      │   │  │                                                 │ │   │
│  │  ├ Q3      │   │  │  Q2. My manager supports my growth             │ │   │
│  │  ├ Q4      │   │  │      [Likert 5-point ▼]  [Required ☑]  [⋮]     │ │   │
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
│  QUESTION EDITOR MODAL:                                                         │
│  ─────────────────────                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Edit Question                                                    [X]   │   │
│  │                                                                          │   │
│  │  Question Text:                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │ I feel valued for my contributions at work.                     │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  Question Type: [Likert 5-point ▼]                                       │   │
│  │                                                                          │   │
│  │  Scale Labels:                                                           │   │
│  │  1: [Strongly Disagree]  5: [Strongly Agree]                             │   │
│  │                                                                          │   │
│  │  Settings:                                                               │   │
│  │  ☑ Required                                                              │   │
│  │  ☐ Randomize option order                                               │   │
│  │  ☐ Add "N/A" option                                                     │   │
│  │                                                                          │   │
│  │  [Cancel]                                         [Save Question]        │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 22.8 USER FLOWS - ORGANIZATION ANALYTICS
# ══════════════════════════════════════════════════════════════════════════════

## 22.8.1 Survey Analytics Dashboard

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
│  │  │ Strongly Disagree  █░░░░░░░░░░░░░░░░░░░░░░░░░  5%  (42)         │    │   │
│  │  │ Disagree           ███░░░░░░░░░░░░░░░░░░░░░░░  12% (102)        │    │   │
│  │  │ Neutral            █████░░░░░░░░░░░░░░░░░░░░░  18% (153)        │    │   │
│  │  │ Agree              ██████████████░░░░░░░░░░░░  42% (356)        │    │   │
│  │  │ Strongly Agree     ███████░░░░░░░░░░░░░░░░░░░  23% (194)        │    │   │
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
│  │  │  Engineering   │   234     │   3.82    │  ▲ +0.16               │    │   │
│  │  │  Marketing     │   156     │   3.71    │  ▲ +0.05               │    │   │
│  │  │  Sales         │   198     │   3.45    │  ▼ -0.21               │    │   │
│  │  │  Operations    │   147     │   3.58    │  ▼ -0.08               │    │   │
│  │  │  HR            │    52     │   3.92    │  ▲ +0.26               │    │   │
│  │  │  Finance       │    60     │   3.67    │  ▲ +0.01               │    │   │
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




# ══════════════════════════════════════════════════════════════════════════════
# 22.9 MOBILE-SPECIFIC FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 22.9.1 Mobile Navigation & Gestures

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
│  │   🏠          🔍          ➕          🔔          👤                     │   │
│  │  Feed      Explore     Create     Notifs      Profile                   │   │
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
│  CREATE QUICK ACTION SHEET (Long press on ➕):                                  │
│  ═════════════════════════════════════════════                                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                           Create                                         │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │  📊  Quick Poll                                                   │   │   │
│  │  │      Simple yes/no or multiple choice                            │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │  📋  Extended Poll                   [Premium]                    │   │   │
│  │  │      More options, images, pre-test                              │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │  🎭  Personality Test                                             │   │   │
│  │  │      Multi-question with results                                 │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │  🔴  Live Poll                        [Premium]                   │   │   │
│  │  │      Real-time voting for events                                 │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  [Cancel]                                                                │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.9.2 Mobile Poll Experience

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      MOBILE POLL VIEW                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────────────────┐                                           │
│  │ ←                    ⋮   Share   │  Status Bar                               │
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
│  │  🕐 18h remaining  •  4,039 votes│                                           │
│  │                                  │                                           │
│  ├──────────────────────────────────┤                                           │
│  │  🏠   🔍   ➕   🔔   👤         │  Bottom Nav                               │
│  └──────────────────────────────────┘                                           │
│                                                                                 │
│  After voting (results screen):                                                 │
│  ┌──────────────────────────────────┐                                           │
│  │ ←  Results             Share     │                                           │
│  ├──────────────────────────────────┤                                           │
│  │                                  │                                           │
│  │  ✓ You voted: Python             │                                           │
│  │                                  │                                           │
│  │  Python                          │                                           │
│  │  ████████████████████░░  58%     │                                           │
│  │  2,341 votes                     │                                           │
│  │                                  │                                           │
│  │  JavaScript                      │                                           │
│  │  ██████████░░░░░░░░░░░  29%     │                                           │
│  │  1,172 votes                     │                                           │
│  │                                  │                                           │
│  │  Scratch                         │                                           │
│  │  █████░░░░░░░░░░░░░░░░  13%     │                                           │
│  │  526 votes                       │                                           │
│  │                                  │                                           │
│  │  ─────────────────────────────   │                                           │
│  │                                  │                                           │
│  │  Reliability: 72/100 🟢🟢🟢⚪⚪   │                                           │
│  │                                  │                                           │
│  │  [Share Result]  [Discussion →]  │                                           │
│  │                                  │                                           │
│  └──────────────────────────────────┘                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 22.10 ERROR STATES & EMPTY STATES
# ══════════════════════════════════════════════════════════════════════════════

## 22.10.1 Error State Patterns

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ERROR & EMPTY STATES                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  404 - NOT FOUND                                                                │
│  ════════════════                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          🔍                                              │   │
│  │                                                                          │   │
│  │                   Page Not Found                                         │   │
│  │                                                                          │   │
│  │     The content you're looking for doesn't exist or                      │   │
│  │     has been removed.                                                    │   │
│  │                                                                          │   │
│  │     [Go to Feed]    [Explore Content]                                    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  POLL ENDED                                                                     │
│  ══════════                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          ⏰                                              │   │
│  │                                                                          │   │
│  │                   Poll Has Ended                                         │   │
│  │                                                                          │   │
│  │     This poll closed on January 15, 2026.                                │   │
│  │     View the final results below.                                        │   │
│  │                                                                          │   │
│  │     [View Results]                                                       │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  NO INTERNET                                                                    │
│  ═══════════                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          📶                                              │   │
│  │                                                                          │   │
│  │                   No Internet Connection                                 │   │
│  │                                                                          │   │
│  │     Check your connection and try again.                                 │   │
│  │                                                                          │   │
│  │     [Retry]                                                              │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  EMPTY FEED                                                                     │
│  ══════════                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          📭                                              │   │
│  │                                                                          │   │
│  │                   Your Feed is Empty                                     │   │
│  │                                                                          │   │
│  │     Follow some creators or explore trending                             │   │
│  │     content to get started.                                              │   │
│  │                                                                          │   │
│  │     [Explore]    [Find People to Follow]                                 │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  RATE LIMITED                                                                   │
│  ════════════                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          ⏳                                              │   │
│  │                                                                          │   │
│  │                   Too Many Requests                                      │   │
│  │                                                                          │   │
│  │     You've reached your daily limit.                                     │   │
│  │     Upgrade to create more content.                                      │   │
│  │                                                                          │   │
│  │     [Upgrade to Plus]    [Learn More]                                    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  PRE-TEST FAILED                                                                │
│  ════════════════                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          🎯                                              │   │
│  │                                                                          │   │
│  │              Thanks for Your Interest!                                   │   │
│  │                                                                          │   │
│  │     This survey is looking for a specific audience that                  │   │
│  │     doesn't match your profile.                                          │   │
│  │                                                                          │   │
│  │     Don't worry - there are many other polls and tests                   │   │
│  │     waiting for you!                                                     │   │
│  │                                                                          │   │
│  │     [Explore More Content]                                               │   │
│  │                                                                          │   │
│  │     [DECISION P-108] Pre-test failure messages are POLITE               │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 22.11 COMPONENT DESIGN SPECIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 22.11.1 Design Tokens

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════════════════

export const DESIGN_TOKENS = {
  // Color Palette
  colors: {
    primary: {
      50: "#EEF2FF",
      100: "#E0E7FF",
      500: "#6366F1",   // Main brand color (Indigo)
      600: "#4F46E5",
      700: "#4338CA",
    },
    success: {
      500: "#22C55E",   // Green for positive
    },
    warning: {
      500: "#F59E0B",   // Amber for warnings
    },
    error: {
      500: "#EF4444",   // Red for errors
    },
    neutral: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#E5E5E5",
      300: "#D4D4D4",
      500: "#737373",
      700: "#404040",
      900: "#171717",
    },
    reliability: {
      excellent: "#22C55E",  // Green (90-100)
      good: "#84CC16",       // Lime (75-89)
      moderate: "#EAB308",   // Yellow (60-74)
      limited: "#F97316",    // Orange (40-59)
      low: "#EF4444",        // Red (0-39)
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: "Inter, system-ui, sans-serif",
      mono: "JetBrains Mono, monospace",
    },
    fontSize: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      base: "1rem",     // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px
      "3xl": "1.875rem",// 30px
      "4xl": "2.25rem", // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing (based on 4px grid)
  spacing: {
    0: "0",
    1: "0.25rem",   // 4px
    2: "0.5rem",    // 8px
    3: "0.75rem",   // 12px
    4: "1rem",      // 16px
    5: "1.25rem",   // 20px
    6: "1.5rem",    // 24px
    8: "2rem",      // 32px
    10: "2.5rem",   // 40px
    12: "3rem",     // 48px
    16: "4rem",     // 64px
  },

  // Border Radius
  borderRadius: {
    none: "0",
    sm: "0.125rem",   // 2px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "2xl": "1rem",    // 16px
    full: "9999px",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },

  // Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Z-Index
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    toast: 1200,
    tooltip: 1300,
  },

  // Animation
  animation: {
    duration: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    },
    easing: {
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    },
  },
} as const

export type DesignTokens = typeof DESIGN_TOKENS
```


## 22.11.2 Key Component Specifications

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT SPECIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════

// Poll Option Component
interface PollOptionProps {
  id: string
  text: string
  imageUrl?: string
  isSelected: boolean
  percentage?: number      // After voting
  voteCount?: number       // After voting
  isWinner?: boolean       // Highest percentage
  disabled?: boolean
  onSelect: () => void
}

// Reliability Badge Component
interface ReliabilityBadgeProps {
  score: number            // 0-100
  variant: "compact" | "standard" | "expanded"
  showLabel?: boolean
  showBreakdown?: boolean
}

// Vote Result Bar Component
interface VoteResultBarProps {
  option: string
  percentage: number
  voteCount: number
  isUserChoice: boolean
  color?: string
  animated?: boolean       // Animate on reveal
}

// Content Card Component (Feed)
interface ContentCardProps {
  type: "POLL" | "TEST"
  id: string
  title: string
  creator: {
    username: string
    avatarUrl: string
    isVerified: boolean
  }
  stats: {
    participantCount: number
    reliabilityScore?: number
    timeRemaining?: string    // "2h left" or "Ended"
  }
  thumbnail?: string
  hasParticipated: boolean
}

// Badge Display Component
interface BadgeDisplayProps {
  badge: {
    id: string
    name: string
    iconUrl: string
    earnedAt: Date
    testTitle: string
    resultName: string
  }
  size: "sm" | "md" | "lg"
  showDetails?: boolean
}

// Comment Component
interface CommentProps {
  id: string
  author: {
    username: string
    avatarUrl: string
    badge?: string           // Badge from this content
    isCreator: boolean
  }
  content: string
  mediaUrls?: string[]
  upvotes: number
  downvotes: number
  replyCount: number
  depth: number              // 0-3 for nesting
  isPinned: boolean
  isHearted: boolean
  createdAt: Date
  children?: CommentProps[]
}

export type {
  PollOptionProps,
  ReliabilityBadgeProps,
  VoteResultBarProps,
  ContentCardProps,
  BadgeDisplayProps,
  CommentProps
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 22.12 ACCESSIBILITY SPECIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 22.12.1 WCAG 2.1 AA Compliance

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    ACCESSIBILITY REQUIREMENTS                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  COLOR CONTRAST:                                                                │
│  ════════════════                                                               │
│  • Text (normal): 4.5:1 minimum contrast ratio                                  │
│  • Text (large): 3:1 minimum contrast ratio                                     │
│  • Interactive elements: 3:1 minimum                                            │
│  • Focus indicators: 3:1 minimum against adjacent colors                        │
│                                                                                 │
│  KEYBOARD NAVIGATION:                                                           │
│  ═════════════════════                                                          │
│  • All interactive elements focusable with Tab                                  │
│  • Logical tab order (left-to-right, top-to-bottom)                            │
│  • Visible focus indicators                                                     │
│  • Skip to main content link                                                    │
│  • Escape key closes modals/dropdowns                                          │
│  • Arrow keys navigate within components (radio, dropdown)                      │
│  • Enter/Space activates buttons and links                                      │
│                                                                                 │
│  SCREEN READER SUPPORT:                                                         │
│  ════════════════════════                                                       │
│  • Semantic HTML (headings, landmarks, lists)                                   │
│  • ARIA labels for icons and non-text content                                   │
│  • ARIA live regions for dynamic updates                                        │
│  • Alt text for all images                                                      │
│  • Form labels associated with inputs                                           │
│  • Error messages linked to form fields                                         │
│                                                                                 │
│  MOTION & ANIMATION:                                                            │
│  ═════════════════════                                                          │
│  • Respect prefers-reduced-motion setting                                       │
│  • No auto-playing animations over 5 seconds                                    │
│  • Pause/stop controls for any motion                                           │
│  • Essential animations still work but simplified                               │
│                                                                                 │
│  TOUCH TARGETS (Mobile):                                                        │
│  ═════════════════════════                                                      │
│  • Minimum 44x44px touch targets                                                │
│  • Adequate spacing between targets (8px minimum)                               │
│  • No hover-only interactions                                                   │
│                                                                                 │
│  FORMS:                                                                         │
│  ════════                                                                       │
│  • Clear labels for all inputs                                                  │
│  • Error messages in context (not just color)                                   │
│  • Required fields clearly marked                                               │
│  • Autocomplete attributes where applicable                                     │
│  • Input purpose clearly communicated                                           │
│                                                                                 │
│  TEXT & CONTENT:                                                                │
│  ════════════════                                                               │
│  • Text resizable to 200% without loss of function                             │
│  • No text in images (except logos)                                             │
│  • Line height at least 1.5x font size                                          │
│  • Paragraph spacing at least 2x font size                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 22.12 COMPREHENSIVE USER FLOWS BY ROLE
# ══════════════════════════════════════════════════════════════════════════════

## 22.12.1 Anonymous User Flows (Not Logged In)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ANONYMOUS USER FLOWS                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FLOW A-001: DISCOVER & BROWSE                                                  │
│  ═══════════════════════════════                                                │
│                                                                                 │
│  Entry Points:                                                                  │
│  • Direct URL: voxpoll.com                                                     │
│  • Search engine result                                                        │
│  • Social media share link                                                     │
│                                                                                 │
│  Available Actions:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ ACTION                    │ ALLOWED │ REDIRECT TO              │        │   │
│  ├───────────────────────────┼─────────┼──────────────────────────┤        │   │
│  │ View landing page         │   ✓     │ -                        │        │   │
│  │ View /explore             │   ✓     │ -                        │        │   │
│  │ View public poll          │   ✓     │ -                        │        │   │
│  │ View public test          │   ✓     │ -                        │        │   │
│  │ View user profile         │   ✓     │ - (public parts only)    │        │   │
│  │ View pricing page         │   ✓     │ -                        │        │   │
│  │ View help center          │   ✓     │ -                        │        │   │
│  │ Participate in poll       │   ✓*    │ - (anonymous vote)       │        │   │
│  │ View results (before vote)│   ✗     │ Must participate first   │        │   │
│  │ View COMMENTS discussion     │   ✗     │ /login?redirect=...      │        │   │
│  │ Create any content        │   ✗     │ /register                │        │   │
│  │ Follow users              │   ✗     │ /login                   │        │   │
│  │ Comment                   │   ✗     │ /login                   │        │   │
│  │ Save content              │   ✗     │ /login                   │        │   │
│  └───────────────────────────┴─────────┴──────────────────────────┘        │   │
│                                                                                 │
│  * Anonymous poll participation:                                               │
│  - Device fingerprint stored for duplicate prevention                          │
│  - After voting: "Create account to save your participation history"          │
│  - Response stored with anonymous participantHash                              │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW A-002: ANONYMOUS POLL PARTICIPATION                                       │
│  ═════════════════════════════════════════                                      │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ View Poll      │ ──► │ Select Option  │ ──► │ Click Vote     │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│           │                                            │                        │
│           │                                            ▼                        │
│           │                               ┌────────────────────────┐           │
│           │                               │ Vote Recorded          │           │
│           │                               │ (deviceFingerprint)    │           │
│           │                               └────────────────────────┘           │
│           │                                            │                        │
│           │                                            ▼                        │
│           │                               ┌────────────────────────┐           │
│           │                               │ Show Results           │           │
│           │                               │ + Account Prompt       │           │
│           │                               └────────────────────────┘           │
│           │                                            │                        │
│           │                              ┌─────────────┴─────────────┐         │
│           │                              │                           │         │
│           │                              ▼                           ▼         │
│           │                    ┌─────────────────┐       ┌─────────────────┐  │
│           │                    │ Create Account  │       │ Continue        │  │
│           │                    │ (saves history) │       │ Anonymously     │  │
│           │                    └─────────────────┘       └─────────────────┘  │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW A-003: LIVE POLL JOIN (NO AUTH)                                          │
│  ════════════════════════════════════                                          │
│                                                                                 │
│  Entry: /live/:joinCode or QR code scan                                        │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ Enter 6-digit  │ ──► │ Wait for Host  │ ──► │ Question       │              │
│  │ Join Code      │     │ to Start       │     │ Appears        │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                │                        │                       │
│                                │                        ▼                       │
│                                │              ┌────────────────┐                │
│                         WebSocket            │ Vote (5-30s    │                │
│                         Connection           │ countdown)     │                │
│                                │              └────────────────┘                │
│                                │                        │                       │
│                                │                        ▼                       │
│                                │              ┌────────────────┐                │
│                                └─────────────►│ Real-time      │                │
│                                               │ Results Update │                │
│                                               └────────────────┘                │
│                                                                                 │
│  [DECISION P-019] Live Join requires NO authentication                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 22.12.2 Free User Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FREE USER FLOWS                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CAPABILITIES SUMMARY:                                                          │
│  • Create: 3 polls/day, 3 tests/week                                           │
│  • Participate: Unlimited polls/tests/surveys                                   │
│  • PULSE/COMMENTS: Only after participation                                              │
│  • Results: Only for participated content                                       │
│  • Cannot: Create surveys, use pre-test, create live polls                     │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW F-001: DAILY POLL CREATION (FREE LIMIT)                                   │
│  ════════════════════════════════════════════                                   │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ Click Create   │ ──► │ Check Daily    │ ──► │ < 3 Today?     │              │
│  │ Poll           │     │ Quota          │     │                │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                                       │                         │
│                                          ┌────────────┴────────────┐            │
│                                          │                         │            │
│                                     YES ▼                     NO ▼             │
│                              ┌────────────────┐       ┌────────────────┐       │
│                              │ Show Poll      │       │ Show Upgrade   │       │
│                              │ Creator Form   │       │ Modal          │       │
│                              └────────────────┘       └────────────────┘       │
│                                      │                        │                 │
│                                      │                        ▼                 │
│                                      │               ┌────────────────┐        │
│                                      │               │ "You've used   │        │
│                                      │               │ 3/3 polls today│        │
│                                      │               │                │        │
│                                      │               │ [Upgrade to    │        │
│                                      │               │ Plus - $4.99]  │        │
│                                      │               │                │        │
│                                      │               │ [Wait until    │        │
│                                      │               │ tomorrow]      │        │
│                                      │               └────────────────┘        │
│                                      │                                          │
│                                      ▼                                          │
│                              ┌────────────────┐                                 │
│                              │ Quick Poll:    │                                 │
│                              │ 2-4 options    │                                 │
│                              │ No images      │                                 │
│                              │ Basic duration │                                 │
│                              └────────────────┘                                 │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW F-002: PULSE/COMMENTS ACCESS (PARTICIPATION REQUIRED)                              │
│  ═════════════════════════════════════════════════                              │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ Click "View    │ ──► │ Check          │ ──► │ Participated?  │              │
│  │ Discussion"    │     │ Participation  │     │                │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                                       │                         │
│                                          ┌────────────┴────────────┐            │
│                                          │                         │            │
│                                     YES ▼                     NO ▼             │
│                              ┌────────────────┐       ┌────────────────┐       │
│                              │ Show PULSE     │       │ Show Locked    │       │
│                              │ Full Access:   │       │ State:         │       │
│                              │ - Read comments│       │                │       │
│                              │ - Post comment │       │ "Participate   │       │
│                              │ - Vote on      │       │ to unlock      │       │
│                              │   comments     │       │ discussion"    │       │
│                              │ - View results │       │                │       │
│                              └────────────────┘       │ [Vote Now]     │       │
│                                                       │                │       │
│                                                       │ ─────── OR ─── │       │
│                                                       │                │       │
│                                                       │ [Upgrade to    │       │
│                                                       │ Plus to view   │       │
│                                                       │ without voting]│       │
│                                                       └────────────────┘       │
│                                                                                 │
│  [DECISION P-016] Plus tier grants PULSE/COMMENTS access without participation          │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW F-003: UPGRADE PROMPT TRIGGERS                                            │
│  ════════════════════════════════════                                           │
│                                                                                 │
│  Upgrade prompts appear when free user attempts:                               │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ ACTION                          │ UPGRADE PROMPT MESSAGE                │   │
│  ├─────────────────────────────────┼───────────────────────────────────────┤   │
│  │ Create 4th poll in a day        │ "Daily limit reached. Upgrade to     │   │
│  │                                 │ Plus for 10 polls/day"               │   │
│  ├─────────────────────────────────┼───────────────────────────────────────┤   │
│  │ View PULSE without participating│ "Participate or upgrade to Plus to   │   │
│  │                                 │ view discussions"                    │   │
│  ├─────────────────────────────────┼───────────────────────────────────────┤   │
│  │ Add 5+ options to poll          │ "Extended polls require Plus or      │   │
│  │                                 │ Premium subscription"                │   │
│  ├─────────────────────────────────┼───────────────────────────────────────┤   │
│  │ Create Live Poll                │ "Live Polls require Premium          │   │
│  │                                 │ subscription"                        │   │
│  ├─────────────────────────────────┼───────────────────────────────────────┤   │
│  │ Add pre-test to poll            │ "Pre-tests require Premium           │   │
│  │                                 │ subscription"                        │   │
│  ├─────────────────────────────────┼───────────────────────────────────────┤   │
│  │ Create Survey                   │ "Surveys are only available for      │   │
│  │                                 │ organizations"                       │   │
│  └─────────────────────────────────┴───────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 22.12.3 Plus User Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PLUS USER FLOWS ($4.99/mo)                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ADDITIONAL CAPABILITIES (vs Free):                                             │
│  • Create: 10 polls/day, 10 tests/week                                         │
│  • Extended polls: Up to 10 options                                             │
│  • PULSE/COMMENTS: Access without participation (key feature)                            │
│  • Results: View any public results                                             │
│  • Profile: Customization options                                               │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW P-001: VIEW RESULTS WITHOUT PARTICIPATION                                 │
│  ══════════════════════════════════════════════                                 │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ View Poll Page │ ──► │ "View Results  │ ──► │ Show Results   │              │
│  │                │     │ Without Voting"│     │ + PULSE/COMMENTS │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                                       │                         │
│                                                       ▼                         │
│                                            ┌────────────────────┐               │
│                                            │ Plus Badge Shown   │               │
│                                            │ "Viewing as Plus   │               │
│                                            │ member"            │               │
│                                            │                    │               │
│                                            │ [Vote to be        │               │
│                                            │ included in        │               │
│                                            │ statistics]        │               │
│                                            └────────────────────┘               │
│                                                                                 │
│  Note: Plus users can view but their opinion isn't counted unless they vote    │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW P-002: EXTENDED POLL CREATION                                             │
│  ══════════════════════════════════                                             │
│                                                                                 │
│  Plus users see:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Create Poll                                        │   │
│  │                                                                          │   │
│  │   Question: [_______________________________________________]            │   │
│  │                                                                          │   │
│  │   Options (2-10):                                                       │   │
│  │   [1] [_____________________] ✕                                          │   │
│  │   [2] [_____________________] ✕                                          │   │
│  │   [3] [_____________________] ✕                                          │   │
│  │   [4] [_____________________] ✕                                          │   │
│  │   [5] [_____________________] ✕ ← Plus feature                          │   │
│  │   [+ Add option] (up to 10)                                             │   │
│  │                                                                          │   │
│  │   ☐ Add images to options ← Plus feature                                │   │
│  │                                                                          │   │
│  │   [Live Poll] 🔒 Premium only                                           │   │
│  │   [Pre-test] 🔒 Premium only                                            │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 22.12.4 Premium User Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PREMIUM USER FLOWS ($9.99/mo)                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ADDITIONAL CAPABILITIES (vs Plus):                                             │
│  • Unlimited polls/tests                                                        │
│  • Live Poll hosting                                                            │
│  • Pre-test support for polls                                                   │
│  • Target audience filtering                                                    │
│  • Advanced analytics                                                           │
│  • Custom themes                                                                │
│  • API access (personal use)                                                    │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW PM-001: LIVE POLL HOSTING                                                 │
│  ══════════════════════════════                                                 │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ Create Live    │ ──► │ Configure      │ ──► │ Get Join Code  │              │
│  │ Poll           │     │ Settings       │     │ & QR           │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                                       │                         │
│                                                       ▼                         │
│                                            ┌────────────────────┐               │
│                                            │ Host Dashboard:    │               │
│                                            │                    │               │
│                                            │ Join Code: ABC123  │               │
│                                            │ [QR Code]          │               │
│                                            │                    │               │
│                                            │ Participants: 0    │               │
│                                            │                    │               │
│                                            │ [Start Poll]       │               │
│                                            └────────────────────┘               │
│                                                       │                         │
│                                            Poll Started                         │
│                                                       │                         │
│                                                       ▼                         │
│                                            ┌────────────────────┐               │
│                                            │ Live Control:      │               │
│                                            │                    │               │
│                                            │ Time: 00:25        │               │
│                                            │ Votes: 47/103      │               │
│                                            │                    │               │
│                                            │ [Show Results]     │               │
│                                            │ [Next Question]    │               │
│                                            │ [End Poll]         │               │
│                                            └────────────────────┘               │
│                                                                                 │
│  Max Participants: 10,000 concurrent                                           │
│  [DECISION P-011] Live Poll specifications                                     │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW PM-002: PRE-TEST FOR POLLS                                                │
│  ════════════════════════════════                                               │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ Create Poll    │ ──► │ Enable         │ ──► │ Configure      │              │
│  │                │     │ Pre-test       │     │ Questions      │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                                       │                         │
│                                                       ▼                         │
│                                            ┌────────────────────┐               │
│                                            │ Pre-test Setup:    │               │
│                                            │                    │               │
│                                            │ "Before voting,    │               │
│                                            │ verify knowledge"  │               │
│                                            │                    │               │
│                                            │ Q1: [____________] │               │
│                                            │ ○ Correct          │               │
│                                            │ ○ Wrong            │               │
│                                            │ ○ Wrong            │               │
│                                            │                    │               │
│                                            │ Pass threshold:    │               │
│                                            │ [2/3 ▼] correct   │               │
│                                            │                    │               │
│                                            │ Failed message:    │               │
│                                            │ [________________] │               │
│                                            └────────────────────┘               │
│                                                                                 │
│  User Flow (Participant):                                                       │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │View Poll │──►│Pre-test  │──►│Pass?     │──►│Vote on   │──►│Results   │     │
│  │          │   │Questions │   │          │   │Poll      │   │          │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│                                     │                                          │
│                                FAIL ▼                                          │
│                        ┌────────────────────┐                                  │
│                        │ "You didn't pass   │                                  │
│                        │ the pre-test"      │                                  │
│                        │                    │                                  │
│                        │ [View Results Only]│                                  │
│                        └────────────────────┘                                  │
│                                                                                 │
│  [DECISION P-014] Pre-test requires PREMIUM tier                               │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW PM-003: TARGET AUDIENCE                                                   │
│  ════════════════════════════                                                   │
│                                                                                 │
│  Premium users can filter who can participate:                                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Target Audience Settings                           │   │
│  │                                                                          │   │
│  │   Age Groups:                                                            │   │
│  │   ☑ 18-24  ☑ 25-34  ☐ 35-44  ☐ 45-54  ☐ 55-64  ☐ 65+                  │   │
│  │                                                                          │   │
│  │   Gender:                                                                │   │
│  │   ☑ Male  ☑ Female  ☑ Non-binary                                       │   │
│  │                                                                          │   │
│  │   Location:                                                              │   │
│  │   Countries: [Turkey ▼] [+Add]                                          │   │
│  │   Regions: [Istanbul, Ankara, Izmir ▼]                                  │   │
│  │                                                                          │   │
│  │   Verification Level:                                                    │   │
│  │   ○ Any user                                                             │   │
│  │   ○ Phone verified                                                       │   │
│  │   ● Email & Phone verified                                               │   │
│  │   ○ ID verified                                                          │   │
│  │                                                                          │   │
│  │   Estimated Audience: ~125,000 users                                     │   │
│  │   ⚠️ Minimum 100 potential participants required                        │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# 22.12.5 ACCESS CONTROL GATES - CRITICAL RESTRICTIONS
# ══════════════════════════════════════════════════════════════════════════════

## Survey B2B-Only Access Gate [DECISION P-015]

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SURVEY ACCESS CONTROL FLOW                                    │
│                    [DECISION P-015: Surveys B2B SaaS ONLY]                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SCENARIO: Regular user (Free/Plus/Premium) attempts to create Survey           │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────────────────┐  │
│  │ User clicks    │ ──► │ Check if user  │ ──► │ NO ORGANIZATION?           │  │
│  │ "Create Survey"│     │ has active org │     │ Show B2B-Only Gate         │  │
│  └────────────────┘     └────────────────┘     └────────────────────────────┘  │
│                                │                            │                   │
│                   Has org membership                        ▼                   │
│                                │               ┌────────────────────────────┐  │
│                                ▼               │  ┌─────────────────────┐   │  │
│                   ┌────────────────────┐       │  │  [Organization Icon]│   │  │
│                   │ Check org role     │       │  │                     │   │  │
│                   │ and permissions    │       │  │  Surveys are for    │   │  │
│                   └────────────────────┘       │  │  Organizations      │   │  │
│                       │           │            │  │                     │   │  │
│                    ADMIN/      MEMBER          │  │  Create or join an  │   │  │
│                    MANAGER     (no perm)       │  │  organization to    │   │  │
│                       │           │            │  │  create surveys     │   │  │
│                       ▼           ▼            │  │                     │   │  │
│               ┌───────────┐  ┌──────────────┐  │  │  [Create Org] [Join]│   │  │
│               │ Redirect  │  │ Show "Ask    │  │  │                     │   │  │
│               │ to Survey │  │ your admin   │  │  │  ─────────────────  │   │  │
│               │ Builder   │  │ for access"  │  │  │                     │   │  │
│               └───────────┘  └──────────────┘  │  │  Individual users:  │   │  │
│                                                │  │  Use Polls or Tests │   │  │
│                                                │  │  [Create Poll →]    │   │  │
│                                                │  └─────────────────────┘   │  │
│                                                └────────────────────────────┘  │
│                                                                                 │
│  API BEHAVIOR (POST /api/surveys):                                             │
│  ─────────────────────────────────                                             │
│  • 401 Unauthorized: No auth token                                             │
│  • 403 Forbidden: User not in any organization                                 │
│  • 403 Forbidden: User in org but no CREATE_SURVEY permission                  │
│  • 402 Payment Required: Org subscription expired                              │
│  • 429 Rate Limited: Org exceeded monthly survey quota                         │
│  • 200 OK: Survey created successfully                                         │
│                                                                                 │
│  [REFERENCE: BIBLE-014 createAction wrapper with requireOrganization]          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Pre-Test Failure Flow [DECISION P-014]

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PRE-TEST FAILURE FLOW                                         │
│                    [DECISION P-014: Pre-tests require Premium]                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SCENARIO: User fails pre-test questions before voting on poll                  │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────────────────┐  │
│  │ User opens     │ ──► │ Poll has       │ ──► │ Show Pre-Test              │  │
│  │ Poll page      │     │ pre-test?      │     │ (1-5 questions)            │  │
│  └────────────────┘     └────────────────┘     └────────────────────────────┘  │
│                                │                            │                   │
│                          No pre-test                        ▼                   │
│                                │               ┌────────────────────────────┐  │
│                                ▼               │ Evaluate answers:          │  │
│                       ┌────────────────┐       │ Pass threshold: X/Y        │  │
│                       │ Show Poll      │       │ (configurable by creator)  │  │
│                       │ directly       │       └────────────────────────────┘  │
│                       └────────────────┘                    │                   │
│                                                    PASS            FAIL         │
│                                                      │               │          │
│                                                      ▼               ▼          │
│                                            ┌──────────────┐ ┌──────────────────┐│
│                                            │ Show Poll    │ │ PRE-TEST FAILED  ││
│                                            │ Vote UI      │ │                  ││
│                                            │              │ │ ┌──────────────┐ ││
│                                            │ "Verified    │ │ │ You didn't   │ ││
│                                            │ Voter" badge │ │ │ pass the     │ ││
│                                            └──────────────┘ │ │ verification │ ││
│                                                             │ │              │ ││
│                                                             │ │ This poll    │ ││
│                                                             │ │ requires     │ ││
│                                                             │ │ knowledge    │ ││
│                                                             │ │ verification │ ││
│                                                             │ │              │ ││
│                                                             │ │ [Explore     │ ││
│                                                             │ │ Other Polls] │ ││
│                                                             │ │              │ ││
│                                                             │ │ [Go Home]    │ ││
│                                                             │ └──────────────┘ ││
│                                                             └──────────────────┘│
│                                                                                 │
│  RETRY POLICY:                                                                  │
│  ─────────────                                                                  │
│  • Max retries: 3 per poll per user                                            │
│  • Cooldown between retries: 24 hours                                          │
│  • Questions: Same set (randomized order) or different set (if pool exists)    │
│  • After 3 failures: Permanent block for this poll                             │
│                                                                                 │
│  DATABASE TRACKING:                                                             │
│  ──────────────────                                                             │
│  PreTestAttempt {                                                               │
│    userId: string                                                               │
│    pollId: string                                                               │
│    attemptNumber: 1-3                                                           │
│    score: number (correct/total)                                                │
│    passed: boolean                                                              │
│    attemptedAt: DateTime                                                        │
│    nextAllowedAt: DateTime | null                                               │
│  }                                                                              │
│                                                                                 │
│  NAVIGATION OPTIONS ON FAILURE:                                                 │
│  ──────────────────────────────                                                 │
│  1. [Explore Other Polls] → /explore                                           │
│  2. [Go Home] → /home                                                           │
│  3. [Try Again in 24h] → Shows countdown timer                                  │
│  4. Browser back → Allowed                                                      │
│                                                                                 │
│  [REFERENCE: BIBLE-006 Section 6.4.5 Pre-Test System]                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# 22.13 ORGANIZATION USER FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 22.13.1 Organization Owner Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORG OWNER FLOWS                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CAPABILITIES:                                                                  │
│  • Full organization control                                                    │
│  • Billing & subscription management                                            │
│  • SSO configuration (Enterprise)                                               │
│  • White-label settings (Enterprise)                                            │
│  • API key management                                                           │
│  • Delete organization                                                          │
│  • Transfer ownership                                                           │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW OO-001: ORGANIZATION SETUP                                                │
│  ════════════════════════════════                                               │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ Click "Create  │ ──► │ Organization   │ ──► │ Select Plan    │              │
│  │ Organization"  │     │ Details        │     │                │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                │                        │                       │
│                                ▼                        ▼                       │
│                     ┌────────────────────┐   ┌────────────────────┐            │
│                     │ • Organization Name│   │ ○ Starter $99/mo   │            │
│                     │ • Industry Type    │   │   - 5 members      │            │
│                     │ • Company Size     │   │   - 1,000 responses│            │
│                     │ • Country          │   │                    │            │
│                     │ • Logo Upload      │   │ ○ Professional     │            │
│                     │ • Website URL      │   │   $299/mo          │            │
│                     │                    │   │   - 25 members     │            │
│                     │ Documents:         │   │   - 10,000 resp.   │            │
│                     │ • Business Reg.    │   │                    │            │
│                     │ • Tax ID           │   │ ○ Enterprise       │            │
│                     │ • Auth Letter      │   │   $999/mo          │            │
│                     │                    │   │   - Unlimited      │            │
│                     └────────────────────┘   │   - SSO, API       │            │
│                                              │   - White-label    │            │
│                                              └────────────────────┘            │
│                                                       │                         │
│                                                       ▼                         │
│                                            ┌────────────────────┐               │
│                                            │ Payment & Review   │               │
│                                            │                    │               │
│                                            │ Approval: 2-5 days │               │
│                                            └────────────────────┘               │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW OO-002: MEMBER MANAGEMENT                                                 │
│  ══════════════════════════════                                                 │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Team Members                               [+ Invite]│  │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │ MEMBER                 │ ROLE        │ STATUS   │ ACTIONS        │   │   │
│  │  ├────────────────────────┼─────────────┼──────────┼────────────────┤   │   │
│  │  │ john@acme.com (You)    │ Owner       │ Active   │ -              │   │   │
│  │  │ jane@acme.com          │ Admin       │ Active   │ [⚙] [✕]        │   │   │
│  │  │ bob@acme.com           │ Creator     │ Active   │ [⚙] [✕]        │   │   │
│  │  │ alice@acme.com         │ Analyst     │ Active   │ [⚙] [✕]        │   │   │
│  │  │ pending@acme.com       │ Member      │ Pending  │ [Resend] [✕]   │   │   │
│  │  └────────────────────────┴─────────────┴──────────┴────────────────┘   │   │
│  │                                                                          │   │
│  │  Members: 4/5 (Starter Plan)  [Upgrade for more]                        │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Invite Modal:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Invite Team Members                                │   │
│  │                                                                          │   │
│  │   Email addresses (one per line):                                        │   │
│  │   ┌───────────────────────────────────────────────────────────────────┐ │   │
│  │   │ alice@acme.com                                                    │ │   │
│  │   │ bob@acme.com                                                      │ │   │
│  │   │                                                                   │ │   │
│  │   └───────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  │   Role: [Member ▼]                                                       │   │
│  │                                                                          │   │
│  │   ○ Member - Can participate in org surveys                             │   │
│  │   ○ Creator - Can create and manage own surveys                         │   │
│  │   ○ Analyst - Can view and export analytics                             │   │
│  │   ○ Admin - Full survey and member management                           │   │
│  │                                                                          │   │
│  │   [Cancel] [Send Invitations]                                            │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW OO-003: OWNERSHIP TRANSFER                                                │
│  ════════════════════════════════                                               │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ Settings →     │ ──► │ Select New     │ ──► │ Confirm with   │              │
│  │ Transfer       │     │ Owner (Admin)  │     │ Password       │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                                       │                         │
│                                                       ▼                         │
│                                            ┌────────────────────┐               │
│                                            │ Email Confirmation │               │
│                                            │ Sent to New Owner  │               │
│                                            │                    │               │
│                                            │ 30-day cooldown    │               │
│                                            │ before next        │               │
│                                            │ transfer           │               │
│                                            └────────────────────┘               │
│                                                                                 │
│  Notifications:                                                                 │
│  • All admins notified of transfer                                             │
│  • Previous owner becomes Admin                                                │
│  • Audit log entry created                                                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 22.13.2 Organization Admin Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORG ADMIN FLOWS                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CAPABILITIES:                                                                  │
│  • Member management (except Owner)                                             │
│  • All survey operations                                                        │
│  • View all org analytics                                                       │
│  • Data export                                                                  │
│  • Cannot: Billing, SSO config, delete org                                      │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW OA-001: SURVEY MANAGEMENT DASHBOARD                                       │
│  ═════════════════════════════════════════                                      │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      All Surveys                          [+ New Survey]│   │
│  │                                                                          │   │
│  │  Filters: [All Status ▼] [All Creators ▼] [Date Range ▼]               │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │ SURVEY                    │ CREATOR    │ STATUS  │ RESPONSES │ •• │   │   │
│  │  ├───────────────────────────┼────────────┼─────────┼───────────┼────┤   │   │
│  │  │ Q1 Employee Satisfaction  │ @jane      │ Active  │ 234/500   │ ⚙  │   │   │
│  │  │ Product Feedback March    │ @bob       │ Draft   │ -         │ ⚙  │   │   │
│  │  │ Training Needs Assessment │ @jane      │ Closed  │ 189/200   │ ⚙  │   │   │
│  │  │ Customer Experience 2025  │ @you       │ Active  │ 1,203     │ ⚙  │   │   │
│  │  └───────────────────────────┴────────────┴─────────┴───────────┴────┘   │   │
│  │                                                                          │   │
│  │  Total: 4 surveys  •  Active: 2  •  Responses this month: 1,437         │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW OA-002: DATA EXPORT                                                       │
│  ══════════════════════════                                                     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Export Survey Data                                 │   │
│  │                                                                          │   │
│  │   Survey: Q1 Employee Satisfaction                                       │   │
│  │                                                                          │   │
│  │   Export Format:                                                         │   │
│  │   ○ CSV (spreadsheet compatible)                                        │   │
│  │   ○ Excel (.xlsx)                                                        │   │
│  │   ○ JSON (API format)                                                    │   │
│  │   ○ SPSS (.sav)                                                          │   │
│  │                                                                          │   │
│  │   Include:                                                               │   │
│  │   ☑ All responses                                                        │   │
│  │   ☑ Timestamps                                                           │   │
│  │   ☑ Quality scores                                                       │   │
│  │   ☐ Demographics (anonymized)                                            │   │
│  │   ☐ Raw response IDs                                                     │   │
│  │                                                                          │   │
│  │   ⚠️ Data will be anonymized per k-anonymity rules (k=3)                │   │
│  │                                                                          │   │
│  │   [Cancel] [Export Data]                                                 │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  [REFERENCE] K-anonymity rules in BIBLE-015 Section 15.7.7                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 22.13.3 Organization Creator Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORG CREATOR FLOWS                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CAPABILITIES:                                                                  │
│  • Create surveys (within org limits)                                           │
│  • Manage own surveys only                                                      │
│  • View analytics for own surveys                                               │
│  • Cannot: See other creators' surveys, export org data                         │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW OC-001: CREATE SURVEY (ORG CONTEXT)                                       │
│  ═════════════════════════════════════════                                      │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ My Surveys     │ ──► │ + New Survey   │ ──► │ Survey Builder │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                                       │                         │
│                                                       ▼                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Survey Builder                                     │   │
│  │                                                                          │   │
│  │  ┌─────────────┐                                                        │   │
│  │  │ Setup       │ ← Current Step                                         │   │
│  │  │ Questions   │                                                        │   │
│  │  │ Logic       │                                                        │   │
│  │  │ Targeting   │                                                        │   │
│  │  │ Settings    │                                                        │   │
│  │  │ Review      │                                                        │   │
│  │  └─────────────┘                                                        │   │
│  │                                                                          │   │
│  │  Survey Title:                                                          │   │
│  │  [Customer Feedback Survey___________________________________]           │   │
│  │                                                                          │   │
│  │  Description:                                                            │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │   │
│  │  │ Help us improve our services by sharing your experience...       │  │   │
│  │  └───────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                          │   │
│  │  Estimated Duration: [5 ▼] minutes                                      │   │
│  │                                                                          │   │
│  │  [Save Draft]                               [Continue to Questions →]   │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Creator sees only their surveys:                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      My Surveys                           [+ New Survey]│   │
│  │                                                                          │   │
│  │  You have created 3 surveys                                             │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │ Customer Feedback Survey      │ Active   │ 45/100    │ [Manage] │   │   │
│  │  │ Product Testing Q1            │ Draft    │ -         │ [Edit]   │   │   │
│  │  │ NPS Survey December           │ Closed   │ 234       │ [View]   │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 22.13.4 Organization Member Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORG MEMBER FLOWS                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CAPABILITIES:                                                                  │
│  • Participate in org surveys                                                   │
│  • View own responses                                                           │
│  • Access org-only content                                                      │
│  • Cannot: Create surveys, view analytics, manage anything                     │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW OM-001: ORG DASHBOARD (MEMBER VIEW)                                       │
│  ═════════════════════════════════════════                                      │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Acme Corp Logo]                                                        │   │
│  │                                                                          │   │
│  │  Welcome back, John!                                                     │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐│   │
│  │  │                    Pending Surveys                                  ││   │
│  │  │                                                                     ││   │
│  │  │  🟠 Q1 Employee Satisfaction                     [Take Survey →]    ││   │
│  │  │     Due: Jan 31  •  ~10 min  •  Anonymous                           ││   │
│  │  │                                                                     ││   │
│  │  │  🟡 Department Feedback                          [Take Survey →]    ││   │
│  │  │     Due: Feb 15  •  ~5 min  •  Confidential                         ││   │
│  │  │                                                                     ││   │
│  │  └─────────────────────────────────────────────────────────────────────┘│   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐│   │
│  │  │                    Completed Surveys                                ││   │
│  │  │                                                                     ││   │
│  │  │  ✓ Training Needs Assessment       Completed Dec 15  [View Receipt] ││   │
│  │  │  ✓ Annual Review Feedback          Completed Dec 1   [View Receipt] ││   │
│  │  │                                                                     ││   │
│  │  └─────────────────────────────────────────────────────────────────────┘│   │
│  │                                                                          │   │
│  │  [🔙 Back to VoxPoll]                                                    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Note: Member cannot see survey results or other members' participation        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# 22.14 PLATFORM ADMIN & MODERATOR FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 22.14.1 Platform Admin Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PLATFORM ADMIN FLOWS                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CAPABILITIES:                                                                  │
│  • Full system access                                                           │
│  • User management (ban, suspend, verify)                                       │
│  • Content moderation                                                           │
│  • System configuration                                                         │
│  • Platform analytics                                                           │
│  • Organization management                                                      │
│  • Support tools                                                                │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW PA-001: ADMIN DASHBOARD                                                   │
│  ═════════════════════════════                                                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      VoxPoll Admin Dashboard                            │   │
│  │                                                                          │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │ Users      │ │ Content    │ │ Reports    │ │ Revenue    │            │   │
│  │  │   234,567  │ │    45,123  │ │      127   │ │  $12,450   │            │   │
│  │  │  +2.3% ↑   │ │  +5.1% ↑   │ │   -12% ↓   │ │   +8% ↑    │            │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘            │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Pending Actions                               │   │   │
│  │  │                                                                  │   │   │
│  │  │  🔴 12 Reports awaiting review                      [Review →]   │   │   │
│  │  │  🟠 5 Organizations pending approval                [Review →]   │   │   │
│  │  │  🟡 23 Flagged content items                        [Review →]   │   │   │
│  │  │  🔵 8 Support tickets escalated                     [View →]     │   │   │
│  │  │                                                                  │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Quick Actions                                 │   │   │
│  │  │                                                                  │   │   │
│  │  │  [Search Users]  [Search Content]  [View Logs]  [System Status] │   │   │
│  │  │                                                                  │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW PA-002: USER MANAGEMENT                                                   │
│  ═════════════════════════════                                                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      User Detail: @suspicious_user                      │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Profile                          │  Statistics                    │ │   │
│  │  │  ─────────                        │  ──────────                    │ │   │
│  │  │  Email: user@example.com          │  Polls Created: 47             │ │   │
│  │  │  Phone: +90 555 ***              │  Participation: 234            │ │   │
│  │  │  Joined: Jan 15, 2025             │  Comments: 89                  │ │   │
│  │  │  Status: 🟢 Active                │  Reports Received: 5          │ │   │
│  │  │  Tier: Free                       │  Reports Made: 12             │ │   │
│  │  │  Verification: Phone ✓            │  Fraud Score: 23/100          │ │   │
│  │  │                                   │  Trust Score: 67/100          │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Recent Activity                                                   │ │   │
│  │  │  ────────────────                                                  │ │   │
│  │  │  • Created poll "Best crypto?" - 2 hours ago                      │ │   │
│  │  │  • Comment flagged for spam - 5 hours ago                         │ │   │
│  │  │  • Voted on 12 polls - today                                       │ │   │
│  │  │  • Account warning sent - 2 days ago                              │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  │  Actions:                                                                │   │
│  │  [Send Warning] [Suspend 24h] [Suspend 7d] [Ban Permanently]            │   │
│  │  [Reset Password] [Force Logout] [View IP History] [Export Data]        │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW PA-003: SYSTEM CONFIGURATION                                              │
│  ══════════════════════════════════                                             │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      System Settings                                    │   │
│  │                                                                          │   │
│  │  Feature Flags:                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │ FEATURE                      │ STATUS │ ROLLOUT │ ACTIONS         │ │   │
│  │  ├──────────────────────────────┼────────┼─────────┼─────────────────┤ │   │
│  │  │ Live Polls                   │ 🟢 On  │ 100%    │ [Configure]     │ │   │
│  │  │ New Feed Algorithm           │ 🟡 Beta│ 25%     │ [Configure]     │ │   │
│  │  │ AI Content Moderation        │ 🟢 On  │ 100%    │ [Configure]     │ │   │
│  │  │ Sponsored Content            │ 🔴 Off │ 0%      │ [Enable]        │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  │  Rate Limits:                                                            │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │ Global API: [1000] req/min     Poll Creation: [10] /hour (free)   │ │   │
│  │  │ Login Attempts: [10] /15min    Registration: [5] /hour/IP         │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  │  Maintenance Mode:                                                       │   │
│  │  ○ Off  ○ Read-only  ○ Full maintenance                                 │   │
│  │                                                                          │   │
│  │  [Save Changes]                                                          │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 22.14.2 Platform Moderator Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PLATFORM MODERATOR FLOWS                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CAPABILITIES:                                                                  │
│  • Content review & moderation                                                  │
│  • Report handling                                                              │
│  • User warnings                                                                │
│  • Comment moderation                                                           │
│  • Cannot: System config, billing, permanent bans (escalate to admin)          │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW PM-001: MODERATION QUEUE                                                  │
│  ══════════════════════════════                                                 │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Moderation Queue                                   │   │
│  │                                                                          │   │
│  │  Filters: [All Types ▼] [Priority ▼] [Assigned to Me ☐]                │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │ 🔴 HIGH - Reported Poll                                          │   │   │
│  │  │    "Is [political figure] the worst leader ever?"                 │   │   │
│  │  │    Reason: Hate speech (5 reports)                                │   │   │
│  │  │    [Review] [Remove] [Dismiss] [Escalate]                         │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │ 🟠 MEDIUM - Flagged Comment                                      │   │   │
│  │  │    "You're all idiots if you think..."                           │   │   │
│  │  │    Reason: AI flagged - harassment                                │   │   │
│  │  │    [Review] [Remove] [Dismiss] [Warn User]                        │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │ 🟡 LOW - Reported User                                           │   │   │
│  │  │    @spammer123 - "Promoting external website"                    │   │   │
│  │  │    Reason: Spam (2 reports)                                       │   │   │
│  │  │    [Review Profile] [Warn] [Dismiss]                              │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  Queue: 23 items  •  Avg. resolution time: 4.2 hours                    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW PM-002: CONTENT REVIEW                                                    │
│  ════════════════════════════                                                   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Content Review                                     │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  REPORTED CONTENT                                                  │ │   │
│  │  │  ─────────────────                                                 │ │   │
│  │  │                                                                    │ │   │
│  │  │  Poll: "Is [political figure] the worst leader ever?"             │ │   │
│  │  │                                                                    │ │   │
│  │  │  Options:                                                          │ │   │
│  │  │  1. Yes, absolutely                                                │ │   │
│  │  │  2. No, there are worse                                            │ │   │
│  │  │  3. I don't care about politics                                    │ │   │
│  │  │                                                                    │ │   │
│  │  │  Created by: @political_guy • 6 hours ago                         │ │   │
│  │  │  Votes: 1,234 • Comments: 89                                       │ │   │
│  │  │                                                                    │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  REPORTS (5)                                                       │ │   │
│  │  │  ────────────                                                      │ │   │
│  │  │  • @user1: "Hate speech against political group"                  │ │   │
│  │  │  • @user2: "Inflammatory content"                                  │ │   │
│  │  │  • @user3: "Hate speech"                                           │ │   │
│  │  │  • @user4: "Political propaganda"                                  │ │   │
│  │  │  • @user5: "Divisive content"                                      │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  │  AI Analysis: 72% likely policy violation (hate speech category)        │   │
│  │                                                                          │   │
│  │  Decision:                                                               │   │
│  │  ○ Remove content (policy violation)                                    │   │
│  │  ○ Remove + Warn creator                                                │   │
│  │  ○ Remove + Suspend creator (24h)                                       │   │
│  │  ○ Dismiss reports (no violation)                                       │   │
│  │  ○ Escalate to Admin                                                    │   │
│  │                                                                          │   │
│  │  Reason: [________________________________]                              │   │
│  │                                                                          │   │
│  │  [Submit Decision]                                                       │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# 22.15 EDGE CASE & ERROR STATE FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 22.15.1 Account State Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ACCOUNT STATE FLOWS                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FLOW E-001: SUSPENDED ACCOUNT                                                  │
│  ══════════════════════════════                                                 │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ User Attempts  │ ──► │ Auth Check     │ ──► │ Suspension     │              │
│  │ Login          │     │ Detects Status │     │ Screen         │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                                       │                         │
│                                                       ▼                         │
│                                            ┌────────────────────┐               │
│                                            │  Account Suspended │               │
│                                            │                    │               │
│                                            │ Your account has   │               │
│                                            │ been suspended     │               │
│                                            │ until: Feb 15, 2026│               │
│                                            │                    │               │
│                                            │ Reason:            │               │
│                                            │ Community guideline│               │
│                                            │ violation          │               │
│                                            │                    │               │
│                                            │ [Learn More]       │               │
│                                            │ [Appeal Decision]  │               │
│                                            │                    │               │
│                                            │ Suspension history:│               │
│                                            │ • 1st: Dec 2025    │               │
│                                            │ • 2nd: This (7d)   │               │
│                                            │                    │               │
│                                            │ ⚠️ Next violation  │               │
│                                            │ may result in      │               │
│                                            │ permanent ban      │               │
│                                            └────────────────────┘               │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW E-002: LOCKED ACCOUNT (Failed Login Attempts)                             │
│  ═══════════════════════════════════════════════════                            │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ 5th Failed     │ ──► │ Account        │ ──► │ Lockout        │              │
│  │ Login Attempt  │     │ Auto-Locked    │     │ Screen         │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                                       │                         │
│                                                       ▼                         │
│                                            ┌────────────────────┐               │
│                                            │  Account Locked    │               │
│                                            │                    │               │
│                                            │ Too many failed    │               │
│                                            │ login attempts.    │               │
│                                            │                    │               │
│                                            │ Try again in:      │               │
│                                            │     14:32          │               │
│                                            │                    │               │
│                                            │ [Reset Password]   │               │
│                                            │ [Contact Support]  │               │
│                                            └────────────────────┘               │
│                                                                                 │
│  [REFERENCE] BIBLE-015 Section 15.2.3 ACC_005 - Account Lockout Rules          │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW E-003: EXPIRED SUBSCRIPTION                                               │
│  ═════════════════════════════════                                              │
│                                                                                 │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
│  │ Premium User   │ ──► │ Subscription   │ ──► │ Downgrade      │              │
│  │ Logs In        │     │ Expired        │     │ Notice         │              │
│  └────────────────┘     └────────────────┘     └────────────────┘              │
│                                                       │                         │
│                                                       ▼                         │
│                                            ┌────────────────────┐               │
│                                            │ Subscription Ended │               │
│                                            │                    │               │
│                                            │ Your Premium       │               │
│                                            │ subscription       │               │
│                                            │ expired on Jan 15  │               │
│                                            │                    │               │
│                                            │ You now have:      │               │
│                                            │ • Free tier limits │               │
│                                            │ • 3 polls/day      │               │
│                                            │ • No Live Polls    │               │
│                                            │ • PULSE + COMMENTS after vote │               │
│                                            │                    │               │
│                                            │ Your content is    │               │
│                                            │ still available    │               │
│                                            │                    │               │
│                                            │ [Renew Premium]    │               │
│                                            │ [Continue Free]    │               │
│                                            └────────────────────┘               │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW E-004: BLOCKED USER INTERACTION                                           │
│  ═════════════════════════════════════                                          │
│                                                                                 │
│  When blocked user A tries to interact with blocker B:                         │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ ACTION                        │ RESULT                                  │   │
│  ├───────────────────────────────┼─────────────────────────────────────────┤   │
│  │ View B's profile              │ "This profile is not available"         │   │
│  │ View B's content              │ Content hidden from feed/search         │   │
│  │ Comment on B's content        │ "You cannot comment on this content"    │   │
│  │ Follow B                      │ "This action is not available"          │   │
│  │ @mention B in comment         │ Mention not processed, looks normal     │   │
│  │                               │ to A but B doesn't see notification     │   │
│  │ Report B                      │ Allowed (for safety reasons)            │   │
│  └───────────────────────────────┴─────────────────────────────────────────┘   │
│                                                                                 │
│  Note: A is not notified they are blocked (to prevent escalation)              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 22.15.2 Content State Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CONTENT STATE FLOWS                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FLOW E-005: DELETED CONTENT                                                    │
│  ════════════════════════════                                                   │
│                                                                                 │
│  User visits URL of deleted poll:                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                        Content Not Available                             │   │
│  │                                                                          │   │
│  │                    This poll has been removed.                           │   │
│  │                                                                          │   │
│  │          It may have been deleted by the creator or                      │   │
│  │          removed for violating our community guidelines.                 │   │
│  │                                                                          │   │
│  │                       [Explore Other Polls]                              │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW E-006: EXPIRED POLL                                                       │
│  ══════════════════════════                                                     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │   What's the best programming language for beginners?                    │   │
│  │                                                                          │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │                    🏁 POLL ENDED                                │   │   │
│  │   │                                                                 │   │   │
│  │   │  This poll closed on Jan 15, 2026                              │   │   │
│  │   │                                                                 │   │   │
│  │   │  Final Results:                                                 │   │   │
│  │   │  Python      ████████████████████████████░░  62%  (5,234)      │   │   │
│  │   │  JavaScript  ████████████░░░░░░░░░░░░░░░░░░  28%  (2,367)      │   │   │
│  │   │  Scratch     ████░░░░░░░░░░░░░░░░░░░░░░░░░░  10%  (845)        │   │   │
│  │   │                                                                 │   │   │
│  │   │  Total: 8,446 votes                                             │   │   │
│  │   │                                                                 │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │   [View Discussion (234 comments)] [Share Results]                       │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW E-007: PRIVATE CONTENT ACCESS DENIED                                      │
│  ══════════════════════════════════════════                                     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                        🔒 Private Content                                │   │
│  │                                                                          │   │
│  │         This poll is only accessible via private link.                   │   │
│  │                                                                          │   │
│  │    If you received a link, make sure you're using the                    │   │
│  │    complete URL including the access code.                               │   │
│  │                                                                          │   │
│  │                Example: voxpoll.com/share/abc123                         │   │
│  │                                                                          │   │
│  │                     [Go to Homepage]                                     │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW E-008: TARGET AUDIENCE MISMATCH                                           │
│  ═════════════════════════════════════                                          │
│                                                                                 │
│  User doesn't match poll's target audience:                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │   Best coding bootcamps for career changers?                             │   │
│  │                                                                          │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │   │                    Not Eligible                                 │   │   │
│  │   │                                                                 │   │   │
│  │   │  This poll is targeted to specific demographics                │   │   │
│  │   │  that don't match your profile.                                │   │   │
│  │   │                                                                 │   │   │
│  │   │  Target: Ages 25-44 in Turkey                                  │   │   │
│  │   │                                                                 │   │   │
│  │   │  This helps ensure relevant and accurate results.              │   │   │
│  │   │                                                                 │   │   │
│  │   │  [View Results Only] [Find Similar Polls]                       │   │   │
│  │   │                                                                 │   │   │
│  │   └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# 22.16 MOBILE-SPECIFIC FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 22.16.1 Mobile Navigation & Gestures

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      MOBILE-SPECIFIC FLOWS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GESTURE DEFINITIONS:                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ GESTURE             │ ACTION                                            │   │
│  ├─────────────────────┼──────────────────────────────────────────────────┤   │
│  │ Pull down           │ Refresh feed                                      │   │
│  │ Swipe left on card  │ Show quick actions (save, share, hide)           │   │
│  │ Swipe right on card │ Quick vote (if single-tap voting enabled)        │   │
│  │ Double tap on result│ Share to stories                                 │   │
│  │ Long press on poll  │ Show share options                               │   │
│  │ Pinch on results    │ Zoom in/out on chart                             │   │
│  │ Swipe up on COMMENTS   │ Expand discussion panel                          │   │
│  │ Swipe between tabs  │ Navigate feed sections                           │   │
│  └─────────────────────┴──────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW M-001: MOBILE POLL CREATION (QUICK)                                       │
│  ═════════════════════════════════════════                                      │
│                                                                                 │
│  ┌─────────────┐                                                                │
│  │ ╔═════════╗ │     Step 1: Write Question                                    │
│  │ ║ Create  ║ │     ──────────────────────                                    │
│  │ ║  Poll   ║ │     ┌─────────────────────┐                                   │
│  │ ╠═════════╣ │     │                     │                                   │
│  │ ║ What's  ║ │     │ Ask your question   │                                   │
│  │ ║ your    ║ │     │ ___________________ │                                   │
│  │ ║ quest.. ║ │     │                     │                                   │
│  │ ╠═════════╣ │     │ [Next →]            │                                   │
│  │ ║ Option 1║ │     │                     │                                   │
│  │ ║ Option 2║ │     │ Keyboard            │                                   │
│  │ ║ + Add   ║ │     └─────────────────────┘                                   │
│  │ ╠═════════╣ │                                                                │
│  │ ║ [Post]  ║ │     Step 2: Add Options (inline)                              │
│  │ ╚═════════╝ │     ────────────────────────────                              │
│  └─────────────┘     Options auto-expand as you type                           │
│                                                                                 │
│  Mobile-optimized features:                                                    │
│  • Single-screen creation (no steps)                                           │
│  • Large touch targets                                                         │
│  • Auto-focus on next field                                                    │
│  • Haptic feedback on post                                                     │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW M-002: MOBILE FEED NAVIGATION                                             │
│  ═══════════════════════════════════                                            │
│                                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                       │
│  │ ╔═════════╗ │     │ ╔═════════╗ │     │ ╔═════════╗ │                       │
│  │ ║ For You ║ │ ←──►│ ║Following║ │ ←──►│ ║Discover ║ │                       │
│  │ ╚═════════╝ │     │ ╚═════════╝ │     │ ╚═════════╝ │                       │
│  │             │     │             │     │             │                       │
│  │ [Poll Card]│     │ [Poll Card]│     │ [Sponsored] │                       │
│  │             │     │             │     │             │                       │
│  │ [Poll Card]│     │ [Test Card]│     │ [Poll Card]│                       │
│  │             │     │             │     │             │                       │
│  │ [Test Card]│     │ [Poll Card]│     │ [Test Card]│                       │
│  │             │     │             │     │             │                       │
│  │ ───────────│     │ ───────────│     │ ───────────│                       │
│  │ 🏠 🔍 ➕ 🔔 👤│     │ 🏠 🔍 ➕ 🔔 👤│     │ 🏠 🔍 ➕ 🔔 👤│                       │
│  └─────────────┘     └─────────────┘     └─────────────┘                       │
│       ↑                    ↑                    ↑                              │
│       └────────── Swipe left/right ─────────────┘                              │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW M-003: MOBILE PULSE + COMMENTS EXPERIENCE                                            │
│  ════════════════════════════════════                                           │
│                                                                                 │
│  After voting, COMMENTS panel slides up:                                          │
│                                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                       │
│  │ ╔═════════╗ │     │ ╔═════════╗ │     │ ╔═════════╗ │                       │
│  │ ║ Results ║ │     │ ║ Results ║ │     │ ║Discussion║│                       │
│  │ ║         ║ │ ──► │ ║   Mini  ║ │ ──► │ ║ Full    ║ │                       │
│  │ ║ Charts  ║ │     │ ╠═════════╣ │     │ ║ Screen  ║ │                       │
│  │ ║         ║ │     │ ║ COMMENTS║ │     │ ║         ║ │                       │
│  │ ╠═════════╣ │     │ ║ Preview ║ │     │ ║ Comments║ │                       │
│  │ ║ COMMENTS║ │     │ ║ 3 top   ║ │     │ ║ Thread  ║ │                       │
│  │ ║ Peek    ║ │     │ ║ comments║ │     │ ║         ║ │                       │
│  │ ╚═════════╝ │     │ ╚═════════╝ │     │ ╚═════════╝ │                       │
│  └─────────────┘     └─────────────┘     └─────────────┘                       │
│       ↑                    ↑                    ↑                              │
│       │              Swipe up            Swipe up again                        │
│       └─────────────────────────────────────────┘                              │
│                        Swipe down to collapse                                  │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  FLOW M-004: MOBILE LIVE POLL JOIN                                              │
│  ══════════════════════════════════                                             │
│                                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                       │
│  │ ╔═════════╗ │     │ ╔═════════╗ │     │ ╔═════════╗ │                       │
│  │ ║ QR Scan ║ │ OR  │ ║ Enter   ║ │     │ ║ Waiting ║ │                       │
│  │ ║   📷    ║ │ ──► │ ║ Code    ║ │ ──► │ ║  Room   ║ │                       │
│  │ ║         ║ │     │ ║ ABC123  ║ │     │ ║   47    ║ │                       │
│  │ ║ Point at║ │     │ ║         ║ │     │ ║ joined  ║ │                       │
│  │ ║ QR code ║ │     │ ║ [Join]  ║ │     │ ║         ║ │                       │
│  │ ╚═════════╝ │     │ ╚═════════╝ │     │ ╚═════════╝ │                       │
│  └─────────────┘     └─────────────┘     └─────────────┘                       │
│                                                       │                         │
│                                              Host starts                        │
│                                                       │                         │
│                                                       ▼                         │
│                                            ┌─────────────┐                      │
│                                            │ ╔═════════╗ │                      │
│                                            │ ║ VOTE!   ║ │                      │
│                                            │ ║         ║ │                      │
│                                            │ ║ ○ Opt 1 ║ │                      │
│                                            │ ║ ○ Opt 2 ║ │                      │
│                                            │ ║ ○ Opt 3 ║ │                      │
│                                            │ ║         ║ │                      │
│                                            │ ║ ⏱ 0:25  ║ │                      │
│                                            │ ╚═════════╝ │                      │
│                                            └─────────────┘                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# 22.17 SEARCH & DISCOVERY UI FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 22.17.1 Search Bar & Input Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SEARCH BAR UI FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  IDLE STATE (Desktop - Header)                                                  │
│  ─────────────────────────────                                                  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]   Feed   Keşfet   🔍 Ara...                      [+] [@] [≡]    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  FOCUSED STATE (Expanded)                                                       │
│  ────────────────────────                                                       │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]   Feed   Keşfet   ┌─────────────────────────┐    [+] [@] [≡]    │  │
│  │                           │ 🔍 içerik ara...      ✕ │                    │  │
│  │                           └─────────────────────────┘                    │  │
│  │                           ┌─────────────────────────┐                    │  │
│  │                           │  SON ARAMALAR          │                    │  │
│  │                           │  ─────────────         │                    │  │
│  │                           │  🕐 siyaset anketleri  │                    │  │
│  │                           │  🕐 kişilik testi      │                    │  │
│  │                           │  🕐 en iyi film        │                    │  │
│  │                           │  ─────────────         │                    │  │
│  │                           │  POPÜLER ARAMALAR      │                    │  │
│  │                           │  ─────────────         │                    │  │
│  │                           │  🔥 2026 seçim anketi  │                    │  │
│  │                           │  🔥 hangi karakter     │                    │  │
│  │                           │  🔥 favori yemek       │                    │  │
│  │                           └─────────────────────────┘                    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  TYPING STATE (Live Suggestions)                                                │
│  ───────────────────────────────                                                │
│                                                                                 │
│  ┌─────────────────────────┐                                                    │
│  │ 🔍 kişilik tes|        │                                                    │
│  └─────────────────────────┘                                                    │
│  ┌─────────────────────────────────────────────────┐                            │
│  │  ÖNERILER                                       │                            │
│  │  ─────────                                      │                            │
│  │  📝 kişilik testi - en çok katılan             │                            │
│  │  📝 kişilik testleri mbti                       │                            │
│  │  📝 kişilik analizi                             │                            │
│  │  ─────────────────────────────────────          │                            │
│  │  İÇERİK                                         │                            │
│  │  ─────────                                      │                            │
│  │  🧠 "Sen Hangi MBTI Tipisin?" - 15.2K katılım   │                            │
│  │  🧠 "Kişilik Özelliklerini Keşfet" - 8.7K       │                            │
│  │  👤 @kisilik_testleri (Creator)                 │                            │
│  └─────────────────────────────────────────────────┘                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.17.2 Search Results Page

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SEARCH RESULTS PAGE                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  🔍 "kişilik testi"                                         ✕ [🔍]     │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  FILTRELER                                                               │  │
│  │  ─────────────────────────────────────────────────────────────────────   │  │
│  │                                                                          │  │
│  │  İçerik Tipi:  [Tümü ▼]  [Anket] [Test] [Araştırma]                     │  │
│  │                                                                          │  │
│  │  Kategori:     [Tümü ▼]  [Eğlence] [Siyaset] [Spor] [Bilim] [+5]       │  │
│  │                                                                          │  │
│  │  Sıralama:     [Alakalılık ▼]  [En Yeni] [En Popüler] [En Güvenilir]   │  │
│  │                                                                          │  │
│  │  Diğer:        [☐ Sadece aktif] [☐ Katıldıklarım hariç]                 │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  "kişilik testi" için 156 sonuç bulundu                                        │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  🧠 Sen Hangi MBTI Tipisin?                                              │  │
│  │  ──────────────────────────────────────────────────────────────────────  │  │
│  │  "**Kişilik testi**nde 16 farklı tip arasında senin..."                 │  │
│  │                                                                          │  │
│  │  👤 @psikolog_dr   📊 15.2K katılım   ⭐ 4.8 güvenilirlik               │  │
│  │  🏷️ Psikoloji, Kişilik, MBTI                                            │  │
│  │                                                                          │  │
│  │  [Katıl]  [Paylaş]  [Kaydet]                                            │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  🧠 Kişilik Özelliklerini Keşfet                                        │  │
│  │  ──────────────────────────────────────────────────────────────────────  │  │
│  │  "Bu **kişilik testi** ile güçlü ve zayıf yönlerini..."                 │  │
│  │                                                                          │  │
│  │  👤 @kariyer_kocu   📊 8.7K katılım   ⭐ 4.5 güvenilirlik               │  │
│  │  🏷️ Kariyer, Kişilik, Gelişim                                           │  │
│  │                                                                          │  │
│  │  [Katıl]  [Paylaş]  [Kaydet]                                            │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  PROFILLER                                                                      │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  👤 @kisilik_testleri                                      [+ Takip Et] │  │
│  │  ──────────────────────────────────────────────────────────────────────  │  │
│  │  "Günlük **kişilik testleri** ve psikolojik analizler"                  │  │
│  │  📊 45 test   👥 12.3K takipçi                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│                         [Daha Fazla Yükle]                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.17.3 Mobile Search Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MOBILE SEARCH FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STEP 1: TAP SEARCH ICON                STEP 2: SEARCH SCREEN                   │
│  ──────────────────────────────         ────────────────────────                │
│                                                                                 │
│  ┌─────────────┐                        ┌─────────────┐                         │
│  │ ╔═════════╗ │                        │ ╔═════════╗ │                         │
│  │ ║  Feed   ║ │                        │ ║ 🔍 Ara..║ │                         │
│  │ ╠═════════╣ │                        │ ╠═════════╣ │                         │
│  │ ║ Content ║ │                        │ ║ SON     ║ │                         │
│  │ ║  Cards  ║ │  Tap 🔍                │ ║ ARAMALAR║ │                         │
│  │ ║         ║ │  ───────►              │ ║         ║ │                         │
│  │ ╠═════════╣ │                        │ ║ • mbti  ║ │                         │
│  │ ║🏠🔍📊👤 ║ │                        │ ║ • anket ║ │                         │
│  │ ╚═════════╝ │                        │ ╚═════════╝ │                         │
│  └─────────────┘                        └─────────────┘                         │
│                                                                                 │
│  STEP 3: TYPING                         STEP 4: RESULTS                         │
│  ──────────────────                     ────────────────                        │
│                                                                                 │
│  ┌─────────────┐                        ┌─────────────┐                         │
│  │ ╔═════════╗ │                        │ ╔═════════╗ │                         │
│  │ ║🔍 mbti |║ │                        │ ║🔍 mbti ✕║ │                         │
│  │ ╠═════════╣ │                        │ ╠═════════╣ │                         │
│  │ ║ ÖNERİLER║ │                        │ ║[Filtre▼]║ │                         │
│  │ ║         ║ │  [Ara]                 │ ╠═════════╣ │                         │
│  │ ║ • mbti  ║ │  ───────►              │ ║ 🧠 Test1║ │                         │
│  │ ║   testi ║ │                        │ ║ 🧠 Test2║ │                         │
│  │ ║ • mbti  ║ │                        │ ║ 🧠 Test3║ │                         │
│  │ ║   analiz║ │                        │ ║         ║ │                         │
│  │ ╚═════════╝ │                        │ ╚═════════╝ │                         │
│  └─────────────┘                        └─────────────┘                         │
│                                                                                 │
│  MOBILE FILTER SHEET (Bottom Sheet)                                             │
│  ─────────────────────────────────                                              │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ═══════════════════════════════════════════════════════════════════   │   │
│  │                                                                         │   │
│  │                          FİLTRELER                          [Temizle]   │   │
│  │                                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                         │   │
│  │  İçerik Tipi                                                            │   │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────────┐                           │   │
│  │  │ Tümü  │ │ Anket │ │ Test  │ │ Araştırma │                           │   │
│  │  │  ✓    │ │       │ │       │ │           │                           │   │
│  │  └───────┘ └───────┘ └───────┘ └───────────┘                           │   │
│  │                                                                         │   │
│  │  Sıralama                                                               │   │
│  │  ○ Alakalılık  ● En Popüler  ○ En Yeni  ○ En Güvenilir                 │   │
│  │                                                                         │   │
│  │  Kategoriler                                                            │   │
│  │  ☐ Eğlence  ☐ Siyaset  ☐ Spor  ☐ Bilim  ☐ Teknoloji                   │   │
│  │                                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                     156 Sonuç Göster                            │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.17.4 Empty & Error States for Search

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SEARCH EMPTY & ERROR STATES                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  NO RESULTS FOUND                                                               │
│  ───────────────                                                                │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │                         🔍                                               │  │
│  │                                                                          │  │
│  │              "asdfghjkl" için sonuç bulunamadı                          │  │
│  │                                                                          │  │
│  │              Öneriler:                                                   │  │
│  │              • Yazım hatası olup olmadığını kontrol edin                │  │
│  │              • Daha genel terimler kullanın                             │  │
│  │              • Filtreleri temizleyin                                    │  │
│  │                                                                          │  │
│  │              ─────────────────────────────────────────                   │  │
│  │                                                                          │  │
│  │              Bunları deneyebilirsiniz:                                   │  │
│  │              🔥 Trend anketler  🌟 Popüler testler                       │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  SEARCH ERROR                                                                   │
│  ────────────                                                                   │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │                         ⚠️                                              │  │
│  │                                                                          │  │
│  │              Arama yapılırken bir hata oluştu                           │  │
│  │                                                                          │  │
│  │              Lütfen internet bağlantınızı kontrol edip                   │  │
│  │              tekrar deneyin.                                             │  │
│  │                                                                          │  │
│  │              ┌──────────────────────────────────────┐                    │  │
│  │              │          Tekrar Dene                 │                    │  │
│  │              └──────────────────────────────────────┘                    │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  QUERY TOO SHORT                                                                │
│  ──────────────                                                                 │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  🔍 "a"                                                                  │  │
│  │  ⚠️ En az 2 karakter girmeniz gerekiyor                                 │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.17.5 Recent & Saved Searches

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         RECENT & SAVED SEARCHES                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  USER SEARCH HISTORY MANAGEMENT                                                 │
│  ─────────────────────────────                                                  │
│                                                                                 │
│  Settings > Gizlilik > Arama Geçmişi                                            │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  Arama Geçmişi                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────  │  │
│  │                                                                          │  │
│  │  ☑️ Arama geçmişini kaydet                                              │  │
│  │     Son 10 aramanız gösterilecek                                        │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────  │  │
│  │                                                                          │  │
│  │  Son Aramalar                                                            │  │
│  │                                                                          │  │
│  │  🕐 kişilik testi                                              [✕]      │  │
│  │  🕐 siyaset anketi 2026                                        [✕]      │  │
│  │  🕐 en iyi film                                                [✕]      │  │
│  │  🕐 hangi karakter                                             [✕]      │  │
│  │  🕐 favori yemek                                               [✕]      │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────  │  │
│  │                                                                          │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │  │
│  │  │              Tüm Arama Geçmişini Temizle                         │   │  │
│  │  └──────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  SEARCH BEHAVIOR                                                                │
│  ───────────────                                                                │
│                                                                                 │
│  • Recent searches: Max 10, stored locally + synced to account                  │
│  • Popular searches: Server-side aggregation, updated hourly                    │
│  • Suggestions: Based on search index + user's categories                       │
│  • Debounce: 300ms delay before showing suggestions                             │
│  • Min characters: 2 for search, 1 for suggestions                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ══════════════════════════════════════════════════════════════════════════════
# 22.18 DIRECT MESSAGING UI FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 22.18.1 DM Inbox Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  FLOW DM-001: DIRECT MESSAGE INBOX                                              │
│  ═══════════════════════════════════                                            │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  Messages                                              [New Message ✉️]   │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                          │  │
│  │  🔍 Search conversations...                                              │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 📌 Message Requests (3)                                        [→] │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 🟢 @ahmet_yilmaz                                           2m ago │ │  │
│  │  │    Harika sonuçlar! Paylaştığın için teşekkürler 🎉               │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ ⚪ @zeynep_k                                               1h ago │ │  │
│  │  │    Sen: Anketi gördün mü?                                         │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ ⚪ @survey_master                                          3d ago │ │  │
│  │  │    Araştırma sonuçlarını paylaşabilir misin?                      │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  [Load more conversations...]                                            │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  INBOX FEATURES                                                                 │
│  ───────────────                                                                │
│  • Unread indicator: Green dot for unread messages                              │
│  • Online status: Green circle for online, grey for offline                     │
│  • Message preview: First 50 characters of last message                         │
│  • Timestamp: Relative time (2m ago, 1h ago, 3d ago)                           │
│  • Search: Filter by username or message content                                │
│  • Sort: Most recent first (default), can't be changed                         │
│                                                                                 │
│  MESSAGE REQUESTS                                                               │
│  ────────────────                                                               │
│  • Non-followers' messages go to requests                                       │
│  • Badge shows count of pending requests                                        │
│  • Accept/Decline actions available                                             │
│  • Declined messages: User not notified, can resend after 30 days              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.18.2 DM Conversation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  FLOW DM-002: CONVERSATION VIEW                                                 │
│  ════════════════════════════════                                               │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  [←] @ahmet_yilmaz                                        [⋮ Options]   │  │
│  │       🟢 Online now                                                      │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                          │  │
│  │                                          ┌─────────────────────────────┐ │  │
│  │                                          │ Merhaba! Anket sonuçlarını  │ │  │
│  │                                          │ gördüm, çok ilginç!         │ │  │
│  │                                          │                   10:30 ✓✓  │ │  │
│  │                                          └─────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────┐                                 │  │
│  │  │ Teşekkürler! Beklediğimden farklı   │                                 │  │
│  │  │ sonuçlar çıktı açıkçası 😅          │                                 │  │
│  │  │ 10:32                                │                                 │  │
│  │  └─────────────────────────────────────┘                                 │  │
│  │                                                                          │  │
│  │                                          ┌─────────────────────────────┐ │  │
│  │                                          │ Harika sonuçlar! Paylaştığın│ │  │
│  │                                          │ için teşekkürler 🎉         │ │  │
│  │                                          │                   10:35 ✓✓  │ │  │
│  │                                          └─────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 📎  Message...                                            [Send →] │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  MESSAGE STATUS INDICATORS                                                      │
│  ─────────────────────────                                                      │
│  • ✓  = Sent                                                                    │
│  • ✓✓ = Delivered                                                               │
│  • ✓✓ (blue) = Read                                                             │
│                                                                                 │
│  OPTIONS MENU [⋮]                                                               │
│  ───────────────                                                                │
│  • View Profile                                                                 │
│  • Mute Conversation (1h / 8h / 24h / Until I turn back on)                    │
│  • Block User                                                                   │
│  • Report Conversation                                                          │
│  • Delete Conversation                                                          │
│                                                                                 │
│  ATTACHMENT [📎]                                                                │
│  ─────────────                                                                  │
│  • Share Poll/Survey/Test (from your content)                                   │
│  • Share Image (max 5MB, jpg/png/gif)                                          │
│  • NO file attachments (security)                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.18.3 New Message Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  FLOW DM-003: NEW MESSAGE COMPOSITION                                           │
│  ════════════════════════════════════                                           │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  [←] New Message                                                         │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                          │  │
│  │  To: 🔍 Search users...                                                  │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  SUGGESTED                                                               │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 👤 @ahmet_yilmaz                                                    │ │  │
│  │  │    Ahmet Yılmaz • 1.2K followers                                    │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 👤 @zeynep_k                                                        │ │  │
│  │  │    Zeynep K. • 856 followers • Follows you                          │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 👤 @survey_master ✓                                                 │ │  │
│  │  │    Survey Master • 25K followers • Verified                         │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  RECIPIENT SEARCH                                                               │
│  ────────────────                                                               │
│  • Searches: username, display name                                             │
│  • Shows: avatar, username, follower count, verification                        │
│  • Priority: mutual follows > followers > everyone                              │
│  • Blocked users: Not shown in search                                           │
│                                                                                 │
│  DM RESTRICTIONS                                                                │
│  ───────────────                                                                │
│  • Cannot DM users who blocked you                                              │
│  • Cannot DM users with DMs disabled                                            │
│  • Cannot DM if you're rate limited (5/day free, 25/day Plus to non-friends)   │
│                                                                                 │
│  ERROR STATES                                                                   │
│  ────────────                                                                   │
│  • "This user has disabled direct messages"                                     │
│  • "You've reached your daily message limit. Upgrade to Plus for more."        │
│  • "This user has blocked you"                                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.18.4 DM Privacy Settings

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  FLOW DM-004: MESSAGE PRIVACY SETTINGS                                          │
│  ══════════════════════════════════════                                         │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  [←] Message Settings                                                    │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                          │  │
│  │  Who can message you?                                                    │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  ○ Everyone                                                              │  │
│  │    Anyone on VoxPoll can send you a message                              │  │
│  │                                                                          │  │
│  │  ● Followers only                                                        │  │
│  │    Only people who follow you can message you                            │  │
│  │                                                                          │  │
│  │  ○ People I follow                                                       │  │
│  │    Only people you follow can message you                                │  │
│  │                                                                          │  │
│  │  ○ Mutual follows                                                        │  │
│  │    Only people you both follow can message you                           │  │
│  │                                                                          │  │
│  │  ○ No one                                                                │  │
│  │    Disable direct messages completely                                    │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  Message Requests                                                        │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  ☑️ Filter message requests                                              │  │
│  │     Messages from non-followers go to Message Requests                   │  │
│  │                                                                          │  │
│  │  ☑️ Filter low-quality messages                                          │  │
│  │     Hide messages that may be spam                                       │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  Read Receipts                                                           │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  ☐ Show read receipts                                                    │  │
│  │     Let others know when you've read their messages                      │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  [DECISION P-022] Direct messaging permissions by tier                          │
│  [REFERENCE] BIBLE-005 Section 5.9.3 for DM schema and rate limits              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.18.5 Message Request Handling

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  FLOW DM-005: MESSAGE REQUESTS                                                  │
│  ══════════════════════════════                                                 │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  [←] Message Requests                                                    │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                          │  │
│  │  People who don't follow you have sent these requests.                   │  │
│  │  Accepting lets them message you directly.                               │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 👤 @new_researcher                                          2h ago │ │  │
│  │  │    "Merhaba, anketiniz hakkında soru sormak istiyorum..."           │ │  │
│  │  │                                                                     │ │  │
│  │  │    [Delete]                      [Accept]                           │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 👤 @poll_fan                                               1d ago │ │  │
│  │  │    "Harika içerikler paylaşıyorsunuz!"                              │ │  │
│  │  │                                                                     │ │  │
│  │  │    [Delete]                      [Accept]                           │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ⚠️ Hidden Request                                                  │  │  │
│  │  │ This message was hidden because it may contain spam.               │  │  │
│  │  │ [View anyway]                                                      │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  [Delete All Requests]                                                   │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  REQUEST ACTIONS                                                                │
│  ───────────────                                                                │
│  • Accept: Moves to regular inbox, user can continue messaging                  │
│  • Delete: Removes request, user not notified                                   │
│  • Delete All: Bulk remove all pending requests                                 │
│  • Report: Reports user for spam/harassment + deletes                           │
│                                                                                 │
│  SPAM FILTERING                                                                 │
│  ──────────────                                                                 │
│  • New accounts (<7 days): Higher scrutiny                                      │
│  • Repeated similar messages: Auto-hidden                                       │
│  • Links in first message: Warning flag                                         │
│  • Machine learning spam score: Hide if >0.8                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 22.19 LIVE POLL END TRANSITIONS
# ══════════════════════════════════════════════════════════════════════════════

## 22.19.1 End Poll Confirmation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  FLOW LP-END-001: END LIVE POLL CONFIRMATION                                    │
│  ════════════════════════════════════════════                                   │
│                                                                                 │
│  Host clicks [End Poll] button                                                  │
│       │                                                                         │
│       ▼                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  ⚠️ End Live Poll?                                                       │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  This will:                                                              │  │
│  │  • Stop accepting new votes                                              │  │
│  │  • Show final results to all participants                                │  │
│  │  • Close the join code (ABC123)                                          │  │
│  │  • Enable PULSE + COMMENTS discussion                                    │  │
│  │                                                                          │  │
│  │  Current Status:                                                         │  │
│  │  ├─ 847 participants                                                     │  │
│  │  ├─ 612 votes cast                                                       │  │
│  │  └─ 27 still voting                                                      │  │
│  │                                                                          │  │
│  │  ⚠️ 27 participants are still voting. Give them more time?               │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  [Cancel]              [+30 Seconds]              [End Now]              │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  STATE TRANSITIONS                                                              │
│  ─────────────────                                                              │
│                                                                                 │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐              │
│  │  ACTIVE  │ ──► │ ENDING   │ ──► │ CLOSED   │ ──► │ ARCHIVED │              │
│  │          │     │ (5 sec)  │     │          │     │          │              │
│  └──────────┘     └──────────┘     └──────────┘     └──────────┘              │
│       │                                  │                                      │
│       │ +30s                             │                                      │
│       ▼                                  ▼                                      │
│  ┌──────────┐                   ┌──────────────────┐                           │
│  │  ACTIVE  │                   │  PULSE+COMMENTS  │                           │
│  │ (extend) │                   │  Now Available   │                           │
│  └──────────┘                   └──────────────────┘                           │
│                                                                                 │
│  ENDING STATE (5 seconds)                                                       │
│  ────────────────────────                                                       │
│  • Countdown shown to all participants                                          │
│  • "Poll ending in 5... 4... 3... 2... 1..."                                   │
│  • No new votes accepted                                                        │
│  • Pending votes (in-flight) still processed                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.19.2 Post-End Participant View

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  FLOW LP-END-002: PARTICIPANT VIEW AFTER POLL ENDS                              │
│  ══════════════════════════════════════════════════                             │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  🎉 Poll Ended!                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  En sevdiğiniz programlama dili?                                         │  │
│  │                                                                          │  │
│  │  ┌───────────────────────────────────────────────────────────────────┐   │  │
│  │  │ 🏆 TypeScript                                              42.3% │   │  │
│  │  │ ████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░        │   │  │
│  │  └───────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                          │  │
│  │  ┌───────────────────────────────────────────────────────────────────┐   │  │
│  │  │    Python                                                  28.1% │   │  │
│  │  │ ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │   │  │
│  │  └───────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                          │  │
│  │  ┌───────────────────────────────────────────────────────────────────┐   │  │
│  │  │    JavaScript                                              18.7% │   │  │
│  │  │ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │   │  │
│  │  └───────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                          │  │
│  │  ┌───────────────────────────────────────────────────────────────────┐   │  │
│  │  │    Rust                                                    10.9% │   │  │
│  │  │ █████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │   │  │
│  │  └───────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  847 participants • 612 votes • Ended just now                           │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  [💬 Join Discussion]    [📊 View PULSE]    [📤 Share Results]          │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  POST-END ACTIONS                                                               │
│  ────────────────                                                               │
│  • Join Discussion: Opens COMMENTS section                                      │
│  • View PULSE: Animated results visualization                                   │
│  • Share Results: Generate share card                                           │
│                                                                                 │
│  PARTICIPANT WHO DIDN'T VOTE                                                    │
│  ───────────────────────────                                                    │
│  • Still sees results (was present during poll)                                 │
│  • Different message: "Poll ended before you voted"                             │
│  • Can still join discussion                                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 22.19.3 Host Post-End Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  FLOW LP-END-003: HOST DASHBOARD AFTER POLL ENDS                                │
│  ════════════════════════════════════════════════                               │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  ✅ Live Poll Completed                                                  │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  "En sevdiğiniz programlama dili?"                                       │  │
│  │                                                                          │  │
│  │  FINAL STATISTICS                                                        │  │
│  │  ┌────────────────┬────────────────┬────────────────┬────────────────┐  │  │
│  │  │ Participants   │ Votes Cast     │ Completion     │ Duration       │  │  │
│  │  │     847        │     612        │    72.3%       │   4m 23s       │  │  │
│  │  └────────────────┴────────────────┴────────────────┴────────────────┘  │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  WHAT'S NEXT?                                                            │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 💬 Moderate Discussion                                              │ │  │
│  │  │    23 new comments in PULSE + COMMENTS                              │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 📊 Download Results                                                 │ │  │
│  │  │    Export to CSV, PDF, or share via link                            │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 🔄 Create Similar Poll                                              │ │  │
│  │  │    Start a new live poll with same settings                         │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                          │  │
│  │  ─────────────────────────────────────────────────────────────────────── │  │
│  │                                                                          │  │
│  │  [View Public Results Page]                    [Go to Dashboard]         │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  AUTO-ARCHIVE                                                                   │
│  ────────────                                                                   │
│  • Live poll data retained for 90 days                                          │
│  • After 90 days: Aggregated results kept, raw data deleted                     │
│  • Host notified 7 days before archive                                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 22.20 CONTENT SCHEDULING UI FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 22.20.1 Schedule Publication UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SCHEDULE PUBLICATION (P-047)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: SELECT PUBLISH TIME                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  When do you want to publish?                                         │ │
│  │                                                                       │ │
│  │  ○ Publish now                                                        │ │
│  │  ● Schedule for later                                                 │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│  │  │  Date: [January 25, 2026    ▼]                                  │ │ │
│  │  │  Time: [14:00               ▼]                                  │ │ │
│  │  │  Timezone: [Europe/Istanbul (UTC+3) ▼]                          │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                       │ │
│  │  ℹ️ Your poll will be published automatically at this time.          │ │
│  │     You'll receive a notification when it goes live.                 │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  STEP 2: SCHEDULE END TIME (Optional - Extended/Survey only)               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  When should this close?                                              │ │
│  │                                                                       │ │
│  │  ○ Never (stays open indefinitely)                                    │ │
│  │  ○ After duration: [7 days ▼]                                         │ │
│  │  ● On specific date:                                                  │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│  │  │  End Date: [February 1, 2026  ▼]                                │ │ │
│  │  │  End Time: [23:59             ▼]                                │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                       │ │
│  │  Duration: 7 days, 9 hours, 59 minutes                                │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                              [Cancel]  [Schedule]                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 22.20.2 Scheduled Content Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SCHEDULED CONTENT LIST                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📅 Scheduled (3)                                                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🗳️ "Best programming language?"                                       │ │
│  │    Scheduled: Jan 25, 2026 at 14:00 (in 3 days)                       │ │
│  │    Ends: Feb 1, 2026 at 23:59                                         │ │
│  │                                     [Edit] [Reschedule] [Cancel]       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 📋 "Q1 Team Satisfaction Survey"                                      │ │
│  │    Scheduled: Jan 30, 2026 at 09:00 (in 8 days)                       │ │
│  │    Ends: Feb 15, 2026 at 18:00                                        │ │
│  │                                     [Edit] [Reschedule] [Cancel]       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🧠 "Which Marvel Character Are You?"                                  │ │
│  │    Scheduled: Feb 1, 2026 at 12:00 (in 10 days)                       │ │
│  │    No end date (evergreen)                                            │ │
│  │                                     [Edit] [Reschedule] [Cancel]       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 22.20.3 Schedule Configuration

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CONTENT SCHEDULING CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const SCHEDULING_CONFIG = {
  // ────────────────────────────────────────────────────────────────────────────
  // TIME CONSTRAINTS
  // ────────────────────────────────────────────────────────────────────────────
  constraints: {
    // Minimum time in future (prevent accidental immediate publish)
    minFutureMinutes: 5,

    // Maximum time in future
    maxFutureDays: 90,

    // Minimum duration for polls/surveys with end time
    minDurationMinutes: 15,

    // Default duration suggestions
    durationPresets: [
      { label: "1 hour", minutes: 60 },
      { label: "6 hours", minutes: 360 },
      { label: "1 day", minutes: 1440 },
      { label: "3 days", minutes: 4320 },
      { label: "1 week", minutes: 10080 },
      { label: "2 weeks", minutes: 20160 },
      { label: "1 month", minutes: 43200 }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // TIMEZONE HANDLING
  // ────────────────────────────────────────────────────────────────────────────
  timezone: {
    // Default to user's browser timezone
    useUserTimezone: true,

    // Show timezone explicitly
    showTimezoneInUI: true,

    // Store all times in UTC
    storageFormat: "UTC",

    // Popular timezone shortcuts
    popularTimezones: [
      "Europe/Istanbul",
      "Europe/London",
      "America/New_York",
      "America/Los_Angeles",
      "Asia/Tokyo",
      "Australia/Sydney"
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ────────────────────────────────────────────────────────────────────────────
  notifications: {
    // Remind before scheduled publish
    remindBeforeMinutes: [60, 15],  // 1 hour and 15 min before

    // Notify on publish
    notifyOnPublish: true,

    // Notify if schedule fails
    notifyOnFailure: true
  },

  // ────────────────────────────────────────────────────────────────────────────
  // TIER LIMITS
  // ────────────────────────────────────────────────────────────────────────────
  limits: {
    FREE: {
      maxScheduled: 3,
      maxFutureDays: 7
    },
    PLUS: {
      maxScheduled: 20,
      maxFutureDays: 30
    },
    PREMIUM: {
      maxScheduled: 100,
      maxFutureDays: 90
    },
    ORGANIZATION: {
      maxScheduled: 500,
      maxFutureDays: 90
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SCHEDULING STATE MACHINE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Scheduled Content Lifecycle
 *
 *  ┌─────────────┐
 *  │    DRAFT    │
 *  └──────┬──────┘
 *         │ schedule()
 *         ▼
 *  ┌─────────────┐
 *  │  SCHEDULED  │ ←─── reschedule()
 *  └──────┬──────┘
 *         │
 *    ┌────┴────┐
 *    │         │
 *    ▼         ▼
 * time_reached  cancel()
 *    │         │
 *    ▼         ▼
 * ┌─────────┐ ┌─────────┐
 * │ ACTIVE  │ │  DRAFT  │
 * └─────────┘ └─────────┘
 */

type ScheduleState = "DRAFT" | "SCHEDULED" | "ACTIVE" | "CLOSED"

interface ScheduledContent {
  contentId: string
  contentType: "POLL" | "SURVEY" | "TEST"
  scheduledPublishAt: Date
  scheduledCloseAt?: Date
  timezone: string
  createdBy: string
  status: ScheduleState
  remindersSent: string[]  // Timestamps of sent reminders
}

// Cron job runs every minute to check for content to publish
const SCHEDULE_CHECK_CRON = "* * * * *"  // Every minute
```

## 22.20.4 Reschedule Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RESCHEDULE CONTENT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Current schedule:                                                    │ │
│  │  📅 January 25, 2026 at 14:00 (Europe/Istanbul)                       │ │
│  │  ⏱️ Ends: February 1, 2026 at 23:59                                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  New schedule:                                                        │ │
│  │                                                                       │ │
│  │  Publish: [January 28, 2026  ▼] [16:00 ▼]                            │ │
│  │  End:     [February 5, 2026  ▼] [23:59 ▼]                            │ │
│  │                                                                       │ │
│  │  ⚠️ End date will be extended by 3 days to match new publish date    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                              [Cancel]  [Update Schedule]                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 22
# ══════════════════════════════════════════════════════════════════════════════
# Status: COMPLETE
# Last Updated: January 2026
# Changes: Added Section 22.18 - DM UI Flows, Section 22.19 - Live Poll End Transitions, Section 22.20 - Scheduling UI
# Dependencies: All previous sections for content context
# ══════════════════════════════════════════════════════════════════════════════
