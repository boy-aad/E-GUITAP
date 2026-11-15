import type { ReactNode } from 'react';
import { Skyline } from '../brand/Skyline';
import { Eyebrow } from './Eyebrow';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
};

/** Bandeau d'en-tête des pages intérieures (fond marine, motif skyline). */
export function PageHero({ eyebrow, title, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-gold/40 bg-marine text-white">
      <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-marine-light sm:h-32" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl space-y-4">
          <Eyebrow tone="dark">{eyebrow}</Eyebrow>
          <h1 className="font-poppins text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
          {children && <div className="text-base leading-relaxed text-white/85 sm:text-lg">{children}</div>}
        </div>
      </div>
    </section>
  );
}
