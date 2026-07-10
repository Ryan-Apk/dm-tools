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

  // /auth/login and /auth/signup only return { userId, email } (just enough to
  // confirm the cookies were set), not the full profile - so both the initial
  // page-load restore and a fresh login/signup hydrate user state from here.
  const refreshUser = useCallback(() => apiFetch('/auth/me')
    .then((res) => setUser(res.data))
    .catch(() => setUser(null)), []);

  // Restores the session on page load; this also exercises the silent
  // refresh path in apiFetch if the access token expired while the tab was closed.
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(() => refreshUser().then(() => setIsModalOpen(false)), [refreshUser]);

  const signup = useCallback(() => refreshUser().then(() => setIsModalOpen(false)), [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST', skipAuthRetry: true });
    } finally {
      setUser(null);
    }
  }, []);

  const currentCampaign = user?.currentCampaign ?? null;

  // campaignId may be null to clear the selection; the server rejects anything
  // that isn't one of the user's assigned campaigns
  const setCurrentCampaign = useCallback(async (campaignId) => {
    const res = await apiFetch('/auth/me/campaign', {
      method: 'PATCH',
      body: JSON.stringify({ campaignId }),
    });
    setUser((prev) => (prev ? { ...prev, currentCampaign: res.data.currentCampaign } : prev));
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
    currentCampaign,
    setCurrentCampaign,
  }), [
    isModalOpen, openExpiryModal, closeExpiryModal, user, isLoading, login, logout, signup,
    currentCampaign,
  ]);

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
