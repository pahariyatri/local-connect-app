/**
 * Payment Service — Razorpay checkout wrapper
 *
 * Rules enforced here:
 * 1. Payment can ONLY be opened after a bookingId exists (inventory already locked)
 * 2. Success is NOT declared on redirect — frontend calls /payments/verify
 * 3. Razorpay script is loaded lazily (not on every page)
 */

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('SSR'));
    if ((window as any).Razorpay) return resolve();

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}

export interface RazorpayResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface InitCheckoutOptions {
  /** Razorpay Order ID from backend */
  orderId: string;
  /** Total amount in INR (rupees, not paise) */
  amount: number;
  /** Razorpay Key ID (public, from env) */
  keyId: string;
  /** Internal booking ID — shown in description */
  bookingId: number;
  /** Currency code — default INR */
  currency?: string;
  /** Pre-fill customer name */
  prefillName?: string;
  /** Pre-fill mobile number */
  prefillContact?: string;
  /** Pre-fill email */
  prefillEmail?: string;
}

/**
 * Open Razorpay checkout modal.
 *
 * @returns payment ids if successful
 * @throws Error if user dismisses or payment fails
 */
export function initRazorpayCheckout(opts: InitCheckoutOptions): Promise<RazorpayResult> {
  return new Promise(async (resolve, reject) => {
    try {
      await loadRazorpayScript();
    } catch {
      reject(new Error('Payment gateway unavailable. Please refresh and try again.'));
      return;
    }

    let settled = false;
    let openTimeout: ReturnType<typeof setTimeout>;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(openTimeout);
      fn();
    };

    const options = {
      key: opts.keyId,
      amount: Math.round(opts.amount * 100), // convert to paise
      currency: opts.currency || 'INR',
      name: 'Local Connect',
      description: `Booking #${opts.bookingId}`,
      order_id: opts.orderId,
      prefill: {
        name: opts.prefillName || '',
        contact: opts.prefillContact || '',
        email: opts.prefillEmail || '',
      },
      theme: {
        color: '#10b981', // emerald-500 — matches existing UI
      },
      modal: {
        ondismiss: () => {
          settle(() => reject(new Error('Payment cancelled by user')));
        },
      },
      handler: (response: RazorpayResult) => {
        settle(() => resolve(response));
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      settle(() => reject(new Error(response?.error?.description || 'Payment failed')));
    });

    // If the widget never actually renders (invalid key, Razorpay outage, the
    // script loaded but init silently failed) none of handler/ondismiss/
    // payment.failed ever fire, and the caller hangs on "Opening Payment..."
    // forever with no error. Detect that specifically — once the checkout
    // iframe is actually in the DOM, the user may take as long as they want,
    // so this only guards the "never opened at all" window, not the whole
    // payment flow.
    openTimeout = setTimeout(() => {
      const opened = typeof document !== 'undefined' && document.querySelector('iframe.razorpay-checkout-frame');
      if (!opened) {
        settle(() => reject(new Error('Payment gateway did not respond. Please try again.')));
      }
    }, 8000);

    rzp.open();
  });
}

/**
 * Verify payment with backend (source of truth).
 * Returns true if verified, throws on failure.
 */
export async function verifyPayment(params: RazorpayResult): Promise<boolean> {
  const { api } = await import('@/lib/apiClient');
  const raw = await api.post('/payments/verify', {
    razorpay_order_id: params.razorpay_order_id,
    razorpay_payment_id: params.razorpay_payment_id,
    razorpay_signature: params.razorpay_signature,
  });
  // Unwrap API envelope: { success: true, data: { status: 'ok' } } or plain { status: 'ok' }
  const result = (raw as any)?.data ?? raw;
  return result?.status === 'ok';
}

/**
 * Legacy support for older components
 */
export async function createRazorpayOrder(bookingId: string | number) {
  const { api } = await import('@/lib/apiClient');
  return api.post(`/payments/create-order/${bookingId}`);
}

export const verifyRazorpayPayment = verifyPayment;

