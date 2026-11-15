import type { ReactNode } from 'react';

/**
 * Étiquette de section (Inter SemiBold, capitales, espacement 15 % — charte p. 18).
 * Sur fond clair, le texte reste ardoise : l'or sur blanc est réservé aux filets
 * et aux grands titres (contraste 2,41 — charte p. 16).
 */
export function Eyebrow({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <p
      className={`flex items-center gap-2.5 font-inter text-[11px] font-semibold uppercase tracking-[0.15em] sm:text-xs ${
        tone === 'dark' ? 'text-gold' : 'text-slate-text'
      }`}
    >
      <span className="h-0.5 w-6 bg-gold" aria-hidden="true" />
      {children}
    </p>
  );
}
