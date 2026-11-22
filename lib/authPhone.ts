/**
 * Carries the phone number between auth screens (login → verify-otp → pin)
 * without putting it in the URL, where it ends up in browser history, Vercel
 * logs, analytics page_location and Referer headers. Session-scoped: cleared
 * when the tab closes. A `?phone=` param from an old link is still honoured.
 */
const KEY = 'py_auth_phone';

export function rememberAuthPhone(phone: string | null | undefined): void {
  if (!phone) return;
  try {
    sessionStorage.setItem(KEY, phone);
  } catch {
    /* storage blocked (private mode) — the screen will ask for the number again */
  }
}

export function recallAuthPhone(fromUrl?: string | null): string {
  if (fromUrl) {
    rememberAuthPhone(fromUrl);
    return fromUrl;
  }
  try {
    return sessionStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}
