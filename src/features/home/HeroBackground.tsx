import { useState } from 'react';
import type { ImageSource } from '../../content/types';
import { HeroScene } from './HeroScene';

type HeroBackgroundProps = {
  /** Image de la slide (téléversée ou photo par défaut) ; null → scène de marque. */
  source: ImageSource | null;
  /** Point focal de l'image (0 à 1) ; null = centre. */
  focal: { x: number; y: number } | null;
  /** Le chargement a échoué : la scène de marque prend le relais. */
  failed: boolean;
  onError: () => void;
  active: boolean;
  /** Première slide : image LCP, chargée en priorité. */
  priority: boolean;
};

/**
 * Fond d'une slide : photo plein cadre avec effet Ken Burns, ou scène de marque animée
 * si aucune photo n'est disponible ou si son chargement échoue.
 */
export function HeroBackground({ source, focal, failed, onError, active, priority }: HeroBackgroundProps) {
  // À chaque nouvelle activation, l'image est remontée : l'effet Ken Burns repart de zéro.
  // Elle garde son cadrage final pendant le fondu de sortie.
  const [run, setRun] = useState(0);
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (active) setRun((r) => r + 1);
  }

  return (
    <div
      className={`absolute inset-0 -z-20 transition-opacity duration-1000 ease-in-out ${active ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!active}
    >
      {source && !failed ? (
        <img
          key={run}
          src={source.src}
          srcSet={source.srcSet}
          sizes="100vw"
          alt=""
          width={source.width}
          height={source.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'low'}
          decoding="async"
          onError={onError}
          className="ken-burns h-full w-full object-cover"
          style={focal ? { objectPosition: `${focal.x * 100}% ${focal.y * 100}%`, transformOrigin: `${focal.x * 100}% ${focal.y * 100}%` } : undefined}
        />
      ) : (
        <HeroScene />
      )}
    </div>
  );
}
