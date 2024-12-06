'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    setIsLoading(true);
    const authData = localStorage.getItem('auth');

    if (!authData) {
      handleNotAuthenticated();
      return;
    }

    try {
      const { username, expiresAt } = JSON.parse(authData);
      if (new Date(expiresAt) < new Date()) {
        // Token 过期
        localStorage.removeItem('auth');
        handleNotAuthenticated();
        return;
      }

      // 有效的认证
      setIsAuthenticated(true);
      setUsername(username);

      // 如果在登录页且已认证，重定向到首页
      if (pathname === '/login') {
        router.replace('/');
      }
    } catch {
      handleNotAuthenticated();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotAuthenticated = () => {
    setIsAuthenticated(false);
    setUsername(null);
    setIsLoading(false);
    
    // 如果不在登录页，重定向到登录页
    if (pathname !== '/login') {
      router.replace('/login');
    }
  };

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
    } catch (error) {
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