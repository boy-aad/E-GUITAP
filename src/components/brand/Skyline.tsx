// Éléments graphiques de la charte v1.3 (p. 19) : motif skyline en aplat
// ton sur ton, bande tricolore fine, filet et repère d'angle dorés.
// Ils remplacent les photos d'illustration en attendant de vraies photos.

/** Motif skyline : bâtiments en aplat, ton sur ton (marine clair sur marine). */
export function Skyline({ className = '' }: { className?: string }) {
  // Hauteurs variées, angles droits : même vocabulaire que les bâtiments du logo.
  const buildings = [
    [0, 70], [46, 110], [80, 52], [118, 140], [160, 88], [204, 165], [248, 96],
    [290, 128], [338, 64], [372, 150], [420, 82], [462, 118], [508, 58], [546, 136],
    [592, 90], [636, 172], [680, 104], [724, 70], [760, 124], [806, 86], [850, 146],
    [896, 62], [934, 112], [980, 92], [1024, 158], [1070, 76], [1110, 120], [1156, 98],
  ] as const;
  return (
    <svg
      viewBox="0 0 1200 180"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">
        {buildings.map(([x, h]) => (
          <rect key={x} x={x} y={180 - h} width={40} height={h} />
        ))}
        {/* Grue, en filigrane */}
        <rect x={620} y={10} width={130} height={5} />
        <rect x={652} y={10} width={5} height={170} />
        <rect x={622} y={15} width={16} height={10} />
        <rect x={728} y={15} width={2} height={34} />
      </g>
    </svg>
  );
}

/** Bande tricolore guinéenne : trois segments égaux, toujours en bordure. */
export function TricolorBand({ className = 'h-1' }: { className?: string }) {
  return (
    <div className={`flex w-full shrink-0 ${className}`} aria-hidden="true">
      <div className="flex-1 bg-gn-red" />
      <div className="flex-1 bg-gn-yellow" />
      <div className="flex-1 bg-gn-green" />
    </div>
  );
}

/**
 * Panneau visuel neutre aux couleurs de la charte, utilisé à la place d'une photo
 * tant qu'aucune photo réelle n'est disponible.
 */
export function BrandPanel({ className = '', label }: { className?: string; label?: string }) {
  return (
    <div className={`relative overflow-hidden bg-marine ${className}`}>
      <Skyline className="absolute inset-x-0 bottom-0 h-3/5 w-full text-marine-light" />
      <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-gold" aria-hidden="true" />
      {label && (
        <p className="absolute bottom-5 left-5 right-5 font-poppins text-lg font-bold text-white sm:text-xl">
          {label}
        </p>
      )}
      <TricolorBand className="absolute inset-x-0 bottom-0 h-1" />
    </div>
  );
}
