import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openExpiryModal = () => setIsModalOpen(true);
  const closeExpiryModal = () => setIsModalOpen(false);

  const logout = () => {
    // TODO request the logout endpoint to clear the http token
  };

  // todo add sign up option to below
  return (
    <AuthContext.Provider value={{
      isModalOpen, openExpiryModal, closeExpiryModal, logout,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
