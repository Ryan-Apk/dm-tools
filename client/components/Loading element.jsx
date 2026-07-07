import D20Spinner from './D20Spinner.jsx';
import D20SpinnerTopDown from './D20SpinnerTopDown.jsx';

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <p>Loading...</p>
      <D20Spinner />
      <D20SpinnerTopDown size={96} />
    </div>
  );
}
