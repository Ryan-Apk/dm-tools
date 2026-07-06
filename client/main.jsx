import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './context/Tanstack.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

function AppContent() {
  const { openExpiryModal } = useAuth();

  // Memoize client creation so it doesn't re-instantiate on re-renders
  const queryClient = useMemo(() => createQueryClient(openExpiryModal), [openExpiryModal]);

  // the session-expired login overlay itself lives in AuthGate (see App.jsx)
  return (
    <QueryClientProvider client={queryClient}>
      <App />
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
