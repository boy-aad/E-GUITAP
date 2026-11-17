import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../lib/motion';

type CountUpProps = {
  /** Valeur finale (issue de la base, jamais inventée). */
  value: number;
  /** Mise en forme de la valeur (ex. formatHectares). */
  format?: (n: number) => string;
  durationMs?: number;
  className?: string;
};

const defaultFormat = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

/**
 * Compteur animé de 0 à `value` quand il devient visible. La valeur finale est
 * annoncée aux lecteurs d'écran dès le départ ; l'animation est désactivée si
 * l'utilisateur a demandé à réduire les mouvements.
 */
export function CountUp({ value, format = defaultFormat, durationMs = 1400, className = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || typeof IntersectionObserver === 'undefined') return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const decimals = Number.isInteger(value) ? 0 : 1;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        setCurrent(t < 1 ? Number((value * eased).toFixed(decimals)) : value);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs, reduced]);

  // Sans animation possible, la valeur finale s'affiche directement.
  const animated = !reduced && typeof IntersectionObserver !== 'undefined';
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
