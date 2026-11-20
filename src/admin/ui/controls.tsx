import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { cardClass } from './basics';

/** Onglets de filtre reliés à un paramètre d'URL (ex. statut d'une demande). */
export function FilterTabs({
  param,
  options,
  label,
}: {
  param: string;
  options: { value: string | null; label: string; count?: number }[];
  label: string;
}) {
  const [params] = useSearchParams();
  const current = params.get(param);
  const hrefFor = (value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(param);
    else next.set(param, value);
    next.delete('page');
    const qs = next.toString();
    return qs ? `?${qs}` : '.';
  };
  return (
    <nav aria-label={label} className="flex flex-wrap gap-1">
      {options.map((o) => {
        const active = current === o.value;
        return (
          <Link
            key={o.label}
            to={hrefFor(o.value)}
            aria-current={active ? 'page' : undefined}
            className={`press inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-gold ${
              active ? 'bg-marine text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {o.label}
            {o.count !== undefined && <span className={`rounded px-1.5 text-xs ${active ? 'bg-white/20' : 'bg-slate-200'}`}>{o.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/** Recherche reliée au paramètre d'URL « q » (validée après une courte pause de saisie). */
export function SearchField({ placeholder, label }: { placeholder: string; label: string }) {
  const [params, setParams] = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');

  useEffect(() => {
    const id = window.setTimeout(() => {
      if ((params.get('q') ?? '') === value.trim()) return;
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value.trim()) next.set('q', value.trim());
          else next.delete('q');
          next.delete('page');
          return next;
        },
        { replace: true },
      );
    }, 350);
    return () => window.clearTimeout(id);
  }, [value, params, setParams]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-marine focus:outline-none focus:ring-2 focus:ring-marine/20"
      />
    </div>
  );
}

/** Carte d'indicateur (tableau de bord). */
export function StatCard({
  icon,
  value,
  label,
  to,
  hint,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  to?: string;
  hint?: string;
}) {
  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-marine text-gold">{icon}</span>
      <span className="min-w-0">
        <span className="block font-poppins text-2xl font-bold tabular-nums text-marine">{value}</span>
        <span className="block text-sm text-slate-600">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
    </>
  );
  const cls = `${cardClass} flex items-center gap-4 p-5`;
  return to ? (
    <Link to={to} className={`${cls} press press-soft hover:border-gold focus-visible:outline-2 focus-visible:outline-gold`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
