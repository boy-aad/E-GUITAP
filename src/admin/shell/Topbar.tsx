import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useMatches } from 'react-router';
import { ChevronDown, ChevronRight, ExternalLink, LogOut, Menu, Search, UserRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { AdminSession } from '../auth';
import { SECTION_LABELS } from './navigation';

/** Libellé de fil d'Ariane déclaré par une route : `export const handle = { crumb: … }`. */
export type CrumbHandle = { crumb?: string | ((data: unknown) => string) };

function Breadcrumbs() {
  const matches = useMatches();
  const { pathname } = useLocation();
  const crumbs = matches
    .map((m) => {
      const handle = m.handle as CrumbHandle | undefined;
      if (!handle?.crumb) return null;
      const label = typeof handle.crumb === 'function' ? handle.crumb(m.data) : handle.crumb;
      return { label, to: m.pathname };
    })
    .filter((c): c is { label: string; to: string } => c !== null);

  // Les fiches (ex. /admin/offres/:id) sont des routes sœurs de leur liste : on ajoute la rubrique.
  const section = pathname.split('/')[2];
  const sectionPath = `/admin/${section}`;
  if (section && SECTION_LABELS[section] && crumbs[0]?.to !== sectionPath && pathname !== sectionPath) {
    crumbs.unshift({ label: SECTION_LABELS[section], to: sectionPath });
  }

  return (
    <nav aria-label="Fil d'Ariane" className="min-w-0">
      <ol className="flex items-center gap-1.5 truncate text-sm">
        <li className="shrink-0">
          <Link to="/admin" className="text-slate-500 hover:text-marine">
            Administration
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.to} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              {last ? (
                <span aria-current="page" className="truncate font-semibold text-slate-800">
                  {c.label}
                </span>
              ) : (
                <Link to={c.to} className="truncate text-slate-500 hover:text-marine">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function UserMenu({ session }: { session: AdminSession }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const role = session.staff.role === 'admin' ? 'Administrateur' : 'Éditeur';
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-gold"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-marine text-gold">
          <UserRound className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="hidden text-left leading-tight md:block">
          <span className="block max-w-40 truncate font-semibold text-slate-800">{session.staff.full_name}</span>
          <span className="block text-xs text-slate-500">{role}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
        <span className="sr-only">Menu du compte</span>
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-lg">
          <div className="border-b border-slate-100 px-3 pb-2 pt-1">
            <p className="font-semibold text-slate-800">{session.staff.full_name}</p>
            <p className="text-xs text-slate-500">
              {role}
              {session.email ? ` · ${session.email}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-gold"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}

/** Barre supérieure : menu mobile, fil d'Ariane, recherche (Ctrl/⌘ + K), lien vers le site, compte. */
export function Topbar({ session, onOpenMenu, onOpenSearch }: { session: AdminSession; onOpenMenu: () => void; onOpenSearch: () => void }) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-10">
      <button type="button" onClick={onOpenMenu} className="rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden" aria-label="Ouvrir le menu">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="hidden min-w-0 flex-1 sm:block">
        <Breadcrumbs />
      </div>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-gold"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">Rechercher</span>
          <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 text-[11px] font-semibold md:inline">{isMac ? '⌘' : 'Ctrl'} K</kbd>
          <span className="sr-only md:hidden">Rechercher</span>
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> Voir le site
        </a>
        <UserMenu session={session} />
      </div>
    </header>
  );
}
