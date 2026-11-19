import { Link, useLocation } from 'react-router';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Logo } from '../../components/brand/Logo';
import { TricolorBand } from '../../components/brand/Skyline';
import { NAV_GROUPS, type NavItem } from './navigation';

export type ShellCounts = { newInquiries: number; newQuotes: number };

type SidebarProps = {
  isAdmin: boolean;
  counts: ShellCounts;
  /** Barre réduite aux icônes (bureau). */
  collapsed: boolean;
  onToggleCollapsed?: () => void;
};

/** Un lien de menu est actif si son chemin ET ses éventuels paramètres correspondent. */
function useIsActive() {
  const { pathname, search } = useLocation();
  return (item: NavItem) => {
    const [path, query] = item.to.split('?');
    const current = new URLSearchParams(search);
    if (query) {
      const wanted = new URLSearchParams(query);
      return pathname === path && [...wanted].every(([k, v]) => current.get(k) === v);
    }
    if (item.end) return pathname === path;
    // « Demandes » n'est pas actif quand le filtre « Devis » l'est.
    if (path === '/admin/demandes' && current.get('type') === 'demande_devis') return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };
}

/** Barre latérale marine : rubriques groupées, compteurs, mode réduit (icônes seules). */
export function Sidebar({ isAdmin, counts, collapsed, onToggleCollapsed }: SidebarProps) {
  const isActive = useIsActive();
  const groups = NAV_GROUPS.filter((g) => !g.adminOnly || isAdmin);

  return (
    <div className="flex h-full flex-col bg-marine text-white">
      <TricolorBand className="h-1" />
      <div className={`flex items-center py-4 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <Logo variant={collapsed ? 'symbol' : 'horizontal-compact'} theme="dark" className={collapsed ? 'h-10' : 'h-9'} />
      </div>

      <nav aria-label="Administration" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            {collapsed ? (
              <hr className="mx-2 mb-2 border-white/10" />
            ) : (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">{group.label}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const count = item.badge ? counts[item.badge] : 0;
                const inner = (
                  <>
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {count > 0 && (
                      <span
                        className={`rounded-full bg-gold px-1.5 text-[11px] font-bold leading-5 text-marine ${collapsed ? 'absolute right-1 top-1 min-w-5 text-center' : 'ml-auto'}`}
                      >
                        {count}
                      </span>
                    )}
                  </>
                );
                const base = `relative flex items-center gap-3 rounded-lg py-2 text-sm ${collapsed ? 'justify-center px-2' : 'px-3'}`;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      aria-current={isActive(item) ? 'page' : undefined}
                      className={`${base} font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-gold ${
                        isActive(item) ? 'bg-white/10 text-gold' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {inner}
                      {collapsed && <span className="sr-only">{item.label}</span>}
                      {count > 0 && <span className="sr-only"> ({count} nouvelle{count > 1 ? 's' : ''})</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {onToggleCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-xs font-semibold text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-gold"
          aria-label={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
        >
          {collapsed ? <ChevronsRight className="mx-auto h-4 w-4" aria-hidden="true" /> : <ChevronsLeft className="h-4 w-4" aria-hidden="true" />}
          {!collapsed && 'Réduire le menu'}
        </button>
      )}
    </div>
  );
}
