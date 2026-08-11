import { test, expect } from '@playwright/test';

test.describe('Pahari Yatri Core Flows', () => {
  test('Landing page renders correctly and locale is preserved', async ({ page, isMobile }) => {
    await page.goto('/en');
    
    // Check Header
    await expect(page.getByRole('link', { name: /Pahari Yatri/i })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole('link', { name: /Explore/i }).first()).toBeVisible();
    }
    
    // Check Hero CTA
    const planTripBtn = page.getByRole('button', { name: /Plan My Trip/i }).first();
    await expect(planTripBtn).toBeVisible();
    
    // Check Footer
    await expect(page.locator('footer')).toContainText('Pahari Yatri');
    
    // Navigate to Plan Trip and ensure locale is preserved
    await planTripBtn.click();
    await expect(page).toHaveURL(/\/en\/builder/);
  });

  test('Mobile menu works correctly', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile only test');
    
    await page.goto('/en');
    
    // Open menu
    const menuBtn = page.locator('button[id="header-menu-toggle"]');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    
    // Check links inside mobile menu
    const mobileNav = page.locator('nav[id="header-mobile-nav"]');
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: /Explore/i })).toBeVisible();
    
    // Close menu by navigating
    await mobileNav.getByRole('link', { name: /Explore/i }).click();
    await expect(page).toHaveURL(/\/en\/explore/);
  });

  test('Explore page search and filters', async ({ page }) => {
    await page.goto('/en/explore');

    // Check search input
    const searchInput = page.locator('input[id="explore-search"]');
    await expect(searchInput).toBeVisible();

    // Typing now searches real inventory (not just filtering the curated
    // destination cards) — an unmatched query shows the real zero-result
    // recovery state, not the old destination-only "no match" text.
    await searchInput.fill('UnknownLocation123');
    await expect(page.getByTestId('explore-zero-result')).toBeVisible({ timeout: 10_000 });

    // Clear search returns to the curated destination grid
    await page.getByRole('button', { name: /Clear search/i }).click();
    await expect(searchInput).toHaveValue('');

    // Check categories
    await expect(page.locator('button[id="explore-cat-all"]')).toBeVisible();

    // Click a destination card — this filters in place (one "Explore"
    // concept, no more separate /discover page) rather than navigating away.
    const firstCard = page.locator('article[id^="explore-card-"]').first();
    const destinationLabel = await firstCard.locator('h2').innerText();
    await firstCard.click();

    await expect(page).toHaveURL(/\/en\/explore$/);
    await expect(page.getByText(destinationLabel, { exact: false }).first()).toBeVisible();
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
