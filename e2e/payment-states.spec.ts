import { test, expect, type Page, type Route } from '@playwright/test';

/**
 * Payment UI state coverage (docs/payments/payment-flow-contract.md §9).
 *
 * Deterministic and offline: the API is mocked with page.route and
 * window.Razorpay is replaced by a scripted fake, so every branch — cancel,
 * failure, failure-then-success in the same modal, lost /verify response,
 * re-entry while verifying, already-paid — is exercised without Razorpay or
 * a backend. The server-side behaviour behind these responses is covered by
 * local-connect-api/test/payment-lifecycle.e2e-spec.ts against real Postgres.
 */

const BOOKING_ID = 4242;
const ORDER_ID = 'order_ui_test_1';

type Display = 'AWAITING_PAYMENT' | 'CANCELLED' | 'FAILED' | 'VERIFYING' | 'PAID' | 'EXPIRED';

const view = (displayState: Display, extra: Record<string, unknown> = {}) => ({
  bookingId: BOOKING_ID,
  bookingStatus: displayState === 'PAID' ? 'CONFIRMED' : displayState === 'FAILED' ? 'PAYMENT_FAILED' : 'PAYMENT_PENDING',
  paymentStatus: { AWAITING_PAYMENT: 'PENDING', CANCELLED: 'CANCELLED', FAILED: 'FAILED', VERIFYING: 'PROCESSING', PAID: 'SUCCESS', EXPIRED: 'EXPIRED' }[displayState],
  displayState,
  retryable: ['AWAITING_PAYMENT', 'CANCELLED', 'FAILED', 'EXPIRED'].includes(displayState),
  amount: 160,
  currency: 'INR',
  razorpayOrderId: ORDER_ID,
  failureReason: null,
  ...extra,
});

const ok = (route: Route, data: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success: status < 400, data, message: (data as any)?.message }) });

type Scenario = 'dismiss' | 'fail-then-dismiss' | 'fail-then-success' | 'success';

interface Mocks {
  status: Display[]; // successive GET /payments/status responses (last one repeats)
  reserve?: 'ok' | 409;
  cancel?: Display;
  verify?: Display | 'network-error';
  booking?: Record<string, unknown>;
}

async function setup(page: Page, scenario: Scenario, m: Mocks) {
  const calls = { status: 0, reserve: 0, cancel: [] as any[], verify: 0 };

  // middleware.ts only checks that a session cookie is present (the API, mocked
  // below, is the real auth boundary) — a placeholder value is enough here.
  await page.context().addCookies([{ name: 'accessToken', value: 'ui-test', domain: 'localhost', path: '/' }]);

  await page.addInitScript((sc) => {
    window.localStorage.setItem('user_meta', JSON.stringify({ id: 'u-ui', name: 'UI Test', phone: '+910000000000', role: 'User' }));
    // Fake Razorpay Checkout: renders the iframe marker the open-timeout guard looks for, then plays the scenario.
    (window as any).Razorpay = function (this: any, options: any) {
      const failed: Array<(r: any) => void> = [];
      this.on = (ev: string, cb: (r: any) => void) => { if (ev === 'payment.failed') failed.push(cb); };
      this.open = () => {
        const f = document.createElement('iframe');
        f.className = 'razorpay-checkout-frame';
        f.style.display = 'none';
        document.body.appendChild(f);
        setTimeout(() => {
          const fail = () => failed.forEach((cb) => cb({ error: { description: 'Card declined by bank' } }));
          const success = () => options.handler({ razorpay_order_id: options.order_id, razorpay_payment_id: 'pay_ui_1', razorpay_signature: 'sig' });
          if (sc === 'dismiss') options.modal.ondismiss();
          if (sc === 'fail-then-dismiss') { fail(); options.modal.ondismiss(); }
          if (sc === 'fail-then-success') { fail(); success(); }
          if (sc === 'success') success();
        }, 50);
      };
    };
  }, scenario);

  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^.*\/api\/v1/, '');
    const method = route.request().method();

    if (path === '/auth/me') return ok(route, { id: 'u-ui', firstName: 'UI', role: 'User', phone: '+910000000000' });
    if (path === '/payments/public-key') return ok(route, { keyId: 'rzp_test_ui' });
    if (path === `/payments/status/${BOOKING_ID}`) {
      const d = m.status[Math.min(calls.status, m.status.length - 1)];
      calls.status++;
      return ok(route, view(d));
    }
    if (path === `/booking/${BOOKING_ID}/reserve` && method === 'POST') {
      calls.reserve++;
      if (m.reserve === 409) return ok(route, { message: 'A payment for this booking is being verified.' }, 409);
      return ok(route, { bookingId: BOOKING_ID, orderId: ORDER_ID, amount: 160, currency: 'INR' });
    }
    if (path === `/payments/cancel/${BOOKING_ID}` && method === 'POST') {
      calls.cancel.push(route.request().postDataJSON());
      return ok(route, view(m.cancel ?? 'CANCELLED'));
    }
    if (path === '/payments/verify' && method === 'POST') {
      calls.verify++;
      if (m.verify === 'network-error') return route.abort('connectionreset');
      const v = view(m.verify ?? 'PAID');
      return ok(route, { status: v.displayState === 'PAID' ? 'ok' : v.displayState.toLowerCase(), ...v });
    }
    if (path === `/booking/${BOOKING_ID}`) {
      return ok(route, {
        id: BOOKING_ID, status: 'PAYMENT_PENDING', totalAmount: 3200, reservationFeeAmount: 160, currency: 'INR',
        travelDate: '2026-12-20', items: [], createdAt: '2026-11-21T00:00:00Z', ...(m.booking ?? {}),
      });
    }
    return ok(route, {});
  });
  return calls;
}

