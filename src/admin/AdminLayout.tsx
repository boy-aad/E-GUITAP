import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLoaderData, useLocation, useNavigate } from 'react-router';
import {
  Briefcase,
  Building2,
  ExternalLink,
  Image,
  Inbox,
  LandPlot,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '../components/brand/Logo';
import { TricolorBand } from '../components/brand/Skyline';
import { supabase } from '../lib/supabase';
import { LOGIN_PATH, requireStaff, type AdminSession } from './auth';

export async function loader({ request }: { request: Request }) {
  return requireStaff(request);
}

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean; soon?: boolean; adminOnly?: boolean };

const NAV: NavItem[] = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/demandes', label: 'Demandes', icon: Inbox },
  { to: '/admin/projets', label: 'Projets fonciers', icon: LandPlot },
  { to: '/admin/activites', label: 'Activités', icon: Briefcase, soon: true },
  { to: '/admin/entreprise', label: 'Entreprise et accueil', icon: Building2, soon: true },
  { to: '/admin/medias', label: 'Médias', icon: Image, soon: true },
  { to: '/admin/equipe', label: 'Équipe', icon: Users, soon: true, adminOnly: true },
];

export function Component() {
  const session = useLoaderData() as AdminSession;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Déconnexion (ici ou dans un autre onglet) : retour à l'écran de connexion.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate(LOGIN_PATH, { replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const items = NAV.filter((i) => !i.adminOnly || session.staff.role === 'admin');

  const nav = (
    <nav aria-label="Administration" className="space-y-1 p-3">
      {items.map(({ to, label, icon: Icon, end, soon }) =>
        soon ? (
          <span key={to} className="flex items-center gap-3 rounded px-3 py-2.5 text-sm text-white/40" title="Bientôt disponible">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
            <span className="ml-auto text-[10px] uppercase tracking-wider">bientôt</span>
          </span>
        ) : (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? 'bg-white/10 text-gold' : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ),
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper font-inter text-marine lg:flex">
      <meta name="robots" content="noindex, nofollow" />

      {/* Barre latérale (bureau) / tiroir (mobile) */}
      <aside
        className={`${menuOpen ? 'flex' : 'hidden'} fixed inset-0 z-40 flex-col bg-marine text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0`}
      >
        <TricolorBand className="h-1" />
        <div className="flex items-center justify-between px-5 py-5">
          <Logo variant="horizontal-compact" theme="dark" className="h-10" />
          <button type="button" className="rounded p-1.5 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="space-y-2 border-t border-marine-light p-4 text-xs">
          <p className="truncate font-semibold">{session.staff.full_name}</p>
          <p className="truncate text-white/60">
            {session.staff.role === 'admin' ? 'Administrateur' : 'Éditeur'}
            {session.email ? ` · ${session.email}` : ''}
          </p>
          <div className="flex gap-3 pt-1">
            <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white/80 hover:text-gold">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Voir le site
            </a>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-1 text-white/80 hover:text-gold"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Logo variant="horizontal-compact" className="h-9" />
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded p-2" aria-label="Ouvrir le menu">
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
          <Outlet context={session} />
        </main>
      </div>
    </div>
  );
}
