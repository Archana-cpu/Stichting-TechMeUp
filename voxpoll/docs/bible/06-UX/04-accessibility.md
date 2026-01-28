# Accessibility

> Source: bible-frontend-ui.md (Accessibility sections), bible-026.md

This document defines WCAG compliance standards, accessibility guidelines, and inclusive design requirements for VoxPoll.


# ═══════════════════════════════════════════════════════════════════════════════
# ACCESSIBILITY STANDARDS
# ═══════════════════════════════════════════════════════════════════════════════

## WCAG 2.1 AA Compliance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WCAG 2.1 AA COMPLIANCE CHECKLIST                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PERCEIVABLE                                                                │
│  ═══════════                                                                │
│                                                                             │
│  Text Alternatives (1.1)                                                    │
│  • All images have meaningful alt text                                     │
│  • Decorative images have empty alt=""                                     │
│  • Complex graphics have extended descriptions                             │
│  • Icon buttons have aria-label                                            │
│                                                                             │
│  Time-Based Media (1.2)                                                     │
│  • Videos have captions                                                    │
│  • Audio content has transcripts                                           │
│                                                                             │
│  Adaptable (1.3)                                                            │
│  • Proper heading hierarchy (h1-h6)                                        │
│  • Semantic HTML elements (nav, main, article, etc.)                       │
│  • Form labels associated with inputs                                      │
│  • Reading order matches visual order                                      │
│                                                                             │
│  Distinguishable (1.4)                                                      │
│  • Color contrast ratio >= 4.5:1 (normal text)                            │
│  • Color contrast ratio >= 3:1 (large text, UI components)                │
│  • Text resizable up to 200% without loss                                 │
│  • No information conveyed by color alone                                 │
│                                                                             │
│  OPERABLE                                                                   │
│  ═════════                                                                  │
│                                                                             │
│  Keyboard Accessible (2.1)                                                  │
│  • All functionality available via keyboard                                │
│  • No keyboard traps                                                       │
│  • Skip links for main content                                             │
│  • Visible focus indicators                                                │
│                                                                             │
│  Enough Time (2.2)                                                          │
│  • Adjustable time limits where applicable                                 │
│  • Pause, stop, hide for auto-updating content                            │
│  • No time limits for reading content                                     │
│                                                                             │
│  Seizures and Physical Reactions (2.3)                                      │
│  • No content flashing more than 3 times/second                           │
│  • Reduced motion option for animations                                    │
│                                                                             │
│  Navigable (2.4)                                                            │
│  • Skip to main content link                                               │
│  • Descriptive page titles                                                 │
│  • Focus order follows logical sequence                                    │
│  • Link purpose clear from text                                            │
│                                                                             │
│  UNDERSTANDABLE                                                             │
│  ═══════════════                                                            │
│                                                                             │
│  Readable (3.1)                                                             │
│  • Page language declared (lang="tr" or lang="en")                        │
│  • Unusual words explained                                                 │
│                                                                             │
│  Predictable (3.2)                                                          │
│  • Consistent navigation                                                   │
│  • Consistent identification of components                                 │
│  • No unexpected context changes                                           │
│                                                                             │
│  Input Assistance (3.3)                                                     │
│  • Error identification (what field has error)                            │
│  • Error suggestion (how to fix)                                          │
│  • Error prevention (confirmation for important actions)                  │
│                                                                             │
│  ROBUST                                                                     │
│  ══════                                                                     │
│                                                                             │
│  Compatible (4.1)                                                           │
│  • Valid HTML                                                              │
│  • Unique IDs                                                              │
│  • Proper ARIA usage                                                       │
│  • Works with screen readers                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# COLOR CONTRAST REQUIREMENTS
# ═══════════════════════════════════════════════════════════════════════════════

## Contrast Ratios