const CANCELLED_TEXT = 'Payment cancelled. Your booking has not been charged.';

test.describe('Checkout payment states', () => {
  test('cancel / close: shows the not-charged message and a Pay again button; server is told', async ({ page }) => {
    const calls = await setup(page, 'dismiss', { status: ['AWAITING_PAYMENT'], cancel: 'CANCELLED' });
    await page.goto(`/checkout?bookingId=${BOOKING_ID}`);
    await page.locator('#checkout-pay-btn').click();
    await expect(page.getByText(CANCELLED_TEXT)).toBeVisible();
    await expect(page.getByText(/Processing your payment|confirming your payment with the bank/i)).toHaveCount(0);
    await expect(page.locator('#checkout-pay-btn')).toHaveText(/Pay again/);
    await expect(page.locator('#checkout-pay-btn')).toBeEnabled();
    expect(calls.cancel).toEqual([{ reason: 'dismissed' }]);
  });

  test('cancel then Pay again: re-confirms the order with the server before reopening', async ({ page }) => {
    const calls = await setup(page, 'dismiss', { status: ['AWAITING_PAYMENT'], cancel: 'CANCELLED' });
    await page.goto(`/checkout?bookingId=${BOOKING_ID}`);
    await page.locator('#checkout-pay-btn').click();
    await expect(page.getByText(CANCELLED_TEXT)).toBeVisible();
    const before = calls.reserve;
    await page.locator('#checkout-pay-btn').click();
    await expect(page.getByText(CANCELLED_TEXT)).toBeVisible();
    expect(calls.reserve).toBe(before + 1);
  });

  test('failure then close: shows the failure, retryable, server told reason=failed', async ({ page }) => {
    const calls = await setup(page, 'fail-then-dismiss', { status: ['AWAITING_PAYMENT'], cancel: 'FAILED' });
    await page.goto(`/checkout?bookingId=${BOOKING_ID}`);
    await page.locator('#checkout-pay-btn').click();
    await expect(page.getByText(/Payment failed/)).toBeVisible();
    await expect(page.locator('#checkout-pay-btn')).toHaveText(/Pay again/);
    expect(calls.cancel[0]).toMatchObject({ reason: 'failed', detail: 'Card declined by bank' });
  });

  test('failure then success in the same modal is NOT dropped — it is verified and confirmed', async ({ page }) => {
    const calls = await setup(page, 'fail-then-success', { status: ['AWAITING_PAYMENT'], verify: 'PAID' });
    await page.goto(`/checkout?bookingId=${BOOKING_ID}`);
    await page.locator('#checkout-pay-btn').click();
    await expect(page.getByText(/Reserved! Redirecting/)).toBeVisible();
    expect(calls.verify).toBe(1);
    expect(calls.cancel).toHaveLength(0);
    await page.waitForURL(new RegExp(`/bookings/${BOOKING_ID}$`));
  });

  test('success but the /verify response is lost → "verification in progress", never "failed"; recovers to paid', async ({ page }) => {
    await setup(page, 'success', { status: ['AWAITING_PAYMENT', 'VERIFYING', 'PAID'], verify: 'network-error' });
    await page.goto(`/checkout?bookingId=${BOOKING_ID}`);
    await page.locator('#checkout-pay-btn').click();
    await expect(page.getByText('Payment verification in progress')).toBeVisible();
    await expect(page.getByText(/Payment failed/)).toHaveCount(0);
    await expect(page.locator('#checkout-pay-btn')).toHaveCount(0); // no second payment while verifying
    await page.locator('#checkout-check-status-btn').click(); // → VERIFYING
    await page.locator('#checkout-check-status-btn').click(); // → PAID
    await expect(page.getByText(/Reserved! Redirecting/)).toBeVisible();
  });

  test('server says VERIFYING after /verify → status check path, no Pay button', async ({ page }) => {
    await setup(page, 'success', { status: ['AWAITING_PAYMENT', 'VERIFYING'], verify: 'VERIFYING' });
    await page.goto(`/checkout?bookingId=${BOOKING_ID}`);
    await page.locator('#checkout-pay-btn').click();
    await expect(page.getByText('Payment verification in progress')).toBeVisible();
    await expect(page.locator('#checkout-check-status-btn')).toBeVisible();
    await expect(page.locator('#checkout-pay-btn')).toHaveCount(0);
  });

  test('refresh / re-entry while verifying → verification view; no new order is requested', async ({ page }) => {
    const calls = await setup(page, 'success', { status: ['VERIFYING'] });
    await page.goto(`/checkout?bookingId=${BOOKING_ID}`);
    await expect(page.getByText('Payment verification in progress')).toBeVisible();
    expect(calls.reserve).toBe(0);
  });

  test('re-entry after a payment already went through (lost browser response) → shows paid and redirects', async ({ page }) => {
    const calls = await setup(page, 'success', { status: ['PAID'] });
    await page.goto(`/checkout?bookingId=${BOOKING_ID}`);
    await expect(page.getByText(/Reserved! Redirecting/)).toBeVisible();
    expect(calls.reserve).toBe(0);
    await page.waitForURL(new RegExp(`/bookings/${BOOKING_ID}$`));
  });

  test('reserve returns 409 (payment being verified) → verification view instead of a second checkout', async ({ page }) => {
    await setup(page, 'success', { status: ['AWAITING_PAYMENT', 'VERIFYING'], reserve: 409 });
    await page.goto(`/checkout?bookingId=${BOOKING_ID}`);
    await expect(page.getByText('Payment verification in progress')).toBeVisible();
  });
});

