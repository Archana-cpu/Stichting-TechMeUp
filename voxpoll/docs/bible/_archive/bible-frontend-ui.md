# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                         VOXPOLL FRONTEND UI BIBLE                          █
# █               Comprehensive UI/UX Plan for All 3 Applications              █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████
# Version: 1.0.0
# Last Updated: January 2026
# Status: MASTER PLAN ✅
# ══════════════════════════════════════════════════════════════════════════════



# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                            TABLE OF CONTENTS                                │
# ├─────────────────────────────────────────────────────────────────────────────┤
# │                                                                             │
# │  PART 1: DESIGN SYSTEM FOUNDATION                                          │
# │    1.1 Design Philosophy & Principles                                      │
# │    1.2 Design Tokens (Colors, Typography, Spacing)                         │
# │    1.3 Component Architecture (shadcn/ui + CVA)                            │
# │    1.4 Dark/Light Mode Strategy                                            │
# │    1.5 Animation & Motion Guidelines                                       │
# │    1.6 Accessibility Standards (WCAG 2.1 AA)                               │
# │                                                                             │
# │  PART 2: WEB APP (@voxpoll/web) - Next.js 16+                              │
# │    2.1 Architecture & Routing Strategy                                     │
# │    2.2 Page-by-Page UI Specifications                                      │
# │    2.3 Component Breakdown                                                 │
# │    2.4 Responsive Breakpoints                                              │
# │    2.5 Server/Client Component Strategy                                    │
# │                                                                             │
# │  PART 3: MOBILE APP (@voxpoll/mobile) - React Native + Expo                │
# │    3.1 Mobile-First Design Principles                                      │
# │    3.2 Navigation & Gesture Patterns                                       │
# │    3.3 Screen-by-Screen Specifications                                     │
# │    3.4 Platform-Specific Adaptations (iOS/Android)                         │
# │    3.5 Performance Optimization                                            │
# │                                                                             │
# │  PART 4: PLATFORM APP (@voxpoll/platform) - Admin Dashboard                │
# │    4.1 Dashboard Architecture                                              │
# │    4.2 Analytics & Data Visualization                                      │
# │    4.3 Moderation & Management Interfaces                                  │
# │    4.4 Organization Portal                                                 │
# │                                                                             │
# │  PART 5: SHARED UI COMPONENTS (@voxpoll/ui)                                │
# │    5.1 Atomic Design Structure                                             │
# │    5.2 Component Catalog                                                   │
# │    5.3 Hooks & Utilities                                                   │
# │                                                                             │
# │  PART 6: 2026 TREND IMPLEMENTATIONS                                        │
# │    6.1 Liquid Glass / Glassmorphism                                        │
# │    6.2 Bento Grid Layouts                                                  │
# │    6.3 Kinetic Typography                                                  │
# │    6.4 AI-Powered Personalization                                          │
# │                                                                             │
# │  PART 7: PERFORMANCE-OPTIMIZED VISUAL EFFECTS                              │
# │    7.1 GPU-Accelerated Background Patterns                                 │
# │    7.2 Performant Blur & Glassmorphism                                     │
# │    7.3 Light & Glow Effects (CSS Only)                                     │
# │    7.4 Texture Overlays (Zero JS)                                          │
# │    7.5 Animation Performance Rules                                         │
# │                                                                             │
# │  PART 8: ADMIN THEMING SYSTEM (Full Customization)                         │
# │    8.1 Database-Driven Theme Configuration                                 │
# │    8.2 Runtime CSS Variable Injection                                      │
# │    8.3 Logo & Branding Management                                          │
# │    8.4 Background Pattern Selector                                         │
# │    8.5 Effect Toggles (Blur, Glow, Grain)                                  │
# │    8.6 Theme Preview & Publishing                                          │
# │                                                                             │
# │  PART 9: SHARED PACKAGES ARCHITECTURE                                      │
# │    9.1 Monorepo Package Structure                                          │
# │    9.2 Cross-Platform Component Sharing                                    │
# │    9.3 Theme Token Sharing Strategy                                        │
# │                                                                             │
# └─────────────────────────────────────────────────────────────────────────────┘



# ══════════════════════════════════════════════════════════════════════════════
# PART 1: DESIGN SYSTEM FOUNDATION
# ══════════════════════════════════════════════════════════════════════════════


## 1.1 DESIGN PHILOSOPHY & PRINCIPLES

### Core Philosophy: "Trust Through Clarity"

VoxPoll's UI must communicate three key values:
1. **TRUST** - Users must feel their data is secure and anonymous
2. **CLARITY** - Complex data should be presented simply
3. **ENGAGEMENT** - Interactions should feel rewarding and fun

### Design Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VOXPOLL DESIGN PRINCIPLES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. MINIMAL COGNITIVE LOAD                                                  │
│     • One primary action per screen                                         │
│     • Progressive disclosure of complex features                            │
│     • Consistent patterns reduce learning curve                             │
│                                                                             │
│  2. DATA VISUALIZATION FIRST                                                │
│     • Results should be instantly understandable                            │
│     • Charts optimized for the data type                                    │
│     • PULSE: Spotify-Wrapped style animated reveals                         │
│                                                                             │
│  3. MICRO-INTERACTIONS MATTER                                               │
│     • Every tap/click should have feedback                                  │
│     • Loading states that feel alive                                        │
│     • Celebration moments (badges, completions)                             │
│                                                                             │
│  4. MOBILE-FIRST, DESKTOP-ENHANCED                                          │
│     • Design for thumb reach zones                                          │
│     • Desktop adds power features, not complexity                           │
│     • Touch targets: minimum 44x44px                                        │
│                                                                             │
│  5. ACCESSIBILITY IS NON-NEGOTIABLE                                         │
│     • WCAG 2.1 AA compliance minimum                                        │
│     • Color contrast 4.5:1 for text                                         │
│     • Screen reader optimized                                               │
│     • Keyboard navigation support                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 1.2 DESIGN TOKENS

### Color System

```css
/* ══════════════════════════════════════════════════════════════════════════
   VOXPOLL COLOR TOKENS - CSS Variables
   ══════════════════════════════════════════════════════════════════════════ */

:root {
  /* ─────────────────────────────────────────────────────────────────────────
     PRIMARY BRAND COLORS
     ───────────────────────────────────────────────────────────────────────── */
  --vox-primary-50: #f0f7ff;
  --vox-primary-100: #e0efff;
  --vox-primary-200: #b9dfff;
  --vox-primary-300: #7cc4ff;
  --vox-primary-400: #36a5ff;
  --vox-primary-500: #0c8ce9;   /* Main Brand Color */
  --vox-primary-600: #006fc7;
  --vox-primary-700: #0058a1;
  --vox-primary-800: #054b85;
  --vox-primary-900: #0a3f6e;
  --vox-primary-950: #072849;

  /* ─────────────────────────────────────────────────────────────────────────
     ACCENT COLORS (For PULSE & Celebrations)
     ───────────────────────────────────────────────────────────────────────── */
  --vox-accent-violet: #8b5cf6;
  --vox-accent-pink: #ec4899;
  --vox-accent-orange: #f97316;
  --vox-accent-emerald: #10b981;
  --vox-accent-cyan: #06b6d4;

  /* ─────────────────────────────────────────────────────────────────────────
     SEMANTIC COLORS
     ───────────────────────────────────────────────────────────────────────── */
  --vox-success: #22c55e;
  --vox-warning: #eab308;
  --vox-error: #ef4444;
  --vox-info: #3b82f6;

  /* ─────────────────────────────────────────────────────────────────────────
     NEUTRAL COLORS (Light Mode)
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

  /* ─────────────────────────────────────────────────────────────────────────
     POLL OPTION COLORS (Distinct & Accessible)
     ───────────────────────────────────────────────────────────────────────── */
  --vox-option-1: #3b82f6;  /* Blue */
  --vox-option-2: #8b5cf6;  /* Violet */
  --vox-option-3: #ec4899;  /* Pink */
  --vox-option-4: #f97316;  /* Orange */
  --vox-option-5: #22c55e;  /* Green */
  --vox-option-6: #06b6d4;  /* Cyan */
  --vox-option-7: #eab308;  /* Yellow */
  --vox-option-8: #ef4444;  /* Red */
  --vox-option-9: #14b8a6;  /* Teal */
  --vox-option-10: #a855f7; /* Purple */

  /* ─────────────────────────────────────────────────────────────────────────
     RELIABILITY SCORE GRADIENT
     ───────────────────────────────────────────────────────────────────────── */
  --vox-reliability-low: #ef4444;     /* 0-39 */
  --vox-reliability-medium: #eab308;  /* 40-69 */
  --vox-reliability-high: #22c55e;    /* 70-100 */
}

/* ─────────────────────────────────────────────────────────────────────────
   DARK MODE OVERRIDES
   ───────────────────────────────────────────────────────────────────────── */
.dark {
  --vox-background: #0a0a0b;
  --vox-foreground: #fafafa;
  --vox-card: #18181b;
  --vox-card-foreground: #fafafa;
  --vox-border: #27272a;
  --vox-muted: #27272a;
  --vox-muted-foreground: #a1a1aa;
}
```

### Typography System

```css
/* ══════════════════════════════════════════════════════════════════════════
   TYPOGRAPHY TOKENS
   ══════════════════════════════════════════════════════════════════════════ */

:root {
  /* ─────────────────────────────────────────────────────────────────────────
     FONT FAMILIES
     ───────────────────────────────────────────────────────────────────────── */
  --font-sans: "Inter Variable", "Inter", -apple-system, BlinkMacSystemFont,
               "Segoe UI", Roboto, sans-serif;
  --font-display: "Cal Sans", "Inter Variable", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* ─────────────────────────────────────────────────────────────────────────
     FONT SIZES (Fluid Typography)
     ───────────────────────────────────────────────────────────────────────── */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);     /* 12-13px */
  --text-sm: clamp(0.8125rem, 0.775rem + 0.25vw, 0.875rem);  /* 13-14px */
  --text-base: clamp(0.875rem, 0.85rem + 0.25vw, 1rem);      /* 14-16px */
  --text-lg: clamp(1rem, 0.95rem + 0.35vw, 1.125rem);        /* 16-18px */
  --text-xl: clamp(1.125rem, 1.05rem + 0.5vw, 1.25rem);      /* 18-20px */
  --text-2xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);       /* 20-24px */
  --text-3xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem);         /* 24-30px */
  --text-4xl: clamp(1.875rem, 1.5rem + 1.5vw, 2.25rem);      /* 30-36px */
  --text-5xl: clamp(2.25rem, 1.8rem + 2vw, 3rem);            /* 36-48px */
  --text-6xl: clamp(3rem, 2.4rem + 3vw, 4rem);               /* 48-64px */

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

### Spacing System

```css
/* ══════════════════════════════════════════════════════════════════════════
   SPACING TOKENS (8px Base Grid)
   ══════════════════════════════════════════════════════════════════════════ */

:root {
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1-5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px - Base unit */
  --space-2-5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3-5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-9: 2.25rem;     /* 36px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-14: 3.5rem;     /* 56px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-32: 8rem;       /* 128px */

  /* ─────────────────────────────────────────────────────────────────────────
     BORDER RADIUS
     ───────────────────────────────────────────────────────────────────────── */
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-2xl: 1.5rem;    /* 24px */
  --radius-3xl: 2rem;      /* 32px */
  --radius-full: 9999px;

  /* ─────────────────────────────────────────────────────────────────────────
     SHADOWS (Elevation System)
     ───────────────────────────────────────────────────────────────────────── */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```


## 1.3 COMPONENT ARCHITECTURE (shadcn/ui + CVA)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      @voxpoll/ui (Shared Library)                    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ATOMS (Primitives)                                                  │   │
│  │  ├─ Button, Input, Label, Badge, Avatar, Spinner                    │   │
│  │  ├─ Checkbox, Radio, Switch, Slider                                 │   │
│  │  └─ Icon, Skeleton, Separator                                       │   │
│  │                                                                      │   │
│  │  MOLECULES (Combinations)                                            │   │
│  │  ├─ Card, Alert, Toast, Tooltip                                     │   │
│  │  ├─ Dialog, Sheet, Popover, DropdownMenu                            │   │
│  │  ├─ Tabs, Accordion, NavigationMenu                                 │   │
│  │  └─ Form, FormField, FormMessage                                    │   │
│  │                                                                      │   │
│  │  ORGANISMS (Complex Components)                                      │   │
│  │  ├─ DataTable, Calendar, Command                                    │   │
│  │  ├─ PollCard, TestCard, SurveyCard                                  │   │
│  │  ├─ PollOption, RatingScale, LikertScale                            │   │
│  │  ├─ CommentThread, CommentItem                                      │   │
│  │  └─ ResultChart, PulseAnimation, BadgeDisplay                       │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Web App Components                           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  TEMPLATES                                                           │   │
│  │  ├─ AuthLayout, MainLayout, DashboardLayout                         │   │
│  │  ├─ OrgLayout, AdminLayout                                          │   │
│  │  └─ FullscreenLayout (PULSE/Live Poll)                              │   │
│  │                                                                      │   │
│  │  PAGES (Next.js Server Components)                                   │   │
│  │  ├─ FeedPage, ExplorePage, CreatePage                               │   │
│  │  ├─ PollPage, TestPage, PulsePage                                   │   │
│  │  └─ ProfilePage, SettingsPage                                       │   │
│  │                                                                      │   │
│  │  FEATURES (Client Islands)                                           │   │
│  │  ├─ PollCreator, TestCreator, LivePollHost                          │   │
│  │  ├─ VotingInterface, ResultsViewer                                  │   │
│  │  └─ CommentSection, NotificationBell                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### CVA (Class Variance Authority) Pattern

```typescript
// ══════════════════════════════════════════════════════════════════════════
// BUTTON COMPONENT WITH CVA
// ══════════════════════════════════════════════════════════════════════════

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@voxpoll/ui/utils"

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-lg font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]"
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-vox-primary-500 text-white",
          "hover:bg-vox-primary-600",
          "focus-visible:ring-vox-primary-500"
        ],
        secondary: [
          "bg-vox-gray-100 text-vox-gray-900",
          "hover:bg-vox-gray-200",
          "dark:bg-vox-gray-800 dark:text-vox-gray-100",
          "dark:hover:bg-vox-gray-700"
        ],
        outline: [
          "border-2 border-vox-gray-200 bg-transparent",
          "hover:bg-vox-gray-100",
          "dark:border-vox-gray-700 dark:hover:bg-vox-gray-800"
        ],
        ghost: [
          "bg-transparent hover:bg-vox-gray-100",
          "dark:hover:bg-vox-gray-800"
        ],
        danger: [
          "bg-vox-error text-white",
          "hover:bg-red-600",
          "focus-visible:ring-red-500"
        ],
        success: [
          "bg-vox-success text-white",
          "hover:bg-green-600",
          "focus-visible:ring-green-500"
        ],
        // Special variant for poll options
        pollOption: [
          "border-2 border-vox-gray-200 bg-white",
          "hover:border-vox-primary-500 hover:bg-vox-primary-50",
          "data-[selected=true]:border-vox-primary-500 data-[selected=true]:bg-vox-primary-50",
          "dark:bg-vox-gray-900 dark:border-vox-gray-700"
        ]
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export function Button({
  className,
  variant,
  size,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  )
}
```


## 1.4 DARK/LIGHT MODE STRATEGY

### Implementation Approach

```typescript
// ══════════════════════════════════════════════════════════════════════════
// THEME PROVIDER
// ══════════════════════════════════════════════════════════════════════════

// Use next-themes for Next.js, custom implementation for React Native

// Web: next-themes configuration
// tailwind.config.ts
export default {
  darkMode: "class", // Use class-based dark mode
  // ...
}

// Theme context for granular control
type Theme = "light" | "dark" | "system"
type AccentColor = "blue" | "violet" | "pink" | "emerald" | "orange"

interface ThemeConfig {
  theme: Theme
  accentColor: AccentColor
  reduceMotion: boolean
  highContrast: boolean
}
```

### Dark Mode Color Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LIGHT ↔ DARK MODE MAPPING                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ELEMENT              │ LIGHT MODE         │ DARK MODE                      │
│  ─────────────────────┼────────────────────┼────────────────────────────────│
│  Background           │ #ffffff            │ #0a0a0b (Near black)           │
│  Card Background      │ #ffffff            │ #18181b (Zinc-900)             │
│  Elevated Surface     │ #fafafa            │ #27272a (Zinc-800)             │
│  Border               │ #e4e4e7            │ #3f3f46 (Zinc-700)             │
│  Text Primary         │ #18181b            │ #fafafa                        │
│  Text Secondary       │ #71717a            │ #a1a1aa                        │
│  Text Muted           │ #a1a1aa            │ #71717a                        │
│                                                                             │
│  [2026 TREND] Avoid pure black (#000000)                                    │
│  Use near-black (#0a0a0b) for reduced eye strain                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 1.5 ANIMATION & MOTION GUIDELINES

### Animation Principles

```typescript
// ══════════════════════════════════════════════════════════════════════════
// ANIMATION TOKENS
// ══════════════════════════════════════════════════════════════════════════

