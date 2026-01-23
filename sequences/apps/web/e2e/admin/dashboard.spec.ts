import { test, expect } from '@playwright/test';

// ============================================================================
// ADMIN DASHBOARD E2E TESTS
// ============================================================================

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/admin');
  });

  test('should redirect non-admin users', async ({ page }) => {
    // Non-admin users should be redirected
    await expect(page).toHaveURL(/.*login|.*storyboard|.*forbidden/);
  });
});

// ============================================================================
// ADMIN DASHBOARD LAYOUT TESTS (requires admin authentication)
// ============================================================================

test.describe('Admin Dashboard Layout', () => {
  test.skip('should display admin dashboard', async ({ page }) => {
    // Requires admin session
    await page.goto('/en/admin');
    
    // Check for admin title
    const title = page.getByRole('heading', { name: /admin|dashboard/i });
    await expect(title).toBeVisible();
  });

  test.skip('should have navigation sidebar', async ({ page }) => {
    await page.goto('/en/admin');
    
    const sidebar = page.locator('[data-testid="admin-sidebar"]').or(
      page.locator('nav').first()
    );
    await expect(sidebar).toBeVisible();
  });

  test.skip('should have dashboard menu item', async ({ page }) => {
    await page.goto('/en/admin');
    
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    await expect(dashboardLink).toBeVisible();
  });

  test.skip('should have users menu item', async ({ page }) => {
    await page.goto('/en/admin');
    
    const usersLink = page.getByRole('link', { name: /users/i });
    await expect(usersLink).toBeVisible();
  });

  test.skip('should have settings menu item', async ({ page }) => {
    await page.goto('/en/admin');
    
    const settingsLink = page.getByRole('link', { name: /settings/i });
    await expect(settingsLink).toBeVisible();
  });

  test.skip('should have quotes menu item', async ({ page }) => {
    await page.goto('/en/admin');
    
    const quotesLink = page.getByRole('link', { name: /quotes/i });
    await expect(quotesLink).toBeVisible();
  });
});

// ============================================================================
// ADMIN DASHBOARD STATS TESTS
// ============================================================================

test.describe('Admin Dashboard Stats', () => {
  test.skip('should display total users stat', async ({ page }) => {
    await page.goto('/en/admin');
    
    const usersStat = page.getByText(/total users/i);
    await expect(usersStat).toBeVisible();
  });

  test.skip('should display total sequences stat', async ({ page }) => {
    await page.goto('/en/admin');
    
    const sequencesStat = page.getByText(/total sequences/i);
    await expect(sequencesStat).toBeVisible();
  });

  test.skip('should display active users stat', async ({ page }) => {
    await page.goto('/en/admin');
    
    const activeUsersStat = page.getByText(/active users/i);
    await expect(activeUsersStat).toBeVisible();
  });

  test.skip('should display system status', async ({ page }) => {
    await page.goto('/en/admin');
    
    const systemStatus = page.getByText(/system status|status/i);
    await expect(systemStatus).toBeVisible();
  });
});

// ============================================================================
// ADMIN SYSTEM SETTINGS TESTS
// ============================================================================

