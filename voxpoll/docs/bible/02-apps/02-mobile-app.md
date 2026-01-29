# Mobile Application Specification

> VoxPoll Mobile Client
> Platform: React Native (iOS + Android)
> Last Updated: 2026-01-29

---

## Overview

**Repository**: `packages/mobile/`
**Framework**: React Native 0.81 + Expo SDK 54
**Navigation**: Expo Router v6 (file-based routing)
**Styling**: NativeWind v4 (Tailwind for React Native)
**State Management**: TanStack Query v5
**Deployment**: EAS (Expo Application Services)

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React Native | 0.81 |
| SDK | Expo | 54 |
| React | React | 19.1.0 |
| TypeScript | TypeScript | 5.7+ |
| Navigation | Expo Router | 6.x |
| Styling | NativeWind | 4.x |
| State (Server) | TanStack Query | 5.x |
| Forms | React Hook Form | 7.x |
| Validation | Zod | 3.x |

---

## Key Features

### Supported Platforms
- iOS 14+
- Android 8.0+

### Core Features
- Poll creation & voting
- Live poll participation
- Survey & quiz taking
- User profiles
- Push notifications
- Offline support (vote caching)
- Camera integration (avatar upload)
- Biometric authentication

---

## Application Structure

```
packages/mobile/
├── app/                   # Expo Router (file-based routing)
│   ├── (tabs)/           # Bottom tab navigation
│   ├── (auth)/           # Auth-required screens
│   ├── _layout.tsx       # Root layout
│   └── index.tsx         # Home screen
├── components/           # React Native components
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── features/        # Feature-specific
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   ├── storage.ts       # AsyncStorage wrapper
│   └── utils.ts         # Generic utils
├── hooks/                # Custom hooks
├── assets/               # Images, fonts
└── app.json             # Expo config
```

---

## Navigation

### Tab Navigation (Bottom Tabs)

| Tab | Icon | Screen | Description |
|-----|------|--------|-------------|
| Home | House | `(tabs)/index.tsx` | Feed & trending polls |
| Create | Plus | `(tabs)/create.tsx` | Create poll/survey |
| Live | Broadcast | `(tabs)/live.tsx` | Live poll sessions |
| Notifications | Bell | `(tabs)/notifications.tsx` | Activity feed |
| Profile | User | `(tabs)/profile.tsx` | User profile |

### Stack Navigation

**Modal Screens**:
- Poll voting modal
- Settings screen
- Edit profile
- Subscription modal

---

## API Integration

**Shared API Client**: Uses same `@voxpoll/shared/api` as web

**Differences**:
- Token storage: AsyncStorage (instead of cookies)
- Network detection: NetInfo
- Offline queue: Local storage + sync on reconnect

---

## Push Notifications

**Provider**: Expo Notifications

**Notification Types**:
- New follower
- Poll comment
- Live poll starting
- Poll result update
- Subscription reminder

**Implementation**:
```typescript
import * as Notifications from 'expo-notifications'

// Register for push notifications
const { status } = await Notifications.requestPermissionsAsync()
const token = await Notifications.getExpoPushTokenAsync()

// Send token to backend
await api.users.updatePushToken(token)
```

---

## Offline Support

**Strategy**:
- Cache poll data (TanStack Query)
- Queue votes when offline
- Sync on reconnect

**Implementation**:
```typescript
import NetInfo from '@react-native-community/netinfo'

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    syncOfflineVotes()
  }
})
```

---

## Biometric Authentication

**Library**: `expo-local-authentication`

**Use Cases**:
- Quick login (after initial auth)
- Payment confirmation
- Sensitive settings changes

---

## Camera Integration

**Library**: `expo-image-picker`

**Use Cases**:
- Avatar upload
- Poll image attachment

---

## Build & Deployment

### Development Build

```bash
# iOS Simulator
pnpm ios

# Android Emulator
pnpm android
```

### Production Build

**EAS Build**:
```bash
# Build for iOS App Store
eas build --platform ios --profile production

# Build for Google Play
eas build --platform android --profile production
```

**App Stores**:
- **iOS**: App Store Connect
- **Android**: Google Play Console

---

## Performance Optimization

- **Hermes Engine**: Enabled for Android (faster startup)
- **Image Optimization**: WebP format, lazy loading
- **List Virtualization**: FlatList for long lists
- **Code Splitting**: Dynamic imports for heavy features

---

## Related Documentation

- **API Contract**: [05-api/01-api-contract.md](c:\Users\PC\Documents\naim\projects\voxpoll\docs\bible\05-api\01-api-contract.md)
- **Web App**: [01-web-app.md](c:\Users\PC\Documents\naim\projects\voxpoll\docs\bible\02-apps\01-web-app.md)

---

*NyoWorks Application Specification - Mobile App v1*