const motion = {
  // Durations
  duration: {
    instant: 0,
    fast: 150,      // Micro-interactions (hover, focus)
    normal: 250,    // Standard transitions
    slow: 400,      // Complex animations
    slower: 600,    // Page transitions
    slowest: 1000   // PULSE reveals
  },

  // Easings (Using Framer Motion)
  easing: {
    // Standard easings
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],

    // Spring-like (for bouncy interactions)
    spring: { type: "spring", stiffness: 400, damping: 30 },
    springBouncy: { type: "spring", stiffness: 500, damping: 25 },

    // Custom for PULSE animations
    pulseReveal: [0.16, 1, 0.3, 1],
    celebration: [0.34, 1.56, 0.64, 1]
  }
}
```

### Key Animation Patterns

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ANIMATION PATTERNS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. POLL OPTION SELECTION                                                   │
│     ├─ Tap: Scale down to 0.98, then back                                  │
│     ├─ Selection: Border color animates, checkmark appears                 │
│     └─ Submit: Options slide away, results animate in                      │
│                                                                             │
│  2. PULSE RESULT REVEAL (Spotify-Wrapped Style)                            │
│     ├─ Stage 1: Content fades in from center                               │
│     ├─ Stage 2: Percentage numbers count up                                │
│     ├─ Stage 3: Bar/pie chart animates to final values                     │
│     └─ Stage 4: "Your choice" highlight appears                            │
│                                                                             │
│  3. BADGE EARNED CELEBRATION                                                │
│     ├─ Badge scales up with spring physics                                 │
│     ├─ Confetti particles burst outward                                    │
│     ├─ Glow effect pulses                                                  │
│     └─ Share prompt slides in from bottom                                  │
│                                                                             │
│  4. LIVE POLL REAL-TIME UPDATES                                            │
│     ├─ Vote count: Smooth number interpolation                             │
│     ├─ Bar width: Animate width with spring                                │
│     └─ New votes: Brief highlight flash                                    │
│                                                                             │
│  5. PAGE TRANSITIONS                                                        │
│     ├─ Shared layout animations for cards → detail                         │
│     ├─ Fade + slight slide for route changes                               │
│     └─ Maintain scroll position when returning                             │
│                                                                             │
│  [CRITICAL] Always respect prefers-reduced-motion                          │
│  @media (prefers-reduced-motion: reduce) { disable animations }            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 1.6 ACCESSIBILITY STANDARDS

### WCAG 2.1 AA Compliance Checklist

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ACCESSIBILITY REQUIREMENTS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PERCEIVABLE                                                                │
│  ├─ [✓] Text contrast ratio ≥ 4.5:1 (normal) / 3:1 (large)                │
│  ├─ [✓] UI component contrast ≥ 3:1                                        │
│  ├─ [✓] All images have alt text                                           │
│  ├─ [✓] Color is not the only means of conveying info                      │
│  ├─ [✓] Text resizable to 200% without loss of functionality               │
│  └─ [✓] Captions for audio/video content                                   │
│                                                                             │
│  OPERABLE                                                                   │
│  ├─ [✓] All functionality available via keyboard                           │
│  ├─ [✓] Visible focus indicators                                           │
│  ├─ [✓] Skip navigation links                                              │
│  ├─ [✓] No keyboard traps                                                  │
│  ├─ [✓] Adequate time limits (or ability to extend)                        │
│  └─ [✓] Touch targets ≥ 44x44px                                            │
│                                                                             │
│  UNDERSTANDABLE                                                             │
│  ├─ [✓] Language declared (lang attribute)                                 │
│  ├─ [✓] Form labels associated with inputs                                 │
│  ├─ [✓] Error messages are clear and helpful                               │
│  ├─ [✓] Consistent navigation                                              │
│  └─ [✓] Input assistance for forms                                         │
│                                                                             │
│  ROBUST                                                                     │
│  ├─ [✓] Valid HTML/semantic structure                                      │
│  ├─ [✓] ARIA roles where semantic HTML insufficient                        │
│  ├─ [✓] Status messages announced to screen readers                        │
│  └─ [✓] Compatible with assistive technologies                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Screen Reader Considerations

```typescript
// ══════════════════════════════════════════════════════════════════════════
// ACCESSIBLE COMPONENT PATTERNS
// ══════════════════════════════════════════════════════════════════════════

// Poll Option with ARIA
function PollOption({ option, isSelected, onSelect, totalVotes, voteCount }) {
  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0

  return (
    <button
      role="radio"
      aria-checked={isSelected}
      aria-label={`${option.text}. ${percentage.toFixed(1)} percent of votes`}
      onClick={() => onSelect(option.id)}
      className={cn(
        "poll-option",
        isSelected && "poll-option--selected"
      )}
    >
      <span className="poll-option__text">{option.text}</span>
      <span aria-hidden="true" className="poll-option__percentage">
        {percentage.toFixed(1)}%
      </span>
    </button>
  )
}

// Live region for real-time updates
function LivePollResults({ results }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      {results.map(result => (
        <p key={result.id} aria-label={`${result.option}: ${result.count} votes`}>
          {result.option}: {result.count}
        </p>
      ))}
    </div>
  )
}
```


## 1.7 ZERO-HARDCODE THEMING SYSTEM (Admin-Configurable)

### Theme Configuration Architecture

```typescript
// ══════════════════════════════════════════════════════════════════════════
// DYNAMIC THEME SYSTEM - Admin Panel Configurable
// ══════════════════════════════════════════════════════════════════════════

// Theme configuration stored in database, fetched at runtime
interface VoxPollThemeConfig {
  // Core Brand
  brand: {
    name: string
    logo: {
      light: string  // URL
      dark: string   // URL
      favicon: string
    }
    colors: {
      primary: ColorScale    // 50-950 scale
      accent: string         // Single accent color
    }
  }

  // UI Customization
  ui: {
    borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "full"
    fontFamily: {
      sans: string
      display: string
    }
    shadows: "none" | "subtle" | "normal" | "elevated"
    animations: "none" | "reduced" | "normal" | "playful"
  }

  // Dark Mode
  darkMode: {
    enabled: boolean
    default: "light" | "dark" | "system"
    background: string       // Custom dark background
    cardBackground: string   // Custom dark card color
  }

  // Feature Toggles
  features: {
    glassmorphism: boolean
    gradients: boolean
    kinetic_typography: boolean
    confetti_celebrations: boolean
  }

  // White Label (Enterprise)
  whiteLabel: {
    enabled: boolean
    hideVoxPollBranding: boolean
    customDomain: string | null
    customFooter: string | null
  }
}

// Color scale type
interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string  // Primary shade
  600: string
  700: string
  800: string
  900: string
  950: string
}
```

### CSS Variable Injection System

```typescript
// ══════════════════════════════════════════════════════════════════════════
// RUNTIME CSS VARIABLE INJECTION
// ══════════════════════════════════════════════════════════════════════════

// packages/ui/src/theme/inject-theme.ts
export function injectThemeVariables(config: VoxPollThemeConfig): void {
  const root = document.documentElement

  // Inject primary color scale
  Object.entries(config.brand.colors.primary).forEach(([shade, color]) => {
    root.style.setProperty(`--vox-primary-${shade}`, color)
  })

  // Inject accent color
  root.style.setProperty("--vox-accent", config.brand.colors.accent)

  // Inject border radius
  const radiusMap = {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px"
  }
  root.style.setProperty("--radius", radiusMap[config.ui.borderRadius])

  // Inject dark mode variables
  if (config.darkMode.enabled) {
    root.style.setProperty("--vox-dark-bg", config.darkMode.background)
    root.style.setProperty("--vox-dark-card", config.darkMode.cardBackground)
  }
}

// Server-side theme loading (Next.js)
// app/layout.tsx
export default async function RootLayout({ children }) {
  const themeConfig = await fetchThemeConfig()

  return (
    <html
      lang="tr"
      suppressHydrationWarning
      style={generateCSSVariables(themeConfig)}
    >
      <body>
        <ThemeProvider config={themeConfig}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Admin Panel Theme Editor

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN THEME EDITOR UI                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  THEME SETTINGS                                         [Preview]   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  Brand Colors                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Primary Color     [████████████] #0c8ce9   [Pick Color]    │   │   │
│  │  │  Accent Color      [████████████] #8b5cf6   [Pick Color]    │   │   │
│  │  │                                                              │   │   │
│  │  │  [Auto-generate scale from primary]                          │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  Typography                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Heading Font      [Inter Variable        ▼]                 │   │   │
│  │  │  Body Font         [Inter Variable        ▼]                 │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  Border Radius                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ○ None  ○ Small  ● Medium  ○ Large  ○ XL  ○ Full           │   │   │
│  │  │                                                              │   │   │
│  │  │  Preview: [████] [████] [████]                               │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  Dark Mode                                                           │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ☑ Enable Dark Mode                                          │   │   │
│  │  │                                                              │   │   │
│  │  │  Default Theme:   ○ Light  ○ Dark  ● System                  │   │   │
│  │  │                                                              │   │   │
│  │  │  Dark Background  [████████████] #0a0a0b   [Pick Color]     │   │   │
│  │  │  Dark Card        [████████████] #18181b   [Pick Color]     │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  Animations                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ○ None  ○ Reduced  ● Normal  ○ Playful                      │   │   │
│  │  │                                                              │   │   │
│  │  │  ☑ Glassmorphism effects                                     │   │   │
│  │  │  ☑ Gradient backgrounds                                      │   │   │
│  │  │  ☑ Confetti celebrations                                     │   │   │
│  │  │  ☐ Kinetic typography                                        │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  [Reset to Default]              [Save Changes]  [Publish]          │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```



# ══════════════════════════════════════════════════════════════════════════════
# PART 2: WEB APP (@voxpoll/web) - Next.js 16+
# ══════════════════════════════════════════════════════════════════════════════


## 2.1 ARCHITECTURE & ROUTING STRATEGY

### Next.js App Router Structure

```
apps/web/
├── app/
│   ├── (auth)/                          # Auth group - shared layout
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/[token]/page.tsx
│   │   ├── verify-email/[token]/page.tsx
│   │   └── layout.tsx                   # Auth layout (centered, minimal)
│   │
│   ├── (main)/                          # Main app group
│   │   ├── feed/
│   │   │   ├── page.tsx                 # /feed - Personalized feed
│   │   │   ├── following/page.tsx       # /feed/following
│   │   │   └── discover/page.tsx        # /feed/discover
│   │   ├── explore/
│   │   │   ├── page.tsx                 # /explore - Browse content
│   │   │   ├── polls/page.tsx
│   │   │   ├── tests/page.tsx
│   │   │   └── trending/page.tsx
│   │   ├── create/
│   │   │   ├── page.tsx                 # /create - Creation hub
│   │   │   ├── poll/page.tsx            # Quick poll
│   │   │   ├── poll/extended/page.tsx   # Extended poll
│   │   │   ├── poll/live/page.tsx       # Live poll (Premium)
│   │   │   └── test/page.tsx            # Test creator
│   │   ├── my/
│   │   │   ├── page.tsx                 # /my - Dashboard
│   │   │   ├── content/page.tsx
│   │   │   ├── content/[id]/page.tsx
│   │   │   ├── content/[id]/analytics/page.tsx
│   │   │   ├── participated/page.tsx
│   │   │   ├── badges/page.tsx
│   │   │   └── saved/page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx                 # Settings hub
│   │   │   ├── profile/page.tsx
│   │   │   ├── account/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── subscription/page.tsx
│   │   │   └── data/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── layout.tsx                   # Main layout with nav
│   │
│   ├── (content)/                       # Content viewing group
│   │   ├── p/[contentId]/page.tsx       # Poll/Test view
│   │   ├── pulse/[contentId]/page.tsx   # PULSE view
│   │   ├── share/[code]/page.tsx        # Private link
│   │   ├── live/[joinCode]/page.tsx     # Live poll join
│   │   └── layout.tsx                   # Minimal layout for content
│   │
│   ├── (profile)/                       # Public profiles
│   │   ├── u/[username]/page.tsx
│   │   ├── u/[username]/badges/page.tsx
│   │   ├── u/[username]/created/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (org)/                           # Organization portal
│   │   ├── org/
│   │   │   ├── page.tsx                 # Org dashboard
│   │   │   ├── surveys/page.tsx
│   │   │   ├── surveys/new/page.tsx
│   │   │   ├── surveys/[id]/page.tsx
│   │   │   ├── members/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── layout.tsx                   # Org sidebar layout
│   │
│   ├── (admin)/                         # Admin panel
│   │   ├── admin/
│   │   │   ├── page.tsx                 # Admin dashboard
│   │   │   ├── users/page.tsx
│   │   │   ├── content/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── organizations/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── theme/page.tsx           # Theme editor
│   │   └── layout.tsx                   # Admin sidebar layout
│   │
│   ├── (static)/                        # Static pages
│   │   ├── pricing/page.tsx
│   │   ├── business/page.tsx
│   │   ├── about/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── help/page.tsx
│   │
│   ├── api/                             # API routes (if needed)
│   │   └── [...path]/route.ts           # Proxy to Hono API
│   │
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Landing page
│   ├── loading.tsx                      # Global loading
│   ├── error.tsx                        # Global error
│   ├── not-found.tsx                    # 404 page
│   └── globals.css                      # Global styles
│
├── components/
│   ├── layouts/                         # Layout components
│   ├── features/                        # Feature-specific components
│   └── ui/                              # Re-exports from @voxpoll/ui
│
├── lib/
│   ├── api/                             # API client
│   ├── hooks/                           # Custom hooks
│   ├── utils/                           # Utilities
│   └── store/                           # Zustand stores
│
└── public/
    ├── fonts/
    └── images/
```

### Server vs Client Component Strategy

```typescript
// ══════════════════════════════════════════════════════════════════════════
// SERVER/CLIENT COMPONENT DECISION MATRIX
// ══════════════════════════════════════════════════════════════════════════

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT TYPE DECISION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SERVER COMPONENTS (Default)                                                │
│  ════════════════════════════                                               │
│  ✓ Data fetching (polls, users, results)                                   │
│  ✓ Static content (headers, footers, text)                                 │
│  ✓ Layout components                                                       │
│  ✓ SEO-critical content                                                    │
│  ✓ Large dependencies (charts initial render)                              │
│                                                                             │
│  CLIENT COMPONENTS ("use client")                                          │
│  ═════════════════════════════════                                          │
│  ✓ Interactive forms (poll creator, voting)                                │
│  ✓ Real-time updates (live poll, notifications)                            │
│  ✓ User input handling                                                     │
│  ✓ Browser APIs (localStorage, clipboard)                                  │
│  ✓ Animation-heavy components (PULSE reveals)                              │
│  ✓ Third-party client libraries                                            │
│                                                                             │
│  HYBRID PATTERN (Server + Client Islands)                                   │
│  ═════════════════════════════════════════                                  │
│  • Server component fetches data                                            │
│  • Pass data to client component via props                                  │
│  • Client handles interactivity                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
*/

// Example: Poll Page with Hybrid Pattern
// app/(content)/p/[contentId]/page.tsx (Server Component)
export default async function PollPage({ params }) {
  const poll = await fetchPoll(params.contentId)  // Server-side fetch
  const hasParticipated = await checkParticipation(params.contentId)

  return (
    <div className="poll-page">
      {/* Server-rendered static content */}
      <PollHeader poll={poll} />

      {/* Client island for interactivity */}
      {hasParticipated ? (
        <PollResults poll={poll} />  // Can be server component
      ) : (
        <VotingInterface poll={poll} />  // Must be client component
      )}

      {/* Server-rendered but with client island inside */}
      <CommentsSection contentId={poll.id} />
    </div>
  )
}

// components/features/poll/VotingInterface.tsx
"use client"

import { useState, useTransition } from "react"
import { voteOnPoll } from "@/lib/actions/polls"

export function VotingInterface({ poll }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleVote = () => {
    startTransition(async () => {
      await voteOnPoll(poll.id, selected)
    })
  }

  return (
    <div className="voting-interface">
      {poll.options.map(option => (
        <PollOption
          key={option.id}
          option={option}
          isSelected={selected === option.id}
          onSelect={() => setSelected(option.id)}
        />
      ))}
      <Button
        onClick={handleVote}
        disabled={!selected || isPending}
        isLoading={isPending}
      >
        Vote
      </Button>
    </div>
  )
}
```


## 2.2 PAGE-BY-PAGE UI SPECIFICATIONS

### Landing Page (/)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE DESIGN                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Logo]                    [Explore] [Pricing] [Login] [Get Started] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │              ┌─────────────────────────────────────┐                │   │
│  │              │                                      │                │   │
│  │              │    Your Voice.                       │                │   │
│  │              │    Real Results.                     │                │   │
│  │              │    Trusted Data.                     │  HERO          │   │
│  │              │                                      │  SECTION       │   │
│  │              │    [Kinetic typography animation]    │                │   │
│  │              │                                      │                │   │
│  │              │    [Create Free Poll] [Explore]      │                │   │
│  │              │                                      │                │   │
│  │              └─────────────────────────────────────┘                │   │
│  │                                                                      │   │
│  │              [Live poll counter animation]                          │   │
│  │              "142,847 votes cast today"                             │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      FEATURE BENTO GRID                              │   │
│  │  ┌───────────────────────────┐ ┌───────────────────────────┐        │   │
│  │  │                           │ │                           │        │   │
│  │  │    🗳️ POLLS                │ │    🧪 TESTS                │        │   │
│  │  │    Quick opinions         │ │    Personality quizzes    │        │   │
│  │  │    Real-time results      │ │    Shareable badges       │        │   │
│  │  │                           │ │                           │        │   │
│  │  │   [Animated poll demo]    │ │   [Badge showcase]        │        │   │
│  │  │                           │ │                           │        │   │
│  │  └───────────────────────────┘ └───────────────────────────┘        │   │
│  │  ┌───────────────────────────────────────────────────────────┐      │   │
│  │  │                                                           │      │   │
│  │  │    📊 PULSE                                                │      │   │
│  │  │    Spotify-Wrapped style result reveals                   │      │   │
│  │  │                                                           │      │   │
│  │  │    [Animated PULSE demo - bars growing, percentages]      │      │   │
│  │  │                                                           │      │   │
│  │  └───────────────────────────────────────────────────────────┘      │   │
│  │  ┌───────────────────────────┐ ┌───────────────────────────┐        │   │
│  │  │    💬 COMMENTS             │ │    🔒 TRUST                │        │   │
│  │  │    Discuss with           │ │    Verified humans        │        │   │
│  │  │    participants           │ │    Anonymous responses    │        │   │
│  │  └───────────────────────────┘ └───────────────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      SOCIAL PROOF                                    │   │
│  │                                                                      │   │
│  │    "Used by researchers, brands, and curious minds"                 │   │
│  │                                                                      │   │
│  │    [Logo 1]  [Logo 2]  [Logo 3]  [Logo 4]  [Logo 5]                 │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      FOR ORGANIZATIONS                               │   │
│  │                                                                      │   │
│  │    Enterprise surveys with SSO, analytics, and compliance           │   │
│  │                                                                      │   │
│  │    [Learn More →]                                                   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Logo]  [Product] [Company] [Legal]  [TR/EN]    © 2026 VoxPoll     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Feed Page (/feed)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FEED PAGE                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Logo]   [Feed ▼]  [Explore ▼]  [Create ▼]    🔍    🔔   [Avatar]  │   │
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
│  │                    │ │  │  🔥 1.2k  💬 89  🔗    │   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  └────────────────────────┘   │ │           │   │
│  │                    │ │                                │ │           │   │
│  │                    │ │  ┌────────────────────────┐   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  │  TEST CARD             │   │ │           │   │
│  │                    │ │  │  ─────────             │   │ │           │   │
│  │                    │ │  │  🧪 Personality Test   │   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  │  "What type of        │   │ │           │   │
│  │                    │ │  │   developer are you?" │   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  │  [Take Test →]        │   │ │           │   │
│  │                    │ │  │                        │   │ │           │   │
│  │                    │ │  └────────────────────────┘   │ │           │   │
│  │                    │ │                                │ │           │   │
│  │                    │ │  [Load more...]               │ │           │   │
│  │                    │ │                                │ │           │   │
│  └────────────────────┘ └────────────────────────────────┘ └───────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Poll View Page (/p/[contentId])

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POLL VIEW PAGE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  ← Back                                            [Share] [More ⋮] │   │
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
│  │  │  Posted 2 hours ago · 🔒 83 Reliability Score                  │  │   │
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
│  │  │  │  ●  JavaScript                          ← Selected      │  │  │   │
│  │  │  │     Web development essential                           │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  ○  Rust                                                 │  │  │   │
│  │  │  │     Memory safety and performance                        │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  ○  Go                                                   │  │  │   │
│  │  │  │     Simple syntax, great for backend                    │  │  │   │
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
│  │  💬 COMMENTS (Locked until you vote)                                │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │    🔒 Vote to unlock discussion                               │  │   │
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

### PULSE Page (/pulse/[contentId]) - Spotify-Wrapped Style

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
│  │  │                     🗳️                                         │  │   │
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
│  │  │  JavaScript ✓                              45%                 │  │   │
│  │  │  ████████████████████████████████████████░░░░░░░░░░░░░░░░░░   │  │   │
│  │  │                                                                │  │   │
│  │  │  Python                                    30%                 │  │   │
│  │  │  ███████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  │   │
│  │  │                                                                │  │   │
│  │  │  Rust                                      15%                 │  │   │
│  │  │  █████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  │   │
│  │  │                                                                │  │   │
│  │  │  Go                                        10%                 │  │   │
│  │  │  █████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  │   │
│  │  │                                                                │  │   │
│  │  │  [Bars animate from 0% to final value]                         │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │  [Replay PULSE]    [Share Results]    [View COMMENTS →]        │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 2.3 RESPONSIVE BREAKPOINTS

```typescript
// ══════════════════════════════════════════════════════════════════════════
// TAILWIND BREAKPOINT CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════

// tailwind.config.ts
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

/*
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
*/
```



# ══════════════════════════════════════════════════════════════════════════════
# PART 3: MOBILE APP (@voxpoll/mobile) - React Native + Expo
# ══════════════════════════════════════════════════════════════════════════════


## 3.1 MOBILE-FIRST DESIGN PRINCIPLES

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


## 3.2 NAVIGATION & GESTURE PATTERNS

### Navigation Structure (Expo Router)

```
apps/mobile/
├── app/
│   ├── (tabs)/                          # Tab navigator
│   │   ├── index.tsx                    # Feed (Home tab)
│   │   ├── explore.tsx                  # Explore tab
│   │   ├── create.tsx                   # Create (center FAB)
│   │   ├── notifications.tsx            # Notifications tab
│   │   ├── profile.tsx                  # Profile tab
│   │   └── _layout.tsx                  # Tab layout
│   │
│   ├── (auth)/                          # Auth screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   │
│   ├── (content)/                       # Content screens (modal stack)
│   │   ├── poll/[id].tsx                # Poll view
│   │   ├── test/[id].tsx                # Test view
│   │   ├── pulse/[id].tsx               # PULSE view (fullscreen)
│   │   ├── live/[code].tsx              # Live poll
│   │   └── _layout.tsx                  # Modal presentation
│   │
│   ├── (user)/                          # User screens
│   │   ├── [username].tsx               # Profile view
│   │   ├── settings/
│   │   │   ├── index.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── notifications.tsx
│   │   │   └── subscription.tsx
│   │   └── _layout.tsx
│   │
│   ├── _layout.tsx                      # Root layout
│   └── +not-found.tsx
│
├── components/
├── lib/
└── assets/
```

### Gesture Implementation

```typescript
// ══════════════════════════════════════════════════════════════════════════
// GESTURE PATTERNS - React Native Gesture Handler
// ══════════════════════════════════════════════════════════════════════════

import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from "react-native-reanimated"

// Poll Option with Haptic Feedback
function PollOptionMobile({ option, onSelect, isSelected }) {
  const scale = useSharedValue(1)

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 400 })
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 })
      runOnJS(onSelect)(option.id)
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }))

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.option, animatedStyle]}>
        <Text>{option.text}</Text>
        {isSelected && <CheckIcon />}
      </Animated.View>
    </GestureDetector>
  )
}

