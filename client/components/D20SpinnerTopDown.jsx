export default function D20SpinnerTopDown({ size = 64, className = '' }) {
  const hex = '50,4 90,27 90,73 50,96 10,73 10,27'; // centered on 50,50
  const tri = '50,21.6 25.4,64.2 74.6,64.2'; // circumradius 28.4, centroid 50,50

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin motion-reduce:animate-none ${className}`}
      style={{ width: size, height: size, animationDuration: '1.4s' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <g
          fill="none"
          stroke="var(--color-accent, #d4af37)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <polygon points={hex} />
          <polygon points={tri} fill="var(--color-accent, #d4af37)" fillOpacity="0.12" />
          <path d="M50,21.6 L50,4 M50,21.6 L10,27 M50,21.6 L90,27
         M25.4,64.2 L10,27 M25.4,64.2 L10,73 M25.4,64.2 L50,96
         M74.6,64.2 L90,27 M74.6,64.2 L90,73 M74.6,64.2 L50,96"
          />
        </g>
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="14"
          fontWeight="700"
          fill="var(--color-accent, #d4af37)"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          20
        </text>
      </svg>
    </span>
  );
}
