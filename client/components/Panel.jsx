// Works just like a div but stylised

export default function Panel({ children }) {
  return (
    <div className="p-10 border-accent border-4 bg-surface text-ink m-5 rounded-2xl">
      {children}
    </div>
  );
}