// Swipeable Feed Tabs
function FeedTabs() {
  const translateX = useSharedValue(0)
  const [activeTab, setActiveTab] = useState(0)
  const SCREEN_WIDTH = Dimensions.get("window").width

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX
    })
    .onEnd((e) => {
      if (e.translationX > SCREEN_WIDTH / 4 && activeTab > 0) {
        runOnJS(setActiveTab)(activeTab - 1)
      } else if (e.translationX < -SCREEN_WIDTH / 4 && activeTab < 2) {
        runOnJS(setActiveTab)(activeTab + 1)
      }
      translateX.value = withSpring(0)
    })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View>
        {/* Tab content */}
      </Animated.View>
    </GestureDetector>
  )
}

// Double Tap to Upvote Comment
function CommentItem({ comment, onUpvote }) {
  const heartScale = useSharedValue(0)

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      heartScale.value = withSpring(1, { damping: 10 })
      runOnJS(onUpvote)(comment.id)
      runOnJS(Haptics.notificationAsync)(
        Haptics.NotificationFeedbackType.Success
      )
      // Hide heart after animation
      setTimeout(() => {
        heartScale.value = withSpring(0)
      }, 1000)
    })

  return (
    <GestureDetector gesture={doubleTap}>
      <View style={styles.comment}>
        <Text>{comment.text}</Text>
        <Animated.View style={useAnimatedStyle(() => ({
          transform: [{ scale: heartScale.value }],
          opacity: heartScale.value
        }))}>
          <HeartIcon color="red" size={80} />
        </Animated.View>
      </View>
    </GestureDetector>
  )
}
```


## 3.3 SCREEN-BY-SCREEN SPECIFICATIONS

### Mobile Feed Screen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOBILE FEED SCREEN                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ╔═══════════════════════════════════════════════════════════════╗  │   │
│  │  ║  Status Bar                                                    ║  │   │
│  │  ╚═══════════════════════════════════════════════════════════════╝  │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  VoxPoll                                            🔍        │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  [For You]     [Following]     [Discover]                     │  │   │
│  │  │  ════════      ─────────       ─────────                      │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  ┌─────┐                                                │  │  │   │
│  │  │  │  │ 👤  │  @username · 2h                       ⋮       │  │  │   │
│  │  │  │  └─────┘                                                │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │  Which coffee is best for coding?                       │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │  ┌───────────────────────────────────────────────────┐  │  │  │   │
│  │  │  │  │  ☕ Espresso                              35%  ██ │  │  │  │   │
│  │  │  │  └───────────────────────────────────────────────────┘  │  │  │   │
│  │  │  │  ┌───────────────────────────────────────────────────┐  │  │  │   │
│  │  │  │  │  🍵 Green Tea                             45%  ███│  │  │  │   │
│  │  │  │  └───────────────────────────────────────────────────┘  │  │  │   │
│  │  │  │  ┌───────────────────────────────────────────────────┐  │  │  │   │
│  │  │  │  │  🥤 Energy Drink                          20%  █  │  │  │  │   │
│  │  │  │  └───────────────────────────────────────────────────┘  │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │  🔥 847  💬 32  🔗 Share                                │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  [More cards below - FlashList]                               │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                │  │   │
│  │  │    🏠          🔍          ➕          🔔          👤          │  │   │
│  │  │   Feed      Explore     Create     Notifs     Profile         │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  ╔═══════════════════════════════════════════════════════════════╗  │   │
│  │  ║  Home Indicator                                                ║  │   │
│  │  ╚═══════════════════════════════════════════════════════════════╝  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Poll Creation (Bottom Sheet)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MOBILE POLL CREATION SHEET                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  [Dimmed background - Feed visible behind]                          │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                        ━━━━                                    │  │   │
│  │  │                   [Drag handle]                                │  │   │
│  │  │                                                                │  │   │
│  │  │  ╳ Cancel           Create Poll           Post                │  │   │
│  │  │                                                                │  │   │
│  │  │  ─────────────────────────────────────────────────────────────│  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │  Ask a question...                                       │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  Option 1                                      ╳        │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  Option 2                                      ╳        │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  [+ Add option]                                               │  │   │
│  │  │                                                                │  │   │
│  │  │  ─────────────────────────────────────────────────────────────│  │   │
│  │  │                                                                │  │   │
│  │  │  Duration       [1 day ▼]                                     │  │   │
│  │  │  Visibility     [Public ▼]                                    │  │   │
│  │  │                                                                │  │   │
│  │  │  ☐ Allow anonymous votes                                      │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 3.4 PLATFORM-SPECIFIC ADAPTATIONS

```typescript
// ══════════════════════════════════════════════════════════════════════════
// PLATFORM-SPECIFIC COMPONENTS
// ══════════════════════════════════════════════════════════════════════════

import { Platform } from "react-native"

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                    iOS vs ANDROID DIFFERENCES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ELEMENT           │ iOS                    │ Android                       │
│  ──────────────────┼────────────────────────┼───────────────────────────────│
│  Navigation Bar    │ Large title style      │ Material 3 TopAppBar          │
│  Back Button       │ < Back (text)          │ ← (arrow only)                │
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
*/

// Platform-aware shadow
const createShadow = (elevation: number) => {
  if (Platform.OS === "ios") {
    return {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.1 + elevation * 0.02,
      shadowRadius: elevation,
    }
  }
  return { elevation }
}

// Platform-aware blur
const BlurContainer = ({ children, intensity = 50 }) => {
  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={intensity} style={styles.blur}>
        {children}
      </BlurView>
    )
  }
  // Android fallback - semi-transparent background
  return (
    <View style={[styles.blur, { backgroundColor: "rgba(255,255,255,0.9)" }]}>
      {children}
    </View>
  )
}
```



# ══════════════════════════════════════════════════════════════════════════════
# PART 4: PLATFORM APP (@voxpoll/platform) - Admin Dashboard
# ══════════════════════════════════════════════════════════════════════════════


## 4.1 DASHBOARD ARCHITECTURE

### Admin Dashboard Structure

```
apps/platform/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx                     # Main dashboard
│   │   ├── users/
│   │   │   ├── page.tsx                 # User management
│   │   │   └── [id]/page.tsx            # User detail
│   │   ├── content/
│   │   │   ├── page.tsx                 # Content moderation queue
│   │   │   └── [id]/page.tsx            # Content detail
│   │   ├── reports/page.tsx             # User reports
│   │   ├── organizations/
│   │   │   ├── page.tsx                 # Org management
│   │   │   └── [id]/page.tsx
│   │   ├── analytics/
│   │   │   ├── page.tsx                 # Platform analytics
│   │   │   ├── users/page.tsx           # User analytics
│   │   │   └── content/page.tsx         # Content analytics
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── theme/page.tsx           # Theme editor
│   │   │   └── config/page.tsx          # Runtime config
│   │   └── layout.tsx                   # Dashboard layout with sidebar
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   │
│   └── layout.tsx
│
├── components/
│   ├── charts/                          # Recharts components
│   ├── tables/                          # TanStack Table components
│   └── dashboard/                       # Dashboard-specific components
│
└── lib/
```


## 4.2 ANALYTICS & DATA VISUALIZATION

### Main Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN DASHBOARD                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐ ┌─────────────────────────────────────────────────────────┐│
│  │             │ │                                                          ││
│  │  SIDEBAR    │ │  Dashboard                       [Search]  [🔔] [Admin] ││
│  │             │ │                                                          ││
│  │  ─────────  │ │  ───────────────────────────────────────────────────────││
│  │             │ │                                                          ││
│  │  📊 Dash    │ │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐││
│  │  👥 Users   │ │  │            │ │            │ │            │ │        │││
│  │  📋 Content │ │  │  USERS     │ │  POLLS     │ │  VOTES     │ │  MRR   │││
│  │  ⚠️ Reports  │ │  │  142.8K    │ │  23.4K     │ │  1.2M      │ │  $48K  │││
│  │  🏢 Orgs    │ │  │  ↑ 12%     │ │  ↑ 8%      │ │  ↑ 24%     │ │  ↑ 15% │││
│  │  📈 Analyt  │ │  │            │ │            │ │            │ │        │││
│  │  ⚙️ Settings │ │  └────────────┘ └────────────┘ └────────────┘ └────────┘││
│  │             │ │                                                          ││
│  │  ─────────  │ │  ┌─────────────────────────────────────────────────────┐││
│  │             │ │  │                                                      │││
│  │  THEME:     │ │  │  ACTIVITY CHART (Last 30 days)                       │││
│  │  ○ Light    │ │  │                                                      │││
│  │  ● Dark     │ │  │  [Recharts AreaChart - Votes over time]             │││
│  │  ○ System   │ │  │                                                      │││
│  │             │ │  │     ╭────────────╮                                   │││
│  │             │ │  │    ╱              ╲     ╭──────                      │││
│  │             │ │  │  ─╱                ╲───╱                             │││
│  │             │ │  │                                                      │││
│  │             │ │  └─────────────────────────────────────────────────────┘││
│  │             │ │                                                          ││
│  │             │ │  ┌───────────────────────┐ ┌───────────────────────────┐││
│  │             │ │  │                        │ │                           │││
│  │             │ │  │  CONTENT BY TYPE       │ │  MODERATION QUEUE         │││
│  │             │ │  │                        │ │                           │││
│  │             │ │  │  [Pie Chart]           │ │  ⚠️ 12 pending reviews    │││
│  │             │ │  │                        │ │  🚨 3 urgent reports      │││
│  │             │ │  │   Polls  68%           │ │  ✓ 847 approved today     │││
│  │             │ │  │   Tests  24%           │ │                           │││
│  │             │ │  │   Survey 8%            │ │  [View Queue →]           │││
│  │             │ │  │                        │ │                           │││
│  │             │ │  └───────────────────────┘ └───────────────────────────┘││
│  │             │ │                                                          ││
│  └─────────────┘ └─────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 4.3 MODERATION & MANAGEMENT

### Content Moderation Queue

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
│  │  │  🚨 URGENT                                                     │  │   │
│  │  │  ─────────────────────────────────────────────────────────────│  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  Poll: "Which group should be..." [HATE_SPEECH]         │  │  │   │
│  │  │  │  by @user123 · Reported 3x · 15 min ago                 │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │  [View Content]   [Approve]   [Remove]   [Ban User]     │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  ⚠️ AUTO-FLAGGED                                               │  │   │
│  │  │  ─────────────────────────────────────────────────────────────│  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  Comment: "This is f***ing..." [PROFANITY]              │  │  │   │
│  │  │  │  by @user456 · AI flagged · Confidence: 94%             │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │  [View Context]   [Approve]   [Remove]   [Warn User]    │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │
│  │  │  │  Poll: "Political opinion on..." [CONTROVERSIAL]        │  │  │   │
│  │  │  │  by @user789 · AI flagged · Confidence: 72%             │  │  │   │
│  │  │  │                                                          │  │  │   │
│  │  │  │  [View Content]   [Approve]   [Flag for Review]         │  │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │   │
│  │  │                                                                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  [Load More...]                                                     │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 4.4 THEME EDITOR (Admin Panel)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THEME EDITOR                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐ ┌─────────────────────────────────────────────────────────┐│
│  │             │ │                                                          ││
│  │  SIDEBAR    │ │  Theme Editor                                [Publish]  ││
│  │             │ │                                                          ││
│  │             │ │  ┌───────────────────────────────────────────────────┐  ││
│  │             │ │  │  [Brand]  [Colors]  [Typography]  [Advanced]      │  ││
│  │             │ │  └───────────────────────────────────────────────────┘  ││
│  │             │ │                                                          ││
│  │             │ │  ┌─────────────────────┐ ┌─────────────────────────────┐││
│  │             │ │  │                      │ │                             │││
│  │             │ │  │  SETTINGS            │ │  LIVE PREVIEW              │││
│  │             │ │  │                      │ │                             │││
│  │             │ │  │  Primary Color       │ │  ┌───────────────────────┐ │││
│  │             │ │  │  ┌────────────────┐  │ │  │                        │ │││
│  │             │ │  │  │ [██] #0c8ce9   │  │ │  │  [Poll Card Preview]   │ │││
│  │             │ │  │  └────────────────┘  │ │  │                        │ │││
│  │             │ │  │                      │ │  │  "Sample poll?"        │ │││
│  │             │ │  │  Auto-generate scale │ │  │                        │ │││
│  │             │ │  │  ☑ Yes              │ │  │  ○ Option A             │ │││
│  │             │ │  │                      │ │  │  ● Option B (selected) │ │││
│  │             │ │  │  ─────────────────── │ │  │                        │ │││
│  │             │ │  │                      │ │  │  [Vote]                │ │││
│  │             │ │  │  Border Radius       │ │  │                        │ │││
│  │             │ │  │  ○ None ○ sm ● md   │ │  └───────────────────────┘ │││
│  │             │ │  │  ○ lg  ○ xl ○ full  │ │                             │││
│  │             │ │  │                      │ │  ┌───────────────────────┐ │││
│  │             │ │  │  ─────────────────── │ │  │                        │ │││
│  │             │ │  │                      │ │  │  [Button Preview]      │ │││
│  │             │ │  │  Dark Mode           │ │  │                        │ │││
│  │             │ │  │  ☑ Enable           │ │  │  [Primary] [Secondary] │ │││
│  │             │ │  │                      │ │  │  [Outline] [Ghost]     │ │││
│  │             │ │  │  Default: ○L ●D ○S  │ │  │                        │ │││
│  │             │ │  │                      │ │  └───────────────────────┘ │││
│  │             │ │  │  ─────────────────── │ │                             │││
│  │             │ │  │                      │ │  [Toggle Dark Mode Preview]│││
│  │             │ │  │  [Reset] [Save Draft]│ │                             │││
│  │             │ │  │                      │ │                             │││
│  │             │ │  └─────────────────────┘ └─────────────────────────────┘││
│  │             │ │                                                          ││
│  └─────────────┘ └─────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```



