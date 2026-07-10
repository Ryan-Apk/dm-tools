import D20SpinnerTopDown from './D20SpinnerTopDown.jsx';
import D20Spinner from './D20Spinner.jsx';

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <D20SpinnerTopDown size={96} />
      <p className="text-3xl animate-pulse">Loading...</p>
    </div>
  );
}
