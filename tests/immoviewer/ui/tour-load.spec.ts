import { test, expect } from '@playwright/test';

test('Tour loads and lead form works', async ({ page }) => {
  await page.goto('/tour/t1');
  await expect(page.locator('[data-test=viewer-canvas]')).toBeVisible();

  await page.locator('#lead input[name="name"]').fill('Alex QA');
  await page.locator('#lead input[name="email"]').fill('alex@example.com');
  await page.getByRole('checkbox', { name: /gdpr/i }).check();
  await page.getByRole('button', { name: /send/i }).click();
  await expect(page.locator('[data-test=thankyou]')).toHaveText(/Thanks/i);
});
