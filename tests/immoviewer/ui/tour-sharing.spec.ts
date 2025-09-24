import { test, expect } from '@playwright/test';

test.describe('Tour Sharing Functionality', () => {
  test('Share tour via public link', async ({ page }) => {
    await page.goto('/tour/t1');
    
    // Click share button
    await page.getByRole('button', { name: /share/i }).click();
    
    // Select public link option
    await page.getByRole('radio', { name: /public link/i }).check();
    
    // Generate share link
    await page.getByRole('button', { name: /generate link/i }).click();
    
    // Verify share link is generated
    const shareLink = page.locator('[data-test="share-link"]');
    await expect(shareLink).toBeVisible();
    await expect(shareLink).toHaveValue(/https:\/\/tours\.example\.com\/t1/);
    
    // Test copy to clipboard
    await page.getByRole('button', { name: /copy link/i }).click();
    await expect(page.locator('[data-test="copy-success"]')).toContainText('Link copied!');
  });

  test('Share tour via email', async ({ page }) => {
    await page.goto('/tour/t1');
    
    await page.getByRole('button', { name: /share/i }).click();
    
    // Select email option
    await page.getByRole('radio', { name: /email/i }).check();
    
    // Fill email form
    await page.getByPlaceholder('Recipient email').fill('client@example.com');
    await page.getByPlaceholder('Message').fill('Check out this amazing property tour!');
    
    // Send email
    await page.getByRole('button', { name: /send email/i }).click();
    
    // Verify success message
    await expect(page.locator('[data-test="email-success"]')).toContainText('Tour shared successfully');
  });

  test('Share tour with custom settings', async ({ page }) => {
    await page.goto('/tour/t1');
    
    await page.getByRole('button', { name: /share/i }).click();
    
    // Wait for modal to be visible and select public link option
    await expect(page.locator('[data-test="share-modal"]')).toBeVisible();
    await page.getByRole('radio', { name: /public link/i }).check();
    
    // Wait for public link section to be visible
    await expect(page.locator('[data-test="public-link-section"]')).toBeVisible();
    
    // Configure sharing settings
    await page.locator('input[name="allow-downloads"]').check();
    await page.locator('input[name="require-password"]').check();
    await page.locator('input[name="password"]').fill('secure123');
    
    // Set expiration
    await page.getByRole('combobox', { name: /expires/i }).selectOption('7days');
    
    // Generate link
    await page.getByRole('button', { name: /generate link/i }).click();
    
    // Verify settings are applied
    await expect(page.locator('[data-test="share-settings"]')).toContainText('Require password');
    await expect(page.locator('[data-test="share-settings"]')).toContainText('7 days');
  });
});
