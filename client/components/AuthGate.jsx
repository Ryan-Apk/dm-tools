import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoginModal from './LoginModal.jsx';

// pages that must stay usable while logged out
const PUBLIC_PATHS = ['/login', '/signup'];

// Keeps the routed page mounted (so in-progress form state survives a mid-session
// logout) but hides it behind an opaque full-screen login overlay whenever the
// user isn't authenticated or their session has expired.
export default function AuthGate({ children }) {
  const {
    isAuthenticated, isLoading, isModalOpen, closeExpiryModal,
  } = useAuth();
  const location = useLocation();

  const isPublicPage = PUBLIC_PATHS.includes(location.pathname);
  // isLoading is included so protected content never flashes before /auth/me resolves
  const showOverlay = !isPublicPage && (isLoading || !isAuthenticated || isModalOpen);

  return (
    <>
      {children}
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-base-transparent flex flex-col items-center justify-center gap-4">
          {!isLoading && (
            <LoginModal closeModal={closeExpiryModal} />
          )}
        </div>
      )}
    </>
  );
}
