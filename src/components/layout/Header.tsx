import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ArrowUpRight, Menu, MessageSquare, Phone, X } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { TricolorBand } from '../brand/Skyline';
import { COMPANY, CONTACTS } from '../../content/company';
import { publicDomains } from '../../content/activities';
import { useInquiry } from '../../features/inquiry/InquiryContext';
import { telUrl, whatsappUrl } from '../../lib/contact';
import { NAV_ITEMS } from './navigation';

export function Header() {
  const { openInquiry } = useInquiry();
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 15);
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
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <TricolorBand className="relative z-50 h-[3.5px]" />
      <header
        className={`sticky top-0 z-40 w-full border-b border-ivory bg-white/95 backdrop-blur-md transition-all duration-300 ${
          isScrolled ? 'py-2.5 shadow-md' : 'py-3.5 sm:py-4'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 sm:gap-8 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="shrink-0 rounded py-0.5 focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="E-GUITAP — Accueil"
          >
            {/* Version sans signature : 160 px de large minimum (charte p. 11). */}
            <Logo variant="horizontal-compact" className="h-[54px] lg:h-[60px]" />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-6 font-inter text-sm font-semibold lg:flex xl:gap-8">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative whitespace-nowrap py-1.5 transition-colors ${
                    isActive ? 'text-marine' : 'text-slate-text hover:text-marine'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 h-[2.5px] w-full rounded-full bg-gold" aria-hidden="true" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => openInquiry()}
              className="hidden items-center gap-2 whitespace-nowrap rounded border border-marine bg-marine px-4 py-2.5 font-poppins text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:border-gold hover:bg-marine-dark sm:inline-flex lg:px-5"
            >
              Demande de renseignements
              <ArrowUpRight className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded p-2 text-marine hover:bg-ivory focus-visible:outline-2 focus-visible:outline-gold lg:hidden"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full z-50 flex h-[calc(100dvh-82px)] flex-col justify-between overflow-y-auto border-t border-slate-200 bg-white lg:hidden"
          >
            <nav aria-label="Navigation principale" className="space-y-1 p-4 sm:p-6">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-4 py-3.5 font-inter text-sm font-semibold transition-colors ${
                      isActive ? 'bg-marine text-white' : 'text-marine hover:bg-ivory'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-2 px-3 font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-text">
                  Nos domaines
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-marine">
                  {publicDomains().map((d) => (
                    <Link key={d.slug} to={`/activites#${d.slug}`} className="truncate rounded bg-ivory/70 p-2.5 hover:bg-ivory">
                      {d.letter}. {d.shortTitle}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            <div className="space-y-3 border-t border-slate-200 bg-paper p-4 sm:p-6">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openInquiry();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-marine px-4 py-3.5 font-poppins text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-marine-dark"
              >
                Demande de renseignements
                <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />
              </button>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-text">
                <a href={telUrl()} className="flex items-center gap-1.5 hover:text-marine">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {CONTACTS.phone.value}
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-semibold text-gn-green"
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
              <p className="text-center font-lora text-xs italic text-slate-text">{COMPANY.signatures.brand}</p>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
