import { useEffect, useRef, useState } from 'react';

type CountUpProps = {
  /** Valeur finale (issue de la base, jamais inventée). */
  value: number;
  /** Mise en forme de la valeur (ex. formatHectares). */
  format?: (n: number) => string;
  durationMs?: number;
  /** Attente avant le départ, une fois visible (décalage entre plusieurs compteurs). */
  delayMs?: number;
  className?: string;
};

const defaultFormat = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

/**
 * Compteur animé de 0 à `value`, déclenché une seule fois quand il arrive à l'écran au
 * défilement. La valeur finale est annoncée aux lecteurs d'écran dès le départ.
 *
 * Exception validée par le propriétaire à la règle n° 16 (CLAUDE.md) : le comptage s'exécute
 * même si le système demande de réduire les animations, car il ne déplace rien à l'écran
 * (seul le texte du chiffre change).
 */
export function CountUp({ value, format = defaultFormat, durationMs = 1800, delayMs = 0, className = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let frame = 0;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      timer = window.setTimeout(() => {
        const start = performance.now();
        const decimals = Number.isInteger(value) ? 0 : 1;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - t, 3);
          setCurrent(t < 1 ? Number((value * eased).toFixed(decimals)) : value);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }, delayMs);
    }, { threshold: 0.6 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs, delayMs]);

  // Navigateur sans IntersectionObserver : la valeur finale s'affiche directement.
  const animated = typeof IntersectionObserver !== 'undefined';
  const shown = animated ? (current ?? 0) : value;
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true" className="tabular-nums">
        {format(shown)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
