/**
 * Auth Service — handles login, OTP, guest, and profile
 */
import { api } from '@/lib/apiClient';
import { sessionTracker } from './sessionService';

export const sendOtp = async (phoneNumber: string) => {
  sessionTracker.track('login_started', { metadata: { method: 'otp', phoneNumber } });
  return api.post('/auth/send-otp', { phoneNumber }, { skipAuth: true });
};

export const resendOtp = async (phoneNumber: string) => {
  return api.post('/auth/resend-otp', { phoneNumber }, { skipAuth: true });
};

/** Check whether a phone number is registered and already has a login PIN. */
export const accountStatus = async (phoneNumber: string): Promise<{ exists: boolean; hasPin: boolean }> => {
  const result = await api.post('/auth/account-status', { phoneNumber }, { skipAuth: true });
  const data = result?.data || result;
  return { exists: !!data?.exists, hasPin: !!data?.hasPin };
};

/** Create/replace the 4-digit PIN for the currently authenticated user. */
export const setPin = async (pin: string) => {
  return api.post('/auth/set-pin', { pin });
};

/** Log in a returning user with phone + 4-digit PIN (no OTP). */
export const loginWithPin = async (phoneNumber: string, pin: string) => {
  const result = await api.post('/auth/login-pin', { phoneNumber, pin }, { skipAuth: true });
  const data = result?.data || result;

  // Tokens are set by the backend as HttpOnly cookies — never persist them in JS-accessible storage.
  if (data?.accessToken) {
    sessionTracker.track('login_completed', { metadata: { method: 'pin' } });
    if (data.userId) sessionTracker.linkUser(data.userId);
  }

  return result;
};

export const verifyOtp = async (phoneNumber: string, otp: string) => {
  const result = await api.post('/auth/verify-otp', { phoneNumber, otp }, { skipAuth: true });
  const data = result?.data || result;

  // Tokens are set by the backend as HttpOnly cookies — link the session only.
  if (data?.accessToken) {
    sessionTracker.track('login_completed', { metadata: { method: 'otp' } });
    if (data.userId) sessionTracker.linkUser(data.userId);
  }

  return result;
};


export const loginAsGuest = async () => {
  const result = await api.post('/auth/login-as-guest', undefined, { skipAuth: true });
  if (result?.data?.accessToken) {
    // Guest token is set by the backend as an HttpOnly cookie.
    sessionTracker.track('login_completed', { metadata: { method: 'guest' } });
    sessionTracker.linkUser(result.data.userId);
  }
  return result;
};

export const verifyGoogleToken = async (idToken: string) => {
  const result = await api.post('/auth/google-login', { token: idToken }, { skipAuth: true });
  const data = result?.data || result;

  if (data?.accessToken) {
    // Tokens are set by the backend as HttpOnly cookies.
    sessionTracker.track('login_completed', { metadata: { method: 'google' } });
    if (data.userId) sessionTracker.linkUser(data.userId);
  }
  return result;
};


export const getMe = async () => {
  return api.get('/auth/me');
};

export const logout = async () => {
  try {
    // Clears the HttpOnly auth cookies server-side.
    await api.post('/auth/logout', undefined, { skipAuth: true });
  } catch {
    /* best-effort — still clear local cache below */
  }
  api.clearAllCache();
};