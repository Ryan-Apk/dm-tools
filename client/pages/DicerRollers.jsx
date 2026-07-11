import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from "../components/LoadingElement.jsx";
import Panel from "../components/Panel.jsx";
import TableRoller from "../components/TableRoller.jsx";

function showError(error) {
  return (<div className="flex flex-col justify-center items-center content-center p-10">
    <p className="text-3xl text-primary">Error:</p>

    <p className="text-3xl text-accent ">{error}</p>
  </div>);
}

function filterTables(data) {
  if (!data?.data) return showError("Ensure you are in a campaign");

  return data.data.map((table) => (
    <TableRoller
      key={table._id}
      tableName={table.name}
      diceMax={table.numEntries}
      tableDescription={table.description}
    />
  ));
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
      {!isPending && (<div className="flex flex-row flex-wrap p-10">{filterTables(data)}</div>)}

      {isError && showError(error?.body?.message || "An unexpected error occurred.")}
    </div>
  );
}
