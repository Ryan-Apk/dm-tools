import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const {
    user, isAuthenticated, isLoading, logout,
  } = useAuth();

  return (
    <div className="flex justify-end items-center gap-4 p-4">
      {!isLoading && (
        isAuthenticated ? (
          <>
            <span>{user.email}</span>
            <button type="button" onClick={logout}>Log out</button>
          </>
        ) : (
          <Link to="/login">Log in</Link>
        )
      )}
    </div>
  );
}
