import { useState } from 'react';

// Graphiques maison (HTML + CSS, aucune dépendance), suivant les règles du skill dataviz :
// marques fines (≤ 24 px), extrémité arrondie de 4 px, écart de 2 px entre segments,
// grille d'un pixel discrète, légende pour ≥ 2 séries, texte jamais dans la couleur des
// données, info-bulle au survol / au focus et tableau de données pour les lecteurs d'écran.

/** Palette catégorielle validée (ordre fixe, jamais recyclé). */
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'] as const;

export type Series = { key: string; label: string; color: string };
export type StackedPoint = { label: string; detail: string; values: Record<string, number> };

/** Graduations « rondes » et entières de 0 au maximum (au moins 1). */
function niceTicks(max: number): number[] {
  const top = Math.max(1, max);
  const raw = top / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  // Comptages entiers : jamais de pas inférieur à 1 (sinon graduations en double après arrondi).
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw);
  const end = Math.max(step, Math.ceil(top / step) * step);
  return Array.from({ length: Math.round(end / step) + 1 }, (_, i) => Math.round(i * step));
}

/** Colonnes empilées (une colonne par période, un segment par série). */
export function StackedColumns({ series, points, height = 200, caption }: { series: Series[]; points: StackedPoint[]; height?: number; caption: string }) {
  const [active, setActive] = useState<number | null>(null);
  const totals = points.map((p) => series.reduce((sum, s) => sum + (p.values[s.key] ?? 0), 0));
  const ticks = niceTicks(Math.max(0, ...totals));
  const top = ticks[ticks.length - 1] ?? 1;

  return (
    <figure className="space-y-4">
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600" aria-hidden="true">
        {series.map((s) => (
          <li key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        {/* Axe vertical */}
        <div aria-hidden="true" className="relative w-6 shrink-0 text-right text-[11px] tabular-nums text-slate-500" style={{ height }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(t / top) * 100}%`, transform: 'translateY(50%)' }}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          {/* Grille */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0" style={{ height }}>
            {ticks.map((t) => (
              <span key={t} className="absolute inset-x-0 h-px bg-slate-200" style={{ bottom: `${(t / top) * 100}%` }} />
            ))}
          </div>
          {/* Colonnes */}
          <div className="relative flex items-end justify-between gap-1" style={{ height }}>
            {points.map((p, i) => {
              const parts = series.filter((s) => (p.values[s.key] ?? 0) > 0);
              return (
                <button
                  type="button"
                  key={p.label}
                  aria-label={`${p.detail} : ${totals[i]} au total, ${series.map((s) => `${s.label} ${p.values[s.key] ?? 0}`).join(', ')}`}
                  onClick={() => setActive(active === i ? null : i)}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="group relative flex h-full flex-1 cursor-default flex-col items-center justify-end rounded focus-visible:outline-2 focus-visible:outline-gold"
                >
                  {/* Zone de survol plus large que la marque. */}
                  <span className={`absolute inset-x-0 inset-y-0 rounded ${active === i ? 'bg-slate-100' : ''}`} />
                  <div className="relative flex w-full max-w-6 flex-col-reverse gap-[2px]" style={{ height: `${(totals[i]! / top) * 100}%` }}>
                    {parts.map((s, j) => (
                      <span
                        key={s.key}
                        className={j === parts.length - 1 ? 'rounded-t' : ''}
                        style={{ background: s.color, flexGrow: p.values[s.key] ?? 0, flexBasis: 0, minHeight: 2 }}
                      />
                    ))}
                  </div>
                  {active === i && (
                    <div
                      aria-hidden="true"
                      // Dans la zone du graphique, du côté opposé au bord le plus proche (jamais rogné).
                      className={`pointer-events-none absolute top-0 z-10 w-44 rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs shadow-lg ${
                        i >= points.length / 2 ? 'right-full mr-2' : 'left-full ml-2'
                      }`}
                    >
                      <p className="mb-1 font-semibold text-slate-800">{p.detail}</p>
                      {series.map((s) => (
                        <p key={s.key} className="flex items-center justify-between gap-2 text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                            {s.label}
                          </span>
                          <span className="font-semibold tabular-nums text-slate-800">{p.values[s.key] ?? 0}</span>
                        </p>
                      ))}
                      <p className="mt-1 flex justify-between border-t border-slate-100 pt-1 font-semibold text-slate-800">
                        Total <span className="tabular-nums">{totals[i]}</span>
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {/* Axe horizontal : une étiquette sur deux pour éviter les chevauchements. */}
          <div aria-hidden="true" className="mt-2 flex justify-between gap-1 text-[11px] text-slate-500">
            {points.map((p, i) => (
              <span key={p.label} className="flex-1 text-center">
                {i % 2 === points.length % 2 ? p.label : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Vue tableau (lecteurs d'écran) : toutes les valeurs. Enveloppé dans un bloc masqué :
          un <table> ne se réduit pas à 1 px et élargirait la page sur mobile. */}
      <div className="sr-only">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Période</th>
              {series.map((s) => (
                <th key={s.key} scope="col">
                  {s.label}
                </th>
              ))}
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={p.label}>
                <th scope="row">{p.detail}</th>
                {series.map((s) => (
                  <td key={s.key}>{p.values[s.key] ?? 0}</td>
                ))}
                <td>{totals[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Barres horizontales (une seule série) : libellé, barre, valeur au bout. */
export function BarList({ items, color = SERIES_COLORS[0], caption }: { items: { label: string; value: number }[]; color?: string; caption: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <figure>
      <ul className="space-y-3" aria-label={caption}>
        {items.map((item) => (
          <li key={item.label} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 text-sm">
            <span className="truncate text-slate-700" title={item.label}>
              {item.label}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 max-w-full rounded-r" style={{ width: `${(item.value / max) * 85}%`, minWidth: 4, background: color }} aria-hidden="true" />
              <span className="text-xs font-semibold tabular-nums text-slate-800">{item.value}</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
