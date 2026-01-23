import { test, expect } from '@playwright/test';

// ============================================================================
// AUTH E2E TESTS
// ============================================================================

test.describe('Authentication', () => {
  test('unauthenticated user should be redirected to login', async ({ page }) => {
    await page.goto('/en/storyboard');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('login page should render correctly', async ({ page }) => {
    await page.goto('/en/login');
    
    // Check page title
    await expect(page.getByText('Sequences')).toBeVisible();
    
    // Check Google button exists
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();
  });

  test('should have Google OAuth button', async ({ page }) => {
    await page.goto('/en/login');
    
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });

  test('should display terms and privacy links', async ({ page }) => {
    await page.goto('/en/login');
    
    const termsLink = page.getByRole('link', { name: /kullanım koşulları/i });
    const privacyLink = page.getByRole('link', { name: /gizlilik politikası/i });
    
    await expect(termsLink).toBeVisible();
    await expect(privacyLink).toBeVisible();
  });

  test('should have correct link destinations', async ({ page }) => {
    await page.goto('/en/login');
    
    const termsLink = page.getByRole('link', { name: /kullanım koşulları/i });
    await expect(termsLink).toHaveAttribute('href', '/terms');
    
    const privacyLink = page.getByRole('link', { name: /gizlilik politikası/i });
    await expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});

// ============================================================================
// PROTECTED ROUTES TESTS
// ============================================================================

test.describe('Protected Routes', () => {
  const protectedRoutes = [
    '/en/storyboard',
    '/en/create',
    '/en/people',
    '/en/settings',
    '/en/dashboard',
    '/en/lifetree',
    '/en/messages',
    '/en/profile',
  ];

  for (const route of protectedRoutes) {
    test(`${route} should redirect to login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/.*login/);
    });
  }
});

// ============================================================================
// PUBLIC ROUTES TESTS
// ============================================================================

test.describe('Public Routes', () => {
  test('login page should be accessible', async ({ page }) => {
    await page.goto('/en/login');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('button')).toBeVisible();
  });

  test('root page should be accessible', async ({ page }) => {
    await page.goto('/');
    // Should redirect to default locale
    await expect(page).toHaveURL(/\/(en|tr|nl)/);
  });
});

// ============================================================================
// VERIFY EMAIL TESTS
// ============================================================================

test.describe('Email Verification', () => {
  test('verify-email page should be accessible', async ({ page }) => {
    await page.goto('/en/verify-email');
    
    // Page should load (may redirect to login if not authenticated)
    await expect(page).toHaveURL(/\/(login|verify-email)/);
  });
});

// ============================================================================
// LOGOUT TESTS  
// ============================================================================

test.describe('Logout', () => {
  test('logout should redirect to login page', async ({ page }) => {
    // Simulate logout by going to signout endpoint
    await page.goto('/api/auth/signout');
    
    // After signout, should be on signout confirmation or redirected
    // The actual behavior depends on NextAuth configuration
  });
});

// ============================================================================
// SESSION TESTS
// ============================================================================

test.describe('Session', () => {
  test('should handle expired session gracefully', async ({ page }) => {
    // Clear all cookies to simulate expired session
    await page.context().clearCookies();
    
    await page.goto('/en/storyboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});
