import { useSyncExternalStore } from 'react';

// Préférence « réduire les animations » du système, suivie en direct.

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

const getSnapshot = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(QUERY).matches;

/** true si l'utilisateur a demandé à réduire les animations : aucune animation automatique. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
