import { Form, Link, useLoaderData, useNavigation } from 'react-router';
import { Filter } from 'lucide-react';
import { Field, Input, Select } from '../../components/ui/Field';
import { formatDateTime } from '../format';
import { AdminPageHeader, Badge, DataTable, cardClass, ghostButton, secondaryButton, type Column } from '../ui';
import { ACTION_LABELS, AUDIT_TABLES, tableLabel } from './journal/auditLabels';
import { PAGE_SIZE, listLoader, type JournalData, type JournalRow } from './journal/journalData';

export const loader = listLoader;
export const handle = { crumb: "Journal d'activité" };

const ACTION_TONE = { INSERT: 'success', UPDATE: 'info', DELETE: 'danger' } as const;

const columns: Column<JournalRow>[] = [
  {
    key: 'element',
    header: 'Élément',
    primary: true,
    cell: (r) => (
      <>
        {tableLabel(r.table)}
        {r.item && <span className="font-normal text-slate-600"> · {r.item}</span>}
      </>
    ),
  },
  { key: 'action', header: 'Action', cell: (r) => <Badge tone={ACTION_TONE[r.action as keyof typeof ACTION_TONE] ?? 'neutral'}>{ACTION_LABELS[r.action] ?? r.action}</Badge> },
  { key: 'auteur', header: 'Auteur', cell: (r) => r.who },
  { key: 'date', header: 'Date', sortable: true, cell: (r) => <span className="whitespace-nowrap">{formatDateTime(r.at)}</span> },
];

export function Component() {
  const { rows, total, filters, staff } = useLoaderData() as JournalData;
  const navigation = useNavigation();
  const filtered = Boolean(filters.table || filters.actor || filters.since || filters.until);

  return (
    <>
      <title>Journal d'activité | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Journal d'activité"
        description="Créations, modifications et suppressions faites par les membres de l'équipe. Ouvrez une ligne pour voir le détail avant / après."
      />

      {/* Filtres dans l'adresse : la page filtrée peut être partagée ou rechargée. */}
      <Form method="get" className={`${cardClass} mb-5 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end`}>
        <Field label="Rubrique">
          <Select name="rubrique" defaultValue={filters.table}>
            <option value="">Toutes</option>
            {Object.entries(AUDIT_TABLES)
              .sort(([, a], [, b]) => a.label.localeCompare(b.label, 'fr'))
              .map(([t, { label }]) => (
                <option key={t} value={t}>
                  {label}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="Auteur">
          <Select name="auteur" defaultValue={filters.actor}>
            <option value="">Tous</option>
            {staff.map((s) => (
              <option key={s.user_id} value={s.user_id}>
                {s.full_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Du">
          <Input name="du" type="date" defaultValue={filters.since} />
        </Field>
        <Field label="Au">
          <Input name="au" type="date" defaultValue={filters.until} />
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={secondaryButton}>
            <Filter className="h-4 w-4" aria-hidden="true" /> Filtrer
          </button>
          {filtered && (
            <Link to="/admin/journal" className={ghostButton}>
              Effacer
            </Link>
          )}
        </div>
      </Form>

      <p className="mb-3 text-sm text-slate-600" aria-live="polite">
        {total} entrée{total > 1 ? 's' : ''}
        {filtered ? ' correspondant aux filtres' : ''}
      </p>
      <DataTable
        caption="Journal d'activité"
        columns={columns}
        rows={rows}
        rowHref={(r) => `/admin/journal/${r.id}`}
        total={total}
        pageSize={PAGE_SIZE}
        loading={navigation.state === 'loading' && navigation.location.pathname === '/admin/journal'}
        emptyTitle={filtered ? 'Aucune entrée ne correspond' : 'Journal vide'}
        emptyText={filtered ? 'Élargissez la période ou retirez un filtre.' : undefined}
      />
    </>
  );
}
