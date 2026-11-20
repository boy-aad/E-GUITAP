import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type CardProps = Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'> & {
  children: ReactNode;
  as?: ElementType;
  /** Élévation et léger déplacement au survol (cartes cliquables). */
  interactive?: boolean;
  className?: string;
};

/** Carte de la charte : bordure fine, coins arrondis, ombre douce au survol. */
export function Card({ children, as: Tag = 'div', interactive, className = '', ...rest }: CardProps) {
  return (
    <Tag
      {...rest}
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white ${
        interactive
          ? 'group transition-[border-color,box-shadow,translate] duration-500 ease-spring hover:border-gold/50 hover:shadow-[0_20px_50px_-20px_rgba(16,44,80,0.35)] motion-safe:hover:-translate-y-1'
          : ''
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

export type BadgeTone = 'neutral' | 'gold' | 'marine' | 'green' | 'light';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-text',
  gold: 'border-gold/40 bg-ivory text-marine',
  marine: 'border-marine bg-marine text-white',
  green: 'border-gn-green/30 bg-gn-green/10 text-gn-green-hover',
  // Sur image ou fond sombre.
  light: 'border-white/70 bg-white/95 text-marine shadow-sm',
};

/** Pastille de statut ou de catégorie. */
export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
