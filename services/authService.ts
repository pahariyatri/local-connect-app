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

  if (data?.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
    if (data.userId) localStorage.setItem('userId', data.userId);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    sessionTracker.track('login_completed', { metadata: { method: 'pin' } });
    if (data.userId) sessionTracker.linkUser(data.userId);
  }

  return result;
};

export const verifyOtp = async (phoneNumber: string, otp: string) => {
  const result = await api.post('/auth/verify-otp', { phoneNumber, otp }, { skipAuth: true });
  const data = result?.data || result;

  // Store token & link session
  if (data?.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
    if (data.userId) localStorage.setItem('userId', data.userId);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    sessionTracker.track('login_completed', { metadata: { method: 'otp' } });
    if (data.userId) sessionTracker.linkUser(data.userId);
  }

  return result;
};


export const loginAsGuest = async () => {
  const result = await api.post('/auth/login-as-guest', undefined, { skipAuth: true });
  if (result?.data?.accessToken) {
    localStorage.setItem('accessToken', result.data.accessToken);
    document.cookie = `accessToken=${result.data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
    sessionTracker.track('login_completed', { metadata: { method: 'guest' } });
    sessionTracker.linkUser(result.data.userId);
  }
  return result;
};

export const verifyGoogleToken = async (idToken: string) => {
  const result = await api.post('/auth/google-login', { token: idToken }, { skipAuth: true });
  const data = result?.data || result;

  if (data?.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
    if (data.userId) localStorage.setItem('userId', data.userId);
    sessionTracker.track('login_completed', { metadata: { method: 'google' } });
    if (data.userId) sessionTracker.linkUser(data.userId);
  }
  return result;
};


export const getMe = async () => {
  return api.get('/auth/me');
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  api.clearAllCache();
};