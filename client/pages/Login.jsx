import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal.jsx';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div>
      <LoginModal closeModal={() => navigate('/')} />
    </div>
  );
}
