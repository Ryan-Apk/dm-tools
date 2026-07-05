import { Route, Routes } from 'react-router-dom';
import NotFound from './NotFound.jsx';
import BugList from './BugList.jsx';
import Button from '../components/Button.jsx';
import NavBar from '../components/NavBar.jsx';
import Login from './Login.jsx';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useQuery } from '@tanstack/react-query'; // Adjust path if needed
import { apiFetch } from '../utils/api.js';
import Home from './Home.jsx';

function DiceRoller() {
  const { data } = useQuery({
    queryKey: ['whiteboard'],
    queryFn: () => apiFetch('/database/whiteboard/get'),
  });
  return (
    <div>
      {JSON.stringify(data)}
    </div>
  );
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
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
