# Onboarding Flow

> **NyoWorks Standard File** | VoxPoll Specific

User onboarding after successful registration and email verification.

---

## Individual User Onboarding

### Step 1: Welcome Screen
```
Welcome to VoxPoll!
    │
    └─> "Let's get started" CTA
```

### Step 2: Profile Setup
- **Avatar upload** (optional)
  - Max 5MB, JPG/PNG
  - Auto-crop to square
  - Stored in S3

- **Display name** (required, already set during registration)

- **Bio** (optional)
  - Max 160 characters
  - Plain text only

### Step 3: Interests Selection
- **Categories**: Politics, Sports, Technology, Entertainment, etc.
- **Min selection**: 3 categories
- **Purpose**: Content personalization, feed recommendations

### Step 4: Privacy Settings
- **Profile visibility**: Public / Followers only / Private
- **Default poll visibility**: Public / Followers only / Private
- **Allow DMs**: Everyone / Followers only / Nobody

### Step 5: Notification Preferences
- **Email notifications**: All / Important only / None
- **Push notifications**: (if mobile) All / Important only / None
- **Notification types**:
  - New followers
  - Poll comments
  - Mentions
  - Badge unlocks

### Step 6: Optional Verification
- **Phone verification**: SMS OTP → Level 1
- **ID verification**: Upload ID document → Level 2-4
- **Skip**: Stay at Level 0

### Step 7: Completion
```
You're all set!
    │
    └─> Redirect to feed
```

---

## Organization Member Onboarding

When a user joins via organization invitation:

### Step 1: Accept Invitation
- Email link clicked
- Organization name displayed
- Role explained (Member, Manager, Admin)

### Step 2: Account Creation (if new user)
- Same as individual registration
- Email pre-filled from invitation

### Step 3: Organization Context
- Organization overview shown
- Role permissions explained
- Team members list (if allowed by role)

### Step 4: Tour of Organization Features
- **Survey creation**: If user has permission
- **Analytics dashboard**: If user has access
- **Team management**: If user is Manager/Admin

### Step 5: First Survey (optional)
- Quick tutorial survey creation
- "Create your first survey" prompt
- Skip option available

### Step 6: Completion
```
Welcome to [Organization Name]!
    │
    └─> Redirect to organization dashboard
```

---

## Onboarding Skip Behavior

Users can skip onboarding:
- **Consequence**: Default settings applied
  - Profile visibility: Public
  - Poll visibility: Public
  - Notifications: All enabled
  - Interests: None (affects feed quality)

- **Re-access**: Settings page available anytime

---

## Gamification During Onboarding

### XP Rewards
- Complete profile: +50 XP
- Select interests: +25 XP
- Enable phone verification: +100 XP
- Create first poll: +100 XP

### Badges
- "New Member" badge automatically awarded
- "Verified" badge if phone/ID verified

---

## Mobile vs Web Differences

### Web
- Multi-step wizard
- Progress bar at top
- "Back" and "Next" buttons

### Mobile
- Swipeable screens
- Progress dots at bottom
- "Skip" option prominent

---

## Analytics Tracking

Track onboarding funnel:
```
Registration complete
    ↓
Welcome screen viewed
    ↓
Profile setup started
    ↓
Interests selected
    ↓
Privacy settings configured
    ↓
Notification preferences set
    ↓
Onboarding completed
```

**Drop-off points**: Monitor where users abandon onboarding

---

## Error Handling

- **Avatar upload fails**: Show retry, allow skip
- **Network error**: Auto-save progress, resume later
- **Timeout**: Session extends during onboarding

---

## First-Time User Experience (FTUX)

After onboarding, show tooltips/highlights for key features:
1. "Create your first poll" button highlight
2. "Discover" tab introduction
3. "Notifications" bell icon highlight

**Dismissible**: User can skip FTUX tour

---

*Related: [06-UX/01-user-flows.md](../06-UX/01-user-flows.md) for complete flows*
