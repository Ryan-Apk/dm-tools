import Panel from '../components/Panel.jsx';

export default function BugList() {
  const bugs = [
    'Known issue where sometimes user data does not load until a refresh of the page happens',
    'Issue with Firefox mouse cursors where clicking the button breaks them',
    'Multi device login not possible (and probably wont be any time soon)',
  ];

  const roadmap = [
    'Feature for recording rolled dice',
    'Feature for rolling dice',
    'Roll on the d10000 table',
    'Currently, campaign data is not separated',
  ];

  return (
    <Panel>
      <h1 className="text-xl font-bold">Roadmap</h1>
      <ul className="list-disc list-inside space-y-1">
        {roadmap.map((thing, index) => (
          <li key={index}>{thing}</li>
        ))}
      </ul>

      <h1 className="text-xl font-bold mt-10">Bugs</h1>
      <ul className="list-disc list-inside space-y-1">
        {bugs.map((thing, index) => (
          <li key={index}>{thing}</li>
        ))}
      </ul>
    </Panel>
  );
}