```typescript
const CONTRAST_REQUIREMENTS = {
  normalText: {
    minRatio: 4.5,
    applies: "Text smaller than 18pt (24px) or 14pt bold (18.5px)"
  },
  largeText: {
    minRatio: 3.0,
    applies: "Text 18pt+ (24px+) or 14pt bold+ (18.5px+)"
  },
  uiComponents: {
    minRatio: 3.0,
    applies: "Buttons, form inputs, focus indicators"
  },
  graphicalObjects: {
    minRatio: 3.0,
    applies: "Charts, icons that convey meaning"
  }
}

const LIGHT_MODE_CONTRASTS = {
  primaryTextOnWhite: { colors: ["#18181b", "#ffffff"], ratio: 15.4 },
  secondaryTextOnWhite: { colors: ["#52525b", "#ffffff"], ratio: 7.0 },
  primaryOnWhite: { colors: ["#0c8ce9", "#ffffff"], ratio: 3.1 },
  errorOnWhite: { colors: ["#ef4444", "#ffffff"], ratio: 4.5 }
}

const DARK_MODE_CONTRASTS = {
  primaryTextOnDark: { colors: ["#fafafa", "#09090b"], ratio: 18.3 },
  secondaryTextOnDark: { colors: ["#a1a1aa", "#09090b"], ratio: 7.5 },
  primaryOnDark: { colors: ["#4dacff", "#09090b"], ratio: 8.2 },
  errorOnDark: { colors: ["#f87171", "#09090b"], ratio: 5.3 }
}

export { CONTRAST_REQUIREMENTS, LIGHT_MODE_CONTRASTS, DARK_MODE_CONTRASTS }
```


## Color-Independent Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COLOR-INDEPENDENT DESIGN                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  NEVER use color alone to convey information:                               │
│                                                                             │
│  BAD EXAMPLE (color only):                                                  │
│  ┌─────────────────────────────────────┐                                    │
│  │  Python      ██████████ (green)     │  Color-blind users can't          │
│  │  JavaScript  ██████ (red)           │  distinguish                       │
│  │  Rust        ████ (yellow)          │                                    │
│  └─────────────────────────────────────┘                                    │
│                                                                             │
│  GOOD EXAMPLE (color + label + pattern):                                    │
│  ┌─────────────────────────────────────┐                                    │
│  │  Python      ██████████  45%        │  Labels always visible            │
│  │  JavaScript  ██████      30%        │  Patterns optional                │
│  │  Rust        ████        15%        │                                    │
│  └─────────────────────────────────────┘                                    │
│                                                                             │
│  ERROR STATES (color + icon + text):                                        │
│  ┌─────────────────────────────────────┐                                    │
│  │  [X] Email is required              │  Error icon + red border + text   │
│  └─────────────────────────────────────┘                                    │
│                                                                             │
│  SUCCESS STATES (color + icon + text):                                      │
│  ┌─────────────────────────────────────┐                                    │
│  │  [Check] Vote submitted             │  Check icon + green + text        │
│  └─────────────────────────────────────┘                                    │
│                                                                             │
│  SELECTION STATES (color + border + check):                                 │
│  ┌─────────────────────────────────────┐                                    │
│  │  [X] Python (selected)              │  Filled circle + thick border     │
│  │  [ ] JavaScript                     │  Empty circle + thin border       │
│  └─────────────────────────────────────┘                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# KEYBOARD NAVIGATION
# ═══════════════════════════════════════════════════════════════════════════════

## Focus Management

```typescript
const FOCUS_MANAGEMENT = {
  visibleFocusIndicator: {
    outline: "2px solid var(--vox-primary-500)",
    outlineOffset: "2px",
    borderRadius: "inherit"
  },

  focusOrder: {
    rule: "Logical reading order (top-to-bottom, left-to-right in LTR)",
    tabindex: "Use tabindex=0 for focusable non-interactive elements",
    avoidPositiveTabindex: "Never use tabindex > 0"
  },

  skipLinks: {
    implementation: "First focusable element on page",
    target: "main content area",
    visibility: "Visible only on focus"
  },

  modalFocusTrap: {
    rule: "Focus must stay within modal when open",
    initialFocus: "First focusable element or close button",
    returnFocus: "Return to triggering element on close"
  }
}

export { FOCUS_MANAGEMENT }
```


