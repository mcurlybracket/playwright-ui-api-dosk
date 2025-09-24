import { test, expect } from '@playwright/test';

test.describe('Floor Plan Generation', () => {
  test('Generate floor plan from tour images', async ({ page }) => {
    await page.goto('/tour/t1');
    
    // Wait for tour to load
    await expect(page.locator('[data-test="viewer-canvas"]')).toBeVisible();
    
    // Click generate floor plan button
    await page.getByRole('button', { name: /generate floor plan/i }).click();
    
    // Verify loading state
    await expect(page.locator('[data-test="floorplan-loading"]')).toBeVisible();
    await expect(page.locator('[data-test="floorplan-loading"]')).toContainText('Generating floor plan...');
    
    // Wait for floor plan to be generated
    await expect(page.locator('[data-test="floorplan-canvas"]')).toBeVisible({ timeout: 10000 });
    
    // Verify floor plan elements
    await expect(page.locator('[data-test="room-living"]')).toBeVisible();
    await expect(page.locator('[data-test="room-kitchen"]')).toBeVisible();
    await expect(page.locator('[data-test="scale-indicator"]')).toContainText('Scale: 1m');
  });

  test('Floor plan generation with insufficient data', async ({ page }) => {
    await page.goto('/tour/t2'); // Tour with insufficient images
    
    await page.getByRole('button', { name: /generate floor plan/i }).click();
    
    // Verify error message
    await expect(page.locator('[data-test="floorplan-error"]')).toBeVisible();
    await expect(page.locator('[data-test="floorplan-error"]')).toContainText('Insufficient image data');
  });
});
