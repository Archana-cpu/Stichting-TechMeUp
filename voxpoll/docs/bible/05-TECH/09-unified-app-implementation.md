# Unified App Implementation Guide

**Architecture Pattern**: Single app serving all user types
**Last Updated**: 2026-01-29
**Status**: Implementation Ready

---

## Overview

VoxPoll uses a **unified app architecture** where:
- **One web app** (Next.js 16) serves individual users, organization members, and platform admins
- **One mobile app** (React Native + Expo) serves individual users and organization members
- Route/screen-based separation with RBAC permission gating

---

## Web App (Next.js 16) Structure

### Route Groups

```typescript
apps/web/app/
├── (auth)/                    # Public auth routes (no auth required)
│   ├── login/
│   ├── register/
│   ├── verify/
│   └── forgot-password/
│
├── (individual)/              # Individual users (Free, Plus, Premium)
│   ├── feed/
│   ├── poll/[id]/
│   ├── survey/[id]/
│   ├── test/[id]/
│   ├── live/[code]/
│   ├── create/
│   ├── profile/[username]/
│   ├── settings/
│   └── notifications/
│
├── (org)/                     # Organization members (B2B SaaS)
│   └── [slug]/                # Dynamic organization slug
│       ├── dashboard/
│       ├── surveys/
│       │   ├── create/
│       │   ├── [id]/
│       │   └── analytics/
│       ├── analytics/
│       ├── members/
│       ├── billing/
│       └── settings/
│
└── (admin)/                   # Platform admins (PLATFORM_ADMIN role)
    ├── dashboard/
    ├── users/
    ├── organizations/
    ├── content/
    ├── reports/
    └── settings/
```

### Middleware (RBAC Permission Gating)

**File**: `apps/web/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@voxpoll/api/lib/auth'
import { hasPermission } from '@voxpoll/shared/rbac'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  // Skip auth routes
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next()
  }

  // Verify authentication
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const session = await verifyToken(token)
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Organization routes: Check membership
  if (pathname.startsWith('/org/')) {
    const orgSlug = pathname.split('/')[2]
    const membership = await checkOrgMembership(session.userId, orgSlug)

    if (!membership) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Check role-based permissions for specific routes
    if (pathname.includes('/members') && !hasPermission(membership.role, 'members:manage')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (pathname.includes('/billing') && !hasPermission(membership.role, 'org:billing')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (pathname.includes('/settings') && !hasPermission(membership.role, 'org:settings')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Admin routes: Require PLATFORM_ADMIN role
  if (pathname.startsWith('/admin/')) {
    if (session.role !== 'PLATFORM_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

async function checkOrgMembership(userId: string, orgSlug: string) {
  // Implementation: Query database for org membership
  // Return { role: OrganizationRole, orgId: string } | null
}
```

### Layout Hierarchy

```typescript
// apps/web/app/layout.tsx (Root layout - all routes)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// apps/web/app/(individual)/layout.tsx (Individual users layout)
export default function IndividualLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <IndividualNavbar />
      <main>{children}</main>
      <IndividualFooter />
    </div>
  )
}

// apps/web/app/(org)/[slug]/layout.tsx (Organization layout)
export default function OrgLayout({ children, params }: { children: React.ReactNode, params: { slug: string } }) {
  return (
    <div className="min-h-screen">
      <OrgNavbar slug={params.slug} />
      <div className="flex">
        <OrgSidebar slug={params.slug} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

// apps/web/app/(admin)/layout.tsx (Admin layout)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
```

---

## Mobile App (React Native + Expo) Structure

### Screen Organization

```typescript
apps/mobile/app/
├── (tabs)/                    # Bottom tab navigation (individual users)
│   ├── feed.tsx              # Home feed
│   ├── search.tsx            # Explore/discover
│   ├── create.tsx            # Create content
│   ├── notifications.tsx
│   └── profile.tsx
│
├── org/                       # Organization screens (no tabs)
│   └── [slug]/               # Dynamic organization slug
│       ├── dashboard.tsx
│       ├── surveys.tsx
│       ├── analytics.tsx
│       └── members.tsx
│
├── poll/[id].tsx             # Poll detail (modal)
├── survey/[id].tsx           # Survey detail (modal)
├── test/[id].tsx             # Test detail (modal)
├── live/[code].tsx           # Live poll (modal)
├── auth/                     # Auth screens
│   ├── login.tsx
│   ├── register.tsx
│   └── verify.tsx
│
└── _layout.tsx               # Root layout
```

### Navigation Guards

**File**: `apps/mobile/app/_layout.tsx`

```typescript
import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { useAuth } from '@/lib/auth'

export default function RootLayout() {
  const { session, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === 'auth'
    const inOrgGroup = segments[0] === 'org'

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login')
    } else if (session && inAuthGroup) {
      // Redirect to feed if already authenticated
      router.replace('/(tabs)/feed')
    } else if (inOrgGroup) {
      // Check organization membership
      const orgSlug = segments[1]
      checkOrgAccess(session.userId, orgSlug).then((hasAccess) => {
        if (!hasAccess) {
          router.replace('/unauthorized')
        }
      })
    }
  }, [session, segments, isLoading])

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="org/[slug]" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  )
}
```

