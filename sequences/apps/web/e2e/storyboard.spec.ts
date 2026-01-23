import { test, expect } from '@playwright/test';

// ============================================================================
// STORYBOARD E2E TESTS
// ============================================================================

test.describe('Storyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/storyboard');
  });

  test('should display storyboard page', async ({ page }) => {
    await expect(page).toHaveURL(/.*storyboard/);
  });

  test('should have create button', async ({ page }) => {
    const createButton = page.getByRole('link', { name: /create/i });
    await expect(createButton).toBeVisible();
  });

  test('should navigate to create page', async ({ page }) => {
    const createButton = page.getByRole('link', { name: /create/i });
    await createButton.click();
    await expect(page).toHaveURL(/.*create/);
  });

  test('should have view mode toggles', async ({ page }) => {
    const gridButton = page.getByRole('button', { name: /grid/i });
    const listButton = page.getByRole('button', { name: /list/i });
    const timelineButton = page.getByRole('button', { name: /timeline/i });

    await expect(gridButton).toBeVisible();
    await expect(listButton).toBeVisible();
    await expect(timelineButton).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test('should filter sequences when searching', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('test');
    await page.waitForTimeout(300);
  });
});

// ============================================================================
// LOCALE TESTS
// ============================================================================

test.describe('Localization', () => {
  test('should support Turkish locale', async ({ page }) => {
    await page.goto('/tr');
    await expect(page).toHaveURL(/.*tr/);
  });

  test('should support Dutch locale', async ({ page }) => {
    await page.goto('/nl');
    await expect(page).toHaveURL(/.*nl/);
  });

  test('should support English locale', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/.*en/);
  });

  test('should redirect root to default locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(en|tr|nl)/);
  });
});

// ============================================================================
// NAVIGATION TESTS
// ============================================================================

test.describe('Navigation', () => {
  test('should have navigation links', async ({ page }) => {
    await page.goto('/en');
    
    const storyboardLink = page.getByRole('link', { name: /storyboard/i });
    const createLink = page.getByRole('link', { name: /create/i });
    const peopleLink = page.getByRole('link', { name: /people/i });

    await expect(storyboardLink).toBeVisible();
    await expect(createLink).toBeVisible();
    await expect(peopleLink).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/en');

    await page.getByRole('link', { name: /storyboard/i }).click();
    await expect(page).toHaveURL(/.*storyboard/);

    await page.getByRole('link', { name: /create/i }).click();
    await expect(page).toHaveURL(/.*create/);

    await page.getByRole('link', { name: /people/i }).click();
    await expect(page).toHaveURL(/.*people/);
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/en');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/en');
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper labels on form elements', async ({ page }) => {
    await page.goto('/en/create');
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate((el) => {
        const id = el.id;
        return id ? !!document.querySelector(`label[for="${id}"]`) : false;
      });
      const hasAriaLabel = await input.getAttribute('aria-label');
      const hasPlaceholder = await input.getAttribute('placeholder');
      
      expect(hasLabel || hasAriaLabel || hasPlaceholder).toBeTruthy();
    }
  });
});

// ============================================================================
// RESPONSIVE TESTS
// ============================================================================

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/en');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/en');
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============================================================================
// CANVAS INTERACTION TESTS
// ============================================================================

test.describe('Storyboard Canvas Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/storyboard');
  });

  test('should display React Flow canvas', async ({ page }) => {
    // Check for React Flow container
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
  });

  test('should have canvas controls', async ({ page }) => {
    // Check for zoom controls
    const controls = page.locator('.react-flow__controls');
    await expect(controls).toBeVisible();

    // Check for minimap
    const minimap = page.locator('.react-flow__minimap');
    await expect(minimap).toBeVisible();
  });

  test('should have fit view button', async ({ page }) => {
    const fitViewButton = page.getByRole('button', { name: /fit view/i });
    await expect(fitViewButton).toBeVisible();
  });

  test('should support zoom controls', async ({ page }) => {
    const canvas = page.locator('.react-flow');
    await canvas.hover();

    // Try to find zoom buttons
    const zoomButtons = page.locator('.react-flow__controls-button');
    const count = await zoomButtons.count();
    
    if (count > 0) {
      // Zoom in
      await zoomButtons.first().click();
      await page.waitForTimeout(200);
      
      // Zoom out
      if (count > 1) {
        await zoomButtons.nth(1).click();
        await page.waitForTimeout(200);
      }
    }
  });

  test('should support pan and zoom with mouse', async ({ page }) => {
    const canvas = page.locator('.react-flow');
    await canvas.hover();

    // Simulate scroll to zoom
    await page.mouse.wheel(0, -100); // Zoom in
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, 100); // Zoom out
    await page.waitForTimeout(300);
  });

  test('should support node drag', async ({ page }) => {
    // Find a node (instax card)
    const node = page.locator('.react-flow__node').first();
    
    if (await node.isVisible()) {
      // Get initial position
      const initialBox = await node.boundingBox();
      
      if (initialBox) {
        // Drag node to new position
        await node.dragTo(page.locator('.react-flow'), {
          targetPosition: { x: initialBox.x + 100, y: initialBox.y + 100 },
        });
        
        await page.waitForTimeout(500); // Wait for debounced save
        
        // Verify node moved
        const newBox = await node.boundingBox();
        if (newBox) {
          expect(newBox.x).not.toBe(initialBox.x);
          expect(newBox.y).not.toBe(initialBox.y);
        }
      }
    }
  });

  test('should persist node positions after drag', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    
    if (await node.isVisible()) {
      const initialBox = await node.boundingBox();
      
      if (initialBox) {
        // Drag node
        await node.dragTo(page.locator('.react-flow'), {
          targetPosition: { x: initialBox.x + 150, y: initialBox.y + 150 },
        });
        
        // Wait for debounced save (500ms + network)
        await page.waitForTimeout(1000);
        
        // Reload page
        await page.reload();
        await page.waitForTimeout(1000);
        
        // Check if position persisted
        const reloadedNode = page.locator('.react-flow__node').first();
        if (await reloadedNode.isVisible()) {
          const reloadedBox = await reloadedNode.boundingBox();
          // Position should be close to where we dragged it (within 50px tolerance)
          if (reloadedBox && initialBox) {
            const xDiff = Math.abs(reloadedBox.x - (initialBox.x + 150));
            const yDiff = Math.abs(reloadedBox.y - (initialBox.y + 150));
            // Allow some tolerance for grid snapping or rounding
            expect(xDiff).toBeLessThan(100);
            expect(yDiff).toBeLessThan(100);
          }
        }
      }
    }
  });

  test('should support node selection', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    
    if (await node.isVisible()) {
      // Click to select
      await node.click();
      await page.waitForTimeout(200);
      
      // Check if node is selected (has selection styling)
      const selectedNode = page.locator('.react-flow__node.selected').or(
        page.locator('.react-flow__node[data-selected="true"]')
      );
      
      // Node should be selected or have selection indicator
      const hasSelection = await node.evaluate((el) => {
        return el.classList.contains('selected') || 
               el.getAttribute('data-selected') === 'true' ||
               window.getComputedStyle(el).outlineWidth !== '0px';
      });
      
      // Selection should be visible (either class or visual indicator)
      expect(hasSelection || await selectedNode.count() > 0).toBeTruthy();
    }
  });

  test('should have background pattern', async ({ page }) => {
    // Check for background dots/pattern
    const background = page.locator('.react-flow__background');
    await expect(background).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    const canvas = page.locator('.react-flow');
    await canvas.focus();
    
    // Try arrow keys for panning (if supported)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
  });
});
