import type { ReactNode } from 'react';
import { Logo } from '../components/brand/Logo';
import { TricolorBand } from '../components/brand/Skyline';

/** Mise en page des écrans hors session : connexion, mot de passe oublié, réinitialisation. */
export function AuthShell({ title, heading, children }: { title: string; heading: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper font-inter text-marine">
      <title>{`${title} | Administration E-GUITAP`}</title>
      <meta name="robots" content="noindex, nofollow" />
      <TricolorBand className="h-1" />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo variant="horizontal-compact" className="h-[60px]" />
            <h1 className="font-poppins text-xl font-bold">{heading}</h1>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export const authCardClass = 'space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm';
