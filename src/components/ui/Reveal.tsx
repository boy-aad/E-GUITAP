import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';

const OBSERVER_SUPPORTED = typeof IntersectionObserver !== 'undefined';

/**
 * Style d'apparition, à choisir selon le contenu :
 * - `up` (défaut) : texte, cartes d'une grille ;
 * - `left` / `right` : colonnes d'une mise en page en deux parties (chacune vient de son côté) ;
 * - `zoom` : images, bandeaux, blocs mis en valeur ;
 * - `fade` : grands blocs pleine largeur.
 */
export type RevealVariant = 'up' | 'left' | 'right' | 'zoom' | 'fade';

type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  /** Délai en millisecondes, pour échelonner les éléments d'une grille. */
  delay?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Apparition au défilement (700 ms), déclenchée une fois quand l'élément entre à l'écran.
 * Si l'utilisateur demande à réduire les animations : simple fondu, sans déplacement
 * (CSS, index.css). Le contenu reste toujours dans le DOM, lisible par les lecteurs d'écran.
 */
export function Reveal({ children, variant = 'up', delay = 0, as: Tag = 'div', className = '' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible || !OBSERVER_SUPPORTED) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Déclenché dès que le haut de l'élément dépasse le bas de l'écran de 6 % : l'animation se voit.
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined;
  return (
    <Tag ref={ref} className={`reveal ${className}`} data-reveal={variant} data-visible={visible || !OBSERVER_SUPPORTED ? '' : undefined} style={style}>
      {children}
    </Tag>
  );
}
