import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { TricolorBand } from '../brand/Skyline';
import { Button } from '../ui/Button';
import { MobileMenu } from './MobileMenu';
import { NAV_ITEMS } from './navigation';

/** Au-delà de ce défilement (px), l'en-tête de l'accueil devient opaque. */
const SCROLL_THRESHOLD = 40;

export function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Le menu mobile se ferme à chaque changement de page.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = 'hidden';
    // Le focus clavier reste dans le menu : le reste de la page devient inerte.
    const behind = [...document.querySelectorAll<HTMLElement>('main, footer')];
    behind.forEach((el) => (el.inert = true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      behind.forEach((el) => (el.inert = false));
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Transparent au-dessus du hero de l'accueil, opaque partout ailleurs.
  const solid = !isHome || isScrolled || menuOpen;

  return (
    <div className={`${isHome ? 'fixed' : 'sticky'} inset-x-0 top-0 z-40`}>
      <TricolorBand className="relative h-[3.5px]" />
      <header
        className={`w-full transition-[background-color,box-shadow,padding,border-color] duration-500 ease-spring ${
          solid
            ? 'material-bar border-b border-ivory/70 shadow-[0_8px_30px_-12px_rgba(16,44,80,0.25)]'
            : 'border-b border-transparent bg-transparent'
        } ${isScrolled ? 'py-2' : 'py-3 sm:py-4'}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="shrink-0 rounded py-0.5 focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="E-GUITAP — Accueil"
          >
            {/* Version sans signature : 160 px de large minimum (charte p. 11). */}
            <Logo variant="horizontal-compact" theme={solid ? 'light' : 'dark'} className="h-[52px] lg:h-[58px]" />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-6 font-inter text-sm font-semibold lg:flex xl:gap-8">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `link-underline whitespace-nowrap py-1.5 transition-colors ${
                    solid
                      ? isActive
                        ? 'text-marine'
                        : 'text-slate-text hover:text-marine'
                      : isActive
                        ? 'text-white'
                        : 'text-white/80 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Enveloppe : `hidden` ne peut pas surcharger le `inline-flex` du bouton. */}
            <div className="hidden sm:block">
              {/* Mène au catalogue : chaque offre a son bouton « Demander un devis ». */}
              <Button size="sm" to="/offres" iconRight={<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}>
                Demander un devis
              </Button>
            </div>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`press rounded p-2 focus-visible:outline-2 focus-visible:outline-gold lg:hidden ${
                solid ? 'text-marine hover:bg-ivory' : 'text-white hover:bg-white/10'
              }`}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
