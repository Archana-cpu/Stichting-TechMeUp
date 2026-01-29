# RBAC Matrix (Role-Based Access Control)

> VoxPoll Permission System
> Bible Ref: P-004 (Verification Levels)
> Last Updated: 2026-01-29

---

## Role Hierarchy

```
SUPER_ADMIN (Level 5)
    ↓
ADMIN (Level 4)
    ↓
MODERATOR (Level 3)
    ↓
PREMIUM_USER (Level 2)
    ↓
USER (Level 1)
    ↓
GUEST (Level 0)
```

**Inheritance**: Higher roles inherit all permissions from lower roles.

---

## User Roles

| Role | Description | Assignment Method |
|------|-------------|-------------------|
| GUEST | Unauthenticated visitor | Default |
| USER | Registered user (email verified) | Auto after registration |
| PREMIUM_USER | Paid subscriber | Auto after subscription payment |
| MODERATOR | Content moderator | Manual by ADMIN |
| ADMIN | Platform administrator | Manual by SUPER_ADMIN |
| SUPER_ADMIN | System owner | Database direct |

---

## Verification Levels (P-004)

| Level | Name | Requirements | Trust Score Impact |
|-------|------|--------------|-------------------|
| 0 | Unverified | No verification | 0% |
| 1 | Email Verified | Confirmed email | +20% |
| 2 | Phone Verified | Email + Phone OTP | +40% |
| 3 | ID Verified | Email + Phone + ID Document | +70% |
| 4 | Organization Verified | Level 3 + Organization membership | +100% |

**Note**: Verification level is independent of role but affects content reliability scoring (T-009).

---

## Permission Matrix

### Public Content (GUEST)

| Resource | Action | GUEST | USER | PREMIUM | MODERATOR | ADMIN |
|----------|--------|-------|------|---------|-----------|-------|
| **Polls** |
| | View public polls | ✅ | ✅ | ✅ | ✅ | ✅ |
| | View poll results | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Search polls | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Users** |
| | View public profiles | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Search users | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Categories** |
| | List categories | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Platform** |
| | View platform stats | ✅ | ✅ | ✅ | ✅ | ✅ |

---

### User Content (USER)

| Resource | Action | GUEST | USER | PREMIUM | MODERATOR | ADMIN |
|----------|--------|-------|------|---------|-----------|-------|
| **Authentication** |
| | Register account | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Logout | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Reset password | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Enable 2FA | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Polls** |
| | Create poll | ❌ | ✅ (3/day) | ✅ (unlimited) | ✅ | ✅ |
| | Vote on poll | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Edit own poll | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Delete own poll | ❌ | ✅ | ✅ | ✅ | ✅ |
| | View own analytics | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Comment on poll | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Live Polls** |
| | Create live session | ❌ | ✅ (5/day) | ✅ (20/day) | ✅ | ✅ |
| | Join live session | ✅ (anonymous) | ✅ | ✅ | ✅ | ✅ |
| | Host controls | ❌ | ✅ (own) | ✅ (own) | ✅ (own) | ✅ (all) |
| **Surveys** |
| | Create survey | ❌ | ✅ (2/day) | ✅ (unlimited) | ✅ | ✅ |
| | Respond to survey | ❌ | ✅ | ✅ | ✅ | ✅ |
| | View responses | ❌ | ✅ (own) | ✅ (own + analytics) | ✅ | ✅ |
| **Tests** |
| | Create quiz | ❌ | ✅ (2/day) | ✅ (10/day) | ✅ | ✅ |
| | Take quiz | ❌ | ✅ | ✅ | ✅ | ✅ |
| | View leaderboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Social** |
| | Follow users | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Block users | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Send messages | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Profile** |
| | Edit own profile | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Upload avatar | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Export own data | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Delete own account | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Verification** |
| | Email verification | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Phone verification | ❌ | ✅ | ✅ | ✅ | ✅ |
| | ID verification | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Payments** |
| | Subscribe to premium | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Cancel subscription | ❌ | ❌ | ✅ | ❌ | ❌ |
| | View payment history | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Reports** |
| | Report content | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Report user | ❌ | ✅ | ✅ | ✅ | ✅ |

---

### Premium Features (PREMIUM_USER)

| Feature | FREE | PREMIUM |
|---------|------|---------|
| **Content Creation Limits** |
| Polls per day | 3 | Unlimited (P-058) |
| Live sessions per day | 5 | 20 |
| Surveys per day | 2 | Unlimited |
| Quizzes per day | 2 | 10 |
| Max poll options | 5 | 20 |
| **Analytics** |
| Basic analytics | ❌ | ✅ |
| Demographics breakdown | ❌ | ✅ |
| Export poll data | ❌ | ✅ |
| Real-time live analytics | ❌ | ✅ |
| **Features** |
| Advanced templates | ❌ | ✅ |
| Custom branding | ❌ | ✅ |
| Priority support | ❌ | ✅ |
| Remove watermark | ❌ | ✅ |
| API access | ❌ | ✅ (rate limited) |
| **Storage** |
| Image uploads | 5 MB | 50 MB |
| Poll history | 30 days | Unlimited |

---

### Moderation (MODERATOR)

