# UI Specifications

> Source: bible-frontend-ui.md (Parts 1-5), bible-026.md

This document defines UI component specifications, design system, responsive layouts, and component architecture.


# ═══════════════════════════════════════════════════════════════════════════════
# DESIGN PHILOSOPHY
# ═══════════════════════════════════════════════════════════════════════════════

## Core Principle: "Trust Through Clarity"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VOXPOLL DESIGN PHILOSOPHY                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CORE PRINCIPLE: "Trust Through Clarity"                                    │
│  ═══════════════════════════════════════                                    │
│                                                                             │
│  Users must TRUST that:                                                     │
│  • Their vote is counted correctly                                          │
│  • Results are authentic and unmanipulated                                  │
│  • Their data is protected                                                  │
│  • The platform is fair and transparent                                     │
│                                                                             │
│  This trust is built through:                                               │
│  • Clean, professional visual language                                      │
│  • Immediate feedback on all actions                                        │
│  • Transparent reliability scoring                                          │
│  • Consistent, predictable interactions                                     │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  DESIGN PILLARS:                                                            │
│                                                                             │
│  1. CLARITY                    2. ENGAGEMENT                                │
│     • Simple, focused UI          • Gamification elements                   │
│     • Clear information           • Spotify-wrapped style PULSE             │
│       hierarchy                   • Satisfying micro-interactions           │
│     • No visual clutter           • Badge collection system                 │
│                                                                             │
│  3. INCLUSIVITY                4. RESPONSIVENESS                            │
│     • WCAG 2.1 AA compliant       • 60fps animations                        │
│     • RTL language support        • Optimistic UI updates                   │
│     • Reduced motion options      • Skeleton loading states                 │
│     • High contrast modes         • Works on 3G networks                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# DESIGN TOKENS
# ═══════════════════════════════════════════════════════════════════════════════

## Color System

```css
:root {
  /* ─────────────────────────────────────────────────────────────────────────
     PRIMARY COLORS - VoxPoll Blue (Trust, Reliability)
     ───────────────────────────────────────────────────────────────────────── */
  --vox-primary-50: #e6f4ff;
  --vox-primary-100: #b3dcff;
  --vox-primary-200: #80c4ff;
  --vox-primary-300: #4dacff;
  --vox-primary-400: #1a94ff;
  --vox-primary-500: #0c8ce9;   /* Main brand color */
  --vox-primary-600: #0a70ba;
  --vox-primary-700: #07548c;
  --vox-primary-800: #05385d;
  --vox-primary-900: #021c2f;

  /* ─────────────────────────────────────────────────────────────────────────
     ACCENT COLORS - For PULSE, badges, gamification
     ───────────────────────────────────────────────────────────────────────── */
  --vox-accent-violet: #8b5cf6;
  --vox-accent-pink: #ec4899;
  --vox-accent-orange: #f97316;
  --vox-accent-emerald: #10b981;
  --vox-accent-amber: #f59e0b;

  /* ─────────────────────────────────────────────────────────────────────────
     SEMANTIC COLORS
     ───────────────────────────────────────────────────────────────────────── */
  --vox-success: #22c55e;
  --vox-warning: #eab308;
  --vox-error: #ef4444;
  --vox-info: #3b82f6;

  /* ─────────────────────────────────────────────────────────────────────────
     NEUTRAL COLORS
     ───────────────────────────────────────────────────────────────────────── */
  --vox-gray-50: #fafafa;
  --vox-gray-100: #f4f4f5;
  --vox-gray-200: #e4e4e7;
  --vox-gray-300: #d4d4d8;
  --vox-gray-400: #a1a1aa;
  --vox-gray-500: #71717a;
  --vox-gray-600: #52525b;
  --vox-gray-700: #3f3f46;
  --vox-gray-800: #27272a;
  --vox-gray-900: #18181b;
  --vox-gray-950: #09090b;
}
```

## Typography Scale

