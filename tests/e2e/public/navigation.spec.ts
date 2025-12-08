import { test, expect } from '@playwright/test';

test.describe('Public navigation', () => {
  test('home loads and health endpoint works', async ({ page }) => {
    const base = process.env.BASE_URL ?? 'http://localhost:3000';
    const health = await page.request.get(`${base}/healthz`);
    expect(health.ok()).toBeTruthy();

    await page.goto(base);
    await expect(page).toHaveTitle(/LittleHelper/i);
  });
});
