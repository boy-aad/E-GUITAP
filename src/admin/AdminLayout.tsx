import { useEffect, useRef, useState } from 'react';
import { Outlet, useLoaderData, useLocation, useNavigate } from 'react-router';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LOGIN_PATH, requireStaff, type AdminSession } from './auth';
import { CommandPalette } from './shell/CommandPalette';
import { Sidebar, type ShellCounts } from './shell/Sidebar';
import { Topbar } from './shell/Topbar';
import { ConfirmProvider, ToastProvider } from './ui';

export async function loader({ request }: { request: Request }) {
  const session = await requireStaff(request);
  // Compteurs du menu (rechargés après chaque action : un changement de statut les met à jour).
  const [inquiries, quotes] = await Promise.all([
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'nouveau'),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'nouveau').eq('type', 'demande_devis'),
  ]);
  const counts: ShellCounts = { newInquiries: inquiries.count ?? 0, newQuotes: quotes.count ?? 0 };
  return { session, counts };
}

const COLLAPSED_KEY = 'eguitap-admin-menu-reduit';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(COLLAPSED_KEY, value ? '1' : '0');
  } catch {
    // Stockage indisponible (navigation privée…) : la préférence n'est simplement pas mémorisée.
  }
}

export function Component() {
  const { session, counts } = useLoaderData() as { session: AdminSession; counts: ShellCounts };
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const isAdmin = session.staff.role === 'admin';

  // Déconnexion (ici ou dans un autre onglet) : retour à l'écran de connexion.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate(LOGIN_PATH, { replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  // Le tiroir mobile se ferme à chaque navigation.
  const [lastLocation, setLastLocation] = useState(pathname + search);
  if (pathname + search !== lastLocation) {
    setLastLocation(pathname + search);
    setMenuOpen(false);
  }

  useEffect(() => {
    const dialog = drawerRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    else if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  // Ctrl/⌘ + K : recherche globale.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-slate-50 font-inter text-[14px] text-slate-800 lg:flex">
          <meta name="robots" content="noindex, nofollow" />
          <a href="#contenu-admin" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded focus:bg-marine focus:px-4 focus:py-2 focus:text-white">
            Aller au contenu
          </a>

          {/* Bureau : barre latérale fixe, repliable. */}
          <aside className={`sticky top-0 hidden h-screen shrink-0 transition-[width] duration-200 lg:block ${collapsed ? 'w-[72px]' : 'w-64'}`}>
            <Sidebar
              isAdmin={isAdmin}
              counts={counts}
              collapsed={collapsed}
              onToggleCollapsed={() => {
                setCollapsed((c) => {
                  writeCollapsed(!c);
                  return !c;
                });
              }}
            />
          </aside>

          {/* Mobile : tiroir modal (focus piégé, Échap pour fermer). */}
          {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- clic sur le fond ; Échap ferme au clavier. */}
          <dialog
            ref={drawerRef}
            aria-label="Menu de l'administration"
            onClose={() => setMenuOpen(false)}
            onClick={(e) => e.target === e.currentTarget && setMenuOpen(false)}
            className="m-0 h-full max-h-none w-72 max-w-[85vw] p-0 backdrop:bg-slate-900/50 lg:hidden"
          >
            <div className="relative h-full">
              <Sidebar isAdmin={isAdmin} counts={counts} collapsed={false} />
              <button type="button" onClick={() => setMenuOpen(false)} className="absolute right-3 top-4 rounded-md p-1.5 text-white/80 hover:bg-white/10" aria-label="Fermer le menu">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </dialog>

          <div className="min-w-0 flex-1">
            <Topbar session={session} onOpenMenu={() => setMenuOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
            <main id="contenu-admin" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
              <Outlet context={session} />
            </main>
          </div>

          <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
