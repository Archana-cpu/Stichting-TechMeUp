# ═══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - DESIGN THEMES SPECIFICATION
# ═══════════════════════════════════════════════════════════════════════════════
# Version: 1.0 | Created: January 2026
# 4 Distinct Themes | Light + Dark Mode | Customizable Fonts
# ═══════════════════════════════════════════════════════════════════════════════

## Table of Contents

1. [Overview](#1-overview)
2. [Theme Architecture](#2-theme-architecture)
3. [Theme 1: Minimal](#3-theme-1-minimal)
4. [Theme 2: Soft](#4-theme-2-soft)
5. [Theme 3: Corporate](#5-theme-3-corporate)
6. [Theme 4: Vibrant](#6-theme-4-vibrant)
7. [Font System](#7-font-system)
8. [Background Effects](#8-background-effects)
9. [Implementation Guide](#9-implementation-guide)

---

## 1. Overview

### 1.1 Design Principles
```
PRINCIPLE-1: Her tema birbirinden TAMAMEN FARKLI olmalı
PRINCIPLE-2: Light ve Dark mode tam uyumlu olmalı
PRINCIPLE-3: Fontlar tema bazında özelleştirilebilir olmalı
PRINCIPLE-4: Performans öncelikli (CSS-only effects tercih edilmeli)
PRINCIPLE-5: Accessibility: WCAG 2.1 AA contrast ratios
```

### 1.2 Theme Summary

| Theme | Character | Primary Color | Radius | Font Style |
|-------|-----------|---------------|--------|------------|
| Minimal | Clean, Sharp, Modern | Slate/Zinc | 0-4px | Geometric Sans |
| Soft | Warm, Friendly, Approachable | Amber/Orange | 16-24px | Humanist Sans |
| Corporate | Professional, Trustworthy | Blue/Indigo | 6-8px | Classic Sans + Serif |
| Vibrant | Bold, Energetic, Playful | Purple/Fuchsia | 12px | Display + Rounded |

---

## 2. Theme Architecture

### 2.1 CSS Variable Structure

```css
:root {
  /* ═══════════════════════════════════════════════════════════════════════════
     THEME TOKENS - Overridden per theme
     ═══════════════════════════════════════════════════════════════════════════ */

  /* Colors */
  --theme-primary: <hsl>;
  --theme-primary-hover: <hsl>;
  --theme-primary-active: <hsl>;
  --theme-secondary: <hsl>;
  --theme-accent: <hsl>;

  /* Backgrounds */
  --theme-bg-base: <hsl>;
  --theme-bg-subtle: <hsl>;
  --theme-bg-muted: <hsl>;
  --theme-bg-elevated: <hsl>;

  /* Text */
  --theme-text-primary: <hsl>;
  --theme-text-secondary: <hsl>;
  --theme-text-muted: <hsl>;
  --theme-text-inverted: <hsl>;

  /* Borders */
  --theme-border-default: <hsl>;
  --theme-border-subtle: <hsl>;
  --theme-border-strong: <hsl>;

  /* Shadows */
  --theme-shadow-sm: <shadow>;
  --theme-shadow-md: <shadow>;
  --theme-shadow-lg: <shadow>;
  --theme-shadow-glow: <shadow>;

  /* Radius */
  --theme-radius-sm: <px>;
  --theme-radius-md: <px>;
  --theme-radius-lg: <px>;
  --theme-radius-xl: <px>;
  --theme-radius-full: 9999px;

  /* Typography */
  --theme-font-sans: <font-stack>;
  --theme-font-heading: <font-stack>;
  --theme-font-mono: <font-stack>;

  /* Effects */
  --theme-blur-sm: 4px;
  --theme-blur-md: 8px;
  --theme-blur-lg: 16px;

  /* Transitions */
  --theme-transition-fast: 150ms ease;
  --theme-transition-normal: 200ms ease;
  --theme-transition-slow: 300ms ease;
}
```

### 2.2 Theme Switching System

```typescript
// Theme type definition
type ThemeStyle = 'minimal' | 'soft' | 'corporate' | 'vibrant'
type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeConfig {
  style: ThemeStyle
  mode: ThemeMode
  font: {
    sans: string
    heading: string
  }
}
```

---

## 3. Theme 1: Minimal

### 3.1 Character
```
Sıfat: Clean, Sharp, Modern, Sophisticated, Neutral
Hedef Kitle: Tech-savvy users, designers, minimalism lovers
Vibe: Apple, Linear, Vercel, Notion
```

### 3.2 Color Palette

#### Light Mode
```css
[data-theme="minimal"] {
  /* Primary - Slate */
  --theme-primary: 215 20% 15%;
  --theme-primary-hover: 215 20% 20%;
  --theme-primary-active: 215 20% 10%;
  --theme-primary-foreground: 0 0% 100%;

  /* Secondary - Zinc */
  --theme-secondary: 240 5% 96%;
  --theme-secondary-hover: 240 5% 92%;
  --theme-secondary-foreground: 240 6% 10%;

  /* Accent - Cool Gray */
  --theme-accent: 220 14% 96%;
  --theme-accent-foreground: 220 9% 46%;

  /* Background */
  --theme-bg-base: 0 0% 100%;
  --theme-bg-subtle: 240 5% 98%;
  --theme-bg-muted: 240 5% 96%;
  --theme-bg-elevated: 0 0% 100%;

  /* Text */
  --theme-text-primary: 240 6% 10%;
  --theme-text-secondary: 240 4% 46%;
  --theme-text-muted: 240 4% 65%;

  /* Border */
  --theme-border-default: 240 6% 90%;
  --theme-border-subtle: 240 6% 94%;
  --theme-border-strong: 240 6% 80%;

  /* Shadows - Subtle */
  --theme-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --theme-shadow-md: 0 2px 4px 0 rgb(0 0 0 / 0.04);
  --theme-shadow-lg: 0 4px 12px 0 rgb(0 0 0 / 0.05);
  --theme-shadow-glow: none;
}
```

#### Dark Mode
```css
[data-theme="minimal"].dark {
  /* Primary */
  --theme-primary: 0 0% 100%;
  --theme-primary-hover: 0 0% 90%;
  --theme-primary-active: 0 0% 85%;
  --theme-primary-foreground: 240 6% 10%;

  /* Background */
  --theme-bg-base: 240 6% 6%;
  --theme-bg-subtle: 240 5% 10%;
  --theme-bg-muted: 240 5% 14%;
  --theme-bg-elevated: 240 5% 12%;

  /* Text */
  --theme-text-primary: 0 0% 98%;
  --theme-text-secondary: 240 4% 65%;
  --theme-text-muted: 240 4% 50%;

  /* Border */
  --theme-border-default: 240 4% 18%;
  --theme-border-subtle: 240 4% 14%;
  --theme-border-strong: 240 4% 25%;

  /* Shadows */
  --theme-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --theme-shadow-md: 0 2px 4px 0 rgb(0 0 0 / 0.4);
  --theme-shadow-lg: 0 4px 12px 0 rgb(0 0 0 / 0.5);
}
```

### 3.3 Radius
```css
[data-theme="minimal"] {
  --theme-radius-sm: 2px;
  --theme-radius-md: 4px;
  --theme-radius-lg: 6px;
  --theme-radius-xl: 8px;
}
```

### 3.4 Typography
```css
[data-theme="minimal"] {
  --theme-font-sans: 'Inter', 'SF Pro Display', system-ui, sans-serif;
  --theme-font-heading: 'Inter', 'SF Pro Display', system-ui, sans-serif;
  --theme-font-mono: 'JetBrains Mono', 'SF Mono', monospace;
}
```

### 3.5 Background Effects
```css
[data-theme="minimal"] {
  /* Dot grid pattern */
  --theme-bg-pattern: radial-gradient(circle, hsl(var(--theme-border-subtle)) 1px, transparent 1px);
  --theme-bg-pattern-size: 24px 24px;

  /* Gradient - Subtle */
  --theme-gradient-hero: linear-gradient(180deg, hsl(var(--theme-bg-base)) 0%, hsl(var(--theme-bg-subtle)) 100%);
}
```

---

## 4. Theme 2: Soft

### 4.1 Character
```
Sıfat: Warm, Friendly, Approachable, Cozy, Inviting
Hedef Kitle: General consumers, casual users, community-focused
Vibe: Notion personal, Figma community, Slack
```

### 4.2 Color Palette

#### Light Mode
```css
[data-theme="soft"] {
  /* Primary - Warm Amber */
  --theme-primary: 25 95% 53%;
  --theme-primary-hover: 25 95% 48%;
  --theme-primary-active: 25 95% 43%;
  --theme-primary-foreground: 0 0% 100%;

  /* Secondary - Warm Stone */
  --theme-secondary: 30 20% 94%;
  --theme-secondary-hover: 30 20% 90%;
  --theme-secondary-foreground: 30 10% 25%;

  /* Accent - Peach */
  --theme-accent: 15 90% 95%;
  --theme-accent-foreground: 15 70% 40%;

  /* Background - Warm Cream */
  --theme-bg-base: 40 30% 99%;
  --theme-bg-subtle: 35 25% 97%;
  --theme-bg-muted: 30 20% 94%;
  --theme-bg-elevated: 0 0% 100%;

  /* Text - Warm Browns */
  --theme-text-primary: 25 20% 18%;
  --theme-text-secondary: 25 12% 40%;
  --theme-text-muted: 25 10% 55%;

  /* Border - Warm */
  --theme-border-default: 30 15% 88%;
  --theme-border-subtle: 30 15% 92%;
  --theme-border-strong: 30 15% 78%;

  /* Shadows - Warm tinted */
  --theme-shadow-sm: 0 1px 3px 0 rgb(180 120 80 / 0.06);
  --theme-shadow-md: 0 4px 8px -2px rgb(180 120 80 / 0.08);
  --theme-shadow-lg: 0 12px 24px -4px rgb(180 120 80 / 0.12);
  --theme-shadow-glow: 0 0 24px -4px rgb(255 160 80 / 0.25);
}
```

#### Dark Mode
```css
[data-theme="soft"].dark {
  /* Primary - Warm Amber */
  --theme-primary: 30 90% 55%;
  --theme-primary-hover: 30 90% 60%;
  --theme-primary-active: 30 90% 50%;
  --theme-primary-foreground: 25 20% 10%;

  /* Background - Warm Dark */
  --theme-bg-base: 25 15% 8%;
  --theme-bg-subtle: 25 12% 12%;
  --theme-bg-muted: 25 10% 16%;
  --theme-bg-elevated: 25 12% 14%;

  /* Text */
  --theme-text-primary: 35 30% 95%;
  --theme-text-secondary: 30 15% 65%;
  --theme-text-muted: 30 10% 50%;

  /* Border */
  --theme-border-default: 25 10% 20%;
  --theme-border-subtle: 25 10% 16%;
  --theme-border-strong: 25 10% 28%;

  /* Shadows */
  --theme-shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.25);
  --theme-shadow-md: 0 4px 8px -2px rgb(0 0 0 / 0.35);
  --theme-shadow-lg: 0 12px 24px -4px rgb(0 0 0 / 0.45);
  --theme-shadow-glow: 0 0 32px -4px rgb(255 160 80 / 0.15);
}
```

### 4.3 Radius
```css
[data-theme="soft"] {
  --theme-radius-sm: 8px;
  --theme-radius-md: 16px;
  --theme-radius-lg: 20px;
  --theme-radius-xl: 24px;
}
```

### 4.4 Typography
```css
[data-theme="soft"] {
  --theme-font-sans: 'DM Sans', 'Nunito', system-ui, sans-serif;
  --theme-font-heading: 'DM Sans', 'Nunito', system-ui, sans-serif;
  --theme-font-mono: 'Fira Code', monospace;
}
```

### 4.5 Background Effects
```css
[data-theme="soft"] {
  /* Gradient blob background */
  --theme-bg-pattern: none;

  /* Warm gradient */
  --theme-gradient-hero: linear-gradient(135deg,
    hsl(35 40% 98%) 0%,
    hsl(25 50% 96%) 50%,
    hsl(15 40% 95%) 100%
  );

  /* Blob effect colors */
  --theme-blob-1: hsl(25 80% 90% / 0.5);
  --theme-blob-2: hsl(350 60% 92% / 0.4);
  --theme-blob-3: hsl(45 70% 92% / 0.3);
}
```

---

## 5. Theme 3: Corporate

### 5.1 Character
```
Sıfat: Professional, Trustworthy, Reliable, Established, Serious
Hedef Kitle: B2B users, enterprises, government, research
Vibe: Microsoft, IBM, Salesforce, Bloomberg
```

### 5.2 Color Palette

#### Light Mode
```css
[data-theme="corporate"] {
  /* Primary - Professional Blue */
  --theme-primary: 217 91% 45%;
  --theme-primary-hover: 217 91% 40%;
  --theme-primary-active: 217 91% 35%;
  --theme-primary-foreground: 0 0% 100%;

  /* Secondary - Navy */
  --theme-secondary: 222 47% 95%;
  --theme-secondary-hover: 222 47% 91%;
  --theme-secondary-foreground: 222 47% 20%;

  /* Accent - Indigo */
  --theme-accent: 226 70% 95%;
  --theme-accent-foreground: 226 70% 40%;

  /* Background - Clean White/Gray */
  --theme-bg-base: 0 0% 100%;
  --theme-bg-subtle: 220 20% 98%;
  --theme-bg-muted: 220 15% 95%;
  --theme-bg-elevated: 0 0% 100%;

  /* Text - Professional Grays */
  --theme-text-primary: 222 47% 11%;
  --theme-text-secondary: 220 9% 46%;
  --theme-text-muted: 220 9% 60%;

  /* Border - Structured */
  --theme-border-default: 220 13% 89%;
  --theme-border-subtle: 220 13% 93%;
  --theme-border-strong: 220 13% 78%;

  /* Shadows - Defined */
  --theme-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --theme-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04);
  --theme-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --theme-shadow-glow: 0 0 0 3px hsl(217 91% 45% / 0.15);
}
```

#### Dark Mode
```css
[data-theme="corporate"].dark {
  /* Primary */
  --theme-primary: 217 91% 60%;
  --theme-primary-hover: 217 91% 65%;
  --theme-primary-active: 217 91% 55%;
  --theme-primary-foreground: 222 47% 11%;

  /* Background - Deep Navy */
  --theme-bg-base: 222 47% 8%;
  --theme-bg-subtle: 222 40% 12%;
  --theme-bg-muted: 222 35% 16%;
  --theme-bg-elevated: 222 40% 14%;

  /* Text */
  --theme-text-primary: 210 40% 98%;
  --theme-text-secondary: 220 15% 65%;
  --theme-text-muted: 220 10% 50%;

  /* Border */
  --theme-border-default: 222 30% 20%;
  --theme-border-subtle: 222 30% 16%;
  --theme-border-strong: 222 30% 28%;

  /* Shadows */
  --theme-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --theme-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --theme-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
  --theme-shadow-glow: 0 0 0 3px hsl(217 91% 60% / 0.2);
}
```

### 5.3 Radius
```css
[data-theme="corporate"] {
  --theme-radius-sm: 4px;
  --theme-radius-md: 6px;
  --theme-radius-lg: 8px;
  --theme-radius-xl: 10px;
}
```

### 5.4 Typography
```css
[data-theme="corporate"] {
  --theme-font-sans: 'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif;
  --theme-font-heading: 'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif;
  --theme-font-mono: 'IBM Plex Mono', 'Consolas', monospace;
}
```

### 5.5 Background Effects
```css
[data-theme="corporate"] {
  /* Subtle grid pattern */
  --theme-bg-pattern: linear-gradient(hsl(var(--theme-border-subtle)) 1px, transparent 1px),
                      linear-gradient(90deg, hsl(var(--theme-border-subtle)) 1px, transparent 1px);
  --theme-bg-pattern-size: 40px 40px;

  /* Professional gradient */
  --theme-gradient-hero: linear-gradient(180deg,
    hsl(220 30% 99%) 0%,
    hsl(220 20% 96%) 100%
  );
}
```

---

## 6. Theme 4: Vibrant

### 6.1 Character
```
Sıfat: Bold, Energetic, Playful, Creative, Dynamic
Hedef Kitle: Creators, young audience, social platforms, events
Vibe: Discord, Twitch, Spotify, TikTok
```

### 6.2 Color Palette

#### Light Mode
```css
[data-theme="vibrant"] {
  /* Primary - Electric Purple */
  --theme-primary: 270 95% 60%;
  --theme-primary-hover: 270 95% 55%;
  --theme-primary-active: 270 95% 50%;
  --theme-primary-foreground: 0 0% 100%;

  /* Secondary - Fuchsia Pink */
  --theme-secondary: 320 90% 94%;
  --theme-secondary-hover: 320 90% 90%;
  --theme-secondary-foreground: 320 70% 35%;

  /* Accent - Cyan */
  --theme-accent: 185 95% 92%;
  --theme-accent-foreground: 185 75% 35%;

  /* Background */
  --theme-bg-base: 260 30% 99%;
  --theme-bg-subtle: 270 25% 97%;
  --theme-bg-muted: 270 20% 94%;
  --theme-bg-elevated: 0 0% 100%;

  /* Text */
  --theme-text-primary: 270 40% 12%;
  --theme-text-secondary: 270 15% 40%;
  --theme-text-muted: 270 10% 55%;

  /* Border */
  --theme-border-default: 270 20% 88%;
  --theme-border-subtle: 270 20% 92%;
  --theme-border-strong: 270 30% 78%;

  /* Shadows - Colored glow */
  --theme-shadow-sm: 0 2px 4px 0 rgb(120 80 200 / 0.08);
  --theme-shadow-md: 0 4px 12px -2px rgb(120 80 200 / 0.12);
  --theme-shadow-lg: 0 12px 32px -4px rgb(120 80 200 / 0.18);
  --theme-shadow-glow: 0 0 32px -4px rgb(160 80 255 / 0.35);
}
```

#### Dark Mode
```css
[data-theme="vibrant"].dark {
  /* Primary - Bright Purple */
  --theme-primary: 270 100% 70%;
  --theme-primary-hover: 270 100% 75%;
  --theme-primary-active: 270 100% 65%;
  --theme-primary-foreground: 270 40% 8%;

  /* Background - Deep Purple */
  --theme-bg-base: 270 40% 6%;
  --theme-bg-subtle: 270 35% 10%;
  --theme-bg-muted: 270 30% 14%;
  --theme-bg-elevated: 270 35% 12%;

  /* Text */
  --theme-text-primary: 270 30% 98%;
  --theme-text-secondary: 270 20% 70%;
  --theme-text-muted: 270 15% 55%;

  /* Border */
  --theme-border-default: 270 25% 18%;
  --theme-border-subtle: 270 25% 14%;
  --theme-border-strong: 270 25% 26%;

  /* Shadows - Neon glow */
  --theme-shadow-sm: 0 2px 4px 0 rgb(0 0 0 / 0.3);
  --theme-shadow-md: 0 4px 12px -2px rgb(0 0 0 / 0.4);
  --theme-shadow-lg: 0 12px 32px -4px rgb(0 0 0 / 0.5);
  --theme-shadow-glow: 0 0 40px -4px rgb(180 100 255 / 0.4);
}
```

### 6.3 Radius
```css
[data-theme="vibrant"] {
  --theme-radius-sm: 8px;
  --theme-radius-md: 12px;
  --theme-radius-lg: 16px;
  --theme-radius-xl: 20px;
}
```

### 6.4 Typography
```css
[data-theme="vibrant"] {
  --theme-font-sans: 'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif;
  --theme-font-heading: 'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif;
  --theme-font-mono: 'Space Mono', monospace;
}
```

### 6.5 Background Effects
```css
[data-theme="vibrant"] {
  /* Gradient mesh background */
  --theme-bg-pattern: none;

  /* Vibrant gradient */
  --theme-gradient-hero: linear-gradient(135deg,
    hsl(270 50% 98%) 0%,
    hsl(300 40% 96%) 33%,
    hsl(200 45% 97%) 66%,
    hsl(270 45% 98%) 100%
  );

  /* Neon accent lines */
  --theme-neon-purple: hsl(270 100% 70%);
  --theme-neon-pink: hsl(320 100% 65%);
  --theme-neon-cyan: hsl(185 100% 60%);
}
```

---

## 7. Font System

### 7.1 Available Font Packs

| Pack | Sans | Heading | Mono | Best For |
|------|------|---------|------|----------|
| geometric | Inter | Inter | JetBrains Mono | Minimal, Tech |
| humanist | DM Sans | DM Sans | Fira Code | Soft, Friendly |
| professional | IBM Plex Sans | IBM Plex Sans | IBM Plex Mono | Corporate |
| modern | Plus Jakarta Sans | Plus Jakarta Sans | Space Mono | Vibrant |
| classic | Source Sans 3 | Source Serif 4 | Source Code Pro | Academic |
| system | system-ui | system-ui | monospace | Performance |

### 7.2 Font Loading Strategy

```typescript
// next/font optimization
import { Inter, DM_Sans, IBM_Plex_Sans, Plus_Jakarta_Sans } from 'next/font/google'

const fontConfigs = {
  geometric: Inter({ subsets: ['latin'], variable: '--font-sans' }),
  humanist: DM_Sans({ subsets: ['latin'], variable: '--font-sans' }),
  professional: IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans' }),
  modern: Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' }),
}
```

### 7.3 Typography Scale (All Themes)

```css
:root {
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

---

## 8. Background Effects

### 8.1 Effect Types

```css
/* ═══════════════════════════════════════════════════════════════════════════
   BACKGROUND EFFECTS - CSS Only (Performance Optimized)
   ═══════════════════════════════════════════════════════════════════════════ */

/* Dot Grid */
.bg-dots {
  background-image: radial-gradient(circle, var(--theme-border-subtle) 1px, transparent 1px);
  background-size: var(--theme-bg-pattern-size, 24px 24px);
}

/* Line Grid */
.bg-grid {
  background-image:
    linear-gradient(var(--theme-border-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--theme-border-subtle) 1px, transparent 1px);
  background-size: var(--theme-bg-pattern-size, 40px 40px);
}

/* Gradient Orbs (Performance: use sparingly) */
.bg-orbs {
  background:
    radial-gradient(circle at 20% 20%, var(--theme-blob-1, hsl(270 80% 95% / 0.5)) 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, var(--theme-blob-2, hsl(320 70% 95% / 0.4)) 0%, transparent 40%),
    radial-gradient(circle at 60% 40%, var(--theme-blob-3, hsl(185 70% 95% / 0.3)) 0%, transparent 30%);
}

/* Noise Texture */
.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}

/* Gradient Mesh */
.bg-mesh {
  background: var(--theme-gradient-hero);
}

/* Glass Effect */
.bg-glass {
  background: hsl(var(--theme-bg-elevated) / 0.8);
  backdrop-filter: blur(var(--theme-blur-md));
  -webkit-backdrop-filter: blur(var(--theme-blur-md));
}
```

### 8.2 Theme-Specific Combinations

```css
/* Minimal - Dots + Subtle gradient */
[data-theme="minimal"] .hero-bg {
  background:
    radial-gradient(circle, hsl(var(--theme-border-subtle)) 1px, transparent 1px),
    linear-gradient(180deg, hsl(var(--theme-bg-base)) 0%, hsl(var(--theme-bg-subtle)) 100%);
  background-size: 24px 24px, 100% 100%;
}

/* Soft - Gradient orbs */
[data-theme="soft"] .hero-bg {
  background:
    radial-gradient(circle at 15% 25%, hsl(25 80% 95% / 0.6) 0%, transparent 35%),
    radial-gradient(circle at 85% 75%, hsl(350 60% 95% / 0.5) 0%, transparent 35%),
    linear-gradient(180deg, hsl(var(--theme-bg-base)) 0%, hsl(var(--theme-bg-subtle)) 100%);
}

/* Corporate - Grid lines */
[data-theme="corporate"] .hero-bg {
  background:
    linear-gradient(hsl(var(--theme-border-subtle)) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--theme-border-subtle)) 1px, transparent 1px),
    linear-gradient(180deg, hsl(var(--theme-bg-base)) 0%, hsl(var(--theme-bg-subtle)) 100%);
  background-size: 48px 48px, 48px 48px, 100% 100%;
}

/* Vibrant - Gradient mesh + glow */
[data-theme="vibrant"] .hero-bg {
  background:
    radial-gradient(circle at 30% 20%, hsl(270 80% 95% / 0.6) 0%, transparent 40%),
    radial-gradient(circle at 70% 60%, hsl(320 70% 95% / 0.5) 0%, transparent 40%),
    radial-gradient(circle at 50% 90%, hsl(185 70% 95% / 0.4) 0%, transparent 35%),
    linear-gradient(180deg, hsl(var(--theme-bg-base)) 0%, hsl(var(--theme-bg-subtle)) 100%);
}
```

---

## 9. Implementation Guide

### 9.1 Theme Provider Structure

```typescript
// components/providers/theme-provider.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { ThemeProvider as NextThemeProvider } from 'next-themes'

type ThemeStyle = 'minimal' | 'soft' | 'corporate' | 'vibrant'

interface ThemeContextType {
  style: ThemeStyle
  setStyle: (style: ThemeStyle) => void
  font: string
  setFont: (font: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState<ThemeStyle>('minimal')
  const [font, setFont] = useState('geometric')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', style)
    document.documentElement.setAttribute('data-font', font)
  }, [style, font])

  return (
    <ThemeContext.Provider value={{ style, setStyle, font, setFont }}>
      <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </NextThemeProvider>
    </ThemeContext.Provider>
  )
}

export function useThemeStyle() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemeStyle must be used within ThemeProvider')
  return context
}
```

### 9.2 CSS File Structure

```
styles/
├── themes/
│   ├── base.css        # Shared tokens
│   ├── minimal.css     # Minimal theme
│   ├── soft.css        # Soft theme
│   ├── corporate.css   # Corporate theme
│   └── vibrant.css     # Vibrant theme
├── fonts/
│   └── index.css       # Font configurations
└── effects/
    └── backgrounds.css # Background effects
```

### 9.3 Theme Persistence

```typescript
// lib/theme-storage.ts
const THEME_STORAGE_KEY = 'voxpoll-theme'

interface StoredTheme {
  style: ThemeStyle
  mode: 'light' | 'dark' | 'system'
  font: string
}

export function saveTheme(theme: StoredTheme) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme))
}

export function loadTheme(): StoredTheme | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}
```

---

## Summary: Theme Comparison

| Feature | Minimal | Soft | Corporate | Vibrant |
|---------|---------|------|-----------|---------|
| **Primary** | Slate | Amber | Blue | Purple |
| **Radius** | 2-8px | 8-24px | 4-10px | 8-20px |
| **Shadows** | Subtle | Warm tint | Defined | Colored glow |
| **Font** | Inter | DM Sans | IBM Plex | Plus Jakarta |
| **Background** | Dot grid | Gradient orbs | Line grid | Mesh + glow |
| **Character** | Sharp | Soft | Structured | Bold |

---

# ═══════════════════════════════════════════════════════════════════════════════
# END OF DESIGN THEMES SPECIFICATION
# ═══════════════════════════════════════════════════════════════════════════════
