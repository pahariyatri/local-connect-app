import { test, expect } from '@playwright/test';

/**
 * Regression suite for the 2026-08-11 audit's P0 findings:
 *   1. `/discover` must call the real `GET /api/v1/discovery/services` API,
 *      not a client-side filter over a guessed location string.
 *   2. No page may fall back to fabricated vendor/service records, ratings,
 *      or guide identities on API failure or otherwise.
 *   3. Zero-result and error states must be real and recoverable, never a
 *      silent substitution.
 *   4. The public discovery API must never leak vendor contact info.
 *
 * Where a test's outcome would otherwise depend on which real vendors exist
 * in the production database at run time (a moving target), the test either
 * asserts against the API *contract* directly (deterministic regardless of
 * seed data) or mocks the network response to pin the scenario precisely.
 */

const PROD_URL = process.env.DISCOVERY_TEST_APP_URL || '';
const API_URL = process.env.DISCOVERY_TEST_API_URL || 'http://localhost:4000';

// Names/rating literals that only ever existed in the deleted fixture data.
// Their presence anywhere on a real page is itself proof of a regression.
const FABRICATED_FIXTURES = [
  'Tenzing Sherpa',
  'Sonam Wangchuk',
  'Kavya Nair',
  'Priya Homestay',
  'Arjun Thakur',
  'Rajan Chauhan',
  'Himalayan Retreat',
  'Local Guide: Rakesh',
];

test.describe('Discovery search — real API wiring', () => {
  test('typing a destination sends the query to the real discovery API', async ({ page }) => {
    let discoveryRequestUrl: string | null = null;
    await page.route('**/api/v1/discovery/services**', async (route) => {
      discoveryRequestUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [], meta: { total: 0, page: 1, totalPages: 1 } }),
      });
    });

    await page.goto(`${PROD_URL}/en/explore`);
    await page.locator('#explore-search').fill('Kasol');
    // Poll the variable the route handler sets, rather than layering a second
    // waitForRequest listener on the same request (the two can race on which
    // observes the request first).
    await expect.poll(() => discoveryRequestUrl, { timeout: 10_000 }).not.toBeNull();
    await expect.poll(() => discoveryRequestUrl, { timeout: 10_000 }).toContain('q=Kasol');
    const url = new URL(discoveryRequestUrl!);
    expect(url.pathname).toBe('/api/v1/discovery/services');
    expect(url.searchParams.get('q')).toBe('Kasol');
    // The old bug: /discover fetched the flat vendor list instead. Assert
    // that's not what's happening.
    expect(discoveryRequestUrl).not.toContain('/api/v1/vendors');
  });

  test('the UI trusts the API\'s real location field — no client-side city override', async ({ page }) => {
    // Simulate a real vendor whose service is genuinely based in Kasol,
    // returned for a broader "Manali"-area or unfiltered query — this is
    // exactly the shape of the original bug (a Kasol business silently
    // relabeled "Manali" by a business-name-substring guess).
    await page.route('**/api/v1/discovery/services**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{
            id: 1, slug: 'riverside-camp-kasol-1', name: 'Riverside Camp',
            category: 'Adventures', thumbnail: '/images/destination-placeholder.jpg', images: [],
            shortDescription: 'Camp', description: 'Camp', capacity: 2, isAvailable: true,
            serviceArea: 'Kasol',
            vendor: { id: 'v1', publicName: 'Parvati Valley Riverside Camp', verified: true, rating: 4.6 },
            location: { city: 'Kasol', state: 'Himachal Pradesh', latitude: 32.01, longitude: 77.31 },
            distanceKm: null,
            pricing: { unitPrice: 1800, basePrice: 1800, currency: 'INR', pricingLabel: 'Standard' },
          }],
          meta: { total: 1, page: 1, totalPages: 1 },
        }),
      });
    });

    await page.goto(`${PROD_URL}/en/explore`);
    await page.locator('#explore-search').fill('Manali');
    await page.waitForTimeout(600);

    const card = page.getByTestId('explore-result-card').first();
    await expect(card).toBeVisible();
    // Must render the API's real city verbatim, not silently coerce it to
    // "Manali" (the old guess-heuristic's default fallback).
    await expect(page.getByTestId('explore-result-location').first()).toContainText('Kasol');
  });
});

