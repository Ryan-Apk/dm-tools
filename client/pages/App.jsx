import { Route, Routes } from 'react-router-dom';
import NotFound from './NotFound.jsx';
import BugList from './BugList.jsx';
import Button from '../components/Button.jsx';
import NavBar from '../components/NavBar.jsx';
import LoginModal from '../components/LoginModal.jsx';

/// This is the file that returns the full function of the program, should only contain routes
export default function App() {
  return (
    <div>
      <NavBar />
      <Routes>
        {/* The below routes to the home.jsx page */}
        <Route
          path="/"
          component={App}
          element={(
            <LoginModal />
)}
        />
        <Route path="/bugs" element={<BugList />} />
        <Route path="/button" element={<Button>Hi</Button>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