## Keyboard Shortcuts

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KEYBOARD SHORTCUTS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GLOBAL SHORTCUTS                                                           │
│  ════════════════                                                           │
│                                                                             │
│  Key         │ Action                                                       │
│  ────────────┼─────────────────────────────────────────────────────────────│
│  Tab         │ Move to next focusable element                              │
│  Shift+Tab   │ Move to previous focusable element                          │
│  Enter       │ Activate button/link                                        │
│  Space       │ Activate button, toggle checkbox/switch                     │
│  Escape      │ Close modal/dropdown/popover                                │
│  /           │ Focus search input (when not in text field)                 │
│  ?           │ Show keyboard shortcuts help                                │
│                                                                             │
│  FEED NAVIGATION                                                            │
│  ═══════════════                                                            │
│                                                                             │
│  Key         │ Action                                                       │
│  ────────────┼─────────────────────────────────────────────────────────────│
│  j           │ Next item in feed                                           │
│  k           │ Previous item in feed                                       │
│  Enter       │ Open item details                                           │
│  v           │ Vote/interact with current item                             │
│  s           │ Save/bookmark current item                                  │
│  c           │ Open comments                                               │
│                                                                             │
│  POLL INTERACTION                                                           │
│  ════════════════                                                           │
│                                                                             │
│  Key         │ Action                                                       │
│  ────────────┼─────────────────────────────────────────────────────────────│
│  1-9         │ Select option by number                                     │
│  Arrow Up    │ Move to previous option                                     │
│  Arrow Down  │ Move to next option                                         │
│  Enter       │ Submit vote                                                 │
│                                                                             │
│  FORM NAVIGATION                                                            │
│  ═══════════════                                                            │
│                                                                             │
│  Key         │ Action                                                       │
│  ────────────┼─────────────────────────────────────────────────────────────│
│  Tab         │ Next form field                                             │
│  Shift+Tab   │ Previous form field                                         │
│  Enter       │ Submit form (when on submit button)                         │
│  Escape      │ Cancel/close form                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# SCREEN READER SUPPORT
# ═══════════════════════════════════════════════════════════════════════════════

## ARIA Implementation

```typescript
const ARIA_PATTERNS = {
  liveRegions: {
    polite: "aria-live='polite' for non-urgent updates",
    assertive: "aria-live='assertive' for errors/urgent",
    examples: {
      voteConfirmation: "aria-live='polite'",
      errorMessage: "aria-live='assertive'",
      loadingStatus: "aria-live='polite'"
    }
  },

  landmarks: {
    banner: "<header role='banner'>",
    navigation: "<nav role='navigation'>",
    main: "<main role='main'>",
    contentinfo: "<footer role='contentinfo'>",
    search: "<form role='search'>",
    complementary: "<aside role='complementary'>"
  },

  widgets: {
    dialog: {
      role: "dialog",
      ariaModal: true,
      ariaLabelledby: "dialog title id"
    },
    tablist: {
      role: "tablist",
      tabs: "role='tab'",
      tabpanel: "role='tabpanel'"
    },
    combobox: {
      role: "combobox",
      ariaExpanded: "true/false",
      ariaAutocomplete: "list"
    }
  }
}

export { ARIA_PATTERNS }
```