# ══════════════════════════════════════════════════════════════════════════════
# PART 5: SHARED UI COMPONENTS (@voxpoll/ui)
# ══════════════════════════════════════════════════════════════════════════════


## CRITICAL: SHADCN + TAILWIND ONLY APPROACH

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              COMPONENT DEVELOPMENT RULES - STRICTLY ENFORCED                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ ALLOWED                                                                 │
│  ───────────                                                                │
│  • shadcn/ui components as base (Button, Card, Dialog, etc.)               │
│  • Tailwind CSS utility classes                                            │
│  • Tailwind arbitrary values: text-[14px], bg-[#123456]                    │
│  • CVA (class-variance-authority) for component variants                   │
│  • clsx/tailwind-merge via cn() utility                                    │
│  • CSS variables in :root for theming                                      │
│  • Framer Motion for animations (className-based)                          │
│                                                                             │
│  ❌ NOT ALLOWED                                                             │
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

### Component Pattern Template

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// STANDARD COMPONENT PATTERN (shadcn + Tailwind only)
// ═══════════════════════════════════════════════════════════════════════════

"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Step 1: Define variants with CVA (Tailwind classes only)
const componentVariants = cva(
  // Base classes - always applied
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

// Step 2: Define props interface
export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

// Step 3: Create component with forwardRef
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


## 5.1 COMPONENT CATALOG

### Complete Component List

```typescript
// ══════════════════════════════════════════════════════════════════════════
// @voxpoll/ui COMPONENT EXPORTS
// ══════════════════════════════════════════════════════════════════════════

// packages/ui/src/index.ts

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


## 5.2 KEY COMPONENT IMPLEMENTATIONS

### Poll Card Component

```typescript
// ══════════════════════════════════════════════════════════════════════════
// POLL CARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════

// packages/ui/src/components/voxpoll/poll-card.tsx

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
            View PULSE →
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
```

### PULSE Animation Component

```typescript
// ══════════════════════════════════════════════════════════════════════════
// PULSE ANIMATION COMPONENT
// ══════════════════════════════════════════════════════════════════════════

// packages/ui/src/components/voxpoll/pulse-animation.tsx

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
              🗳️
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
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="flex justify-between mb-1">
                    <span className={cn(
                      "font-medium",
                      option.id === userVotedOptionId && "flex items-center gap-2"
                    )}>
                      {option.text}
                      {option.id === userVotedOptionId && (
                        <span className="text-vox-accent-emerald">✓</span>
                      )}
                    </span>
                    <span>{option.percentage}%</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${option.percentage}%` }}
                      transition={{
                        duration: 1,
                        delay: index * 0.2,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className={cn(
                        "h-full rounded-full",
                        option.id === userVotedOptionId
                          ? "bg-vox-accent-emerald"
                          : "bg-white/60"
                      )}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// CountUp helper component
function CountUp({ end, duration }: { end: number; duration: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return <>{count}</>
}
```



# ══════════════════════════════════════════════════════════════════════════════
# PART 6: 2026 TREND IMPLEMENTATIONS
# ══════════════════════════════════════════════════════════════════════════════


## 6.1 LIQUID GLASS / GLASSMORPHISM (TAILWIND-ONLY)

### Glassmorphism with Pure Tailwind Classes

```tsx
// ═══════════════════════════════════════════════════════════════════════════
// GLASSMORPHISM - Pure Tailwind, No Custom CSS
// ═══════════════════════════════════════════════════════════════════════════

// Glass effect - Tailwind classes only
const glassClasses = {
  // Standard glass (for cards, modals)
  default: "bg-white/10 backdrop-blur-md border border-white/20",

  // Light glass (for light backgrounds)
  light: "bg-white/70 backdrop-blur border border-white/30",

  // Dark glass (for dark backgrounds)
  dark: "bg-black/40 backdrop-blur-md border border-white/10",

  // Subtle glass (for navigation)
  subtle: "bg-background/80 backdrop-blur-sm border-b border-border/50",
}

// Usage Examples:
<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
  Glass card content
</div>

<nav className="bg-background/80 backdrop-blur-sm border-b border-border/50">
  Navigation content
</nav>

// With GlassCard component (from Part 7):
<GlassCard blur="medium" border="subtle">
  Content here
</GlassCard>
```

### When to Use Each Variant

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GLASSMORPHISM USAGE GUIDE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DEFAULT (backdrop-blur-md, bg-white/10)                                   │
│  • Modal overlays                                                          │
│  • Cards on gradient backgrounds                                           │
│  • Hero section elements                                                   │
│                                                                             │
│  LIGHT (backdrop-blur, bg-white/70)                                        │
│  • Cards on light backgrounds                                              │
│  • Dropdown menus                                                          │
│  • Tooltips                                                                │
│                                                                             │
│  DARK (backdrop-blur-md, bg-black/40)                                      │
│  • Cards on dark mode                                                      │
│  • Video overlays                                                          │
│  • Image caption boxes                                                     │
│                                                                             │
│  SUBTLE (backdrop-blur-sm, bg-background/80)                               │
│  • Fixed navigation bars                                                   │
│  • Sticky headers                                                          │
│  • Bottom sheets                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 6.2 BENTO GRID LAYOUT

```typescript
// ══════════════════════════════════════════════════════════════════════════
// BENTO GRID COMPONENT
// ══════════════════════════════════════════════════════════════════════════

// For landing pages and dashboards

export function BentoGrid({ children, className }) {
  return (
    <div className={cn(
      "grid auto-rows-[minmax(180px,auto)] gap-4",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  )
}

export function BentoItem({
  children,
  className,
  colSpan = 1,
  rowSpan = 1
}: {
  children: React.ReactNode
  className?: string
  colSpan?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2 | 3
}) {
  return (
    <div className={cn(
      "rounded-2xl bg-card p-6 shadow-sm border",
      "transition-all duration-300 hover:shadow-lg",
      colSpan === 2 && "sm:col-span-2",
      colSpan === 3 && "lg:col-span-3",
      colSpan === 4 && "xl:col-span-4",
      rowSpan === 2 && "row-span-2",
      rowSpan === 3 && "row-span-3",
      className
    )}>
      {children}
    </div>
  )
}

// Usage on landing page:
// <BentoGrid>
//   <BentoItem colSpan={2}>Polls Feature</BentoItem>
//   <BentoItem>Tests Feature</BentoItem>
//   <BentoItem rowSpan={2}>PULSE Demo</BentoItem>
//   <BentoItem>Comments</BentoItem>
//   <BentoItem>Trust</BentoItem>
// </BentoGrid>
```


## 6.3 KINETIC TYPOGRAPHY

```typescript
// ══════════════════════════════════════════════════════════════════════════
// KINETIC TYPOGRAPHY FOR LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════

"use client"

import { motion } from "framer-motion"

const words = ["Voice", "Opinion", "Data", "Insights"]

export function KineticHeadline() {
  return (
    <h1 className="text-5xl md:text-7xl font-bold">
      <span>Your </span>
      <span className="relative inline-block min-w-[200px]">
        {words.map((word, i) => (
          <motion.span
            key={word}
            className="absolute left-0 bg-gradient-to-r from-vox-primary-500 to-vox-accent-violet bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [20, 0, 0, -20]
            }}
            transition={{
              duration: 2.5,
              delay: i * 2.5,
              repeat: Infinity,
              repeatDelay: (words.length - 1) * 2.5
            }}
          >
            {word}
          </motion.span>
        ))}
      </span>
      <span> Matters.</span>
    </h1>
  )
}
```


## 6.4 AI-POWERED PERSONALIZATION UI

```typescript
// ══════════════════════════════════════════════════════════════════════════
// AI PERSONALIZATION INDICATORS
// ══════════════════════════════════════════════════════════════════════════

// Show users WHY content is shown to them

export function PersonalizationBadge({
  reason
}: {
  reason: "trending" | "followed" | "similar" | "location" | "demographic"
}) {
  const labels = {
    trending: { icon: "🔥", text: "Trending" },
    followed: { icon: "👤", text: "From someone you follow" },
    similar: { icon: "✨", text: "Based on your interests" },
    location: { icon: "📍", text: "Popular in your area" },
    demographic: { icon: "🎯", text: "For you" }
  }

  const { icon, text } = labels[reason]

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

// AI-generated content suggestions
export function AISuggestionCard({ suggestion }) {
  return (
    <Card className="border-dashed border-vox-primary-200 bg-vox-primary-50/50 dark:bg-vox-primary-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-sm text-vox-primary-600">
          <SparklesIcon className="h-4 w-4" />
          <span>AI Suggestion</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{suggestion.text}</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">
          Apply suggestion
        </Button>
      </CardFooter>
    </Card>
  )
}
```



# ══════════════════════════════════════════════════════════════════════════════
# APPENDIX: IMPLEMENTATION CHECKLIST
# ══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION PRIORITY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: Foundation (Week 1-2)                                            │
│  ─────────────────────────────                                              │
│  ☐ Set up @voxpoll/ui package with shadcn/ui                               │
│  ☐ Configure Tailwind v4 with design tokens                                │
│  ☐ Implement dark/light mode with next-themes                              │
│  ☐ Create base components (Button, Input, Card, etc.)                      │
│  ☐ Set up Framer Motion for animations                                     │
│                                                                             │
│  PHASE 2: Core Components (Week 3-4)                                       │
│  ────────────────────────────────────                                       │
│  ☐ PollCard, PollOption, PollOptionResult                                  │
│  ☐ TestCard, BadgeDisplay                                                  │
│  ☐ UserAvatar, UserCard                                                    │
│  ☐ CommentThread, CommentItem                                              │
│  ☐ ReliabilityBadge, PollStats                                             │
│                                                                             │
│  PHASE 3: Web App Pages (Week 5-8)                                         │
│  ─────────────────────────────────                                          │
│  ☐ Landing page with Bento Grid                                            │
│  ☐ Auth pages (login, register)                                            │
│  ☐ Feed page with tabs                                                     │
│  ☐ Poll view and voting interface                                          │
│  ☐ PULSE animation page                                                    │
│  ☐ Create poll flow                                                        │
│  ☐ User profile and settings                                               │
│                                                                             │
│  PHASE 4: Mobile App (Week 9-12)                                           │
│  ────────────────────────────────                                           │
│  ☐ Set up Expo Router navigation                                           │
│  ☐ Implement gesture-based interactions                                    │
│  ☐ Port components to React Native                                         │
│  ☐ Bottom sheet creation flow                                              │
│  ☐ Native haptic feedback                                                  │
│  ☐ Offline support                                                         │
│                                                                             │
│  PHASE 5: Admin Dashboard (Week 13-16)                                     │
│  ─────────────────────────────────────                                      │
│  ☐ Dashboard layout with sidebar                                           │
│  ☐ Analytics charts with Recharts                                          │
│  ☐ Moderation queue                                                        │
│  ☐ User management tables                                                  │
│  ☐ Theme editor with live preview                                          │
│  ☐ Configuration management                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```



# ══════════════════════════════════════════════════════════════════════════════
# PART 7: PERFORMANCE-OPTIMIZED VISUAL EFFECTS (TAILWIND-ONLY)
# ══════════════════════════════════════════════════════════════════════════════

## IMPORTANT: SHADCN + TAILWIND ONLY APPROACH

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STYLING RULES - ZERO CUSTOM CSS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ ALLOWED                                                                 │
│  ────────────────────                                                       │
│  • Tailwind utility classes                                                │
│  • Tailwind config extensions (theme.extend)                               │
│  • shadcn/ui components as base                                            │
│  • CSS variables in :root (for theming)                                    │
│  • Tailwind arbitrary values [value]                                       │
│                                                                             │
│  ❌ NOT ALLOWED                                                             │
│  ────────────────────                                                       │
│  • Custom CSS classes (.my-class {})                                       │
│  • External CSS libraries                                                  │
│  • Inline style objects (except CSS vars)                                  │
│  • CSS-in-JS (styled-components, emotion)                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.1 TAILWIND CONFIG EXTENSIONS

### Complete Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════════
      // COLORS - CSS Variable Based (Admin Configurable)
      // ═══════════════════════════════════════════════════════════════════
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          950: "hsl(var(--primary-950))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          violet: "hsl(var(--accent-violet))",
          pink: "hsl(var(--accent-pink))",
          orange: "hsl(var(--accent-orange))",
          emerald: "hsl(var(--accent-emerald))",
          cyan: "hsl(var(--accent-cyan))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // BORDER RADIUS - Admin Configurable
      // ═══════════════════════════════════════════════════════════════════
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ═══════════════════════════════════════════════════════════════════
      // FONTS - Admin Configurable
      // ═══════════════════════════════════════════════════════════════════
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui"],
        mono: ["var(--font-mono)", "monospace"],
      },

      // ═══════════════════════════════════════════════════════════════════
      // BACKGROUND IMAGES - Gradient Patterns via Tailwind
      // ═══════════════════════════════════════════════════════════════════
      backgroundImage: {
        // Grid pattern
        "grid-pattern": `
          linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)
        `,
        // Dots pattern
        "dots-pattern": `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
        // Radial glow
        "glow-radial": `radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.15), transparent)`,
        // Mesh gradient
        "mesh-gradient": `
          radial-gradient(at 40% 20%, hsl(var(--primary) / 0.1) 0px, transparent 50%),
          radial-gradient(at 80% 0%, hsl(var(--accent-violet) / 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 50%, hsl(var(--accent-pink) / 0.05) 0px, transparent 50%)
        `,
        // Hero gradient
        "hero-gradient": `linear-gradient(to bottom, hsl(var(--background)), hsl(var(--muted)))`,
      },

      // ═══════════════════════════════════════════════════════════════════
      // BACKGROUND SIZE - For Patterns
      // ═══════════════════════════════════════════════════════════════════
      backgroundSize: {
        "pattern-sm": "16px 16px",
        "pattern-md": "24px 24px",
        "pattern-lg": "32px 32px",
        "pattern-xl": "48px 48px",
      },

      // ═══════════════════════════════════════════════════════════════════
      // ANIMATIONS - Tailwind Native
      // ═══════════════════════════════════════════════════════════════════
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.05)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin-slow 3s linear infinite",
      },

      // ═══════════════════════════════════════════════════════════════════
      // SHADOWS - Admin Configurable
      // ═══════════════════════════════════════════════════════════════════
      boxShadow: {
        "glow-sm": "0 0 10px hsl(var(--primary) / 0.3)",
        "glow-md": "0 0 20px hsl(var(--primary) / 0.3)",
        "glow-lg": "0 0 30px hsl(var(--primary) / 0.4)",
        "glow-accent": "0 0 20px hsl(var(--accent) / 0.4)",
      },
    },
  },
  plugins: [],
}

export default config
```


## 7.2 PERFORMANCE RULES FOR BACKGROUNDS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              BACKGROUND PERFORMANCE HIERARCHY (Best → Worst)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ EXCELLENT (0ms paint time) - USE THESE                                  │
│  ────────────────────────────────────────────                               │
│  1. bg-background, bg-card, bg-muted (solid CSS variables)                 │
│  2. bg-gradient-to-b from-background to-muted                              │
│  3. bg-glow-radial (simple radial gradient)                                │
│                                                                             │
│  ✅ GOOD (< 1ms paint time)                                                 │
│  ──────────────────────────                                                 │
│  4. bg-grid-pattern bg-pattern-md                                          │
│  5. bg-dots-pattern bg-pattern-sm                                          │
│  6. bg-mesh-gradient                                                       │
│                                                                             │
│  ⚠️ MODERATE (1-5ms paint time) - USE WITH CAUTION                          │
│  ─────────────────────────────────────────────────                          │
│  7. backdrop-blur-sm (4px)                                                 │
│  8. backdrop-blur (8px)                                                    │
│  9. backdrop-blur-md (12px)                                                │
│                                                                             │
│  ❌ AVOID (> 5ms paint time, causes jank)                                   │
│  ─────────────────────────────────────────                                  │
│  10. backdrop-blur-lg (16px+) on mobile                                    │
│  11. Multiple stacked backdrop-blur layers                                 │
│  12. Animated gradients on full-screen elements                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.3 SHADCN GLASS CARD COMPONENT (TAILWIND ONLY)

```typescript
// packages/ui/src/components/glass-card.tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ═══════════════════════════════════════════════════════════════════════════
// GLASS CARD - Pure Tailwind, shadcn-style API
// ═══════════════════════════════════════════════════════════════════════════

const glassCardVariants = cva(
  // Base classes - always applied
  [
    "relative rounded-lg border",
    "transform-gpu",  // GPU acceleration
  ].join(" "),
  {
    variants: {
      // Blur intensity variants
      blur: {
        none: "bg-card",
        light: "backdrop-blur-sm bg-background/80 dark:bg-background/60",
        medium: "backdrop-blur bg-background/70 dark:bg-background/50",
        heavy: "backdrop-blur-md bg-background/60 dark:bg-background/40",
      },
      // Border style variants
      border: {
        default: "border-border",
        subtle: "border-border/50",
        glow: "border-primary/20 shadow-glow-sm",
        none: "border-transparent",
      },
      // Size variants
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      blur: "medium",
      border: "subtle",
      size: "md",
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, blur, border, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ blur, border, size, className }))}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard, glassCardVariants }
```

### Usage Examples

```tsx
// Basic usage
<GlassCard>Content here</GlassCard>

// Light blur for mobile performance
<GlassCard blur="light" border="subtle">
  Mobile-optimized card
</GlassCard>

// Heavy blur for desktop hero sections
<GlassCard blur="heavy" border="glow" size="xl">
  Hero content
</GlassCard>

// No blur fallback
<GlassCard blur="none" border="default">
  Solid card fallback
</GlassCard>
```


## 7.4 BACKGROUND PATTERN COMPONENT (TAILWIND ONLY)

```typescript
// packages/ui/src/components/background-pattern.tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ═══════════════════════════════════════════════════════════════════════════
// BACKGROUND PATTERN - Pure Tailwind patterns
// ═══════════════════════════════════════════════════════════════════════════

const backgroundPatternVariants = cva(
  "absolute inset-0 pointer-events-none",
  {
    variants: {
      pattern: {
        none: "",
        grid: "bg-grid-pattern bg-pattern-md",
        dots: "bg-dots-pattern bg-pattern-sm",
        glow: "bg-glow-radial",
        mesh: "bg-mesh-gradient",
        gradient: "bg-hero-gradient",
      },
      opacity: {
        subtle: "opacity-30",
        light: "opacity-50",
        medium: "opacity-70",
        full: "opacity-100",
      },
    },
    defaultVariants: {
      pattern: "none",
      opacity: "light",
    },
  }
)