### Organization Screen Navigation

```typescript
// apps/mobile/app/org/[slug]/dashboard.tsx
import { useLocalSearchParams, Link } from 'expo-router'
import { useOrganization } from '@/hooks/useOrganization'

export default function OrgDashboard() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { organization, membership } = useOrganization(slug)

  return (
    <View>
      <Text className="text-2xl font-bold">{organization.name}</Text>

      {/* Role-based navigation */}
      {hasPermission(membership.role, 'surveys:create') && (
        <Link href={`/org/${slug}/surveys`}>
          <Text>Surveys</Text>
        </Link>
      )}

      {hasPermission(membership.role, 'results:view_all') && (
        <Link href={`/org/${slug}/analytics`}>
          <Text>Analytics</Text>
        </Link>
      )}

      {hasPermission(membership.role, 'members:manage') && (
        <Link href={`/org/${slug}/members`}>
          <Text>Members</Text>
        </Link>
      )}
    </View>
  )
}
```

---

## Permission System (RBAC)

### Permission Definitions

**File**: `packages/shared/src/rbac/permissions.ts`

```typescript
export type Permission =
  // Organization permissions
  | 'org:delete'
  | 'org:billing'
  | 'org:transfer'
  | 'org:sso'
  | 'org:settings'
  | 'org:audit'
  // Member permissions
  | 'members:manage_admins'
  | 'members:manage'
  | 'members:view'
  // Survey permissions
  | 'surveys:create'
  | 'surveys:edit_any'
  | 'surveys:delete_any'
  // Results permissions
  | 'results:view_all'
  | 'results:view_own'
  | 'results:export'
  // Participation
  | 'participate'

export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'ANALYST' | 'CREATOR' | 'MEMBER'

export const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  OWNER: [
    'org:delete', 'org:billing', 'org:transfer', 'org:sso', 'org:settings', 'org:audit',
    'members:manage_admins', 'members:manage', 'members:view',
    'surveys:create', 'surveys:edit_any', 'surveys:delete_any',
    'results:view_all', 'results:view_own', 'results:export',
    'participate'
  ],
  ADMIN: [
    'org:sso', 'org:settings', 'org:audit',
    'members:manage', 'members:view',
    'surveys:create', 'surveys:edit_any', 'surveys:delete_any',
    'results:view_all', 'results:view_own', 'results:export',
    'participate'
  ],
  MANAGER: [
    'members:manage', 'members:view',
    'surveys:create', 'surveys:edit_any',
    'results:view_all', 'results:view_own', 'results:export',
    'participate'
  ],
  ANALYST: [
    'members:view',
    'results:view_all', 'results:view_own', 'results:export',
    'participate'
  ],
  CREATOR: [
    'surveys:create',
    'results:view_own',
    'participate'
  ],
  MEMBER: [
    'participate'
  ]
}

export function hasPermission(role: OrganizationRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}
```

---

## API Routes (Hono)

### Organization Endpoints

**File**: `apps/api/src/routes/orgs.ts`

```typescript
import { Hono } from 'hono'
import { auth, requireOrgPermission } from '../middleware/auth'
import { orgService } from '../services/org.service'

const orgs = new Hono()

// Get organization details
orgs.get('/:slug', auth, async (c) => {
  const { slug } = c.req.param()
  const org = await orgService.getBySlug(slug)

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404)
  }

  return c.json(org)
})

// Get organization members
orgs.get('/:slug/members', auth, requireOrgPermission('members:view'), async (c) => {
  const { slug } = c.req.param()
  const members = await orgService.getMembers(slug)

  return c.json(members)
})

// Create survey
orgs.post('/:slug/surveys', auth, requireOrgPermission('surveys:create'), async (c) => {
  const { slug } = c.req.param()
  const body = await c.req.json()

  const survey = await orgService.createSurvey(slug, c.get('userId'), body)

  return c.json(survey, 201)
})

// Get survey analytics
orgs.get('/:slug/surveys/:id/analytics', auth, requireOrgPermission('results:view_all'), async (c) => {
  const { slug, id } = c.req.param()

  const analytics = await orgService.getSurveyAnalytics(slug, id)

  return c.json(analytics)
})

export { orgs }
```

### Middleware

**File**: `apps/api/src/middleware/auth.ts`

