import { Link, useLoaderData, useSearchParams } from 'react-router';
import { ExternalLink, Plus } from 'lucide-react';
import { AVAILABILITY_LABELS } from '../format';
import { AdminPageHeader, Badge, DataTable, PublicationBadge, primaryButton, useFlashToast, type Column } from '../ui';
import { listLoader } from './categories/categoryData';

export const handle = { crumb: 'Catégories' };
export const loader = listLoader;

type Row = Awaited<ReturnType<typeof listLoader>>[number];

const columns: Column<Row>[] = [
  { key: 'ordre', header: 'Ordre', hideOnMobile: true, cell: (c) => <span className="text-slate-500">{c.sort_order}</span> },
  {
    key: 'titre',
    header: 'Catégorie',
    primary: true,
    cell: (c) => (
      <span>
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded bg-marine text-xs font-bold text-gold" aria-hidden="true">
          {c.letter}
        </span>
        {c.title}
      </span>
    ),
  },
  { key: 'court', header: 'Titre court', hideOnMobile: true, cell: (c) => <span className="text-slate-600">{c.short_title}</span> },
  {
    key: 'offres',
    header: 'Offres',
    cell: (c) => (
      <Link to="/admin/offres" className="text-sm text-slate-700 hover:underline">
        {c.publishedOffers} publiée{c.publishedOffers > 1 ? 's' : ''} / {c.offers}
      </Link>
    ),
  },
  {
    key: 'dispo',
    header: 'Disponibilité',
    hideOnMobile: true,
    cell: (c) => (c.availability === 'operationnelle' ? <span className="text-slate-600">{AVAILABILITY_LABELS[c.availability]}</span> : <Badge tone="warning">{AVAILABILITY_LABELS[c.availability]}</Badge>),
  },
  { key: 'publication', header: 'Publication', cell: (c) => <PublicationBadge value={c.publication} /> },
  {
    key: 'site',
    header: 'Site',
    hideOnMobile: true,
    cell: (c) =>
      c.publication === 'publie' ? (
        <a href={`/offres?categorie=${c.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex text-slate-500 hover:text-marine" aria-label={`Voir les offres « ${c.short_title} » sur le site (nouvel onglet)`}>
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : null,
  },
];

export function Component() {
  const categories = useLoaderData() as Row[];
  const [params] = useSearchParams();
  useFlashToast(Boolean(params.get('enregistre')), 'La catégorie a été enregistrée.');
  useFlashToast(Boolean(params.get('supprime')), 'La catégorie a été supprimée.');

  return (
    <>
      <title>Catégories | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Catégories"
        description="Les domaines d'activité, qui servent aussi de catégories au catalogue d'offres."
        actions={
          <Link to="/admin/categories/nouvelle" className={primaryButton}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nouvelle catégorie
          </Link>
        }
      />
      <DataTable caption="Catégories du catalogue" columns={columns} rows={categories} rowHref={(c) => `/admin/categories/${c.id}`} emptyTitle="Aucune catégorie" />
    </>
  );
}