test.describe('Admin System Settings', () => {
  test.skip('should display system settings form', async ({ page }) => {
    await page.goto('/en/admin/settings');
    
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test.skip('should have app name input', async ({ page }) => {
    await page.goto('/en/admin/settings');
    
    const appNameInput = page.locator('input[name="appName"]');
    await expect(appNameInput).toBeVisible();
  });

  test.skip('should have maintenance mode toggle', async ({ page }) => {
    await page.goto('/en/admin/settings');
    
    const maintenanceToggle = page.getByLabel(/maintenance/i);
    await expect(maintenanceToggle).toBeVisible();
  });

  test.skip('should have registration toggle', async ({ page }) => {
    await page.goto('/en/admin/settings');
    
    const registrationToggle = page.getByLabel(/registration/i);
    await expect(registrationToggle).toBeVisible();
  });

  test.skip('should have default theme selector', async ({ page }) => {
    await page.goto('/en/admin/settings');
    
    const themeSelector = page.getByText(/default theme/i);
    await expect(themeSelector).toBeVisible();
  });

  test.skip('should have default locale selector', async ({ page }) => {
    await page.goto('/en/admin/settings');
    
    const localeSelector = page.getByText(/default locale|default language/i);
    await expect(localeSelector).toBeVisible();
  });

  test.skip('should save settings successfully', async ({ page }) => {
    await page.goto('/en/admin/settings');
    
    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();
    
    // Should show success message
    const successMessage = page.getByText(/saved|success/i);
    await expect(successMessage).toBeVisible();
  });
});

// ============================================================================
// ADMIN QUOTES MANAGEMENT TESTS
// ============================================================================

test.describe('Admin Quotes Management', () => {
  test.skip('should display quotes list', async ({ page }) => {
    await page.goto('/en/admin/quotes');
    
    const quotesList = page.locator('[data-testid="quotes-list"]').or(
      page.locator('table')
    );
    await expect(quotesList).toBeVisible();
  });

  test.skip('should have add quote button', async ({ page }) => {
    await page.goto('/en/admin/quotes');
    
    const addButton = page.getByRole('button', { name: /add|create|new/i });
    await expect(addButton).toBeVisible();
  });

  test.skip('should open quote form on add button click', async ({ page }) => {
    await page.goto('/en/admin/quotes');
    
    const addButton = page.getByRole('button', { name: /add|create|new/i });
    await addButton.click();
    
    // Form or dialog should appear
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test.skip('should have quote text fields for all languages', async ({ page }) => {
    await page.goto('/en/admin/quotes');
    
    const addButton = page.getByRole('button', { name: /add|create|new/i });
    await addButton.click();
    
    const textEnInput = page.locator('textarea[name="textEn"]').or(
      page.getByLabel(/english text/i)
    );
    const textTrInput = page.locator('textarea[name="textTr"]').or(
      page.getByLabel(/turkish text/i)
    );
    const textNlInput = page.locator('textarea[name="textNl"]').or(
      page.getByLabel(/dutch text/i)
    );
    
    await expect(textEnInput).toBeVisible();
    await expect(textTrInput).toBeVisible();
    await expect(textNlInput).toBeVisible();
  });

  test.skip('should have author field', async ({ page }) => {
    await page.goto('/en/admin/quotes');
    
    const addButton = page.getByRole('button', { name: /add|create|new/i });
    await addButton.click();
    
    const authorInput = page.locator('input[name="author"]');
    await expect(authorInput).toBeVisible();
  });

  test.skip('should have category selector', async ({ page }) => {
    await page.goto('/en/admin/quotes');
    
    const addButton = page.getByRole('button', { name: /add|create|new/i });
    await addButton.click();
    
    const categorySelector = page.getByText(/category/i);
    await expect(categorySelector).toBeVisible();
  });
});

// ============================================================================
// ADMIN NAVIGATION TESTS
// ============================================================================

test.describe('Admin Navigation', () => {
  test.skip('should navigate to users page', async ({ page }) => {
    await page.goto('/en/admin');
    
    const usersLink = page.getByRole('link', { name: /users/i });
    await usersLink.click();
    
    await expect(page).toHaveURL(/.*admin.*users/);
  });

  test.skip('should navigate to settings page', async ({ page }) => {
    await page.goto('/en/admin');
    
    const settingsLink = page.getByRole('link', { name: /settings/i });
    await settingsLink.click();
    
    await expect(page).toHaveURL(/.*admin.*settings/);
  });

  test.skip('should navigate to quotes page', async ({ page }) => {
    await page.goto('/en/admin');
    
    const quotesLink = page.getByRole('link', { name: /quotes/i });
    await quotesLink.click();
    
    await expect(page).toHaveURL(/.*admin.*quotes/);
  });

  test.skip('should navigate back to dashboard', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    await dashboardLink.click();
    
    await expect(page).toHaveURL(/.*admin$/);
  });
});

// ============================================================================
// ADMIN RESPONSIVE TESTS
// ============================================================================

test.describe('Admin Responsive', () => {
  test.skip('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/admin');
    
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test.skip('should have mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/admin');
    
    // Mobile menu button should be visible
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
  });

  test.skip('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/en/admin');
    
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});