| Resource | Action | GUEST | USER | PREMIUM | MODERATOR | ADMIN |
|----------|--------|-------|------|---------|-----------|-------|
| **Content Moderation** |
| | View moderation queue | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Assign reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Resolve reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Delete any content | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Edit any content | ❌ | ❌ | ❌ | ❌ | ✅ |
| **User Moderation** |
| | Warn user | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Suspend user (7 days max) | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Ban user (permanent) | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Unban user | ❌ | ❌ | ❌ | ❌ | ✅ |
| | View user audit log | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Bulk Operations** |
| | Bulk assign reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Bulk resolve reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Bulk approve content | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Moderation Stats** |
| | View mod stats | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Export mod reports | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### Administration (ADMIN)

| Resource | Action | GUEST | USER | PREMIUM | MODERATOR | ADMIN |
|----------|--------|-------|------|---------|-----------|-------|
| **User Management** |
| | View all users | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Edit any user | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Delete any user | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Assign roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Force password reset | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Platform Management** |
| | View platform analytics | ❌ | ❌ | ❌ | ✅ (limited) | ✅ (full) |
| | Manage categories | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Manage templates | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Configure rate limits | ❌ | ❌ | ❌ | ❌ | ✅ |
| | View audit logs | ❌ | ❌ | ❌ | ✅ (own) | ✅ (all) |
| **Content Management** |
| | Feature content | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Pin content | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Edit any content | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Bulk delete | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Organization Management** |
| | Create organization | ❌ | ✅ | ✅ | ✅ | ✅ |
| | View all organizations | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Delete any organization | ❌ | ❌ | ❌ | ❌ | ✅ |
| **System** |
| | View system health | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Trigger maintenance | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Manage feature flags | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Organization Roles

Organizations have their own permission hierarchy independent of platform roles.

| Org Role | Permissions |
|----------|-------------|
| **OWNER** | Full control, delete org, manage billing, assign all roles |
| **ADMIN** | Manage members, create content, view analytics, cannot delete org |
| **MEMBER** | Create content under org, view org content, limited analytics |
| **VIEWER** | View org content only, no creation rights |

**Org Role Assignment:**
- OWNER: Auto-assigned to creator, transferable
- ADMIN: Assigned by OWNER
- MEMBER: Assigned by OWNER or ADMIN
- VIEWER: Assigned by OWNER or ADMIN

---

## Resource Ownership

| Resource | Owner | Ownership Transfer | Deletion Rights |
|----------|-------|-------------------|-----------------|
| Poll | Creator | ❌ No | Owner, ADMIN |
| Survey | Creator | ❌ No | Owner, ADMIN |
| Quiz | Creator | ❌ No | Owner, ADMIN |
| Live Session | Host | ❌ No | Host, ADMIN |
| Organization | Creator (OWNER) | ✅ Yes | OWNER only |
| Comment | Author | ❌ No | Author, MODERATOR, ADMIN |

---

## Rate Limiting by Role

| Endpoint | GUEST | USER | PREMIUM | MODERATOR | ADMIN |
|----------|-------|------|---------|-----------|-------|
| **Poll Creation** |
| POST /polls | ❌ | 3/day | Unlimited | Unlimited | Unlimited |
| **Live Session** |
| POST /live/sessions | ❌ | 5/day | 20/day | Unlimited | Unlimited |
| **API Requests** |
| Global default | 100/15min | 100/15min | 500/15min | 1000/15min | Unlimited |
| **Voting** |
| POST /polls/:id/vote | ❌ | 30/hour | 100/hour | 100/hour | 100/hour |

**Bible Ref**: P-058 (Rate Limiting)

---

## Permission Checking

**Code Implementation**: `packages/api/src/middleware/auth.ts`

```typescript
// Example permission check
if (user.role === 'ADMIN' || user.id === poll.creatorId) {
  // Allow access
}

// Role hierarchy check
function hasMinimumRole(user: User, minimumRole: Role): boolean {
  const hierarchy = ['GUEST', 'USER', 'PREMIUM_USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']
  return hierarchy.indexOf(user.role) >= hierarchy.indexOf(minimumRole)
}
```

---

## Audit Log Events

All permission-based actions are logged to audit trail:

| Event Type | Logged Data |
|------------|-------------|
| Role Assignment | User ID, old role, new role, assigner ID |
| Permission Denied | User ID, attempted action, resource ID, timestamp |
| Privileged Action | User ID, action, resource ID, IP, device |
| Bulk Operation | User ID, operation type, affected count, success count |

**Storage**: `audit_logs` table, 90-day retention (GDPR compliant)

---

## Security Notes

1. **Principle of Least Privilege**: Users granted minimum permissions needed
2. **Role Separation**: Clear boundaries between user roles and platform roles
3. **Audit Trail**: All privileged actions logged with full context
4. **Rate Limiting**: Applied per role to prevent abuse (P-058)
5. **Verification Impact**: Affects content reliability, not permissions (P-004, T-009)

---

## Bible Compliance

- **P-004**: Verification levels (0-4) documented
- **P-058**: Rate limiting per role tier
- **T-009**: Verification affects reliability scoring, not RBAC

---

*NyoWorks Security Documentation - RBAC Matrix v1*
