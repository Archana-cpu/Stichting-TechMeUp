# ═══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - FRONTEND ARCHITECTURE & GUIDELINES
# ═══════════════════════════════════════════════════════════════════════════════
# Version: 1.0 | Created: January 2026
# Stack: Next.js 16 + React 19.1 + Tailwind CSS 4 + shadcn/ui
# ═══════════════════════════════════════════════════════════════════════════════

## Table of Contents

1. [Core Principles](#1-core-principles)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Component Architecture](#4-component-architecture)
5. [Internationalization (i18n)](#5-internationalization-i18n)
6. [Theming System](#6-theming-system)
7. [Design Tokens](#7-design-tokens)
8. [State Management](#8-state-management)
9. [Performance Patterns](#9-performance-patterns)
10. [Accessibility (a11y)](#10-accessibility-a11y)
11. [Admin Configuration](#11-admin-configuration)
12. [Code Style Rules](#12-code-style-rules)

---

## 1. Core Principles

### 1.1 Zero Hardcoding
```
STRICT RULE: NO hardcoded strings, colors, sizes, or configuration in components.
Everything must be configurable via:
- Design tokens (colors, spacing, typography)
- Translation keys (all user-visible text)
- Environment variables (URLs, feature flags)
- Admin panel settings (dynamic configuration)
```

### 1.2 Separation of Concerns
```
UI Layer     → Pure presentational components (no business logic)
Logic Layer  → Hooks, server actions, utilities
Data Layer   → TanStack Query, server components
Config Layer → Design tokens, translations, settings
```

### 1.3 Server-First Architecture
```
DEFAULT: Server Components (zero client JS)
CLIENT ONLY WHEN: User interactions, browser APIs, real-time updates
RULE: "Ship less, compute server-side, hydrate minimally"
```

### 1.4 Consistency Over Creativity
```
- Use existing patterns before creating new ones
- Follow established component APIs
- Match existing code style exactly
- Reference design system before custom styling
```

---

## 2. Technology Stack

### 2.1 Core Technologies
| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 16.x | App Router, RSC, Streaming |
| UI Library | React | 19.1 | Server Components, Compiler |
| Styling | Tailwind CSS | 4.x | Utility-first, CSS-first config |
| Components | shadcn/ui | Latest | Radix UI + Tailwind |
| i18n | next-intl | Latest | Type-safe translations |
| State | TanStack Query | 5.x | Server state management |
| Forms | React Hook Form | 7.x | + Zod validation |
| Icons | Lucide React | Latest | Consistent iconography |
| Themes | next-themes | Latest | Dark/Light mode |

### 2.2 Why These Choices
- **next-intl over react-i18next**: Native App Router support, type-safe keys, smaller bundle
- **shadcn/ui over MUI**: Full control, Tailwind native, accessible, customizable
- **Tailwind 4**: CSS-first config, 5x faster builds, @property support
- **TanStack Query**: Server state caching, optimistic updates, devtools

---

## 3. Project Structure

```
packages/web/src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Locale-based routing
│   │   ├── (auth)/               # Auth layout group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/          # Dashboard layout group
│   │   │   ├── dashboard/
│   │   │   ├── polls/
│   │   │   │   ├── page.tsx      # List
│   │   │   │   ├── new/          # Create
│   │   │   │   └── [id]/         # Detail
│   │   │   ├── surveys/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── (public)/             # Public layout group
│   │   │   ├── p/[slug]/         # Public poll view
│   │   │   └── u/[username]/     # User profile
│   │   ├── layout.tsx            # Root locale layout
│   │   └── page.tsx              # Landing page
│   ├── api/                      # API routes (minimal)
│   └── globals.css               # Global styles + tokens
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── forms/                    # Form components
│   │   ├── poll-form.tsx
│   │   ├── survey-form.tsx
│   │   └── form-field.tsx
│   ├── layouts/                  # Layout components
│   │   ├── dashboard-nav.tsx
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── features/                 # Feature-specific
│   │   ├── polls/
│   │   │   ├── poll-card.tsx
│   │   │   ├── poll-options.tsx
│   │   │   └── poll-results.tsx
│   │   ├── surveys/
│   │   └── auth/
│   └── shared/                   # Shared components
│       ├── loading.tsx
│       ├── error-boundary.tsx
│       └── empty-state.tsx
│
├── lib/
│   ├── api.ts                    # API client
│   ├── utils.ts                  # Utility functions
│   └── validations.ts            # Zod schemas
│
├── hooks/
│   ├── use-poll.ts
│   ├── use-auth.ts
│   └── use-media-query.ts
│
├── actions/                      # Server Actions
│   ├── auth.actions.ts
│   ├── poll.actions.ts
│   └── survey.actions.ts
│
├── i18n/
│   ├── config.ts                 # i18n configuration
│   ├── request.ts                # Server-side i18n
│   └── messages/
│       ├── tr.json               # Turkish translations
│       └── en.json               # English translations
│
├── styles/
│   └── tokens.css                # Design tokens
│
└── types/
    ├── api.ts                    # API response types
    └── ui.ts                     # UI component types
```

---

## 4. Component Architecture

### 4.1 Component Categories

#### Server Components (Default)
```typescript
// app/[locale]/(dashboard)/polls/page.tsx
import { getTranslations } from 'next-intl/server'
import { getPollsAction } from '@/actions/poll.actions'
import { PollList } from '@/components/features/polls/poll-list'

export default async function PollsPage() {
  const t = await getTranslations('polls')
  const { data: polls } = await getPollsAction()

  return (
    <div>
      <h1>{t('title')}</h1>
      <PollList polls={polls} />
    </div>
  )
}
```

#### Client Components (Explicit)
```typescript
// components/features/polls/poll-voting.tsx
'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { voteAction } from '@/actions/poll.actions'

export function PollVoting({ pollId, options }: PollVotingProps) {
  const t = useTranslations('polls.voting')
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string | null>(null)

  const handleVote = () => {
    if (!selected) return
    startTransition(async () => {
      await voteAction(pollId, selected)
    })
  }

  return (
    <div>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => setSelected(option.id)}
          disabled={isPending}
          aria-pressed={selected === option.id}
        >
          {option.text}
        </button>
      ))}
      <button onClick={handleVote} disabled={!selected || isPending}>
        {isPending ? t('submitting') : t('submit')}
      </button>
    </div>
  )
}
```

### 4.2 Component Rules

```
RULE-C1: One component per file
RULE-C2: Export at end of file
RULE-C3: Props interface above component
RULE-C4: No inline styles (use Tailwind or cn())
RULE-C5: All text via translation keys
RULE-C6: All colors via design tokens
RULE-C7: Explicit 'use client' only when needed
RULE-C8: Component name matches file name
```

### 4.3 Component Template

```typescript
// components/features/polls/poll-card.tsx
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Poll } from '@/types/api'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PollCardProps {
  poll: Poll
  className?: string
  onClick?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

function PollCard({ poll, className, onClick }: PollCardProps) {
  const t = useTranslations('polls.card')

  return (
    <Card
      className={cn('cursor-pointer hover:shadow-md transition-shadow', className)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{poll.title}</CardTitle>
          <Badge variant={poll.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {t(`status.${poll.status.toLowerCase()}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          {t('votes', { count: poll.totalVotes })}
        </p>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { PollCard }
export type { PollCardProps }
```

---

## 5. Internationalization (i18n)

### 5.1 Configuration

```typescript
// i18n/config.ts
export const locales = ['tr', 'en'] as const
export const defaultLocale = 'tr' as const

export type Locale = (typeof locales)[number]
```

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from './config'

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locales.includes(locale as any) ? locale : defaultLocale

  return {
    messages: (await import(`./messages/${safeLocale}.json`)).default,
    timeZone: 'Europe/Istanbul',
    now: new Date(),
  }
})
```

### 5.2 Translation File Structure

```json
// i18n/messages/tr.json
{
  "common": {
    "loading": "Yükleniyor...",
    "error": "Bir hata oluştu",
    "save": "Kaydet",
    "cancel": "İptal",
    "delete": "Sil",
    "edit": "Düzenle",
    "create": "Oluştur",
    "search": "Ara",
    "filter": "Filtrele",
    "sort": "Sırala",
    "noResults": "Sonuç bulunamadı",
    "retry": "Tekrar Dene"
  },
  "auth": {
    "login": {
      "title": "Giriş Yap",
      "email": "E-posta",
      "password": "Şifre",
      "submit": "Giriş Yap",
      "forgotPassword": "Şifremi Unuttum",
      "noAccount": "Hesabınız yok mu?",
      "register": "Kayıt Ol"
    },
    "register": {
      "title": "Hesap Oluştur",
      "username": "Kullanıcı Adı",
      "displayName": "Görünen Ad",
      "email": "E-posta",
      "password": "Şifre",
      "confirmPassword": "Şifre Tekrar",
      "terms": "Kullanım koşullarını kabul ediyorum",
      "submit": "Kayıt Ol",
      "hasAccount": "Zaten hesabınız var mı?",
      "login": "Giriş Yap"
    },
    "errors": {
      "invalidCredentials": "E-posta veya şifre hatalı",
      "emailExists": "Bu e-posta adresi zaten kullanımda",
      "usernameExists": "Bu kullanıcı adı zaten kullanımda",
      "weakPassword": "Şifre en az 10 karakter olmalı"
    }
  },
  "dashboard": {
    "title": "Gösterge Paneli",
    "welcome": "Hoş geldin, {name}!",
    "stats": {
      "totalPolls": "Toplam Anket",
      "totalVotes": "Toplam Oy",
      "activePolls": "Aktif Anketler",
      "responseRate": "Yanıt Oranı"
    }
  },
  "polls": {
    "title": "Anketler",
    "create": "Yeni Anket",
    "empty": "Henüz anket oluşturmadınız",
    "card": {
      "status": {
        "active": "Aktif",
        "ended": "Sona Erdi",
        "draft": "Taslak",
        "scheduled": "Planlandı"
      },
      "votes": "{count, plural, =0 {Henüz oy yok} one {# oy} other {# oy}}"
    },
    "form": {
      "title": "Anket Başlığı",
      "titlePlaceholder": "Anketinizin başlığını girin",
      "description": "Açıklama (Opsiyonel)",
      "descriptionPlaceholder": "Anketiniz hakkında kısa bir açıklama",
      "options": "Seçenekler",
      "addOption": "Seçenek Ekle",
      "removeOption": "Seçeneği Kaldır",
      "optionPlaceholder": "Seçenek {number}",
      "minOptions": "En az 2 seçenek gerekli",
      "maxOptions": "En fazla {max} seçenek ekleyebilirsiniz",
      "settings": {
        "title": "Ayarlar",
        "visibility": "Görünürlük",
        "public": "Herkese Açık",
        "private": "Özel",
        "unlisted": "Listelenmemiş",
        "allowAnonymous": "Anonim oylamaya izin ver",
        "showResultsBeforeVoting": "Oy vermeden önce sonuçları göster",
        "endDate": "Bitiş Tarihi (Opsiyonel)"
      },
      "submit": "Anketi Oluştur",
      "submitting": "Oluşturuluyor..."
    },
    "voting": {
      "submit": "Oyumu Gönder",
      "submitting": "Gönderiliyor...",
      "voted": "Oyunuz kaydedildi!",
      "alreadyVoted": "Bu ankete zaten oy verdiniz"
    },
    "results": {
      "title": "Sonuçlar",
      "totalVotes": "Toplam {count} oy",
      "percentage": "%{value}",
      "noVotes": "Henüz oy verilmedi"
    }
  },
  "surveys": {
    "title": "Formlar",
    "create": "Yeni Form",
    "empty": "Henüz form oluşturmadınız"
  },
  "settings": {
    "title": "Ayarlar",
    "profile": {
      "title": "Profil",
      "displayName": "Görünen Ad",
      "username": "Kullanıcı Adı",
      "email": "E-posta",
      "bio": "Hakkımda",
      "avatar": "Profil Fotoğrafı",
      "save": "Profili Kaydet"
    },
    "preferences": {
      "title": "Tercihler",
      "language": "Dil",
      "theme": "Tema",
      "themes": {
        "light": "Açık",
        "dark": "Koyu",
        "system": "Sistem"
      },
      "notifications": "Bildirimler",
      "emailNotifications": "E-posta Bildirimleri"
    },
    "security": {
      "title": "Güvenlik",
      "changePassword": "Şifre Değiştir",
      "twoFactor": "İki Faktörlü Doğrulama",
      "sessions": "Aktif Oturumlar"
    }
  },
  "errors": {
    "404": {
      "title": "Sayfa Bulunamadı",
      "description": "Aradığınız sayfa mevcut değil veya taşınmış olabilir.",
      "backHome": "Ana Sayfaya Dön"
    },
    "500": {
      "title": "Sunucu Hatası",
      "description": "Bir şeyler yanlış gitti. Lütfen daha sonra tekrar deneyin.",
      "retry": "Tekrar Dene"
    },
    "network": {
      "title": "Bağlantı Hatası",
      "description": "İnternet bağlantınızı kontrol edin."
    }
  },
  "validation": {
    "required": "Bu alan zorunludur",
    "email": "Geçerli bir e-posta adresi girin",
    "minLength": "En az {min} karakter olmalı",
    "maxLength": "En fazla {max} karakter olabilir",
    "passwordMatch": "Şifreler eşleşmiyor",
    "invalidFormat": "Geçersiz format"
  },
  "time": {
    "justNow": "Az önce",
    "minutesAgo": "{count} dakika önce",
    "hoursAgo": "{count} saat önce",
    "daysAgo": "{count} gün önce",
    "weeksAgo": "{count} hafta önce"
  }
}
```

### 5.3 Translation Usage Rules

```
RULE-I1: ALL user-visible text must use translation keys
RULE-I2: No string concatenation - use ICU message format
RULE-I3: Pluralization must use ICU plural syntax
RULE-I4: Date/time formatting via next-intl formatters
RULE-I5: Translation keys follow dot notation hierarchy
RULE-I6: Component-specific keys under feature namespace
RULE-I7: Shared keys under 'common' namespace
```

### 5.4 ICU Message Format Examples

```typescript
// Pluralization
t('polls.card.votes', { count: 5 })
// "5 oy" (Turkish) / "5 votes" (English)

// Variables
t('dashboard.welcome', { name: 'Ahmet' })
// "Hoş geldin, Ahmet!"

// Select
t('status', { status: 'active' })
// Uses: "{status, select, active {Aktif} ended {Bitti} other {Bilinmiyor}}"
```

---

## 6. Theming System

### 6.1 Theme Configuration

```typescript
// app/[locale]/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
```

### 6.2 CSS Variables (Design Tokens)

```css
/* styles/tokens.css */
@layer base {
  :root {
    /* ─────────────────────────────────────────────────────────────────────── */
    /* Color Tokens - Light Mode                                               */
    /* ─────────────────────────────────────────────────────────────────────── */

    /* Background */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    /* Card */
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    /* Popover */
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    /* Primary - Brand Blue */
    --primary: 199 89% 48%;
    --primary-foreground: 210 40% 98%;

    /* Secondary */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    /* Muted */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    /* Accent */
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    /* Destructive */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    /* Success */
    --success: 142 76% 36%;
    --success-foreground: 210 40% 98%;

    /* Warning */
    --warning: 38 92% 50%;
    --warning-foreground: 222.2 84% 4.9%;

    /* Border & Input */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 199 89% 48%;

    /* Chart Colors */
    --chart-1: 199 89% 48%;
    --chart-2: 173 80% 40%;
    --chart-3: 38 92% 50%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;

    /* Radius */
    --radius: 0.5rem;

    /* ─────────────────────────────────────────────────────────────────────── */
    /* Spacing Tokens                                                          */
    /* ─────────────────────────────────────────────────────────────────────── */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;

    /* ─────────────────────────────────────────────────────────────────────── */
    /* Typography Tokens                                                       */
    /* ─────────────────────────────────────────────────────────────────────── */
    --font-sans: var(--font-geist-sans), system-ui, sans-serif;
    --font-mono: var(--font-geist-mono), monospace;

    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;
    --text-4xl: 2.25rem;

    /* ─────────────────────────────────────────────────────────────────────── */
    /* Shadow Tokens                                                           */
    /* ─────────────────────────────────────────────────────────────────────── */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

    /* ─────────────────────────────────────────────────────────────────────── */
    /* Animation Tokens                                                        */
    /* ─────────────────────────────────────────────────────────────────────── */
    --duration-fast: 150ms;
    --duration-normal: 200ms;
    --duration-slow: 300ms;
    --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
  }

  .dark {
    /* ─────────────────────────────────────────────────────────────────────── */
    /* Color Tokens - Dark Mode                                                */
    /* ─────────────────────────────────────────────────────────────────────── */

    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 199 89% 48%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --success: 142 76% 36%;
    --success-foreground: 210 40% 98%;

    --warning: 38 92% 50%;
    --warning-foreground: 222.2 84% 4.9%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 199 89% 48%;
  }
}
```

### 6.3 Theme Rules

```
RULE-T1: ALL colors via CSS variables (hsl format)
RULE-T2: NO hardcoded hex/rgb values in components
RULE-T3: Dark mode via .dark class (next-themes)
RULE-T4: Theme toggle saves to localStorage
RULE-T5: System preference respected by default
RULE-T6: Smooth transitions on theme change (except page load)
```

---

## 7. Design Tokens

### 7.1 Token Categories

| Category | Purpose | Example |
|----------|---------|---------|
| Colors | Brand, semantic, UI colors | `--primary`, `--success` |
| Spacing | Margins, paddings, gaps | `--spacing-md` |
| Typography | Font sizes, weights, families | `--text-lg` |
| Shadows | Elevation levels | `--shadow-md` |
| Radius | Border radius values | `--radius` |
| Animations | Durations, easing | `--duration-normal` |

### 7.2 Tailwind Integration

```css
/* globals.css */
@theme {
  --color-primary: hsl(var(--primary));
  --color-secondary: hsl(var(--secondary));
  --color-destructive: hsl(var(--destructive));
  --color-success: hsl(var(--success));
  --color-warning: hsl(var(--warning));
  --color-muted: hsl(var(--muted));

  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
}
```

---

## 8. State Management

### 8.1 TanStack Query Configuration

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          // No retry for client errors (4xx)
          if (error instanceof Error && 'status' in error) {
            const status = (error as any).status
            if (status >= 400 && status < 500) return false
          }
          return failureCount < 3
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
```

### 8.2 Query Keys Convention

```typescript
// lib/query-keys.ts
export const queryKeys = {
  polls: {
    all: ['polls'] as const,
    lists: () => [...queryKeys.polls.all, 'list'] as const,
    list: (filters: PollFilters) => [...queryKeys.polls.lists(), filters] as const,
    details: () => [...queryKeys.polls.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.polls.details(), id] as const,
    results: (id: string) => [...queryKeys.polls.detail(id), 'results'] as const,
  },
  surveys: {
    all: ['surveys'] as const,
    // ...
  },
  user: {
    current: ['user', 'current'] as const,
    profile: (username: string) => ['user', 'profile', username] as const,
  },
}
```

### 8.3 State Management Rules

```
RULE-S1: Server state via TanStack Query
RULE-S2: UI state via React state (useState)
RULE-S3: Form state via React Hook Form
RULE-S4: No client state for server data
RULE-S5: Optimistic updates for mutations
RULE-S6: Cache invalidation after mutations
```

---

## 9. Performance Patterns

### 9.1 Server Components (Default)

```typescript
// GOOD: Server Component (default)
export default async function PollsPage() {
  const polls = await getPollsAction()
  return <PollList polls={polls} />
}

// BAD: Unnecessary client component
'use client'
export default function PollsPage() {
  const { data: polls } = useQuery({ queryKey: ['polls'] })
  return <PollList polls={polls} />
}
```

### 9.2 Streaming with Suspense

```typescript
// app/[locale]/(dashboard)/polls/page.tsx
import { Suspense } from 'react'
import { PollListSkeleton } from '@/components/features/polls/poll-list-skeleton'
import { PollList } from '@/components/features/polls/poll-list'

export default function PollsPage() {
  return (
    <div>
      <h1>Polls</h1>
      <Suspense fallback={<PollListSkeleton />}>
        <PollList />
      </Suspense>
    </div>
  )
}
```

### 9.3 Image Optimization

```typescript
// ALWAYS use next/image
import Image from 'next/image'

<Image
  src={user.avatarUrl}
  alt={user.displayName}
  width={40}
  height={40}
  className="rounded-full"
  priority={isAboveFold}
/>
```

### 9.4 Performance Rules

```
RULE-P1: Server Components by default
RULE-P2: 'use client' only for interactivity
RULE-P3: Suspense boundaries for async data
RULE-P4: next/image for all images
RULE-P5: Dynamic imports for heavy components
RULE-P6: Avoid barrel exports (tree-shake issues)
RULE-P7: Prefetch critical routes
```

---

## 10. Accessibility (a11y)

### 10.1 WCAG 2.1 AA Compliance

```
- Color contrast ratio: 4.5:1 (text), 3:1 (large text)
- Focus indicators visible
- Keyboard navigation supported
- Screen reader compatible
- Reduced motion respected
```

### 10.2 Accessibility Patterns

```typescript
// Buttons
<button
  type="button"
  aria-label={t('polls.delete')}
  aria-describedby="delete-tooltip"
  disabled={isDeleting}
>
  <TrashIcon aria-hidden="true" />
</button>

// Forms
<label htmlFor="poll-title">{t('polls.form.title')}</label>
<input
  id="poll-title"
  aria-required="true"
  aria-invalid={!!errors.title}
  aria-describedby={errors.title ? 'title-error' : undefined}
/>
{errors.title && (
  <p id="title-error" role="alert">
    {errors.title.message}
  </p>
)}

// Loading states
<div role="status" aria-live="polite">
  <Spinner aria-hidden="true" />
  <span className="sr-only">{t('common.loading')}</span>
</div>
```

### 10.3 Accessibility Rules

```
RULE-A1: All interactive elements focusable
RULE-A2: Visible focus indicators
RULE-A3: Labels for all form inputs
RULE-A4: Alt text for all images
RULE-A5: ARIA labels for icon-only buttons
RULE-A6: Error messages linked to inputs
RULE-A7: Skip navigation link
RULE-A8: Reduced motion via prefers-reduced-motion
```

---

## 11. Admin Configuration

### 11.1 Dynamic Settings Schema

```typescript
// types/admin-settings.ts
interface AppSettings {
  branding: {
    logoUrl: string
    faviconUrl: string
    primaryColor: string // HSL value
    appName: string
  }
  features: {
    enableSurveys: boolean
    enableTests: boolean
    enableLivePolls: boolean
    enableComments: boolean
    enableGamification: boolean
  }
  limits: {
    maxPollOptions: number
    maxSurveyQuestions: number
    freeUserPollLimit: number
  }
  localization: {
    defaultLocale: Locale
    enabledLocales: Locale[]
  }
  seo: {
    siteName: string
    siteDescription: string
    socialImage: string
  }
}
```

### 11.2 Settings Server Action

```typescript
// actions/settings.actions.ts
'use server'

import { cache } from 'react'

export const getAppSettings = cache(async (): Promise<AppSettings> => {
  const response = await fetch(`${API_URL}/admin/settings`, {
    next: { revalidate: 60 }, // Cache for 1 minute
  })
  return response.json()
})
```

### 11.3 Settings Usage

```typescript
// app/[locale]/layout.tsx
import { getAppSettings } from '@/actions/settings.actions'

export async function generateMetadata() {
  const settings = await getAppSettings()

  return {
    title: {
      template: `%s | ${settings.seo.siteName}`,
      default: settings.seo.siteName,
    },
    description: settings.seo.siteDescription,
  }
}
```

---

## 12. Code Style Rules

### 12.1 File Naming

```
RULE-F1: Components: kebab-case (poll-card.tsx)
RULE-F2: Pages: page.tsx (Next.js convention)
RULE-F3: Layouts: layout.tsx
RULE-F4: Hooks: use-*.ts (use-poll.ts)
RULE-F5: Actions: *.actions.ts
RULE-F6: Types: *.ts in types/ folder
RULE-F7: Utilities: descriptive names (format-date.ts)
```

### 12.2 Import Order

```typescript
// 1. React/Next.js
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 2. External libraries
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

// 3. Internal - lib/utils
import { cn } from '@/lib/utils'

// 4. Internal - components
import { Button } from '@/components/ui/button'
import { PollCard } from '@/components/features/polls/poll-card'

// 5. Internal - hooks/actions
import { usePoll } from '@/hooks/use-poll'
import { getPollAction } from '@/actions/poll.actions'

// 6. Types
import type { Poll } from '@/types/api'
```

### 12.3 TypeScript Rules

```
RULE-TS1: Strict mode enabled
RULE-TS2: No 'any' type
RULE-TS3: No 'as' casts (except JSX generic)
RULE-TS4: Interface for objects, type for unions
RULE-TS5: Export types separately
RULE-TS6: Prefer inference over explicit types
```

---

## Summary Checklist

Before implementing any UI feature, verify:

- [ ] All text uses translation keys
- [ ] All colors use CSS variables
- [ ] Component follows template structure
- [ ] Server Component unless interaction needed
- [ ] Accessibility attributes added
- [ ] Loading and error states handled
- [ ] Responsive design implemented
- [ ] Dark mode supported
- [ ] TypeScript strict compliance
- [ ] No hardcoded values

---

# ═══════════════════════════════════════════════════════════════════════════════
# END OF FRONTEND ARCHITECTURE
# ═══════════════════════════════════════════════════════════════════════════════