```typescript
import { Context, Next } from 'hono'
import { verifyToken } from '../lib/auth'
import { hasPermission, type Permission } from '@voxpoll/shared/rbac'
import { db, eq, organizationMembers } from '@voxpoll/database'

export async function auth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  const session = await verifyToken(token)

  if (!session) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  c.set('userId', session.userId)
  c.set('role', session.role)

  await next()
}

export function requireOrgPermission(permission: Permission) {
  return async (c: Context, next: Next) => {
    const { slug } = c.req.param()
    const userId = c.get('userId')

    // Get user's organization membership
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
      .where(
        and(
          eq(organizations.slug, slug),
          eq(organizationMembers.userId, userId)
        )
      )
      .limit(1)

    if (!membership) {
      return c.json({ error: 'Not a member of this organization' }, 403)
    }

    // Check if user's role has required permission
    if (!hasPermission(membership.role, permission)) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }

    c.set('orgId', membership.organizationId)
    c.set('orgRole', membership.role)

    await next()
  }
}
```

---

## Implementation Checklist

### Phase 1: Web App Structure (Week 1)

- [ ] Create route groups: `(individual)`, `(org)`, `(admin)`
- [ ] Implement middleware.ts with RBAC gating
- [ ] Create layouts for each route group
- [ ] Create organization routes: `/org/[slug]/dashboard`, `/org/[slug]/surveys`, etc.
- [ ] Create admin routes: `/admin/dashboard`, `/admin/users`, etc.
- [ ] Test route access with different roles

### Phase 2: Mobile App Structure (Week 2)

- [ ] Create `org/[slug]/*` screens
- [ ] Implement navigation guards in `_layout.tsx`
- [ ] Add organization switcher component
- [ ] Create role-based navigation menus
- [ ] Test screen access with different roles

### Phase 3: API Endpoints (Week 2-3)

- [ ] Implement `/api/orgs/:slug` endpoints
- [ ] Implement `/api/orgs/:slug/members` endpoints
- [ ] Implement `/api/orgs/:slug/surveys` endpoints
- [ ] Implement `/api/admin/*` endpoints
- [ ] Add `requireOrgPermission` middleware
- [ ] Test permission gating

### Phase 4: RBAC System (Week 3)

- [ ] Define all permissions in `packages/shared/src/rbac`
- [ ] Implement `hasPermission` utility
- [ ] Add permission checks to all protected routes
- [ ] Add permission checks to all API endpoints
- [ ] Test with all 6 organization roles

### Phase 5: Testing (Week 4)

- [ ] Unit tests for permission system
- [ ] Integration tests for org routes
- [ ] E2E tests for role switching
- [ ] Test SSO flow for organizations
- [ ] Load testing for 100+ concurrent org users

---

## Testing Scenarios

### Test Case 1: Organization Member Access

```typescript
describe('Organization Routes', () => {
  it('should allow MANAGER to access /org/:slug/members', async () => {
    const token = await loginAsOrgMember('org-slug', 'MANAGER')

    const response = await fetch('/org/test-company/members', {
      headers: { Authorization: `Bearer ${token}` }
    })

    expect(response.status).toBe(200)
  })

  it('should deny MEMBER from accessing /org/:slug/members', async () => {
    const token = await loginAsOrgMember('org-slug', 'MEMBER')

    const response = await fetch('/org/test-company/members', {
      headers: { Authorization: `Bearer ${token}` }
    })

    expect(response.status).toBe(403)
  })
})
```

### Test Case 2: Platform Admin Access

```typescript
describe('Admin Routes', () => {
  it('should allow PLATFORM_ADMIN to access /admin/users', async () => {
    const token = await loginAsPlatformAdmin()

    const response = await fetch('/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })

    expect(response.status).toBe(200)
  })

  it('should deny regular user from accessing /admin/users', async () => {
    const token = await loginAsRegularUser()

    const response = await fetch('/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })

    expect(response.status).toBe(302) // Redirect to /unauthorized
  })
})
```

---

## Deployment Configuration

### Environment Variables

```bash
# .env.production

# Web App
NEXT_PUBLIC_API_URL=https://api.voxpoll.com
NEXT_PUBLIC_WS_URL=wss://api.voxpoll.com/ws

# Mobile App
EXPO_PUBLIC_API_URL=https://api.voxpoll.com
EXPO_PUBLIC_WS_URL=wss://api.voxpoll.com/ws

# API
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
```

### Vercel Deployment (Web)

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build --filter=web",
  "devCommand": "pnpm dev --filter=web",
  "installCommand": "pnpm install",
  "outputDirectory": "apps/web/.next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_WS_URL": "@ws-url"
  }
}
```

### EAS Build (Mobile)

```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.voxpoll.com",
        "EXPO_PUBLIC_WS_URL": "wss://api.voxpoll.com/ws"
      }
    }
  }
}
```

---

## Related Documentation

- [05-TECH/01-architecture.md](01-architecture.md) - Overall architecture
- [02-USERS/02-organization-roles.md](../02-USERS/02-organization-roles.md) - Role definitions
- [09-security/01-rbac-matrix.md](../09-security/01-rbac-matrix.md) - Permission matrix
- [PM-ARCHITECTURE-REVIEW-2026-01-29.md](../11-audit/PM-ARCHITECTURE-REVIEW-2026-01-29.md) - Architectural decision

---

*Unified App Implementation Guide - VoxPoll v1.0*
