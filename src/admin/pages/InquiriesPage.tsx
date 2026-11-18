import { useLoaderData, useSearchParams } from 'react-router';
import { MailWarning } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Enums } from '../../types/database';
import { INQUIRY_STATUS_LABELS, INQUIRY_TYPE_LABELS, formatDateTime } from '../format';
import { AdminPageHeader, DataTable, FilterTabs, InquiryStatusBadge, SearchField, tableParams, useFlashToast, type Column } from '../ui';

export const handle = { crumb: 'Demandes' };

const STATUSES = ['nouveau', 'en_cours', 'traite', 'archive'] as const satisfies readonly Enums<'inquiry_status'>[];
const TYPES = ['contact', 'renseignement_activite', 'renseignement_projet', 'demande_devis'] as const satisfies readonly Enums<'inquiry_type'>[];
const SORTABLE = { date: 'created_at', contact: 'full_name', statut: 'status' } as const;
const PAGE_SIZE = 25;

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const statut = url.searchParams.get('statut');
  const type = url.searchParams.get('type');
  // Caractères réservés de la syntaxe des filtres PostgREST retirés de la recherche.
  const q = (url.searchParams.get('q') ?? '').replace(/[%,()*\\]/g, ' ').trim();
  const { sortKey, ascending, from, to } = tableParams(url, { sort: '-date', pageSize: PAGE_SIZE });
  const column = SORTABLE[sortKey as keyof typeof SORTABLE] ?? 'created_at';

  let query = supabase
    .from('inquiries')
    .select('id, created_at, type, full_name, organization, phone, subject, status, notified_at', { count: 'exact' })
    .order(column, { ascending })
    .range(from, to);
  if (statut && (STATUSES as readonly string[]).includes(statut)) query = query.eq('status', statut as Enums<'inquiry_status'>);
  else query = query.neq('status', 'archive'); // Par défaut : tout sauf les archives.
  if (type && (TYPES as readonly string[]).includes(type)) query = query.eq('type', type as Enums<'inquiry_type'>);
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { rows: data, total: count ?? 0 };
}

type Row = Awaited<ReturnType<typeof loader>>['rows'][number];

const columns: Column<Row>[] = [
  {
    key: 'contact',
    header: 'Contact',
    sortable: true,
    primary: true,
    cell: (i) => i.full_name,
  },
  {
    key: 'coordonnees',
    header: 'Téléphone',
    cell: (i) => (
      <span className="text-slate-600">
        {i.phone}
        {i.organization ? ` · ${i.organization}` : ''}
      </span>
    ),
  },
  {
    key: 'sujet',
    header: 'Sujet',
    hideOnMobile: true,
    cell: (i) => (
      <span>
        <span className="block">{i.subject}</span>
        <span className="text-xs text-slate-500">{INQUIRY_TYPE_LABELS[i.type]}</span>
      </span>
    ),
  },
  {
    key: 'statut',
    header: 'Statut',
    sortable: true,
    cell: (i) => (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <InquiryStatusBadge value={i.status} />
        {!i.notified_at && (
          <span title="Notification e-mail non envoyée" className="text-amber-700">
            <MailWarning className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Notification e-mail non envoyée</span>
          </span>
        )}
      </span>
    ),
  },
  { key: 'date', header: 'Reçue le', sortable: true, cell: (i) => <span className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(i.created_at)}</span> },
];

export function Component() {
  const { rows, total } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [params] = useSearchParams();
  const quotes = params.get('type') === 'demande_devis';
  useFlashToast(Boolean(params.get('supprime')), 'La demande a été supprimée.');

  return (
    <>
      <title>{`${quotes ? 'Devis' : 'Demandes'} | Administration E-GUITAP`}</title>
      <AdminPageHeader
        title={quotes ? 'Demandes de devis' : 'Demandes'}
        description={quotes ? 'Demandes envoyées depuis le bouton « Demander un devis » des offres.' : 'Toutes les demandes envoyées depuis le formulaire du site.'}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          param="statut"
          label="Filtrer par statut"
          options={[{ value: null, label: 'En cours et traitées' }, ...STATUSES.map((s) => ({ value: s, label: INQUIRY_STATUS_LABELS[s] }))]}
        />
        <SearchField label="Rechercher une demande" placeholder="Nom, téléphone ou e-mail" />
      </div>

      <DataTable
        caption={quotes ? 'Demandes de devis' : 'Demandes'}
        columns={columns}
        rows={rows}
        rowHref={(i) => `/admin/demandes/${i.id}`}
        total={total}
        pageSize={PAGE_SIZE}
        emptyTitle="Aucune demande"
        emptyText={params.get('q') ? 'Aucune demande ne correspond à cette recherche.' : 'Aucune demande dans cette catégorie.'}
      />
    </>
  );
}
