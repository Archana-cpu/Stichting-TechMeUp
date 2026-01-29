# Web Application Specification

> VoxPoll Web Client
> Platform: Next.js 16 (App Router)
> Last Updated: 2026-01-29

---

## Overview

**Repository**: `packages/web/`
**Framework**: Next.js 16 (App Router) + React 19.1.0
**Styling**: Tailwind CSS 4 + shadcn/ui
**State Management**: TanStack Query v5
**Deployment**: Vercel Edge

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.x |
| React | React | 19.1.0 |
| TypeScript | TypeScript | 5.7+ |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui | Latest |
| Forms | React Hook Form | 7.x |
| Validation | Zod | 3.x |
| State (Server) | TanStack Query | 5.x |
| i18n | next-intl | 3.x |
| Analytics | Vercel Analytics | Latest |

---

## Application Structure

```
packages/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-required routes
│   ├── (public)/          # Public routes
│   ├── api/               # API route handlers
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── features/         # Feature-specific
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   ├── auth.ts           # Auth helpers
│   └── utils.ts          # Generic utils
├── hooks/                 # Custom React hooks
├── styles/                # Global styles
├── public/                # Static assets
└── middleware.ts          # Next.js middleware
```

---

## Key Features

### Authentication
- Login/Register forms
- Email verification
- 2FA setup/verification
- Password reset flow
- Session management
- Social OAuth (future)

### Polls
- Poll creation wizard
- Poll voting interface
- Real-time results
- Poll analytics dashboard
- Share functionality
- Comment threads

### Surveys
- Multi-section survey builder
- Question type selector
- Survey response form
- Response analytics

### Tests
- Quiz creation
- Quiz taking interface
- Leaderboard
- Results & badges

### Live Polls
- Live session creation
- Host controls (start/pause/end)
- Real-time participant count
- Live voting interface
- Live results visualization

### User Profile
- Profile editing
- Avatar upload
- Settings management
- Verification status
- Subscription management
- Activity history

### Analytics
- Poll performance metrics
- Demographics breakdown
- Vote timeline
- Export data

---

## Routing

### Public Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Homepage | Landing page |
| `/login` | Login | User login |
| `/register` | Register | User registration |
| `/polls` | Poll List | Browse polls |
| `/polls/[id]` | Poll Detail | View/vote on poll |
| `/users/[username]` | User Profile | Public profile |
| `/live/[code]` | Live Session | Join live poll |
| `/forgot-password` | Password Reset | Request reset |

### Protected Routes (Auth Required)

| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | Dashboard | User dashboard |
| `/polls/create` | Poll Creator | Create new poll |
| `/polls/[id]/edit` | Poll Editor | Edit poll |
| `/polls/[id]/analytics` | Poll Analytics | View poll stats |
| `/surveys/create` | Survey Creator | Create survey |
| `/tests/create` | Quiz Creator | Create quiz |
| `/live/create` | Live Session Creator | Create live poll |
| `/settings` | Settings | User settings |
| `/settings/account` | Account Settings | Account management |
| `/settings/billing` | Billing | Subscription management |

### Admin Routes (Role: ADMIN)

| Path | Component | Description |
|------|-----------|-------------|
| `/admin` | Admin Dashboard | Platform overview |
| `/admin/users` | User Management | Manage users |
| `/admin/moderation` | Moderation Queue | Content moderation |
| `/admin/analytics` | Platform Analytics | Platform stats |

---

## State Management

### Server State (TanStack Query)

**API Data**: All server data managed by TanStack Query

```typescript
// Example: Poll fetching
export function usePoll(id: string) {
  return useQuery({
    queryKey: ['poll', id],
    queryFn: () => api.polls.getById(id),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
```

**Mutations**:
```typescript
// Example: Vote submission
export function useVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pollId, optionId }) => api.polls.vote(pollId, optionId),
    onSuccess: (data, { pollId }) => {
      // Invalidate poll to refetch
      queryClient.invalidateQueries(['poll', pollId])
    }
  })
}
```

### Client State

**Minimal client-only state**:
- UI toggles (modals, dropdowns)
- Form state (React Hook Form)
- Theme preference (localStorage)

---

## Forms & Validation

**Library**: React Hook Form + Zod

