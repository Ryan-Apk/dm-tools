import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

export default function NavBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    user, isAuthenticated, isLoading, logout,
  } = useAuth();

  const go = (path) => { navigate(path); setOpen(false); };

  const navButtons = (
    <>
      <Button onClick={() => go('/')}>Home</Button>
      <Button onClick={() => go('/dice')}>Dice Rollers</Button>
      <Button>Test</Button>
      <Button>Test</Button>
      <Button>Test</Button>
    </>
  );

  const authButtons = !isLoading && (
    isAuthenticated ? (
      <>
        <span className="font-extrabold">{user.email}</span>
        <Button type="button" onClick={() => { logout(); setOpen(false); }}>Log out</Button>
      </>
    ) : (
      <Button onClick={() => go('/login')}>Log in</Button>
    )
  );

  return (
    <div className="border-b-6 border-accent border-double font-bold">
      <div className="bg-ink flex justify-between items-center gap-4 p-4">
        {/* Desktop: inline groups */}
        <div className="hidden md:flex items-center gap-4">{navButtons}</div>
        <div className="hidden md:flex items-center gap-4">{authButtons}</div>

        {/* Mobile: hamburger toggle */}
        <button
          className="md:hidden text-accent text-2xl px-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile: dropdown panel */}
      {open && (
        <div className="md:hidden bg-ink flex flex-col items-start gap-4 p-4">
          {navButtons}
          {authButtons}
        </div>
      )}
    </div>
  );
}
