# 06-UX
> Kullanici deneyimi ve arayuz

## Overview
Bu kategori VoxPoll'un kullanici deneyimini tanimlar:
- User flow'lar nasil?
- UI/UX standartlari neler?
- Error handling nasil?
- Accessibility nasil saglanıyor?

## Files

| File | Content | Status |
|------|---------|--------|
| [01-user-flows.md](01-user-flows.md) | All user journeys | From bible-022 |
| [02-ui-specifications.md](02-ui-specifications.md) | UI specs, components | From bible-026 |
| [03-error-states.md](03-error-states.md) | Error handling UX | From bible-016 |
| [04-accessibility.md](04-accessibility.md) | WCAG, a11y standards | From bible-026 |

## Source References
- **bible-022.md**: User Flows, UI/UX
- **bible-026.md**: UI/UX Specifications
- **bible-016.md**: Edge Cases & Error Handling
- **bible-frontend-ui.md**: Frontend UI Reference

## Key Decisions
- P-105: Poll result visibility rules
- P-108: Feed algorithm

## Quick Summary

### Core User Flows
1. **Onboarding**: Landing -> Register -> Verify -> Profile
2. **Poll Creation**: Dashboard -> Create -> Options -> Pre-test -> Publish
3. **Voting**: Feed/Link -> View Poll -> Vote -> See Results
4. **Survey Response**: Invite -> Pre-test -> Questions -> Submit
5. **Results Analysis**: Dashboard -> Select Content -> Analytics

### Error States
- Network errors: Retry with exponential backoff
- Validation errors: Inline field messages
- Auth errors: Redirect to login
- Not found: 404 page
- Server errors: Friendly message + support link

### Accessibility (WCAG 2.1 AA)
- Keyboard navigation
- Screen reader support
- Color contrast 4.5:1
- Focus indicators
- Alt text for images
- Form labels

### Responsive Breakpoints
| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | <640px | Phones |
| Tablet | 640-1024px | Tablets |
| Desktop | >1024px | Desktop |

---
*Last Updated: 2026-01-23*
