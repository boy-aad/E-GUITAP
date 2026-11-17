import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../lib/motion';

const OBSERVER_SUPPORTED = typeof IntersectionObserver !== 'undefined';

type RevealProps = {
  children: ReactNode;
  /** Délai en millisecondes, pour échelonner les éléments d'une grille. */
  delay?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Apparition au défilement (fondu + translation de 16 px, 500 ms).
 * Sans animation si l'utilisateur a demandé à réduire les mouvements ; le contenu
 * reste toujours dans le DOM et lisible par les lecteurs d'écran.
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || visible || !OBSERVER_SUPPORTED) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, visible]);

  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined;
  return (
    <Tag ref={ref} className={`reveal ${className}`} data-visible={reduced || visible || !OBSERVER_SUPPORTED ? '' : undefined} style={style}>
      {children}
    </Tag>
  );
}
