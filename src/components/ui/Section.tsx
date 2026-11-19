import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';
import { Reveal } from './Reveal';

/** Conteneur centré de la grille du site. */
export function Container({
  children,
  size = 'default',
  className = '',
}: {
  children: ReactNode;
  size?: 'default' | 'narrow';
  className?: string;
}) {
  const width = size === 'narrow' ? 'max-w-3xl' : 'max-w-7xl';
  return <div className={`mx-auto w-full ${width} px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export type SectionTone = 'paper' | 'white' | 'ivory' | 'marine';

const TONES: Record<SectionTone, string> = {
  paper: 'bg-paper text-marine',
  white: 'bg-white text-marine',
  ivory: 'bg-ivory text-marine',
  marine: 'bg-marine text-white',
};

type SectionProps = {
  children?: ReactNode;
  id?: string;
  /** Fond de la section : alterner pour rythmer la lecture. */
  tone?: SectionTone;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  /** Lien ou bouton aligné à droite de l'en-tête (ex. « Tous les projets »). */
  action?: ReactNode;
  /** Espacement vertical réduit. */
  compact?: boolean;
  className?: string;
  'aria-label'?: string;
};

/** Section de page : en-tête (eyebrow, titre, intro) + contenu, avec un fond de la charte. */
export function Section({
  children,
  id,
  tone = 'paper',
  eyebrow,
  title,
  intro,
  action,
  compact,
  className = '',
  'aria-label': ariaLabel,
}: SectionProps) {
  const dark = tone === 'marine';
  const headingId = id && title ? `${id}-titre` : undefined;
  const hasHeader = Boolean(eyebrow || title || intro || action);
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-label={headingId ? undefined : ariaLabel}
      className={`${TONES[tone]} ${compact ? 'py-12 lg:py-16' : 'py-20 lg:py-28'} scroll-mt-24 ${className}`}
    >
      <Container>
        {hasHeader && (
          <Reveal className={`${compact ? 'mb-8 lg:mb-10' : 'mb-10 lg:mb-14'} flex flex-col justify-between gap-6 lg:flex-row lg:items-end`}>
            <div className="max-w-3xl space-y-4">
              {eyebrow && <Eyebrow tone={dark ? 'dark' : 'light'}>{eyebrow}</Eyebrow>}
              {title && (
                <h2
                  id={headingId}
                  className={`font-poppins text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] ${
                    dark ? 'text-white' : 'text-marine'
                  }`}
                >
                  {title}
                </h2>
              )}
              {intro && (
                <div className={`text-base leading-relaxed sm:text-lg ${dark ? 'text-white/80' : 'text-slate-text'}`}>
                  {intro}
                </div>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </Reveal>
        )}
        {children}
      </Container>
    </section>
  );
}
