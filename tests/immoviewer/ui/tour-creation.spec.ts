import { test, expect } from '@playwright/test';

test.describe('Tour Creation Workflow', () => {
  test('Create new tour with property details', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click create tour button
    await page.locator('[data-test="create-tour-btn"]').click();
    
    // Fill in property details
    await page.getByPlaceholder('Property name').fill('Luxury Downtown Loft');
    await page.getByPlaceholder('Address').fill('123 Main St, New York, NY');
    await page.getByPlaceholder('Property type').selectOption('residential');
    
    // Upload mock 360° images
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      { name: 'room1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('mock image data 1') },
      { name: 'room2.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('mock image data 2') }
    ]);
    
    // Submit form
    await page.locator('#create-tour-form button[type="submit"]').click();
    
    // Verify tour appears in dashboard
    await expect(page.locator('[data-test="tour-card"]').last()).toContainText('Luxury Downtown Loft');
    await expect(page.locator('[data-test="tour-status"]').last()).toContainText('Processing');
  });

  test('Tour creation with validation errors', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('[data-test="create-tour-btn"]').click();
    
    // Wait for modal to be visible
    await expect(page.locator('[data-test="create-tour-modal"]')).toBeVisible();
    
    // Try to submit without required fields
    await page.locator('#create-tour-form button[type="submit"]').click();
    
    // Verify validation errors
    await expect(page.locator('[data-test="error-name"]')).toBeVisible();
    await expect(page.locator('[data-test="error-address"]')).toBeVisible();
    await expect(page.locator('[data-test="error-images"]')).toBeVisible();
  });
});