## Semantic HTML Requirements

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SEMANTIC HTML REQUIREMENTS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PAGE STRUCTURE                                                             │
│  ══════════════                                                             │
│                                                                             │
│  <header>                    Banner landmark                                │
│    <nav>                     Main navigation                                │
│  </header>                                                                  │
│                                                                             │
│  <main>                      Main content                                   │
│    <article>                 Self-contained content (poll, test)           │
│      <header>                Article header                                 │
│      <section>               Content sections                               │
│      <footer>                Article footer (stats, actions)               │
│    </article>                                                               │
│                                                                             │
│    <aside>                   Sidebar content                                │
│  </main>                                                                    │
│                                                                             │
│  <footer>                    Site footer                                    │
│  </footer>                                                                  │
│                                                                             │
│  HEADING HIERARCHY                                                          │
│  ═════════════════                                                          │
│                                                                             │
│  <h1>                        One per page, page title                       │
│    <h2>                      Major sections                                 │
│      <h3>                    Subsections                                    │
│        <h4>                  Sub-subsections                                │
│                                                                             │
│  NEVER skip heading levels (h1 -> h3 is wrong)                             │
│                                                                             │
│  FORM ELEMENTS                                                              │
│  ═════════════                                                              │
│                                                                             │
│  <form>                                                                     │
│    <fieldset>                Group related inputs                          │
│      <legend>                Group label                                    │
│      <label for="id">        Always associated with input                  │
│      <input id="id">                                                       │
│    </fieldset>                                                             │
│  </form>                                                                    │
│                                                                             │
│  INTERACTIVE ELEMENTS                                                       │
│  ════════════════════                                                       │
│                                                                             │
│  <button>                    Interactive controls (not links)              │
│  <a href="">                 Navigation (real URLs)                        │
│  <input type="radio">        Single select from options                    │
│  <input type="checkbox">     Multiple select                               │
│                                                                             │
│  NEVER use <div onclick> for interactive elements                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# MOTION AND ANIMATION
# ═══════════════════════════════════════════════════════════════════════════════

## Reduced Motion Support

```typescript
const MOTION_PREFERENCES = {
  respectUserPreference: {
    css: "@media (prefers-reduced-motion: reduce)",
    js: "window.matchMedia('(prefers-reduced-motion: reduce)').matches"
  },

  reducedMotionStyles: {
    transitions: "none",
    animations: "none",
    scrollBehavior: "auto"
  },

  safeAnimations: {
    opacity: "Fade in/out is generally safe",
    transform: "Small scale changes (0.95 to 1) are safe"
  },

  dangerousAnimations: {
    flash: "Never flash content more than 3 times/second",
    parallax: "Disable for reduced motion",
    autoPlay: "Never auto-play video/audio"
  }
}

export { MOTION_PREFERENCES }
```


## CSS Implementation

```css
/* Base animations */
.animated {
  transition: transform 200ms ease, opacity 200ms ease;
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  .animated {
    transition: none;
  }

  .pulse-animation {
    animation: none;
  }

  .scroll-smooth {
    scroll-behavior: auto;
  }

  /* Provide alternative non-animated experience */
  .motion-safe\:animate-bounce {
    animation: none;
  }
}
```


## PULSE Animation Accessibility

```typescript
const PULSE_ACCESSIBILITY = {
  reducedMotionAlternative: {
    skipAnimation: true,
    showStaticResults: true,
    immediateReveal: true
  },

  skipButton: {
    position: "Top right corner",
    label: "Skip animation",
    keyboardShortcut: "Escape"
  },

  screenReaderAnnouncements: [
    { stage: "intro", announcement: "Sonuçlarınız hazırlanıyor" },
    { stage: "yourChoice", announcement: "Seçiminiz: {option}" },
    { stage: "comparison", announcement: "Kullanıcıların %{percent}'i sizinle aynı fikirde" },
    { stage: "results", announcement: "Tam sonuçlar görüntüleniyor" }
  ]
}

export { PULSE_ACCESSIBILITY }
```


# ═══════════════════════════════════════════════════════════════════════════════
# FORM ACCESSIBILITY
# ═══════════════════════════════════════════════════════════════════════════════

## Form Labels and Instructions

```typescript
const FORM_ACCESSIBILITY = {
  labels: {
    requirement: "Every input must have an associated label",
    hiddenLabels: "Use sr-only class for visually hidden but accessible labels",
    placeholders: "Never use placeholder as sole label"
  },

  instructions: {
    placement: "Before the form or input",
    required: "Indicate required fields with * and explain at start",
    format: "Provide format hints (e.g., 'DD/MM/YYYY')"
  },

  errors: {
    identification: "Identify the field with the error",
    suggestion: "Provide guidance on how to fix",
    association: "Use aria-describedby to link error to input",
    focus: "Move focus to first error on submit"
  },

  success: {
    confirmation: "Confirm successful submission",
    announcement: "Use aria-live for dynamic updates"
  }
}

export { FORM_ACCESSIBILITY }
```


## Error Handling Pattern

