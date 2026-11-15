import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Menu, X, ArrowUpRight, Phone, MessageSquare } from 'lucide-react';
import { COMPANY_DATA } from '../data/company';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenQuoteModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenQuoteModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Accueil', route: 'home' },
    { label: 'À propos', route: 'about' },
    { label: 'Nos activités', route: 'activities' },
    { label: 'Catalogue', route: 'catalogue' },
    { label: 'Réalisations', route: 'projects' },
    { label: 'Contact', route: 'contact' },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Lisière Tricolore Nationale Guinéenne (Charte p. 15 : 0.5% à 2% format) */}
      <div className="w-full h-[3.5px] flex shrink-0 z-50 relative" aria-hidden="true">
        <div className="flex-1 bg-gn-red" />
        <div className="flex-1 bg-gn-yellow" />
        <div className="flex-1 bg-gn-green" />
      </div>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-ivory ${
          isScrolled ? 'shadow-md py-2.5' : 'py-3.5 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 sm:gap-8">
            {/* Zone 1: Logo Officiel E.GUITAP Exact SVG */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded py-0.5 transition-transform active:scale-[0.99] shrink-0"
              aria-label="E.GUITAP — Retour à l'accueil"
            >
              {/* Responsive Logo height: 38px on small mobile, 44px on tablet, 50px on desktop */}
              <div className="block sm:hidden">
                <Logo variant="horizontal" theme="light" height={38} />
              </div>
              <div className="hidden sm:block lg:hidden">
                <Logo variant="horizontal" theme="light" height={44} />
              </div>
              <div className="hidden lg:block">
                <Logo variant="horizontal" theme="light" height={50} />
              </div>
            </button>

            {/* Zone 2: Navigation Links (Desktop & Large Screen) */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm font-semibold text-marine font-inter">
              {navItems.map((item) => {
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => handleNavClick(item.route)}
                    className={`relative py-1.5 whitespace-nowrap transition-colors duration-150 ${
                      isActive
                        ? 'text-marine font-bold'
                        : 'text-slate-text hover:text-marine'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 w-full h-[2.5px] bg-gold rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions (CTA Devis & Contact) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Desktop CTA Devis */}
              <button
                onClick={onOpenQuoteModal}
                className="hidden sm:inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-marine hover:bg-marine-dark border border-marine hover:border-gold rounded transition-all duration-200 shadow-sm whitespace-nowrap active:scale-[0.98] font-poppins"
              >
                <span>Demander un devis</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
              </button>

              {/* Mobile CTA (Compact) */}
              <button
                onClick={onOpenQuoteModal}
                className="sm:hidden inline-flex items-center px-3 py-2 text-[11px] font-bold tracking-wide uppercase text-white bg-marine rounded font-poppins whitespace-nowrap"
              >
                <span>Devis</span>
              </button>

              {/* Hamburger Button (Mobile / Tablet) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded text-marine hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-gold"
                aria-label={mobileMenuOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Full Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[60px] bottom-0 z-50 bg-white/98 backdrop-blur-lg flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 border-t border-slate-200">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gold font-poppins px-3">
                Navigation Principale
              </div>

              <div className="flex flex-col space-y-1">
                {navItems.map((item) => {
                  const isActive = currentRoute === item.route;
                  return (
                    <button
                      key={item.route}
                      onClick={() => handleNavClick(item.route)}
                      className={`flex items-center justify-between w-full px-4 py-3.5 rounded-lg text-left font-inter text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-marine text-white'
                          : 'text-marine hover:bg-ivory'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive ? (
                        <span className="w-2 h-2 rounded-full bg-gold" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-slate-text/50" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Quick Domain Shortcuts */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-text font-poppins px-3 mb-2">
                  Nos 4 Pôles d’Expertise
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-marine">
                  <button
                    onClick={() => handleNavClick('activities')}
                    className="p-2.5 rounded bg-ivory/70 hover:bg-ivory text-left truncate"
                  >
                    01. BTP & Travaux
                  </button>
                  <button
                    onClick={() => handleNavClick('activities')}
                    className="p-2.5 rounded bg-ivory/70 hover:bg-ivory text-left truncate"
                  >
                    02. Immobilier
                  </button>
                  <button
                    onClick={() => handleNavClick('activities')}
                    className="p-2.5 rounded bg-ivory/70 hover:bg-ivory text-left truncate"
                  >
                    03. Commerce Général
                  </button>
                  <button
                    onClick={() => handleNavClick('activities')}
                    className="p-2.5 rounded bg-ivory/70 hover:bg-ivory text-left truncate"
                  >
                    04. Import-Export
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Drawer Bottom Actions */}
            <div className="p-4 sm:p-6 bg-paper border-t border-slate-200 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-marine hover:bg-marine-dark text-white font-poppins text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm"
              >
                <span>Demander un devis officiel</span>
                <ArrowUpRight className="w-4 h-4 text-gold" />
              </button>

              <div className="flex items-center justify-center gap-4 pt-1 text-xs text-slate-text">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('contact');
                  }}
                  className="flex items-center gap-1.5 hover:text-marine"
                >
                  <Phone className="w-3.5 h-3.5 text-gold" />
                  <span>Contact Conakry</span>
                </button>
                <span>·</span>
                <a
                  href={`https://wa.me/${COMPANY_DATA.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gn-green font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp direct</span>
                </a>
              </div>

              <div className="text-center text-[11px] text-slate-text font-lora italic pt-1">
                « {COMPANY_DATA.signatures.primary} »
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
