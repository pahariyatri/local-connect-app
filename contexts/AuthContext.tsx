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

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem('user_meta');

      // 1. If we have meta locally, use it immediately for speed (UI "feel" as logged in)
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch { localStorage.removeItem('user_meta'); }
      }

      // 2. Always verify the session with the backend (HttpOnly cookies).
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
    <AuthContext.Provider value={{ user, login, logout }}>
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
