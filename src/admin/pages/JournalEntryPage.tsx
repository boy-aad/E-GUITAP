import { Link, useLoaderData } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { formatDateTime } from '../format';
import { AdminPageHeader, Badge, cardClass } from '../ui';
import { AuditDiff } from './journal/AuditDiff';
import { ACTION_LABELS, tableLabel } from './journal/auditLabels';
import { entryLoader, type EntryData } from './journal/journalData';

export const loader = entryLoader;
export const handle = { crumb: (data: unknown) => `Entrée n° ${(data as EntryData | undefined)?.entry.id ?? ''}` };

const ACTION_TONE = { INSERT: 'success', UPDATE: 'info', DELETE: 'danger' } as const;

export function Component() {
  const { entry, who, item } = useLoaderData() as EntryData;
  const title = `${ACTION_LABELS[entry.action] ?? entry.action} · ${tableLabel(entry.table_name)}`;

  return (
    <>
      <title>{`${title} | Journal | Administration E-GUITAP`}</title>
      <AdminPageHeader
        title={title}
        description={item ? `« ${item} »` : undefined}
        actions={
          <Link to=".." relative="path" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-gold-hover">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour au journal
          </Link>
        }
      />
      <dl className={`${cardClass} mb-5 grid gap-4 p-4 text-sm sm:grid-cols-4`}>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</dt>
          <dd className="mt-0.5 text-slate-800">{formatDateTime(entry.created_at)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Auteur</dt>
          <dd className="mt-0.5 text-slate-800">{who}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Action</dt>
          <dd className="mt-0.5">
            <Badge tone={ACTION_TONE[entry.action as keyof typeof ACTION_TONE] ?? 'neutral'}>{ACTION_LABELS[entry.action] ?? entry.action}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Identifiant de l'élément</dt>
          <dd className="mt-0.5 break-all font-mono text-xs text-slate-700">{entry.row_id ?? '—'}</dd>
        </div>
      </dl>
      <section className={cardClass} aria-labelledby="detail-titre">
        <h2 id="detail-titre" className="border-b border-slate-200 px-4 py-3 font-poppins text-base font-semibold text-marine">
          {entry.action === 'UPDATE' ? 'Champs modifiés' : entry.action === 'INSERT' ? 'Contenu créé' : 'Contenu supprimé'}
        </h2>
        <AuditDiff action={entry.action} oldData={entry.old_data} newData={entry.new_data} />
      </section>
    </>
  );
}
