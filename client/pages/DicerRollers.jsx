import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';

function showError(error) {
  return (<div className="flex flex-col justify-center items-center content-center p-10">
    <p className="text-3xl text-primary">Error:</p>

    <p className="text-3xl text-accent ">{error}</p>
  </div>);
}

export default function DiceRoller() {
  const auth = useAuth();

  const list = auth.user?.campaigns ?? [];
  let campaigns = JSON.stringify(list);
  campaigns = ""

  // race condition, we must wait for the auth to happen otherwise we error :/
  const { data, isPending, isError, error } = useQuery({
    queryKey: [`/database/dice/getall/${campaigns}`],
    enabled: !auth.isLoading && list.length > 0,
  });

  if (auth.isLoading) return <div className="flex-center-horizontal text-2xl p-10">Loading...</div>;
  if (list.length === 0) return showError("Make sure you are in a campaign");

  return (
    <div>
      {isPending && <div className="flex-center-horizontal text-2xl p-10">Loading...</div>}
      {!isPending && JSON.stringify(data)}
      {isError && showError(error?.body?.message || "An unexpected error occurred.")}
    </div>
  );
}
