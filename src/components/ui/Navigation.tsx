import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Search, X } from 'lucide-react';

export type Crumb = { label: string; to?: string };

/** Fil d'Ariane. Le dernier élément est la page courante. */
export function Breadcrumbs({ items, onDark }: { items: Crumb[]; onDark?: boolean }) {
  const muted = onDark ? 'text-white/70 hover:text-gold' : 'text-slate-text hover:text-marine';
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.to && !last ? (
                <Link to={item.to} className={`transition-colors ${muted}`}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={onDark ? 'text-white' : 'text-marine'}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className={`h-3.5 w-3.5 ${onDark ? 'text-gold' : 'text-slate-400'}`} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type ChipOption<T extends string> = { value: T; label: string; count?: number };

/** Groupe de puces de filtre (une seule active). */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  label,
  nowrap,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nom accessible du groupe. */
  label: string;
  /** Une seule ligne (à placer dans un conteneur qui défile). */
  nowrap?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className={`flex gap-2 ${nowrap ? 'w-max' : 'flex-wrap'}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`press inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
              active ? 'border-marine bg-marine text-white' : 'border-slate-200 bg-white text-marine hover:border-gold'
            }`}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={`rounded-full px-1.5 text-xs ${active ? 'bg-white/15 text-gold-light' : 'bg-slate-100 text-slate-text'}`}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Champ de recherche avec bouton d'effacement. */
export function SearchInput({
  value,
  onChange,
  label,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  /** Libellé accessible (masqué visuellement). */
  label: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-text" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-marine placeholder:text-slate-text/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-text transition-colors hover:text-marine active:bg-slate-200 hover:bg-slate-100 hover:text-marine focus-visible:outline-2 focus-visible:outline-gold"
          aria-label="Effacer la recherche"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/** Message d'absence de résultat ou de contenu. */
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      {icon && <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-marine">{icon}</span>}
      <h3 className="font-poppins text-lg font-bold text-marine">{title}</h3>
      {children && <div className="max-w-md text-sm leading-relaxed text-slate-text">{children}</div>}
      {action}
    </div>
  );
}
