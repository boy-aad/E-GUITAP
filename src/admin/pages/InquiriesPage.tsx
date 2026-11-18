import { useState } from 'react';
import { useLoaderData, useSearchParams } from 'react-router';
import { Download, Loader2, MailWarning } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { INQUIRY_STATUS_LABELS, INQUIRY_TYPE_LABELS, formatDateTime } from '../format';
import {
  AdminPageHeader,
  Badge,
  DataTable,
  FilterTabs,
  InquiryStatusBadge,
  SearchField,
  secondaryButton,
  tableParams,
  useFlashToast,
  useToast,
  type Column,
} from '../ui';
import { downloadCsv, inquiriesToCsv } from './inquiries/exportCsv';
import { PERIODS, SORTABLE, STATUSES, TYPES, inquiryQuery, inquiryTopic, loadStaffNames, readFilters, type InquiryRow } from './inquiries/inquiryQuery';

export const handle = { crumb: 'Demandes' };

const PAGE_SIZE = 25;

const sortOf = (url: URL) => {
  const { sortKey, ascending, from, to } = tableParams(url, { sort: '-date', pageSize: PAGE_SIZE });
  return { sort: { column: SORTABLE[sortKey as keyof typeof SORTABLE] ?? 'created_at', ascending }, range: { from, to } };
};

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const { sort, range } = sortOf(url);
  const [result, staff, domains] = await Promise.all([
    inquiryQuery(readFilters(url.searchParams), sort, range),
    loadStaffNames(),
    supabase.from('activity_domains').select('id, short_title').order('sort_order'),
  ]);
  if (result.error) throw new Error(result.error.message);
  return { rows: result.data, total: result.count ?? 0, staff, domains: domains.data ?? [] };
}

function columns(staff: Map<string, string>): Column<InquiryRow>[] {
  return [
    { key: 'contact', header: 'Contact', sortable: true, primary: true, cell: (i) => i.full_name },
    {
      key: 'telephone',
      header: 'Téléphone',
      cell: (i) => (
        <span className="text-slate-600">
          {i.phone}
          {i.organization ? <span className="block text-xs">{i.organization}</span> : null}
        </span>
      ),
    },
    { key: 'type', header: 'Type', cell: (i) => <Badge tone={i.type === 'demande_devis' ? 'info' : 'neutral'}>{INQUIRY_TYPE_LABELS[i.type]}</Badge> },
    { key: 'objet', header: 'Objet', hideOnMobile: true, className: 'max-w-xs', cell: (i) => <span className="line-clamp-2">{inquiryTopic(i)}</span> },
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
    {
      key: 'assignation',
      header: 'Assignée à',
      hideOnMobile: true,
      cell: (i) => (i.assigned_to ? <span className="text-slate-700">{staff.get(i.assigned_to) ?? 'Membre de l’équipe'}</span> : <span className="text-slate-400">—</span>),
    },
    { key: 'date', header: 'Reçue le', sortable: true, cell: (i) => <span className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(i.created_at)}</span> },
  ];
}

/** Liste déroulante reliée à un paramètre d'URL. */
function ParamSelect({ param, label, options }: { param: string; label: string; options: { value: string; label: string }[] }) {
  const [params, setParams] = useSearchParams();
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
      {label}
      <select
        value={params.get(param) ?? ''}
        onChange={(e) =>
          setParams((prev) => {
            const next = new URLSearchParams(prev);
            if (e.target.value) next.set(param, e.target.value);
            else next.delete(param);
            next.delete('page');
            return next;
          })
        }
        className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm font-normal text-slate-800 focus:border-marine focus:outline-none focus:ring-2 focus:ring-marine/20"
      >
        <option value="">Tous</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Component() {
  const { rows, total, staff, domains } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [params] = useSearchParams();
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const quotes = params.get('type') === 'demande_devis';
  useFlashToast(Boolean(params.get('supprime')), 'La demande a été supprimée.');

  // Export de toute la vue filtrée (pas seulement la page affichée).
  const onExport = async () => {
    setExporting(true);
    try {
      const { sort } = sortOf(new URL(window.location.href));
      const { data, error } = await inquiryQuery(readFilters(params), sort);
      if (error) throw new Error(error.message);
      downloadCsv(inquiriesToCsv(data ?? [], staff), `demandes-e-guitap-${new Date().toISOString().slice(0, 10)}.csv`);
      toast('success', `${data?.length ?? 0} demande${(data?.length ?? 0) > 1 ? 's' : ''} exportée${(data?.length ?? 0) > 1 ? 's' : ''}.`);
    } catch (e) {
      toast('error', `Export impossible : ${e instanceof Error ? e.message : 'erreur inconnue'}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <title>{`${quotes ? 'Devis' : 'Demandes'} | Administration E-GUITAP`}</title>
      <AdminPageHeader
        title={quotes ? 'Demandes de devis' : 'Demandes'}
        description={quotes ? 'Demandes envoyées depuis le bouton « Demander un devis » des offres.' : 'Toutes les demandes envoyées depuis le formulaire du site.'}
        actions={
          <button type="button" onClick={onExport} disabled={exporting || total === 0} className={secondaryButton}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
            Exporter (CSV)
          </button>
        }
      />

      <div className="mb-4 space-y-3">
        <FilterTabs
          param="statut"
          label="Filtrer par statut"
          options={[{ value: null, label: 'En cours et traitées' }, ...STATUSES.map((s) => ({ value: s, label: INQUIRY_STATUS_LABELS[s] }))]}
        />
        <div className="flex flex-wrap items-end gap-3">
          <ParamSelect param="type" label="Type" options={TYPES.map((t) => ({ value: t, label: INQUIRY_TYPE_LABELS[t] }))} />
          <ParamSelect param="categorie" label="Catégorie" options={domains.map((d) => ({ value: d.id, label: d.short_title }))} />
          <ParamSelect param="periode" label="Période" options={Object.entries(PERIODS).map(([value, label]) => ({ value, label }))} />
          <div className="ml-auto w-full sm:w-auto">
            <SearchField label="Rechercher une demande" placeholder="Nom, téléphone ou e-mail" />
          </div>
        </div>
      </div>

      <DataTable
        caption={quotes ? 'Demandes de devis' : 'Demandes'}
        columns={columns(staff)}
        rows={rows}
        rowHref={(i) => `/admin/demandes/${i.id}`}
        total={total}
        pageSize={PAGE_SIZE}
        emptyTitle="Aucune demande"
        emptyText={params.toString() ? 'Aucune demande ne correspond à ces filtres.' : 'Aucune demande pour le moment.'}
      />
    </>
  );
}
