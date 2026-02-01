# Authentication Flows

> **NyoWorks Standard File** | Links to VoxPoll-specific documentation

This file follows NyoWorks manifesto structure. For complete user flows, see:

**Primary Source:** [06-UX/01-user-flows.md](../06-UX/01-user-flows.md)

**Related Documents:**
- [User Types](../02-USERS/01-user-types.md)
- [Verification Levels](../02-USERS/04-verification-levels.md)
- [Error States](../06-UX/03-error-states.md)

---

## Authentication Methods

VoxPoll supports multiple authentication methods:

### 1. Email/Password (Primary)
- **Hashing**: Argon2id (T-006)
- **Password Requirements**: Defined in validators
- **2FA Support**: TOTP via authenticator apps

### 2. Phone OTP (P3-001)
- SMS verification code
- Rate limited to prevent abuse

### 3. Magic Link (P3-003)
- Passwordless login via email
- Time-limited tokens

### 4. Passkey/WebAuthn (P3-004)
- Biometric authentication
- Hardware security key support

### 5. SSO for Organizations (P3-005)
- SAML 2.0
- OIDC (OpenID Connect)
- Enterprise integration

### 6. e-Devlet Integration (Turkey) (P3-006)
- National identity verification
- Automatic Level 4 verification

---

## Login Flow

```
User navigates to /login
    │
    ├─> Email/Password selected
    │   ├─> Credentials validated
    │   ├─> 2FA required? → TOTP verification
    │   └─> JWT tokens issued
    │       ├─> Access token (15 min)
    │       └─> Refresh token (7 days)
    │
    ├─> Phone OTP selected
    │   ├─> Phone number entered
    │   ├─> OTP sent via SMS
    │   ├─> OTP verified
    │   └─> JWT tokens issued
    │
    ├─> Magic Link selected
    │   ├─> Email entered
    │   ├─> Magic link sent
    │   ├─> User clicks link
    │   └─> JWT tokens issued
    │
    └─> SSO selected (organizations only)
        ├─> Redirect to IdP
        ├─> SAML/OIDC authentication
        ├─> Callback to VoxPoll
        └─> JWT tokens issued
```

---

## Registration Flow

```
User navigates to /register
    │
    ├─> Required fields:
    │   ├─> Email (unique)
    │   ├─> Username (unique, alphanumeric)
    │   ├─> Password (min 8 chars, complexity rules)
    │   └─> Display name
    │
    ├─> Email verification
    │   ├─> Verification email sent
    │   ├─> User clicks verification link
    │   └─> Email verified
    │
    ├─> Initial verification level: 0
    │   └─> Can be upgraded via phone, ID, etc.
    │
    └─> Account created
        └─> Redirect to onboarding
```

---

## Token Management

### Access Token (JWT)
- **Expiry**: 15 minutes
- **Storage**: Memory only (not localStorage)
- **Claims**: userId, role, verificationLevel

### Refresh Token
- **Expiry**: 7 days
- **Storage**: HttpOnly, Secure, SameSite=Strict cookie
- **Single-use**: Rotated on refresh
- **Revocable**: Stored in database

### Token Refresh Flow
```
Access token expires
    │
    └─> Client sends refresh token
        ├─> Server validates refresh token
        ├─> Old refresh token invalidated
        ├─> New access + refresh tokens issued
        └─> Client updates tokens
```

---

## Session Management

- **Concurrent sessions**: Allowed (tracked in database)
- **Session timeout**: 7 days (refresh token expiry)
- **Force logout**: Revoke all refresh tokens for user

---

## Security Features

### Rate Limiting
- Login attempts: 5 per 15 minutes per IP
- Registration: 3 per hour per IP
- Password reset: 3 per hour per email

### CAPTCHA
- Triggered after 3 failed login attempts
- Required for registration from suspicious IPs

### Account Lockout
- After 10 failed login attempts
- Manual unlock required (support ticket)

---

## Error Handling

See [06-UX/03-error-states.md](../06-UX/03-error-states.md) for complete error scenarios.

Common errors:
- Invalid credentials
- Account not verified
- Account locked
- 2FA code invalid
- Session expired

---

*For complete flows including organization features, refer to 06-UX/01-user-flows.md*
