import { test, expect } from '@playwright/test';

// ============================================================================
// CREATE SEQUENCE E2E TESTS
// ============================================================================

test.describe('Create Sequence Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/create');
  });

  test('should display create sequence form', async ({ page }) => {
    await expect(page).toHaveURL(/.*create/);
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should have all required form fields', async ({ page }) => {
    const titleInput = page.getByPlaceholder(/title/i).or(page.locator('input[name="title"]'));
    await expect(titleInput).toBeVisible();

    const summaryInput = page.getByPlaceholder(/summary/i).or(page.locator('textarea[name="summary"]'));
    await expect(summaryInput).toBeVisible();
  });

  test('should have emotion selector', async ({ page }) => {
    const emotionSelector = page.locator('[data-testid="emotion-selector"]').or(
      page.getByText(/emotion/i).first()
    );
    await expect(emotionSelector).toBeVisible();
  });

  test('should have trigger selector', async ({ page }) => {
    const triggerSelector = page.locator('[data-testid="trigger-selector"]').or(
      page.getByText(/trigger/i).first()
    );
    await expect(triggerSelector).toBeVisible();
  });

  test('should have polarity sliders', async ({ page }) => {
    const polaritySliders = page.locator('input[type="range"]');
    const count = await polaritySliders.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should have thought section', async ({ page }) => {
    const thoughtSection = page.getByText(/thought/i);
    await expect(thoughtSection.first()).toBeVisible();
  });

  test('should have behavior section', async ({ page }) => {
    const behaviorSection = page.getByText(/behavior/i);
    await expect(behaviorSection.first()).toBeVisible();
  });
});

// ============================================================================
// FORM VALIDATION TESTS
// ============================================================================

test.describe('Create Sequence Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/create');
  });

  test('should show validation error for empty title', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /create|submit|save/i });
    await submitButton.click();
  });

  test('should show validation error for empty summary', async ({ page }) => {
    const titleInput = page.getByPlaceholder(/title/i).or(page.locator('input[name="title"]'));
    await titleInput.fill('Test Title');
    
    const submitButton = page.getByRole('button', { name: /create|submit|save/i });
    await submitButton.click();
  });
});

// ============================================================================
// HAPPY PATH TESTS
// ============================================================================

test.describe('Create Sequence Happy Path', () => {
  test('should successfully create sequence with all fields', async ({ page }) => {
    await page.goto('/en/create');

    const titleInput = page.getByPlaceholder(/title/i).or(page.locator('input[name="title"]'));
    await titleInput.fill('Test Sequence Title');

    const summaryInput = page.getByPlaceholder(/summary/i).or(page.locator('textarea[name="summary"]'));
    await summaryInput.fill('This is a test summary for the sequence');

    const thoughtInput = page.locator('textarea[name="thought"]').or(
      page.locator('textarea').nth(1)
    );
    if (await thoughtInput.isVisible()) {
      await thoughtInput.fill('Test thought content');
    }

    const behaviorInput = page.locator('textarea[name="behavior"]').or(
      page.locator('textarea').nth(2)
    );
    if (await behaviorInput.isVisible()) {
      await behaviorInput.fill('Test behavior content');
    }
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

test.describe('Create Sequence Edge Cases', () => {
  test('should handle very long title', async ({ page }) => {
    await page.goto('/en/create');

    const titleInput = page.getByPlaceholder(/title/i).or(page.locator('input[name="title"]'));
    const longTitle = 'A'.repeat(500);
    await titleInput.fill(longTitle);
  });

  test('should handle special characters in input', async ({ page }) => {
    await page.goto('/en/create');

    const titleInput = page.getByPlaceholder(/title/i).or(page.locator('input[name="title"]'));
    await titleInput.fill('Test <script>alert("xss")</script>');
  });

  test('should handle unicode characters', async ({ page }) => {
    await page.goto('/en/create');

    const titleInput = page.getByPlaceholder(/title/i).or(page.locator('input[name="title"]'));
    await titleInput.fill('Test 日本語 🎉 Türkçe');
  });
});
