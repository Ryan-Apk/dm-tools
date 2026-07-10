import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from "../components/LoadingElement.jsx";
import Panel from "../components/Panel.jsx";

function showError(error) {
  return (<div className="flex flex-col justify-center items-center content-center p-10">
    <p className="text-3xl text-primary">Error:</p>

    <p className="text-3xl text-accent ">{error}</p>
  </div>);
}

function filterTables(data){
  if (!data) return showError("Ensure you are in a campaign");
  let html = "";
  // todo make this parse each table, only displaying those the user wants to see, put in a nice wrapped up thing
  // data.forEach((campaign) => {
  //
  // })
  return JSON.stringify(data);
}

export default function DiceRoller() {
  const auth = useAuth();

  const list = auth.user?.campaigns ?? [];
  const campaigns = JSON.stringify(list);

  // race condition, we must wait for the auth to happen otherwise we error :/
  const { data, isPending, isError, error } = useQuery({
    queryKey: [`/database/dice/getall/${campaigns}`],
    enabled: !auth.isLoading && list.length > 0,
  });

  if (auth.isLoading) return <Loading/>;
  if (list.length === 0) return showError("Make sure you are in a campaign");

  return (
    <div>
      {isPending && <div className="h-screen"><Loading/></div>}
      {!isPending && (<Panel>{filterTables(data)}</Panel>)}

      {isError && showError(error?.body?.message || "An unexpected error occurred.")}
    </div>
  );
}
