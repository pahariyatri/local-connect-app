'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_BASE_URL } from '@/utils/constants';

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
        setUser(JSON.parse(storedUser));
      }

      // 2. Always verify session with backend (Verifies HttpOnly cookies)
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include'
        });

        if (response.ok) {
          const userProfile = await response.json();
          const mappedUser = {
            id: userProfile.id,
            name: userProfile.name || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User',
            email: userProfile.email || '',
            phone: userProfile.phone || '',
            role: userProfile.role || 'Guest'
          };
          setUser(mappedUser);
          localStorage.setItem('user_meta', JSON.stringify(mappedUser));
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (e) {
        console.warn("Auth check failed.", e);
        // If API fails (network error), keep the local meta if it exists
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
    localStorage.removeItem('accessToken');
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
