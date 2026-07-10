import { Route, Routes } from 'react-router-dom';
import NotFound from './NotFound.jsx';
import BugList from './BugList.jsx';
import Button from '../components/Button.jsx';
import NavBar from '../components/NavBar.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Home from './Home.jsx';
import AuthGate from '../components/AuthGate.jsx';
import DiceRoller from './DicerRollers.jsx';
import Loading from '../components/LoadingElement.jsx';
import Settings from './Settings.jsx';

/// This is the file that returns the full function of the program, should only contain routes
export default function App() {
  return (
    <div>
      <NavBar />
      <AuthGate>
        <Routes>
          {/* The below routes to the home.jsx page */}
          <Route path="/loading" element={<Loading />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* TODO remove this temporary testing page */}
          <Route path="/dice" element={<DiceRoller />} />
          <Route path="/bugslist" element={<BugList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/button" element={<Button>Hi</Button>} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthGate>
    </div>
  );
}
