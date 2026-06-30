import { Route, Routes } from 'react-router-dom';
import NotFound from './NotFound.jsx';
import BugList from './BugList.jsx';
import Button from '../components/Button.jsx';
import NavBar from '../components/NavBar.jsx';
import Login from './Login.jsx';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Adjust path if needed

function DiceRoller() {
  const { openExpiryModal } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3000/database/whiteboard/get', { credentials: 'include' })
      .then((res) => {
        console.log('Auth Test Status:', res.status);
        if (res.status === 401) {
          openExpiryModal(); // This fires your context state and opens the modal
        }
      })
      .catch((err) => console.error('Auth Test Failed:', err));
  }, [openExpiryModal]);

  return null;
}

/// This is the file that returns the full function of the program, should only contain routes
export default function App() {
  return (
    <div>
      <NavBar />
      <Routes>
        {/* The below routes to the home.jsx page */}
        <Route path="/login" element={<Login />} />
        {/* TODO remove this temporary testing page */}
        <Route path="/dice" element={<DiceRoller />} />
        <Route path="/bugs" element={<BugList />} />
        <Route path="/button" element={<Button>Hi</Button>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