export interface BackgroundPatternProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof backgroundPatternVariants> {}

const BackgroundPattern = React.forwardRef<HTMLDivElement, BackgroundPatternProps>(
  ({ className, pattern, opacity, ...props }, ref) => {
    if (pattern === "none") return null

    return (
      <div
        ref={ref}
        className={cn(backgroundPatternVariants({ pattern, opacity, className }))}
        aria-hidden="true"
        {...props}
      />
    )
  }
)
BackgroundPattern.displayName = "BackgroundPattern"

export { BackgroundPattern, backgroundPatternVariants }
```

### Usage Examples

```tsx
// Page with grid pattern
<div className="relative min-h-screen">
  <BackgroundPattern pattern="grid" opacity="subtle" />
  <main className="relative z-10">
    {/* Content */}
  </main>
</div>

// Hero with glow effect
<section className="relative overflow-hidden">
  <BackgroundPattern pattern="glow" opacity="medium" />
  <BackgroundPattern pattern="mesh" opacity="subtle" />
  <div className="relative z-10">
    <h1>Hero Title</h1>
  </div>
</section>
```


## 7.5 GLOW BUTTON COMPONENT (TAILWIND ONLY)

```typescript
// packages/ui/src/components/glow-button.tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ═══════════════════════════════════════════════════════════════════════════
// GLOW BUTTON - Based on shadcn Button with glow effects
// ═══════════════════════════════════════════════════════════════════════════

const glowButtonVariants = cva(
  [
    // Base
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-md text-sm font-medium",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    // GPU acceleration for smooth animations
    "transform-gpu",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 hover:shadow-glow-sm",
          "active:scale-[0.98]",
        ].join(" "),
        glow: [
          "bg-primary text-primary-foreground",
          "shadow-glow-md",
          "hover:shadow-glow-lg hover:scale-[1.02]",
          "active:scale-[0.98]",
        ].join(" "),
        outline: [
          "border border-input bg-background",
          "hover:bg-accent hover:text-accent-foreground",
          "active:scale-[0.98]",
        ].join(" "),
        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
          "active:scale-[0.98]",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
          "active:scale-[0.98]",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-3 rounded-md",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8 rounded-md",
        xl: "h-12 px-10 text-base rounded-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {
  asChild?: boolean
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(glowButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GlowButton.displayName = "GlowButton"

export { GlowButton, glowButtonVariants }
```


## 7.6 ANIMATION UTILITY CLASSES

### Motion-Safe Animations

```tsx
// Always use motion-safe and motion-reduce variants
<div className="
  motion-safe:animate-slide-up
  motion-reduce:opacity-100
">
  Animated content
</div>

// Conditional animation based on admin setting
<div className={cn(
  "transition-all duration-200",
  animationsEnabled && "motion-safe:animate-fade-in"
)}>
  Content
</div>
```

### Standard Animation Patterns

```typescript
// Common animation class combinations
const animations = {
  // Page transitions
  pageEnter: "animate-fade-in motion-reduce:animate-none",
  pageExit: "animate-fade-out motion-reduce:animate-none",

  // Card hover
  cardHover: "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]",

  // Button press
  buttonPress: "transition-transform duration-100 active:scale-95",

  // List stagger (use with style={{ animationDelay }})
  listItem: "animate-slide-up motion-reduce:animate-none",

  // Loading shimmer
  skeleton: "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",

  // Glow pulse (hero elements)
  glowPulse: "animate-glow-pulse motion-reduce:animate-none",
}
```

### GPU Performance Tips

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      GPU ACCELERATION TAILWIND CLASSES                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ALWAYS USE for animated elements:                                          │
│  ─────────────────────────────────                                          │
│  • transform-gpu         → Forces GPU compositing                          │
│  • will-change-transform → Hints browser to optimize                       │
│                                                                             │
│  ANIMATE ONLY these properties (GPU-composited):                           │
│  ────────────────────────────────────────────────                          │
│  • transform (scale, translate, rotate)                                    │
│  • opacity                                                                 │
│                                                                             │
│  AVOID animating (triggers layout/paint):                                  │
│  ────────────────────────────────────────                                  │
│  • width, height, padding, margin                                          │
│  • top, left, right, bottom                                                │
│  • font-size, border-width                                                 │
│                                                                             │
│  EXAMPLE - Good vs Bad:                                                    │
│  ──────────────────────                                                    │
│  ✅ hover:scale-105 transition-transform                                   │
│  ❌ hover:p-6 transition-all                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```



# ══════════════════════════════════════════════════════════════════════════════
# PART 8: ADMIN THEMING SYSTEM (Full Customization)
# ══════════════════════════════════════════════════════════════════════════════


## 8.1 DATABASE-DRIVEN THEME CONFIGURATION

### Drizzle Schema for Theme Storage

```typescript
// Drizzle schema

export const themeConfigs = pgTable('theme_configs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').default('default').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  isDraft: boolean('is_draft').default(true).notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Brand
  logoLight: text('logo_light'),  // URL or base64
  logoDark: text('logo_dark'),
  favicon: text('favicon'),

  // Colors (stored as JSON)
  colorPrimary  Json     // { 50: "#...", 100: "#...", ..., 950: "#..." }
  colorAccent   String   @default("#8b5cf6")

  // UI Settings
  borderRadius  String   @default("md")  // none | sm | md | lg | xl | full
  fontSans      String   @default("Inter Variable")
  fontDisplay   String   @default("Cal Sans")

  // Dark Mode
  darkModeEnabled    Boolean @default(true)
  darkModeDefault    String  @default("system")  // light | dark | system
  darkBackground     String  @default("#0a0a0b")
  darkCardBackground String  @default("#18181b")

  // Background Pattern
  backgroundPattern  String  @default("none")  // none | grid | dots | diagonal | mesh
  patternOpacity     Float   @default(0.5)

  // Effects
  enableGlassmorphism Boolean @default(true)
  enableGlow          Boolean @default(true)
  enableGrain         Boolean @default(false)
  blurIntensity       String  @default("medium")  // light | medium | heavy

  // Animations
  animationLevel      String  @default("normal")  // none | reduced | normal | playful

  // White Label
  hideVoxPollBranding Boolean @default(false)
  customFooter        String?

  // Organization (for B2B white-label)
  organizationId      String?  @unique
  organization        Organization? @relation(fields: [organizationId], references: [id])
}
```

### Theme Configuration Types

```typescript
// packages/shared/src/types/theme.types.ts

export interface ThemeConfig {
  id: string
  name: string
  isActive: boolean
  isDraft: boolean

  // Brand
  brand: {
    logoLight: string | null
    logoDark: string | null
    favicon: string | null
  }

  // Colors
  colors: {
    primary: ColorScale
    accent: string
  }

  // UI
  ui: {
    borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "full"
    fontSans: string
    fontDisplay: string
  }

  // Dark Mode
  darkMode: {
    enabled: boolean
    default: "light" | "dark" | "system"
    background: string
    cardBackground: string
  }

  // Background
  background: {
    pattern: "none" | "grid" | "dots" | "diagonal" | "mesh" | "glow"
    opacity: number  // 0-1
  }

  // Effects
  effects: {
    glassmorphism: boolean
    glow: boolean
    grain: boolean
    blurIntensity: "light" | "medium" | "heavy"
  }

  // Animations
  animations: {
    level: "none" | "reduced" | "normal" | "playful"
  }

  // White Label
  whiteLabel: {
    hideVoxPollBranding: boolean
    customFooter: string | null
  }
}

export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}
```


## 8.2 RUNTIME CSS VARIABLE INJECTION (TAILWIND-COMPATIBLE)

### Philosophy: CSS Variables → Tailwind Classes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ADMIN THEMING ARCHITECTURE (TAILWIND-ONLY)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Admin panel saves theme config to database                              │
│                                                                             │
│  2. Server fetches theme and generates CSS VARIABLES ONLY                   │
│     (No custom classes, no @apply, no inline styles)                        │
│                                                                             │
│  3. CSS variables are injected into :root                                   │
│     --primary: 210 100% 50%;  (HSL values for Tailwind)                    │
│     --radius: 0.5rem;                                                       │
│                                                                             │
│  4. Tailwind classes consume these variables                                │
│     bg-primary → hsl(var(--primary))                                       │
│     rounded-lg → var(--radius)                                              │
│                                                                             │
│  RESULT: Zero custom CSS, full admin customization                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Theme CSS Generator

```typescript
// packages/ui/src/theme/theme-generator.ts

import type { ThemeConfig, ColorScale } from "@voxpoll/shared/types"

/**
 * Generates CSS custom properties from theme config
 * These variables are consumed by Tailwind classes
 *
 * IMPORTANT: No custom CSS classes - only CSS variables!
 */
export function generateThemeCSS(config: ThemeConfig): string {
  const { colors, ui, darkMode } = config

  // Convert hex to HSL values for Tailwind compatibility
  const primaryHSL = hexToHSLValues(colors.primary[500])
  const accentHSL = hexToHSLValues(colors.accent)

  return `
:root {
  /* ═══════════════════════════════════════════════════════════════════════
     shadcn/ui REQUIRED VARIABLES (HSL values without hsl() wrapper)
     ═══════════════════════════════════════════════════════════════════════ */

  /* Light mode colors */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: ${primaryHSL};
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: ${accentHSL};
  --accent-foreground: 0 0% 98%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: ${primaryHSL};

  /* Primary color scale (for gradients, accents) */
  --primary-50: ${hexToHSLValues(colors.primary[50])};
  --primary-100: ${hexToHSLValues(colors.primary[100])};
  --primary-200: ${hexToHSLValues(colors.primary[200])};
  --primary-300: ${hexToHSLValues(colors.primary[300])};
  --primary-400: ${hexToHSLValues(colors.primary[400])};
  --primary-500: ${hexToHSLValues(colors.primary[500])};
  --primary-600: ${hexToHSLValues(colors.primary[600])};
  --primary-700: ${hexToHSLValues(colors.primary[700])};
  --primary-800: ${hexToHSLValues(colors.primary[800])};
  --primary-900: ${hexToHSLValues(colors.primary[900])};
  --primary-950: ${hexToHSLValues(colors.primary[950])};

  /* Accent colors */
  --accent-violet: 258 90% 66%;
  --accent-pink: 330 81% 60%;
  --accent-orange: 25 95% 53%;
  --accent-emerald: 160 84% 39%;
  --accent-cyan: 189 94% 43%;

  /* UI Configuration */
  --radius: ${getRadiusValue(ui.borderRadius)};

  /* Font families */
  --font-sans: "${ui.fontSans}", ui-sans-serif, system-ui, sans-serif;
  --font-display: "${ui.fontDisplay}", var(--font-sans);
  --font-mono: ui-monospace, monospace;
}

${darkMode.enabled ? `
.dark {
  --background: ${hexToHSLValues(darkMode.background)};
  --foreground: 0 0% 98%;
  --card: ${hexToHSLValues(darkMode.cardBackground)};
  --card-foreground: 0 0% 98%;
  --popover: ${hexToHSLValues(darkMode.cardBackground)};
  --popover-foreground: 0 0% 98%;
  --primary: ${primaryHSL};
  --primary-foreground: 0 0% 9%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: ${accentHSL};
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: ${primaryHSL};
}
` : ""}
`.trim()
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function hexToHSLValues(hex: string): string {
  // Convert hex to HSL and return "H S% L%" format for Tailwind
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return "0 0% 0%"

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

function getRadiusValue(radius: string): string {
  const map: Record<string, string> = {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px"
  }
  return map[radius] || "0.5rem"
}
```

### Theme Provider (Uses shadcn Tailwind Classes Only)

```typescript
// packages/ui/src/providers/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeConfig } from "@voxpoll/shared/types"

interface VoxPollThemeProviderProps {
  children: React.ReactNode
  themeConfig: ThemeConfig
}

export function VoxPollThemeProvider({
  children,
  themeConfig
}: VoxPollThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={themeConfig.darkMode.default}
      enableSystem={themeConfig.darkMode.default === "system"}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

### Layout Integration (Pure Tailwind)

```typescript
// apps/web/app/layout.tsx

import { getActiveTheme } from "@/lib/theme"
import { generateThemeCSS } from "@voxpoll/ui/theme"
import { VoxPollThemeProvider } from "@voxpoll/ui/providers"
import { BackgroundPattern } from "@voxpoll/ui/components"
import { cn } from "@voxpoll/ui/utils"

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  // Fetch active theme from database (cached)
  const themeConfig = await getActiveTheme()
  const themeCss = generateThemeCSS(themeConfig)

  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={themeConfig.darkMode.default === "dark" ? "dark" : ""}
    >
      <head>
        {/* Inject CSS variables (consumed by Tailwind classes) */}
        <style id="voxpoll-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        // Animation level via Tailwind motion utilities
        themeConfig.animations.level === "none" && "motion-reduce:*",
      )}>
        <VoxPollThemeProvider themeConfig={themeConfig}>
          {/* Background pattern using Tailwind classes */}
          <BackgroundPattern
            pattern={themeConfig.background.pattern}
            opacity={themeConfig.background.opacity > 0.5 ? "medium" : "subtle"}
          />

          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </VoxPollThemeProvider>
      </body>
    </html>
  )
}
```

### Theme Context Hook

```typescript
// packages/ui/src/hooks/use-theme-config.ts
"use client"

import * as React from "react"
import type { ThemeConfig } from "@voxpoll/shared/types"

const ThemeConfigContext = React.createContext<ThemeConfig | null>(null)

export function ThemeConfigProvider({
  children,
  config
}: {
  children: React.ReactNode
  config: ThemeConfig
}) {
  return (
    <ThemeConfigContext.Provider value={config}>
      {children}
    </ThemeConfigContext.Provider>
  )
}

export function useThemeConfig(): ThemeConfig {
  const context = React.useContext(ThemeConfigContext)
  if (!context) {
    throw new Error("useThemeConfig must be used within ThemeConfigProvider")
  }
  return context
}

// Convenience hooks for specific settings
export function useBlurIntensity() {
  const config = useThemeConfig()
  // Returns Tailwind class names
  const blurClasses = {
    light: "backdrop-blur-sm",
    medium: "backdrop-blur",
    heavy: "backdrop-blur-md"
  }
  return config.effects.glassmorphism
    ? blurClasses[config.effects.blurIntensity]
    : ""
}

export function useAnimationLevel() {
  const config = useThemeConfig()
  // Returns conditional animation class
  if (config.animations.level === "none") {
    return "motion-reduce:transition-none motion-reduce:animate-none"
  }
  return ""
}
```


## 8.3 ADMIN THEME EDITOR UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN THEME EDITOR - FULL UI                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  Theme Editor                    [Reset] [Save Draft] [🔴 Publish]  │   │
│  │                                                                      │   │
│  │  ═════════════════════════════════════════════════════════════════  │   │
│  │                                                                      │   │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                  │   │
│  │  │ Brand │ │Colors │ │  UI   │ │Effects│ │Preview│                  │   │
│  │  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘                  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────┐ ┌───────────────────────────────────────┐   │
│  │                            │ │                                       │   │
│  │  BRAND TAB                 │ │  LIVE PREVIEW                         │   │
│  │  ═════════                 │ │  ════════════                         │   │
│  │                            │ │                                       │   │
│  │  Logo (Light Mode)         │ │  ┌─────────────────────────────────┐ │   │
│  │  ┌──────────────────────┐  │ │  │  [Light Mode Preview]           │ │   │
│  │  │  [📷 Upload]         │  │ │  │                                  │ │   │
│  │  │  or drag & drop      │  │ │  │  ┌───────────────────────────┐  │ │   │
│  │  │  PNG, SVG max 500KB  │  │ │  │  │ Logo  [Nav]        [🔔][👤]│  │ │   │
│  │  └──────────────────────┘  │ │  │  └───────────────────────────┘  │ │   │
│  │                            │ │  │                                  │ │   │
│  │  Logo (Dark Mode)          │ │  │  Sample Poll Card               │ │   │
│  │  ┌──────────────────────┐  │ │  │  ┌───────────────────────────┐  │ │   │
│  │  │  [📷 Upload]         │  │ │  │  │ "Which is better?"        │  │ │   │
│  │  └──────────────────────┘  │ │  │  │                            │  │ │   │
│  │                            │ │  │  │  ○ Option A                │  │ │   │
│  │  Favicon                   │ │  │  │  ● Option B  ← Primary     │  │ │   │
│  │  ┌──────────────────────┐  │ │  │  │                            │  │ │   │
│  │  │  [🖼️] 32x32 or 64x64  │  │ │  │  │  [Vote] ← Accent          │  │ │   │
│  │  └──────────────────────┘  │ │  │  └───────────────────────────┘  │ │   │
│  │                            │ │  │                                  │ │   │
│  │  ─────────────────────────│ │  │  Sample Buttons                  │ │   │
│  │                            │ │  │  [Primary] [Secondary] [Ghost]  │ │   │
│  │  White Label               │ │  │                                  │ │   │
│  │  ☐ Hide VoxPoll branding   │ │  │  Glass Card Preview             │ │   │
│  │                            │ │  │  ┌───────────────────────────┐  │ │   │
│  │  Custom Footer:            │ │  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░ │  │ │   │
│  │  ┌──────────────────────┐  │ │  │  │ ░░░ Glassmorphism ░░░░░░ │  │ │   │
│  │  │ © 2026 Your Company  │  │ │  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░ │  │ │   │
│  │  └──────────────────────┘  │ │  │  └───────────────────────────┘  │ │   │
│  │                            │ │  │                                  │ │   │
│  └───────────────────────────┘ │  └─────────────────────────────────┘ │   │
│                                │                                       │   │
│  ┌───────────────────────────┐ │  ┌─────────────────────────────────┐ │   │
│  │                            │ │  │  [Dark Mode Preview]            │ │   │
│  │  COLORS TAB                │ │  │                                  │ │   │
│  │  ══════════                │ │  │  [Same components, dark theme]  │ │   │
│  │                            │ │  │                                  │ │   │
│  │  Primary Color             │ │  └─────────────────────────────────┘ │   │
│  │  ┌────────────────────┐    │ │                                       │   │
│  │  │ [██] #0c8ce9       │    │ │  ┌─────────────────────────────────┐ │   │
│  │  └────────────────────┘    │ │  │  [Toggle: Light | Dark | Side]  │ │   │
│  │                            │ │  └─────────────────────────────────┘ │   │
│  │  ☑ Auto-generate scale     │ │                                       │   │
│  │                            │ └───────────────────────────────────────┘   │
│  │  Color Scale Preview:      │                                             │
│  │  [50][100][200]...[950]    │                                             │
│  │                            │                                             │
│  │  Accent Color              │                                             │
│  │  ┌────────────────────┐    │                                             │
│  │  │ [██] #8b5cf6       │    │                                             │
│  │  └────────────────────┘    │                                             │
│  │                            │                                             │
│  └───────────────────────────┘                                              │
│                                                                             │
│  ┌───────────────────────────┐                                              │
│  │                            │                                             │
│  │  EFFECTS TAB               │                                             │
│  │  ═══════════               │                                             │
│  │                            │                                             │
│  │  Background Pattern        │                                             │
│  │  ┌────────────────────┐    │                                             │
│  │  │ ○ None             │    │                                             │
│  │  │ ● Grid   [Preview] │    │                                             │
│  │  │ ○ Dots   [Preview] │    │                                             │
│  │  │ ○ Diagonal         │    │                                             │
│  │  │ ○ Mesh Gradient    │    │                                             │
│  │  │ ○ Radial Glow      │    │                                             │
│  │  └────────────────────┘    │                                             │
│  │                            │                                             │
│  │  Pattern Opacity           │                                             │
│  │  ═══════○═══════════ 50%   │                                             │
│  │                            │                                             │
│  │  ─────────────────────     │                                             │
│  │                            │                                             │
│  │  Visual Effects            │                                             │
│  │  ☑ Glassmorphism (blur)    │                                             │
│  │  ☑ Glow effects            │                                             │
│  │  ☐ Film grain texture      │                                             │
│  │                            │                                             │
│  │  Blur Intensity            │                                             │
│  │  ○ Light (4px) - Mobile    │                                             │
│  │  ● Medium (8px) - Default  │                                             │
│  │  ○ Heavy (12px) - Desktop  │                                             │
│  │                            │                                             │
│  │  ─────────────────────     │                                             │
│  │                            │                                             │
│  │  Animation Level           │                                             │
│  │  ○ None (accessibility)    │                                             │
│  │  ○ Reduced                 │                                             │
│  │  ● Normal                  │                                             │
│  │  ○ Playful (extra bounce)  │                                             │
│  │                            │                                             │
│  └───────────────────────────┘                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 8.4 COLOR SCALE AUTO-GENERATION

```typescript
// packages/ui/src/theme/color-generator.ts

