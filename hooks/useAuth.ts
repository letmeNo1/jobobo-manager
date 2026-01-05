import { useState, useCallback } from 'react';
import { Screen } from '../types';

interface User {
  username: string;
  role: string;
}

export const useAuth = (onNavigate?: (screen: Screen) => void) => {
  // 从 localStorage 初始化状态
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (onNavigate) onNavigate('SELECT_JABOBO');
  }, [onNavigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    if (onNavigate) onNavigate('LOGIN');
  }, [onNavigate]);

  return {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'Admin',
    login,
    logout
  };
};