```tsx
function AccessibleFormField({
  id,
  label,
  error,
  required,
  hint,
  ...inputProps
}) {
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
        {required && <span className="sr-only">(required)</span>}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}

      <input
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
        aria-required={required}
        {...inputProps}
      />

      {error && (
        <p id={errorId} className="text-sm text-error" role="alert">
          <span className="sr-only">Error:</span>
          {error}
        </p>
      )}
    </div>
  )
}
```


# ═══════════════════════════════════════════════════════════════════════════════
# MOBILE ACCESSIBILITY
# ═══════════════════════════════════════════════════════════════════════════════

## Touch Target Requirements

```typescript
const TOUCH_TARGET_REQUIREMENTS = {
  minimum: {
    ios: "44x44 points",
    android: "48x48 dp",
    wcag: "44x44 CSS pixels"
  },

  spacing: {
    between: "At least 8px between targets",
    inline: "Inline links need extra padding"
  },

  exceptions: {
    inline: "Links within text blocks",
    provided: "When larger target available nearby"
  }
}

export { TOUCH_TARGET_REQUIREMENTS }
```


## Mobile Screen Reader Support

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MOBILE SCREEN READER SUPPORT                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  iOS VoiceOver                                                              │
│  ═════════════                                                              │
│                                                                             │
│  • Test with VoiceOver enabled (Settings > Accessibility > VoiceOver)      │
│  • Use accessibilityLabel for custom labels                                │
│  • Use accessibilityHint for additional context                            │
│  • Group related elements with accessibilityViewIsModal                    │
│  • Set accessibilityTraits (button, link, header, etc.)                    │
│                                                                             │
│  Android TalkBack                                                           │
│  ════════════════                                                           │
│                                                                             │
│  • Test with TalkBack enabled (Settings > Accessibility > TalkBack)        │
│  • Use contentDescription for images                                       │
│  • Use importantForAccessibility to control focus                          │
│  • Group elements with focusable and accessibilityLiveRegion               │
│                                                                             │
│  React Native Specifics                                                     │
│  ══════════════════════                                                     │
│                                                                             │
│  Props to use:                                                              │
│  • accessible={true}                                                       │
│  • accessibilityLabel="Description"                                        │
│  • accessibilityHint="What happens when activated"                         │
│  • accessibilityRole="button" | "link" | "header" | etc.                   │
│  • accessibilityState={{ disabled, selected, checked }}                    │
│  • accessibilityValue={{ min, max, now, text }}                            │
│  • accessibilityLiveRegion="polite" | "assertive"                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# INTERNATIONALIZATION & LOCALIZATION
# ═══════════════════════════════════════════════════════════════════════════════

## Language Support

```typescript
const I18N_ACCESSIBILITY = {
  languageDeclaration: {
    html: '<html lang="tr">',
    dynamic: "Update lang attribute when language changes",
    inline: "Use <span lang='en'>English text</span> for mixed content"
  },

  rtlSupport: {
    future: "Arabic language support planned",
    cssProperties: [
      "Use logical properties (margin-inline-start, not margin-left)",
      "Use writing-mode aware units",
      "Flip icons that indicate direction"
    ]
  },

  textResizing: {
    requirement: "Content usable at 200% zoom",
    implementation: "Use rem/em units, not px for text",
    testing: "Test with browser zoom at 200%"
  },

  dateTimeFormats: {
    respectLocale: true,
    useIntl: "new Intl.DateTimeFormat(locale, options)",
    relativeTime: "new Intl.RelativeTimeFormat(locale)"
  }
}

export { I18N_ACCESSIBILITY }
```


# ═══════════════════════════════════════════════════════════════════════════════
# TESTING ACCESSIBILITY
# ═══════════════════════════════════════════════════════════════════════════════