import Color from "colorjs.io"  // Modern color library

/**
 * Generate a full color scale from a single primary color
 * Uses OKLCH color space for perceptually uniform gradients
 */
export function generateColorScale(primaryHex: string): ColorScale {
  const primary = new Color(primaryHex)
  const oklch = primary.to("oklch")

  // Base lightness for 500 shade
  const baseLightness = oklch.coords[0]
  const baseChroma = oklch.coords[1]
  const hue = oklch.coords[2]

  // Lightness values for each shade (hand-tuned for aesthetics)
  const lightnessMap = {
    50: 0.97,
    100: 0.93,
    200: 0.86,
    300: 0.76,
    400: 0.64,
    500: baseLightness,  // Keep original
    600: baseLightness - 0.1,
    700: baseLightness - 0.2,
    800: baseLightness - 0.3,
    900: baseLightness - 0.4,
    950: baseLightness - 0.48
  }

  // Chroma adjustments (more saturated in middle, desaturated at extremes)
  const chromaMultiplier = {
    50: 0.3,
    100: 0.5,
    200: 0.7,
    300: 0.85,
    400: 0.95,
    500: 1,
    600: 1,
    700: 0.95,
    800: 0.85,
    900: 0.75,
    950: 0.65
  }

  const scale: ColorScale = {} as ColorScale

  for (const [shade, lightness] of Object.entries(lightnessMap)) {
    const color = new Color("oklch", [
      lightness,
      baseChroma * chromaMultiplier[shade],
      hue
    ])
    scale[shade as keyof ColorScale] = color.to("srgb").toString({ format: "hex" })
  }

  return scale
}

// Validate contrast ratios
export function validateAccessibility(scale: ColorScale): {
  issues: string[]
  passes: boolean
} {
  const issues: string[] = []

  // Check 500 on white (4.5:1 minimum)
  const contrastOnWhite = getContrastRatio(scale[500], "#ffffff")
  if (contrastOnWhite < 4.5) {
    issues.push(`Primary 500 on white: ${contrastOnWhite.toFixed(2)} (needs 4.5)`)
  }

  // Check 400 on dark (4.5:1 minimum)
  const contrastOnDark = getContrastRatio(scale[400], "#0a0a0b")
  if (contrastOnDark < 4.5) {
    issues.push(`Primary 400 on dark: ${contrastOnDark.toFixed(2)} (needs 4.5)`)
  }

  return {
    issues,
    passes: issues.length === 0
  }
}

function getContrastRatio(color1: string, color2: string): number {
  const c1 = new Color(color1)
  const c2 = new Color(color2)
  return c1.contrast(c2, "WCAG21")
}
```



# ══════════════════════════════════════════════════════════════════════════════
# PART 9: SHARED PACKAGES ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════


## 9.1 MONOREPO PACKAGE STRUCTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VOXPOLL MONOREPO STRUCTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  packages/                                                                  │
│  ├── @voxpoll/ui              ← SHARED UI COMPONENTS                       │
│  │   ├── src/                                                              │
│  │   │   ├── components/                                                   │
│  │   │   │   ├── ui/          ← shadcn/ui base components                  │
│  │   │   │   └── voxpoll/     ← VoxPoll-specific components                │
│  │   │   ├── hooks/           ← Shared React hooks                         │
│  │   │   ├── theme/           ← Theme injection utilities                  │
│  │   │   └── utils/           ← cn(), formatters                           │
│  │   ├── tailwind.config.ts   ← Shared Tailwind config                     │
│  │   └── package.json                                                      │
│  │                                                                          │
│  ├── @voxpoll/shared          ← SHARED TYPES & CONSTANTS                   │
│  │   ├── src/                                                              │
│  │   │   ├── types/           ← TypeScript types                           │
│  │   │   │   ├── index.ts                                                  │
│  │   │   │   ├── theme.types.ts   ← Theme configuration types              │
│  │   │   │   ├── poll.types.ts                                             │
│  │   │   │   └── user.types.ts                                             │
│  │   │   ├── constants/       ← Shared constants                           │
│  │   │   └── utils/           ← Pure utility functions                     │
│  │   └── package.json                                                      │
│  │                                                                          │
│  ├── @voxpoll/validators      ← ZOD SCHEMAS                                │
│  │   └── Used by: API, Web, Mobile                                         │
│  │                                                                          │
│  ├── @voxpoll/config          ← SHARED CONFIGS                             │
│  │   ├── eslint/                                                           │
│  │   ├── tailwind/            ← Base Tailwind preset                       │
│  │   └── typescript/                                                       │
│  │                                                                          │
│  └── @voxpoll/database        ← DRIZZLE ORM + POSTGRES                     │
│      └── Used by: API, Actions                                             │
│                                                                             │
│  apps/                                                                      │
│  ├── web/                     ← NEXT.JS WEB APP                            │
│  │   └── Uses: @voxpoll/ui, shared, validators, config                     │
│  │                                                                          │
│  ├── mobile/                  ← REACT NATIVE APP                           │
│  │   └── Uses: @voxpoll/shared, validators (UI via NativeWind)             │
│  │                                                                          │
│  └── platform/                ← ADMIN DASHBOARD                            │
│      └── Uses: @voxpoll/ui, shared, validators, database                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 9.2 CROSS-PLATFORM COMPONENT SHARING

```typescript
// ══════════════════════════════════════════════════════════════════════════
// COMPONENT SHARING STRATEGY
// ══════════════════════════════════════════════════════════════════════════

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SHARING MATRIX BY COMPONENT TYPE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  COMPONENT              │ Web        │ Mobile     │ Platform   │ APPROACH   │
│  ───────────────────────┼────────────┼────────────┼────────────┼────────────│
│  Types & Interfaces     │ ✅ Share   │ ✅ Share   │ ✅ Share   │ @shared    │
│  Validation Schemas     │ ✅ Share   │ ✅ Share   │ ✅ Share   │ @validators│
│  Theme Tokens (CSS Var) │ ✅ Share   │ ⚙️ Convert │ ✅ Share   │ @config    │
│  Utility Functions      │ ✅ Share   │ ✅ Share   │ ✅ Share   │ @shared    │
│  React Hooks            │ ✅ Share   │ ⚙️ Adapt   │ ✅ Share   │ @ui/hooks  │
│  UI Components          │ ✅ @ui     │ ❌ Rewrite │ ✅ @ui     │ Platform   │
│  Business Logic         │ ✅ Share   │ ✅ Share   │ ✅ Share   │ @actions   │
│                                                                             │
│  Legend: ✅ Direct share  ⚙️ Needs adaptation  ❌ Platform-specific        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
*/

// Theme Token Sharing: Web & Mobile

// packages/config/tailwind/theme-tokens.ts
export const themeTokens = {
  colors: {
    primary: {
      50: "var(--vox-primary-50)",
      // ... (CSS variables for web)
    }
  },
  spacing: {
    // Shared spacing scale
  }
}

// For React Native, convert to StyleSheet values
// packages/shared/src/utils/theme-to-native.ts
export function convertThemeToNative(webTheme: typeof themeTokens) {
  return {
    colors: {
      primary50: "#f0f7ff",  // Resolved values for RN
      primary500: "#0c8ce9",
      // ...
    }
  }
}
```


## 9.3 THEME TOKEN SHARING

```typescript
// packages/config/tailwind/preset.ts

import type { Config } from "tailwindcss"

export const voxpollPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // All colors reference CSS variables (admin-configurable)
        vox: {
          primary: {
            50: "var(--vox-primary-50)",
            100: "var(--vox-primary-100)",
            200: "var(--vox-primary-200)",
            300: "var(--vox-primary-300)",
            400: "var(--vox-primary-400)",
            500: "var(--vox-primary-500)",
            600: "var(--vox-primary-600)",
            700: "var(--vox-primary-700)",
            800: "var(--vox-primary-800)",
            900: "var(--vox-primary-900)",
            950: "var(--vox-primary-950)",
          },
          accent: "var(--vox-accent)",
          background: "var(--vox-background)",
          foreground: "var(--vox-foreground)",
          card: "var(--vox-card)",
          border: "var(--vox-border)",
          muted: "var(--vox-muted)",
        }
      },
      borderRadius: {
        // Admin-configurable radius
        DEFAULT: "var(--radius)",
        sm: "calc(var(--radius) * 0.5)",
        md: "var(--radius)",
        lg: "calc(var(--radius) * 1.5)",
        xl: "calc(var(--radius) * 2)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
      },
      animation: {
        // Duration scales with admin setting
        "fade-in": "fadeIn calc(300ms * var(--animation-duration-multiplier)) ease-out",
        "slide-up": "slideUp calc(400ms * var(--animation-duration-multiplier)) ease-out",
        "scale-in": "scaleIn calc(200ms * var(--animation-duration-multiplier)) ease-out",
      }
    }
  }
}

// Usage in apps
// apps/web/tailwind.config.ts
import { voxpollPreset } from "@voxpoll/config/tailwind"

export default {
  presets: [voxpollPreset],
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ]
}
```



# ══════════════════════════════════════════════════════════════════════════════
# PART 10: PAGE-BY-PAGE ENDPOINT MAPPING & USER FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 10.1 OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              PAGE → ENDPOINT MAPPING CONVENTIONS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📋 FORMAT:                                                                 │
│  ───────────                                                                │
│  [Page Route]                                                               │
│  ├─ Initial Load: Endpoints called on page load (Server Components)        │
│  ├─ User Actions: Endpoints called on user interaction (Client)            │
│  ├─ Real-time: WebSocket subscriptions                                     │
│  └─ Components: UI components used                                         │
│                                                                             │
│  🔒 AUTH SYMBOLS:                                                           │
│  ─────────────────                                                          │
│  🔓 Public - No auth required                                              │
│  🔐 Auth Required - Bearer token                                           │
│  👤 Optional Auth - Enhanced if logged in                                  │
│  🏢 Org Context - Organization membership required                         │
│  🛡️ Admin - Platform admin role required                                   │
│                                                                             │
│  ⚡ DATA FETCHING STRATEGY:                                                 │
│  ────────────────────────────                                               │
│  • Server Components: Initial data, SEO-critical content                   │
│  • Client Components: Interactive data, mutations, real-time               │
│  • React Query: Client-side caching, optimistic updates                    │
│  • WebSocket: Live data subscriptions                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 10.2 PUBLIC PAGES (No Auth Required)

### / (Landing Page)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE - app/(public)/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /
// Auth: 🔓 Public
// Purpose: Convert visitors to users

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL LOAD (Server Component)
// ─────────────────────────────────────────────────────────────────────────────
async function LandingPage() {
  // Fetch trending polls for social proof
  const trending = await fetch("/api/v1/polls?sort=trending&limit=3")

  // Fetch platform stats (cached, revalidate: 3600)
  const stats = await fetch("/api/v1/stats/public")

  // Fetch featured tests
  const tests = await fetch("/api/v1/tests/personality?featured=true&limit=3")

  return <LandingPageClient data={{ trending, stats, tests }} />
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Initial Load                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/polls?sort=trending&limit=3          │ Trending polls showcase   │
│ GET /api/v1/stats/public                         │ Platform statistics       │
│ GET /api/v1/tests/personality?featured=true      │ Featured personality tests│
└──────────────────────────────────────────────────────────────────────────────┘
*/

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
/*
• HeroSection - Kinetic typography, CTA buttons
• BentoGrid - Feature showcase
• TrendingPollsCarousel - Mini poll cards
• TestimonialSection - Social proof
• CTASection - Final conversion push
• BackgroundPattern - pattern="mesh" opacity="subtle"
*/
```

### /login

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// LOGIN PAGE - app/(auth)/login/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /login
// Auth: 🔓 Public (redirects if already logged in)
// Purpose: User authentication

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIONS (Client Component)
// ─────────────────────────────────────────────────────────────────────────────

// Action: Email/Password Login
const handleLogin = async (data: LoginForm) => {
  // POST /api/v1/auth/login
  // Body: { email, password }
  // Rate Limit: 5/15min
  // Response: { user, session: { token, refreshToken, expiresAt }}
}

// Action: OAuth Login (Google/Apple)
const handleOAuthLogin = (provider: "google" | "apple") => {
  // GET /api/v1/auth/oauth/{provider}/initiate
  // Redirects to OAuth provider
  // Callback: GET /api/v1/auth/oauth/{provider}/callback
}