```css
:root {
  /* ─────────────────────────────────────────────────────────────────────────
     FONT FAMILIES
     ───────────────────────────────────────────────────────────────────────── */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Plus Jakarta Sans', var(--font-sans);
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* ─────────────────────────────────────────────────────────────────────────
     TYPE SCALE (1.25 ratio - Major Third)
     ───────────────────────────────────────────────────────────────────────── */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */

  /* ─────────────────────────────────────────────────────────────────────────
     LINE HEIGHTS
     ───────────────────────────────────────────────────────────────────────── */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* ─────────────────────────────────────────────────────────────────────────
     FONT WEIGHTS
     ───────────────────────────────────────────────────────────────────────── */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

## Spacing Scale

```css
:root {
  /* 4px base unit */
  --space-0: 0;
  --space-px: 1px;
  --space-0.5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1.5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2.5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-3.5: 0.875rem;   /* 14px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 1.75rem;      /* 28px */
  --space-8: 2rem;         /* 32px */
  --space-9: 2.25rem;      /* 36px */
  --space-10: 2.5rem;      /* 40px */
  --space-11: 2.75rem;     /* 44px */
  --space-12: 3rem;        /* 48px */
  --space-14: 3.5rem;      /* 56px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
}
```


# ═══════════════════════════════════════════════════════════════════════════════
# COMPONENT DEVELOPMENT RULES
# ═══════════════════════════════════════════════════════════════════════════════

## SHADCN + TAILWIND ONLY APPROACH

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              COMPONENT DEVELOPMENT RULES - STRICTLY ENFORCED                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ALLOWED                                                                    │
│  ───────────                                                                │
│  • shadcn/ui components as base (Button, Card, Dialog, etc.)               │
│  • Tailwind CSS utility classes                                            │
│  • Tailwind arbitrary values: text-[14px], bg-[#123456]                    │
│  • CVA (class-variance-authority) for component variants                   │
│  • clsx/tailwind-merge via cn() utility                                    │
│  • CSS variables in :root for theming                                      │
│  • Framer Motion for animations (className-based)                          │
│                                                                             │
│  NOT ALLOWED                                                                │
│  ─────────────                                                              │
│  • Custom CSS files (.css, .scss, .less)                                   │
│  • CSS-in-JS (styled-components, emotion, etc.)                            │
│  • Inline style objects (except for dynamic CSS variables)                 │
│  • CSS Modules                                                             │
│  • External CSS libraries (except Tailwind)                                │
│  • @apply in CSS (use Tailwind directly in JSX)                            │
│                                                                             │
│  COMPONENT STRUCTURE                                                        │
│  ───────────────────                                                        │
│  1. Import shadcn/ui base component                                         │
│  2. Extend with CVA variants                                               │
│  3. Use only Tailwind classes in className                                 │
│  4. Accept className prop for composition                                  │
│  5. Use cn() for conditional classes                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Pattern Template

```typescript
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Component.displayName = "Component"

export { Component, componentVariants }
```


# ═══════════════════════════════════════════════════════════════════════════════
# RESPONSIVE BREAKPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

## Tailwind Breakpoint Configuration

```typescript
export default {
  theme: {
    screens: {
      'xs': '375px',    // Small phones
      'sm': '640px',    // Large phones / Small tablets
      'md': '768px',    // Tablets
      'lg': '1024px',   // Laptops
      'xl': '1280px',   // Desktops
      '2xl': '1536px',  // Large desktops
    },
  },
}
```

## Responsive Behavior Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RESPONSIVE BEHAVIOR MATRIX                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ELEMENT           │ Mobile (xs-sm) │ Tablet (md)  │ Desktop (lg+)          │
│  ──────────────────┼────────────────┼──────────────┼────────────────────────│
│  Navigation        │ Bottom bar     │ Top bar      │ Top bar + sidebar      │
│  Feed Layout       │ 1 column       │ 1 column     │ 1 col + 2 sidebars     │
│  Poll Card         │ Full width     │ Full width   │ Max 640px              │
│  Poll Options      │ Stacked        │ Stacked      │ Stacked                │
│  PULSE Animation   │ Full screen    │ Full screen  │ Centered modal         │
│  Comments          │ Full width     │ Full width   │ Max 720px              │
│  Create Form       │ Full width     │ Centered     │ Centered max 600px     │
│  Settings          │ Full width     │ Sidebar      │ Sidebar + content      │
│  Admin Dashboard   │ Collapsed      │ Sidebar      │ Full sidebar           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE WIREFRAMES
# ═══════════════════════════════════════════════════════════════════════════════

## Landing Page (/)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            LANDING PAGE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Logo]   Features  Pricing  Business    [TR/EN]  [Login] [Sign Up] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │              Your Opinion Matters                                    │   │
│  │                                                                      │   │
│  │     Create polls, discover insights, and join discussions           │   │
│  │     with a community that values authentic opinions.                │   │
│  │                                                                      │   │
│  │              [Start Free]    [Watch Demo]                           │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      FEATURES GRID                                   │   │
│  │                                                                      │   │
│  │   [Quick Polls]   [Live Events]   [Personality Tests]               │   │
│  │   Create in        Real-time       Discover who                     │   │
│  │   seconds          voting          you really are                   │   │
│  │                                                                      │   │
│  │   [PULSE Results]  [Discussions]  [Badges]                          │   │
│  │   Spotify-wrapped  Participate     Collect and                      │   │
│  │   style reveal     to unlock       share                            │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      FOR ORGANIZATIONS                               │   │
│  │                                                                      │   │
│  │    Enterprise surveys with SSO, analytics, and compliance           │   │
│  │                                                                      │   │
│  │    [Learn More ->]                                                  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Logo]  [Product] [Company] [Legal]  [TR/EN]    2026 VoxPoll       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Feed Page (/feed)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FEED PAGE                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Logo]   [Feed ▼]  [Explore ▼]  [Create ▼]    Search    Bell Avatar│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────┐ ┌────────────────────────────────┐ ┌───────────┐   │
│  │                    │ │                                │ │           │   │
│  │  SIDEBAR (Desktop) │ │         MAIN FEED              │ │ TRENDING  │   │
│  │                    │ │                                │ │ (Desktop) │   │
│  │  ┌──────────────┐  │ │  ┌────────────────────────┐   │ │           │   │
│  │  │ For You      │  │ │  │ [TABS: For You | Following | Discover]  │   │
│  │  │ Following    │  │ │  └────────────────────────┘   │ │ #topic1   │   │
│  │  │ Discover     │  │ │                                │ │ #topic2   │   │
│  │  └──────────────┘  │ │  ┌────────────────────────┐   │ │ #topic3   │   │
│  │                    │ │  │                        │   │ │           │   │
│  │  ┌──────────────┐  │ │  │  POLL CARD             │   │ │ ───────── │   │
│  │  │ My Content   │  │ │  │  ─────────             │   │ │           │   │
│  │  │ Badges       │  │ │  │  @username · 2h        │   │ │ SUGGESTED │   │
│  │  │ Saved        │  │ │  │                        │   │ │ USERS     │   │
│  │  └──────────────┘  │ │  │  "Which framework      │   │ │           │   │
│  │                    │ │  │   do you prefer?"      │   │ │ [@user1]  │   │
│  │  ┌──────────────┐  │ │  │                        │   │ │ [@user2]  │   │
│  │  │ [+] Create   │  │ │  │  ○ React    45%  ████  │   │ │ [@user3]  │   │
│  │  │ New Poll     │  │ │  │  ○ Vue      30%  ███   │   │ │           │   │
│  │  └──────────────┘  │ │  │  ○ Svelte   25%  ██    │   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  │  1.2k  89  Share       │   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  └────────────────────────┘   │ │           │   │
│  │                    │ │                                │ │           │   │
│  │                    │ │  ┌────────────────────────┐   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  │  TEST CARD             │   │ │           │   │
│  │                    │ │  │  ─────────             │   │ │           │   │
│  │                    │ │  │  Personality Test      │   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  │  "What type of        │   │ │           │   │
│  │                    │ │  │   developer are you?" │   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  │  [Take Test ->]       │   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  └────────────────────────┘   │ │           │   │
│  │                    │ │                                │ │           │   │
│  │                    │ │  [Load more...]               │ │           │   │
│  │                    │ │                                │ │           │   │
│  └────────────────────┘ └────────────────────────────────┘ └───────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Poll View Page (/p/[contentId])

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POLL VIEW PAGE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  <- Back                                            [Share] [More]  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  BEFORE VOTING                                                       │   │
│  │  ══════════════                                                      │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  @username                                                     │  │   │
│  │  │  Posted 2 hours ago · 83 Reliability Score                     │  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │   Which programming language should                      │  │  │   │
│  │  │  │   beginners learn first in 2026?                         │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  ○  Python                                               │  │  │   │
│  │  │  │     Great for data science and AI                        │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  ●  JavaScript                          <- Selected      │  │  │   │
│  │  │  │     Web development essential                           │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  ○  Rust                                                 │  │  │   │
│  │  │  │     Memory safety and performance                        │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │               [   Submit Vote   ]                        │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  2,847 votes · Ends in 5 days                                 │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  COMMENTS (Locked until you vote)                                    │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │    Vote to unlock discussion                                   │  │   │
│  │  │                                                                │  │   │
│  │  │    [████████████████████████████████████████████]              │  │   │
│  │  │    [████████████████████████████████████████████]  Blurred    │  │   │
│  │  │    [████████████████████████████████████████████]  Preview    │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## PULSE Page - Spotify-Wrapped Style

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PULSE PAGE - RESULTS REVEAL                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  STAGE 1: INTRO (0-2s)                                              │   │
│  │  ══════════════════════                                              │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │              [Gradient background animation]                   │  │   │
│  │  │                                                                │  │   │
│  │  │                     Ballot icon                                │  │   │
│  │  │                                                                │  │   │
│  │  │              "Your PULSE is ready"                             │  │   │
│  │  │                                                                │  │   │
│  │  │              [Kinetic text animation]                          │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  STAGE 2: YOUR CHOICE REVEAL (2-4s)                                 │   │
│  │  ════════════════════════════════════                                │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │              "You voted for..."                                │  │   │
│  │  │                                                                │  │   │
│  │  │              ┌─────────────────────────────┐                   │  │   │
│  │  │              │                              │                   │  │   │
│  │  │              │      JavaScript             │                   │  │   │
│  │  │              │                              │                   │  │   │
│  │  │              │      [Scale up animation]   │                   │  │   │
│  │  │              │                              │                   │  │   │
│  │  │              └─────────────────────────────┘                   │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  STAGE 3: COMPARISON (4-6s)                                         │   │
│  │  ══════════════════════════                                          │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │              "You agree with"                                  │  │   │
│  │  │                                                                │  │   │
│  │  │              ┌─────────────────┐                               │  │   │
│  │  │              │                  │                               │  │   │
│  │  │              │      45%        │  [Number count animation]    │  │   │
│  │  │              │                  │                               │  │   │
│  │  │              └─────────────────┘                               │  │   │
│  │  │                                                                │  │   │
│  │  │              "of 2,847 voters"                                 │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  STAGE 4: FULL RESULTS (6s+)                                        │   │
│  │  ═══════════════════════════                                         │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │  JavaScript (check)                           45%              │  │   │
│  │  │  ████████████████████████████████████████                      │  │   │
│  │  │                                                                │  │   │
│  │  │  Python                                       30%              │  │   │
│  │  │  ███████████████████████████                                   │  │   │
│  │  │                                                                │  │   │
│  │  │  Rust                                         15%              │  │   │
│  │  │  █████████████                                                 │  │   │
│  │  │                                                                │  │   │
│  │  │  Go                                           10%              │  │   │
│  │  │  █████████                                                     │  │   │
│  │  │                                                                │  │   │
│  │  │  [Bars animate from 0% to final value]                         │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │  [Replay PULSE]    [Share Results]    [View COMMENTS ->]       │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# MOBILE DESIGN PRINCIPLES
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MOBILE DESIGN PRINCIPLES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. THUMB-ZONE OPTIMIZATION                                                 │
│     • Primary actions in bottom 1/3 of screen                              │
│     • Navigation at bottom (iOS style)                                     │
│     • Floating action button for quick poll creation                       │
│     • Touch targets: minimum 44x44pt (iOS) / 48x48dp (Android)            │
│                                                                             │
│  2. GESTURE-FIRST INTERACTIONS                                              │
│     • Swipe between feed tabs (For You / Following / Discover)             │
│     • Swipe to dismiss modals                                              │
│     • Long press for quick actions                                         │
│     • Pull-to-refresh everywhere                                           │
│     • Double-tap to like/upvote                                            │
│                                                                             │
│  3. NATIVE FEEL                                                             │
│     • Platform-specific navigation patterns                                │
│     • Native haptic feedback                                               │
│     • Respect system dark mode                                             │
│     • Use native share sheets                                              │
│                                                                             │
│  4. PERFORMANCE FIRST                                                       │
│     • FlashList for all feeds (60fps scrolling)                           │
│     • Skeleton loading states                                              │
│     • Image lazy loading with blur placeholders                            │
│     • Minimize re-renders with React.memo                                  │
│                                                                             │
│  5. OFFLINE RESILIENCE                                                      │
│     • Cache recent content                                                 │
│     • Queue votes for sync                                                 │
│     • Clear offline indicators                                             │
│     • Graceful degradation                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## iOS vs Android Differences

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    iOS vs ANDROID DIFFERENCES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ELEMENT           │ iOS                    │ Android                       │
│  ──────────────────┼────────────────────────┼───────────────────────────────│
│  Navigation Bar    │ Large title style      │ Material 3 TopAppBar          │
│  Back Button       │ < Back (text)          │ <- (arrow only)               │
│  Tab Bar           │ SF Symbols             │ Material Icons                │
│  Haptics           │ UIImpactFeedback       │ VibrationEffect               │
│  Date Picker       │ Wheel picker           │ Material date picker          │
│  Action Sheet      │ Native sheet           │ Bottom sheet                  │
│  Blur Effects      │ Full support           │ Limited (use solid bg)        │
│  Safe Area         │ Dynamic Island aware   │ Status bar + nav bar          │
│  Font              │ SF Pro                 │ Roboto                        │
│  Shadows           │ shadow* props          │ elevation                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# COMPONENT CATALOG
# ═══════════════════════════════════════════════════════════════════════════════

## @voxpoll/ui Component Exports

```typescript
// ─────────────────────────────────────────────────────────────────────────
// PRIMITIVES (shadcn/ui base)
// ─────────────────────────────────────────────────────────────────────────
export * from "./components/ui/button"
export * from "./components/ui/input"
export * from "./components/ui/label"
export * from "./components/ui/textarea"
export * from "./components/ui/checkbox"
export * from "./components/ui/radio-group"
export * from "./components/ui/switch"
export * from "./components/ui/slider"
export * from "./components/ui/select"
export * from "./components/ui/badge"
export * from "./components/ui/avatar"
export * from "./components/ui/skeleton"
export * from "./components/ui/spinner"
export * from "./components/ui/separator"
export * from "./components/ui/progress"

// ─────────────────────────────────────────────────────────────────────────
// FEEDBACK & OVERLAYS
// ─────────────────────────────────────────────────────────────────────────
export * from "./components/ui/alert"
export * from "./components/ui/toast"
export * from "./components/ui/tooltip"
export * from "./components/ui/dialog"
export * from "./components/ui/sheet"
export * from "./components/ui/popover"
export * from "./components/ui/dropdown-menu"
export * from "./components/ui/context-menu"
export * from "./components/ui/alert-dialog"

// ─────────────────────────────────────────────────────────────────────────
// LAYOUT & NAVIGATION
// ─────────────────────────────────────────────────────────────────────────
export * from "./components/ui/card"
export * from "./components/ui/tabs"
export * from "./components/ui/accordion"
export * from "./components/ui/navigation-menu"
export * from "./components/ui/breadcrumb"
export * from "./components/ui/pagination"
export * from "./components/ui/scroll-area"
export * from "./components/ui/aspect-ratio"

// ─────────────────────────────────────────────────────────────────────────
// FORMS
// ─────────────────────────────────────────────────────────────────────────
export * from "./components/ui/form"
export * from "./components/ui/calendar"
export * from "./components/ui/date-picker"
export * from "./components/ui/command"
export * from "./components/ui/combobox"

// ─────────────────────────────────────────────────────────────────────────
// DATA DISPLAY
// ─────────────────────────────────────────────────────────────────────────
export * from "./components/ui/table"
export * from "./components/ui/data-table"

// ─────────────────────────────────────────────────────────────────────────
// VOXPOLL CUSTOM COMPONENTS
// ─────────────────────────────────────────────────────────────────────────

// Content Cards
export * from "./components/voxpoll/poll-card"
export * from "./components/voxpoll/test-card"
export * from "./components/voxpoll/survey-card"
export * from "./components/voxpoll/content-card-skeleton"

// Poll Components
export * from "./components/voxpoll/poll-option"
export * from "./components/voxpoll/poll-option-result"
export * from "./components/voxpoll/poll-timer"
export * from "./components/voxpoll/poll-stats"

// Voting Components
export * from "./components/voxpoll/rating-scale"
export * from "./components/voxpoll/likert-scale"
export * from "./components/voxpoll/slider-question"
export * from "./components/voxpoll/ranking-question"
export * from "./components/voxpoll/image-choice"

// Results & Charts
export * from "./components/voxpoll/result-bar"
export * from "./components/voxpoll/result-pie"
export * from "./components/voxpoll/result-donut"
export * from "./components/voxpoll/pulse-animation"
export * from "./components/voxpoll/reliability-badge"

// Comments
export * from "./components/voxpoll/comment-thread"
export * from "./components/voxpoll/comment-item"
export * from "./components/voxpoll/comment-composer"

// User Components
export * from "./components/voxpoll/user-avatar"
export * from "./components/voxpoll/user-badge"
export * from "./components/voxpoll/user-card"
export * from "./components/voxpoll/badge-display"
export * from "./components/voxpoll/badge-earned-animation"

// Live Poll
export * from "./components/voxpoll/live-poll-host"
export * from "./components/voxpoll/live-poll-participant"
export * from "./components/voxpoll/live-poll-results"
export * from "./components/voxpoll/live-join-code"

// ─────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────
export * from "./hooks/use-debounce"
export * from "./hooks/use-local-storage"
export * from "./hooks/use-media-query"
export * from "./hooks/use-on-click-outside"
export * from "./hooks/use-copy-to-clipboard"
export * from "./hooks/use-countdown"
export * from "./hooks/use-intersection-observer"
export * from "./hooks/use-theme"

// ─────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────
export * from "./utils/cn"
export * from "./utils/format-number"
export * from "./utils/format-date"
export * from "./utils/format-percentage"
```


## Poll Card Component Implementation

```typescript
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { UserAvatar } from "./user-avatar"
import { PollOption } from "./poll-option"
import { PollOptionResult } from "./poll-option-result"
import { PollStats } from "./poll-stats"
import { ReliabilityBadge } from "./reliability-badge"

const pollCardVariants = cva(
  [
    "w-full overflow-hidden transition-all duration-200",
    "hover:shadow-lg dark:hover:shadow-vox-primary-500/10"
  ],
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        full: "max-w-full"
      },
      state: {
        voting: "",
        voted: "bg-gradient-to-br from-vox-primary-50/50 to-transparent dark:from-vox-primary-950/30",
        closed: "opacity-75"
      }
    },
    defaultVariants: {
      size: "md",
      state: "voting"
    }
  }
)

interface PollCardProps extends VariantProps<typeof pollCardVariants> {
  poll: {
    id: string
    question: string
    options: Array<{
      id: string
      text: string
      voteCount: number
    }>
    totalVotes: number
    reliabilityScore: number
    endsAt: Date
    status: "active" | "closed"
    creator: {
      username: string
      avatar: string | null
    }
  }
  userVotedOptionId?: string | null
  onVote?: (optionId: string) => void
  onViewPulse?: () => void
  className?: string
}

export function PollCard({
  poll,
  userVotedOptionId,
  onVote,
  onViewPulse,
  size,
  state,
  className
}: PollCardProps) {
  const hasVoted = userVotedOptionId !== null && userVotedOptionId !== undefined
  const isClosed = poll.status === "closed"
  const showResults = hasVoted || isClosed

  return (
    <Card className={cn(pollCardVariants({ size, state }), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <UserAvatar
            username={poll.creator.username}
            src={poll.creator.avatar}
            size="sm"
          />
          <span className="text-sm font-medium">@{poll.creator.username}</span>
        </div>
        <ReliabilityBadge score={poll.reliabilityScore} />
      </CardHeader>

      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold leading-tight">
          {poll.question}
        </h3>

        <div className="space-y-2">
          {poll.options.map((option) => (
            showResults ? (
              <PollOptionResult
                key={option.id}
                option={option}
                totalVotes={poll.totalVotes}
                isUserChoice={userVotedOptionId === option.id}
              />
            ) : (
              <PollOption
                key={option.id}
                option={option}
                onSelect={() => onVote?.(option.id)}
              />
            )
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-2">
        <PollStats
          totalVotes={poll.totalVotes}
          endsAt={poll.endsAt}
          status={poll.status}
        />

        {showResults && (
          <Button variant="ghost" size="sm" onClick={onViewPulse}>
            View PULSE ->
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
```


## PULSE Animation Component

```typescript
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../utils/cn"

interface PulseAnimationProps {
  poll: {
    question: string
    options: Array<{
      id: string
      text: string
      voteCount: number
      percentage: number
    }>
    totalVotes: number
  }
  userVotedOptionId: string
  onComplete?: () => void
  className?: string
}

type Stage = "intro" | "yourChoice" | "comparison" | "results"

export function PulseAnimation({
  poll,
  userVotedOptionId,
  onComplete,
  className
}: PulseAnimationProps) {
  const [stage, setStage] = useState<Stage>("intro")
  const userOption = poll.options.find(o => o.id === userVotedOptionId)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage("yourChoice"), 2000),
      setTimeout(() => setStage("comparison"), 4000),
      setTimeout(() => setStage("results"), 6000),
      setTimeout(() => onComplete?.(), 8000)
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-gradient-to-br from-vox-primary-600 via-vox-accent-violet to-vox-accent-pink",
      className
    )}>
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center text-white"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl mb-4"
            >
              Ballot Icon
            </motion.div>
            <h1 className="text-4xl font-bold">Your PULSE is ready</h1>
          </motion.div>
        )}

        {stage === "yourChoice" && userOption && (
          <motion.div
            key="yourChoice"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="text-center text-white"
          >
            <p className="text-xl mb-4 opacity-80">You voted for...</p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 100 }}
              className="bg-white/20 backdrop-blur-lg rounded-2xl px-8 py-6"
            >
              <h2 className="text-3xl font-bold">{userOption.text}</h2>
            </motion.div>
          </motion.div>
        )}

        {stage === "comparison" && userOption && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-white"
          >
            <p className="text-xl mb-4 opacity-80">You agree with</p>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-8xl font-bold"
            >
              <CountUp end={userOption.percentage} duration={1.5} />%
            </motion.div>
            <p className="text-xl mt-4 opacity-80">
              of {poll.totalVotes.toLocaleString()} voters
            </p>
          </motion.div>
        )}

        {stage === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-lg px-6 text-white"
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              {poll.question}
            </h2>
            <div className="space-y-4">
              {poll.options.map((option, index) => (
                <ResultBar
                  key={option.id}
                  option={option}
                  isUserChoice={option.id === userVotedOptionId}
                  delay={index * 0.2}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN DASHBOARD SPECIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

## Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN DASHBOARD                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐ ┌─────────────────────────────────────────────────────────┐│
│  │             │ │                                                          ││
│  │  SIDEBAR    │ │  Dashboard                       [Search]  [Bell] Admin ││
│  │             │ │                                                          ││
│  │  ─────────  │ │  ───────────────────────────────────────────────────────││
│  │             │ │                                                          ││
│  │  Dash       │ │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐││
│  │  Users      │ │  │            │ │            │ │            │ │        │││
│  │  Content    │ │  │  USERS     │ │  POLLS     │ │  VOTES     │ │  MRR   │││
│  │  Reports    │ │  │  142.8K    │ │  23.4K     │ │  1.2M      │ │  $48K  │││
│  │  Orgs       │ │  │  +12%      │ │  +8%       │ │  +24%      │ │  +15%  │││
│  │  Analytics  │ │  │            │ │            │ │            │ │        │││
│  │  Settings   │ │  └────────────┘ └────────────┘ └────────────┘ └────────┘││
│  │             │ │                                                          ││
│  │  ─────────  │ │  ┌─────────────────────────────────────────────────────┐││
│  │             │ │  │                                                      │││
│  │  THEME:     │ │  │  ACTIVITY CHART (Last 30 days)                       │││
│  │  ○ Light    │ │  │                                                      │││
│  │  ● Dark     │ │  │  [Recharts AreaChart - Votes over time]             │││
│  │  ○ System   │ │  │                                                      │││
│  │             │ │  │                                                      │││
│  │             │ │  │                                                      │││
│  │             │ │  │                                                      │││
│  │             │ │  │                                                      │││
│  │             │ │  └─────────────────────────────────────────────────────┘││
│  │             │ │                                                          ││
│  │             │ │  ┌───────────────────────┐ ┌───────────────────────────┐││
│  │             │ │  │                        │ │                           │││
│  │             │ │  │  CONTENT BY TYPE       │ │  MODERATION QUEUE         │││
│  │             │ │  │                        │ │                           │││
│  │             │ │  │  [Pie Chart]           │ │  12 pending reviews       │││
│  │             │ │  │                        │ │  3 urgent reports         │││
│  │             │ │  │   Polls  68%           │ │  847 approved today       │││
│  │             │ │  │   Tests  24%           │ │                           │││
│  │             │ │  │   Survey 8%            │ │  [View Queue ->]          │││
│  │             │ │  │                        │ │                           │││
│  │             │ │  └───────────────────────┘ └───────────────────────────┘││
│  │             │ │                                                          ││
│  └─────────────┘ └─────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## Content Moderation Queue

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTENT MODERATION QUEUE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  Moderation Queue                      [Filters ▼]  [Refresh]       │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  [All]  [Reported]  [Auto-flagged]  [Urgent]                   │  │   │
│  │  │   (47)    (12)         (32)            (3)                     │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │  URGENT                                                        │  │   │
│  │  │  ─────────────────────────────────────────────────────────────│  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  Poll: "Which group should be..." [HATE_SPEECH]         │  │  │   │
│  │  │  │  by @user123 · Reported 3x · 15 min ago                 │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │  [View Content]   [Approve]   [Remove]   [Ban User]     │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  AUTO-FLAGGED                                                  │  │   │
│  │  │  ─────────────────────────────────────────────────────────────│  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  Comment: "This is f***ing..." [PROFANITY]              │  │  │   │
│  │  │  │  by @user456 · AI flagged · Confidence: 94%             │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │  [View Context]   [Approve]   [Remove]   [Warn User]    │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
