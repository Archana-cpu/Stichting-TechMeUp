# Google OAuth Test Checklist

This document provides a manual testing checklist for Google OAuth authentication flow in the Sequences application.

## Prerequisites

- [ ] Google Cloud Console project created
- [ ] OAuth 2.0 credentials (Client ID and Client Secret) created
- [ ] `.env` file configured with:
  - `AUTH_GOOGLE_ID` - Google OAuth Client ID
  - `AUTH_GOOGLE_SECRET` - Google OAuth Client Secret
  - `AUTH_URL` - Application URL (e.g., `http://localhost:3000` for development)
  - `AUTH_SECRET` - NextAuth secret (auto-generated or manually set)
  - `AUTH_TRUST_HOST=true` - Required for development

## Google Cloud Console Configuration

### 1. OAuth Consent Screen
- [ ] OAuth consent screen configured
- [ ] Application name set to "Sequences"
- [ ] User support email configured
- [ ] Developer contact information added
- [ ] Scopes added (if needed):
  - `openid`
  - `email`
  - `profile`

### 2. OAuth Credentials
- [ ] OAuth 2.0 Client ID created
- [ ] Application type: Web application
- [ ] Authorized JavaScript origins:
  - `http://localhost:3000` (development)
  - `https://yourdomain.com` (production)
- [ ] Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (development)
  - `https://yourdomain.com/api/auth/callback/google` (production)

## Application Configuration

### 1. Environment Variables
- [ ] `.env` file exists in `apps/web/` directory
- [ ] `AUTH_GOOGLE_ID` matches Google Cloud Console Client ID
- [ ] `AUTH_GOOGLE_SECRET` matches Google Cloud Console Client Secret
- [ ] `AUTH_URL` matches the application URL
- [ ] `AUTH_SECRET` is set (can be generated with `openssl rand -base64 32`)

### 2. Database
- [ ] PostgreSQL database running (via Docker or local)
- [ ] `DATABASE_URL` configured in `.env`
- [ ] Prisma migrations applied (`pnpm db:push` or `pnpm db:migrate`)

## Manual Test Steps

### Test 1: Login Page Display
1. [ ] Navigate to `/login` or root URL
2. [ ] Verify login page loads correctly
3. [ ] Verify "Continue with Google" button is visible
4. [ ] Verify button has Google icon
5. [ ] Verify button text is correct (i18n aware)

### Test 2: OAuth Flow Initiation
1. [ ] Click "Continue with Google" button
2. [ ] Verify redirect to Google OAuth consent screen
3. [ ] Verify Google account selection screen appears
4. [ ] Select a Google account
5. [ ] Verify consent screen shows correct app name ("Sequences")
6. [ ] Verify requested permissions are displayed

### Test 3: OAuth Callback
1. [ ] Grant permissions on Google consent screen
2. [ ] Verify redirect back to application
3. [ ] Verify callback URL is correct: `/api/auth/callback/google`
4. [ ] Check browser console for errors
5. [ ] Verify no 500 errors in server logs

### Test 4: Session Creation
1. [ ] After successful OAuth callback
2. [ ] Verify redirect to `/storyboard` (or configured callback URL)
3. [ ] Verify user is authenticated (check navigation for user menu)
4. [ ] Verify session cookie is set in browser
5. [ ] Check database for new User record (if first time login)
6. [ ] Verify User record has:
   - `email` from Google account
   - `name` from Google account (if available)
   - `image` from Google account (if available)
   - `emailVerified` timestamp set

### Test 5: New User Onboarding
1. [ ] Login with a new Google account (never used before)
2. [ ] Verify redirect to `/onboarding` page
3. [ ] Verify onboarding wizard displays
4. [ ] Complete onboarding steps
5. [ ] Verify redirect to `/storyboard` after completion

### Test 6: Returning User Flow
1. [ ] Login with existing Google account
2. [ ] Verify direct redirect to `/storyboard` (skip onboarding)
3. [ ] Verify user data is loaded correctly
4. [ ] Verify user settings are preserved

### Test 7: Protected Routes
1. [ ] While logged out, try to access `/storyboard`
2. [ ] Verify redirect to `/login`
3. [ ] After login, verify access to protected routes:
   - `/storyboard`
   - `/create`
   - `/profile`
   - `/settings`
   - `/lifetree`
   - `/messages`

### Test 8: Logout
1. [ ] Click logout button in user menu
2. [ ] Verify session is cleared
3. [ ] Verify redirect to login page or home
4. [ ] Verify protected routes are inaccessible after logout

### Test 9: Error Handling
1. [ ] Test with invalid Google credentials (wrong Client ID)
2. [ ] Verify appropriate error message displayed
3. [ ] Test with revoked OAuth consent
4. [ ] Verify error handling works correctly
5. [ ] Check server logs for detailed error information

### Test 10: Multiple Accounts
1. [ ] Login with Google Account A
2. [ ] Logout
3. [ ] Login with Google Account B
4. [ ] Verify separate user accounts are created
5. [ ] Verify data isolation between accounts

## Troubleshooting

### Common Issues

#### Issue: "Redirect URI mismatch"
- **Solution**: Verify redirect URI in Google Cloud Console matches exactly: `http://localhost:3000/api/auth/callback/google`
- Check for trailing slashes or protocol mismatches (http vs https)

#### Issue: "Invalid client secret"
- **Solution**: Verify `AUTH_GOOGLE_SECRET` in `.env` matches Google Cloud Console
- Ensure no extra spaces or quotes in `.env` file

#### Issue: "Session not persisting"
- **Solution**: Verify `AUTH_SECRET` is set in `.env`
- Check that cookies are enabled in browser
- Verify `AUTH_TRUST_HOST=true` for development

#### Issue: "Database connection error"
- **Solution**: Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run `pnpm db:push` to ensure schema is up to date

#### Issue: "Onboarding loop"
- **Solution**: Check `onboardingComplete` field in User table
- Verify protected layout logic in `(protected)/layout.tsx`

## Verification Points

After completing all tests, verify:

- [ ] OAuth flow works in development environment
- [ ] OAuth flow works in production environment (if deployed)
- [ ] User data is correctly stored in database
- [ ] Session management works correctly
- [ ] Protected routes are properly guarded
- [ ] Error messages are user-friendly
- [ ] Logout functionality works
- [ ] Multiple user accounts work independently

## Notes

- This is a **manual testing checklist** - not automated tests
- Some tests require multiple Google accounts
- Production testing requires production OAuth credentials
- Keep OAuth credentials secure and never commit to version control
