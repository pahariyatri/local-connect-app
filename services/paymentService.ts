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
 * Why a checkout ended without a success callback. `failed` means Razorpay
 * reported at least one failed attempt before the traveler closed the modal;
 * `cancelled` means they closed it without any failed attempt; `unavailable`
 * means the widget never opened.
 */
export type CheckoutEndKind = 'cancelled' | 'failed' | 'unavailable';

export class PaymentCheckoutError extends Error {
  readonly kind: CheckoutEndKind;
  constructor(kind: CheckoutEndKind, message: string) {
    super(message);
    this.name = 'PaymentCheckoutError';
    this.kind = kind;
  }
}

/**
 * Open Razorpay checkout modal.
 *
 * Resolves only on the checkout `handler` (a success callback that the server
 * still verifies — it never proves payment on its own). Rejects with a
 * PaymentCheckoutError when the modal closes without one.
 *
 * `payment.failed` does NOT settle the promise: Razorpay keeps the modal open
 * so the traveler can retry with another method, and a later success in the
 * same modal must not be dropped. The failure is remembered and reported when
 * the modal finally closes.
 */
export function initRazorpayCheckout(opts: InitCheckoutOptions): Promise<RazorpayResult> {
  return new Promise(async (resolve, reject) => {
    if (opts.orderId?.startsWith('order_mock_')) {
      // Local development without gateway keys only — the backend refuses
      // mock orders in production.
      console.warn('Mock order detected — bypassing Razorpay widget and simulating payment success.');
      resolve({
        razorpay_order_id: opts.orderId,
        razorpay_payment_id: `pay_mock_${opts.bookingId}_${Date.now()}`,
        razorpay_signature: `sig_mock_${opts.orderId}_${Date.now()}`,
      });
      return;
    }

    try {
      await loadRazorpayScript();
    } catch {
      reject(new PaymentCheckoutError('unavailable', 'Payment gateway unavailable. Please refresh and try again.'));
      return;
    }

    let settled = false;
    let lastFailure: string | null = null;
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
      name: 'Pahari Yatri',
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
          settle(() =>
            reject(
              lastFailure
                ? new PaymentCheckoutError('failed', lastFailure)
                : new PaymentCheckoutError('cancelled', 'Payment cancelled by user'),
            ),
          );
        },
      },
      handler: (response: RazorpayResult) => {
        settle(() => resolve(response));
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      lastFailure = response?.error?.description || 'Payment failed';
    });

    // If the widget never actually renders (invalid key, Razorpay outage, the
    // script loaded but init silently failed) none of handler/ondismiss/
    // payment.failed ever fire. Once the checkout iframe is in the DOM the
    // traveler may take as long as they want, so this only guards the
    // "never opened at all" window.
    openTimeout = setTimeout(() => {
      const opened = typeof document !== 'undefined' && document.querySelector('iframe.razorpay-checkout-frame');
      if (!opened) {
        settle(() => reject(new PaymentCheckoutError('unavailable', 'Payment gateway did not respond. Please try again.')));
      }
    }, 8000);

    rzp.open();
  });
}

/** Server-side payment view — mirrors PaymentStatusResponseDto in the API. */
export type PaymentDisplayState =
  | 'NOT_STARTED'
  | 'AWAITING_PAYMENT'
  | 'CANCELLED'
  | 'FAILED'
  | 'VERIFYING'
  | 'PAID'
  | 'EXPIRED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export interface PaymentStatusView {
  bookingId: number;
  bookingStatus: string;
  paymentStatus: string | null;
  displayState: PaymentDisplayState;
  retryable: boolean;
  amount: number;
  currency: string;
  razorpayOrderId: string | null;
  failureReason: string | null;
}

const unwrap = <T,>(raw: any): T => (raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw) as T;

/**
 * Hand the checkout success callback to the backend. The backend verifies the
 * signature AND asks Razorpay; the result may be PAID or VERIFYING (payment
 * still being confirmed). Throws on network failure — callers must treat that
 * as "unknown", never as failed.
 */
export async function verifyPayment(params: RazorpayResult): Promise<PaymentStatusView> {
  const { api } = await import('@/lib/apiClient');
  const raw = await api.post('/payments/verify', {
    razorpay_order_id: params.razorpay_order_id,
    razorpay_payment_id: params.razorpay_payment_id,
    razorpay_signature: params.razorpay_signature,
  });
  return unwrap<PaymentStatusView>(raw);
}

/** Tell the backend the checkout closed without success. The server reconciles first. */
export async function cancelPayment(
  bookingId: number | string,
  reason: 'dismissed' | 'failed' | 'timeout',
  detail?: string,
): Promise<PaymentStatusView> {
  const { api } = await import('@/lib/apiClient');
  const raw = await api.post(`/payments/cancel/${bookingId}`, {
    reason,
    ...(detail ? { detail: detail.slice(0, 200) } : {}),
  });
  return unwrap<PaymentStatusView>(raw);
}

/**
 * Server truth for a booking's payment. `refresh` asks the backend to check
 * with Razorpay first — how a lost browser response is recovered.
 */
export async function getPaymentStatus(bookingId: number | string, refresh = false): Promise<PaymentStatusView> {
  const { api } = await import('@/lib/apiClient');
  const raw = await api.get(`/payments/status/${bookingId}${refresh ? '?refresh=true' : ''}`);
  return unwrap<PaymentStatusView>(raw);
}

/**
 * Legacy support for older components
 */
export async function createRazorpayOrder(bookingId: string | number) {
  const { api } = await import('@/lib/apiClient');
  return api.post(`/payments/create-order/${bookingId}`);
}
