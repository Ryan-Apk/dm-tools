import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { apiFetch } from '../utils/api.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const openExpiryModal = useCallback(() => setIsModalOpen(true), []);
  const closeExpiryModal = useCallback(() => setIsModalOpen(false), []);

  // Restores the session on page load; this also exercises the silent
  // refresh path in apiFetch if the access token expired while the tab was closed.
  useEffect(() => {
    apiFetch('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    setIsModalOpen(false);
  }, []);

  const signup = useCallback((userData) => {
    setUser(userData);
    setIsModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST', skipAuthRetry: true });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    isModalOpen,
    openExpiryModal,
    closeExpiryModal,
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
  }), [isModalOpen, openExpiryModal, closeExpiryModal, user, isLoading, login, logout, signup]);

  // todo add sign up option to below
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
