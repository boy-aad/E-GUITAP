import { isRouteErrorResponse, useRouteError } from 'react-router';
import { RefreshCw } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Skyline, TricolorBand } from '../brand/Skyline';
import { Button } from '../ui/Button';

/** Écran affiché pendant le premier chargement du contenu. */
export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-paper" role="status">
      <Logo variant="horizontal-compact" className="h-[60px]" />
      {/* Barre de progression indéterminée (immobile si les animations sont réduites). */}
      <div className="h-1 w-48 overflow-hidden rounded-full bg-ivory-dark" aria-hidden="true">
        <div className="loading-bar h-full w-1/3 rounded-full bg-gold" />
      </div>
      <span className="sr-only">Chargement du site E-GUITAP…</span>
    </div>
  );
}

/** Écran affiché si le contenu n'a pas pu être chargé (réseau, base indisponible…). */
export function RootErrorScreen() {
  const error = useRouteError();
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-marine text-white">
      <title>E-GUITAP — Site momentanément indisponible</title>
      <TricolorBand className="h-1" />
      <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-marine-light" />
      <main className="relative mx-auto flex max-w-xl flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <Logo variant="horizontal-compact" theme="dark" className="h-[60px]" />
        <h1 className="font-poppins text-2xl font-bold">Le site est momentanément indisponible</h1>
        <p className="text-white/80">
          Le contenu n'a pas pu être chargé. Vérifiez votre connexion internet puis réessayez.
        </p>
        <Button onClick={() => window.location.reload()} icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}>
          Réessayer
        </Button>
        {import.meta.env.DEV && detail && <p className="text-xs text-white/50">{detail}</p>}
      </main>
    </div>
  );
}
