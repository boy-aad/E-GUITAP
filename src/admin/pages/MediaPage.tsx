import { useState } from 'react';
import { Link, useActionData, useLoaderData, useOutletContext, useRevalidator, useSearchParams } from 'react-router';
import { Grid3x3, List, Plus, X } from 'lucide-react';
import { publicMediaUrl } from '../../lib/media';
import type { AdminSession } from '../auth';
import { formatDate } from '../format';
import { MEDIA_KIND_LABELS, type MediaRow } from '../media/mediaQueries';
import { Uploader } from '../media/Uploader';
import { formatBytes } from '../media/upload';
import { AdminPageHeader, Badge, EmptyState, FilterTabs, Notice, SearchField, cardClass, primaryButton, secondaryButton, useResultToast } from '../ui';
import { MediaDetails } from './media/MediaDetails';
import { action, loader, type ActionResult, type MediaPageData } from './media/mediaPageData';

export { action, loader };
export const handle = { crumb: 'Médiathèque' };

/** Plus petite taille disponible (vignettes légères). */
function thumbUrl(m: MediaRow): string {
  const v = m.variants && typeof m.variants === 'object' ? (m.variants as Record<string, string>) : {};
  const smallest = Object.entries(v).sort(([a], [b]) => Number(a) - Number(b))[0]?.[1];
  return publicMediaUrl(smallest ?? m.path);
}

export function Component() {
  const { media, usages } = useLoaderData() as MediaPageData;
  const result = useActionData() as ActionResult | undefined;
  const session = useOutletContext<AdminSession>();
  const [params, setParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useResultToast(result);
  const list = params.get('vue') === 'liste';
  // Après une suppression, la fiche ouverte n'existe plus : le panneau se ferme de lui-même.
  const selected = media.find((m) => m.id === selectedId) ?? null;

  const setView = (v: 'grille' | 'liste') =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (v === 'liste') next.set('vue', 'liste');
      else next.delete('vue');
      return next;
    });

  return (
    <>
      <title>Médiathèque | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Médiathèque"
        description="Toutes les images du site. Chaque image est enregistrée en WebP, en deux tailles, avec un texte alternatif."
        actions={
          <button type="button" className={showUpload ? secondaryButton : primaryButton} onClick={() => setShowUpload((s) => !s)} aria-expanded={showUpload}>
            {showUpload ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            {showUpload ? 'Fermer' : 'Ajouter des images'}
          </button>
        }
      />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}

      {showUpload && (
        <section className={`${cardClass} mb-6 p-5`} aria-label="Ajouter des images">
          <Uploader onUploaded={() => void revalidator.revalidate()} />
        </section>
      )}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          param="type"
          label="Filtrer par type"
          options={[{ value: null, label: 'Tous' }, ...Object.entries(MEDIA_KIND_LABELS).map(([value, label]) => ({ value, label: label.split(' / ')[0]! }))]}
        />
        <div className="flex items-center gap-2">
          <SearchField label="Rechercher un média" placeholder="Texte alternatif ou crédit" />
          <div className="flex rounded-md border border-slate-300 bg-white p-0.5" role="group" aria-label="Affichage">
            <button type="button" aria-pressed={!list} onClick={() => setView('grille')} className={`rounded p-1.5 ${!list ? 'bg-marine text-white' : 'text-slate-600'}`} aria-label="Grille">
              <Grid3x3 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" aria-pressed={list} onClick={() => setView('liste')} className={`rounded p-1.5 ${list ? 'bg-marine text-white' : 'text-slate-600'}`} aria-label="Liste">
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {media.length === 0 ? (
        <div className={cardClass}>
          <EmptyState title={params.toString() ? 'Aucun média ne correspond' : 'La médiathèque est vide'}>
            {params.toString() ? (
              <Link to="/admin/medias" className="underline">
                Effacer les filtres
              </Link>
            ) : (
              'Ajoutez vos premières photos : elles seront converties et optimisées automatiquement.'
            )}
          </EmptyState>
        </div>
      ) : list ? (
        <ul className={`${cardClass} divide-y divide-slate-100`}>
          {media.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => setSelectedId(m.id)} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-gold">
                <img src={thumbUrl(m)} alt="" width={64} height={48} loading="lazy" className="h-12 w-16 shrink-0 rounded bg-slate-100 object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">{m.alt}</span>
                  <span className="block text-xs text-slate-500">
                    {MEDIA_KIND_LABELS[m.kind]} · {m.width && m.height ? `${m.width} × ${m.height}` : '—'} · {formatBytes(m.bytes)} · {formatDate(m.created_at)}
                  </span>
                </span>
                {(usages[m.id]?.length ?? 0) > 0 && <Badge tone="info">Utilisé ×{usages[m.id]!.length}</Badge>}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {media.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setSelectedId(m.id)}
                aria-label={`Ouvrir le média : ${m.alt}`}
                className={`${cardClass} group block w-full overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-gold`}
              >
                <img src={thumbUrl(m)} alt="" loading="lazy" className="aspect-[4/3] w-full bg-slate-100 object-cover transition group-hover:opacity-90" />
                <span className="block space-y-1 p-2.5">
                  <span className="block truncate text-xs font-semibold text-slate-800" title={m.alt}>
                    {m.alt}
                  </span>
                  <span className="flex items-center justify-between gap-1 text-[11px] text-slate-500">
                    {formatBytes(m.bytes)}
                    {(usages[m.id]?.length ?? 0) > 0 && <Badge tone="info">Utilisé</Badge>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <MediaDetails media={selected} usages={selected ? (usages[selected.id] ?? []) : []} isAdmin={session.staff.role === 'admin'} onClose={() => setSelectedId(null)} />
    </>
  );
}
