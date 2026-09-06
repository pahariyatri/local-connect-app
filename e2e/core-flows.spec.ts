import { test, expect } from '@playwright/test';

test.describe('Pahari Yatri Core Flows', () => {
  test('Landing page renders correctly and locale is preserved', async ({ page, isMobile }) => {
    await page.goto('/en');
    
    // Check Header
    await expect(page.getByRole('link', { name: /Pahari Yatri/i }).first()).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole('link', { name: /Explore/i }).first()).toBeVisible();
    }
    
    // Check Footer
    await expect(page.locator('footer')).toContainText('Pahari Yatri');
    
    // Navigate to Plan Trip and ensure locale is preserved
    if (!isMobile) {
      const planTripLink = page.getByRole('link', { name: /Plan a Trip/i }).first();
      await expect(planTripLink).toBeVisible();
      await planTripLink.click();
    } else {
      await page.goto('/en/builder');
    }
    await expect(page).toHaveURL(/\/en\/builder/);
  });

  test('Landing page has exactly one hero — regression for the 2026-08-11 duplicate-hero bug', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText(/know/i);
  });

  test('Landing hero has a real destination search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Where are you going?');
    await page.goto('/en');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Kasol');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/explore\?q=Kasol/);
  });

  test('Mobile navigation works correctly', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile only test');
    
    await page.goto('/en');
    
    // Check mobile bottom navigation
    const bottomNav = page.locator('#mobile-bottom-navigation');
    await expect(bottomNav).toBeVisible({ timeout: 10_000 });
    
    // Navigate via bottom nav link
    const builderLink = bottomNav.locator('a[href*="/builder"]');
    await expect(builderLink).toBeVisible();
    await builderLink.click({ force: true });
    await expect(page).toHaveURL(/\/en\/builder/);
  });

  test('Explore page search and location filter', async ({ page }) => {
    await page.goto('/en/explore');

    // Check search input
    const searchInput = page.locator('input[id="explore-search"]');
    await expect(searchInput).toBeVisible();

    // Typing searches real inventory directly — unmatched query shows zero-result recovery state
    await searchInput.fill('UnknownLocation123');
    await expect(page.getByTestId('explore-zero-result')).toBeVisible({ timeout: 10_000 });

    // Clear search resets search state
    await page.getByRole('button', { name: /Clear search/i }).click();
    await expect(searchInput).toHaveValue('');

    // Check location input
    const locationInput = page.locator('input[id="explore-location"]');
    await expect(locationInput).toBeVisible();

    await locationInput.fill('Kasol');
    await expect(locationInput).toHaveValue('Kasol');
  });

  test('Auth redirects', async ({ page }) => {
    // Try to access vendor dashboard without auth
    await page.goto('/en/vendor/dashboard');
    
    // Should redirect to auth
    await expect(page).toHaveURL(/\/en\/auth\/login/);
    
    // Verify auth shell UI
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
    // Check PY logo instead of LC
    await expect(page.getByRole('link', { name: /PY/ })).toBeVisible();
    
    // Try to access profile without auth
    await page.goto('/en/profile');
    await expect(page).toHaveURL(/\/en\/auth\/login/);
  });
});
