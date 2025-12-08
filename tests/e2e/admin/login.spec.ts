import { test, expect } from '@playwright/test';

test.describe('Admin auth placeholder', () => {
  test('shows login prompt when unauthenticated', async ({ page }) => {
    const base = process.env.BASE_URL ?? 'http://localhost:3000';
    await page.goto(`${base}/admin`);
    await expect(page.getByText(/Sign In Required/i)).toBeVisible();
  });
});
