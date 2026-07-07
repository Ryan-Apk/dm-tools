import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();

  // replace true here ensures we do not get an infinite loop
  if (auth.isAuthenticated) {
    navigate('/', { replace: true });
  }

  return (
    <div>
      <LoginModal closeModal={() => navigate('/')} />
    </div>
  );
}
