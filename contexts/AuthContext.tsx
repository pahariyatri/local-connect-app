'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getMe, logout as logoutApi } from '@/services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

type AuthStatus = 'hydrating' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  /** Explicit tri-state — consumers must not treat `user === null` during
   * 'hydrating' as "logged out"; the session check is still in flight. */
  authStatus: AuthStatus;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authStatus: AuthStatus = isLoading ? 'hydrating' : user ? 'authenticated' : 'unauthenticated';

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem('user_meta');

      // No local session hint: nothing to verify, this is a guest on a
      // (likely public) page. Render immediately instead of gating the
      // whole app behind a network call — protected routes are already
      // enforced server-side by middleware.ts via the accessToken cookie.
      if (!storedUser) {
        setIsLoading(false);
        return;
      }

      // 1. We have meta locally, use it immediately for speed (UI "feel" as logged in)
      try {
        setUser(JSON.parse(storedUser));
      } catch { localStorage.removeItem('user_meta'); }

      // 2. Verify the session with the backend (HttpOnly cookies) since the
      //    user appears logged in.
      //    Goes through the central api client: typed errors + bounded
      //    silent-refresh on 401 — no bespoke fetch, no second client.
      try {
        const result = await getMe();
        const userProfile = result?.data ?? result;
        const mappedUser = {
          id: userProfile.id,
          name: userProfile.name || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          role: userProfile.role || 'Guest',
        };
        setUser(mappedUser);
        localStorage.setItem('user_meta', JSON.stringify(mappedUser));
      } catch (e: any) {
        if (e?.statusCode === 401) {
          // Session genuinely gone (refresh already attempted by the client).
          logout();
        }
        // Network errors: keep the local meta — do not log the user out offline.
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user_meta', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_meta');
    // Single logout path: revokes the server session + clears cookies + cache.
    void logoutApi();
  };

  return (
    <AuthContext.Provider value={{ user, authStatus, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
