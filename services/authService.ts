/**
 * Auth Service — the single integration with the backend auth lifecycle.
 *
 * Contract (backend /api/v1, see backend Swagger `Auth Flow (PIN + OTP)`):
 *   POST /auth/otp/request          {phone, purpose:'registration'} → {challengeId, resendAfterSeconds}
 *   POST /auth/otp/verify           {challengeId, otp}              → {nextStep, setupTicket?}
 *   POST /auth/pin/setup            {setupTicket, pin, confirmPin}  → session cookies
 *   POST /auth/pin/login            {phone, pin}                    → session cookies
 *   POST /auth/pin/forgot/request   {phone}                         → {challengeId, resendAfterSeconds}
 *   POST /auth/pin/forgot/verify    {challengeId, otp}              → {resetTicket}
 *   POST /auth/pin/reset            {resetTicket, pin, confirmPin}
 *   POST /auth/token/refresh        (cookie)                        → rotated cookies
 *   POST /auth/logout               (cookie)
 *   GET  /auth/me
 *
 * Security rules enforced here:
 *  - Never persist or log OTPs or PINs.
 *  - Never place phone numbers or auth data in analytics metadata.
 *  - Tokens live only in backend-set HttpOnly cookies.
 */
import { api } from '@/lib/apiClient';
import { sessionTracker } from './sessionService';

export type OtpNextStep = 'pin_setup' | 'pin_login';

export interface OtpChallenge {
  challengeId: string;
  resendAfterSeconds: number;
}

const dataOf = (result: any) => result?.data ?? result;

/** Request a registration/login OTP. Generic response — reveals no account state. */
export const requestOtp = async (phone: string): Promise<OtpChallenge> => {
  sessionTracker.track('login_started', { metadata: { method: 'otp' } });
  const result = await api.post('/auth/otp/request', { phone, purpose: 'registration' });
  return dataOf(result);
};

/** Verify the registration OTP. Backend directs the verified flow. */
export const verifyOtp = async (
  challengeId: string,
  otp: string,
): Promise<{ nextStep: OtpNextStep; setupTicket?: string }> => {
  const result = await api.post('/auth/otp/verify', { challengeId, otp });
  return dataOf(result);
};

/** Complete first registration: create the 4-digit PIN. Session cookies are set. */
export const setupPin = async (setupTicket: string, pin: string, confirmPin: string) => {
  const result = await api.post('/auth/pin/setup', { setupTicket, pin, confirmPin });
  sessionTracker.track('login_completed', { metadata: { method: 'pin_setup' } });
  return dataOf(result);
};

/** Normal login: phone + PIN, no OTP. Session cookies are set. */
export const loginWithPin = async (phone: string, pin: string) => {
  const result = await api.post('/auth/pin/login', { phone, pin });
  sessionTracker.track('login_completed', { metadata: { method: 'pin' } });
  return dataOf(result);
};

/** Forgot PIN: always-generic request. */
export const forgotPinRequest = async (phone: string): Promise<OtpChallenge> => {
  const result = await api.post('/auth/pin/forgot/request', { phone });
  return dataOf(result);
};

/** Forgot PIN: verify the OTP, receive the single-use reset ticket. */
export const forgotPinVerify = async (
  challengeId: string,
  otp: string,
): Promise<{ resetTicket: string }> => {
  const result = await api.post('/auth/pin/forgot/verify', { challengeId, otp });
  return dataOf(result);
};

/** Forgot PIN: set the new PIN. All previous sessions are revoked server-side. */
export const resetPin = async (resetTicket: string, pin: string, confirmPin: string) => {
  const result = await api.post('/auth/pin/reset', { resetTicket, pin, confirmPin });
  return dataOf(result);
};

export const loginAsGuest = async () => {
  const result = await api.post('/auth/login-as-guest', undefined);
  if (result?.data?.accessToken) {
    sessionTracker.track('login_completed', { metadata: { method: 'guest' } });
    sessionTracker.linkUser(result.data.userId);
  }
  return result;
};

export const getMe = async () => {
  return api.get('/auth/me');
};

export const logout = async () => {
  try {
    // Revokes the server-side session and clears the HttpOnly auth cookies.
    await api.post('/auth/logout', undefined);
  } catch {
    /* best-effort — still clear local cache below */
  }
  api.clearAllCache();
};

export const logoutAll = async () => {
  await api.post('/auth/logout-all', undefined);
  api.clearAllCache();
};
