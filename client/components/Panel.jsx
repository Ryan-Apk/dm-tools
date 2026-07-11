// Works just like a div but stylised

export default function Panel({ children, className }) {
  let styling = 'p-10 border-accent border-4 bg-surface text-ink m-5 rounded-2xl';
  if (className) {
    styling = `${className}p-10 border-accent border-4 bg-surface text-ink m-5 rounded-2xl`;
  }

  return (
    <div className={styling}>
      {children}
    </div>
  );
}
