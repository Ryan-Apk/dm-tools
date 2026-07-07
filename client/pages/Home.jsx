import Panel from '../components/Panel.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();

  const username = user?.username || 'Error: login again';

  return (
    <Panel>
      <h1 className="text-3xl">
        Welcome
        {' '}
        {username}!
      </h1>
    </Panel>
  );
}
