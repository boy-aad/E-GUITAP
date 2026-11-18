import { Link, useActionData, useLoaderData, useSearchParams, useSubmit } from 'react-router';
import { ExternalLink, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { COMMERCIAL_STATUS_LABELS, DEVELOPMENT_STATUS_LABELS, formatHectares } from '../../content/landProjects';
import type { Enums } from '../../types/database';
import { DOCUMENT_STATUS_LABELS, PUBLICATION_LABELS, friendlyDbError } from '../format';
import { AdminPageHeader, DataTable, Notice, PublicationBadge, primaryButton, useFlashToast, useResultToast, type Column } from '../ui';

export const handle = { crumb: 'Projets fonciers' };

export async function loader() {
  const { data, error } = await supabase
    .from('land_projects')
    .select('id, slug, name, prefecture, area_ha, publication, development_status, commercial_status, document_status, sort_order')
    .order('sort_order')
    .order('name');
  if (error) throw new Error(error.message);
  return data;
}

const BULK_TARGETS = ['publie', 'archive', 'brouillon'] as const satisfies readonly Enums<'publication_status'>[];

/** Actions groupées : changement du statut de publication de plusieurs projets. */
export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const ids = form.getAll('id').map(String);
  const publication = String(form.get('publication')) as Enums<'publication_status'>;
  if (!ids.length || !(BULK_TARGETS as readonly string[]).includes(publication)) return { ok: false, message: 'Action invalide.' };
  const { error } = await supabase.from('land_projects').update({ publication }).in('id', ids);
  if (error) return { ok: false, message: friendlyDbError(error) };
  return { ok: true, message: `${ids.length} projet${ids.length > 1 ? 's' : ''} : « ${PUBLICATION_LABELS[publication]} ».` };
}

type Row = Awaited<ReturnType<typeof loader>>[number];

const columns: Column<Row>[] = [
  { key: 'ordre', header: 'Ordre', hideOnMobile: true, cell: (p) => <span className="text-slate-500">{p.sort_order}</span> },
  {
    key: 'nom',
    header: 'Projet',
    primary: true,
    cell: (p) => (
      <span>
        {p.name}
        {p.prefecture && <span className="block text-xs font-normal text-slate-500">{p.prefecture}</span>}
      </span>
    ),
  },
  { key: 'surface', header: 'Superficie', cell: (p) => <span className="whitespace-nowrap">{formatHectares(Number(p.area_ha))}</span> },
  { key: 'avancement', header: 'Avancement', hideOnMobile: true, cell: (p) => (p.development_status ? DEVELOPMENT_STATUS_LABELS[p.development_status] : '—') },
  {
    key: 'commercialisation',
    header: 'Commercialisation',
    hideOnMobile: true,
    className: 'hidden xl:table-cell',
    cell: (p) => (p.commercial_status ? COMMERCIAL_STATUS_LABELS[p.commercial_status] : '—'),
  },
  { key: 'documents', header: 'Documents', hideOnMobile: true, cell: (p) => <span className="text-xs">{DOCUMENT_STATUS_LABELS[p.document_status]}</span> },
  { key: 'publication', header: 'Publication', cell: (p) => <PublicationBadge value={p.publication} /> },
  {
    key: 'site',
    header: 'Site',
    hideOnMobile: true,
    cell: (p) =>
      p.publication === 'publie' ? (
        <a href={`/projets/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex text-slate-500 hover:text-marine" aria-label={`Voir ${p.name} sur le site (nouvel onglet)`}>
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : null,
  },
];

export function Component() {
  const projects = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const result = useActionData() as { ok: boolean; message: string } | undefined;
  const [params] = useSearchParams();
  const submit = useSubmit();
  useFlashToast(Boolean(params.get('supprime')), 'Le projet a été supprimé.');
  useResultToast(result);

  const bulk = (publication: Enums<'publication_status'>) => (ids: string[]) => {
    const form = new FormData();
    ids.forEach((id) => form.append('id', id));
    form.set('publication', publication);
    submit(form, { method: 'post' });
  };

  return (
    <>
      <title>Projets fonciers | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Projets fonciers"
        description="Les projets publiés apparaissent sur le site, dans l'ordre indiqué."
        actions={
          <Link to="/admin/projets/nouveau" className={primaryButton}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nouveau projet
          </Link>
        }
      />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}
      <DataTable
        caption="Projets fonciers"
        columns={columns}
        rows={projects}
        rowHref={(p) => `/admin/projets/${p.id}`}
        emptyTitle="Aucun projet pour le moment"
        bulkActions={[
          { label: 'Publier', onRun: bulk('publie') },
          { label: 'Repasser en brouillon', onRun: bulk('brouillon') },
          { label: 'Archiver', onRun: bulk('archive') },
        ]}
      />
    </>
  );
}
