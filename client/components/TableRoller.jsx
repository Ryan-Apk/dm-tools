// button component use example:
/// <Button onClick={() => console.log('Button clicked!')}>Submit</Button>}/>

import Button from './Button.jsx';

export default function TableRoller({
  tableName = 'error',
  diceMin = 0,
  diceMax = 1,
  tableDescription = 'Error loading component description',
}) {
  // not entirely sure what should be checked here beyond the type
  if (typeof diceMin !== 'number') {
    diceMin = 0;
  }

  // not entirely sure what should be checked here beyond the type
  if (typeof diceMax !== 'number') {
    diceMax = 0;
  }

  return (
    <div className="grow shrink-0 basis-1/8 min-w-40 max-w-64 box-border p-8 border-accent border-4 bg-surface text-ink font-semibold m-5 rounded-2xl items-center justify-items-center content-center flex flex-col">
      <h1 className="text-center">{tableName}</h1>
      <p className="pt-10 pb-10 border-black border-2 w-full mb-2">Image</p>
      <p className="mb-2 leading-tight text-center text-xs">{tableDescription}</p>
      <hl className="border border-ink w-full mb-2" />
      <p>
        d
        {diceMax}
      </p>
      <div className="mb-2">
        <Button>Roll</Button>
      </div>
      <h1 className="mb-2">-OR-</h1>
      {/* This should be capped */}
      <input type="number" className="border-ink border w-full mb-2" placeholder="Enter number" />
      <Button>Record</Button>
    </div>
  );
}
