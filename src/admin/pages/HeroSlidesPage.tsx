import { Link, useActionData, useLoaderData, useNavigation, useSearchParams, useSubmit } from 'react-router';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus } from 'lucide-react';
import { AdminPageHeader, Badge, EmptyState, Notice, cardClass, iconButton, primaryButton, useFlashToast, useResultToast } from '../ui';
import { listAction, listLoader, type SlideRow } from './content/heroData';
import type { ActionResult } from './content/shared';
import { slideImage } from './content/slideImage';

export const handle = { crumb: "Page d'accueil" };
export const loader = listLoader;
export const action = listAction;

export function Component() {
  const slides = useLoaderData() as SlideRow[];
  const result = useActionData() as ActionResult | undefined;
  const [params] = useSearchParams();
  const submit = useSubmit();
  const busy = useNavigation().state !== 'idle';
  useFlashToast(Boolean(params.get('enregistre')), 'La slide a été enregistrée.');
  useFlashToast(Boolean(params.get('supprime')), 'La slide a été supprimée.');
  useResultToast(result);

  const post = (fields: Record<string, string>) => submit(fields, { method: 'post' });
  const activeIds = slides.filter((s) => s.is_active).map((s) => s.id);

  return (
    <>
      <title>Page d'accueil | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Page d'accueil"
        description="Les slides du grand bandeau (hero), dans l'ordre de défilement. Seules les slides affichées sont visibles du public ; sans slide affichée, le site présente l'entreprise."
        actions={
          <Link to="/admin/accueil/nouvelle" className={primaryButton}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nouvelle slide
          </Link>
        }
      />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}

      {slides.length === 0 ? (
        <EmptyState title="Aucune slide">Créez une première slide : titre, sous-titre et boutons d'action du haut de l'accueil.</EmptyState>
      ) : (
        <ol className="space-y-3">
          {slides.map((s, i) => {
            const image = slideImage(s, activeIds.indexOf(s.id));
            const label = [s.title, s.title_highlight].filter(Boolean).join(' ');
            return (
              <li key={s.id} className={`${cardClass} flex flex-col gap-4 p-3 sm:flex-row sm:items-center`}>
                <div className="relative w-full shrink-0 overflow-hidden rounded-lg bg-marine-dark sm:w-48">
                  <img
                    src={image.src}
                    alt=""
                    loading="lazy"
                    className={`aspect-video w-full object-cover ${s.is_active ? '' : 'opacity-50 grayscale'}`}
                    style={{ objectPosition: `${s.focal_x * 100}% ${s.focal_y * 100}%` }}
                  />
                  {!s.background && <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">Photo par défaut</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Slide {i + 1}
                    {s.eyebrow ? ` · ${s.eyebrow}` : ''}
                  </p>
                  <p className="mt-1 font-poppins font-semibold text-marine">{label}</p>
                  {s.subtitle && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{s.subtitle}</p>}
                  <div className="mt-2">{s.is_active ? <Badge tone="success">Affichée</Badge> : <Badge>Masquée</Badge>}</div>
                </div>
                <div className="flex items-center gap-0.5 self-end sm:self-center">
                  <button type="button" disabled={i === 0 || busy} onClick={() => post({ intent: 'move', id: s.id, direction: 'up' })} className={iconButton} aria-label={`Monter « ${label} »`}>
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={i === slides.length - 1 || busy}
                    onClick={() => post({ intent: 'move', id: s.id, direction: 'down' })}
                    className={iconButton}
                    aria-label={`Descendre « ${label} »`}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => post({ intent: 'toggle', id: s.id, active: String(!s.is_active) })}
                    className={iconButton}
                    aria-label={s.is_active ? `Masquer « ${label} »` : `Afficher « ${label} »`}
                    title={s.is_active ? 'Masquer' : 'Afficher'}
                  >
                    {s.is_active ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                  <Link to={`/admin/accueil/${s.id}`} className={iconButton} aria-label={`Modifier « ${label} »`} title="Modifier">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
