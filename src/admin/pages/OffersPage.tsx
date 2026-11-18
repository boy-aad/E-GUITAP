import { useActionData, useLoaderData, useSearchParams, useSubmit } from 'react-router';
import { ExternalLink, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Enums } from '../../types/database';
import { AVAILABILITY_LABELS, PUBLICATION_LABELS, friendlyDbError } from '../format';
import { AdminPageHeader, Badge, DataTable, Notice, PublicationBadge, useFlashToast, useResultToast, type Column } from '../ui';

export const handle = { crumb: 'Offres' };

export async function loader() {
  const { data, error } = await supabase
    .from('activity_services')
    .select('id, slug, title, summary, availability, publication, is_featured, sort_order, activity_domains (title, short_title, sort_order)')
    .order('sort_order');
  if (error) throw new Error(error.message);
  // Par catégorie (ordre des domaines), puis ordre de l'offre.
  return [...data].sort(
    (a, b) => (a.activity_domains?.sort_order ?? 0) - (b.activity_domains?.sort_order ?? 0) || a.sort_order - b.sort_order,
  );
}

const BULK_TARGETS = ['publie', 'archive', 'brouillon'] as const satisfies readonly Enums<'publication_status'>[];

/** Actions groupées : changement du statut de publication de plusieurs offres. */
export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const ids = form.getAll('id').map(String);
  const publication = String(form.get('publication')) as Enums<'publication_status'>;
  if (!ids.length || !(BULK_TARGETS as readonly string[]).includes(publication)) return { ok: false, message: 'Action invalide.' };
  const { error } = await supabase.from('activity_services').update({ publication }).in('id', ids);
  if (error) return { ok: false, message: friendlyDbError(error) };
  return { ok: true, message: `${ids.length} offre${ids.length > 1 ? 's' : ''} : « ${PUBLICATION_LABELS[publication]} ».` };
}

type Row = Awaited<ReturnType<typeof loader>>[number];

const columns: Column<Row>[] = [
  {
    key: 'titre',
    header: 'Offre',
    primary: true,
    cell: (o) => (
      <span className="inline-flex items-center gap-1.5">
        {o.title}
        {o.is_featured && <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-label="Mise en avant" />}
      </span>
    ),
  },
  { key: 'categorie', header: 'Catégorie', cell: (o) => <span className="text-slate-600">{o.activity_domains?.short_title ?? '—'}</span> },
  {
    key: 'resume',
    header: 'Résumé',
    hideOnMobile: true,
    className: 'hidden max-w-sm xl:table-cell',
    cell: (o) => (o.summary ? <span className="line-clamp-2 text-slate-600">{o.summary}</span> : <Badge tone="warning">À compléter</Badge>),
  },
  { key: 'dispo', header: 'Disponibilité', hideOnMobile: true, cell: (o) => <span className="text-slate-600">{AVAILABILITY_LABELS[o.availability]}</span> },
  { key: 'publication', header: 'Publication', cell: (o) => <PublicationBadge value={o.publication} /> },
  {
    key: 'site',
    header: 'Site',
    hideOnMobile: true,
    cell: (o) =>
      o.publication === 'publie' ? (
        <a
          href={`/offres/${o.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-slate-500 hover:text-marine"
          aria-label={`Voir « ${o.title} » sur le site (nouvel onglet)`}
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : null,
  },
];

export function Component() {
  const offers = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const result = useActionData() as { ok: boolean; message: string } | undefined;
  const [params] = useSearchParams();
  const submit = useSubmit();
  useFlashToast(Boolean(params.get('enregistre')), "L'offre a été enregistrée.");
  useResultToast(result);

  const bulk = (publication: Enums<'publication_status'>) => (ids: string[]) => {
    const form = new FormData();
    ids.forEach((id) => form.append('id', id));
    form.set('publication', publication);
    submit(form, { method: 'post' });
  };

  return (
    <>
      <title>Offres | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Offres"
        description="Le catalogue du site (page « Nos offres »). Cochez plusieurs offres pour les publier ou les archiver d'un coup."
      />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}
      <DataTable
        caption="Offres du catalogue"
        columns={columns}
        rows={offers}
        rowHref={(o) => `/admin/offres/${o.id}`}
        emptyTitle="Aucune offre"
        bulkActions={[
          { label: 'Publier', onRun: bulk('publie') },
          { label: 'Repasser en brouillon', onRun: bulk('brouillon') },
          { label: 'Archiver', onRun: bulk('archive') },
        ]}
      />
    </>
  );
}
