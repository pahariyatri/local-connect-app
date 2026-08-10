import { test, expect } from '@playwright/test';

test.describe('End-to-End Planner Flow', () => {
  test('Complete flow: Builder -> Results -> Journey', async ({ page, isMobile }) => {
    // Navigate to builder
    await page.goto('/en/builder');
    
    const viewportStr = isMobile ? 'mobile' : 'desktop';
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `artifacts/visual-qa/builder-${viewportStr}.png`, fullPage: true });
    
    // We just want to capture the visual state of the pages.
    // Instead of filling out the complex form, we navigate to the next routes.
    await page.goto('/en/results');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `artifacts/visual-qa/results-${viewportStr}.png`, fullPage: true });

    await page.goto('/en/journey');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `artifacts/visual-qa/journey-${viewportStr}.png`, fullPage: true });
  });

  test('Vendor and Admin Dashboards', async ({ page, isMobile }) => {
    // Note: If these pages redirect to login, we'll capture the redirect.
    // If we want to capture the actual dashboard, we'd need to mock auth or login.
    const viewportStr = isMobile ? 'mobile' : 'desktop';
    
    await page.goto('/en/vendor/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `artifacts/visual-qa/vendor-dashboard-${viewportStr}.png`, fullPage: true });

    await page.goto('/en/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `artifacts/visual-qa/admin-${viewportStr}.png`, fullPage: true });
  });
});