// Action: Forgot Password
const handleForgotPassword = async (email: string) => {
  // POST /api/v1/auth/forgot-password
  // Body: { email }
  // Rate Limit: 3/hour
  // Always returns 200 (security)
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ User Actions                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST /api/v1/auth/login                          │ Email/password login      │
│ GET  /api/v1/auth/oauth/google/initiate          │ Start Google OAuth        │
│ GET  /api/v1/auth/oauth/apple/initiate           │ Start Apple OAuth         │
│ POST /api/v1/auth/forgot-password                │ Request password reset    │
│ POST /api/v1/auth/refresh                        │ Refresh expired token     │
└──────────────────────────────────────────────────────────────────────────────┘
*/

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
/*
• LoginForm - shadcn Form + Input + Button
• OAuthButtons - Google, Apple sign-in buttons
• Divider - "or continue with"
• Alert - Error messages
• Link - Forgot password, Register
*/

// ─────────────────────────────────────────────────────────────────────────────
// USER FLOW
// ─────────────────────────────────────────────────────────────────────────────
/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User enters email + password                                            │
│     └─> Client validation (zod)                                            │
│                                                                             │
│  2. Submit form                                                             │
│     └─> POST /api/v1/auth/login                                            │
│                                                                             │
│  3a. SUCCESS                                                                │
│      ├─> Store tokens (httpOnly cookie + memory)                           │
│      ├─> GET /api/v1/auth/me (fetch user data)                            │
│      └─> Redirect to /feed                                                 │
│                                                                             │
│  3b. FAILURE (401)                                                          │
│      └─> Show error: "Invalid email or password"                           │
│                                                                             │
│  3c. FAILURE (429)                                                          │
│      └─> Show error: "Too many attempts. Try again in X minutes"           │
│                                                                             │
│  3d. FAILURE (403 - Email not verified)                                     │
│      └─> Show: "Please verify your email"                                  │
│      └─> Button: "Resend verification email"                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
*/
```

### /register

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// REGISTER PAGE - app/(auth)/register/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /register
// Auth: 🔓 Public
// Purpose: New user registration

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

// Action: Register with email
const handleRegister = async (data: RegisterForm) => {
  // POST /api/v1/auth/register
  // Body: { email, password, username, displayName?, acceptTerms }
  // Rate Limit: 3/hour
  // Response: { user (status: PENDING_VERIFICATION) }
}

// Action: Check username availability
const checkUsername = async (username: string) => {
  // GET /api/v1/users/check-username?username={username}
  // Debounced: 300ms
  // Response: { available: boolean }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ User Actions                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST /api/v1/auth/register                       │ Create account            │
│ GET  /api/v1/users/check-username                │ Username availability     │
│ GET  /api/v1/auth/oauth/google/initiate          │ Google signup             │
│ GET  /api/v1/auth/oauth/apple/initiate           │ Apple signup              │
└──────────────────────────────────────────────────────────────────────────────┘
*/

// ─────────────────────────────────────────────────────────────────────────────
// USER FLOW
// ─────────────────────────────────────────────────────────────────────────────
/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REGISTRATION FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User fills registration form                                            │
│     ├─> Email validation (format + not taken)                              │
│     ├─> Username validation (format + availability check)                   │
│     ├─> Password validation (min 8, complexity)                            │
│     └─> Terms acceptance checkbox                                          │
│                                                                             │
│  2. Submit form                                                             │
│     └─> POST /api/v1/auth/register                                         │
│                                                                             │
│  3a. SUCCESS                                                                │
│      ├─> Show "Check your email" screen                                    │
│      └─> Auto-login with restricted access                                 │
│                                                                             │
│  3b. FAILURE (409 - Email exists)                                           │
│      └─> Show error: "Email already registered"                            │
│      └─> Link to login page                                                │
│                                                                             │
│  3c. FAILURE (429)                                                          │
│      └─> Show error: "Too many attempts"                                   │
│                                                                             │
│  4. User clicks verification link                                           │
│     └─> GET /api/v1/auth/verify-email?token={token}                       │
│     └─> Redirect to /verify-phone (Level 0 → 1)                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
*/
```

### /p/:contentId (Public Poll/Test View)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC CONTENT VIEW - app/(public)/p/[contentId]/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /p/:contentId
// Auth: 👤 Optional (enhanced if logged in)
// Purpose: View and interact with poll/test

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL LOAD (Server Component)
// ─────────────────────────────────────────────────────────────────────────────
async function ContentPage({ params }: { params: { contentId: string }}) {
  // Fetch poll details (public endpoint)
  const poll = await fetch(`/api/v1/polls/${params.contentId}`)

  // Fetch comments (top-level, first page)
  const comments = await fetch(
    `/api/v1/polls/${params.contentId}/comments?sort=best&limit=20`
  )

  // If auth cookie exists, check vote status
  const myVote = auth ? await fetch(`/api/v1/polls/${params.contentId}/my-vote`) : null

  return <PollView poll={poll} comments={comments} myVote={myVote} />
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIONS (Client Component)
// ─────────────────────────────────────────────────────────────────────────────

// Action: Vote on poll
const handleVote = async (optionId: string) => {
  // POST /api/v1/polls/:id/vote
  // Body: { optionId }
  // Auth: 🔐 Required
  // Rate Limit: 100/hour

  // Optimistic update UI
  // On success: Trigger PULSE animation (if enabled)
  // On error: Revert optimistic update
}

// Action: Retract vote (if allowed)
const handleRetractVote = async () => {
  // DELETE /api/v1/polls/:id/vote
  // Auth: 🔐 Required
  // Pre-condition: poll.allowVoteRetraction === true
}

// Action: Add comment
const handleAddComment = async (content: string, parentId?: string) => {
  // POST /api/v1/polls/:id/comments
  // Body: { content, parentId? }
  // Auth: 🔐 Required + hasVoted (Free tier)
  // Rate Limit: 50/hour
}

// Action: Vote on comment
const handleCommentVote = async (commentId: string, direction: "up" | "down") => {
  // POST /api/v1/comments/:id/vote
  // Body: { direction }
  // Auth: 🔐 Required
}

// Action: Load more comments
const loadMoreComments = async (page: number) => {
  // GET /api/v1/polls/:id/comments?page={page}&sort={sort}
}

// Action: Share poll
const handleShare = async () => {
  // POST /api/v1/polls/:id/share
  // Returns: { shareCode, shareUrl }
}

// Action: Report poll
const handleReport = async (reason: string, details?: string) => {
  // POST /api/v1/polls/:id/report
  // Body: { reason, details }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Initial Load (Server)                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/polls/:id                            │ Poll details + options    │
│ GET /api/v1/polls/:id/comments?sort=best         │ Top comments              │
│ GET /api/v1/polls/:id/my-vote                    │ User's vote (if auth)     │
│ GET /api/v1/polls/:id/results                    │ Results (if allowed)      │
├──────────────────────────────────────────────────────────────────────────────┤
│ User Actions (Client)                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST   /api/v1/polls/:id/vote                    │ Submit vote               │
│ DELETE /api/v1/polls/:id/vote                    │ Retract vote              │
│ POST   /api/v1/polls/:id/comments                │ Add comment               │
│ POST   /api/v1/comments/:id/vote                 │ Vote on comment           │
│ PUT    /api/v1/comments/:id                      │ Edit own comment          │
│ DELETE /api/v1/comments/:id                      │ Delete own comment        │
│ POST   /api/v1/polls/:id/share                   │ Generate share link       │
│ POST   /api/v1/polls/:id/report                  │ Report poll               │
│ POST   /api/v1/comments/:id/report               │ Report comment            │
└──────────────────────────────────────────────────────────────────────────────┘
*/

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
/*
• PollHeader - Title, creator info, stats
• PollOptions / PollOptionResult - Voting interface
• PollStats - Vote count, time remaining
• ReliabilityBadge - Trust score indicator
• CommentThread - Nested comments
• CommentComposer - New comment form
• ShareDialog - Share options (copy link, social)
• ReportDialog - Report form
• PulseAnimation - Post-vote celebration (optional)
*/

// ─────────────────────────────────────────────────────────────────────────────
// USER FLOW: VOTING
// ─────────────────────────────────────────────────────────────────────────────
/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VOTING FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User views poll                                                         │
│     ├─> If NOT logged in: Show options with "Login to vote" overlay        │
│     └─> If logged in: Show votable options                                 │
│                                                                             │
│  2. User selects option                                                     │
│     └─> Optimistic UI update (selection highlight)                         │
│                                                                             │
│  3. User clicks "Vote" button                                               │
│     └─> POST /api/v1/polls/:id/vote                                        │
│                                                                             │
│  4a. SUCCESS                                                                │
│      ├─> Hide voting interface                                             │
│      ├─> Show PULSE animation (if poll.showPulse = true)                   │
│      ├─> GET /api/v1/polls/:id/results                                    │
│      ├─> Show results with user's selection highlighted                    │
│      └─> Enable comment composer                                           │
│                                                                             │
│  4b. FAILURE (409 - Already voted)                                          │
│      └─> Show current vote, fetch results                                  │
│                                                                             │
│  4c. FAILURE (403 - Poll closed)                                            │
│      └─> Show "This poll has ended"                                        │
│                                                                             │
│  4d. FAILURE (401 - Not authenticated)                                      │
│      └─> Redirect to /login?redirect=/p/:contentId                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
*/
```

### /u/:username (Public Profile)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC PROFILE - app/(public)/u/[username]/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /u/:username
// Auth: 👤 Optional
// Purpose: View user's public profile

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL LOAD
// ─────────────────────────────────────────────────────────────────────────────
async function ProfilePage({ params }: { params: { username: string }}) {
  // GET /api/v1/users/:username
  // Response includes: isFollowing (if auth), isBlocked, stats

  // GET /api/v1/users/:username/polls?limit=10
  // GET /api/v1/users/:username/badges?visible=true
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

// Action: Follow/Unfollow
const handleFollow = async () => {
  // POST /api/v1/users/:username/follow (to follow)
  // DELETE /api/v1/users/:username/follow (to unfollow)
}

// Action: Block user
const handleBlock = async () => {
  // POST /api/v1/users/:username/block
}

// Action: Send DM
const handleSendDM = async () => {
  // Navigate to /messages?to={username}
}

// Action: Report user
const handleReport = async (reason: string) => {
  // POST /api/v1/users/:username/report
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Initial Load                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/users/:username                      │ Profile info              │
│ GET /api/v1/users/:username/polls                │ User's public polls       │
│ GET /api/v1/users/:username/badges               │ Public badges             │
│ GET /api/v1/users/:username/followers            │ Followers list            │
│ GET /api/v1/users/:username/following            │ Following list            │
├──────────────────────────────────────────────────────────────────────────────┤
│ User Actions                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST   /api/v1/users/:username/follow            │ Follow user               │
│ DELETE /api/v1/users/:username/follow            │ Unfollow user             │
│ POST   /api/v1/users/:username/block             │ Block user                │
│ POST   /api/v1/users/:username/report            │ Report user               │
└──────────────────────────────────────────────────────────────────────────────┘
*/
```

### /live/:joinCode (Live Poll Join)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// LIVE POLL JOIN - app/(public)/live/[joinCode]/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /live/:joinCode
// Auth: 🔓 Public (no auth required to participate)
// Purpose: Join live poll session

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL LOAD
// ─────────────────────────────────────────────────────────────────────────────
async function LivePollJoin({ params }: { params: { joinCode: string }}) {
  // GET /api/v1/live/join/:code
  // Returns: Live poll data + temporary participant token
  // Creates device fingerprint for duplicate prevention
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME CONNECTION
// ─────────────────────────────────────────────────────────────────────────────
const connectToLivePoll = (sessionId: string) => {
  // WebSocket: ws://api.voxpoll.com/live/{sessionId}
  // Events:
  //   - question: New question displayed
  //   - vote: Vote count update
  //   - results: Show results for current question
  //   - pause: Host paused session
  //   - resume: Host resumed session
  //   - end: Session ended
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

// Action: Vote (no auth required)
const handleVote = async (optionId: string) => {
  // POST /api/v1/live/:id/vote
  // Headers: X-Participant-Token: {temp_token}
  // Body: { optionId }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Initial Load                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/live/join/:code                      │ Join live session         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Real-time                                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ WS  ws://api.voxpoll.com/live/{sessionId}        │ Live updates              │
├──────────────────────────────────────────────────────────────────────────────┤
│ User Actions                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST /api/v1/live/:id/vote                       │ Submit vote               │
└──────────────────────────────────────────────────────────────────────────────┘
*/

// ─────────────────────────────────────────────────────────────────────────────
// USER FLOW: LIVE POLL PARTICIPATION
// ─────────────────────────────────────────────────────────────────────────────
/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LIVE POLL PARTICIPATION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User enters 6-character code OR scans QR                                │
│     └─> GET /api/v1/live/join/:code                                        │
│                                                                             │
│  2. Server returns poll data + temp token                                   │
│     ├─> Device fingerprint created                                         │
│     └─> WebSocket connection established                                   │
│                                                                             │
│  3. User sees "Waiting for host..." or current question                    │
│                                                                             │
│  4. Host advances to question                                               │
│     └─> WS event: { type: "question", data: {...} }                       │
│     └─> UI shows question with timer                                       │
│                                                                             │
│  5. User votes                                                              │
│     └─> POST /api/v1/live/:id/vote                                        │
│     └─> WS broadcasts: { type: "vote", totalVotes: N }                    │
│                                                                             │
│  6. Timer ends OR host ends voting                                          │
│     └─> WS event: { type: "results", data: {...} }                        │
│     └─> UI shows results animation                                         │
│                                                                             │
│  7. Session ends                                                            │
│     └─> WS event: { type: "end" }                                         │
│     └─> Show "Create account to see history" prompt                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
*/
```


## 10.3 AUTHENTICATED PAGES

### /feed (Home Feed)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// HOME FEED - app/(authenticated)/feed/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /feed
// Auth: 🔐 Required
// Purpose: Personalized content feed

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL LOAD
// ─────────────────────────────────────────────────────────────────────────────
async function FeedPage() {
  // GET /api/v1/feed
  // Personalized algorithm-driven feed

  // GET /api/v1/notifications/unread-count
  // For notification badge
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

// Action: Switch feed tab
const switchFeed = (tab: "for-you" | "following" | "trending") => {
  // GET /api/v1/feed                   (for-you)
  // GET /api/v1/feed/following         (following)
  // GET /api/v1/feed/trending          (trending)
}

// Action: Infinite scroll
const loadMore = async (page: number) => {
  // GET /api/v1/feed?page={page}&limit=20
}

// Action: Quick vote from feed
const handleQuickVote = async (pollId: string, optionId: string) => {
  // POST /api/v1/polls/:id/vote
}

// Action: Save content
const handleSave = async (contentId: string) => {
  // POST /api/v1/users/me/saved
  // Body: { contentId, contentType }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Initial Load                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/feed                                 │ Personalized feed         │
│ GET /api/v1/notifications/unread-count           │ Notification badge        │
├──────────────────────────────────────────────────────────────────────────────┤
│ Tab Navigation                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/feed                                 │ For You tab               │
│ GET /api/v1/feed/following                       │ Following tab             │
│ GET /api/v1/feed/trending                        │ Trending tab              │
│ GET /api/v1/feed/discover                        │ Discover (sponsored)      │
├──────────────────────────────────────────────────────────────────────────────┤
│ User Actions                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST /api/v1/polls/:id/vote                      │ Quick vote                │
│ POST /api/v1/users/me/saved                      │ Save content              │
│ POST /api/v1/polls/:id/share                     │ Share content             │
└──────────────────────────────────────────────────────────────────────────────┘
*/

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
/*
• FeedTabs - For You / Following / Trending / Discover
• PollCard - Full poll display with quick vote
• TestCard - Personality test preview
• PersonalizationBadge - "Trending" / "From followed"
• InfiniteScrollTrigger - Load more on scroll
• EmptyFeed - No content state
• CreateButton - Floating action button
*/
```

### /create/poll (Poll Creator)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// POLL CREATOR - app/(authenticated)/create/poll/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /create/poll
// Auth: 🔐 Required (Level 1+)
// Purpose: Create new poll

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL LOAD
// ─────────────────────────────────────────────────────────────────────────────
async function CreatePollPage() {
  // GET /api/v1/categories
  // For category selection

  // GET /api/v1/auth/me
  // Check tier limits (polls remaining today)

  // GET /api/v1/users/me/drafts?type=poll
  // Load existing drafts (P-045)
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

// Action: Auto-save draft
const autoSaveDraft = async (draft: PollDraft) => {
  // PUT /api/v1/polls/:id (if existing draft)
  // POST /api/v1/polls (if new, status: DRAFT)
  // Debounced: 2000ms
}

// Action: Create/Publish poll
const handlePublish = async (poll: CreatePollInput) => {
  // POST /api/v1/polls
  // Body: { ...pollData, status: "ACTIVE" }

  // OR if from draft:
  // POST /api/v1/polls/:id/publish
}

// Action: Validate question
const validateQuestion = async (question: string) => {
  // POST /api/v1/polls/validate-question
  // Checks for prohibited content, similar existing polls
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Initial Load                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/categories                           │ Category list             │
│ GET /api/v1/auth/me                              │ Check tier/limits         │
│ GET /api/v1/users/me/drafts?type=poll            │ Existing drafts           │
│ GET /api/v1/tags/suggestions                     │ Tag autocomplete          │
├──────────────────────────────────────────────────────────────────────────────┤
│ User Actions                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST /api/v1/polls                               │ Create poll               │
│ PUT  /api/v1/polls/:id                           │ Save draft                │
│ POST /api/v1/polls/:id/publish                   │ Publish draft             │
│ POST /api/v1/polls/validate-question             │ Content validation        │
│ GET  /api/v1/search/tags?q=                      │ Tag search                │
└──────────────────────────────────────────────────────────────────────────────┘
*/

// ─────────────────────────────────────────────────────────────────────────────
// USER FLOW: POLL CREATION
// ─────────────────────────────────────────────────────────────────────────────
/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                      POLL CREATION FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User clicks "Create Poll"                                               │
│     └─> Check tier limits (GET /api/v1/auth/me)                            │
│                                                                             │
│  2a. LIMIT REACHED (Free: 3/day, Plus: 10/day)                              │
│      └─> Show upgrade prompt                                               │
│                                                                             │
│  2b. LIMIT OK                                                               │
│      └─> Show poll creation form                                           │
│                                                                             │
│  3. User types question                                                     │
│     └─> Auto-save draft (debounced 2s)                                     │
│     └─> POST /api/v1/polls (status: DRAFT)                                │
│                                                                             │
│  4. User adds options (2-4 for Free, 2-10 for Premium)                     │
│     └─> Validate min 2 options                                             │
│                                                                             │
│  5. User selects settings                                                   │
│     ├─> Category (required)                                                │
│     ├─> Tags (optional, max 5)                                             │
│     ├─> Visibility: PUBLIC / UNLISTED / FOLLOWERS_ONLY                    │
│     ├─> End date (optional)                                                │
│     ├─> Allow multiple votes (Plus+)                                       │
│     ├─> Show results before voting                                         │
│     └─> Allow comments                                                     │
│                                                                             │
│  6. User clicks "Publish"                                                   │
│     └─> POST /api/v1/polls/:id/publish                                    │
│                                                                             │
│  7. SUCCESS                                                                 │
│     └─> Redirect to /p/:newPollId                                         │
│     └─> Show share dialog                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
*/

// ─────────────────────────────────────────────────────────────────────────────
// TIER-BASED FEATURES
// ─────────────────────────────────────────────────────────────────────────────
/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                    POLL CREATION BY TIER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FREE                                                                       │
│  ├─ Max 3 polls/day                                                        │
│  ├─ 2-4 options only                                                       │
│  ├─ No multiple votes                                                      │
│  ├─ No pre-test                                                            │
│  └─ Basic analytics                                                        │
│                                                                             │
│  PLUS ($4.99/mo)                                                           │
│  ├─ Max 10 polls/day                                                       │
│  ├─ 2-6 options                                                            │
│  ├─ Multiple votes allowed                                                 │
│  ├─ No pre-test                                                            │
│  └─ Enhanced analytics                                                     │
│                                                                             │
│  PREMIUM ($9.99/mo)                                                        │
│  ├─ Unlimited polls                                                        │
│  ├─ 2-10 options                                                           │
│  ├─ Multiple votes allowed                                                 │
│  ├─ Pre-test support                                                       │
│  ├─ Live poll creation                                                     │
│  ├─ Demographic targeting                                                  │
│  └─ Advanced analytics + export                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
*/
```

### /my/content (My Content Dashboard)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// MY CONTENT - app/(authenticated)/my/content/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /my/content
// Auth: 🔐 Required
// Purpose: Manage created content

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL LOAD
// ─────────────────────────────────────────────────────────────────────────────
async function MyContentPage() {
  // GET /api/v1/users/me/polls
  // All polls including DRAFT, PRIVATE

  // GET /api/v1/users/me/tests
  // All created tests
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

// Action: Filter content
const filterContent = (status: string, type: string) => {
  // GET /api/v1/users/me/polls?status={status}&type={type}
}

// Action: Close poll
const handleClosePoll = async (pollId: string) => {
  // POST /api/v1/polls/:id/close
}

// Action: Archive poll
const handleArchivePoll = async (pollId: string) => {
  // POST /api/v1/polls/:id/archive
}

// Action: Delete poll
const handleDeletePoll = async (pollId: string) => {
  // DELETE /api/v1/polls/:id
  // Soft delete (30-day retention)
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Initial Load                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/users/me/polls                       │ My polls                  │
│ GET /api/v1/users/me/tests                       │ My tests                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Content Management                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ PUT    /api/v1/polls/:id                         │ Edit poll                 │
│ POST   /api/v1/polls/:id/publish                 │ Publish draft             │
│ POST   /api/v1/polls/:id/close                   │ Close voting              │
│ POST   /api/v1/polls/:id/archive                 │ Archive poll              │
│ POST   /api/v1/polls/:id/unarchive               │ Restore poll              │
│ DELETE /api/v1/polls/:id                         │ Delete poll               │
│ GET    /api/v1/polls/:id/analytics               │ View analytics            │
└──────────────────────────────────────────────────────────────────────────────┘
*/
```

### /settings (Settings Hub)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS - app/(authenticated)/settings/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /settings/*
// Auth: 🔐 Required
// Purpose: Account and app settings

// ─────────────────────────────────────────────────────────────────────────────
// SUB-PAGES & ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ /settings/profile                                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET   /api/v1/auth/me                            │ Load profile              │
│ PATCH /api/v1/users/me                           │ Update profile            │
│ POST  /api/v1/users/me/avatar                    │ Upload avatar             │
├──────────────────────────────────────────────────────────────────────────────┤
│ /settings/account                                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST /api/v1/auth/change-password                │ Change password           │
│ POST /api/v1/auth/change-email                   │ Request email change      │
│ GET  /api/v1/auth/sessions                       │ List sessions             │
│ DELETE /api/v1/auth/sessions/:id                 │ Revoke session            │
│ POST /api/v1/verification/2fa/enable             │ Enable 2FA                │
│ POST /api/v1/verification/2fa/disable            │ Disable 2FA               │
├──────────────────────────────────────────────────────────────────────────────┤
│ /settings/privacy                                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET  /api/v1/users/me/privacy                    │ Get privacy settings      │
│ PUT  /api/v1/users/me/privacy                    │ Update privacy            │
│ GET  /api/v1/users/me/blocked                    │ Blocked users list        │
│ DELETE /api/v1/users/:username/block             │ Unblock user              │
├──────────────────────────────────────────────────────────────────────────────┤
│ /settings/notifications                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/notifications/settings               │ Get preferences           │
│ PUT /api/v1/notifications/settings               │ Update preferences        │
├──────────────────────────────────────────────────────────────────────────────┤
│ /settings/subscription                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET  /api/v1/users/me/subscription               │ Current subscription      │
│ GET  /api/v1/subscription/plans                  │ Available plans           │
│ POST /api/v1/subscription/checkout               │ Start checkout            │
│ POST /api/v1/subscription/cancel                 │ Cancel subscription       │
│ GET  /api/v1/subscription/invoices               │ Billing history           │
├──────────────────────────────────────────────────────────────────────────────┤
│ /settings/data                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST /api/v1/users/me/export                     │ Request data export       │
│ DELETE /api/v1/users/me                          │ Delete account            │
└──────────────────────────────────────────────────────────────────────────────┘
*/
```


## 10.4 ORGANIZATION PAGES

### /org (Organization Dashboard)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION DASHBOARD - app/(org)/org/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /org
// Auth: 🏢 Organization member
// Purpose: Organization overview

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Initial Load                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/organizations/:slug                  │ Org details               │
│ GET /api/v1/organizations/:slug/surveys?limit=5  │ Recent surveys            │
│ GET /api/v1/organizations/:slug/members?limit=10 │ Team members              │
│ GET /api/v1/organizations/:slug/analytics/summary│ Quick stats               │
├──────────────────────────────────────────────────────────────────────────────┤
│ User Actions (Role-based)                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST /api/v1/organizations/:slug/surveys         │ Create survey (Creator+)  │
│ POST /api/v1/organizations/:slug/invite          │ Invite member (Admin+)    │
│ PUT  /api/v1/organizations/:slug/settings        │ Update settings (Admin+)  │
└──────────────────────────────────────────────────────────────────────────────┘
*/
```

### /org/surveys/new (Survey Builder)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// SURVEY BUILDER - app/(org)/org/surveys/new/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /org/surveys/new
// Auth: 🏢 Organization (Creator role+)
// Purpose: Create complex surveys

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Survey CRUD                                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST /api/v1/surveys                             │ Create survey             │
│ PUT  /api/v1/surveys/:id                         │ Update survey             │
│ POST /api/v1/surveys/:id/publish                 │ Publish survey            │
│ GET  /api/v1/surveys/:id/preview                 │ Preview survey            │
├──────────────────────────────────────────────────────────────────────────────┤
│ Survey Distribution                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ POST /api/v1/surveys/:id/invite                  │ Send invitations          │
│ POST /api/v1/surveys/:id/reminder                │ Send reminders            │
│ GET  /api/v1/surveys/:id/stats                   │ Completion stats          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Results                                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET  /api/v1/surveys/:id/results                 │ View results              │
│ GET  /api/v1/surveys/:id/results/export          │ Export results            │
│ GET  /api/v1/surveys/:id/responses               │ Individual responses      │
└──────────────────────────────────────────────────────────────────────────────┘
*/
```


## 10.5 ADMIN PAGES

### /admin (Admin Dashboard)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD - app/(admin)/admin/page.tsx
// ═══════════════════════════════════════════════════════════════════════════

// Route: /admin
// Auth: 🛡️ MODERATOR / ADMIN / SUPER_ADMIN
// Purpose: Platform administration

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS USED
// ─────────────────────────────────────────────────────────────────────────────
/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dashboard Overview                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/admin/stats                          │ Platform statistics       │
│ GET /api/v1/admin/reports?status=pending         │ Pending reports count     │
│ GET /api/v1/admin/moderation/queue               │ Content queue count       │
├──────────────────────────────────────────────────────────────────────────────┤
│ User Management (/admin/users)                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET  /api/v1/admin/users                         │ List users                │
│ GET  /api/v1/admin/users/:id                     │ User details              │
│ PUT  /api/v1/admin/users/:id                     │ Update user               │
│ POST /api/v1/admin/users/:id/suspend             │ Suspend user              │
│ POST /api/v1/admin/users/:id/ban                 │ Ban user (ADMIN+)         │
│ POST /api/v1/admin/users/:id/unsuspend           │ Unsuspend user            │
│ DELETE /api/v1/admin/users/:id                   │ Delete user (SUPER_ADMIN) │
├──────────────────────────────────────────────────────────────────────────────┤
│ Content Moderation (/admin/content)                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET  /api/v1/admin/moderation/queue              │ Moderation queue          │
│ POST /api/v1/admin/moderation/:id/approve        │ Approve content           │
│ POST /api/v1/admin/moderation/:id/reject         │ Reject content            │
│ POST /api/v1/admin/moderation/:id/hide           │ Hide content              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Reports (/admin/reports)                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET  /api/v1/admin/reports                       │ List reports              │
│ GET  /api/v1/admin/reports/:id                   │ Report details            │
│ PUT  /api/v1/admin/reports/:id                   │ Update report status      │
│ POST /api/v1/admin/reports/:id/action            │ Take action on report     │
├──────────────────────────────────────────────────────────────────────────────┤
│ Analytics (/admin/analytics)                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET /api/v1/admin/analytics/users                │ User growth metrics       │
│ GET /api/v1/admin/analytics/content              │ Content metrics           │
│ GET /api/v1/admin/analytics/revenue              │ Revenue metrics (ADMIN+)  │
│ GET /api/v1/admin/analytics/engagement           │ Engagement metrics        │
├──────────────────────────────────────────────────────────────────────────────┤
│ System Settings (/admin/settings) - SUPER_ADMIN only                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ GET  /api/v1/admin/settings                      │ Get all settings          │
│ PUT  /api/v1/admin/settings                      │ Update settings           │
│ GET  /api/v1/admin/settings/theme                │ Get theme config          │
│ PUT  /api/v1/admin/settings/theme                │ Update theme config       │
│ POST /api/v1/admin/cache/clear                   │ Clear cache               │
└──────────────────────────────────────────────────────────────────────────────┘
*/
```


## 10.6 MOBILE APP SPECIFIC FLOWS

### Tab Navigation

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// MOBILE TAB NAVIGATION - apps/mobile/app/(tabs)/_layout.tsx
// ═══════════════════════════════════════════════════════════════════════════

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MOBILE TAB STRUCTURE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [🏠 Home]    [🔍 Explore]    [➕ Create]    [🔔 Activity]    [👤 Profile]  │
│                                                                             │
│  Home Tab                                                                   │
│  ├─ Initial: GET /api/v1/feed                                              │
│  ├─ Pull-to-refresh: GET /api/v1/feed?refresh=true                        │
│  └─ Infinite scroll: GET /api/v1/feed?page={n}                            │
│                                                                             │
│  Explore Tab                                                                │
│  ├─ Initial: GET /api/v1/feed/trending                                     │
│  ├─ Search: GET /api/v1/search?q={query}                                   │
│  └─ Categories: GET /api/v1/categories                                     │
│                                                                             │
│  Create Tab (Action Sheet)                                                  │
│  ├─ Quick Poll → POST /api/v1/polls                                        │
│  ├─ Extended Poll → POST /api/v1/polls (type: STANDARD)                   │
│  └─ Live Poll (Premium) → POST /api/v1/polls (type: LIVE_POLL)           │
│                                                                             │
│  Activity Tab                                                               │
│  ├─ Initial: GET /api/v1/notifications                                     │
│  ├─ Mark read: PUT /api/v1/notifications/:id/read                         │
│  └─ Badge: GET /api/v1/notifications/unread-count                         │
│                                                                             │
│  Profile Tab                                                                │
│  ├─ Initial: GET /api/v1/auth/me                                          │
│  ├─ My Polls: GET /api/v1/users/me/polls                                  │
│  ├─ My Badges: GET /api/v1/users/me/badges                                │
│  └─ Settings: Multiple settings endpoints                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
*/
```

### Gesture-Based Interactions

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// MOBILE GESTURE FLOWS
// ═══════════════════════════════════════════════════════════════════════════

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GESTURE → API MAPPING                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PULL DOWN (Feed)                                                           │
│  └─> GET /api/v1/feed?refresh=true                                         │
│                                                                             │
│  SWIPE LEFT on Poll Card                                                    │
│  └─> Show action sheet: Share, Save, Report                                │
│      ├─ Share: POST /api/v1/polls/:id/share                               │
│      ├─ Save: POST /api/v1/users/me/saved                                 │
│      └─ Report: POST /api/v1/polls/:id/report                             │
│                                                                             │
│  SWIPE RIGHT on Poll Card                                                   │
│  └─> Quick vote (if single tap voting enabled)                             │
│      └─> POST /api/v1/polls/:id/vote                                      │
│                                                                             │
│  LONG PRESS on Poll Card                                                    │
│  └─> Show preview modal with quick actions                                 │
│                                                                             │
│  DOUBLE TAP on Comment                                                      │
│  └─> POST /api/v1/comments/:id/vote { direction: "up" }                   │
│                                                                             │
│  SWIPE DOWN on Modal/Sheet                                                  │
│  └─> Dismiss (no API call)                                                 │
│                                                                             │
│  PINCH on Results Chart                                                     │
│  └─> Zoom in/out (client-side only)                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
*/
```


## 10.7 REAL-TIME DATA (WebSocket Events)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// WEBSOCKET SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════════

/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Connection                                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ URL: wss://api.voxpoll.com/ws                                                 │
│ Auth: Bearer token in connection params                                       │
│ Reconnect: Exponential backoff (1s, 2s, 4s, 8s, max 30s)                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ Channel Subscriptions                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ user:{userId}                    │ Personal notifications                    │
│   → notification.new             │ New notification received                 │
│   → message.new                  │ New DM received                           │
│   → badge.earned                 │ Badge earned                              │
│                                                                              │
│ poll:{pollId}                    │ Poll-specific updates                     │
│   → vote.new                     │ New vote (for creators)                   │
│   → comment.new                  │ New comment                               │
│   → poll.closed                  │ Poll was closed                           │
│                                                                              │
│ live:{sessionId}                 │ Live poll session                         │
│   → question.show                │ New question displayed                    │
│   → vote.count                   │ Vote count update                         │
│   → results.show                 │ Results revealed                          │
│   → session.pause                │ Session paused                            │
│   → session.resume               │ Session resumed                           │
│   → session.end                  │ Session ended                             │
│                                                                              │
│ feed:global                      │ Global feed updates                       │
│   → poll.trending                │ Poll started trending                     │
│   → poll.milestone               │ Poll hit vote milestone                   │
└──────────────────────────────────────────────────────────────────────────────┘
*/

// React Hook Usage
const { subscribe, unsubscribe } = useWebSocket()

// Subscribe to poll updates
useEffect(() => {
  subscribe(`poll:${pollId}`, (event) => {
    if (event.type === "vote.new") {
      // Update vote count optimistically
      setVoteCount(event.data.totalVotes)
    }
    if (event.type === "comment.new") {
      // Add new comment to list
      setComments(prev => [event.data, ...prev])
    }
  })

  return () => unsubscribe(`poll:${pollId}`)
}, [pollId])
```


## 10.8 ERROR STATES & LOADING

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// STANDARD ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════

/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ HTTP Status → UI Response                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 400 Bad Request                                                              │
│ └─> Show inline validation errors                                           │
│ └─> Toast: "Please check your input"                                        │
│                                                                              │
│ 401 Unauthorized                                                             │
│ └─> Redirect to /login?redirect={currentPath}                               │
│ └─> Clear auth state                                                        │
│                                                                              │
│ 403 Forbidden                                                                │
│ └─> Show "Access Denied" page                                               │
│ └─> If tier-related: Show upgrade prompt                                    │
│                                                                              │
│ 404 Not Found                                                                │
│ └─> Show 404 page with search suggestion                                    │
│                                                                              │
│ 409 Conflict                                                                 │
│ └─> Show specific conflict message                                          │
│ └─> Example: "You've already voted on this poll"                           │
│                                                                              │
│ 429 Too Many Requests                                                        │
│ └─> Show rate limit message with retry time                                 │
│ └─> Toast: "Slow down! Try again in X seconds"                             │
│                                                                              │
│ 500 Internal Server Error                                                    │
│ └─> Show generic error page                                                 │
│ └─> Log to error tracking (Sentry)                                         │
│ └─> Toast: "Something went wrong. Please try again."                       │
│                                                                              │
│ Network Error                                                                │
│ └─> Show offline indicator                                                  │
│ └─> Queue mutations for retry                                               │
│ └─> Toast: "You're offline. Changes will sync when connected."             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
*/

// ─────────────────────────────────────────────────────────────────────────────
// LOADING STATES
// ─────────────────────────────────────────────────────────────────────────────

/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Loading Patterns                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Page Load (Server Component)                                                 │
│ └─> Streaming with Suspense boundaries                                      │
│ └─> Skeleton components match final layout                                  │
│                                                                              │
│ Data Fetch (Client)                                                          │
│ └─> React Query with staleTime: 30000                                      │
│ └─> Show stale data while revalidating                                     │
│                                                                              │
│ Mutation (Create/Update/Delete)                                              │
│ └─> Optimistic update UI immediately                                        │
│ └─> Revert on error with toast                                             │
│                                                                              │
│ Button Action                                                                │
│ └─> Disable button + show spinner                                          │
│ └─> Prevent double-submit                                                  │
│                                                                              │
│ Infinite Scroll                                                              │
│ └─> Show skeleton cards at bottom                                          │
│ └─> Intersection Observer trigger                                          │
│                                                                              │
│ Pull to Refresh (Mobile)                                                     │
│ └─> Native pull indicator                                                  │
│ └─> Haptic feedback on release                                             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
*/
```



# ══════════════════════════════════════════════════════════════════════════════
# REFERENCES & SOURCES
# ══════════════════════════════════════════════════════════════════════════════

## 2026 UI/UX Trend Sources
- [UX Studio - UI Trends 2026](https://www.uxstudioteam.com/ux-blog/ui-trends-2019)
- [UX Collective - 10 UX Design Shifts](https://uxdesign.cc/10-ux-design-shifts-you-cant-ignore-in-2026-8f0da1c6741d)
- [Promodo - UX/UI Design Trends 2026](https://www.promodo.com/blog/key-ux-ui-design-trends)
- [Tech-RZ - Dark Mode Best Practices 2026](https://www.tech-rz.com/blog/dark-mode-design-best-practices-in-2026/)

## shadcn/ui & Component Architecture
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- [Anatomy of shadcn/ui](https://manupa.dev/blog/anatomy-of-shadcn-ui)
- [CVA - Class Variance Authority](https://cva.style/docs)

## Next.js 15+ Patterns
- [Next.js Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Advanced Patterns 2026](https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026)

## React Native & Expo
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Gesture Handler](https://docs.expo.dev/tutorial/gestures/)
- [React Native Best Practices 2026](https://www.esparkinfo.com/blog/react-native-best-practices)

## Polling App Inspirations
- [Typeform](https://www.typeform.com/)
- [StrawPoll](https://strawpoll.com/)
- [Zapier - Best Survey Apps 2026](https://zapier.com/blog/best-survey-apps/)

## Dashboard Design
- [TailAdmin Dashboard](https://tailadmin.com/)
- [WrapPixel - Dashboard Designs 2026](https://www.wrappixel.com/best-dashboard-designs/)

## Performance & Optimization
- [CSS Properties Performance Impact](https://www.f22labs.com/blogs/how-css-properties-affect-website-performance/)
- [Costly CSS Properties Optimization](https://dev.to/leduc1901/costly-css-properties-and-how-to-optimize-them-3bmd)
- [Backdrop-filter Performance Fix (Safari)](https://graffino.com/til/how-to-fix-filter-blur-performance-issue-in-safari)
- [CSS Backdrop-filter MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)

## Background Patterns & Textures
- [PatternCraft - CSS & Tailwind Patterns](https://patterncraft.fun/)
- [tailwindcss-bg-patterns](https://hillmann.cc/tailwindcss-bg-patterns/)
- [80+ Geometric Patterns](https://github.com/magmaflowco/tailwindcss-patterns)
- [Uiverse.io - 274 Patterns](https://uiverse.io/patterns)

## Theme Customization
- [shadcn/ui Theming Documentation](https://ui.shadcn.com/docs/theming)
- [tweakcn - Theme Editor for shadcn/ui](https://tweakcn.com/)
- [Tailkits - Theme Generator](https://tailkits.com/blog/generate-custom-shadcnui-themes/)



# ══════════════════════════════════════════════════════════════════════════════
# END OF VOXPOLL FRONTEND UI BIBLE
# ══════════════════════════════════════════════════════════════════════════════
