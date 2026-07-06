import { useNavigate } from 'react-router-dom';
import SignupModal from '../components/SignupModal.jsx';

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div>
      <SignupModal closeModal={() => navigate('/')} />
    </div>
  );
}
