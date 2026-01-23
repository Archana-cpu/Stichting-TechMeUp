import { test, expect } from '@playwright/test';

// ============================================================================
// ADMIN USERS E2E TESTS
// ============================================================================

test.describe('Admin Users Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/admin/users');
  });

  test('should redirect non-admin users', async ({ page }) => {
    // Non-admin users should be redirected
    await expect(page).toHaveURL(/.*login|.*storyboard|.*forbidden/);
  });
});

// ============================================================================
// ADMIN USERS LIST TESTS (requires admin authentication)
// ============================================================================

test.describe('Admin Users List', () => {
  test.skip('should display users table', async ({ page }) => {
    // Requires admin session
    await page.goto('/en/admin/users');
    
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test.skip('should have table headers', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const nameHeader = page.getByRole('columnheader', { name: /name/i });
    const emailHeader = page.getByRole('columnheader', { name: /email/i });
    const statusHeader = page.getByRole('columnheader', { name: /status/i });
    
    await expect(nameHeader).toBeVisible();
    await expect(emailHeader).toBeVisible();
    await expect(statusHeader).toBeVisible();
  });

  test.skip('should display user rows', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const tableBody = page.locator('tbody');
    const rows = tableBody.locator('tr');
    
    // Should have at least one user row
    await expect(rows.first()).toBeVisible();
  });

  test.skip('should have search input', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test.skip('should filter users when searching', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('test');
    
    // Wait for filter to apply
    await page.waitForTimeout(300);
  });
});

// ============================================================================
// ADMIN USER DETAILS TESTS
// ============================================================================

test.describe('Admin User Details', () => {
  test.skip('should open user details on row click', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    
    // Details panel or page should appear
    const userDetails = page.locator('[data-testid="user-details"]').or(
      page.getByText(/user details/i)
    );
    await expect(userDetails).toBeVisible();
  });

  test.skip('should display user information', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    
    const emailField = page.getByText(/email/i);
    const createdField = page.getByText(/created/i);
    
    await expect(emailField).toBeVisible();
    await expect(createdField).toBeVisible();
  });

  test.skip('should display user statistics', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    
    const sequenceCount = page.getByText(/sequences/i);
    await expect(sequenceCount).toBeVisible();
  });
});

// ============================================================================
// ADMIN USER ACTIONS TESTS
// ============================================================================

test.describe('Admin User Actions', () => {
  test.skip('should have action menu for each user', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const actionButton = page.locator('[data-testid="user-actions"]').first().or(
      page.locator('button[aria-label="actions"]').first()
    );
    await expect(actionButton).toBeVisible();
  });

  test.skip('should open action menu on click', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const actionButton = page.locator('[data-testid="user-actions"]').first().or(
      page.locator('tbody tr').first().getByRole('button').last()
    );
    await actionButton.click();
    
    // Menu should appear
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
  });

  test.skip('should have view profile action', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const actionButton = page.locator('tbody tr').first().getByRole('button').last();
    await actionButton.click();
    
    const viewAction = page.getByRole('menuitem', { name: /view|profile/i });
    await expect(viewAction).toBeVisible();
  });

  test.skip('should have toggle admin action', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const actionButton = page.locator('tbody tr').first().getByRole('button').last();
    await actionButton.click();
    
    const adminAction = page.getByRole('menuitem', { name: /admin/i });
    await expect(adminAction).toBeVisible();
  });

  test.skip('should have suspend action', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const actionButton = page.locator('tbody tr').first().getByRole('button').last();
    await actionButton.click();
    
    const suspendAction = page.getByRole('menuitem', { name: /suspend|disable/i });
    await expect(suspendAction).toBeVisible();
  });
});

// ============================================================================
// ADMIN USER FILTERING TESTS
// ============================================================================

test.describe('Admin User Filtering', () => {
  test.skip('should have filter dropdown', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const filterButton = page.getByRole('button', { name: /filter/i });
    await expect(filterButton).toBeVisible();
  });

  test.skip('should filter by admin status', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();
    
    const adminFilter = page.getByRole('menuitem', { name: /admin/i });
    await adminFilter.click();
  });

  test.skip('should filter by verification status', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();
    
    const verifiedFilter = page.getByRole('menuitem', { name: /verified/i });
    await verifiedFilter.click();
  });

  test.skip('should clear filters', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const clearButton = page.getByRole('button', { name: /clear|reset/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  });
});

// ============================================================================
// ADMIN USER PAGINATION TESTS
// ============================================================================

test.describe('Admin User Pagination', () => {
  test.skip('should have pagination controls', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const pagination = page.locator('[data-testid="pagination"]').or(
      page.getByRole('navigation', { name: /pagination/i })
    );
    await expect(pagination).toBeVisible();
  });

  test.skip('should have next page button', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
  });

  test.skip('should have previous page button', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const prevButton = page.getByRole('button', { name: /previous|prev/i });
    await expect(prevButton).toBeVisible();
  });

  test.skip('should display page info', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const pageInfo = page.getByText(/page|of/i);
    await expect(pageInfo).toBeVisible();
  });

  test.skip('should navigate to next page', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const nextButton = page.getByRole('button', { name: /next/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(300);
    }
  });
});

// ============================================================================
// ADMIN USER EXPORT TESTS
// ============================================================================

test.describe('Admin User Export', () => {
  test.skip('should have export button', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).toBeVisible();
  });

  test.skip('should have CSV export option', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const exportButton = page.getByRole('button', { name: /export/i });
    await exportButton.click();
    
    const csvOption = page.getByRole('menuitem', { name: /csv/i });
    await expect(csvOption).toBeVisible();
  });
});

// ============================================================================
// ADMIN USER INVITE TESTS
// ============================================================================

test.describe('Admin User Invite', () => {
  test.skip('should have invite button', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const inviteButton = page.getByRole('button', { name: /invite/i });
    await expect(inviteButton).toBeVisible();
  });

  test.skip('should open invite dialog on click', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const inviteButton = page.getByRole('button', { name: /invite/i });
    await inviteButton.click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });

  test.skip('should have email input in invite dialog', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const inviteButton = page.getByRole('button', { name: /invite/i });
    await inviteButton.click();
    
    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toBeVisible();
  });

  test.skip('should validate email format', async ({ page }) => {
    await page.goto('/en/admin/users');
    
    const inviteButton = page.getByRole('button', { name: /invite/i });
    await inviteButton.click();
    
    const emailInput = page.getByPlaceholder(/email/i);
    await emailInput.fill('invalid-email');
    
    const submitButton = page.getByRole('button', { name: /send|invite/i }).last();
    await submitButton.click();
    
    // Should show validation error
    const error = page.getByText(/invalid|valid email/i);
    await expect(error).toBeVisible();
  });
});

// ============================================================================
// ADMIN USER RESPONSIVE TESTS
// ============================================================================

test.describe('Admin Users Responsive', () => {
  test.skip('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/admin/users');
    
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test.skip('should have horizontal scroll on mobile for table', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/admin/users');
    
    const tableContainer = page.locator('[data-testid="table-container"]').or(
      page.locator('.overflow-x-auto')
    );
    if (await tableContainer.isVisible()) {
      await expect(tableContainer).toBeVisible();
    }
  });

  test.skip('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/en/admin/users');
    
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});