## Testing Checklist

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ACCESSIBILITY TESTING CHECKLIST                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AUTOMATED TESTING                                                          │
│  ═════════════════                                                          │
│                                                                             │
│  [ ] axe-core integration in CI                                             │
│  [ ] Lighthouse accessibility audits                                        │
│  [ ] eslint-plugin-jsx-a11y for React                                       │
│  [ ] Pa11y for automated testing                                            │
│                                                                             │
│  MANUAL TESTING                                                             │
│  ══════════════                                                             │
│                                                                             │
│  Keyboard Testing:                                                          │
│  [ ] Navigate entire app using only keyboard                                │
│  [ ] Verify visible focus indicators                                        │
│  [ ] Test modal focus trapping                                              │
│  [ ] Verify logical tab order                                               │
│  [ ] Test skip links                                                        │
│                                                                             │
│  Screen Reader Testing:                                                     │
│  [ ] Test with NVDA (Windows)                                               │
│  [ ] Test with VoiceOver (macOS/iOS)                                        │
│  [ ] Test with TalkBack (Android)                                           │
│  [ ] Verify announcements are meaningful                                    │
│  [ ] Test form error handling                                               │
│                                                                             │
│  Visual Testing:                                                            │
│  [ ] Test at 200% zoom                                                      │
│  [ ] Test with high contrast mode                                           │
│  [ ] Test with reduced motion                                               │
│  [ ] Test with color blindness simulators                                   │
│                                                                             │
│  Mobile Testing:                                                            │
│  [ ] Test touch targets (44x44 min)                                         │
│  [ ] Test with mobile screen readers                                        │
│  [ ] Test landscape/portrait orientations                                   │
│                                                                             │
│  TOOLS                                                                      │
│  ═════                                                                      │
│                                                                             │
│  Browser Extensions:                                                        │
│  • axe DevTools                                                             │
│  • WAVE                                                                     │
│  • Accessibility Insights                                                   │
│                                                                             │
│  Color Contrast:                                                            │
│  • WebAIM Contrast Checker                                                  │
│  • Stark (Figma plugin)                                                     │
│                                                                             │
│  Screen Readers:                                                            │
│  • NVDA (free, Windows)                                                     │
│  • JAWS (paid, Windows)                                                     │
│  • VoiceOver (built-in, macOS/iOS)                                          │
│  • TalkBack (built-in, Android)                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## Automated Testing Setup

```typescript
import { configureAxe, toHaveNoViolations } from "jest-axe"

expect.extend(toHaveNoViolations)

const axe = configureAxe({
  rules: {
    "color-contrast": { enabled: true },
    "valid-aria-values": { enabled: true },
    "aria-required-parent": { enabled: true },
    "button-name": { enabled: true },
    "image-alt": { enabled: true }
  }
})

describe("Accessibility Tests", () => {
  it("should have no accessibility violations on poll page", async () => {
    const { container } = render(<PollPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it("should have no violations on registration form", async () => {
    const { container } = render(<RegistrationForm />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```


# ═══════════════════════════════════════════════════════════════════════════════
# COMMON ACCESSIBILITY PATTERNS
# ═══════════════════════════════════════════════════════════════════════════════

## Component Patterns

```typescript
const A11Y_COMPONENT_PATTERNS = {
  dialog: {
    role: "dialog",
    ariaModal: true,
    ariaLabelledby: "title-id",
    focusTrap: true,
    closeOnEscape: true,
    returnFocus: true
  },

  toast: {
    role: "status",
    ariaLive: "polite",
    ariaAtomic: true,
    autoHideWithAnnouncement: true
  },

  alert: {
    role: "alert",
    ariaLive: "assertive",
    ariaAtomic: true
  },

  tabs: {
    tablist: { role: "tablist" },
    tab: {
      role: "tab",
      ariaSelected: true,
      ariaControls: "panel-id"
    },
    tabpanel: {
      role: "tabpanel",
      ariaLabelledby: "tab-id"
    }
  },

  combobox: {
    input: {
      role: "combobox",
      ariaExpanded: true,
      ariaAutocomplete: "list",
      ariaControls: "listbox-id"
    },
    listbox: {
      role: "listbox",
      ariaLabel: "Options"
    },
    option: {
      role: "option",
      ariaSelected: true
    }
  },

  progressBar: {
    role: "progressbar",
    ariaValuemin: 0,
    ariaValuemax: 100,
    ariaValuenow: "current value",
    ariaLabel: "Loading progress"
  }
}

export { A11Y_COMPONENT_PATTERNS }
```
