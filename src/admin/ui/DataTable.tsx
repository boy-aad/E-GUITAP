import { useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { EmptyState, Skeleton, cardClass } from './basics';

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Tri serveur possible sur cette colonne (paramètre d'URL « tri »). */
  sortable?: boolean;
  /** Masquée sur petit écran (vue en cartes) ; seule la colonne `primary` reste en titre. */
  hideOnMobile?: boolean;
  /** Colonne titre de la carte en vue mobile. */
  primary?: boolean;
  className?: string;
};

export type BulkAction = { label: string; onRun: (ids: string[]) => void; danger?: boolean };

type DataTableProps<T extends { id: string }> = {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  /** Lien de chaque ligne (la cellule primaire devient cliquable). */
  rowHref?: (row: T) => string;
  /** Nombre total de lignes côté serveur (pagination). */
  total?: number;
  pageSize?: number;
  bulkActions?: BulkAction[];
  emptyTitle?: string;
  emptyText?: ReactNode;
  loading?: boolean;
};

/** Lecture des paramètres d'URL de tri et de page (à utiliser aussi dans le loader). */
export function tableParams(url: URL, defaults: { sort: string; pageSize?: number }) {
  const raw = url.searchParams.get('tri') ?? defaults.sort;
  const desc = raw.startsWith('-');
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const size = defaults.pageSize ?? 25;
  return { sortKey: desc ? raw.slice(1) : raw, ascending: !desc, page, from: (page - 1) * size, to: page * size - 1, size };
}

/**
 * Tableau de l'administration : tri et pagination côté serveur (paramètres d'URL « tri » et
 * « page », lus par le loader avec `.order()` et `.range()`), sélection multiple et actions
 * groupées, vue en cartes sur mobile, état vide et squelette de chargement.
 */
export function DataTable<T extends { id: string }>({
  caption,
  columns,
  rows,
  rowHref,
  total,
  pageSize = 25,
  bulkActions,
  emptyTitle = 'Aucun élément',
  emptyText,
  loading,
}: DataTableProps<T>) {
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const sortParam = params.get('tri') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pages = total !== undefined ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const selectable = Boolean(bulkActions?.length);
  const visibleIds = rows.map((r) => r.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const primary = columns.find((c) => c.primary) ?? columns[0];

  const setParam = (key: string, value: string | null) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null) next.delete(key);
      else next.set(key, value);
      if (key !== 'page') next.delete('page');
      return next;
    });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const primaryCell = (row: T) =>
    rowHref ? (
      <Link to={rowHref(row)} className="font-semibold text-marine hover:underline focus-visible:outline-2 focus-visible:outline-gold">
        {primary?.cell(row)}
      </Link>
    ) : (
      primary?.cell(row)
    );

  if (loading) {
    return (
      <div className={`${cardClass} space-y-3 p-5`} aria-busy="true" aria-label="Chargement">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cardClass}>
      {selectable && selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-ivory px-4 py-2.5 text-sm" role="region" aria-label="Actions groupées">
          <span className="font-semibold text-marine">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
          {bulkActions?.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                a.onRun([...selected]);
                setSelected(new Set());
              }}
              className={`rounded-md px-2.5 py-1 font-semibold ring-1 ring-inset ${a.danger ? 'text-red-700 ring-red-300 hover:bg-red-50' : 'bg-white text-marine ring-slate-300 hover:bg-slate-50'}`}
            >
              {a.label}
            </button>
          ))}
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-slate-600 underline">
            Tout désélectionner
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState title={emptyTitle}>{emptyText}</EmptyState>
      ) : (
        <>
          {/* Bureau : tableau. */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{caption}</caption>
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  {selectable && (
                    <th scope="col" className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Tout sélectionner sur cette page"
                        checked={allSelected}
                        onChange={() => setSelected(allSelected ? new Set() : new Set(visibleIds))}
                        className="h-4 w-4 accent-marine"
                      />
                    </th>
                  )}
                  {columns.map((c) => {
                    const active = sortParam.replace(/^-/, '') === c.key;
                    const desc = active && sortParam.startsWith('-');
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={active ? (desc ? 'descending' : 'ascending') : undefined}
                        className={`px-4 py-3 font-semibold ${c.className ?? ''}`}
                      >
                        {c.sortable ? (
                          <button
                            type="button"
                            onClick={() => setParam('tri', active && !desc ? `-${c.key}` : c.key)}
                            className="inline-flex items-center gap-1 uppercase hover:text-marine focus-visible:outline-2 focus-visible:outline-gold"
                          >
                            {c.header}
                            {active ? (
                              desc ? <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                            )}
                          </button>
                        ) : (
                          c.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className={selected.has(row.id) ? 'bg-ivory/60' : 'hover:bg-slate-50'}>
                    {selectable && (
                      <td className="px-4 py-3">
                        <input type="checkbox" aria-label="Sélectionner la ligne" checked={selected.has(row.id)} onChange={() => toggle(row.id)} className="h-4 w-4 accent-marine" />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className={`px-4 py-3 align-top ${c.className ?? ''}`}>
                        {c === primary ? primaryCell(row) : c.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile : cartes. */}
          <ul className="divide-y divide-slate-100 md:hidden" aria-label={caption}>
            {rows.map((row) => (
              <li key={row.id} className="flex gap-3 px-4 py-3">
                {selectable && (
                  <input type="checkbox" aria-label="Sélectionner" checked={selected.has(row.id)} onChange={() => toggle(row.id)} className="mt-1 h-4 w-4 accent-marine" />
                )}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div>{primaryCell(row)}</div>
                  <dl className="space-y-1 text-xs">
                    {columns
                      .filter((c) => c !== primary && !c.hideOnMobile)
                      .map((c) => (
                        <div key={c.key} className="flex gap-2">
                          <dt className="w-28 shrink-0 text-slate-500">{c.header}</dt>
                          <dd className="min-w-0 text-slate-800">{c.cell(row)}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {total !== undefined && pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
          <span className="text-slate-600">
            Page {page} sur {pages} · {total} élément{total > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setParam('page', String(page - 1))} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 font-semibold ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Précédente
            </button>
            <button type="button" disabled={page >= pages} onClick={() => setParam('page', String(page + 1))} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 font-semibold ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-40">
              Suivante <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
