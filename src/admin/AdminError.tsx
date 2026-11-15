import { Link, isRouteErrorResponse, useRouteError } from 'react-router';
import { AlertTriangle } from 'lucide-react';

/** Erreur dans l'administration (page introuvable, chargement impossible…). */
export function AdminError({ notFound = false }: { notFound?: boolean }) {
  const error = useRouteError();
  const is404 = notFound || (isRouteErrorResponse(error) && error.status === 404);
  const detail = isRouteErrorResponse(error) ? error.data : error instanceof Error ? error.message : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center font-inter text-marine">
      <title>Erreur | Administration E-GUITAP</title>
      <AlertTriangle className="mx-auto h-10 w-10 text-gold-hover" aria-hidden="true" />
      <h1 className="mt-4 font-poppins text-xl font-bold">{is404 ? 'Page introuvable' : 'Une erreur est survenue'}</h1>
      {!is404 && detail && <p className="mt-2 text-sm text-slate-text">{String(detail)}</p>}
      <div className="mt-6 flex justify-center gap-4 text-sm font-semibold">
        <Link to="/admin" className="underline">
          Tableau de bord
        </Link>
        <button type="button" onClick={() => window.location.reload()} className="underline">
          Recharger
        </button>
      </div>
    </div>
  );
}
