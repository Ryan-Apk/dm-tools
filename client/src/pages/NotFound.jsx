import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <Link className="mt-4 inline-block underline" to="/">
          Go home
        </Link>
      </div>
    </main>
  );
}
