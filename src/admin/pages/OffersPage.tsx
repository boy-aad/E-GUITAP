import { Link, useActionData, useLoaderData, useNavigation, useSearchParams, useSubmit } from 'react-router';
import { ArrowDown, ArrowUp, Copy, ExternalLink, Plus, Star } from 'lucide-react';
import { AVAILABILITY_LABELS } from '../format';
import { AdminPageHeader, Badge, DataTable, Notice, PublicationBadge, primaryButton, useFlashToast, useResultToast, type Column } from '../ui';
import { listAction, loadOffers, type ActionResult } from './offers/offerData';
import { adminOfferImage } from './offers/offerImage';

export const handle = { crumb: 'Offres' };
export const loader = loadOffers;
export const action = listAction;

type Row = Awaited<ReturnType<typeof loadOffers>>[number];

const iconButton =
  'rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-marine disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-gold';

/** Colonnes du tableau (définies hors du composant : les cellules ne sont pas des composants). */
function buildColumns(offers: Row[], busy: boolean, post: (fields: Record<string, string | string[]>) => void): Column<Row>[] {
  // Premier / dernier de sa catégorie : bouton de déplacement désactivé.
  const position = (row: Row) => {
    const same = offers.filter((o) => o.domain_id === row.domain_id);
    const i = same.findIndex((o) => o.id === row.id);
    return { first: i === 0, last: i === same.length - 1 };
  };

  return [
    {
      key: 'vignette',
      header: 'Image',
      hideOnMobile: true,
      cell: (o) => {
        const img = adminOfferImage(o);
        return <img src={img.src} alt="" width={64} height={48} loading="lazy" className="h-12 w-16 rounded-md bg-ivory object-cover" />;
      },
    },
    {
      key: 'titre',
      header: 'Offre',
      primary: true,
      cell: (o) => (
        <span className="inline-flex items-center gap-1.5">
          {o.title}
          {o.is_featured && <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" aria-label="Mise en avant" />}
        </span>
      ),
    },
    { key: 'categorie', header: 'Catégorie', cell: (o) => <span className="text-slate-600">{o.activity_domains?.short_title ?? '—'}</span> },
    {
      key: 'dispo',
      header: 'Disponibilité',
      hideOnMobile: true,
      cell: (o) => (o.availability === 'operationnelle' ? <span className="text-slate-600">{AVAILABILITY_LABELS[o.availability]}</span> : <Badge tone="warning">{AVAILABILITY_LABELS[o.availability]}</Badge>),
    },
    { key: 'publication', header: 'Publication', cell: (o) => <PublicationBadge value={o.publication} /> },
    {
      key: 'ordre',
      header: 'Ordre',
      hideOnMobile: true,
      cell: (o) => {
        const { first, last } = position(o);
        return (
          <span className="inline-flex items-center gap-0.5">
            <span className="w-7 text-right text-xs tabular-nums text-slate-500">{o.sort_order}</span>
            <button type="button" disabled={first || busy} onClick={() => post({ intent: 'move', id: o.id, direction: 'up' })} className={iconButton} aria-label={`Monter « ${o.title} »`}>
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" disabled={last || busy} onClick={() => post({ intent: 'move', id: o.id, direction: 'down' })} className={iconButton} aria-label={`Descendre « ${o.title} »`}>
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      hideOnMobile: true,
      cell: (o) => (
        <span className="inline-flex items-center gap-0.5">
          <button type="button" disabled={busy} onClick={() => post({ intent: 'duplicate', id: o.id })} className={iconButton} aria-label={`Dupliquer « ${o.title} »`} title="Dupliquer">
            <Copy className="h-4 w-4" aria-hidden="true" />
          </button>
          {o.publication === 'publie' && (
            <a href={`/offres/${o.slug}`} target="_blank" rel="noopener noreferrer" className={iconButton} aria-label={`Voir « ${o.title} » sur le site (nouvel onglet)`} title="Voir sur le site">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </span>
      ),
    },
  ] satisfies Column<Row>[];
}

export function Component() {
  const offers = useLoaderData() as Row[];
  const result = useActionData() as ActionResult | undefined;
  const [params] = useSearchParams();
  const submit = useSubmit();
  const busy = useNavigation().state !== 'idle';
  useFlashToast(Boolean(params.get('enregistre')), "L'offre a été enregistrée.");
  useFlashToast(Boolean(params.get('supprime')), "L'offre a été supprimée.");
  useResultToast(result);

  const post = (fields: Record<string, string | string[]>) => {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) for (const x of [v].flat()) form.append(k, x);
    submit(form, { method: 'post' });
  };

  const columns = buildColumns(offers, busy, post);

  return (
    <>
      <title>Offres | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Offres"
        description="Le catalogue du site (page « Nos offres »), par catégorie. Les flèches changent l'ordre d'affichage dans la catégorie."
        actions={
          <Link to="/admin/offres/nouvelle" className={primaryButton}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nouvelle offre
          </Link>
        }
      />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}
      <DataTable
        caption="Offres du catalogue"
        columns={columns}
        rows={offers}
        rowHref={(o) => `/admin/offres/${o.id}`}
        emptyTitle="Aucune offre"
        bulkActions={[
          { label: 'Publier', onRun: (ids) => post({ id: ids, publication: 'publie' }) },
          { label: 'Repasser en brouillon', onRun: (ids) => post({ id: ids, publication: 'brouillon' }) },
          { label: 'Archiver', onRun: (ids) => post({ id: ids, publication: 'archive' }) },
        ]}
      />
    </>
  );
}
