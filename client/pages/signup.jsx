import { useNavigate } from 'react-router-dom';
import SignupModal from '../components/SignupModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const auth = useAuth();

  // replace true here ensures we do not get an infinite loop
  if (auth.isAuthenticated) {
    navigate('/', { replace: true });
  }

  return (
    <div>
      <SignupModal closeModal={() => navigate('/')} />
    </div>
  );
}