test.describe('Booking page payment states (no more endless "Processing your payment")', () => {
  test('PAYMENT_PENDING + cancelled → not-charged message, Pay again, no spinner text', async ({ page }) => {
    await setup(page, 'dismiss', { status: ['CANCELLED'] });
    await page.goto(`/bookings/${BOOKING_ID}`);
    await expect(page.getByRole('heading', { name: 'Payment cancelled' })).toBeVisible();
    await expect(page.getByText(CANCELLED_TEXT)).toBeVisible();
    await expect(page.getByRole('button', { name: /Pay again/ })).toBeVisible();
    await expect(page.getByText(/Processing your payment|confirming your payment with the bank/i)).toHaveCount(0);
  });

  test('PAYMENT_PENDING + awaiting payment (order created, never paid) → payable, not "processing"', async ({ page }) => {
    await setup(page, 'dismiss', { status: ['AWAITING_PAYMENT'] });
    await page.goto(`/bookings/${BOOKING_ID}`);
    await expect(page.getByRole('heading', { name: 'Complete your payment' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pay ₹160 reservation fee/ })).toBeVisible();
  });

  test('PAYMENT_PENDING + verifying → verification message with a working status check, no Pay button', async ({ page }) => {
    const calls = await setup(page, 'dismiss', { status: ['VERIFYING'] });
    await page.goto(`/bookings/${BOOKING_ID}`);
    await expect(page.getByRole('heading', { name: 'Payment verification in progress' })).toBeVisible();
    const before = calls.status;
    await page.getByRole('button', { name: 'Check payment status' }).click();
    await expect.poll(() => calls.status).toBeGreaterThan(before);
    await expect(page.getByRole('button', { name: /Pay/ })).toHaveCount(0);
  });

  test('legacy /bookings/:id/payment redirects to the single hardened checkout', async ({ page }) => {
    await setup(page, 'dismiss', { status: ['AWAITING_PAYMENT'] });
    await page.goto(`/bookings/${BOOKING_ID}/payment`);
    await page.waitForURL(new RegExp(`/checkout\\?bookingId=${BOOKING_ID}`));
  });
});
