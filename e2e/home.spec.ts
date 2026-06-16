// ==========================================
// Example E2E Test
// ==========================================

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, h2')).toBeVisible();
    await expect(page.locator('text=CariAir')).toBeVisible();
  });

  test('should navigate to sources page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Browse');
    await expect(page).toHaveURL(/.*sources.*/);
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to about page
    await page.click('text=About');
    await expect(page).toHaveURL('/about');
    
    // Navigate to map page
    await page.goto('/map');
    await expect(page).toHaveURL('/map');
  });
});

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
