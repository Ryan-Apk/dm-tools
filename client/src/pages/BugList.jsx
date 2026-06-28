export default function BugList() {
  const bugs = [
    'Issue with Firefox mouse cursors where clicking the button breaks them',
  ];

  const roadmap = [
    'Feature for recording rolled dice',
    'Feature for rolling dice',
    'Roll on the d10000 table',
  ];

  return (
    <div>
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
    </div>
  );
}