**Pattern**:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const pollSchema = z.object({
  title: z.string().min(10).max(200),
  options: z.array(z.string().min(1).max(100)).min(2).max(10)
})

type PollFormData = z.infer<typeof pollSchema>

export function PollCreateForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<PollFormData>({
    resolver: zodResolver(pollSchema)
  })

  const onSubmit = (data: PollFormData) => {
    // Submit to API
  }

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

---

## API Integration

**Client**: Custom wrapper around `fetch`

**Location**: `lib/api.ts`

**Features**:
- Automatic token refresh
- Error handling
- Type-safe endpoints
- Request/response interceptors

**Example**:
```typescript
// lib/api.ts
export const api = {
  polls: {
    list: (params) => fetchAPI('/polls', { params }),
    getById: (id) => fetchAPI(`/polls/${id}`),
    create: (data) => fetchAPI('/polls', { method: 'POST', body: data }),
    vote: (id, optionId) => fetchAPI(`/polls/${id}/vote`, {
      method: 'POST',
      body: { optionId }
    })
  },
  // ... other resources
}
```

---

## Authentication Flow

### Login
1. User enters email + password
2. POST `/api/auth/login`
3. Store access token in memory
4. Store refresh token in HttpOnly cookie
5. Redirect to dashboard

### Token Refresh
- Automatic refresh on 401 response
- Refresh token rotated on each refresh
- Silent refresh before expiry

### Logout
1. POST `/api/auth/logout`
2. Clear tokens
3. Invalidate all queries
4. Redirect to homepage

---

## Real-Time Updates (WebSocket)

**Library**: Native WebSocket + React hooks

**Events**:
- `poll:vote` - Live vote updates
- `live:join` - Participant joined
- `live:vote` - Live poll vote
- `notification:new` - New notification

**Hook**:
```typescript
export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket(`wss://api.voxpoll.com/ws?token=${token}`)

    socket.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      // Handle events
    }

    setWs(socket)

    return () => socket.close()
  }, [])

  return ws
}
```

---

## Internationalization (i18n)

**Library**: next-intl

**Supported Languages**: en, tr

**Usage**:
```typescript
import { useTranslations } from 'next-intl'

export function PollCard() {
  const t = useTranslations('poll')

  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('votes', { count: voteCount })}</p>
    </div>
  )
}
```

**Translation Files**: `messages/en.json`, `messages/tr.json`

---

## Performance Optimization

### Code Splitting
- Route-based automatic splitting (Next.js)
- Dynamic imports for heavy components
- Lazy loading images

### Caching Strategy
- Static pages cached at CDN edge
- ISR (Incremental Static Regeneration) for poll lists
- SWR for client-side caching (TanStack Query)

### Image Optimization
- Next.js Image component
- WebP format with fallbacks
- Lazy loading
- Responsive sizes

---

## SEO & Meta Tags

**Dynamic Meta Tags**:
```typescript
// app/polls/[id]/page.tsx
export async function generateMetadata({ params }) {
  const poll = await api.polls.getById(params.id)

  return {
    title: `${poll.title} - VoxPoll`,
    description: poll.description,
    openGraph: {
      title: poll.title,
      description: poll.description,
      images: [poll.imageUrl]
    }
  }
}
```

---

## Analytics & Monitoring

**Vercel Analytics**: Page views, Web Vitals

**Custom Events**:
- Poll created
- Poll voted
- User registered
- Subscription upgraded

**Error Tracking**: Sentry (configured in root layout)

---

## Accessibility

**Standards**: WCAG 2.1 Level AA

**Features**:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.voxpoll.com
NEXT_PUBLIC_WS_URL=wss://api.voxpoll.com/ws
NEXT_PUBLIC_SENTRY_DSN=...
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
```

---

## Build & Deployment

**Build Command**: `pnpm build`
**Output**: `.next/` directory
**Deployment**: Vercel (automatic on git push)

**Build Steps**:
1. TypeScript compilation
2. Tailwind CSS processing
3. Next.js optimization
4. Static generation (where applicable)

---

## Related Documentation

- **API Contract**: [05-api/01-api-contract.md](c:\Users\PC\Documents\naim\projects\voxpoll\docs\bible\05-api\01-api-contract.md)
- **User Flows**: `docs/bible/06-UX/`
- **Component Library**: `packages/ui/`

---

*NyoWorks Application Specification - Web App v1*
