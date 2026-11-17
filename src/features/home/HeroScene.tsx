// Scène animée de marque : repli du hero quand aucune photo n'est disponible.
// SVG + CSS uniquement (aucune requête réseau). Animations définies dans index.css
// (.hero-scene-*), toutes coupées si l'utilisateur demande à réduire les mouvements.

/** Bâtiments d'un plan : [x, largeur, hauteur]. */
type Building = readonly [number, number, number];

const FAR: Building[] = [
  [0, 70, 120], [80, 50, 170], [140, 90, 110], [240, 60, 200], [310, 80, 140], [400, 50, 230], [460, 100, 130],
  [570, 60, 180], [640, 80, 120], [730, 50, 210], [790, 90, 150], [890, 60, 190], [960, 80, 120], [1050, 70, 170],
  [1130, 100, 140], [1240, 60, 220], [1310, 90, 130], [1410, 70, 180], [1490, 110, 150],
];
const MID: Building[] = [
  [20, 90, 90], [120, 60, 140], [190, 110, 100], [310, 70, 160], [390, 90, 80], [490, 60, 130], [560, 120, 110],
  [690, 70, 170], [770, 100, 90], [880, 60, 150], [950, 110, 100], [1070, 80, 140], [1160, 60, 90], [1230, 120, 160],
  [1360, 70, 110], [1440, 100, 130],
];
const NEAR: Building[] = [
  [0, 120, 60], [130, 80, 95], [220, 140, 50], [370, 90, 110], [470, 130, 70], [610, 100, 85], [720, 150, 55],
  [880, 90, 100], [980, 130, 65], [1120, 100, 90], [1230, 140, 60], [1380, 110, 80], [1500, 100, 70],
];

function Skyline({ buildings, fill, className }: { buildings: Building[]; fill: string; className: string }) {
  // Le motif est dessiné deux fois côte à côte pour un défilement continu.
  return (
    <g className={className}>
      {[0, 1600].map((dx) => (
        <g key={dx} transform={`translate(${dx} 0)`} fill={fill}>
          {buildings.map(([x, w, h]) => (
            <rect key={x} x={x} y={900 - h} width={w} height={h} />
          ))}
        </g>
      ))}
    </g>
  );
}

/** Parcelles d'un lotissement en perspective légère, tracées en filets or. */
const PARCELS = [
  'M860 640 L1180 600 L1420 660 L1100 710 Z',
  'M1100 710 L1420 660 L1560 720 L1240 780 Z',
  'M860 640 L1100 710 L960 760 L720 690 Z',
  'M960 760 L1240 780 L1100 840 L820 815 Z',
  'M1020 625 L1060 735',
  'M1180 600 L1300 695',
  'M1300 680 L1400 750',
];

const DUST = [
  [180, 300], [420, 180], [640, 420], [910, 260], [1150, 380], [1380, 210], [300, 560], [760, 120], [1490, 470], [1040, 520],
] as const;

export function HeroScene() {
  return (
    <div className="hero-scene absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
        <defs>
          <linearGradient id="hs-sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0A1C33" />
            <stop offset="0.55" stopColor="#102C50" />
            <stop offset="1" stopColor="#173A66" />
          </linearGradient>
          <radialGradient id="hs-glow" cx="0.78" cy="0.3" r="0.5">
            <stop offset="0" stopColor="#C6A15B" stopOpacity="0.28" />
            <stop offset="1" stopColor="#C6A15B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#hs-sky)" />
        <rect width="1600" height="900" fill="url(#hs-glow)" className="hero-scene-breathe" />

        <Skyline buildings={FAR} fill="#173A66" className="hero-scene-far" />
        <Skyline buildings={MID} fill="#14335C" className="hero-scene-mid" />

        <g fill="none" stroke="#C6A15B" strokeWidth="2" strokeLinejoin="round" className="hero-scene-plots">
          {PARCELS.map((d, i) => (
            <path key={d} d={d} pathLength={1} style={{ animationDelay: `${i * 0.6}s` }} />
          ))}
          {/* Bornes aux angles des parcelles */}
          {[[860, 640], [1180, 600], [1420, 660], [1100, 710], [1560, 720], [1240, 780], [720, 690], [960, 760], [820, 815], [1100, 840]].map(
            ([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#C6A15B" stroke="none" />
            ),
          )}
        </g>

        <Skyline buildings={NEAR} fill="#0E2747" className="hero-scene-near" />

        <g fill="#E8D7B0">
          {DUST.map(([x, y], i) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={i % 3 === 0 ? 2.5 : 1.6} className="hero-scene-dust" style={{ animationDelay: `${i * 1.3}s` }} />
          ))}
        </g>
      </svg>
    </div>
  );
}