test.describe('No fabricated fallback data', () => {
  test('a discovery API failure shows a real error state, never fake vendors', async ({ page }) => {
    await page.route('**/api/v1/discovery/services**', (route) => route.abort('failed'));

    await page.goto(`${PROD_URL}/en/explore`);
    await page.locator('#explore-search').fill('anything');
    await expect(page.getByTestId('explore-error-state')).toBeVisible({ timeout: 10_000 });
    const bodyText = await page.locator('body').innerText();
    for (const fixture of FABRICATED_FIXTURES) {
      expect(bodyText).not.toContain(fixture);
    }
  });

  test('an unresolvable vendor profile shows a real not-found state, never a substitute vendor', async ({ page }) => {
    await page.route('**/api/v1/vendors/*', (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, statusCode: 404, message: 'Vendor not found', error: 'NOT_FOUND', meta: {} }),
      });
    });

    await page.goto(`${PROD_URL}/en/vendor/00000000-0000-0000-0000-000000000000`);
    await page.waitForTimeout(500);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.toLowerCase()).toContain("unavailable");
    for (const fixture of FABRICATED_FIXTURES) {
      expect(bodyText).not.toContain(fixture);
    }
  });

  test('no hardcoded rating renders when the API reports no rating', async ({ page }) => {
    await page.route('**/api/v1/discovery/services**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{
            id: 2, slug: 'unrated-service-2', name: 'New Homestay',
            category: 'Homestays', thumbnail: '/images/destination-placeholder.jpg', images: [],
            shortDescription: 'New', description: 'New', capacity: 2, isAvailable: true,
            serviceArea: 'Tosh',
            vendor: { id: 'v2', publicName: 'Brand New Partner', verified: true, rating: null },
            location: { city: 'Tosh', state: 'Himachal Pradesh', latitude: null, longitude: null },
            distanceKm: null,
            pricing: { unitPrice: 1200, basePrice: 1200, currency: 'INR', pricingLabel: 'Standard' },
          }],
          meta: { total: 1, page: 1, totalPages: 1 },
        }),
      });
    });

    await page.goto(`${PROD_URL}/en/explore`);
    await page.locator('#explore-search').fill('Tosh');
    await page.waitForTimeout(600);

    await expect(page.getByTestId('explore-result-card').first()).toBeVisible();
    // A null rating from the API must render as "no rating shown", not a
    // fallback star/number.
    await expect(page.getByTestId('explore-result-rating')).toHaveCount(0);
  });
});

test.describe('Zero-result recovery', () => {
  test('a real empty result set shows a contextual recovery state, not a dead end', async ({ page }) => {
    await page.route('**/api/v1/discovery/services**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [], meta: { total: 0, page: 1, totalPages: 1 } }),
      });
    });

    await page.goto(`${PROD_URL}/en/explore`);
    await page.locator('#explore-search').fill('Kalga');
    await page.waitForTimeout(600);

    const zeroState = page.getByTestId('explore-zero-result');
    await expect(zeroState).toBeVisible();
    await expect(zeroState).toContainText('Kalga');
    await expect(zeroState.getByText(/Plan a trip instead/i)).toBeVisible();
  });
});

test.describe('Production data contract — live checks', () => {
  // Serial + a small gap between requests: these hit the live production
  // API's own ThrottlerGuard, so running them concurrently self-inflicts 429s
  // unrelated to the thing under test.
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 1500));
  });

  for (const location of ['Kasol', 'Manali', 'Tosh', 'Kalga', 'Pulga', 'Manikaran', 'Kheerganga', 'Malana']) {
    test(`GET /discovery/services?location=${location} — every result's city matches the query, no leaked contact info`, async ({ request }) => {
      const res = await request.get(`${API_URL}/api/v1/discovery/services`, {
        params: { location, limit: 50 },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);

      const payloadText = JSON.stringify(body);
      // Contact privacy: the public discovery response must never include a
      // vendor's phone/email, regardless of query.
      expect(payloadText).not.toMatch(/"phone"\s*:/i);
      expect(payloadText).not.toMatch(/"email"\s*:/i);
      expect(payloadText).not.toMatch(/pointOfContact/i);

      // Every result actually belongs to the queried location — the server
      // enforces this in SQL, so this is a contract check, not a live-data
      // gamble. Empty results are fine (real "no inventory yet").
      for (const service of body.data) {
        const city = String(service.location?.city || '').toLowerCase();
        const area = String(service.serviceArea || '').toLowerCase();
        expect(city.includes(location.toLowerCase()) || area.includes(location.toLowerCase())).toBe(true);
      }
    });
  }

  test('price comes from the real discovery pricing engine, not a "Price on request" placeholder', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/discovery/services`, { params: { limit: 10 } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    if (body.data.length === 0) test.skip(true, 'No inventory available to price-check yet');
    for (const service of body.data) {
      expect(typeof service.pricing?.unitPrice).toBe('number');
      expect(service.pricing.unitPrice).toBeGreaterThan(0);
    }
  });

  test('vendor rating, when present, is a real number sourced from trustScore — not a fixed constant across every vendor', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/discovery/services`, { params: { limit: 50 } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const ratings = body.data.map((s: any) => s.vendor?.rating).filter((r: any) => r != null);
    if (ratings.length < 2) test.skip(true, 'Not enough rated vendors to compare');
    // The old bug hardcoded 4.8 (search) / 4.9 (detail) for literally every
    // vendor. A healthy, varied vendor set need not all share one value —
    // but if EVERY vendor has the exact same suspicious literal, that's the
    // regression signature.
    const allSameSuspiciousValue = ratings.every((r: number) => r === 4.8 || r === 4.9);
    expect(allSameSuspiciousValue).toBe(false);
  });
});
