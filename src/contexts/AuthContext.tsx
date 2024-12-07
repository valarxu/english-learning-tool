'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authenticateUser } from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleNotAuthenticated = useCallback(() => {
    setIsAuthenticated(false);
    setUsername(null);
    setIsLoading(false);
    
    if (pathname !== '/login') {
      router.replace('/login');
    }
  }, [pathname, router]);

  const checkAuth = useCallback(() => {
    setIsLoading(true);
    const authData = localStorage.getItem('auth');

    if (!authData) {
      handleNotAuthenticated();
      return;
    }

    try {
      const { username, expiresAt } = JSON.parse(authData);
      if (new Date(expiresAt) < new Date()) {
        localStorage.removeItem('auth');
        handleNotAuthenticated();
        return;
      }

      setIsAuthenticated(true);
      setUsername(username);

      if (pathname === '/login') {
        router.replace('/');
      }
    } catch {
      handleNotAuthenticated();
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname, handleNotAuthenticated]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    try {
      const user = await authenticateUser(username, password);
      
      const authData = {
        id: user.id,
        username: user.username,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      localStorage.setItem('auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setUsername(user.id);
      router.replace('/');
      
      return true;
    } catch (_error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
    setUsername(null);
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-300/80 via-green-400/70 to-teal-500/80 flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 