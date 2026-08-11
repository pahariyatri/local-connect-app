import { test, expect } from '@playwright/test';

const ROUTES = [
  { name: 'landing', path: '/en' },
  { name: 'explore', path: '/en/explore' },
  { name: 'builder', path: '/en/builder' },
  { name: 'auth', path: '/en/auth/login' },
];

test.describe('Visual QA and Page Health', () => {
  for (const route of ROUTES) {
    test(`Visual QA: ${route.name}`, async ({ page, isMobile }) => {
      const errors: string[] = [];
      const failedRequests: string[] = [];
      
      // Capture console errors
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Capture failed requests
      page.on('response', (response) => {
        if (response.status() >= 400 && response.status() !== 401 && response.status() !== 403) {
          failedRequests.push(`${response.status()} ${response.url()}`);
        }
      });

      await page.goto(route.path, { waitUntil: 'networkidle' });
      
      // Check for horizontal overflow on mobile
      if (isMobile) {
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow, `Page ${route.name} has horizontal overflow`).toBe(false);
      }

      // Take full page screenshot
      const viewportStr = isMobile ? 'mobile' : 'desktop';
      await page.screenshot({ 
        path: `artifacts/visual-qa/${route.name}-${viewportStr}.png`, 
        fullPage: true 
      });

      // Assert no critical console errors
      const unexpectedErrors = errors.filter(e => !e.includes('ERR_CONNECTION_REFUSED') && !e.includes('Failed to fetch'));
      expect(unexpectedErrors).toEqual([]);
      // We log failed requests but don't fail immediately to avoid flakiness from 3rd party scripts,
      // but we do want to ensure our own API and assets load.
      const ourFailedRequests = failedRequests.filter(req => req.includes('localhost:3000'));
      expect(ourFailedRequests).toEqual([]);
    });
  }
});
