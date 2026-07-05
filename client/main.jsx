import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './context/Tanstack.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginModal from './components/LoginModal.jsx';

function AppContent() {
  const { isModalOpen, openExpiryModal, closeExpiryModal } = useAuth();

  // Memoize client creation so it doesn't re-instantiate on re-renders
  const queryClient = useMemo(() => createQueryClient(openExpiryModal), [openExpiryModal]);

  return (
    <QueryClientProvider client={queryClient}>
      <App />
      {isModalOpen && (
        <div className="modal">
          <h2>Session Expired</h2>
          <LoginModal closeModal={closeExpiryModal} />
        </div>
      )}
    </QueryClientProvider>
  );
}

/// Main entry point into the program
/// Binds to the root element that is inside the index.html
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
