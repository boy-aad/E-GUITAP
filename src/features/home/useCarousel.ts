import { useCallback, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../../lib/motion';

/**
 * État d'un carrousel à défilement automatique. La lecture s'interrompt au survol,
 * quand le focus clavier est dans le carrousel, quand l'onglet est masqué, sur demande
 * (bouton pause) et toujours si l'utilisateur demande à réduire les mouvements.
 */
export function useCarousel(count: number, intervalMs: number) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const autoplay = count > 1 && !reduced && !userPaused;
  const running = autoplay && !hovered && !focused && !hidden;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearTimeout(id);
    // oxlint-disable-next-line react/exhaustive-deps -- `index` est voulu : le délai repart à chaque changement de slide.
  }, [running, index, count, intervalMs]);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  return {
    index: count > 0 ? index % count : 0,
    go,
    next: () => go(index + 1),
    prev: () => go(index - 1),
    /** Lecture automatique active (hors pauses temporaires). */
    autoplay,
    /** Défilement en cours en ce moment. */
    running,
    canAutoplay: count > 1 && !reduced,
    togglePause: () => setUserPaused((p) => !p),
    /** Gestionnaires à poser sur l'élément racine du carrousel. */
    bind: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      },
    },
  };
}
